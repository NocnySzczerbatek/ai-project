import { typeEffectiveness } from './typeChart.ts';

export type Stat = 'attack'|'defense'|'special_attack'|'special_defense';
export interface Move { slug: string; name: string; power: number; type: string; category: string; accuracy: number; }
export interface Combatant {
  id?: string; species_id: number; name: string; level: number;
  current_hp: number; max_hp: number; attack: number; defense: number;
  special_attack: number; special_defense: number; speed: number;
  types: string[]; moves?: Move[]; mega_active?: boolean;
  ability?: string; stages?: Partial<Record<Stat, number>>;
}

export const FALLBACK_MOVE: Move = { slug: 'tackle', name: 'Tackle', power: 40, type: 'normal', category: 'P', accuracy: 100 };

// Mnoznik etapu staty (-6..+6), identyczny wzor co uzywany po stronie klienta w js/arena.js.
function stageMult(stage: number): number {
  const s = Math.max(-6, Math.min(6, stage));
  return s >= 0 ? (2 + s) / 2 : 2 / (2 - s);
}
function effStat(c: Combatant, stat: 'attack'|'defense'|'special_attack'|'special_defense'|'speed') {
  const stage = stat === 'speed' ? 0 : (c.stages?.[stat as Stat] || 0);
  const base = stage ? Math.floor(c[stat] * stageMult(stage)) : c[stat];
  return c.mega_active ? Math.floor(base * 1.3) : base;
}

// Zmienia etap staty (-6..+6) na obiekcie walczacego i zwraca opis "o X%" do logu
// (prawdziwy przelicznik ze stageMult, nie sztywna wartosc) — uzywane przez np. Growl/Bite.
export function applyStatStage(target: Combatant, stat: Stat, delta: number): { applied: number; pct: number } {
  if (!target.stages) target.stages = {};
  const before = target.stages[stat] || 0;
  const after = Math.max(-6, Math.min(6, before + delta));
  target.stages[stat] = after;
  const pct = Math.round((1 - stageMult(after) / stageMult(before)) * 100);
  return { applied: after - before, pct };
}

const STAT_LABEL_PL: Record<Stat, string> = { attack: 'Atak', defense: 'Obrona', special_attack: 'Sp. Atak', special_defense: 'Sp. Obrona' };

// Efekty dodatkowe ruchow (poza obrazeniami) — celowo maly, jawny katalog zamiast
// pelnego silnika statusow/pogody: Growl (gwarantowane -1 Atak celu) i Bite (10%
// szans na -1 Obrona celu), blokowane przez Shield Dust — dokladnie przyklady z prosby.
export function resolveMoveEffects(attacker: Combatant, defender: Combatant, move: Move, attackerLabel: string, defenderLabel: string): string[] {
  const lines: string[] = [];
  if (move.slug === 'growl') {
    const r = applyStatStage(defender, 'attack', -1);
    if (r.applied !== 0) lines.push(`${attackerLabel} użył Growl! ${STAT_LABEL_PL.attack} ${defenderLabel} spadł o ${Math.abs(r.pct)}%!`);
  } else if (move.slug === 'bite' && Math.random() < 0.1) {
    if (defender.ability === 'shield-dust') {
      lines.push(`Zdolność Shield Dust (${defenderLabel}) zablokowała dodatkowy efekt ataku!`);
    } else {
      const r = applyStatStage(defender, 'defense', -1);
      if (r.applied !== 0) lines.push(`${attackerLabel} przestraszył ${defenderLabel} atakiem Bite! ${STAT_LABEL_PL.defense} spadła o ${Math.abs(r.pct)}%!`);
    }
  }
  return lines;
}

// Uzupelnia ruchy Pokemona bez wlasnego movepoolu (np. dopiero co zlapane) — do
// czasu pelnej bazy ruchow (ETAP 5) korzysta z niewielkiego move_catalog wg typu.
export async function resolveMoves(admin: any, mon: Combatant): Promise<Move[]> {
  if (mon.moves && mon.moves.length) return mon.moves;
  const { data } = await admin.from('move_catalog').select('*').in('type', mon.types).limit(4);
  if (data && data.length) {
    return data.map((m: any) => ({ slug: m.slug, name: m.name, power: m.power, type: m.type, category: m.category, accuracy: m.accuracy }));
  }
  return [FALLBACK_MOVE];
}

