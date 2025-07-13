-- COMPLETE DATABASE MIGRATION FOR COACH WILL TUMBLES
-- Run this SQL in your Supabase SQL Editor to create all tables and migrate existing data
-- This preserves all your current bookings, customers, athletes, schedules, and admin data

-- ============================================================
-- CREATE ALL TABLES FROM SCHEMA
-- ============================================================

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create parents table (formerly customers)
CREATE TABLE IF NOT EXISTS parents (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  emergency_contact_name TEXT NOT NULL,
  emergency_contact_phone TEXT NOT NULL,
  waiver_signed BOOLEAN DEFAULT FALSE,
  waiver_signed_at TIMESTAMP,
  waiver_signature_name TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create athletes table
CREATE TABLE IF NOT EXISTS athletes (
  id SERIAL PRIMARY KEY,
  parent_id INTEGER REFERENCES parents(id),
  name TEXT, -- Keep for backward compatibility
  first_name TEXT,
  last_name TEXT,
  date_of_birth TEXT NOT NULL,
  allergies TEXT,
  experience TEXT NOT NULL,
  photo TEXT, -- Base64 encoded photo
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create comprehensive bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  lesson_type TEXT NOT NULL,
  athlete1_name TEXT NOT NULL,
  athlete1_date_of_birth TEXT NOT NULL,
  athlete1_allergies TEXT,
  athlete1_experience TEXT NOT NULL,
  athlete2_name TEXT,
  athlete2_date_of_birth TEXT,
  athlete2_allergies TEXT,
  athlete2_experience TEXT,
  preferred_date TEXT NOT NULL,
  preferred_time TEXT NOT NULL,
  focus_areas TEXT[],
  parent_first_name TEXT NOT NULL,
  parent_last_name TEXT NOT NULL,
  parent_email TEXT NOT NULL,
  parent_phone TEXT NOT NULL,
  emergency_contact_name TEXT NOT NULL,
  emergency_contact_phone TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  booking_method TEXT DEFAULT 'online',
  waiver_signed BOOLEAN DEFAULT FALSE,
  waiver_signed_at TIMESTAMP,
  waiver_signature_name TEXT,
  payment_status TEXT DEFAULT 'unpaid',
  attendance_status TEXT DEFAULT 'pending',
  reservation_fee_paid BOOLEAN DEFAULT FALSE,
  paid_amount DECIMAL(10,2) DEFAULT '0.00',
  special_requests TEXT,
  admin_notes TEXT,
  dropoff_person_name TEXT,
  dropoff_person_relationship TEXT,
  dropoff_person_phone TEXT,
  pickup_person_name TEXT,
  pickup_person_relationship TEXT,
  pickup_person_phone TEXT,
  alt_pickup_person_name TEXT,
  alt_pickup_person_relationship TEXT,
  alt_pickup_person_phone TEXT,
  safety_verification_signed BOOLEAN DEFAULT FALSE,
  safety_verification_signed_at TIMESTAMP,
  stripe_session_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create booking logs table
CREATE TABLE IF NOT EXISTS booking_logs (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id),
  action_type TEXT NOT NULL,
  action_description TEXT NOT NULL,
  previous_value TEXT,
  new_value TEXT,
  performed_by TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create payment logs table
CREATE TABLE IF NOT EXISTS payment_logs (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id),
  stripe_event TEXT,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create waivers table
CREATE TABLE IF NOT EXISTS waivers (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id),
  athlete_id INTEGER REFERENCES athletes(id),
  parent_id INTEGER REFERENCES parents(id),
  athlete_name TEXT NOT NULL,
  signer_name TEXT NOT NULL,
  relationship_to_athlete TEXT DEFAULT 'Parent/Guardian',
  signature TEXT NOT NULL,
  emergency_contact_number TEXT NOT NULL,
  understands_risks BOOLEAN DEFAULT FALSE,
  agrees_to_policies BOOLEAN DEFAULT FALSE,
  authorizes_emergency_care BOOLEAN DEFAULT FALSE,
  allows_photo_video BOOLEAN DEFAULT TRUE,
  confirms_authority BOOLEAN DEFAULT FALSE,
  pdf_path TEXT,
  ip_address TEXT,
  user_agent TEXT,
  signed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  email_sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create tips table
CREATE TABLE IF NOT EXISTS tips (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  sections JSONB,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  video_url TEXT,
  published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create availability table
CREATE TABLE IF NOT EXISTS availability (
  id SERIAL PRIMARY KEY,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  is_recurring BOOLEAN DEFAULT TRUE,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create availability exceptions table
CREATE TABLE IF NOT EXISTS availability_exceptions (
  id SERIAL PRIMARY KEY,
  date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  is_available BOOLEAN DEFAULT FALSE,
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create parent auth codes table
CREATE TABLE IF NOT EXISTS parent_auth_codes (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create slot reservations table
CREATE TABLE IF NOT EXISTS slot_reservations (
  id SERIAL PRIMARY KEY,
  date VARCHAR(10) NOT NULL,
  start_time VARCHAR(8) NOT NULL,
  lesson_type VARCHAR(50) NOT NULL,
  session_id VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_bookings_parent_first_name ON bookings(parent_first_name);
CREATE INDEX IF NOT EXISTS idx_bookings_parent_email ON bookings(parent_email);
CREATE INDEX IF NOT EXISTS idx_bookings_preferred_date ON bookings(preferred_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_parents_email ON parents(email);
CREATE INDEX IF NOT EXISTS idx_athletes_parent_id ON athletes(parent_id);
CREATE INDEX IF NOT EXISTS idx_availability_day_of_week ON availability(day_of_week);
CREATE INDEX IF NOT EXISTS idx_availability_exceptions_date ON availability_exceptions(date);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_tips_category ON tips(category);
CREATE INDEX IF NOT EXISTS idx_tips_difficulty ON tips(difficulty);

-- ============================================================
-- MIGRATE EXISTING DATA FROM JSON FILES
-- ============================================================

-- Migrate parents (formerly customers)
INSERT INTO parents (id, first_name, last_name, email, phone, emergency_contact_name, emergency_contact_phone, waiver_signed, waiver_signed_at, waiver_signature_name, created_at, updated_at) VALUES
(1, 'Thomas', 'Sawyer', 'swyrwilliam12@gmail.com', '5857558122', 'Will S.', '5555555555', false, NULL, NULL, '2025-07-01T19:02:25.360Z', '2025-07-01T19:02:25.360Z'),
(2, 'Thomas', 'Sawyer', 'swyrwilliam12@gmail.com', '5857558122', 'Will S.', '5555555555', false, NULL, NULL, '2025-07-01T19:02:56.752Z', '2025-07-01T19:02:56.752Z'),
(3, 'Thomas', 'Sawyer', 'swyrwilliam12@gmail.com', '5857558122', 'Will S.', '5555555555', false, NULL, NULL, '2025-07-01T19:11:12.867Z', '2025-07-01T19:11:12.867Z'),
(4, 'Will', 'Sawyer', 'sawyerwilliamf@yahoo.com', '2034432190', 'Mystique Nobles', '4444444444', false, NULL, NULL, '2025-07-02T15:43:58.575Z', '2025-07-02T15:43:58.575Z'),
(5, 'Will', 'Sawyer', 'sawyerwilliamf@yahoo.com', '2034432190', 'Mystique Nobles', '4444444444', false, NULL, NULL, '2025-07-02T15:44:03.222Z', '2025-07-02T15:44:03.222Z'),
(6, 'Test', 'Parent', 'test@parent.com', '555-0123', 'Emergency Contact', '555-0456', false, NULL, NULL, '2025-07-03T18:40:55.603Z', '2025-07-03T18:40:55.603Z');

-- Update sequence for parents table
SELECT setval('parents_id_seq', (SELECT MAX(id) FROM parents));

-- Migrate athletes
INSERT INTO athletes (parent_id, name, first_name, last_name, date_of_birth, experience, allergies, photo, created_at, updated_at) VALUES
(1, 'Alfred Sawyer', 'Alfred', 'Sawyer', '2010-09-03', 'intermediate', 'None', 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/4QBMRXhpZgAATU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAABwqADAAQAAAABAAADIAAAAAD/7QA4UGhvdG9zaG9wIDMuMAA4QklNBAQAAAAAAAA4QklNBCUAAAAAABDUHYzZjwCyBOmACZjs+EJ+/8AAEQgDIAHCAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/bAEMAAgICAgICAwICAwQDAwMEBQQEBAQFBwUFBQUFBwgHBwcHBwcICAgICAgICAoKCgoKCgsLCwsLDQ0NDQ0NDQ0NDf/bAEMBAgICAwMDBgMDBg0JBwkNDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDf/dAAQAHf/aAAwDAQACEQMRAD8A', '2025-07-01T19:11:12.867Z', '2025-07-01T19:11:12.867Z');

-- Migrate bookings
INSERT INTO bookings (id, lesson_type, athlete1_name, athlete1_date_of_birth, athlete1_allergies, athlete1_experience, athlete2_name, athlete2_date_of_birth, athlete2_allergies, athlete2_experience, preferred_date, preferred_time, focus_areas, parent_first_name, parent_last_name, parent_email, parent_phone, emergency_contact_name, emergency_contact_phone, amount, status, booking_method, waiver_signed, waiver_signed_at, waiver_signature_name, payment_status, attendance_status, reservation_fee_paid, paid_amount, special_requests, admin_notes, dropoff_person_name, dropoff_person_relationship, dropoff_person_phone, pickup_person_name, pickup_person_relationship, pickup_person_phone, alt_pickup_person_name, alt_pickup_person_relationship, alt_pickup_person_phone, safety_verification_signed, safety_verification_signed_at, stripe_session_id, created_at, updated_at) VALUES
(3, 'quick-journey', 'Alfred Sawyer', '2010-09-03', 'None', 'intermediate', NULL, NULL, NULL, NULL, '2025-07-07', '10:30', ARRAY['Tumbling: Back Tuck'], 'Thomas', 'Sawyer', 'swyrwilliam12@gmail.com', '5859573228', 'Evelyn Sawyer', '5859570436', 40, 'confirmed', 'online', true, '2025-07-03T04:24:43.898Z', 'Thomas Sawyer', 'reservation-paid', 'confirmed', true, 0.50, NULL, NULL, 'Thomas Sawyer', 'Parent', '5859573228', 'Thomas Sawyer', 'Parent', '5859573228', NULL, NULL, NULL, false, NULL, 'cs_live_a1Qe4zLj4Mw1s2RCAvEx0f9t4FQ8wJyTgvkp2KhljBTTM5H6NWhvIHLslg', '2025-07-03T04:24:46.186Z', '2025-07-03T17:45:01.401Z'),
(4, 'quick-journey', 'Test Athlete', '2010-05-15', '', 'beginner', NULL, NULL, NULL, NULL, '2025-01-10', '12:00', ARRAY['Tumbling: Forward Roll', 'Balance: Standing Balance'], 'Test', 'Parent', 'test@example.com', '555-0123', 'Emergency Contact', '555-9999', 40, 'pending', 'online', true, '2025-07-03T22:30:53.127Z', 'Test Parent', 'unpaid', 'pending', false, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, NULL, '2025-07-03T22:30:53.125Z', '2025-07-03T22:30:53.127Z');

-- Update sequence for bookings table
SELECT setval('bookings_id_seq', (SELECT MAX(id) FROM bookings));

-- Migrate availability schedule
INSERT INTO availability (id, day_of_week, start_time, end_time, is_recurring, is_available, created_at) VALUES
(8, 1, '09:00', '16:00', true, true, '2025-06-29T16:07:35.291Z'),
(9, 2, '09:00', '16:00', true, true, '2025-06-29T16:07:50.075Z'),
(10, 3, '09:00', '16:00', true, true, '2025-06-29T16:07:58.294Z'),
(11, 4, '09:00', '15:30', true, true, '2025-06-29T16:08:15.582Z'),
(12, 5, '09:00', '16:00', true, true, '2025-06-29T16:08:21.706Z'),
(15, 6, '12:00', '13:30', true, true, '2025-06-29T16:09:21.688Z');

-- Update sequence for availability table
SELECT setval('availability_id_seq', (SELECT MAX(id) FROM availability));

-- Migrate availability exceptions
INSERT INTO availability_exceptions (id, date, start_time, end_time, is_available, reason, created_at) VALUES
(1, '2025-06-30', '12:00', '16:00', false, 'Camp', '2025-06-29T16:14:03.717Z'),
(5, '2025-07-04', '08:00', '20:00', false, 'Gym Closed', '2025-06-29T16:18:30.642Z'),
(6, '2025-07-09', '08:15', '12:00', false, 'Camp', '2025-07-01T05:51:50.932Z'),
(9, '2025-07-05', '08:00', '17:00', false, 'Gym Closed', '2025-07-02T04:23:34.334Z');

-- Update sequence for availability_exceptions table
SELECT setval('availability_exceptions_id_seq', (SELECT MAX(id) FROM availability_exceptions));

-- Migrate admin accounts
INSERT INTO admins (id, email, password_hash, created_at) VALUES
(1, 'admin@coachwilltumbles.com', '$2b$10$3YaSt7DVRkQYYie.pHkN4.kGlYVJHoRiYaZBLGFyDURpAXemNlTvm', '2025-06-30T17:28:52.285Z');

-- Update sequence for admins table
SELECT setval('admins_id_seq', (SELECT MAX(id) FROM admins));

-- Migrate parent auth codes
INSERT INTO parent_auth_codes (id, email, code, expires_at, used, created_at) VALUES
(1, 'swyrwilliam12@gmail.com', '369582', '2025-07-03T22:43:35.415Z', true, '2025-07-03T22:33:35.415Z');

-- Update sequence for parent_auth_codes table
SELECT setval('parent_auth_codes_id_seq', (SELECT MAX(id) FROM parent_auth_codes));

-- ============================================================
-- ADD SAMPLE BLOG POSTS AND TIPS
-- ============================================================

-- Insert sample blog posts
INSERT INTO blog_posts (title, content, excerpt, category, image_url, published_at) VALUES 
('Welcome to Coach Will''s Adventure Journal', 
 'Welcome to our adventure journal! Here, we document the incredible journeys of young gymnasts as they discover their strength, grace, and confidence through the art of gymnastics.

Every athlete who steps into our gym begins their own unique adventure. Whether they''re taking their first tumbling pass or perfecting an advanced skill, each moment is a chance to grow, learn, and discover something new about themselves.

In this journal, you''ll find stories of triumph, lessons learned, and the magic that happens when dedication meets dreams. Our goal is to support not just the physical development of each athlete, but their confidence, character, and love for the sport.

Welcome to the adventure!',
 'Every gymnastics journey begins with a single step. Discover what makes each athlete''s adventure unique.',
 'Welcome', 
 NULL, 
 CURRENT_TIMESTAMP),

('Building Confidence Through Gymnastics', 
 'One of the most remarkable aspects of gymnastics coaching is watching young athletes discover their own strength and capabilities. Every skill mastered, every fear overcome, and every challenge faced builds not just physical ability, but unshakeable confidence.

In our coaching approach, we focus on celebrating progress over perfection. When a young gymnast successfully completes a cartwheel for the first time, or conquers their fear of a backflip, they''re not just learning a skill—they''re learning that they can achieve anything they set their mind to.

This confidence transfers beyond the gym. We see our athletes become more confident in school, in social situations, and in facing new challenges. The discipline, perseverance, and problem-solving skills they develop in gymnastics become tools they carry throughout their lives.

Every training session is an opportunity to build this confidence, one skill at a time.',
 'Gymnastics is more than physical training—it''s a journey of self-discovery and confidence building.',
 'Training', 
 NULL, 
 CURRENT_TIMESTAMP),

('The Adventure Continues: Goal Setting in Gymnastics', 
 'Setting goals in gymnastics is like charting a course for an epic adventure. Each skill becomes a milestone, each practice session a step forward on the journey.

We teach our athletes to set both short-term and long-term goals. Short-term goals might include mastering a cartwheel or holding a handstand for 10 seconds. Long-term goals could involve competing in a gymnastics meet or performing a back handspring.

The key is making goals specific, measurable, and achievable. We celebrate every victory along the way, no matter how small. This approach helps build momentum and keeps the adventure exciting.

Goal setting also teaches valuable life skills. Athletes learn to break down big challenges into manageable steps, develop patience and persistence, and experience the satisfaction of achieving something they''ve worked hard for.',
 'Learn how goal setting turns every gymnastics session into an exciting adventure with clear milestones.',
 'Training', 
 NULL, 
 CURRENT_TIMESTAMP);

-- Insert sample tips
INSERT INTO tips (title, content, sections, category, difficulty, video_url, published_at) VALUES 
('Perfect Cartwheel Quest', 
 'The cartwheel is a fundamental skill that builds strength, coordination, and confidence. Master this move to unlock more advanced tumbling adventures!',
 '[
   {
     "title": "Step 1: Hand Placement",
     "content": "Start with hands reaching up high, then place them on the floor shoulder-width apart. Think of creating a strong foundation for your wheel!"
   },
   {
     "title": "Step 2: The Kick-Over",
     "content": "Kick your legs over in a straight line, keeping your body sideways like a wheel. Remember: legs stay straight and strong!"
   },
   {
     "title": "Step 3: The Landing",
     "content": "Land one foot at a time, finishing with arms up in a victory pose! Control is key for a perfect finish."
   },
   {
     "title": "Practice Tip",
     "content": "Start on a line to keep your cartwheel straight and true. The line is your guide to adventure!"
   }
 ]'::jsonb,
 'tumbling', 
 'beginner', 
 NULL, 
 CURRENT_TIMESTAMP),

('Handstand Hold Challenge', 
 'Building upper body strength and balance through handstand progressions. This foundational skill opens doors to countless gymnastics adventures!',
 '[
   {
     "title": "Progression 1: Wall Walks",
     "content": "Start in a plank position with feet on the wall. Walk your feet up while walking your hands closer to the wall. This builds strength safely!"
   },
   {
     "title": "Progression 2: Hollow Body Holds",
     "content": "Strengthen your core with this essential position. Lie on your back, press your lower back to the floor, and lift your shoulders and legs."
   },
   {
     "title": "Progression 3: Kick-Up Practice",
     "content": "Learn to kick into a handstand with control and confidence. Start light, focus on form over height."
   },
   {
     "title": "Pro Tip",
     "content": "Perfect form is more important than holding for a long time. Focus on straight arms, engaged core, and pointed toes!"
   }
 ]'::jsonb,
 'tumbling', 
 'intermediate', 
 NULL, 
 CURRENT_TIMESTAMP),

('Beam Balance Basics', 
 'The balance beam teaches focus, precision, and grace. Start with these fundamental skills to build your beam confidence!',
 '[
   {
     "title": "Skill 1: Straight Leg Walk",
     "content": "Keep your head up, core tight, and legs straight as you walk the length of the beam. Imagine you''re a tightrope walker in the circus!"
   },
   {
     "title": "Skill 2: Relevé Walks",
     "content": "Rise up on your toes and maintain balance while walking forward. This builds calf strength and improves balance."
   },
   {
     "title": "Skill 3: Straight Leg Kicks",
     "content": "Kick your leg up to horizontal while maintaining balance on the supporting leg. Control and precision are key."
   },
   {
     "title": "Practice Progression",
     "content": "Start on a line on the floor, then progress to a low beam before advancing to regulation height. Safety first!"
   }
 ]'::jsonb,
 'beam', 
 'beginner', 
 NULL, 
 CURRENT_TIMESTAMP),

('Forward Roll Fundamentals', 
 'The forward roll is often the first tumbling skill athletes learn. It builds spatial awareness and confidence for more advanced moves!',
 '[
   {
     "title": "Starting Position",
     "content": "Begin in a squat position with hands on the floor, fingers spread wide for support. Keep your chin tucked to your chest."
   },
   {
     "title": "The Roll",
     "content": "Push off with your feet and roll over your shoulders (not your head!). Think of making a tight ball shape."
   },
   {
     "title": "The Finish",
     "content": "Use your momentum to rock up to your feet, finishing in a squat position. Eventually work toward standing up without using your hands."
   },
   {
     "title": "Safety Note",
     "content": "Always practice on appropriate mats. Never roll on your head or neck - this can cause injury!"
   }
 ]'::jsonb,
 'tumbling', 
 'beginner', 
 NULL, 
 CURRENT_TIMESTAMP),

('Bridge Kick-Over Adventure', 
 'The bridge kick-over is an exciting milestone that combines flexibility, strength, and courage. It''s a step toward back walkovers!',
 '[
   {
     "title": "Bridge Foundation",
     "content": "Master a strong bridge first. Push up high, keep your fingers pointing toward your toes, and make sure your shoulders are over your hands."
   },
   {
     "title": "Wall Practice",
     "content": "Practice bridge kick-overs against a wall first. This helps you understand the motion and builds confidence."
   },
   {
     "title": "The Kick",
     "content": "From your bridge, shift weight to your hands and kick one leg over. The key is committing to the movement!"
   },
   {
     "title": "Spotter Assistance",
     "content": "Always practice with a qualified spotter when learning. Safety is the most important part of any adventure!"
   }
 ]'::jsonb,
 'tumbling', 
 'intermediate', 
 NULL, 
 CURRENT_TIMESTAMP);

-- ============================================================
-- ENABLE SECURITY (OPTIONAL - UNCOMMENT IF NEEDED)
-- ============================================================

-- Temporarily disable RLS for easier development
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE parents DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE athletes DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE blog_posts DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE tips DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE availability DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE availability_exceptions DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE admins DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- FINAL SUCCESS MESSAGE
-- ============================================================

SELECT 'COMPLETE DATABASE MIGRATION SUCCESSFUL!' as status,
       'All tables created and data migrated successfully' as message,
       (SELECT COUNT(*) FROM parents) as parents_migrated,
       (SELECT COUNT(*) FROM athletes) as athletes_migrated,
       (SELECT COUNT(*) FROM bookings) as bookings_migrated,
       (SELECT COUNT(*) FROM availability) as availability_slots,
       (SELECT COUNT(*) FROM availability_exceptions) as exceptions_migrated,
       (SELECT COUNT(*) FROM admins) as admin_accounts,
       (SELECT COUNT(*) FROM blog_posts) as blog_posts_created,
       (SELECT COUNT(*) FROM tips) as tips_created;