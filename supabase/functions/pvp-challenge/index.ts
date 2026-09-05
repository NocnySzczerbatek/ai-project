import { corsHeaders } from '../_shared/cors.ts';
import { requireUser, adminClient, jsonResponse, errorResponse, HttpError } from '../_shared/supabase.ts';
import { simulateFullBattle, type Combatant } from '../_shared/battleEngine.ts';

// MODUL 4: PvP. Prawdziwa rownoczesna gra turowa miedzy dwoma zywymi graczami
// wymagalaby warstwy Realtime/sesji na 2 klientow — poza zakresem tego etapu.
// Zamiast tego serwer NATYCHMIAST symuluje pelna walke obu druzyn (ten sam
// silnik co Boty/Sale) i atomowo rozlicza wynik. Przeciwnik dowiaduje sie o
// starciu przy nastepnym odswiezeniu profilu/logu transakcji.
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const user = await requireUser(req);
    const { opponent_id } = await req.json();
    if (!opponent_id) throw new HttpError(400, 'Brak opponent_id');
    if (opponent_id === user.id) throw new HttpError(400, 'Nie możesz wyzwać samego siebie');

    const admin = adminClient();
    const [{ data: myTeam }, { data: oppTeam }] = await Promise.all([
      admin.from('user_pokemon').select('*').eq('owner_id', user.id).not('party_slot', 'is', null).order('party_slot'),
      admin.from('user_pokemon').select('*').eq('owner_id', opponent_id).not('party_slot', 'is', null).order('party_slot'),
    ]);
    if (!myTeam || !myTeam.length) throw new HttpError(400, 'Twoja drużyna jest pusta');
    if (!oppTeam || !oppTeam.length) throw new HttpError(400, 'Przeciwnik nie ma aktywnej drużyny');

    const speciesIds = [...new Set([...myTeam, ...oppTeam].map((p: any) => p.species_id))];
    const { data: speciesRows } = await admin.from('pokemon_species').select('id,name,types').in('id', speciesIds);
    const speciesById = new Map((speciesRows || []).map((s: any) => [s.id, s]));

    const toCombatant = (p: any): Combatant => {
      const species = speciesById.get(p.species_id);
      return {
        id: p.id, species_id: p.species_id, name: p.nickname || species?.name || String(p.species_id), level: p.level,
        current_hp: p.current_hp, max_hp: p.max_hp, attack: p.attack, defense: p.defense,
        special_attack: p.special_attack, special_defense: p.special_defense, speed: p.speed,
        types: species?.types || ['normal'], moves: (p.moves && p.moves.length) ? p.moves : undefined,
      };
    };
    const teamA = myTeam.map(toCombatant);
    const teamB = oppTeam.map(toCombatant);

    const sim = await simulateFullBattle(admin, teamA, teamB);
    const winnerId = sim.winner === 'a' ? user.id : opponent_id;
    const loserId = sim.winner === 'a' ? opponent_id : user.id;

    const { data, error } = await admin.rpc('fn_resolve_pvp', {
      p_winner: winnerId, p_loser: loserId, p_battle_log: sim.log,
    });
    if (error) throw new HttpError(400, error.message);
    const row = Array.isArray(data) ? data[0] : data;

    return jsonResponse({ i_won: sim.winner === 'a', log: sim.log, ...row });
  } catch (e) {
    return errorResponse(e);
  }
});
