-- Add availability blocking fields to events table
-- Run this SQL in Supabase after the initial events table creation

ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS is_availability_block boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS blocking_reason text;

-- Add index for availability block queries
CREATE INDEX IF NOT EXISTS events_is_availability_block_idx ON public.events (is_availability_block);

-- Comments for clarity
COMMENT ON COLUMN public.events.is_availability_block IS 'Whether this event blocks availability for booking lessons';
COMMENT ON COLUMN public.events.blocking_reason IS 'Reason for blocking availability (e.g., "Team Practice", "Vacation")';
