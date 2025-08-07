-- Add key_points array and reservation_fee field to lesson_types table
-- This migration assumes lesson_types table already exists

-- Add reservation_fee column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'lesson_types' 
                    AND column_name = 'reservation_fee') 
    THEN
        ALTER TABLE lesson_types ADD COLUMN reservation_fee DECIMAL(10,2) NOT NULL DEFAULT 0;
        RAISE NOTICE 'Added reservation_fee column to lesson_types table';
    ELSE
        RAISE NOTICE 'reservation_fee column already exists in lesson_types table';
    END IF;
END $$;

-- Add key_points column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'lesson_types' 
                    AND column_name = 'key_points') 
    THEN
        ALTER TABLE lesson_types ADD COLUMN key_points JSONB DEFAULT '[]'::JSONB;
        RAISE NOTICE 'Added key_points column to lesson_types table';
    ELSE
        RAISE NOTICE 'key_points column already exists in lesson_types table';
    END IF;
END $$;
