-- ============================================================
-- MIGRACJA PRZYROSTOWA (2026-09-06) — wklej TYLKO ten plik do Supabase SQL Editor.
-- NIE wklejaj calego schema.sql ponownie — Twoje tabele juz istnieja
-- (create table bez "if not exists" wywala sie na "relation already exists"
-- i przerywa caly skrypt, wiec zadna z ponizszych zmian nigdy sie nie wykonala).
-- Wszystko tutaj jest idempotentne (create or replace / add column if not
-- exists / on conflict) — bezpieczne do uruchomienia, rowniez wielokrotnego.
-- ============================================================

-- Zdolnosc (Ability) do wyswietlenia na karcie stworka w walce — realne,
-- kanoniczne zdolnosci startowe z gier Pokemon (jedna na gatunek, bez ukrytych/altow).
alter table pokemon_species add column if not exists ability text;
update pokemon_species set ability = v.ability from (values
  (1,'overgrow'), (4,'blaze'), (7,'torrent'),
  (16,'keen-eye'), (19,'run-away'), (10,'shield-dust'), (13,'shield-dust'),
  (43,'chlorophyll'), (41,'inner-focus'), (74,'rock-head'), (95,'rock-head'),
  (54,'damp'), (60,'water-absorb'), (81,'magnet-pull'), (100,'soundproof'),
  (58,'intimidate'), (37,'flash-fire'), (27,'sand-veil'), (50,'sand-veil'),
  (63,'synchronize'), (92,'levitate'), (66,'guts'), (86,'thick-fat'),
  (124,'oblivious'), (23,'intimidate'), (88,'stench'), (147,'shed-skin'), (21,'keen-eye')
) as v(id, ability) where pokemon_species.id = v.id and pokemon_species.ability is null;

-- ---------------- rpc_explore_step: dodano znajdowanie itemow (Modul 2) ----------------
-- Zwracane kolumny sie zmienily (doszly found_item_slug/found_item_qty) — Postgres
-- nie pozwala podmienic RETURNS TABLE bez wczesniejszego DROP.
drop function if exists rpc_explore_step(text);
create or replace function rpc_explore_step(p_biome text)
returns table(
  energy int, event_type text, encounter_id uuid, species_id int, level int,
  opponent_id uuid, opponent_name text, found_item_slug text, found_item_qty int
) as $$
declare
  v_profile profiles%rowtype;
  v_regen   record;
  v_cost    int;
  v_roll    numeric;
  v_species pokemon_species%rowtype;
  v_lvl     int;
  v_hp      int;
  v_iv      int;
  v_enc_id  uuid;
  v_opponent record;
  v_item_qty int;
  v_item_balance int;
