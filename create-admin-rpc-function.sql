-- SQL commands to create admin creation RPC function in Supabase
-- This function runs with SECURITY DEFINER which bypasses RLS

-- Create a function to create admin accounts
CREATE OR REPLACE FUNCTION create_admin_account(
  admin_email TEXT,
  admin_password_hash TEXT
) RETURNS TABLE(id BIGINT, email TEXT, created_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER -- This allows the function to bypass RLS
AS $$
BEGIN
  -- Insert the admin account, ignore if already exists
  INSERT INTO admins (email, password_hash, created_at, updated_at)
  VALUES (admin_email, admin_password_hash, NOW(), NOW())
  ON CONFLICT (email) DO NOTHING;
  
  -- Return the admin record
  RETURN QUERY 
  SELECT a.id, a.email, a.created_at 
  FROM admins a 
  WHERE a.email = admin_email;
END;
$$;

-- Grant execute permission to anon and authenticated users
GRANT EXECUTE ON FUNCTION create_admin_account(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION create_admin_account(TEXT, TEXT) TO authenticated;

-- Create a function to check if any admins exist
CREATE OR REPLACE FUNCTION admin_exists() RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS(SELECT 1 FROM admins LIMIT 1);
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION admin_exists() TO anon;
GRANT EXECUTE ON FUNCTION admin_exists() TO authenticated;

-- Verify the functions were created
SELECT 
  p.proname as function_name,
  p.prosecdef as security_definer
FROM pg_proc p
WHERE p.proname IN ('create_admin_account', 'admin_exists');
