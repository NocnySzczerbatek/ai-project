import { corsHeaders } from '../_shared/cors.ts';
import { requireUser, adminClient, jsonResponse, errorResponse, HttpError } from '../_shared/supabase.ts';
import { autoResolveBattle, type Combatant } from '../_shared/battleEngine.ts';

// MODUL 4 (auto-battle): Silnik walki (Boty NPC + Sale + Dzikie) rozstrzyga
// CALA walke automatycznie w jednym wywolaniu — gracz nie wybiera ruchow/zamian
// (brief "auto-battle" 2026-09-06, sekcja 1). Stan koncowy zapisuje
// fn_apply_battle_state (service_role, atomowo).
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const user = await requireUser(req);
    const { battle_id } = await req.json();
    if (!battle_id) throw new HttpError(400, 'Brak battle_id');

    const admin = adminClient();
    const { data: battle, error: bErr } = await admin.from('battles').select('*')
      .eq('id', battle_id).eq('player_id', user.id).maybeSingle();
    if (bErr) throw new HttpError(500, bErr.message);
    if (!battle) throw new HttpError(404, 'Nieprawidłowa walka');
    if (battle.result) throw new HttpError(409, 'Ta walka jest już zakończona');

    const state = battle.state as {
      player_team: Combatant[]; bot_team: Combatant[];
      active_player_idx: number; active_bot_idx: number; turn: number;
      log: { turn: number; text: string }[]; gym_id?: string; encounter_id?: string; weather?: string | null;
    };
    if (!Array.isArray(state.log)) state.log = [];

    const { result } = await autoResolveBattle(admin, state);

    let expGain = 0, coinGain = 0, monExpGain = 0;
    if (result === 'win') {
      const totalLevels = state.bot_team.reduce((s, c) => s + c.level, 0);
      expGain = totalLevels * 8;
      coinGain = totalLevels * 15;
      monExpGain = totalLevels * 4; // EXP dla konkretnego Pokemona — osobno od EXP Trenera (postaci)
    }

    const { data, error } = await admin.rpc('fn_apply_battle_state', {
      p_battle_id: battle_id, p_player_id: user.id, p_state: state,
      p_result: result, p_exp_gain: expGain, p_coin_gain: coinGain, p_mon_exp_gain: monExpGain,
    });
    if (error) throw new HttpError(400, error.message);
    const rewardRow = Array.isArray(data) ? data[0] : data;

    return jsonResponse({
      state, result, exp_gain: expGain, coin_gain: coinGain,
      mon_exp_gain: monExpGain, mon_level: rewardRow?.mon_level, mon_leveled_up: rewardRow?.mon_leveled_up,
      profile: rewardRow,
    });
  } catch (e) {
    return errorResponse(e);
  }
});
