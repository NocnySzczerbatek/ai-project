-- ============================================================
-- Cobblemon CATCH ZONE — schemat startowy Supabase (ETAP: Database + Zero-Trust)
-- Osobny projekt Supabase, nie dotyka istniejącej strony Cobblemon Mastery.
-- Wklej w Supabase SQL Editor (docelowo: rozbić na numerowane migracje CLI).
--
-- Celowo pominięte na tym etapie (dołączą w swoich ETAPach z planu):
-- routes/biomes jako osobne tabele treści, quests, pokemon_moves (na razie
-- ruchy trzymane jako jsonb na user_pokemon).
-- ============================================================

create extension if not exists pgcrypto;

create or replace function fn_touch_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================
-- PROFILES (Trainer)
-- ============================================================
create table profiles (
  id                 uuid primary key references auth.users(id) on delete cascade,
  trainer_name       text not null unique check (char_length(trainer_name) between 3 and 20),
  trainer_level      int    not null default 1   check (trainer_level between 1 and 100),
  trainer_exp        bigint not null default 0   check (trainer_exp >= 0),
  energy             int    not null default 100 check (energy between 0 and 100),
  energy_bottles     int    not null default 5   check (energy_bottles >= 0),
  catch_coins        bigint not null default 500 check (catch_coins >= 0),
  last_energy_tick   timestamptz not null default now(),
  tutorial_completed boolean not null default false,
  starter_region     text,
  featured_badge_id  uuid,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create trigger trg_profiles_touch before update on profiles
  for each row execute function fn_touch_updated_at();

-- ============================================================
-- POKEMON_SPECIES (dane referencyjne, cache z PokeAPI)
-- ============================================================
create table pokemon_species (
  id              int primary key,          -- PokeAPI id
  name            text not null,
  base_stats      jsonb not null,           -- {hp,attack,defense,special_attack,special_defense,speed}
  types           text[] not null,
  base_catch_rate int not null default 45,
  primary_biome   text
);

-- ============================================================
-- USER_POKEMON
-- ============================================================
create table user_pokemon (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid not null references profiles(id) on delete cascade,
  species_id      int  not null references pokemon_species(id),
  nickname        text,
  level           int    not null default 1 check (level between 1 and 100),
  experience      bigint not null default 0 check (experience >= 0),
  current_hp      int  not null check (current_hp >= 0),
  max_hp          int  not null check (max_hp > 0),
  attack          int  not null,
  defense         int  not null,
  special_attack  int  not null,
  special_defense int  not null,
  speed           int  not null,
  ivs             jsonb not null default '{}',
  evs             jsonb not null default '{}',
  nature          text not null,
  ability         text not null,
  moves           jsonb not null default '[]',  -- max 4 slugi ruchów, walidowane server-side
  is_shiny        boolean not null default false,
  caught_biome    text,
  caught_at       timestamptz not null default now(),
  check (current_hp <= max_hp)
);
create index idx_user_pokemon_owner on user_pokemon(owner_id);

-- CHECK nie może odwoływać się do innej tabeli w Postgresie -> limit
-- "poziom Pokemona <= Trainer Level + 5" wymuszany triggerem.
create or replace function fn_enforce_pokemon_level_cap() returns trigger as $$
declare cap int;
begin
  select trainer_level + 5 into cap from profiles where id = new.owner_id;
  if cap is not null and new.level > cap then
    raise exception 'Poziom Pokemona % przekracza limit % (Trainer Level + 5)', new.level, cap;
  end if;
  return new;
end;
$$ language plpgsql;
create trigger trg_pokemon_level_cap before insert or update on user_pokemon
  for each row execute function fn_enforce_pokemon_level_cap();

-- ============================================================
-- INVENTORY
-- ============================================================
create table inventory (
  owner_id  uuid not null references profiles(id) on delete cascade,
  item_slug text not null check (item_slug in (
    'poke-ball','great-ball','ultra-ball','dusk-ball','master-ball','razz-berry','energy-bottle'
  )),
  quantity  int not null default 0 check (quantity >= 0),
  primary key (owner_id, item_slug)
);

-- ============================================================
-- TRANSACTION_LOGS (audyt: monety / energia / przedmioty / EXP)
-- Każda funkcja RPC, która zmienia stan gracza, wstawia tu wpis
-- w TEJ SAMEJ transakcji co zmiana salda.
-- ============================================================
create table transaction_logs (
  id            bigint generated always as identity primary key,
  profile_id    uuid not null references profiles(id) on delete cascade,
  kind          text not null check (kind in ('coins','energy','item','exp')),
  delta         bigint not null,
  balance_after bigint not null,
  reason        text not null,  -- 'catch_reward','pvp_steal','pvp_stolen','gts_sale','gts_purchase',
                                 -- 'shop_purchase','energy_regen','energy_spend','battle_reward', ...
  meta          jsonb,
  created_at    timestamptz not null default now()
);
create index idx_txlog_profile on transaction_logs(profile_id, created_at desc);

-- ============================================================
-- ENCOUNTERS (efemeryczne spotkania z dzikim Pokemonem podczas eksploracji)
-- ============================================================
create table encounters (
  id          uuid primary key default gen_random_uuid(),
  player_id   uuid not null references profiles(id) on delete cascade,
  species_id  int  not null references pokemon_species(id),
  level       int  not null,
  current_hp  int  not null,
  max_hp      int  not null,
  biome       text not null,
  resolved    boolean not null default false,
  expires_at  timestamptz not null default now() + interval '2 minutes',
  created_at  timestamptz not null default now()
);
create index idx_encounters_player on encounters(player_id) where not resolved;

-- ============================================================
-- BATTLES (PvE: dzicy Pokemoni / Trenerzy Bot)
-- ============================================================
create table battles (
  id            uuid primary key default gen_random_uuid(),
  player_id     uuid not null references profiles(id) on delete cascade,
  opponent_kind text not null check (opponent_kind in ('bot','wild')),
  state         jsonb not null,  -- autorytatywny stan tury/HP/log — WYŁĄCZNIE server-side
  result        text check (result in ('win','loss')),
  rewards       jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create trigger trg_battles_touch before update on battles
  for each row execute function fn_touch_updated_at();

-- ============================================================
-- PVP_BATTLES_LOG
-- ============================================================
create table pvp_battles_log (
  id           uuid primary key default gen_random_uuid(),
  winner_id    uuid not null references profiles(id),
  loser_id     uuid not null references profiles(id),
  coins_stolen bigint not null check (coins_stolen >= 0),
  created_at   timestamptz not null default now()
);

-- ============================================================
-- GYMS / BADGES
-- ============================================================
create table gyms (
  id          uuid primary key default gen_random_uuid(),
  region      text not null,
  order_no    int  not null,
  leader_name text not null,
  leader_type text not null,
  unique (region, order_no)
);
create table badges (
  id     uuid primary key default gen_random_uuid(),
  gym_id uuid not null references gyms(id),
  name   text not null
);
create table player_badges (
  profile_id uuid not null references profiles(id) on delete cascade,
  badge_id   uuid not null references badges(id),
  earned_at  timestamptz not null default now(),
  primary key (profile_id, badge_id)
);
alter table profiles
  add constraint fk_profiles_featured_badge foreign key (featured_badge_id) references badges(id);

-- ============================================================
-- GTS_LISTINGS
-- ============================================================
create table gts_listings (
  id           uuid primary key default gen_random_uuid(),
  seller_id    uuid not null references profiles(id) on delete cascade,
  pokemon_id   uuid not null references user_pokemon(id),
  asking_price bigint not null check (asking_price > 0),
  status       text not null default 'active' check (status in ('active','sold','cancelled')),
  created_at   timestamptz not null default now(),
  resolved_at  timestamptz
);
-- tylko jedna AKTYWNA oferta na danego Pokemona naraz (blokuje podwójną sprzedaż)
create unique index uq_gts_active_pokemon on gts_listings(pokemon_id) where (status = 'active');

-- ============================================================
-- ROW LEVEL SECURITY
-- Klient może wyłącznie SELECT własnych wierszy. Brak polityk
-- insert/update/delete dla ról anon/authenticated -> każda zmiana stanu
-- (nawet kosmetyczna, np. featured_badge_id) idzie przez funkcję
-- SECURITY DEFINER (RPC), nigdy przez bezpośredni UPDATE z klienta.
-- Postgres RLS działa na poziomie WIERSZY, nie kolumn — dlatego to
-- "brak grantów" jest tu właściwym mechanizmem, nie polityka UPDATE.
-- ============================================================
alter table profiles         enable row level security;
alter table user_pokemon     enable row level security;
alter table inventory        enable row level security;
alter table transaction_logs enable row level security;
alter table encounters       enable row level security;
alter table battles          enable row level security;
alter table pvp_battles_log  enable row level security;
alter table gts_listings     enable row level security;
alter table player_badges    enable row level security;

create policy p_profiles_select_own on profiles for select using (auth.uid() = id);
create policy p_pokemon_select_own on user_pokemon for select using (auth.uid() = owner_id);
create policy p_inventory_select_own on inventory for select using (auth.uid() = owner_id);
create policy p_txlog_select_own on transaction_logs for select using (auth.uid() = profile_id);
create policy p_encounters_select_own on encounters for select using (auth.uid() = player_id);
create policy p_battles_select_own on battles for select using (auth.uid() = player_id);
create policy p_pvplog_select_participant on pvp_battles_log for select
  using (auth.uid() = winner_id or auth.uid() = loser_id);
create policy p_gts_select_active on gts_listings for select
  using (status = 'active' or auth.uid() = seller_id);
create policy p_badges_select_own on player_badges for select using (auth.uid() = profile_id);

-- ============================================================
-- PRZYKŁADOWA FUNKCJA "ZERO TRUST" — wzorzec do powielenia dla
-- catch/battle/pvp/gts:
--   1) SECURITY DEFINER + auth.uid() jako jedyne źródło tożsamości
--   2) SELECT ... FOR UPDATE (blokada wiersza -> brak race condition)
--   3) cała matematyka/RNG po stronie serwera, nigdy z inputu klienta
--   4) zapis wyniku + wpis do transaction_logs w JEDNEJ transakcji
--   5) zwrot wyłącznie finalnego, autorytatywnego stanu
-- ============================================================
create or replace function rpc_spend_energy(p_cost int)
returns table(energy int, energy_bottles int) as $$
declare
  v_profile profiles%rowtype;
  v_regen int;
