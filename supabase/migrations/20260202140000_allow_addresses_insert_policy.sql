-- Add explicit INSERT policy for addresses
-- Drops any existing policy with the same name then creates it

DROP POLICY IF EXISTS "Users can insert own addresses" ON addresses;

CREATE POLICY "Users can insert own addresses"
  ON addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Note: Run this in your Supabase SQL editor or apply via your migration tooling.
