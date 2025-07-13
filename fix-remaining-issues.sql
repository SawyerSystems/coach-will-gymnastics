-- Fix missing used_at column in parent_auth_codes table
ALTER TABLE parent_auth_codes 
ADD COLUMN IF NOT EXISTS used_at TIMESTAMP;

-- Update the schema to ensure all columns exist
DO $$ 
BEGIN
    -- Check if columns exist and add them if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'parent_auth_codes' AND column_name = 'used_at') THEN
        ALTER TABLE parent_auth_codes ADD COLUMN used_at TIMESTAMP;
    END IF;
END $$;

-- Set proper defaults
UPDATE parent_auth_codes SET used_at = NULL WHERE used_at IS NULL AND used = false;