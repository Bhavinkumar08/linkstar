-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can read public links and own links" ON links;
DROP POLICY IF EXISTS "Users can read own links and public links" ON links;
DROP POLICY IF EXISTS "Anyone can read public links" ON links;

-- Create new policy for anyone to read public links and their own links
CREATE POLICY "Anyone can read public or own links"
  ON links
  FOR SELECT
  USING (
    is_public = true
    OR auth.uid() = user_id
  );

-- Keep existing policies for insert, update, and delete
