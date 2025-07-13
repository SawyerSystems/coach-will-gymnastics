-- Fix normalization table schema by adding missing columns
-- This script adds missing columns to existing tables

-- Add missing columns to apparatus table
ALTER TABLE apparatus ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE apparatus ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL;

-- Add missing columns to focus_areas table  
ALTER TABLE focus_areas ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE focus_areas ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL;

-- Add missing columns to side_quests table
ALTER TABLE side_quests ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE side_quests ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL;

-- Verify table structures
SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name IN ('apparatus', 'focus_areas', 'side_quests')
ORDER BY table_name, ordinal_position;