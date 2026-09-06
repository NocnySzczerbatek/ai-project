-- ============================================================
-- MIGRACJA PRZYROSTOWA (2026-09-06, część 5) — wklej TYLKO ten plik do Supabase
-- SQL Editor. Nowa funkcja, sygnatura nie istniala wczesniej — zwykly
-- create or replace wystarczy.
--
-- Brief sekcja 6: wybor regionu startowego (jednorazowy). Tylko 'kanto' jest
-- dozwolony na razie — reszta regionow czeka na dane (brief sekcja 9).
-- ============================================================

create or replace function rpc_set_starter_region(p_region text) returns void as $$
begin
  if p_region <> 'kanto' then
    raise exception 'Region % nie jest jeszcze dostepny', p_region;
  end if;
  update profiles set starter_region = p_region where id = auth.uid() and starter_region is null;
  if not found then raise exception 'Region zostal juz wybrany albo brak profilu gracza'; end if;
end;
$$ language plpgsql security definer set search_path = public;
revoke all on function rpc_set_starter_region(text) from public;
grant execute on function rpc_set_starter_region(text) to authenticated;
