-- Adds missing foreign key constraints to enable PostgREST relationship expansion
-- Run this after ensuring existing data integrity.
-- Validate there are no orphan rows before applying (or use NOT VALID then VALIDATE CONSTRAINT).

-- 1. Add constraint for waivers.athlete_id -> athletes.id
ALTER TABLE waivers
  ADD CONSTRAINT fk_waivers_athlete
  FOREIGN KEY (athlete_id)
  REFERENCES athletes(id)
  ON DELETE SET NULL;

-- 2. Add constraint for waivers.parent_id -> parents.id
ALTER TABLE waivers
  ADD CONSTRAINT fk_waivers_parent
  FOREIGN KEY (parent_id)
  REFERENCES parents(id)
  ON DELETE SET NULL;

-- If large table / potential violations, prefer:
-- ALTER TABLE waivers ADD CONSTRAINT fk_waivers_athlete FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE SET NULL NOT VALID;
-- ALTER TABLE waivers ADD CONSTRAINT fk_waivers_parent FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE SET NULL NOT VALID;
-- Then after fixing any violations:
-- ALTER TABLE waivers VALIDATE CONSTRAINT fk_waivers_athlete;
-- ALTER TABLE waivers VALIDATE CONSTRAINT fk_waivers_parent;
