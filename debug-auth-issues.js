
const fs = require('fs');
const path = require('path');

console.log('=== DEBUGGING AUTHENTICATION ISSUES ===\n');

// Helper function to safely read JSON files
function safeReadJSON(filePath, defaultValue = []) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    } else {
      console.log(`File not found: ${filePath}`);
      return defaultValue;
    }
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return defaultValue;
  }
}

// Check if data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  console.log('❌ Data directory does not exist at:', dataDir);
  console.log('This indicates the app is using database storage, not JSON files.');
  console.log('\nTo debug authentication issues, use the API endpoints instead:');
  console.log('1. GET /api/bookings - Check all bookings');
  console.log('2. GET /api/athletes - Check all athletes');
  console.log('3. GET /api/parents - Check all parents');
  console.log('4. POST /api/fix-missing-athletes - Fix missing athlete profiles');
  process.exit(0);
}

// Read data files
const bookingsData = safeReadJSON('./data/bookings.json');
const athletesData = safeReadJSON('./data/athletes.json');
const customersData = safeReadJSON('./data/customers.json');

console.log('Data file status:');
console.log('- Bookings:', bookingsData.length, 'records');
console.log('- Athletes:', athletesData.length, 'records');
console.log('- Customers:', customersData.length, 'records');
console.log('');

// Look for Sawyer family bookings
const sawyerBookings = bookingsData.filter(booking => 
  booking && (
    booking.parentLastName?.toLowerCase().includes('sawyer') ||
    booking.athlete1Name?.toLowerCase().includes('sawyer') ||
    booking.athlete2Name?.toLowerCase().includes('sawyer')
  )
);

console.log('Sawyer Family Bookings:', sawyerBookings.length);
sawyerBookings.forEach((booking, index) => {
  console.log(`- Booking ${index + 1}:`);
  console.log(`  ID: ${booking.id}`);
  console.log(`  Parent: ${booking.parentFirstName} ${booking.parentLastName}`);
  console.log(`  Email: ${booking.parentEmail}`);
  console.log(`  Phone: ${booking.parentPhone}`);
  console.log(`  Athlete 1: ${booking.athlete1Name}`);
  console.log(`  Athlete 2: ${booking.athlete2Name || 'None'}`);
  console.log(`  Status: ${booking.status}`);
  console.log(`  Payment Status: ${booking.paymentStatus}`);
  console.log(`  Waiver Signed: ${booking.waiverSigned}`);
  console.log('---');
});

// Look for Sawyer athletes
const sawyerAthletes = athletesData.filter(athlete => 
  athlete && athlete.name?.toLowerCase().includes('sawyer')
);

console.log('\nSawyer Family Athletes:', sawyerAthletes.length);
sawyerAthletes.forEach((athlete, index) => {
  console.log(`- Athlete ${index + 1}:`);
  console.log(`  ID: ${athlete.id}`);
  console.log(`  Name: ${athlete.name}`);
  console.log(`  Parent ID: ${athlete.parentId}`);
  console.log(`  DOB: ${athlete.dateOfBirth}`);
  console.log('---');
});

// Look for Thomas Sawyer in customers
const sawyerCustomers = customersData.filter(customer => 
  customer && (
    customer.lastName?.toLowerCase().includes('sawyer') ||
    customer.email?.toLowerCase().includes('sawyer')
  )
);

console.log('\nSawyer Family Customers:', sawyerCustomers.length);
sawyerCustomers.forEach((customer, index) => {
  console.log(`- Customer ${index + 1}:`);
  console.log(`  ID: ${customer.id}`);
  console.log(`  Name: ${customer.firstName} ${customer.lastName}`);
  console.log(`  Email: ${customer.email}`);
  console.log(`  Phone: ${customer.phone}`);
  console.log('---');
});

console.log('\n=== SUMMARY ===');
console.log(`Total Sawyer bookings: ${sawyerBookings.length}`);
console.log(`Total Sawyer athletes: ${sawyerAthletes.length}`);
console.log(`Total Sawyer customers: ${sawyerCustomers.length}`);

// Check for authentication issues
if (sawyerBookings.length > 0 && sawyerAthletes.length === 0) {
  console.log('\n⚠️  ISSUE DETECTED: Bookings exist but no athlete profiles created');
  console.log('   This suggests the webhook did not create athlete profiles after payment');
  console.log('   Run: curl -X POST http://localhost:5000/api/fix-missing-athletes');
}

if (sawyerBookings.length > 0 && sawyerCustomers.length === 0) {
  console.log('\n⚠️  ISSUE DETECTED: Bookings exist but no parent/customer profiles created');
  console.log('   This suggests the webhook did not create parent profiles after payment');
}

console.log('\n=== NEXT STEPS ===');
console.log('1. Test parent authentication with email from bookings');
console.log('2. Check if athlete profiles are created after successful payment');
console.log('3. Verify webhook is properly creating parent accounts');
