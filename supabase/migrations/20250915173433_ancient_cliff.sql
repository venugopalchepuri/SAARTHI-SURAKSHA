/*
  # Add Foreign Key Constraint Between Trips and Profiles

  1. Foreign Key Constraint
    - Add foreign key constraint linking trips.user_id to profiles.id
    - This enables PostgREST to automatically infer the relationship for joins

  2. Index
    - Add index on trips.user_id for better query performance
*/

-- Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'trips_user_id_fkey' 
    AND table_name = 'trips'
  ) THEN
    ALTER TABLE trips 
    ADD CONSTRAINT trips_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS trips_user_id_idx ON trips(user_id);