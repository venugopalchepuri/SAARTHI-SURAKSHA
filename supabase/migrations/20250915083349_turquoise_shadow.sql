/*
  # Saarthi Suraksha Database Schema

  1. Tables Created:
    - `profiles` - User profiles with roles (TOURIST, POLICE, TOURISM)
    - `trips` - Tourist trip information with itinerary and emergency contacts
    - `locations` - Real-time GPS location tracking
    - `alerts` - Emergency alerts (PANIC, GEOFENCE, ANOMALY)
    - `geofences` - Geographic boundaries with risk levels
    - `police_units` - Police station locations and contact info
    - `diary` - Digital safety diary entries
    - `rewards` - Safety rewards and discount codes
    - `volunteers` - Community guardian network
    - `guardian_notifications` - SOS notifications to volunteers
    - `places` - Must-visit places with PostGIS geometry

  2. Security:
    - Enable RLS on all user-facing tables
    - Policies for user data access and authority permissions
    - Realtime subscriptions enabled for locations and alerts

  3. Seed Data:
    - Sample geofences near Bennett University
    - Police units in Greater Noida area
    - Must-visit places (restaurants, shops, tourist spots)
*/

-- Enable required extensions
create extension if not exists postgis;
create extension if not exists pgcrypto;

-- User profiles
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text check (role in ('TOURIST','POLICE','TOURISM')) default 'TOURIST',
  lang text default 'en',
  created_at timestamptz default now()
);

-- Trip management
create table if not exists trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  itinerary jsonb not null,
  emergency jsonb not null,
  safety_score int default 100,
  vc_hash text,
  valid_from timestamptz not null,
  valid_to timestamptz not null,
  created_at timestamptz default now()
);

-- Location tracking
create table if not exists locations (
  id bigint generated always as identity primary key,
  trip_id uuid references trips(id) on delete cascade,
  lat double precision not null,
  lng double precision not null,
  speed_kmh double precision,
  accuracy_m double precision,
  captured_at timestamptz default now()
);

-- Emergency alerts
create table if not exists alerts (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips(id) on delete cascade,
  type text check (type in ('PANIC','GEOFENCE','ANOMALY')) not null,
  status text check (status in ('OPEN','ACK','RESOLVED')) default 'OPEN',
  details jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Geographic boundaries
create table if not exists geofences (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  risk text check (risk in ('LOW','MED','HIGH')) not null,
  polygon geometry(Polygon,4326) not null,
  created_at timestamptz default now()
);

-- Police stations
create table if not exists police_units (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  phone text,
  coord geography(Point,4326),
  radius_km double precision default 5
);

-- Safety diary
create table if not exists diary (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips(id) on delete cascade,
  entry text not null,
  created_at timestamptz default now()
);

-- Rewards system
create table if not exists rewards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  code text,
  unlocked_at timestamptz default now()
);

-- Community guardians
create table if not exists volunteers (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text,
  coord geography(Point,4326)
);

-- Guardian notifications
create table if not exists guardian_notifications (
  id uuid primary key default gen_random_uuid(),
  alert_id uuid references alerts(id) on delete cascade,
  volunteer_id uuid references volunteers(id) on delete cascade,
  created_at timestamptz default now()
);

-- Must-visit places
create table if not exists places (
  id uuid primary key default gen_random_uuid(),
  name text,
  kind text check (kind in ('eat','shop','spot')),
  rating numeric,
  geom geography(Point,4326) not null
);

-- Enable realtime
alter publication supabase_realtime add table locations, alerts;

-- Enable RLS
alter table profiles enable row level security;
alter table trips enable row level security;
alter table locations enable row level security;
alter table alerts enable row level security;
alter table diary enable row level security;
alter table rewards enable row level security;

-- RLS Policies
create policy "Users can read own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can read own trips"
  on trips for select
  using (auth.uid() = user_id);

create policy "Users can insert own trips"
  on trips for insert
  with check (auth.uid() = user_id);

create policy "Users can read own locations"
  on locations for select
  using (exists (select 1 from trips t where t.id = trip_id and t.user_id = auth.uid()));

create policy "Users can insert own locations"
  on locations for insert
  with check (exists (select 1 from trips t where t.id = trip_id and t.user_id = auth.uid()));

create policy "Users can read own alerts"
  on alerts for select
  using (exists (select 1 from trips t where t.id = trip_id and t.user_id = auth.uid()));

create policy "Authorities can read all alerts"
  on alerts for select
  using (exists (
    select 1 from profiles p 
    where p.id = auth.uid() 
    and p.role in ('POLICE','TOURISM')
  ));

create policy "Users can insert alerts for own trips"
  on alerts for insert
  with check (exists (select 1 from trips t where t.id = trip_id and t.user_id = auth.uid()));

-- Seed geofences near Bennett University
insert into geofences (name, risk, polygon) values
(
  'Restricted Forest Track',
  'HIGH',
  ST_GeomFromText('POLYGON((77.58 28.45, 77.59 28.45, 77.59 28.46, 77.58 28.46, 77.58 28.45))', 4326)
),
(
  'Cliff Zone',
  'MED',
  ST_GeomFromText('POLYGON((77.575 28.445, 77.583 28.445, 77.583 28.453, 77.575 28.453, 77.575 28.445))', 4326)
);

-- Seed police units
insert into police_units (name, email, phone, coord, radius_km) values
(
  'Knowledge Park Police Station',
  'ps.kp@uppolice.gov.in',
  '+91-120-2345678',
  ST_GeogFromText('POINT(77.579 28.449)'),
  5
),
(
  'Pari Chowk Police Station',
  'ps.pc@uppolice.gov.in',
  '+91-120-2345679',
  ST_GeogFromText('POINT(77.507 28.474)'),
  6
);

-- Seed must-visit places near Bennett University
insert into places (name, kind, rating, geom) values
('Chaat Corner', 'eat', 4.4, ST_GeogFromText('POINT(77.582 28.451)')),
('Punjabi Dhaba', 'eat', 4.2, ST_GeogFromText('POINT(77.584 28.447)')),
('Coffee Culture', 'eat', 4.0, ST_GeogFromText('POINT(77.580 28.453)')),
('Bazaar Lane', 'shop', 4.1, ST_GeogFromText('POINT(77.586 28.448)')),
('Tech Plaza', 'shop', 3.9, ST_GeogFromText('POINT(77.578 28.450)')),
('Student Market', 'shop', 4.3, ST_GeogFromText('POINT(77.583 28.449)')),
('Sunset Point', 'spot', 4.8, ST_GeogFromText('POINT(77.571 28.455)')),
('Knowledge Park Lake', 'spot', 4.5, ST_GeogFromText('POINT(77.590 28.440)')),
('Heritage Garden', 'spot', 4.6, ST_GeogFromText('POINT(77.575 28.460)'));

-- Seed volunteers for community guardian network
insert into volunteers (name, phone, coord) values
('Rajesh Kumar', '+91-9876543210', ST_GeogFromText('POINT(77.580 28.451)')),
('Priya Sharma', '+91-9876543211', ST_GeogFromText('POINT(77.578 28.448)')),
('Amit Singh', '+91-9876543212', ST_GeogFromText('POINT(77.585 28.452)'));