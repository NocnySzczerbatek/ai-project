import { corsHeaders } from '../_shared/cors.ts';
import { requireUser, adminClient, jsonResponse, errorResponse, HttpError } from '../_shared/supabase.ts';
import { calcDamage, pickRandomMove, resolveMoves, isFainted, allFainted, firstAliveIndex, type Combatant } from '../_shared/battleEngine.ts';

// MODUL 4: Silnik walki (Boty NPC + Sale). Klient wysyla tylko akcje (attack/
// switch/mega) — kolejnosc, obrazenia, KO i nagrody licza sie WYLACZNIE tutaj.
// Stan po turze zapisuje fn_apply_battle_state (service_role, atomowo).
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const user = await requireUser(req);
    const { battle_id, action } = await req.json();
    if (!battle_id || !action) throw new HttpError(400, 'Brak battle_id lub action');

    const admin = adminClient();
    const { data: battle, error: bErr } = await admin.from('battles').select('*')
      .eq('id', battle_id).eq('player_id', user.id).maybeSingle();
    if (bErr) throw new HttpError(500, bErr.message);
    if (!battle) throw new HttpError(404, 'Nieprawidłowa walka');
    if (battle.result) throw new HttpError(409, 'Ta walka jest już zakończona');

    const state = battle.state as {
      player_team: Combatant[]; bot_team: Combatant[];
      active_player_idx: number; active_bot_idx: number; turn: number; log: string[]; gym_id?: string;
    };
    const log: string[] = [];

    if (action.type === 'switch') {
      const idx = Number(action.to_index);
      if (!Number.isInteger(idx) || idx < 0 || idx >= state.player_team.length || isFainted(state.player_team[idx])) {
        throw new HttpError(400, 'Nieprawidłowy wybór zamiany');
      }
      state.active_player_idx = idx;
      log.push(`Wracaj! Idź, ${state.player_team[idx].name}!`);
    } else if (action.type === 'mega') {
      const { data: inv } = await admin.from('inventory').select('quantity').eq('owner_id', user.id).eq('item_slug', 'mega-stone').maybeSingle();
      if (!inv || inv.quantity < 1) throw new HttpError(400, 'Brak Kamienia Mega Ewolucji w ekwipunku');
      await admin.from('inventory').update({ quantity: inv.quantity - 1 }).eq('owner_id', user.id).eq('item_slug', 'mega-stone');
      state.player_team[state.active_player_idx].mega_active = true;
      log.push(`${state.player_team[state.active_player_idx].name} Mega Ewoluował! (+30% staty do końca walki)`);
    } else if (action.type === 'attack') {
      const player = state.player_team[state.active_player_idx];
      const bot = state.bot_team[state.active_bot_idx];
      const playerMoves = await resolveMoves(admin, player);
      const botMoves = await resolveMoves(admin, bot);
      const playerMove = playerMoves.find((m) => m.slug === action.move_slug) || playerMoves[0];
      const botMove = pickRandomMove(botMoves);
      const playerFirst = player.speed >= bot.speed;

      const applyAttack = (attacker: Combatant, defender: Combatant, move: typeof playerMove, attackerLabel: string) => {
        const r = calcDamage(attacker, defender, move);
        if (r.missed) { log.push(`${attackerLabel} użył ${move.name} — Atak spudłował!`); return; }
        defender.current_hp = Math.max(0, defender.current_hp - r.damage);
        let msg = `${attackerLabel} użył ${move.name} (-${r.damage} HP)`;
        if (r.effectiveness >= 2) msg += ' Bardzo skuteczne!';
        else if (r.effectiveness > 0 && r.effectiveness < 1) msg += ' Mało skuteczne...';
        else if (r.effectiveness === 0) msg += ' Brak efektu!';
        if (r.crit) msg += ' Trafienie krytyczne!';
        log.push(msg);
      };

      if (playerFirst) {
        applyAttack(player, bot, playerMove, player.name);
        if (!isFainted(bot)) applyAttack(bot, player, botMove, bot.name);
      } else {
        applyAttack(bot, player, botMove, bot.name);
        if (!isFainted(player)) applyAttack(player, bot, playerMove, player.name);
      }

      if (isFainted(bot)) {
        log.push(`Dzikie ${bot.name} zemdlało!`);
        const next = firstAliveIndex(state.bot_team);
        if (next !== -1) state.active_bot_idx = next;
      }
      if (isFainted(player)) log.push(`${player.name} zemdlał!`);
    } else {
      throw new HttpError(400, 'Nieznany typ akcji');
    }

    state.turn += 1;
    state.log = [...(state.log || []), ...log];

    let result: 'win' | 'loss' | null = null;
    let mustSwitch = false;
    if (allFainted(state.bot_team)) result = 'win';
    else if (allFainted(state.player_team)) result = 'loss';
    else if (isFainted(state.player_team[state.active_player_idx])) mustSwitch = true;

    let expGain = 0, coinGain = 0;
    if (result === 'win') {
      const totalLevels = state.bot_team.reduce((s, c) => s + c.level, 0);
      expGain = totalLevels * 8;
      coinGain = totalLevels * 15;
    }

    const { data, error } = await admin.rpc('fn_apply_battle_state', {
      p_battle_id: battle_id, p_player_id: user.id, p_state: state,
      p_result: result, p_exp_gain: expGain, p_coin_gain: coinGain,
    });
    if (error) throw new HttpError(400, error.message);
    const rewardRow = Array.isArray(data) ? data[0] : data;

    return jsonResponse({ state, result, must_switch: mustSwitch, exp_gain: expGain, coin_gain: coinGain, profile: rewardRow });
  } catch (e) {
    return errorResponse(e);
  }
});
