import { corsHeaders } from '../_shared/cors.ts';
import { requireUser, adminClient, jsonResponse, errorResponse, HttpError } from '../_shared/supabase.ts';
import { calcDamage, pickRandomMove, resolveMoves, resolveMoveEffects, weatherChipDamage, isFainted, allFainted, firstAliveIndex, type Combatant } from '../_shared/battleEngine.ts';

const WEATHER_LABEL: Record<string, string> = {
  sandstorm: '🌪 Burza piaskowa', hail: '🌨 Grad', rain: '🌧 Deszcz', 'harsh-sun': '☀ Silne słońce',
};

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
      active_player_idx: number; active_bot_idx: number; turn: number;
      log: { turn: number; text: string }[]; gym_id?: string; encounter_id?: string; weather?: string | null;
    };
    // Runda w dzienniku walki = jedna akcja klienta (attack/switch/mega); turn
    // rosnie na koncu tej funkcji, wiec etykieta rundy to turn+1 (1-indexed dla gracza).
    const roundNumber = state.turn + 1;
    const log: { turn: number; text: string }[] = [];
    const pushLog = (text: string) => log.push({ turn: roundNumber, text });

    if (action.type === 'switch') {
      const idx = Number(action.to_index);
      if (!Number.isInteger(idx) || idx < 0 || idx >= state.player_team.length || isFainted(state.player_team[idx])) {
        throw new HttpError(400, 'Nieprawidłowy wybór zamiany');
      }
      state.active_player_idx = idx;
      pushLog(`Wracaj! Idź, ${state.player_team[idx].name}!`);
    } else if (action.type === 'mega') {
      const { data: inv } = await admin.from('inventory').select('quantity').eq('owner_id', user.id).eq('item_slug', 'mega-stone').maybeSingle();
      if (!inv || inv.quantity < 1) throw new HttpError(400, 'Brak Kamienia Mega Ewolucji w ekwipunku');
      await admin.from('inventory').update({ quantity: inv.quantity - 1 }).eq('owner_id', user.id).eq('item_slug', 'mega-stone');
      state.player_team[state.active_player_idx].mega_active = true;
      pushLog(`${state.player_team[state.active_player_idx].name} Mega Ewoluował! (+30% staty do końca walki)`);
    } else if (action.type === 'attack') {
      const player = state.player_team[state.active_player_idx];
      const bot = state.bot_team[state.active_bot_idx];
      const playerMoves = await resolveMoves(admin, player);
      const botMoves = await resolveMoves(admin, bot);
      const playerMove = playerMoves.find((m) => m.slug === action.move_slug) || playerMoves[0];
      const botMove = pickRandomMove(botMoves);
      const playerFirst = player.speed >= bot.speed;

      const applyAttack = (attacker: Combatant, defender: Combatant, move: typeof playerMove, attackerLabel: string, defenderLabel: string) => {
        const r = calcDamage(attacker, defender, move);
        if (r.missed) { pushLog(`${attackerLabel} użył ${move.name} — Atak spudłował!`); return; }
        defender.current_hp = Math.max(0, defender.current_hp - r.damage);
        let msg = `${attackerLabel} użył ${move.name} (-${r.damage} HP)`;
        if (r.effectiveness >= 2) msg += ' Bardzo skuteczne!';
        else if (r.effectiveness > 0 && r.effectiveness < 1) msg += ' Mało skuteczne...';
        else if (r.effectiveness === 0) msg += ' Brak efektu!';
        if (r.crit) msg += ' Trafienie krytyczne!';
        pushLog(msg);
        for (const line of resolveMoveEffects(attacker, defender, move, attackerLabel, defenderLabel)) pushLog(line);
      };

      if (playerFirst) {
        applyAttack(player, bot, playerMove, player.name, bot.name);
        if (!isFainted(bot)) applyAttack(bot, player, botMove, bot.name, player.name);
      } else {
        applyAttack(bot, player, botMove, bot.name, player.name);
        if (!isFainted(player)) applyAttack(player, bot, playerMove, player.name, bot.name);
      }

      if (isFainted(bot)) {
        pushLog(`Dzikie ${bot.name} zemdlało!`);
        const next = firstAliveIndex(state.bot_team);
        if (next !== -1) state.active_bot_idx = next;
      }
      if (isFainted(player)) pushLog(`${player.name} zemdlał!`);
    } else {
      throw new HttpError(400, 'Nieznany typ akcji');
    }

    // Pogoda (zalezna od biomu, ustawiona raz przy starcie walki) tyka co runde,
    // niezaleznie od typu akcji — dokladnie jak w oryginalnych grach.
    if (state.weather) {
      const bot = state.bot_team[state.active_bot_idx];
      const player = state.player_team[state.active_player_idx];
      const wLabel = WEATHER_LABEL[state.weather] || state.weather;
      const wDmgBot = weatherChipDamage(state.weather, bot);
      if (wDmgBot > 0) {
        bot.current_hp = Math.max(0, bot.current_hp - wDmgBot);
        pushLog(`${wLabel} szarpie ${bot.name}! (-${wDmgBot} HP)`);
        if (isFainted(bot)) {
          pushLog(`Dzikie ${bot.name} zemdlało!`);
          const next = firstAliveIndex(state.bot_team);
          if (next !== -1) state.active_bot_idx = next;
        }
      }
      const wDmgPlayer = weatherChipDamage(state.weather, player);
      if (wDmgPlayer > 0) {
        player.current_hp = Math.max(0, player.current_hp - wDmgPlayer);
        pushLog(`${wLabel} szarpie ${player.name}! (-${wDmgPlayer} HP)`);
        if (isFainted(player)) pushLog(`${player.name} zemdlał!`);
      }
    }

    state.turn += 1;
    state.log = [...(state.log || []), ...log];

    let result: 'win' | 'loss' | null = null;
    let mustSwitch = false;
    if (allFainted(state.bot_team)) result = 'win';
    else if (allFainted(state.player_team)) result = 'loss';
    else if (isFainted(state.player_team[state.active_player_idx])) mustSwitch = true;

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
      state, result, must_switch: mustSwitch, exp_gain: expGain, coin_gain: coinGain,
      mon_exp_gain: monExpGain, mon_level: rewardRow?.mon_level, mon_leveled_up: rewardRow?.mon_leveled_up,
      profile: rewardRow,
    });
  } catch (e) {
    return errorResponse(e);
  }
});
