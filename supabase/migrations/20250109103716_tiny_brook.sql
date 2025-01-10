/*
  # Create links schema

  1. New Tables
    - `links`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text)
      - `url` (text)
      - `description` (text)
      - `tags` (text array)
      - `is_public` (boolean)
      - `is_starred` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `links` table
    - Add policies for CRUD operations
*/

CREATE TABLE IF NOT EXISTS links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  name text NOT NULL,
  url text NOT NULL,
  description text,
  tags text[] DEFAULT '{}',
  is_public boolean DEFAULT false,
  is_starred boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE links ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own links and public links
CREATE POLICY "Users can read own links and public links"
  ON links
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR is_public = true
  );

-- Policy: Users can insert their own links
CREATE POLICY "Users can insert own links"
  ON links
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own links
CREATE POLICY "Users can update own links"
  ON links
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own links
CREATE POLICY "Users can delete own links"
  ON links
  FOR DELETE
  USING (auth.uid() = user_id);