begin
  if p_cost <= 0 then
    raise exception 'Nieprawidlowy koszt energii';
  end if;

  select * into v_profile from profiles where id = auth.uid() for update;
  if not found then
    raise exception 'Brak profilu gracza';
  end if;

  -- leniwa regeneracja +1 energii / 3 minuty, bez cron/schedulera
  v_regen := least(100 - v_profile.energy,
                    floor(extract(epoch from (now() - v_profile.last_energy_tick)) / 180)::int);
  if v_regen > 0 then
    v_profile.energy := v_profile.energy + v_regen;
    v_profile.last_energy_tick := v_profile.last_energy_tick + (v_regen * interval '3 minutes');
  end if;

  if v_profile.energy < p_cost then
    raise exception 'Za malo energii (masz %, potrzeba %)', v_profile.energy, p_cost;
  end if;
  v_profile.energy := v_profile.energy - p_cost;

  update profiles set energy = v_profile.energy, last_energy_tick = v_profile.last_energy_tick
    where id = auth.uid();

  insert into transaction_logs(profile_id, kind, delta, balance_after, reason)
    values (auth.uid(), 'energy', -p_cost, v_profile.energy, 'exploration_step');

  return query select v_profile.energy, v_profile.energy_bottles;
end;
$$ language plpgsql security definer set search_path = public;

revoke all on function rpc_spend_energy(int) from public;
grant execute on function rpc_spend_energy(int) to authenticated;