begin
  select * into v_profile from profiles where id = auth.uid() for update;
  if not found then raise exception 'Brak profilu gracza'; end if;

  select * into v_regen from fn_regen_energy(v_profile.energy, v_profile.last_energy_tick);
  v_profile.energy := v_regen.new_energy;
  v_profile.last_energy_tick := v_regen.new_tick;

  v_cost := 2 + floor(random() * 4)::int; -- 2-5
  if v_profile.energy < v_cost then
    update profiles set energy = v_profile.energy, last_energy_tick = v_profile.last_energy_tick where id = auth.uid();
    raise exception 'Za malo energii (masz %, potrzeba %)', v_profile.energy, v_cost;
  end if;
  v_profile.energy := v_profile.energy - v_cost;
  update profiles set energy = v_profile.energy, last_energy_tick = v_profile.last_energy_tick where id = auth.uid();

  insert into transaction_logs(profile_id, kind, delta, balance_after, reason)
    values (auth.uid(), 'energy', -v_cost, v_profile.energy, 'exploration_step');

  insert into player_presence(profile_id, biome, last_seen) values (auth.uid(), p_biome, now())
    on conflict (profile_id) do update set biome = excluded.biome, last_seen = now();

  v_roll := random();
  v_iv := floor(random() * 32)::int;

  if v_roll < 0.12 then -- 12%: PvP, jesli ktos inny jest aktywny w tym biomie (5 min)
    select pp.profile_id, pr.trainer_name into v_opponent
      from player_presence pp join profiles pr on pr.id = pp.profile_id
      where pp.biome = p_biome and pp.profile_id <> auth.uid() and pp.last_seen > now() - interval '5 minutes'
      order by random() limit 1;
    if found then
      return query select v_profile.energy, 'pvp'::text, null::uuid, null::int, null::int, v_opponent.profile_id, v_opponent.trainer_name, null::text, null::int;
    else
      return query select v_profile.energy, 'none'::text, null::uuid, null::int, null::int, null::uuid, null::text, null::text, null::int;
    end if;
    return;
  elsif v_roll < 0.30 then -- 18%: Trener-Bot (roster generuje osobny endpoint)
    return query select v_profile.energy, 'bot'::text, null::uuid, null::int, null::int, null::uuid, null::text, null::text, null::int;
    return;
  elsif v_roll < 0.82 then -- 52%: dziki Pokemon
    select * into v_species from pokemon_species where primary_biome = p_biome order by random() limit 1;
    if not found then select * into v_species from pokemon_species order by random() limit 1; end if;
    v_lvl := greatest(1, least(v_profile.trainer_level + 5, v_profile.trainer_level + (floor(random() * 5)::int - 2)));
    v_hp := fn_calc_stat((v_species.base_stats->>'hp')::int, v_iv, 0, v_lvl, true);

    insert into encounters(player_id, species_id, level, current_hp, max_hp, biome,
      attack, defense, special_attack, special_defense, speed)
    values (auth.uid(), v_species.id, v_lvl, v_hp, v_hp, p_biome,
      fn_calc_stat((v_species.base_stats->>'attack')::int, v_iv, 0, v_lvl, false),
      fn_calc_stat((v_species.base_stats->>'defense')::int, v_iv, 0, v_lvl, false),
      fn_calc_stat((v_species.base_stats->>'special_attack')::int, v_iv, 0, v_lvl, false),
      fn_calc_stat((v_species.base_stats->>'special_defense')::int, v_iv, 0, v_lvl, false),
      fn_calc_stat((v_species.base_stats->>'speed')::int, v_iv, 0, v_lvl, false)
    ) returning id into v_enc_id;

    return query select v_profile.energy, 'wild'::text, v_enc_id, v_species.id, v_lvl, null::uuid, null::text, null::text, null::int;
    return;
  elsif v_roll < 0.92 then -- 10%: znaleziono paczke Pokeballi (1-6 szt., atomowo do ekwipunku)
    v_item_qty := 1 + floor(random() * 6)::int;
    insert into inventory(owner_id, item_slug, quantity) values (auth.uid(), 'poke-ball', v_item_qty)
      on conflict (owner_id, item_slug) do update set quantity = inventory.quantity + excluded.quantity
      returning quantity into v_item_balance;

    insert into transaction_logs(profile_id, kind, delta, balance_after, reason, meta)
      values (auth.uid(), 'item', v_item_qty, v_item_balance, 'exploration_item_find', jsonb_build_object('item_slug','poke-ball','qty',v_item_qty));

    return query select v_profile.energy, 'item'::text, null::uuid, null::int, null::int, null::uuid, null::text, 'poke-ball'::text, v_item_qty;
    return;
  else -- 8%: spokojny krok, nic sie nie dzieje
    return query select v_profile.energy, 'none'::text, null::uuid, null::int, null::int, null::uuid, null::text, null::text, null::int;
  end if;
end;
$$ language plpgsql security definer set search_path = public;
revoke all on function rpc_explore_step(text) from public;
grant execute on function rpc_explore_step(text) to authenticated;

-- ---------------- rpc_create_bot_battle: dodano types+ability+weather ----------------
create or replace function rpc_create_bot_battle(p_biome text)
returns table(battle_id uuid, state jsonb) as $$
declare
  v_profile profiles%rowtype;
  v_party jsonb;
  v_bot jsonb := '[]'::jsonb;
  v_count int; v_i int;
  v_species pokemon_species%rowtype;
  v_lvl int;
  v_battle_id uuid;
