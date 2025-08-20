-- Fix: Remove redundant is_available column from events table
-- This column is confusing and redundant with is_availability_block

-- Step 1: Verify the column exists and check for any data
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'events' 
    AND column_name IN ('is_available', 'is_availability_block');

-- Step 2: Check if any events are using the is_available column
SELECT 
    COUNT(*) as total_events,
    COUNT(CASE WHEN is_available = true THEN 1 END) as events_with_is_available_true,
    COUNT(CASE WHEN is_available = false THEN 1 END) as events_with_is_available_false,
    COUNT(CASE WHEN is_availability_block = true THEN 1 END) as blocking_events
FROM events;

-- Step 3: Drop the redundant is_available column
ALTER TABLE events DROP COLUMN IF EXISTS is_available;

-- Step 4: Verify the column is removed
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'events' 
    AND column_name IN ('is_available', 'is_availability_block');

-- Add comment to clarify the remaining column
COMMENT ON COLUMN events.is_availability_block IS 'True if this event blocks availability for bookings. False for informational events.';

SELECT 'Successfully removed redundant is_available column from events table' as result;
