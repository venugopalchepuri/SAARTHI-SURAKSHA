/*
  # Fix RLS policies for profiles table
  
  1. Security
    - Enable RLS on profiles table
    - Add policy for users to insert their own profile
    - Add policy for users to update their own profile
    - Add policy for users to read their own trips
    - Add policy for users to insert their own trips
*/

-- Enable RLS on profiles table
alter table profiles enable row level security;

-- Allow users to read their own profile
create policy "Users can read own profile"
  on profiles for select
  using (auth.uid() = id);

-- Allow users to insert their own profile
create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- Allow users to update their own profile
create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Enable RLS on trips table  
alter table trips enable row level security;

-- Allow users to read their own trips
create policy "Users can read own trips"
  on trips for select
  using (auth.uid() = user_id);

-- Allow users to insert their own trips
create policy "Users can insert own trips"
  on trips for insert
  with check (auth.uid() = user_id);

-- Allow users to update their own trips
create policy "Users can update own trips"
  on trips for update
  using (auth.uid() = user_id);