begin
  select * into v_profile from profiles where id = auth.uid();
  if not found then raise exception 'Brak profilu gracza'; end if;

  select coalesce(jsonb_agg((to_jsonb(up) || jsonb_build_object('types', ps.types)) order by up.party_slot), '[]'::jsonb) into v_party
    from user_pokemon up join pokemon_species ps on ps.id = up.species_id
    where up.owner_id = auth.uid() and up.party_slot is not null;
  if v_party = '[]'::jsonb then raise exception 'Twoja druzyna jest pusta — dodaj Pokemona do druzyny'; end if;

  v_count := 2 + floor(random() * 3)::int; -- 2-4
  for v_i in 1..v_count loop
    select * into v_species from pokemon_species where primary_biome = p_biome order by random() limit 1;
    if not found then select * into v_species from pokemon_species order by random() limit 1; end if;
    v_lvl := greatest(1, v_profile.trainer_level + (floor(random() * 5)::int - 2));
    v_bot := v_bot || jsonb_build_object(
      'species_id', v_species.id, 'name', v_species.name, 'level', v_lvl,
      'current_hp', fn_calc_stat((v_species.base_stats->>'hp')::int,20,0,v_lvl,true),
      'max_hp', fn_calc_stat((v_species.base_stats->>'hp')::int,20,0,v_lvl,true),
      'attack', fn_calc_stat((v_species.base_stats->>'attack')::int,20,0,v_lvl,false),
      'defense', fn_calc_stat((v_species.base_stats->>'defense')::int,20,0,v_lvl,false),
      'special_attack', fn_calc_stat((v_species.base_stats->>'special_attack')::int,20,0,v_lvl,false),
      'special_defense', fn_calc_stat((v_species.base_stats->>'special_defense')::int,20,0,v_lvl,false),
      'speed', fn_calc_stat((v_species.base_stats->>'speed')::int,20,0,v_lvl,false),
      'types', v_species.types, 'ability', v_species.ability
    );
  end loop;

  insert into battles(player_id, opponent_kind, state)
  values (auth.uid(), 'bot', jsonb_build_object(
    'player_team', v_party, 'bot_team', v_bot,
    'active_player_idx', 0, 'active_bot_idx', 0, 'turn', 0, 'log', '[]'::jsonb,
    'weather', case p_biome
      when 'desert' then 'sandstorm' when 'mountain' then 'sandstorm'
      when 'snow' then 'hail'
      when 'ocean' then 'rain' when 'swamp' then 'rain'
      when 'volcano' then 'harsh-sun'
      else null
    end
  )) returning id into v_battle_id;

  return query select v_battle_id, state from battles where id = v_battle_id;
end;
$$ language plpgsql security definer set search_path = public;
revoke all on function rpc_create_bot_battle(text) from public;
grant execute on function rpc_create_bot_battle(text) to authenticated;

-- ---------------- rpc_create_wild_battle: NOWA funkcja (przycisk "Walcz") ----------------
create or replace function rpc_create_wild_battle(p_encounter_id uuid, p_lead_pokemon_id uuid default null)
returns table(battle_id uuid, state jsonb) as $$
declare
  v_enc encounters%rowtype; v_species pokemon_species%rowtype;
  v_party jsonb; v_bot jsonb; v_battle_id uuid; v_lead_idx int; v_weather text;
