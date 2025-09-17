/*
  # Create Share Tokens Table

  1. New Table: share_tokens
    - id (uuid, primary key)
    - trip_id (uuid, foreign key to trips.id)
    - token (text, unique)
    - created_at (timestamptz)
    - expires_at (timestamptz, optional)

  2. Security
    - Enable RLS
    - Add policy for users to manage their own share tokens
*/

CREATE TABLE IF NOT EXISTS share_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  token text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  expires_at timestamptz DEFAULT (now() + interval '7 days')
);

-- Enable RLS
ALTER TABLE share_tokens ENABLE ROW LEVEL SECURITY;

-- Users can manage share tokens for their own trips
CREATE POLICY "Users can manage own share tokens"
  ON share_tokens
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips 
      WHERE trips.id = share_tokens.trip_id 
      AND trips.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips 
      WHERE trips.id = share_tokens.trip_id 
      AND trips.user_id = auth.uid()
    )
  );

-- Public can read valid share tokens (for share pages)
CREATE POLICY "Public can read valid share tokens"
  ON share_tokens
  FOR SELECT
  TO anon
  USING (expires_at > now());

-- Add index for token lookups
CREATE INDEX IF NOT EXISTS share_tokens_token_idx ON share_tokens(token);
CREATE INDEX IF NOT EXISTS share_tokens_trip_id_idx ON share_tokens(trip_id);