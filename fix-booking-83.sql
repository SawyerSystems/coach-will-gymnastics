-- Direct SQL fix for booking 83

BEGIN;

-- Update booking with correct payment information
UPDATE bookings 
SET 
  payment_status = 'reservation-paid',
  attendance_status = 'confirmed',
  paid_amount = '0.50',
  reservation_fee_paid = true,
  athlete1_name = 'Alfred S.',
  parent_id = 49,
  updated_at = NOW()
WHERE id = 83;

-- Create booking-athlete relationship if it doesn't exist
INSERT INTO booking_athletes (booking_id, athlete_id)
SELECT 83, 66
WHERE NOT EXISTS (
  SELECT 1 FROM booking_athletes 
  WHERE booking_id = 83 AND athlete_id = 66
);

-- Verify the updates
SELECT 
  id,
  lesson_type,
  athlete1_name,
  paid_amount,
  payment_status,
  attendance_status,
  parent_id,
  stripe_session_id
FROM bookings 
WHERE id = 83;

-- Check the booking-athlete relationship
SELECT 
  ba.booking_id,
  ba.athlete_id,
  a.name as athlete_name,
  a.parent_id
FROM booking_athletes ba
JOIN athletes a ON ba.athlete_id = a.id
WHERE ba.booking_id = 83;

COMMIT;