export function pickRandomMove(moves: Move[]): Move {
  return moves[Math.floor(Math.random() * moves.length)] || FALLBACK_MOVE;
}

export function calcDamage(attacker: Combatant, defender: Combatant, move: Move) {
  if (move.power === 0) return { damage: 0, effectiveness: 1, crit: false, missed: false };
  if (Math.random() * 100 >= move.accuracy) return { damage: 0, effectiveness: 1, crit: false, missed: true };
  const atk = move.category === 'P' ? effStat(attacker, 'attack') : effStat(attacker, 'special_attack');
  const def = move.category === 'P' ? effStat(defender, 'defense') : effStat(defender, 'special_defense');
  let dmg = ((2 * attacker.level / 5 + 2) * move.power * atk / Math.max(1, def)) / 50 + 2;
  if (attacker.types.includes(move.type)) dmg *= 1.5; // STAB
  const eff = typeEffectiveness(move.type, defender.types);
  dmg *= eff;
  const crit = Math.random() < 0.0625;
  if (crit) dmg *= 1.5;
  dmg *= 0.85 + Math.random() * 0.15;
  return { damage: eff === 0 ? 0 : Math.max(1, Math.floor(dmg)), effectiveness: eff, crit, missed: false };
}

// Obrazenia pogody (np. burza piaskowa) — zwraca 0 dla typow odpornych/immunnych.
export function weatherChipDamage(weather: string | null | undefined, c: Combatant): number {
  if (!weather || isFainted(c)) return 0;
  const types = Array.isArray(c.types) ? c.types : [];
  if (weather === 'sandstorm' && !types.some((t) => ['rock', 'ground', 'steel'].includes(t))) {
    return Math.max(1, Math.floor(c.max_hp / 16));
  }
  if (weather === 'hail' && !types.includes('ice')) {
    return Math.max(1, Math.floor(c.max_hp / 16));
  }
  return 0;
}

export function isFainted(c: Combatant) { return c.current_hp <= 0; }
export function firstAliveIndex(team: Combatant[]) { return team.findIndex((c) => !isFainted(c)); }
export function allFainted(team: Combatant[]) { return team.every(isFainted); }

// Pelna automatyczna symulacja (uzywana przez PvP — obie strony graja "AI").
// Zwraca zwyciezce ('a'|'b') i log walki. Ograniczenie tur chroni przed petla.
export async function simulateFullBattle(admin: any, teamA: Combatant[], teamB: Combatant[]) {
  const log: string[] = [];
  const movesA = await Promise.all(teamA.map((c) => resolveMoves(admin, c)));
  const movesB = await Promise.all(teamB.map((c) => resolveMoves(admin, c)));
  let idxA = firstAliveIndex(teamA);
  let idxB = firstAliveIndex(teamB);
  let turn = 0;
  while (turn < 100 && idxA !== -1 && idxB !== -1) {
    const a = teamA[idxA], b = teamB[idxB];
    const moveA = pickRandomMove(movesA[idxA]);
    const moveB = pickRandomMove(movesB[idxB]);
    const order = a.speed >= b.speed ? ['a', 'b'] : ['b', 'a'];
    for (const side of order) {
      if (isFainted(a) || isFainted(b)) break;
      if (side === 'a') {
        const r = calcDamage(a, b, moveA);
        b.current_hp = Math.max(0, b.current_hp - r.damage);
        log.push(`${a.name} użył ${moveA.name} (-${r.damage} HP)`);
      } else {
        const r = calcDamage(b, a, moveB);
        a.current_hp = Math.max(0, a.current_hp - r.damage);
        log.push(`${b.name} użył ${moveB.name} (-${r.damage} HP)`);
      }
    }
    if (isFainted(a)) idxA = firstAliveIndex(teamA);
    if (isFainted(b)) idxB = firstAliveIndex(teamB);
    turn++;
  }
  let winner: 'a' | 'b';
  if (idxA === -1 && idxB === -1) {
    const hpPctA = teamA.reduce((s, c) => s + c.current_hp / c.max_hp, 0);
    const hpPctB = teamB.reduce((s, c) => s + c.current_hp / c.max_hp, 0);
    winner = hpPctA >= hpPctB ? 'a' : 'b';
  } else {
    winner = idxA === -1 ? 'b' : 'a';
  }
  return { winner, log, turns: turn };
}