-- ============================================================
-- SEED: pokemon_species — starterzy FTUE (Kanto Gen I)
-- Staty bazowe z gier Pokemon (dane liczbowe/mechanika, domena publiczna).
-- ============================================================
insert into pokemon_species (id, name, base_stats, types, base_catch_rate, primary_biome) values
  (1, 'bulbasaur',  '{"hp":45,"attack":49,"defense":49,"special_attack":65,"special_defense":65,"speed":45}', array['grass','poison'], 45, 'forest'),
  (4, 'charmander', '{"hp":39,"attack":52,"defense":43,"special_attack":60,"special_defense":50,"speed":65}', array['fire'], 45, 'volcano'),
  (7, 'squirtle',   '{"hp":44,"attack":48,"defense":65,"special_attack":50,"special_defense":64,"speed":43}', array['water'], 45, 'ocean')
on conflict (id) do nothing;

-- ============================================================
-- AUTO-PROVISIONING profilu przy pierwszym logowaniu (w tym Anonymous Sign-In).
-- Wymaga wlaczenia "Anonymous Sign-Ins" w Supabase Dashboard -> Authentication.
-- ============================================================
create or replace function fn_handle_new_user() returns trigger as $$
begin
  insert into profiles(id, trainer_name)
  values (new.id, 'Trainer' || substr(replace(new.id::text, '-', ''), 1, 8))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function fn_handle_new_user();

-- Wspolny helper do liczenia statow — ta sama formula co client-side w js/arena.js
create or replace function fn_calc_stat(p_base int, p_iv int, p_ev int, p_level int, p_is_hp boolean)
returns int as $$
begin
  if p_is_hp then
    return floor((2*p_base + p_iv + floor(p_ev/4.0)) * p_level / 100.0)::int + p_level + 10;
  else
    return floor((2*p_base + p_iv + floor(p_ev/4.0)) * p_level / 100.0)::int + 5;
  end if;
end;
$$ language plpgsql immutable;

-- ============================================================
-- RPC: rpc_set_trainer_name — Krok 1 samouczka (walidacja server-side)
-- ============================================================
create or replace function rpc_set_trainer_name(p_name text)
returns text as $$
declare v_clean text;
begin
  v_clean := trim(p_name);
  if char_length(v_clean) < 3 or char_length(v_clean) > 20 then
    raise exception 'Nazwa Trenera musi miec 3-20 znakow';
  end if;
  if v_clean !~ '^[A-Za-z0-9 _-]+$' then
    raise exception 'Nazwa Trenera zawiera niedozwolone znaki';
  end if;

  update profiles set trainer_name = v_clean where id = auth.uid();
  if not found then
    raise exception 'Brak profilu gracza';
  end if;

  return v_clean;
exception
  when unique_violation then
    raise exception 'Ta nazwa Trenera jest juz zajeta';
end;
$$ language plpgsql security definer set search_path = public;

revoke all on function rpc_set_trainer_name(text) from public;
grant execute on function rpc_set_trainer_name(text) to authenticated;

-- ============================================================
-- RPC: rpc_complete_tutorial — atomowe zakonczenie FTUE (Krok 4 lub Pomin Samouczek).
-- Idempotentne: druga proba dla tego samego gracza konczy sie bledem, wiec
-- nagrody startowe da sie otrzymac tylko raz.
-- ============================================================
create or replace function rpc_complete_tutorial(p_starter_species_id int)
returns table(
  trainer_level  int,
  catch_coins    bigint,
  energy         int,
  new_pokemon_id uuid,
  poke_balls     int,
  energy_bottles int
) as $$
declare
  v_profile    profiles%rowtype;
  v_species    pokemon_species%rowtype;
  v_pokemon_id uuid;
  v_hp         int;
begin
  if not (p_starter_species_id = any(array[1,4,7])) then
    raise exception 'Nieprawidlowy starter (dozwolone: 1=Bulbasaur, 4=Charmander, 7=Squirtle)';
  end if;

  select * into v_profile from profiles where id = auth.uid() for update;
  if not found then
    raise exception 'Brak profilu gracza (zaloguj sie ponownie)';
  end if;

  if v_profile.tutorial_completed then
    raise exception 'Samouczek zostal juz ukonczony — nagrody startowe mozna otrzymac tylko raz';
  end if;

  select * into v_species from pokemon_species where id = p_starter_species_id;
  if not found then
    raise exception 'Brak danych gatunku % w pokemon_species', p_starter_species_id;
  end if;

  v_hp := fn_calc_stat((v_species.base_stats->>'hp')::int, 31, 0, 1, true);

  insert into user_pokemon(
    owner_id, species_id, level, current_hp, max_hp,
    attack, defense, special_attack, special_defense, speed,
    nature, ability, moves, caught_biome
  ) values (
    auth.uid(), p_starter_species_id, 1, v_hp, v_hp,
    fn_calc_stat((v_species.base_stats->>'attack')::int, 31, 0, 1, false),
    fn_calc_stat((v_species.base_stats->>'defense')::int, 31, 0, 1, false),
    fn_calc_stat((v_species.base_stats->>'special_attack')::int, 31, 0, 1, false),
    fn_calc_stat((v_species.base_stats->>'special_defense')::int, 31, 0, 1, false),
    fn_calc_stat((v_species.base_stats->>'speed')::int, 31, 0, 1, false),
    'Hardy', 'unknown', '[]'::jsonb, 'tutorial'
    -- ability/moves placeholder — uzupelni ETAP 5 (Pokemon + Inventory) po dodaniu danych movepool
  ) returning id into v_pokemon_id;

  insert into inventory(owner_id, item_slug, quantity) values
    (auth.uid(), 'energy-bottle', 5),
    (auth.uid(), 'poke-ball', 10)
  on conflict (owner_id, item_slug) do update set quantity = inventory.quantity + excluded.quantity;

  update profiles set trainer_level = 2, tutorial_completed = true where id = auth.uid();

  insert into transaction_logs(profile_id, kind, delta, balance_after, reason, meta)
  values (
    auth.uid(), 'exp', 1, 2, 'tutorial_complete',
    jsonb_build_object(
      'starter_species_id', p_starter_species_id,
      'pokemon_id', v_pokemon_id,
      'granted_items', jsonb_build_object('energy-bottle', 5, 'poke-ball', 10)
    )
  );

  return query select 2, v_profile.catch_coins, v_profile.energy, v_pokemon_id, 10, 5;
end;
$$ language plpgsql security definer set search_path = public;

revoke all on function rpc_complete_tutorial(int) from public;
grant execute on function rpc_complete_tutorial(int) to authenticated;

