import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from './cors.ts';

// SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY sa wstrzykiwane
// automatycznie do kazdej Edge Function przez Supabase — nie trzeba ich konfigurowac recznie.
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}

// Respektuje RLS — sluzy WYLACZNIE do potwierdzenia tozsamosci wywolujacego.
export function userClient(authHeader: string) {
  return createClient(SUPABASE_URL, ANON_KEY, { global: { headers: { Authorization: authHeader } } });
}

// Omija RLS. Uzywac tylko PO recznym zweryfikowaniu tozsamosci przez requireUser().
// Klucz service_role nigdy nie moze trafic do kodu wysylanego do przegladarki.
export function adminClient() {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
}

export async function requireUser(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) throw new HttpError(401, 'Brak nagłówka Authorization');
  const { data, error } = await userClient(authHeader).auth.getUser();
  if (error || !data.user) throw new HttpError(401, 'Nieprawidłowa sesja');
  return data.user;
}

export function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

export function errorResponse(e: unknown) {
  const status = e instanceof HttpError ? e.status : 400;
  const message = e instanceof Error ? e.message : 'Nieznany błąd';
  console.error(message);
  return jsonResponse({ error: message }, status);
}
