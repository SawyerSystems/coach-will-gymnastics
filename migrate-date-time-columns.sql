-- PostgreSQL DATE/TIME Migration Script for CoachWillTumbles.com
-- Migrates from TEXT to native DATE and TIME types with Pacific timezone support

-- Enable Pacific timezone for session
SET timezone = 'America/Los_Angeles';

-- 1. Update bookings table: preferred_date and preferred_time
-- First, add new columns with proper types
ALTER TABLE bookings 
ADD COLUMN preferred_date_new DATE,
ADD COLUMN preferred_time_new TIME;

-- Convert existing data, handling Pacific timezone
UPDATE bookings 
SET 
  preferred_date_new = CASE 
    WHEN preferred_date IS NOT NULL AND preferred_date != '' 
    THEN preferred_date::DATE
    ELSE NULL
  END,
  preferred_time_new = CASE 
    WHEN preferred_time IS NOT NULL AND preferred_time != '' 
    THEN preferred_time::TIME
    ELSE NULL
  END;

-- Drop old columns and rename new ones
ALTER TABLE bookings DROP COLUMN preferred_date;
ALTER TABLE bookings DROP COLUMN preferred_time;
ALTER TABLE bookings RENAME COLUMN preferred_date_new TO preferred_date;
ALTER TABLE bookings RENAME COLUMN preferred_time_new TO preferred_time;

-- Set NOT NULL constraints
ALTER TABLE bookings ALTER COLUMN preferred_date SET NOT NULL;
ALTER TABLE bookings ALTER COLUMN preferred_time SET NOT NULL;

-- 2. Update availability table: start_time and end_time  
-- Add new columns
ALTER TABLE availability 
ADD COLUMN start_time_new TIME,
ADD COLUMN end_time_new TIME;

-- Convert existing data
UPDATE availability 
SET 
  start_time_new = CASE 
    WHEN start_time IS NOT NULL AND start_time != '' 
    THEN start_time::TIME
    ELSE NULL
  END,
  end_time_new = CASE 
    WHEN end_time IS NOT NULL AND end_time != '' 
    THEN end_time::TIME
    ELSE NULL
  END;

-- Drop old columns and rename new ones
ALTER TABLE availability DROP COLUMN start_time;
ALTER TABLE availability DROP COLUMN end_time;
ALTER TABLE availability RENAME COLUMN start_time_new TO start_time;
ALTER TABLE availability RENAME COLUMN end_time_new TO end_time;

-- Set NOT NULL constraints
ALTER TABLE availability ALTER COLUMN start_time SET NOT NULL;
ALTER TABLE availability ALTER COLUMN end_time SET NOT NULL;

-- 3. Update availability_exceptions table: date, start_time, and end_time
-- Add new columns
ALTER TABLE availability_exceptions 
ADD COLUMN date_new DATE,
ADD COLUMN start_time_new TIME,
ADD COLUMN end_time_new TIME;

-- Convert existing data
UPDATE availability_exceptions 
SET 
  date_new = CASE 
    WHEN date IS NOT NULL AND date != '' 
    THEN date::DATE
    ELSE NULL
  END,
  start_time_new = CASE 
    WHEN start_time IS NOT NULL AND start_time != '' 
    THEN start_time::TIME
    ELSE NULL
  END,
  end_time_new = CASE 
    WHEN end_time IS NOT NULL AND end_time != '' 
    THEN end_time::TIME
    ELSE NULL
  END;

-- Drop old columns and rename new ones
ALTER TABLE availability_exceptions DROP COLUMN date;
ALTER TABLE availability_exceptions DROP COLUMN start_time;
ALTER TABLE availability_exceptions DROP COLUMN end_time;
ALTER TABLE availability_exceptions RENAME COLUMN date_new TO date;
ALTER TABLE availability_exceptions RENAME COLUMN start_time_new TO start_time;
ALTER TABLE availability_exceptions RENAME COLUMN end_time_new TO end_time;

-- Set NOT NULL constraints
ALTER TABLE availability_exceptions ALTER COLUMN date SET NOT NULL;
ALTER TABLE availability_exceptions ALTER COLUMN start_time SET NOT NULL;
ALTER TABLE availability_exceptions ALTER COLUMN end_time SET NOT NULL;

-- 4. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_preferred_date ON bookings(preferred_date);
CREATE INDEX IF NOT EXISTS idx_bookings_preferred_time ON bookings(preferred_time);
CREATE INDEX IF NOT EXISTS idx_availability_day_time ON availability(day_of_week, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_availability_exceptions_date ON availability_exceptions(date);

-- 5. Verify migration results
SELECT 'bookings' as table_name, 
       COUNT(*) as total_rows,
       COUNT(preferred_date) as date_count,
       COUNT(preferred_time) as time_count
FROM bookings
UNION ALL
SELECT 'availability' as table_name, 
       COUNT(*) as total_rows,
       COUNT(start_time) as start_time_count,
       COUNT(end_time) as end_time_count
FROM availability
UNION ALL
SELECT 'availability_exceptions' as table_name, 
       COUNT(*) as total_rows,
       COUNT(date) as date_count,
       COUNT(start_time) || '/' || COUNT(end_time) as time_counts
FROM availability_exceptions;

-- Display sample data to verify conversion
SELECT 'Sample booking data:' as info;
SELECT id, preferred_date, preferred_time, lesson_type, parent_email 
FROM bookings 
ORDER BY created_at DESC 
LIMIT 3;

SELECT 'Sample availability data:' as info;
SELECT id, day_of_week, start_time, end_time, is_available 
FROM availability 
ORDER BY id 
LIMIT 3;

SELECT 'Sample exceptions data:' as info;
SELECT id, date, start_time, end_time, reason 
FROM availability_exceptions 
ORDER BY date DESC 
LIMIT 3;