-- ============================================================
-- SEED: pokemon_species — pospolite gatunki Kanto (encountery + rostery Sal).
-- Pelna baza 1025 gatunkow to tresc ETAPu 5 — tu tylko reprezentatywny zestaw.
-- ============================================================
insert into pokemon_species (id, name, base_stats, types, base_catch_rate, primary_biome) values
  (16,'pidgey', '{"hp":40,"attack":45,"defense":40,"special_attack":35,"special_defense":35,"speed":56}', array['normal','flying'], 255, 'plains'),
  (19,'rattata','{"hp":30,"attack":56,"defense":35,"special_attack":25,"special_defense":35,"speed":72}', array['normal'], 255, 'plains'),
  (10,'caterpie','{"hp":45,"attack":30,"defense":35,"special_attack":20,"special_defense":20,"speed":45}', array['bug'], 255, 'forest'),
  (13,'weedle', '{"hp":40,"attack":35,"defense":30,"special_attack":20,"special_defense":20,"speed":50}', array['bug','poison'], 255, 'forest'),
  (43,'oddish', '{"hp":45,"attack":50,"defense":55,"special_attack":75,"special_defense":65,"speed":30}', array['grass','poison'], 255, 'forest'),
  (41,'zubat',  '{"hp":40,"attack":45,"defense":35,"special_attack":30,"special_defense":40,"speed":55}', array['poison','flying'], 255, 'cave'),
  (74,'geodude','{"hp":40,"attack":80,"defense":100,"special_attack":30,"special_defense":30,"speed":20}', array['rock','ground'], 255, 'cave'),
  (95,'onix',   '{"hp":35,"attack":45,"defense":160,"special_attack":30,"special_defense":45,"speed":70}', array['rock','ground'], 45, 'cave'),
  (54,'psyduck','{"hp":50,"attack":52,"defense":48,"special_attack":65,"special_defense":50,"speed":55}', array['water'], 190, 'ocean'),
  (60,'poliwag','{"hp":40,"attack":50,"defense":40,"special_attack":40,"special_defense":40,"speed":90}', array['water'], 255, 'ocean'),
  (81,'magnemite','{"hp":25,"attack":35,"defense":70,"special_attack":95,"special_defense":55,"speed":45}', array['electric','steel'], 190, 'cyber'),
  (100,'voltorb','{"hp":40,"attack":30,"defense":50,"special_attack":55,"special_defense":55,"speed":100}', array['electric'], 190, 'cyber'),
  (58,'growlithe','{"hp":55,"attack":70,"defense":45,"special_attack":70,"special_defense":50,"speed":60}', array['fire'], 190, 'volcano'),
  (37,'vulpix', '{"hp":38,"attack":41,"defense":40,"special_attack":50,"special_defense":65,"speed":65}', array['fire'], 190, 'volcano'),
  (27,'sandshrew','{"hp":50,"attack":75,"defense":85,"special_attack":20,"special_defense":30,"speed":40}', array['ground'], 255, 'desert'),
  (50,'diglett','{"hp":10,"attack":55,"defense":25,"special_attack":35,"special_defense":45,"speed":95}', array['ground'], 255, 'desert'),
  (63,'abra',   '{"hp":25,"attack":20,"defense":15,"special_attack":105,"special_defense":55,"speed":90}', array['psychic'], 200, 'void'),
  (92,'gastly', '{"hp":30,"attack":35,"defense":30,"special_attack":100,"special_defense":35,"speed":80}', array['ghost','poison'], 190, 'void'),
  (66,'machop', '{"hp":70,"attack":80,"defense":50,"special_attack":35,"special_defense":35,"speed":35}', array['fighting'], 180, 'mountain'),
  (86,'seel',   '{"hp":65,"attack":45,"defense":55,"special_attack":45,"special_defense":70,"speed":45}', array['water'], 190, 'snow'),
  (124,'jynx',  '{"hp":65,"attack":50,"defense":35,"special_attack":115,"special_defense":95,"speed":95}', array['ice','psychic'], 45, 'snow'),
  (23,'ekans',  '{"hp":35,"attack":60,"defense":44,"special_attack":40,"special_defense":54,"speed":55}', array['poison'], 255, 'swamp'),
  (88,'grimer', '{"hp":80,"attack":80,"defense":50,"special_attack":40,"special_defense":50,"speed":25}', array['poison'], 190, 'swamp'),
  (147,'dratini','{"hp":41,"attack":64,"defense":45,"special_attack":50,"special_defense":50,"speed":50}', array['dragon'], 45, 'sky'),
  (21,'spearow','{"hp":40,"attack":60,"defense":30,"special_attack":31,"special_defense":31,"speed":70}', array['normal','flying'], 255, 'sky')
on conflict (id) do nothing;

-- Zdolnosc (Ability) do wyswietlenia na karcie stworka w walce (Modul 4) — realne,
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

/* ================================================================
   MODUL 2: EKSPLORACJA, ENERGIA, GENERATOR ENCOUNTEROW (SQL RPC)
   ================================================================ */
create table player_presence (
  profile_id uuid primary key references profiles(id) on delete cascade,
  biome      text not null,
  last_seen  timestamptz not null default now()
);
alter table player_presence enable row level security;
create policy p_presence_select_all on player_presence for select using (true);
-- brak insert/update/delete z klienta — wylacznie przez rpc_explore_step (SECURITY DEFINER)

-- Reuzywalna leniwa regeneracja energii (rpc_spend_energy ma wlasna, odrebna
-- kopie tej logiki sprzed tego ETAPu — celowo nietykana, zeby jej nie zepsuc)
create or replace function fn_regen_energy(p_energy int, p_last_tick timestamptz)
returns table(new_energy int, new_tick timestamptz) as $$
declare v_regen int;
begin
  v_regen := least(100 - p_energy, floor(extract(epoch from (now() - p_last_tick)) / 180)::int);
  if v_regen > 0 then
    return query select p_energy + v_regen, p_last_tick + (v_regen * interval '3 minutes');
  else
    return query select p_energy, p_last_tick;
  end if;
end;
$$ language plpgsql immutable;

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

