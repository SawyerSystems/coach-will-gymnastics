-- Add missing columns to bookings table if they don't exist
DO $$ 
BEGIN
    -- Add paymentStatus column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'bookings' AND column_name = 'payment_status') THEN
        ALTER TABLE bookings ADD COLUMN payment_status TEXT DEFAULT 'unpaid';
    END IF;
    
    -- Add waiverSignatureName column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'bookings' AND column_name = 'waiver_signature_name') THEN
        ALTER TABLE bookings ADD COLUMN waiver_signature_name TEXT;
    END IF;
    
    -- Add stripeSessionId column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'bookings' AND column_name = 'stripe_session_id') THEN
        ALTER TABLE bookings ADD COLUMN stripe_session_id TEXT;
    END IF;
    
    -- Add paidAmount column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'bookings' AND column_name = 'paid_amount') THEN
        ALTER TABLE bookings ADD COLUMN paid_amount DECIMAL(10, 2) DEFAULT 0.00;
    END IF;
    
    -- Add reservationFeePaid column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'bookings' AND column_name = 'reservation_fee_paid') THEN
        ALTER TABLE bookings ADD COLUMN reservation_fee_paid BOOLEAN DEFAULT false;
    END IF;
    
    -- Add attendanceStatus column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'bookings' AND column_name = 'attendance_status') THEN
        ALTER TABLE bookings ADD COLUMN attendance_status TEXT DEFAULT 'pending';
    END IF;
END $$;

-- Update existing bookings to have proper payment status based on status field
UPDATE bookings 
SET payment_status = CASE 
    WHEN status IN ('paid', 'confirmed', 'completed', 'manual-paid', 'reservation-paid') THEN 'paid'
    WHEN status IN ('cancelled', 'no-show') THEN 'unpaid'
    WHEN status = 'failed' THEN 'failed'
    ELSE 'unpaid'
END
WHERE payment_status IS NULL;

-- Add athlete_name column to waivers table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'waivers' AND column_name = 'athlete_name') THEN
        ALTER TABLE waivers ADD COLUMN athlete_name TEXT;
    END IF;
END $$;

-- Update existing waivers to have athlete_name populated
UPDATE waivers w
SET athlete_name = COALESCE(
    (SELECT a.name FROM athletes a WHERE a.id = w.athlete_id),
    (SELECT b.athlete1_name FROM bookings b WHERE b.id = w.booking_id),
    'Unknown Athlete'
)
WHERE athlete_name IS NULL;

-- Make athlete_name NOT NULL after populating
ALTER TABLE waivers ALTER COLUMN athlete_name SET NOT NULL;