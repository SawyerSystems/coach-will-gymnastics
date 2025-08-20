-- Migration: Copy availability_exceptions to events table
-- This migrates existing blocking data to the unified events model

-- First, apply the schema changes
-- (Run add-availability-blocking-to-events.sql first)

-- Copy all availability_exceptions as blocking events
INSERT INTO events (
  id,
  series_id,
  title,
  notes,
  location,
  is_all_day,
  timezone,
  start_at,
  end_at,
  is_availability_block,
  blocking_reason,
  is_available,
  is_deleted,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid() as id,
  gen_random_uuid() as series_id,
  COALESCE(title, 'Availability Block') as title,
  notes,
  CASE 
    WHEN address_line_1 IS NOT NULL THEN 
      CONCAT_WS(', ', address_line_1, address_line_2, city, state, zip_code)
    ELSE NULL 
  END as location,
  all_day as is_all_day,
  'America/Los_Angeles' as timezone,
  -- Convert date + time to timestamp with timezone
  CASE 
    WHEN all_day OR start_time IS NULL THEN 
      (date || 'T00:00:00-08:00')::timestamptz
    ELSE
      (date || 'T' || start_time || ':00-08:00')::timestamptz
  END as start_at,
  CASE 
    WHEN all_day OR end_time IS NULL THEN 
      (date || 'T23:59:59-08:00')::timestamptz
    ELSE
      (date || 'T' || end_time || ':00-08:00')::timestamptz
  END as end_at,
  true as is_availability_block,
  reason as blocking_reason,
  is_available,
  false as is_deleted,
  created_at,
  NOW() as updated_at
FROM availability_exceptions
WHERE NOT EXISTS (
  -- Avoid duplicates if script is run multiple times
  SELECT 1 FROM events 
  WHERE events.is_availability_block = true 
  AND events.blocking_reason = availability_exceptions.reason
  AND DATE(events.start_at AT TIME ZONE 'America/Los_Angeles') = availability_exceptions.date
);

-- Add comment about the migration
COMMENT ON TABLE events IS 'Unified events and availability blocking table. Replaces availability_exceptions after migration.';

-- Show migration results
SELECT 
  'Migrated' as status,
  COUNT(*) as count,
  'availability exceptions copied to events table' as description
FROM events 
WHERE is_availability_block = true;

-- Show what will be in the events table after migration
SELECT 
  COUNT(*) as total_events,
  COUNT(*) FILTER (WHERE is_availability_block = true) as blocking_events,
  COUNT(*) FILTER (WHERE is_availability_block = false) as regular_events,
  COUNT(*) FILTER (WHERE recurrence_rule IS NOT NULL) as recurring_events
FROM events 
WHERE is_deleted = false;