/* ================================================================
   MODUL 3: CATCH ENGINE — zapis atomowy wyniku
   RNG i formula licza sie w Edge Function (catch-attempt, TS), bo tam
   zyje zlozona logika; ta funkcja WYLACZNIE aplikuje juz gotowy wynik
   i dlatego NIE jest dostepna dla "authenticated" (klient mogłby podac
   p_success=true bez rzutu) — woła ja tylko Edge Function przez service_role.
   ================================================================ */
alter table encounters
  add column if not exists attack int,
  add column if not exists defense int,
  add column if not exists special_attack int,
  add column if not exists special_defense int,
  add column if not exists speed int;

create or replace function fn_resolve_catch(
  p_encounter_id uuid, p_player_id uuid, p_ball_slug text, p_used_berry boolean, p_success boolean
) returns table(success boolean, new_pokemon_id uuid, balls_remaining int) as $$
declare
  v_enc encounters%rowtype;
  v_balls int;
  v_berries int;
  v_pokemon_id uuid;
begin
  select * into v_enc from encounters where id = p_encounter_id and player_id = p_player_id for update;
  if not found then raise exception 'Nieprawidlowy encounter'; end if;
  if v_enc.resolved then raise exception 'Ten encounter zostal juz rozwiazany'; end if;
  if v_enc.expires_at < now() then raise exception 'Encounter wygasl'; end if;

  select quantity into v_balls from inventory where owner_id = p_player_id and item_slug = p_ball_slug for update;
  if v_balls is null or v_balls < 1 then raise exception 'Brak % w ekwipunku', p_ball_slug; end if;

  if p_used_berry then
    select quantity into v_berries from inventory where owner_id = p_player_id and item_slug = 'razz-berry' for update;
    if v_berries is null or v_berries < 1 then raise exception 'Brak Razz Berry w ekwipunku'; end if;
    update inventory set quantity = quantity - 1 where owner_id = p_player_id and item_slug = 'razz-berry';
  end if;

  update inventory set quantity = quantity - 1 where owner_id = p_player_id and item_slug = p_ball_slug;
  update encounters set resolved = true where id = p_encounter_id;

  if p_success then
    insert into user_pokemon(
      owner_id, species_id, level, current_hp, max_hp, attack, defense,
      special_attack, special_defense, speed, nature, ability, moves, caught_biome
    ) values (
      p_player_id, v_enc.species_id, v_enc.level, v_enc.max_hp, v_enc.max_hp,
      coalesce(v_enc.attack,10), coalesce(v_enc.defense,10), coalesce(v_enc.special_attack,10),
      coalesce(v_enc.special_defense,10), coalesce(v_enc.speed,10),
      'Hardy', 'unknown', '[]'::jsonb, v_enc.biome
    ) returning id into v_pokemon_id;
  end if;

  insert into transaction_logs(profile_id, kind, delta, balance_after, reason, meta)
    values (p_player_id, 'item', -1, v_balls - 1, 'catch_attempt',
      jsonb_build_object('ball', p_ball_slug, 'success', p_success, 'pokemon_id', v_pokemon_id, 'species_id', v_enc.species_id));

  return query select p_success, v_pokemon_id, v_balls - 1;
end;
$$ language plpgsql security definer set search_path = public;

revoke all on function fn_resolve_catch(uuid,uuid,text,boolean,boolean) from public;
grant execute on function fn_resolve_catch(uuid,uuid,text,boolean,boolean) to service_role;

/* ================================================================
   Progresja: wzor EXP + level-up (uzywane przez rozliczenia walk — Modul 4/5)
   fn_grant_exp jest CELOWO bez grant do "authenticated": klient nigdy nie
   powinien móc bezposrednio przyznac sobie EXP w dowolnej ilosci.
   ================================================================ */
create or replace function fn_exp_required(p_level int) returns bigint as $$
  select floor(100 * power(p_level, 1.8))::bigint;
$$ language sql immutable;

create or replace function fn_grant_exp(p_profile_id uuid, p_amount int) returns void as $$
declare v_level int; v_exp bigint; v_required bigint;
begin
  if p_amount <= 0 then return; end if;
  select trainer_level, trainer_exp into v_level, v_exp from profiles where id = p_profile_id for update;
  v_exp := v_exp + p_amount;
  v_required := fn_exp_required(v_level);
  while v_exp >= v_required and v_level < 100 loop
    v_exp := v_exp - v_required;
    v_level := v_level + 1;
    v_required := fn_exp_required(v_level);
  end loop;
  update profiles set trainer_level = v_level, trainer_exp = v_exp where id = p_profile_id;
  insert into transaction_logs(profile_id, kind, delta, balance_after, reason)
    values (p_profile_id, 'exp', p_amount, v_exp, 'battle_exp');
end;
$$ language plpgsql security definer set search_path = public;
revoke all on function fn_grant_exp(uuid,int) from public;

/* ================================================================
   MODUL 4: DRUZYNA, KATALOG PRZEDMIOTOW/RUCHOW, BOTY, PVP
   ================================================================ */
-- item_catalog zastepuje sztywny CHECK w inventory (latwiej dodawac przedmioty)
create table item_catalog (
  slug text primary key, name text not null, category text not null
);
insert into item_catalog(slug,name,category) values
  ('poke-ball','Poké Ball','ball'),('great-ball','Great Ball','ball'),
  ('ultra-ball','Ultra Ball','ball'),('dusk-ball','Dusk Ball','ball'),
  ('master-ball','Master Ball','ball'),('razz-berry','Razz Berry','berry'),
  ('energy-bottle','Flakon Energii','consumable'),('mega-stone','Kamień Mega Ewolucji','battle-item')
on conflict (slug) do nothing;
alter table inventory drop constraint if exists inventory_item_slug_check;
alter table inventory add constraint fk_inventory_item foreign key (item_slug) references item_catalog(slug);

