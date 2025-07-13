-- Migration script to add PostgreSQL enum types for booking statuses
-- Run this against your Supabase database

-- Create the enum types
CREATE TYPE booking_status AS ENUM (
  'pending', 
  'paid', 
  'confirmed', 
  'manual', 
  'manual-paid', 
  'completed', 
  'no-show', 
  'failed', 
  'cancelled', 
  'reservation-pending', 
  'reservation-paid', 
  'reservation-failed'
);

CREATE TYPE payment_status AS ENUM (
  'unpaid', 
  'paid', 
  'failed', 
  'refunded', 
  'reservation-pending', 
  'reservation-paid', 
  'reservation-failed', 
  'session-paid', 
  'reservation-refunded', 
  'session-refunded'
);

CREATE TYPE attendance_status AS ENUM (
  'pending', 
  'confirmed', 
  'completed', 
  'cancelled', 
  'no-show', 
  'manual'
);

-- Update the bookings table to use enum types
-- Step 1: Add new columns with enum types
ALTER TABLE bookings 
ADD COLUMN status_new booking_status DEFAULT 'pending',
ADD COLUMN payment_status_new payment_status DEFAULT 'unpaid',
ADD COLUMN attendance_status_new attendance_status DEFAULT 'pending';

-- Step 2: Copy data from old text columns to new enum columns
UPDATE bookings SET 
  status_new = CASE 
    WHEN status = 'pending' THEN 'pending'::booking_status
    WHEN status = 'paid' THEN 'paid'::booking_status
    WHEN status = 'confirmed' THEN 'confirmed'::booking_status
    WHEN status = 'manual' THEN 'manual'::booking_status
    WHEN status = 'manual-paid' THEN 'manual-paid'::booking_status
    WHEN status = 'completed' THEN 'completed'::booking_status
    WHEN status = 'no-show' THEN 'no-show'::booking_status
    WHEN status = 'failed' THEN 'failed'::booking_status
    WHEN status = 'cancelled' THEN 'cancelled'::booking_status
    WHEN status = 'reservation-pending' THEN 'reservation-pending'::booking_status
    WHEN status = 'reservation-paid' THEN 'reservation-paid'::booking_status
    WHEN status = 'reservation-failed' THEN 'reservation-failed'::booking_status
    ELSE 'pending'::booking_status
  END,
  payment_status_new = CASE 
    WHEN payment_status = 'unpaid' THEN 'unpaid'::payment_status
    WHEN payment_status = 'paid' THEN 'paid'::payment_status
    WHEN payment_status = 'failed' THEN 'failed'::payment_status
    WHEN payment_status = 'refunded' THEN 'refunded'::payment_status
    WHEN payment_status = 'reservation-pending' THEN 'reservation-pending'::payment_status
    WHEN payment_status = 'reservation-paid' THEN 'reservation-paid'::payment_status
    WHEN payment_status = 'reservation-failed' THEN 'reservation-failed'::payment_status
    WHEN payment_status = 'session-paid' THEN 'session-paid'::payment_status
    WHEN payment_status = 'reservation-refunded' THEN 'reservation-refunded'::payment_status
    WHEN payment_status = 'session-refunded' THEN 'session-refunded'::payment_status
    ELSE 'unpaid'::payment_status
  END,
  attendance_status_new = CASE 
    WHEN attendance_status = 'pending' THEN 'pending'::attendance_status
    WHEN attendance_status = 'confirmed' THEN 'confirmed'::attendance_status
    WHEN attendance_status = 'completed' THEN 'completed'::attendance_status
    WHEN attendance_status = 'cancelled' THEN 'cancelled'::attendance_status
    WHEN attendance_status = 'no-show' THEN 'no-show'::attendance_status
    WHEN attendance_status = 'manual' THEN 'manual'::attendance_status
    ELSE 'pending'::attendance_status
  END;

-- Step 3: Drop old columns and rename new ones
ALTER TABLE bookings DROP COLUMN status;
ALTER TABLE bookings RENAME COLUMN status_new TO status;

ALTER TABLE bookings DROP COLUMN payment_status;
ALTER TABLE bookings RENAME COLUMN payment_status_new TO payment_status;

ALTER TABLE bookings DROP COLUMN attendance_status;
ALTER TABLE bookings RENAME COLUMN attendance_status_new TO attendance_status;

-- Step 4: Set NOT NULL constraints and defaults
ALTER TABLE bookings 
ALTER COLUMN status SET NOT NULL,
ALTER COLUMN status SET DEFAULT 'pending',
ALTER COLUMN payment_status SET NOT NULL,
ALTER COLUMN payment_status SET DEFAULT 'unpaid',
ALTER COLUMN attendance_status SET NOT NULL,
ALTER COLUMN attendance_status SET DEFAULT 'pending';

-- Verify the migration
SELECT 
  id, 
  status, 
  payment_status, 
  attendance_status,
  created_at
FROM bookings 
ORDER BY id 
LIMIT 5;

-- Show enum types
SELECT enumlabel FROM pg_enum WHERE enumtypid = 'booking_status'::regtype ORDER BY enumsortorder;
SELECT enumlabel FROM pg_enum WHERE enumtypid = 'payment_status'::regtype ORDER BY enumsortorder;
SELECT enumlabel FROM pg_enum WHERE enumtypid = 'attendance_status'::regtype ORDER BY enumsortorder;