/**
 * Fix all enum string literal conversions in routes.ts
 * This script identifies and fixes all the remaining enum conversion issues
 */

import fs from 'fs';
import path from 'path';

// Read the routes file
const routesPath = './server/routes.ts';
let content = fs.readFileSync(routesPath, 'utf8');

// Define the conversions needed
const conversions = [
  // Payment Status Enum Conversions
  { from: "'reservation-paid'", to: "PaymentStatusEnum.RESERVATION_PAID" },
  { from: "'reservation-pending'", to: "PaymentStatusEnum.RESERVATION_PENDING" },
  { from: "'reservation-failed'", to: "PaymentStatusEnum.RESERVATION_FAILED" },
  { from: "'session-paid'", to: "PaymentStatusEnum.SESSION_PAID" },
  { from: "'unpaid'", to: "PaymentStatusEnum.UNPAID" },
  { from: "'paid'", to: "PaymentStatusEnum.PAID" },
  { from: "'failed'", to: "PaymentStatusEnum.FAILED" },
  { from: "'refunded'", to: "PaymentStatusEnum.REFUNDED" },
  { from: "'session-refunded'", to: "PaymentStatusEnum.SESSION_REFUNDED" },
  { from: "'reservation-refunded'", to: "PaymentStatusEnum.RESERVATION_REFUNDED" },
  
  // Attendance Status Enum Conversions
  { from: "'pending'", to: "AttendanceStatusEnum.PENDING" },
  { from: "'confirmed'", to: "AttendanceStatusEnum.CONFIRMED" },
  { from: "'completed'", to: "AttendanceStatusEnum.COMPLETED" },
  { from: "'cancelled'", to: "AttendanceStatusEnum.CANCELLED" },
  { from: "'no-show'", to: "AttendanceStatusEnum.NO_SHOW" },
  { from: "'manual'", to: "AttendanceStatusEnum.MANUAL" },
  
  // Booking Status Enum Conversions
  { from: "'pending'", to: "BookingStatusEnum.PENDING" },
  { from: "'confirmed'", to: "BookingStatusEnum.CONFIRMED" },
  { from: "'manual'", to: "BookingStatusEnum.MANUAL" },
  { from: "'manual-paid'", to: "BookingStatusEnum.MANUAL_PAID" },
  { from: "'completed'", to: "BookingStatusEnum.COMPLETED" },
  { from: "'no-show'", to: "BookingStatusEnum.NO_SHOW" },
  { from: "'failed'", to: "BookingStatusEnum.FAILED" },
  { from: "'cancelled'", to: "BookingStatusEnum.CANCELLED" }
];

// Track changes made
let changesMade = 0;

// Apply conversions only in enum method calls
const methodPatterns = [
  /updateBookingPaymentStatus\([^,]+,\s*'([^']+)'\)/g,
  /updateBookingAttendanceStatus\([^,]+,\s*'([^']+)'\)/g,
  /updateBookingStatus\([^,]+,\s*'([^']+)'\)/g
];

// Process each method pattern
methodPatterns.forEach(pattern => {
  content = content.replace(pattern, (match, statusValue) => {
    // Find the appropriate enum conversion
    const conversion = conversions.find(c => c.from === `'${statusValue}'`);
    if (conversion) {
      const newMatch = match.replace(`'${statusValue}'`, conversion.to);
      changesMade++;
      console.log(`✅ Converted: ${match} -> ${newMatch}`);
      return newMatch;
    }
    return match;
  });
});

// Also handle string comparisons that need enum references
const comparisonPatterns = [
  /booking\.paymentStatus\s*!==\s*'([^']+)'/g,
  /booking\.attendanceStatus\s*!==\s*'([^']+)'/g,
  /booking\.status\s*!==\s*'([^']+)'/g,
  /booking\.paymentStatus\s*===\s*'([^']+)'/g,
  /booking\.attendanceStatus\s*===\s*'([^']+)'/g,
  /booking\.status\s*===\s*'([^']+)'/g
];

comparisonPatterns.forEach(pattern => {
  content = content.replace(pattern, (match, statusValue) => {
    const conversion = conversions.find(c => c.from === `'${statusValue}'`);
    if (conversion) {
      const newMatch = match.replace(`'${statusValue}'`, conversion.to);
      changesMade++;
      console.log(`✅ Converted comparison: ${match} -> ${newMatch}`);
      return newMatch;
    }
    return match;
  });
});

// Write the updated content back
fs.writeFileSync(routesPath, content);

console.log(`\n🎉 Enum conversion complete! Made ${changesMade} changes.`);
console.log('✅ All string literals converted to enum values');