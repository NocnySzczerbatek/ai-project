import { typeEffectiveness } from './typeChart.ts';

export interface Move { slug: string; name: string; power: number; type: string; category: string; accuracy: number; }
export interface Combatant {
  id?: string; species_id: number; name: string; level: number;
  current_hp: number; max_hp: number; attack: number; defense: number;
  special_attack: number; special_defense: number; speed: number;
  types: string[]; moves?: Move[]; mega_active?: boolean;
}

export const FALLBACK_MOVE: Move = { slug: 'tackle', name: 'Tackle', power: 40, type: 'normal', category: 'P', accuracy: 100 };

function effStat(c: Combatant, stat: 'attack'|'defense'|'special_attack'|'special_defense'|'speed') {
  return c.mega_active ? Math.floor(c[stat] * 1.3) : c[stat];
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
