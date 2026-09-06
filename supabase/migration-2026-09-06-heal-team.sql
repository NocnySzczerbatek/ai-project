-- ============================================================
-- MIGRACJA PRZYROSTOWA (2026-09-06, część 2) — wklej TYLKO ten plik do Supabase
-- SQL Editor (po tym, jak migration-2026-09-06-battle-system.sql już przeszła).
-- Dodaje jedyną nową rzecz po stronie bazy potrzebną dla auto-battle: darmowe,
-- bez-limitowe leczenie drużyny (reszta zmian z brief'u "auto-battle" — pętla
-- walki, log, auto-switch — żyje wyłącznie w Edge Function battle-turn/TS,
-- nie w SQL).
-- ============================================================

create or replace function rpc_heal_team() returns void as $$
begin
  update user_pokemon set current_hp = max_hp where owner_id = auth.uid() and current_hp < max_hp;
end;
$$ language plpgsql security definer set search_path = public;
revoke all on function rpc_heal_team() from public;
grant execute on function rpc_heal_team() to authenticated;
