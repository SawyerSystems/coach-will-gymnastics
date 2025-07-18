-- Fix Row Level Security for admins table
-- Run this in Supabase SQL Editor to allow admin account creation

-- Disable RLS on admins table to allow unrestricted access
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;

-- Alternatively, if you prefer to keep RLS enabled with a permissive policy:
-- ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all operations on admins" ON admins FOR ALL USING (true) WITH CHECK (true);

-- Verify the change
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'admins' AND schemaname = 'public';
