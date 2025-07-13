-- COMPLETE MIGRATION TO NORMALIZED SCHEMA
---- Step 6: Populate apparatus table
INSERT INTO apparatus (name, sort_order) VALUES
('Tumbling', 1),
('Vault', 2),
('Bars', 3),
('Beam', 4),
('Conditioning', 5),
('Trampoline', 6)
ON CONFLICT (name) DO NOTHING;l migrate your existing data and update the schema

-- Step 1: Add new columns to bookings table for the new schema
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS parent_id INTEGER REFERENCES parents(id);

-- Step 2: Create booking_athletes junction table
CREATE TABLE IF NOT EXISTS booking_athletes (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  athlete_id INTEGER NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  slot_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 3: Create apparatus and focus areas tables if they don't exist
CREATE TABLE IF NOT EXISTS apparatus (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS focus_areas (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  apparatus_id INTEGER REFERENCES apparatus(id),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 4: Create junction tables for new normalized data
CREATE TABLE IF NOT EXISTS booking_apparatus (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  apparatus_id INTEGER NOT NULL REFERENCES apparatus(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS booking_focus_areas (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  focus_area_id INTEGER NOT NULL REFERENCES focus_areas(id) ON DELETE CASCADE
);

-- Step 5: Populate apparatus table
INSERT INTO apparatus (name, description, sort_order) VALUES
('Tumbling', 'Floor tumbling and acrobatics', 1),
('Vault', 'Vaulting skills and techniques', 2),
('Bars', 'Uneven bars and high bar skills', 3),
('Beam', 'Balance beam routines and skills', 4),
('Conditioning', 'Strength and flexibility training', 5),
('Trampoline', 'Trampoline skills and safety', 6)
ON CONFLICT (name) DO NOTHING;

-- Step 6: Populate focus_areas table with common skills
INSERT INTO focus_areas (name, apparatus_id, sort_order) VALUES
-- Tumbling skills
('Forward Roll', (SELECT id FROM apparatus WHERE name = 'Tumbling'), 1),
('Backward Roll', (SELECT id FROM apparatus WHERE name = 'Tumbling'), 2),
('Cartwheel', (SELECT id FROM apparatus WHERE name = 'Tumbling'), 3),
('Round-off', (SELECT id FROM apparatus WHERE name = 'Tumbling'), 4),
('Handstand', (SELECT id FROM apparatus WHERE name = 'Tumbling'), 5),
('Back Walkover', (SELECT id FROM apparatus WHERE name = 'Tumbling'), 6),
('Front Walkover', (SELECT id FROM apparatus WHERE name = 'Tumbling'), 7),
('Back Handspring', (SELECT id FROM apparatus WHERE name = 'Tumbling'), 8),
-- Vault skills
('Straight Jump', (SELECT id FROM apparatus WHERE name = 'Vault'), 1),
('Squat On/Off', (SELECT id FROM apparatus WHERE name = 'Vault'), 2),
('Straddle On/Off', (SELECT id FROM apparatus WHERE name = 'Vault'), 3),
('Cartwheel Vault', (SELECT id FROM apparatus WHERE name = 'Vault'), 4),
-- Bars skills
('Support Hold', (SELECT id FROM apparatus WHERE name = 'Bars'), 1),
('Pull-ups', (SELECT id FROM apparatus WHERE name = 'Bars'), 2),
('Glide Swings', (SELECT id FROM apparatus WHERE name = 'Bars'), 3),
('Back Hip Circle', (SELECT id FROM apparatus WHERE name = 'Bars'), 4),
-- Beam skills
('Straight Walk', (SELECT id FROM apparatus WHERE name = 'Beam'), 1),
('Relevé Walk', (SELECT id FROM apparatus WHERE name = 'Beam'), 2),
('Kick to Handstand', (SELECT id FROM apparatus WHERE name = 'Beam'), 3),
('Cartwheel', (SELECT id FROM apparatus WHERE name = 'Beam'), 4)
ON CONFLICT (name) DO NOTHING;

-- Step 7: Migrate existing data
-- First, ensure all parents exist for bookings
INSERT INTO parents (first_name, last_name, email, phone, emergency_contact_name, emergency_contact_phone, created_at)
SELECT DISTINCT 
  parent_first_name,
  parent_last_name,
  parent_email,
  parent_phone,
  emergency_contact_name,
  emergency_contact_phone,
  created_at
FROM bookings b
WHERE NOT EXISTS (
  SELECT 1 FROM parents p 
  WHERE p.email = b.parent_email 
  AND p.phone = b.parent_phone
)
ON CONFLICT DO NOTHING;

-- Update bookings with parent_id
UPDATE bookings 
SET parent_id = p.id
FROM parents p
WHERE bookings.parent_email = p.email 
AND bookings.parent_phone = p.phone
AND bookings.parent_id IS NULL;

-- Step 8: Create athletes from booking data and link them
-- Create athlete 1 records
INSERT INTO athletes (parent_id, name, first_name, last_name, date_of_birth, allergies, experience, created_at)
SELECT DISTINCT 
  p.id,
  b.athlete1_name,
  SPLIT_PART(b.athlete1_name, ' ', 1),
  TRIM(SUBSTRING(b.athlete1_name FROM POSITION(' ' IN b.athlete1_name) + 1)),
  b.athlete1_date_of_birth,
  b.athlete1_allergies,
  b.athlete1_experience,
  b.created_at
FROM bookings b
JOIN parents p ON p.id = b.parent_id
WHERE b.athlete1_name IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM athletes a 
  WHERE a.parent_id = p.id 
  AND a.name = b.athlete1_name 
  AND a.date_of_birth = b.athlete1_date_of_birth
)
ON CONFLICT DO NOTHING;

-- Create athlete 2 records  
INSERT INTO athletes (parent_id, name, first_name, last_name, date_of_birth, allergies, experience, created_at)
SELECT DISTINCT 
  p.id,
  b.athlete2_name,
  SPLIT_PART(b.athlete2_name, ' ', 1),
  TRIM(SUBSTRING(b.athlete2_name FROM POSITION(' ' IN b.athlete2_name) + 1)),
  b.athlete2_date_of_birth,
  b.athlete2_allergies,
  b.athlete2_experience,
  b.created_at
FROM bookings b
JOIN parents p ON p.id = b.parent_id
WHERE b.athlete2_name IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM athletes a 
  WHERE a.parent_id = p.id 
  AND a.name = b.athlete2_name 
  AND a.date_of_birth = b.athlete2_date_of_birth
)
ON CONFLICT DO NOTHING;

-- Step 9: Link athletes to bookings via booking_athletes table
-- Link athlete 1
INSERT INTO booking_athletes (booking_id, athlete_id, slot_order)
SELECT DISTINCT 
  b.id,
  a.id,
  1
FROM bookings b
JOIN parents p ON p.id = b.parent_id
JOIN athletes a ON a.parent_id = p.id 
  AND a.name = b.athlete1_name 
  AND a.date_of_birth = b.athlete1_date_of_birth
WHERE b.athlete1_name IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM booking_athletes ba 
  WHERE ba.booking_id = b.id AND ba.athlete_id = a.id
);

-- Link athlete 2
INSERT INTO booking_athletes (booking_id, athlete_id, slot_order)
SELECT DISTINCT 
  b.id,
  a.id,
  2
FROM bookings b
JOIN parents p ON p.id = b.parent_id
JOIN athletes a ON a.parent_id = p.id 
  AND a.name = b.athlete2_name 
  AND a.date_of_birth = b.athlete2_date_of_birth
WHERE b.athlete2_name IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM booking_athletes ba 
  WHERE ba.booking_id = b.id AND ba.athlete_id = a.id
);

-- Step 10: Parse focus areas and link them
-- This will parse the focus_areas array and create proper links
INSERT INTO booking_focus_areas (booking_id, focus_area_id)
SELECT DISTINCT 
  b.id,
  fa.id
FROM bookings b
CROSS JOIN UNNEST(b.focus_areas) AS focus_area_name
JOIN focus_areas fa ON fa.name = focus_area_name
WHERE b.focus_areas IS NOT NULL 
AND array_length(b.focus_areas, 1) > 0
AND NOT EXISTS (
  SELECT 1 FROM booking_focus_areas bfa 
  WHERE bfa.booking_id = b.id AND bfa.focus_area_id = fa.id
)
ON CONFLICT DO NOTHING;

-- Step 11: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_booking_athletes_booking_id ON booking_athletes(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_athletes_athlete_id ON booking_athletes(athlete_id);
CREATE INDEX IF NOT EXISTS idx_booking_focus_areas_booking_id ON booking_focus_areas(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_focus_areas_focus_area_id ON booking_focus_areas(focus_area_id);
CREATE INDEX IF NOT EXISTS idx_bookings_parent_id ON bookings(parent_id);

-- Final step: You can drop the old columns after confirming everything works
-- DO NOT RUN THIS YET - wait until the code is updated and tested
-- ALTER TABLE bookings DROP COLUMN athlete1_name;
-- ALTER TABLE bookings DROP COLUMN athlete1_date_of_birth;
-- ALTER TABLE bookings DROP COLUMN athlete1_allergies;
-- ALTER TABLE bookings DROP COLUMN athlete1_experience;
-- ALTER TABLE bookings DROP COLUMN athlete2_name;
-- ALTER TABLE bookings DROP COLUMN athlete2_date_of_birth;
-- ALTER TABLE bookings DROP COLUMN athlete2_allergies;
-- ALTER TABLE bookings DROP COLUMN athlete2_experience;
-- ALTER TABLE bookings DROP COLUMN focus_areas;

COMMIT;
