-- ============================================================
-- MIGRACJA PRZYROSTOWA (2026-09-06, część 4) — wklej TYLKO ten plik do Supabase
-- SQL Editor. Nowa funkcja, sygnatura nie istniała wcześniej — zwykły
-- create or replace wystarczy.
--
-- Brief sekcja 3: sprzedaż złapanych Pokémonów Kupcowi za niewielką kwotę
-- (dodatkowe, poboczne źródło dochodu — nie konkuruje z nagrodami z walk).
-- ============================================================

create or replace function rpc_sell_pokemon(p_pokemon_id uuid)
returns table(coins_gained int, catch_coins bigint) as $$
declare v_mon user_pokemon%rowtype; v_species pokemon_species%rowtype; v_price int; v_count int;
begin
  select * into v_mon from user_pokemon where id = p_pokemon_id and owner_id = auth.uid() for update;
  if not found then raise exception 'Nie jestes wlascicielem tego Pokemona'; end if;

  select count(*) into v_count from user_pokemon where owner_id = auth.uid();
  if v_count <= 1 then raise exception 'Nie mozesz sprzedac ostatniego Pokemona'; end if;

  select * into v_species from pokemon_species where id = v_mon.species_id;
  v_price := greatest(5, floor(v_mon.level * 1.5 + (255 - coalesce(v_species.base_catch_rate,45)) * 0.15)::int);

  delete from user_pokemon where id = p_pokemon_id;

  update profiles set catch_coins = profiles.catch_coins + v_price where id = auth.uid();
  insert into transaction_logs(profile_id,kind,delta,balance_after,reason,meta)
    values (auth.uid(),'coins',v_price,(select pr.catch_coins from profiles pr where pr.id=auth.uid()),'pokemon_sold',jsonb_build_object('species_id',v_mon.species_id,'level',v_mon.level));

  return query select v_price, profiles.catch_coins from profiles where id = auth.uid();
end;
$$ language plpgsql security definer set search_path = public;
revoke all on function rpc_sell_pokemon(uuid) from public;
grant execute on function rpc_sell_pokemon(uuid) to authenticated;