begin
  select * into v_enc from encounters where id = p_encounter_id and player_id = auth.uid() for update;
  if not found then raise exception 'Nieprawidlowy encounter'; end if;
  if v_enc.resolved then raise exception 'Ten encounter zostal juz rozwiazany'; end if;
  if v_enc.expires_at < now() then raise exception 'Encounter wygasl'; end if;

  select * into v_species from pokemon_species where id = v_enc.species_id;
  if not found then raise exception 'Brak danych gatunku % w pokemon_species', v_enc.species_id; end if;

  select coalesce(jsonb_agg((to_jsonb(up) || jsonb_build_object('types', ps.types)) order by up.party_slot), '[]'::jsonb) into v_party
    from user_pokemon up join pokemon_species ps on ps.id = up.species_id
    where up.owner_id = auth.uid() and up.party_slot is not null;
  if v_party = '[]'::jsonb then raise exception 'Twoja druzyna jest pusta'; end if;

  v_lead_idx := 0;
  if p_lead_pokemon_id is not null then
    select (ord - 1) into v_lead_idx from jsonb_array_elements(v_party) with ordinality as t(elem, ord)
      where elem->>'id' = p_lead_pokemon_id::text;
    v_lead_idx := coalesce(v_lead_idx, 0);
  end if;

  v_weather := case v_enc.biome
    when 'desert' then 'sandstorm' when 'mountain' then 'sandstorm'
    when 'snow' then 'hail'
    when 'ocean' then 'rain' when 'swamp' then 'rain'
    when 'volcano' then 'harsh-sun'
    else null
  end;

  v_bot := jsonb_build_array(jsonb_build_object(
    'species_id', v_enc.species_id, 'name', v_species.name, 'level', v_enc.level,
    'current_hp', v_enc.current_hp, 'max_hp', v_enc.max_hp,
    'attack', coalesce(v_enc.attack,10), 'defense', coalesce(v_enc.defense,10),
    'special_attack', coalesce(v_enc.special_attack,10), 'special_defense', coalesce(v_enc.special_defense,10),
    'speed', coalesce(v_enc.speed,10), 'types', v_species.types, 'ability', v_species.ability
  ));

  insert into battles(player_id, opponent_kind, state)
  values (auth.uid(), 'wild', jsonb_build_object(
    'player_team', v_party, 'bot_team', v_bot,
    'active_player_idx', v_lead_idx, 'active_bot_idx', 0, 'turn', 0, 'log', '[]'::jsonb,
    'encounter_id', p_encounter_id, 'weather', v_weather
  )) returning id into v_battle_id;

  return query select v_battle_id, state from battles where id = v_battle_id;
end;
$$ language plpgsql security definer set search_path = public;
revoke all on function rpc_create_wild_battle(uuid, uuid) from public;
grant execute on function rpc_create_wild_battle(uuid, uuid) to authenticated;

-- ---------------- fn_grant_pokemon_exp: NOWA funkcja (EXP per-Pokemon) ----------------
create or replace function fn_grant_pokemon_exp(p_pokemon_id uuid, p_amount int)
returns table(new_level int, leveled_up boolean) as $$
declare v_mon user_pokemon%rowtype; v_required bigint; v_start_level int;
begin
  if p_amount <= 0 or p_pokemon_id is null then
    return query select level, false from user_pokemon where id = p_pokemon_id;
    return;
  end if;
  select * into v_mon from user_pokemon where id = p_pokemon_id for update;
  if not found then return; end if;
  v_start_level := v_mon.level;
  v_mon.experience := v_mon.experience + p_amount;
  v_required := fn_exp_required(v_mon.level);
  while v_mon.experience >= v_required and v_mon.level < 100 loop
    v_mon.experience := v_mon.experience - v_required;
    v_mon.level := v_mon.level + 1;
    v_required := fn_exp_required(v_mon.level);
  end loop;
  update user_pokemon set experience = v_mon.experience, level = v_mon.level where id = p_pokemon_id;
  return query select v_mon.level, v_mon.level > v_start_level;
end;
$$ language plpgsql security definer set search_path = public;
revoke all on function fn_grant_pokemon_exp(uuid,int) from public;

-- ---------------- fn_apply_battle_state: nowy param p_mon_exp_gain ----------------
-- Stara wersja (6 parametrow) to INNA sygnatura funkcji dla Postgresa — usuwamy ja,
-- zeby nie zostaly dwa przeciazenia (edge function i tak zawsze woła teraz z 7 argumentami).
drop function if exists fn_apply_battle_state(uuid,uuid,jsonb,text,int,int);

create or replace function fn_apply_battle_state(
  p_battle_id uuid, p_player_id uuid, p_state jsonb, p_result text, p_exp_gain int, p_coin_gain int, p_mon_exp_gain int default 0
) returns table(trainer_level int, trainer_exp bigint, catch_coins bigint, mon_level int, mon_leveled_up boolean) as $$
declare v_battle battles%rowtype; v_gym_id uuid; v_encounter_id uuid; v_bot_hp int;
  v_active_mon_id uuid; v_mon_level int; v_mon_leveled_up boolean;
