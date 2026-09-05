import { corsHeaders } from '../_shared/cors.ts';
import { requireUser, adminClient, jsonResponse, errorResponse, HttpError } from '../_shared/supabase.ts';

// MODUL 3: Zero-Trust Catch Engine. Klient wysyla tylko intencje (encounter_id,
// ball_slug, use_razz_berry) — cala formula, RNG i noc/dzien liczy sie TUTAJ,
// po stronie serwera. Wynik jest atomowo aplikowany przez fn_resolve_catch
// (Postgres, service_role), wiec klient nigdy nie moze wymusic sukcesu.
const BALL_MULT: Record<string, number> = {
  'poke-ball': 1.0, 'great-ball': 1.5, 'ultra-ball': 2.0, 'dusk-ball': 1.0, 'master-ball': Infinity,
};

function isNight(): boolean {
  const h = new Date().getUTCHours();
  return h >= 20 || h < 6;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const user = await requireUser(req);
    const { encounter_id, ball_slug, use_razz_berry } = await req.json();
    if (!encounter_id || !ball_slug) throw new HttpError(400, 'Brak encounter_id lub ball_slug');

    const admin = adminClient();
    const { data: encounter, error: encErr } = await admin
      .from('encounters').select('*').eq('id', encounter_id).eq('player_id', user.id).maybeSingle();
    if (encErr) throw new HttpError(500, encErr.message);
    if (!encounter) throw new HttpError(404, 'Nieprawidłowy encounter');
    if (encounter.resolved) throw new HttpError(409, 'Ten encounter został już rozwiązany');
    if (new Date(encounter.expires_at).getTime() < Date.now()) throw new HttpError(410, 'Encounter wygasł');

    let ballMult = BALL_MULT[ball_slug];
    if (ballMult === undefined) throw new HttpError(400, 'Nieznany typ Poké Balla');
    if (ball_slug === 'dusk-ball') ballMult = isNight() ? 3.0 : 1.0;

    const { data: species } = await admin.from('pokemon_species').select('base_catch_rate')
      .eq('id', encounter.species_id).maybeSingle();
    const baseRate = species?.base_catch_rate ?? 45;

    let success: boolean;
    let chance = 100;
    if (ball_slug === 'master-ball') {
      success = true;
    } else {
      const berryMult = use_razz_berry ? 1.25 : 1.0;
      const hpFactor = (3 * encounter.max_hp - 2 * encounter.current_hp) / (3 * encounter.max_hp);
      chance = Math.min(100, Math.max(0, hpFactor * baseRate * ballMult * berryMult));
      success = Math.random() * 100 < chance;
    }

    const { data, error } = await admin.rpc('fn_resolve_catch', {
      p_encounter_id: encounter_id, p_player_id: user.id, p_ball_slug: ball_slug,
      p_used_berry: !!use_razz_berry, p_success: success,
    });
    if (error) throw new HttpError(400, error.message);
    const row = Array.isArray(data) ? data[0] : data;
    return jsonResponse({ ...row, chance: Math.round(chance) });
  } catch (e) {
    return errorResponse(e);
  }
});