-- Maly katalog ruchow startowych — pelny movepool to tresc ETAPu 5
create table move_catalog (
  slug text primary key, name text not null, power int not null,
  type text not null, category text not null check (category in ('P','S','Z')), accuracy int not null default 100
);
insert into move_catalog(slug,name,power,type,category,accuracy) values
  ('tackle','Tackle',40,'normal','P',100),('vine-whip','Vine Whip',45,'grass','P',100),
  ('razor-leaf','Razor Leaf',55,'grass','P',95),('ember','Ember',40,'fire','S',100),
  ('flamethrower','Flamethrower',90,'fire','S',100),('water-gun','Water Gun',40,'water','S',100),
  ('bubble-beam','Bubble Beam',65,'water','S',100),('quick-attack','Quick Attack',40,'normal','P',100),
  ('gust','Gust',40,'flying','S',100),('confusion','Confusion',50,'psychic','S',100),
  ('rock-throw','Rock Throw',50,'rock','P',90),('bite','Bite',60,'dark','P',100),
  ('thunder-shock','Thunder Shock',40,'electric','S',100),('poison-sting','Poison Sting',15,'poison','P',100),
  ('scratch','Scratch',40,'normal','P',100),('growl','Growl',0,'normal','Z',100)
on conflict (slug) do nothing;

-- Druzyna aktywna (max 6, party_slot 1-6) vs PC Box (party_slot NULL)
alter table user_pokemon add column if not exists party_slot int check (party_slot between 1 and 6);
create unique index if not exists uq_party_slot on user_pokemon(owner_id, party_slot) where party_slot is not null;

create or replace function fn_default_party_slot() returns trigger as $$
begin
  if new.party_slot is null and not exists (
    select 1 from user_pokemon where owner_id = new.owner_id and party_slot is not null
  ) then
    new.party_slot := 1; -- pierwszy Pokemon gracza trafia od razu do druzyny
  end if;
  return new;
end;
$$ language plpgsql;
create trigger trg_pokemon_default_party before insert on user_pokemon
  for each row execute function fn_default_party_slot();

-- ---------------- BOT BATTLE ----------------
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

  -- 'types' nie jest kolumna user_pokemon — dolaczamy z pokemon_species, inaczej
  -- battleEngine.ts dostaje player_team bez types i wywala sie na obronie gracza.
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

  return query select v_battle_id, battles.state from battles where id = v_battle_id;
end;
$$ language plpgsql security definer set search_path = public;
revoke all on function rpc_create_bot_battle(text) from public;
grant execute on function rpc_create_bot_battle(text) to authenticated;

-- Walka z dzikim Pokemonem napotkanym podczas eksploracji (przycisk "Walcz" na
-- ekranie Lapania) — reuzywa DOKLADNIE ten sam silnik/edge function co Boty/Sale
-- (battle-turn), tylko bot_team ma zawsze 1 czlonka zbudowanego z juz wylosowanego
-- encountera (te same staty, ktore widzi tez Catch Engine).
-- p_lead_pokemon_id: ktorego Pokemona z druzyny gracz wybral na ekranie wyboru
-- druzyny (Modul 4b) — ustawia active_player_idx; null/nietrafiony -> slot 1.
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

  return query select v_battle_id, battles.state from battles where id = v_battle_id;
end;
$$ language plpgsql security definer set search_path = public;
revoke all on function rpc_create_wild_battle(uuid, uuid) from public;
grant execute on function rpc_create_wild_battle(uuid, uuid) to authenticated;

-- Zapisuje stan tury wyliczonej przez Edge Function battle-turn + rozlicza
-- nagrody na koniec walki. Bez grant do "authenticated": p_result/p_exp_gain/
-- p_coin_gain sa obliczone przez zaufany serwer (Edge Function), nie przez klienta.
--
-- EXP dla konkretnego Pokemona (nie tylko dla Trenera): celowo NIE przeliczamy tu
-- na nowo statow (attack/defense/...) po awansie poziomu — user_pokemon.ivs jest
-- w praktyce zawsze puste (nie jest jeszcze nigdzie wypelniane), wiec proba
-- odtworzenia statow z IV skonczylaby sie NULL-ami. Level/experience rosna od razu,
-- realny przelicznik statow to osobna, przyszla poprawka.
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

  -- trwale zapisujemy HP druzyny gracza (obrazenia przenosza sie miedzy walkami)
  update user_pokemon up set current_hp = greatest(0,(elem->>'current_hp')::int)
    from jsonb_array_elements(p_state->'player_team') as elem
    where up.id = (elem->>'id')::uuid and up.owner_id = p_player_id;

  -- Walka z dzikim Pokemonem (przycisk Walcz w Module Eksploracji): synchronizujemy
  -- HP encountera po kazdej turze, zeby kolejna proba zlapania (catch-attempt)
  -- liczyla szanse z aktualnymi obrazeniami; omdlenie/koniec walki zamyka encounter.
  v_encounter_id := (p_state->>'encounter_id')::uuid;
  if v_encounter_id is not null then
    v_bot_hp := greatest(0, ((p_state->'bot_team'->0)->>'current_hp')::int);
    update encounters set current_hp = v_bot_hp, resolved = (resolved or v_bot_hp <= 0 or p_result is not null)
      where id = v_encounter_id and player_id = p_player_id;
  end if;

  if p_result = 'win' then
    update profiles set catch_coins = profiles.catch_coins + greatest(0,p_coin_gain) where id = p_player_id;
    insert into transaction_logs(profile_id,kind,delta,balance_after,reason)
      values (p_player_id,'coins',greatest(0,p_coin_gain),(select pr.catch_coins from profiles pr where pr.id=p_player_id),'battle_reward');
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

  return query select profiles.trainer_level, profiles.trainer_exp, profiles.catch_coins, v_mon_level, coalesce(v_mon_leveled_up,false) from profiles where id = p_player_id;
end;
$$ language plpgsql security definer set search_path = public;
revoke all on function fn_apply_battle_state(uuid,uuid,jsonb,text,int,int,int) from public;
grant execute on function fn_apply_battle_state(uuid,uuid,jsonb,text,int,int,int) to service_role;

