CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  userid uuid;
BEGIN
  -- Get the user ID of the authenticated user
  userid := auth.uid();
  
  IF userid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Delete user's data
  DELETE FROM user_settings WHERE user_id = userid;
  DELETE FROM links WHERE user_id = userid;
  
  -- Delete the user from auth.users
  DELETE FROM auth.users WHERE id = userid;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user() TO authenticated;