const WEATHER_LABEL: Record<string, string> = {
  sandstorm: '🌪 Burza piaskowa', hail: '🌨 Grad', rain: '🌧 Deszcz', 'harsh-sun': '☀ Silne słońce',
};

// Auto-battle (Boty/Sale/Dzikie): rozstrzyga CALA walke w jednym wywolaniu —
// gracz nie wybiera ruchow/zamian (brief "auto-battle" 2026-09-06). Silnik sam
// dobiera ruch obu stron (jak PvP) i automatycznie wystawia kolejnego zdrowego
// Pokemona po zemdleniu, az do konca walki. W odroznieniu od simulateFullBattle
// (2 "surowe" druzyny PvP): tu jest 1 pogoda + log {turn,text} identyczny jak
// dawny per-turn silnik, zeby UI (round log) dzialalo bez zmian.
export async function autoResolveBattle(admin: any, state: {
  player_team: Combatant[]; bot_team: Combatant[];
  active_player_idx: number; active_bot_idx: number; turn: number;
  log: { turn: number; text: string }[]; weather?: string | null;
}): Promise<{ result: 'win' | 'loss' }> {
  const movesCache = new Map<Combatant, Move[]>();
  const movesFor = async (c: Combatant) => {
    if (!movesCache.has(c)) movesCache.set(c, await resolveMoves(admin, c));
    return movesCache.get(c)!;
  };

  let rounds = 0;
  while (rounds < 200 && !allFainted(state.player_team) && !allFainted(state.bot_team)) {
    rounds++;
    const roundNumber = state.turn + 1;
    const pushLog = (text: string) => state.log.push({ turn: roundNumber, text });

    const player = state.player_team[state.active_player_idx];
    const bot = state.bot_team[state.active_bot_idx];
    const playerMove = pickRandomMove(await movesFor(player));
    const botMove = pickRandomMove(await movesFor(bot));
    const playerFirst = player.speed >= bot.speed;

    const applyAttack = (attacker: Combatant, defender: Combatant, move: Move, attackerLabel: string, defenderLabel: string) => {
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
      pushLog(`${bot.name} zemdlało!`);
      const next = firstAliveIndex(state.bot_team);
      if (next !== -1) state.active_bot_idx = next;
    }
    if (isFainted(player)) {
      pushLog(`${player.name} zemdlał!`);
      const next = firstAliveIndex(state.player_team);
      if (next !== -1) state.active_player_idx = next;
    }

    if (state.weather && !allFainted(state.player_team) && !allFainted(state.bot_team)) {
      const wLabel = WEATHER_LABEL[state.weather] || state.weather;
      const curBot = state.bot_team[state.active_bot_idx];
      const curPlayer = state.player_team[state.active_player_idx];
      const wDmgBot = weatherChipDamage(state.weather, curBot);
      if (wDmgBot > 0) {
        curBot.current_hp = Math.max(0, curBot.current_hp - wDmgBot);
        pushLog(`${wLabel} szarpie ${curBot.name}! (-${wDmgBot} HP)`);
        if (isFainted(curBot)) {
          pushLog(`${curBot.name} zemdlało!`);
          const next = firstAliveIndex(state.bot_team);
          if (next !== -1) state.active_bot_idx = next;
        }
      }
      const wDmgPlayer = weatherChipDamage(state.weather, curPlayer);
      if (wDmgPlayer > 0) {
        curPlayer.current_hp = Math.max(0, curPlayer.current_hp - wDmgPlayer);
        pushLog(`${wLabel} szarpie ${curPlayer.name}! (-${wDmgPlayer} HP)`);
        if (isFainted(curPlayer)) {
          pushLog(`${curPlayer.name} zemdlał!`);
          const next = firstAliveIndex(state.player_team);
          if (next !== -1) state.active_player_idx = next;
        }
      }
    }

    state.turn += 1;
  }

  let result: 'win' | 'loss';
  if (allFainted(state.bot_team)) result = 'win';
  else if (allFainted(state.player_team)) result = 'loss';
  else {
    // Limit rund bez KO (skrajnie rzadkie) — rozstrzygamy po sumie % HP.
    const hpPctPlayer = state.player_team.reduce((s, c) => s + c.current_hp / c.max_hp, 0);
    const hpPctBot = state.bot_team.reduce((s, c) => s + c.current_hp / c.max_hp, 0);
    result = hpPctPlayer >= hpPctBot ? 'win' : 'loss';
  }
  return { result };
}
