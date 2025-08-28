-- Create athletes_with_waiver_status view for parent portal waiver management
-- This view combines athlete data with their latest waiver information

CREATE OR REPLACE VIEW public.athletes_with_waiver_status AS
SELECT 
    -- Athlete fields
    a.id,
    a.parent_id,
    a.name,
    a.first_name,
    a.last_name,
    a.date_of_birth,
    a.experience,
    a.allergies,
    a.created_at,
    a.updated_at,
    
    -- Waiver status computation
    CASE 
        WHEN w.id IS NOT NULL AND w.signed_at IS NOT NULL THEN 'signed'
        ELSE 'not_signed'
    END AS computed_waiver_status,
    
    CASE 
        WHEN w.id IS NOT NULL AND w.signed_at IS NOT NULL THEN 'signed'
        ELSE 'not_signed'
    END AS athlete_waiver_status,
    
    CASE 
        WHEN w.id IS NOT NULL AND w.signed_at IS NOT NULL THEN 'signed'
        ELSE 'not_signed'
    END AS waiver_status,
    
    -- Latest waiver data (if exists)
    w.id AS latest_waiver_id,
    w.signed_at AS waiver_signed_at,
    w.signature AS waiver_signature_id,
    w.signature AS waiver_signature_data,
    w.created_at AS waiver_created_at
    
FROM athletes a
LEFT JOIN LATERAL (
    SELECT *
    FROM waivers 
    WHERE athlete_id = a.id 
    ORDER BY created_at DESC 
    LIMIT 1
) w ON true;

-- Enable RLS on the view
ALTER VIEW public.athletes_with_waiver_status ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for the view to allow parents to see their own athletes
CREATE POLICY "Parents can view their own athletes waiver status" ON public.athletes_with_waiver_status
    FOR SELECT
    USING (parent_id = auth.uid()::text::integer);
