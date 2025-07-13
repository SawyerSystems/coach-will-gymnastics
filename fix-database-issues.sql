-- Fix parent_auth_codes table
ALTER TABLE parent_auth_codes 
ADD COLUMN IF NOT EXISTS used_at timestamptz;

-- Create athletes from existing bookings
INSERT INTO athletes (parent_id, name, first_name, last_name, date_of_birth, experience, allergies, photo_url, notes, created_at, updated_at)
SELECT DISTINCT ON (b.athlete1_name, b.athlete1_date_of_birth)
  p.id as parent_id,
  b.athlete1_name as name,
  SPLIT_PART(b.athlete1_name, ' ', 1) as first_name,
  SUBSTRING(b.athlete1_name FROM POSITION(' ' IN b.athlete1_name) + 1) as last_name,
  b.athlete1_date_of_birth as date_of_birth,
  b.athlete1_experience as experience,
  b.athlete1_allergies as allergies,
  NULL as photo_url,
  NULL as notes,
  NOW() as created_at,
  NOW() as updated_at
FROM bookings b
JOIN parents p ON p.email = b.parent_email AND p.phone = b.parent_phone
WHERE b.athlete1_name IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM athletes a 
    WHERE a.name = b.athlete1_name 
    AND a.date_of_birth = b.athlete1_date_of_birth
    AND a.parent_id = p.id
  );

-- Also create second athletes if they exist
INSERT INTO athletes (parent_id, name, first_name, last_name, date_of_birth, experience, allergies, photo_url, notes, created_at, updated_at)
SELECT DISTINCT ON (b.athlete2_name, b.athlete2_date_of_birth)
  p.id as parent_id,
  b.athlete2_name as name,
  SPLIT_PART(b.athlete2_name, ' ', 1) as first_name,
  SUBSTRING(b.athlete2_name FROM POSITION(' ' IN b.athlete2_name) + 1) as last_name,
  b.athlete2_date_of_birth as date_of_birth,
  b.athlete2_experience as experience,
  b.athlete2_allergies as allergies,
  NULL as photo_url,
  NULL as notes,
  NOW() as created_at,
  NOW() as updated_at
FROM bookings b
JOIN parents p ON p.email = b.parent_email AND p.phone = b.parent_phone
WHERE b.athlete2_name IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM athletes a 
    WHERE a.name = b.athlete2_name 
    AND a.date_of_birth = b.athlete2_date_of_birth
    AND a.parent_id = p.id
  );