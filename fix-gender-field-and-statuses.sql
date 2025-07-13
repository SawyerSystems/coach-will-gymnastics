-- Fix Gender Field and Status Discrepancies
-- Add gender column to athletes table if it doesn't exist
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS gender text;

-- Update Alfred's booking status to be consistent
UPDATE bookings 
SET status = 'confirmed', 
    attendance_status = 'confirmed'
WHERE athlete1_name = 'Alfred Sawyer' 
  AND lesson_type = 'quick-journey';

-- Verify the changes
SELECT id, lesson_type, athlete1_name, preferred_date, preferred_time, status, attendance_status, payment_status 
FROM bookings 
WHERE athlete1_name = 'Alfred Sawyer';

-- Check athlete data
SELECT id, name, first_name, last_name, date_of_birth, gender, allergies, experience 
FROM athletes 
WHERE name = 'Alfred Sawyer' OR (first_name = 'Alfred' AND last_name = 'Sawyer');