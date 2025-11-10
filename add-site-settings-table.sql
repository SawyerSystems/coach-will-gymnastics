-- Create site_settings table for managing site-wide configuration
CREATE TABLE IF NOT EXISTS site_settings (
  id SERIAL PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  description TEXT,
  updated_by INTEGER REFERENCES admins(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Insert default booking pause settings
INSERT INTO site_settings (key, value, description)
VALUES 
  ('bookings_paused', 'false', 'Whether online bookings are currently paused'),
  ('bookings_paused_message', 'We are not accepting new bookings at this time. Please check back later or contact us directly.', 'Message to display when bookings are paused'),
  ('bookings_pause_start', '', 'ISO date/time when booking pause should start (empty = immediate when toggled on)'),
  ('bookings_pause_end', '', 'ISO date/time when booking pause should end and auto-resume (empty = indefinite until manually resumed)')
ON CONFLICT (key) DO NOTHING;

-- Create index on key for faster lookups
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);

COMMENT ON TABLE site_settings IS 'Stores site-wide configuration settings';
COMMENT ON COLUMN site_settings.key IS 'Unique identifier for the setting';
COMMENT ON COLUMN site_settings.value IS 'Setting value (stored as text, parse as needed)';
COMMENT ON COLUMN site_settings.description IS 'Human-readable description of what this setting controls';
