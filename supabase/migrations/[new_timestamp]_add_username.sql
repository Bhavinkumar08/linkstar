ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS username text;

-- Create function to handle user deletion
CREATE OR REPLACE FUNCTION handle_delete_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete user's settings
  DELETE FROM user_settings WHERE user_id = OLD.id;
  -- Delete user's links
  DELETE FROM links WHERE user_id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user deletion
DROP TRIGGER IF EXISTS on_user_deleted ON auth.users;
CREATE TRIGGER on_user_deleted
  BEFORE DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_delete_user();