-- ---------------- PVP ----------------
-- Kto wygral jest wyliczane przez Edge Function pvp-challenge (symulacja obu
-- druzyn po stronie serwera) — ta funkcja tylko aplikuje juz gotowy wynik,
-- dlatego celowo NIE ma grant do "authenticated" (inaczej klient moglby
-- okrasc dowolnego gracza wywolujac ja bezposrednio z p_winner=siebie).
create or replace function fn_resolve_pvp(p_winner uuid, p_loser uuid, p_battle_log jsonb)
returns table(catch_coins bigint, coins_stolen bigint) as $$
declare v_loser_coins bigint; v_steal_pct numeric; v_steal bigint;
begin
  select profiles.catch_coins into v_loser_coins from profiles where id = p_loser for update;
  if v_loser_coins is null then raise exception 'Nieprawidlowy przegrany'; end if;

  v_steal_pct := 0.05 + random() * 0.05; -- 5-10%
  v_steal := floor(v_loser_coins * v_steal_pct)::bigint;
  if v_loser_coins - v_steal < 100 then -- Tarcza BHP
    v_steal := greatest(0, v_loser_coins - 100);
  end if;

  update profiles set catch_coins = profiles.catch_coins - v_steal where id = p_loser;
  update profiles set catch_coins = profiles.catch_coins + v_steal where id = p_winner;

  insert into transaction_logs(profile_id,kind,delta,balance_after,reason,meta)
    values (p_loser,'coins',-v_steal,(select pr.catch_coins from profiles pr where pr.id=p_loser),'pvp_stolen',jsonb_build_object('opponent',p_winner));
  insert into transaction_logs(profile_id,kind,delta,balance_after,reason,meta)
    values (p_winner,'coins',v_steal,(select pr.catch_coins from profiles pr where pr.id=p_winner),'pvp_steal',jsonb_build_object('opponent',p_loser));

  insert into pvp_battles_log(winner_id, loser_id, coins_stolen) values (p_winner, p_loser, v_steal);

  return query select profiles.catch_coins, v_steal from profiles where id = p_winner;
end;
$$ language plpgsql security definer set search_path = public;
revoke all on function fn_resolve_pvp(uuid,uuid,jsonb) from public;
grant execute on function fn_resolve_pvp(uuid,uuid,jsonb) to service_role;

/* ================================================================
   MODUL 5: SALE, ODZNAKI, MEGA EWOLUCJA (Kanto jako region-przyklad)
   ================================================================ */
alter table gyms add column if not exists roster jsonb;
alter table badges add constraint uq_badges_gym unique (gym_id);

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

  return query select v_battle_id, battles.state from battles where id = v_battle_id;
end;
$$ language plpgsql security definer set search_path = public;
revoke all on function rpc_create_gym_battle(uuid) from public;
grant execute on function rpc_create_gym_battle(uuid) to authenticated;

create or replace function rpc_set_featured_badge(p_badge_id uuid) returns void as $$
begin
  if p_badge_id is not null and not exists (
    select 1 from player_badges where profile_id = auth.uid() and badge_id = p_badge_id
  ) then
    raise exception 'Nie posiadasz tej odznaki';
  end if;
  update profiles set featured_badge_id = p_badge_id where id = auth.uid();
end;
$$ language plpgsql security definer set search_path = public;
revoke all on function rpc_set_featured_badge(uuid) from public;
grant execute on function rpc_set_featured_badge(uuid) to authenticated;

/* ================================================================
   MODUL 6: GTS + SKLEP PLN
   ================================================================ */
create or replace function rpc_gts_list(p_pokemon_id uuid, p_price bigint) returns uuid as $$
declare v_listing_id uuid;
begin
  if p_price <= 0 then raise exception 'Cena musi byc dodatnia'; end if;
  if not exists (select 1 from user_pokemon where id = p_pokemon_id and owner_id = auth.uid()) then
    raise exception 'Nie jestes wlascicielem tego Pokemona';
  end if;
  if exists (select 1 from gts_listings where pokemon_id = p_pokemon_id and status = 'active') then
    raise exception 'Ten Pokemon jest juz wystawiony';
  end if;
  insert into gts_listings(seller_id, pokemon_id, asking_price) values (auth.uid(), p_pokemon_id, p_price)
    returning id into v_listing_id;
  update user_pokemon set party_slot = null where id = p_pokemon_id;
  return v_listing_id;
end;
$$ language plpgsql security definer set search_path = public;
revoke all on function rpc_gts_list(uuid,bigint) from public;
grant execute on function rpc_gts_list(uuid,bigint) to authenticated;

create or replace function rpc_gts_cancel(p_listing_id uuid) returns void as $$
begin
  update gts_listings set status = 'cancelled', resolved_at = now()
    where id = p_listing_id and seller_id = auth.uid() and status = 'active';
  if not found then raise exception 'Nie mozna anulowac tej oferty'; end if;
end;
$$ language plpgsql security definer set search_path = public;
revoke all on function rpc_gts_cancel(uuid) from public;
grant execute on function rpc_gts_cancel(uuid) to authenticated;

create or replace function rpc_gts_buy(p_listing_id uuid) returns table(catch_coins bigint) as $$
declare v_listing gts_listings%rowtype; v_buyer_coins bigint; v_commission bigint; v_seller_gain bigint; v_rows int;
begin
  select * into v_listing from gts_listings where id = p_listing_id for update;
  if not found then raise exception 'Oferta nie istnieje'; end if;
  if v_listing.seller_id = auth.uid() then raise exception 'Nie mozesz kupic wlasnej oferty'; end if;

  select profiles.catch_coins into v_buyer_coins from profiles where id = auth.uid() for update;
  if v_buyer_coins < v_listing.asking_price then raise exception 'Za malo Catch Coins'; end if;

  -- atomowe "zaklepanie" oferty: jesli ktos inny juz kupil, ROW_COUNT=0
  update gts_listings set status = 'sold', resolved_at = now() where id = p_listing_id and status = 'active';
  get diagnostics v_rows = row_count;
  if v_rows = 0 then raise exception 'Ta oferta zostala juz sprzedana'; end if;

  v_commission := ceil(v_listing.asking_price * 0.05);
  v_seller_gain := v_listing.asking_price - v_commission;

  update profiles set catch_coins = profiles.catch_coins - v_listing.asking_price where id = auth.uid();
  update profiles set catch_coins = profiles.catch_coins + v_seller_gain where id = v_listing.seller_id;
  update user_pokemon set owner_id = auth.uid(), party_slot = null where id = v_listing.pokemon_id;

  insert into transaction_logs(profile_id,kind,delta,balance_after,reason,meta)
    values (auth.uid(),'coins',-v_listing.asking_price,(select pr.catch_coins from profiles pr where pr.id=auth.uid()),'gts_purchase',jsonb_build_object('listing_id',p_listing_id));
  insert into transaction_logs(profile_id,kind,delta,balance_after,reason,meta)
    values (v_listing.seller_id,'coins',v_seller_gain,(select pr.catch_coins from profiles pr where pr.id=v_listing.seller_id),'gts_sale',jsonb_build_object('listing_id',p_listing_id,'commission',v_commission));

  return query select profiles.catch_coins from profiles where id = auth.uid();