begin
  select * into v_battle from battles where id = p_battle_id and player_id = p_player_id for update;
  if not found then raise exception 'Nieprawidlowa walka'; end if;
  if v_battle.result is not null then raise exception 'Walka jest juz zakonczona'; end if;

  update battles set state = p_state, result = p_result,
    rewards = case when p_result is not null then jsonb_build_object('exp',p_exp_gain,'coins',p_coin_gain) else rewards end
    where id = p_battle_id;

  update user_pokemon up set current_hp = greatest(0,(elem->>'current_hp')::int)
    from jsonb_array_elements(p_state->'player_team') as elem
    where up.id = (elem->>'id')::uuid and up.owner_id = p_player_id;

  v_encounter_id := (p_state->>'encounter_id')::uuid;
  if v_encounter_id is not null then
    v_bot_hp := greatest(0, ((p_state->'bot_team'->0)->>'current_hp')::int);
    update encounters set current_hp = v_bot_hp, resolved = (resolved or v_bot_hp <= 0 or p_result is not null)
      where id = v_encounter_id and player_id = p_player_id;
  end if;

  if p_result = 'win' then
    update profiles set catch_coins = catch_coins + greatest(0,p_coin_gain) where id = p_player_id;
    insert into transaction_logs(profile_id,kind,delta,balance_after,reason)
      values (p_player_id,'coins',greatest(0,p_coin_gain),(select catch_coins from profiles where id=p_player_id),'battle_reward');
    perform fn_grant_exp(p_player_id, greatest(0,p_exp_gain));

    v_gym_id := (v_battle.state->>'gym_id')::uuid;
    if v_gym_id is not null then
      insert into player_badges(profile_id, badge_id)
        select p_player_id, b.id from badges b where b.gym_id = v_gym_id
        on conflict do nothing;
    end if;

    v_active_mon_id := (p_state->'player_team'->((p_state->>'active_player_idx')::int)->>'id')::uuid;
    select gpe.new_level, gpe.leveled_up into v_mon_level, v_mon_leveled_up
      from fn_grant_pokemon_exp(v_active_mon_id, greatest(0,p_mon_exp_gain)) gpe;
  end if;

  return query select trainer_level, trainer_exp, catch_coins, v_mon_level, coalesce(v_mon_leveled_up,false) from profiles where id = p_player_id;
end;
$$ language plpgsql security definer set search_path = public;
revoke all on function fn_apply_battle_state(uuid,uuid,jsonb,text,int,int,int) from public;
grant execute on function fn_apply_battle_state(uuid,uuid,jsonb,text,int,int,int) to service_role;

-- ---------------- rpc_create_gym_battle: dodano types+ability do v_party ----------------
create or replace function rpc_create_gym_battle(p_gym_id uuid)
returns table(battle_id uuid, state jsonb) as $$
declare
  v_gym gyms%rowtype; v_party jsonb; v_battle_id uuid; v_already boolean;
begin
  if not exists (select 1 from profiles where id = auth.uid()) then raise exception 'Brak profilu gracza'; end if;
  select * into v_gym from gyms where id = p_gym_id;
  if not found then raise exception 'Nieprawidlowa Sala'; end if;

  select exists(
    select 1 from player_badges pb join badges b on b.id = pb.badge_id
    where pb.profile_id = auth.uid() and b.gym_id = p_gym_id
  ) into v_already;
  if v_already then raise exception 'Ta odznaka zostala juz zdobyta'; end if;

  if v_gym.order_no > 1 and not exists (
    select 1 from player_badges pb join badges b on b.id = pb.badge_id join gyms g2 on g2.id = b.gym_id
    where pb.profile_id = auth.uid() and g2.region = v_gym.region and g2.order_no = v_gym.order_no - 1
  ) then
    raise exception 'Najpierw pokonaj poprzednia Sale regionu %', v_gym.region;
  end if;

  select coalesce(jsonb_agg((to_jsonb(up) || jsonb_build_object('types', ps.types)) order by up.party_slot), '[]'::jsonb) into v_party
    from user_pokemon up join pokemon_species ps on ps.id = up.species_id
    where up.owner_id = auth.uid() and up.party_slot is not null;
  if v_party = '[]'::jsonb then raise exception 'Twoja druzyna jest pusta'; end if;

  insert into battles(player_id, opponent_kind, state)
  values (auth.uid(), 'bot', jsonb_build_object(
    'player_team', v_party, 'bot_team', v_gym.roster,
    'active_player_idx', 0, 'active_bot_idx', 0, 'turn', 0, 'log', '[]'::jsonb, 'gym_id', p_gym_id
  )) returning id into v_battle_id;

  return query select v_battle_id, state from battles where id = v_battle_id;
