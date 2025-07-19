-- Fix Production Database Schema Issues
-- Run this in your Supabase SQL Editor

-- 1. Check current admins table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'admins' 
ORDER BY ordinal_position;

-- 2. Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'admins' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE admins ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
    
    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'admins' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE admins ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
    
    -- Update existing records with timestamps if they're null
    UPDATE admins 
    SET created_at = NOW() 
    WHERE created_at IS NULL;
    
    UPDATE admins 
    SET updated_at = NOW() 
    WHERE updated_at IS NULL;
END $$;

-- 3. Verify the admin table structure
SELECT 
    id,
    email,
    created_at,
    updated_at,
    CASE WHEN password_hash IS NOT NULL THEN 'SET' ELSE 'NULL' END as password_status
FROM admins;

-- 4. Ensure RLS is properly configured
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- 5. Create policy to allow service role access (if needed)
DROP POLICY IF EXISTS "Allow service role full access" ON admins;
CREATE POLICY "Allow service role full access" ON admins
    FOR ALL USING (auth.role() = 'service_role');

SELECT 'Schema fix completed successfully' as result;
