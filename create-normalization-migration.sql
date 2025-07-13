-- Database Normalization Migration for Apparatus, Focus Areas, and Side Quests
-- This migration creates new lookup tables and join tables for normalized data

-- Step 1: Create the new lookup tables
CREATE TABLE IF NOT EXISTS apparatus (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS focus_areas (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  apparatus_id INTEGER REFERENCES apparatus(id),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS side_quests (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Step 2: Create the join tables
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

CREATE TABLE IF NOT EXISTS booking_side_quests (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  side_quest_id INTEGER NOT NULL REFERENCES side_quests(id) ON DELETE CASCADE
);

-- Step 3: Populate apparatus table with common gymnastics apparatus
INSERT INTO apparatus (name, sort_order) VALUES
  ('Floor Exercise', 1),
  ('Vault', 2),
  ('Uneven Bars', 3),
  ('Balance Beam', 4),
  ('Pommel Horse', 5),
  ('Still Rings', 6),
  ('Parallel Bars', 7),
  ('High Bar', 8),
  ('Trampoline', 9),
  ('General Training', 10)
ON CONFLICT (name) DO NOTHING;

-- Step 4: Populate focus areas table with comprehensive gymnastics skills
INSERT INTO focus_areas (name, apparatus_id, sort_order) VALUES
  -- Floor Exercise Focus Areas
  ('Forward Roll', 1, 1),
  ('Backward Roll', 1, 2),
  ('Cartwheel', 1, 3),
  ('Round Off', 1, 4),
  ('Handstand', 1, 5),
  ('Front Walkover', 1, 6),
  ('Back Walkover', 1, 7),
  ('Front Handspring', 1, 8),
  ('Back Handspring', 1, 9),
  ('Front Tuck', 1, 10),
  ('Back Tuck', 1, 11),
  
  -- Vault Focus Areas
  ('Straight Jump', 2, 1),
  ('Squat On', 2, 2),
  ('Straddle On', 2, 3),
  ('Handstand Flat Back', 2, 4),
  ('Front Handspring Vault', 2, 5),
  
  -- Uneven Bars Focus Areas
  ('Cast', 3, 1),
  ('Pullover', 3, 2),
  ('Back Hip Circle', 3, 3),
  ('Glide Swing', 3, 4),
  ('Tap Swing', 3, 5),
  ('Mill Circle', 3, 6),
  
  -- Balance Beam Focus Areas
  ('Straight Walk', 4, 1),
  ('Relevé Walk', 4, 2),
  ('Straight Leg Kick', 4, 3),
  ('Passé Walk', 4, 4),
  ('Arabesque', 4, 5),
  ('Cartwheel on Beam', 4, 6),
  ('Back Walkover on Beam', 4, 7),
  
  -- Pommel Horse Focus Areas (Men's Gymnastics)
  ('Support Position', 5, 1),
  ('Leg Cuts', 5, 2),
  ('Circles', 5, 3),
  
  -- Still Rings Focus Areas (Men's Gymnastics)
  ('Support Hold', 6, 1),
  ('L-Sit', 6, 2),
  ('Muscle Up', 6, 3),
  ('Iron Cross', 6, 4),
  
  -- Parallel Bars Focus Areas (Men's Gymnastics)
  ('Support Walk', 7, 1),
  ('L-Sit on Parallel Bars', 7, 2),
  ('Swing to Support', 7, 3),
  
  -- High Bar Focus Areas (Men's Gymnastics)
  ('Pullover on High Bar', 8, 1),
  ('Cast on High Bar', 8, 2),
  ('Tap Swing on High Bar', 8, 3),
  
  -- Trampoline Focus Areas
  ('Straight Jump', 9, 1),
  ('Tuck Jump', 9, 2),
  ('Pike Jump', 9, 3),
  ('Seat Drop', 9, 4),
  ('Front Drop', 9, 5),
  ('Back Drop', 9, 6),
  ('Front Somersault', 9, 7),
  ('Back Somersault', 9, 8),
  
  -- General Training Focus Areas
  ('Strength Training', 10, 1),
  ('Flexibility Training', 10, 2),
  ('Conditioning', 10, 3),
  ('Balance Training', 10, 4),
  ('Coordination Training', 10, 5),
  ('Spatial Awareness', 10, 6)
ON CONFLICT (name) DO NOTHING;

-- Step 5: Populate side quests table with specialized training areas
INSERT INTO side_quests (name, description, sort_order) VALUES
  ('Flexibility Training', 'Improve overall flexibility and range of motion', 1),
  ('Strength Building', 'Build core, upper body, and lower body strength', 2),
  ('Agility Training', 'Improve speed, quickness, and reaction time', 3),
  ('Mental Focus & Meditation', 'Develop mental toughness and concentration', 4),
  ('Fear & Mental Blocks', 'Overcome psychological barriers in gymnastics', 5),
  ('Injury Prevention', 'Learn proper warm-up and injury prevention techniques', 6),
  ('Competition Preparation', 'Prepare for competitive gymnastics events', 7),
  ('Performance Enhancement', 'Improve overall athletic performance', 8),
  ('Recovery & Rest', 'Learn proper recovery techniques', 9),
  ('Goal Setting', 'Set and achieve gymnastics goals', 10)
ON CONFLICT (name) DO NOTHING;

-- Step 6: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_booking_apparatus_booking_id ON booking_apparatus(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_apparatus_apparatus_id ON booking_apparatus(apparatus_id);
CREATE INDEX IF NOT EXISTS idx_booking_focus_areas_booking_id ON booking_focus_areas(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_focus_areas_focus_area_id ON booking_focus_areas(focus_area_id);
CREATE INDEX IF NOT EXISTS idx_booking_side_quests_booking_id ON booking_side_quests(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_side_quests_side_quest_id ON booking_side_quests(side_quest_id);
CREATE INDEX IF NOT EXISTS idx_focus_areas_apparatus_id ON focus_areas(apparatus_id);

-- Step 7: Migration note - the old focus_areas column in bookings table will be handled separately
-- DO NOT DROP the focus_areas column yet - we'll migrate data first, then drop in a separate migration