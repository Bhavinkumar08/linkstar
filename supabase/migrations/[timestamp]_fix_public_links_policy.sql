-- First, drop existing policies
DROP POLICY IF EXISTS "Users can read own links and public links" ON links;
DROP POLICY IF EXISTS "Anyone can read public links" ON links;
DROP POLICY IF EXISTS "Authenticated users can read public links and own links" ON links;

-- Create new policy with simpler conditions
CREATE POLICY "read_links_policy"
  ON links
  FOR SELECT
  USING (
    auth.uid() = user_id OR is_public = true
  );
