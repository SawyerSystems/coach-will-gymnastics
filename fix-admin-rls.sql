-- Complete Supabase Setup SQL
-- Run this in Supabase SQL Editor to set up tables and proper RLS policies

-- 1. Enable RLS on admins table (critical for admin creation)
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- 2. Create optimized RLS policies for all tables
-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Service role can manage admins" ON public.admins;
DROP POLICY IF EXISTS "Service role can manage parents" ON public.parents;
DROP POLICY IF EXISTS "Service role can manage athletes" ON public.athletes;
DROP POLICY IF EXISTS "Service role can manage bookings" ON public.bookings;

-- Create optimized policies (using subqueries for better performance)
CREATE POLICY "Service role can manage admins" ON public.admins 
  FOR ALL USING ((SELECT auth.role()) = 'service_role');

CREATE POLICY "Service role can manage parents" ON public.parents 
  FOR ALL USING ((SELECT auth.role()) = 'service_role');

CREATE POLICY "Service role can manage athletes" ON public.athletes 
  FOR ALL USING ((SELECT auth.role()) = 'service_role');

CREATE POLICY "Service role can manage bookings" ON public.bookings 
  FOR ALL USING ((SELECT auth.role()) = 'service_role');

-- 3. Add critical performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_parent_id ON public.bookings(parent_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_athletes_gender ON public.athletes(gender);

-- 4. Verify setup
SELECT 
  schemaname, 
  tablename, 
  rowsecurity,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = t.tablename) as policy_count
FROM pg_tables t 
WHERE schemaname = 'public' 
  AND tablename IN ('admins', 'parents', 'athletes', 'bookings')
ORDER BY tablename;
