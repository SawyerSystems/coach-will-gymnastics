// Test January 2026 logic specifically
console.log('=== Testing January 2026 timezone logic ===');

const testDate = "2026-01-09T00:00:00.000Z";
console.log('Input date:', testDate);

const startDateString = new Date(testDate).toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
console.log('Pacific date string:', startDateString);

const [startYear, startMonth, startDay] = startDateString.split('-').map(Number);
console.log('Parsed date components:', { startYear, startMonth, startDay });

// Create start time: 00:01 Pacific (12:01 AM)
const startOfDayUTC = new Date();
if (startMonth >= 3 && startMonth <= 11) {
  // DST period (March-November): Pacific = UTC-7
  console.log('DST detected (March-November)');
  startOfDayUTC.setUTCFullYear(startYear, startMonth - 1, startDay);
  startOfDayUTC.setUTCHours(7, 1, 0, 0); // 07:01 UTC = 00:01 PDT
} else {
  // Standard time period: Pacific = UTC-8  
  console.log('Standard Time detected (December-February)');
  startOfDayUTC.setUTCFullYear(startYear, startMonth - 1, startDay);
  startOfDayUTC.setUTCHours(8, 1, 0, 0); // 08:01 UTC = 00:01 PST
}

console.log('Start time UTC:', startOfDayUTC.toISOString());
console.log('Start time Pacific:', startOfDayUTC.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));

// Create end time: 23:59 Pacific (11:59 PM)
const endOfDayUTC = new Date();
if (startMonth >= 3 && startMonth <= 11) {
  // DST period: Pacific = UTC-7
  console.log('End time using DST logic');
  endOfDayUTC.setUTCFullYear(startYear, startMonth - 1, startDay);
  endOfDayUTC.setUTCHours(6, 59, 0, 0); // 06:59 UTC = 23:59 PDT
} else {
  // Standard time: Pacific = UTC-8
  console.log('End time using Standard Time logic');
  endOfDayUTC.setUTCFullYear(startYear, startMonth - 1, startDay);
  endOfDayUTC.setUTCHours(7, 59, 0, 0); // 07:59 UTC = 23:59 PST
}

console.log('End time UTC:', endOfDayUTC.toISOString());
console.log('End time Pacific:', endOfDayUTC.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
