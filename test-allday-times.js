// Test the new all-day event timing logic
// Should block from 00:01 (12:01 AM) to 23:59 (11:59 PM) Pacific time

// Test date: January 17, 2026
const testStartDate = "2026-01-17T00:00:00.000Z"; // Midnight UTC on Jan 17

console.log('=== NEW IMPROVED LOGIC ===');
console.log('Original date:', testStartDate);

// Simulate the NEW logic
const startDateString = new Date(testStartDate).toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
console.log('Pacific date string:', startDateString);

const [startYear, startMonth, startDay] = startDateString.split('-').map(Number);
console.log('Pacific date components:', { startYear, startMonth, startDay });

// Create start time: 00:01 Pacific (12:01 AM)
const startOfDayPacific = new Date();
startOfDayPacific.setFullYear(startYear, startMonth - 1, startDay); // Month is 0-based
startOfDayPacific.setHours(0, 1, 0, 0); // 00:01:00.000

// Create end time: 23:59 Pacific (11:59 PM) on the same day
const endOfDayPacific = new Date();
endOfDayPacific.setFullYear(startYear, startMonth - 1, startDay);
endOfDayPacific.setHours(23, 59, 0, 0); // 23:59:00.000

console.log('Start Pacific time:', startOfDayPacific.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
console.log('End Pacific time:', endOfDayPacific.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));

// Convert Pacific times to UTC
const pacificStartOffsetMs = startOfDayPacific.getTimezoneOffset() * 60 * 1000;
const pacificEndOffsetMs = endOfDayPacific.getTimezoneOffset() * 60 * 1000;
const startOfDayUTC = new Date(startOfDayPacific.getTime() - pacificStartOffsetMs);
const endOfDayUTC = new Date(endOfDayPacific.getTime() - pacificEndOffsetMs);

console.log('Start UTC time:', startOfDayUTC.toISOString());
console.log('End UTC time:', endOfDayUTC.toISOString());
console.log('Verify Start Pacific:', startOfDayUTC.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
console.log('Verify End Pacific:', endOfDayUTC.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));

// Calculate duration
const durationMs = endOfDayUTC.getTime() - startOfDayUTC.getTime();
const durationHours = durationMs / (1000 * 60 * 60);
const durationMinutes = (durationMs % (1000 * 60 * 60)) / (1000 * 60);
console.log('Duration:', `${durationHours.toFixed(0)} hours ${durationMinutes.toFixed(0)} minutes (should be 23 hours 58 minutes)`);
