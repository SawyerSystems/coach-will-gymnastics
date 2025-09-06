// Test the final all-day event timing logic
// Should block from 00:01 (12:01 AM) to 23:59 (11:59 PM) Pacific time

console.log('=== FINAL LOGIC TEST ===');

// Test both summer (DST) and winter (Standard) dates
const testDates = [
  "2026-01-17T00:00:00.000Z", // Winter (PST - UTC-8)
  "2026-07-17T00:00:00.000Z"  // Summer (PDT - UTC-7)
];

testDates.forEach((testDate, index) => {
  console.log(`\n--- Test ${index + 1}: ${testDate} ---`);
  
  const startDateString = new Date(testDate).toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
  console.log('Pacific date:', startDateString);
  
  const [startYear, startMonth, startDay] = startDateString.split('-').map(Number);
  
  // Helper function to create Pacific time and convert to UTC
  const createPacificTime = (year, month, day, hour, minute) => {
    const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
    const pacificTimeStr = `${dateStr}T${timeStr}`;
    
    const tempDate = new Date(`${pacificTimeStr}-08:00`); // Assume PST first
    const isDST = month >= 3 && month <= 11; // Rough DST calculation
    
    if (isDST) {
      return new Date(`${pacificTimeStr}-07:00`);
    } else {
      return tempDate;
    }
  };
  
  // Create start time: 00:01 Pacific
  const startOfDayUTC = createPacificTime(startYear, startMonth, startDay, 0, 1);
  
  // Create end time: 23:59 Pacific
  const endOfDayUTC = createPacificTime(startYear, startMonth, startDay, 23, 59);
  
  console.log('Start UTC:', startOfDayUTC.toISOString());
  console.log('End UTC:', endOfDayUTC.toISOString());
  console.log('Start Pacific:', startOfDayUTC.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  console.log('End Pacific:', endOfDayUTC.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  
  const durationMs = endOfDayUTC.getTime() - startOfDayUTC.getTime();
  const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
  const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  console.log(`Duration: ${durationHours} hours ${durationMinutes} minutes (should be 23 hours 58 minutes)`);
});