end;
$$ language plpgsql security definer set search_path = public;
revoke all on function rpc_gts_buy(uuid) from public;
grant execute on function rpc_gts_buy(uuid) to authenticated;

create table shop_skus (
  sku text primary key, name text not null, price_cents int not null,
  currency text not null default 'PLN', grants jsonb not null
);
insert into shop_skus(sku,name,price_cents,grants) values
  ('energy-pack-3','3x Flakon Energii',499,'{"energy-bottle":3}'),
  ('energy-crate-10','10x Flakon Energii + 2x Great Ball',1299,'{"energy-bottle":10,"great-ball":2}'),
  ('master-ball-1','Master Ball',999,'{"master-ball":1}')
on conflict (sku) do nothing;

create table orders (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  sku text not null references shop_skus(sku),
  price_cents int not null, currency text not null default 'PLN',
  status text not null default 'pending' check (status in ('pending','paid','failed','cancelled')),
  provider text, provider_ref text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create trigger trg_orders_touch before update on orders for each row execute function fn_touch_updated_at();
alter table orders enable row level security;
create policy p_orders_select_own on orders for select using (auth.uid() = profile_id);

create or replace function rpc_create_order(p_sku text) returns uuid as $$
declare v_sku shop_skus%rowtype; v_order_id uuid;
begin
  select * into v_sku from shop_skus where sku = p_sku;
  if not found then raise exception 'Nieznany produkt'; end if;
  insert into orders(profile_id, sku, price_cents, currency) values (auth.uid(), p_sku, v_sku.price_cents, v_sku.currency)
    returning id into v_order_id;
  return v_order_id;
end;
$$ language plpgsql security definer set search_path = public;
revoke all on function rpc_create_order(text) from public;
grant execute on function rpc_create_order(text) to authenticated;

-- Wywolywana WYLACZNIE przez payment-webhook Edge Function po zweryfikowaniu
-- podpisu callbacku dostawcy (PayU/BLIK) — nigdy bezposrednio z klienta.
create or replace function fn_fulfill_order(p_order_id uuid, p_provider text, p_provider_ref text) returns void as $$
declare v_order orders%rowtype; v_item text; v_qty int;
begin
  select * into v_order from orders where id = p_order_id for update;
  if not found then raise exception 'Zamowienie nie istnieje'; end if;
  if v_order.status = 'paid' then return; end if; -- idempotentne (webhook moze przyjsc 2x)

  update orders set status = 'paid', provider = p_provider, provider_ref = p_provider_ref where id = p_order_id;

  for v_item, v_qty in select key, value::int from jsonb_each_text((select grants from shop_skus where sku = v_order.sku)) loop
    insert into inventory(owner_id,item_slug,quantity) values (v_order.profile_id, v_item, v_qty)
      on conflict (owner_id,item_slug) do update set quantity = inventory.quantity + excluded.quantity;
  end loop;

  insert into transaction_logs(profile_id,kind,delta,balance_after,reason,meta)
    values (v_order.profile_id,'item',0,0,'shop_purchase',jsonb_build_object('order_id',p_order_id,'sku',v_order.sku));
end;
$$ language plpgsql security definer set search_path = public;
revoke all on function fn_fulfill_order(uuid,text,text) from public;
grant execute on function fn_fulfill_order(uuid,text,text) to service_role;

/* ================================================================
   DODATKI: Ranking (publiczny odczyt bez oslabiania RLS profiles) + zarzadzanie
   Druzyna/PC Box — male, ale niezbedne, zeby kafelki menu nie byly puste/fake.
   ================================================================ */
create or replace function rpc_get_ranking(p_limit int default 20)
returns table(id uuid, trainer_name text, trainer_level int, badge_count bigint, featured_badge_name text) as $$
  select p.id, p.trainer_name, p.trainer_level,
    (select count(*) from player_badges pb where pb.profile_id = p.id) as badge_count,
    b.name
  from profiles p left join badges b on b.id = p.featured_badge_id
  order by p.trainer_level desc, badge_count desc
  limit greatest(1, least(p_limit, 100));
$$ language sql security definer set search_path = public stable;
revoke all on function rpc_get_ranking(int) from public;
grant execute on function rpc_get_ranking(int) to authenticated;

create or replace function rpc_set_party_slot(p_pokemon_id uuid, p_slot int) returns void as $$
declare v_owner uuid;
begin
  select owner_id into v_owner from user_pokemon where id = p_pokemon_id;
  if v_owner is null or v_owner <> auth.uid() then raise exception 'Nie jestes wlascicielem tego Pokemona'; end if;
  if p_slot is not null then
    update user_pokemon set party_slot = null where owner_id = auth.uid() and party_slot = p_slot and id <> p_pokemon_id;
  end if;
  update user_pokemon set party_slot = p_slot where id = p_pokemon_id;
end;
$$ language plpgsql security definer set search_path = public;
revoke all on function rpc_set_party_slot(uuid,int) from public;
grant execute on function rpc_set_party_slot(uuid,int) to authenticated;

-- Leczenie druzyny (Pokemon Center) — darmowe i bez limitu (decyzja produktowa
-- 2026-09-06), dlatego prosta funkcja bez licznikow/transaction_logs.
create or replace function rpc_heal_team() returns void as $$
begin
  update user_pokemon set current_hp = max_hp where owner_id = auth.uid() and current_hp < max_hp;
end;
$$ language plpgsql security definer set search_path = public;
revoke all on function rpc_heal_team() from public;
grant execute on function rpc_heal_team() to authenticated;
