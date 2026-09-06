-- ============================================================
-- MIGRACJA PRZYROSTOWA (2026-09-06, część 3) — wklej TYLKO ten plik do Supabase
-- SQL Editor. Sygnatura fn_grant_pokemon_exp bez zmian (create or replace
-- wystarczy, bez drop function).
--
-- Bug znaleziony przy audycie ekonomii (brief sekcja 2): trg_pokemon_level_cap
-- (poziom Pokemona <= Trainer Level + 5) istnieje od poczatku, ale
-- fn_grant_pokemon_exp o nim nie wiedzial — Pokemon juz na limicie, ktory
-- zdobyl dosc EXP na kolejny poziom, wywalal UPDATE ponizej wyjatkiem z
-- triggera i psul CALA nagrode z wygranej walki (fn_apply_battle_state
-- wywoluje ta funkcje w tej samej transakcji). Fix: petla level-up zatrzymuje
-- sie tez na (trainer_level + 5), tak jak juz robi to rpc_explore_step przy
-- losowaniu poziomu dzikich Pokemonow.
-- ============================================================

create or replace function fn_grant_pokemon_exp(p_pokemon_id uuid, p_amount int)
returns table(new_level int, leveled_up boolean) as $$
declare v_mon user_pokemon%rowtype; v_required bigint; v_start_level int; v_cap int;
begin
  if p_amount <= 0 or p_pokemon_id is null then
    return query select level, false from user_pokemon where id = p_pokemon_id;
    return;
  end if;
  select * into v_mon from user_pokemon where id = p_pokemon_id for update;
  if not found then return; end if;
  select trainer_level + 5 into v_cap from profiles where id = v_mon.owner_id;
  v_cap := coalesce(v_cap, 100);
  v_start_level := v_mon.level;
  v_mon.experience := v_mon.experience + p_amount;
  v_required := fn_exp_required(v_mon.level);
  while v_mon.experience >= v_required and v_mon.level < 100 and v_mon.level < v_cap loop
    v_mon.experience := v_mon.experience - v_required;
    v_mon.level := v_mon.level + 1;
    v_required := fn_exp_required(v_mon.level);
  end loop;
  update user_pokemon set experience = v_mon.experience, level = v_mon.level where id = p_pokemon_id;
  return query select v_mon.level, v_mon.level > v_start_level;
end;
$$ language plpgsql security definer set search_path = public;
revoke all on function fn_grant_pokemon_exp(uuid,int) from public;