end;
$$ language plpgsql security definer set search_path = public;
revoke all on function rpc_create_gym_battle(uuid) from public;
grant execute on function rpc_create_gym_battle(uuid) to authenticated;

-- ---------------- Reseed rosterow Sal, zeby zawieraly "ability" (dane juz istnieja,
-- ten blok tylko je nadpisuje UPDATE-em przez on conflict, wiec jest bezpieczny) ----------------
do $$
declare
  v_kanto jsonb := '[
    {"order_no":1,"leader_name":"Brock","leader_type":"rock","species":[74,95],"level":12},
    {"order_no":2,"leader_name":"Misty","leader_type":"water","species":[54,60],"level":14},
    {"order_no":3,"leader_name":"Lt. Surge","leader_type":"electric","species":[81,100],"level":17},
    {"order_no":4,"leader_name":"Erika","leader_type":"grass","species":[43],"level":19},
    {"order_no":5,"leader_name":"Koga","leader_type":"poison","species":[23,88],"level":22},
    {"order_no":6,"leader_name":"Sabrina","leader_type":"psychic","species":[63,124],"level":24},
    {"order_no":7,"leader_name":"Blaine","leader_type":"fire","species":[37,58],"level":26},
    {"order_no":8,"leader_name":"Giovanni","leader_type":"ground","species":[27,50,95],"level":28}
  ]'::jsonb;
  v_gym jsonb; v_sp jsonb; v_species pokemon_species%rowtype;
  v_roster jsonb; v_gym_id uuid; v_lvl int;
begin
  for v_gym in select * from jsonb_array_elements(v_kanto) loop
    v_roster := '[]'::jsonb;
    v_lvl := (v_gym->>'level')::int;
    for v_sp in select * from jsonb_array_elements(v_gym->'species') loop
      select * into v_species from pokemon_species where id = v_sp::int;
      continue when not found;
      v_roster := v_roster || jsonb_build_object(
        'species_id', v_species.id, 'name', v_species.name, 'level', v_lvl,
        'current_hp', fn_calc_stat((v_species.base_stats->>'hp')::int,25,0,v_lvl,true),
        'max_hp', fn_calc_stat((v_species.base_stats->>'hp')::int,25,0,v_lvl,true),
        'attack', fn_calc_stat((v_species.base_stats->>'attack')::int,25,0,v_lvl,false),
        'defense', fn_calc_stat((v_species.base_stats->>'defense')::int,25,0,v_lvl,false),
        'special_attack', fn_calc_stat((v_species.base_stats->>'special_attack')::int,25,0,v_lvl,false),
        'special_defense', fn_calc_stat((v_species.base_stats->>'special_defense')::int,25,0,v_lvl,false),
        'speed', fn_calc_stat((v_species.base_stats->>'speed')::int,25,0,v_lvl,false),
        'types', v_species.types, 'ability', v_species.ability
      );
    end loop;

    insert into gyms(region, order_no, leader_name, leader_type, roster)
    values ('Kanto', (v_gym->>'order_no')::int, v_gym->>'leader_name', v_gym->>'leader_type', v_roster)
    on conflict (region, order_no) do update set leader_name=excluded.leader_name, leader_type=excluded.leader_type, roster=excluded.roster
    returning id into v_gym_id;

    insert into badges(gym_id, name) values (v_gym_id, (v_gym->>'leader_name') || ' Badge')
    on conflict (gym_id) do nothing;
  end loop;
end $$;
