-- Clear all parent and athlete data for fresh testing
DELETE FROM bookings;
DELETE FROM athletes;
DELETE FROM parents;
DELETE FROM customers;
DELETE FROM waivers;
DELETE FROM auth_codes;

-- Verify data is cleared
SELECT COUNT(*) as bookings_count FROM bookings;
SELECT COUNT(*) as athletes_count FROM athletes;
SELECT COUNT(*) as parents_count FROM parents;
SELECT COUNT(*) as customers_count FROM customers;
SELECT COUNT(*) as waivers_count FROM waivers;
SELECT COUNT(*) as auth_codes_count FROM auth_codes;