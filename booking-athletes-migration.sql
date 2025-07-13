
-- 1) Create the new join table for bookings ↔ athletes
CREATE TABLE booking_athletes (
  id         SERIAL PRIMARY KEY,
  booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  athlete_id INTEGER NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  slot_order INTEGER NOT NULL  -- 1 = first slot, 2 = second, etc.
);

-- 2) Migrate your existing athlete1/athlete2 columns into booking_athletes
INSERT INTO booking_athletes (booking_id, athlete_id, slot_order)
SELECT
  b.id,
  a.id,
  1
FROM bookings b
JOIN parents p ON p.email = b.parent_email
JOIN athletes a
  ON a.parent_id = p.id
  AND a.name           = b.athlete1_name
  AND a.date_of_birth::TEXT = b.athlete1_date_of_birth
WHERE b.athlete1_name IS NOT NULL;

INSERT INTO booking_athletes (booking_id, athlete_id, slot_order)
SELECT
  b.id,
  a.id,
  2
FROM bookings b
JOIN parents p ON p.email = b.parent_email
JOIN athletes a
  ON a.parent_id = p.id
  AND a.name           = b.athlete2_name
  AND a.date_of_birth::TEXT = b.athlete2_date_of_birth
WHERE b.athlete2_name IS NOT NULL;

-- 3) Drop the old flat athlete columns from bookings
ALTER TABLE bookings
  DROP COLUMN athlete1_name,
  DROP COLUMN athlete1_date_of_birth,
  DROP COLUMN athlete1_allergies,
  DROP COLUMN athlete1_experience,
  DROP COLUMN athlete2_name,
  DROP COLUMN athlete2_date_of_birth,
  DROP COLUMN athlete2_allergies,
  DROP COLUMN athlete2_experience;

-- 4) Add indexes on the new foreign keys for performance
CREATE INDEX idx_booking_athletes_booking_id ON booking_athletes(booking_id);
CREATE INDEX idx_booking_athletes_athlete_id ON booking_athletes(athlete_id);

-- 5) Verify the migration worked
SELECT 
  b.id as booking_id,
  b.parent_email,
  ba.slot_order,
  a.name as athlete_name,
  a.date_of_birth
FROM bookings b
JOIN booking_athletes ba ON ba.booking_id = b.id
JOIN athletes a ON a.id = ba.athlete_id
ORDER BY b.id, ba.slot_order
LIMIT 10;
