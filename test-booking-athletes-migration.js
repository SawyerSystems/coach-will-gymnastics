
const fetch = require('node-fetch');

const BASE_URL = process.env.SUPABASE_URL;
const API_KEY = process.env.SUPABASE_ANON_KEY;

async function testBookingAthletesMigration() {
  console.log('🧪 Testing Booking Athletes Migration...\n');
  
  try {
    // 1. Test booking creation with athletes array
    console.log('1. Testing booking creation with athletes array...');
    
    const newBooking = {
      lessonType: 'quick-journey',
      preferredDate: '2025-01-10',
      preferredTime: '10:00',
      focusAreas: ['Basic Floor Skills'],
      parentFirstName: 'Test',
      parentLastName: 'Parent',
      parentEmail: 'test@example.com',
      parentPhone: '555-0123',
      emergencyContactName: 'Emergency Contact',
      emergencyContactPhone: '555-0124',
      amount: '40.00',
      athletes: [
        {
          athleteId: 1, // Assuming athlete with ID 1 exists
          slotOrder: 1,
          name: 'Test Athlete',
          dateOfBirth: '2015-01-01',
          allergies: 'None',
          experience: 'beginner',
          photo: ''
        }
      ],
      dropoffPersonRelationship: 'Parent',
      pickupPersonRelationship: 'Parent'
    };

    const createResponse = await fetch('http://localhost:5000/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newBooking)
    });

    if (createResponse.ok) {
      const createdBooking = await createResponse.json();
      console.log('✅ Booking created successfully with ID:', createdBooking.id);
      
      // 2. Test fetching booking with athletes
      console.log('\n2. Testing booking fetch with athletes...');
      
      const fetchResponse = await fetch(`http://localhost:5000/api/bookings/${createdBooking.id}`);
      if (fetchResponse.ok) {
        const fetchedBooking = await fetchResponse.json();
        console.log('✅ Booking fetched successfully');
        console.log('Athletes array:', fetchedBooking.athletes);
        
        if (fetchedBooking.athletes && fetchedBooking.athletes.length > 0) {
          console.log('✅ Athletes array populated correctly');
        } else {
          console.log('❌ Athletes array not populated');
        }
      } else {
        console.log('❌ Failed to fetch booking');
      }
      
      // 3. Test booking list with athletes
      console.log('\n3. Testing booking list with athletes...');
      
      const listResponse = await fetch('http://localhost:5000/api/bookings');
      if (listResponse.ok) {
        const bookings = await listResponse.json();
        console.log('✅ Bookings list fetched successfully');
        
        const bookingWithAthletes = bookings.find(b => b.athletes && b.athletes.length > 0);
        if (bookingWithAthletes) {
          console.log('✅ Found booking with athletes array');
          console.log('Sample booking athletes:', bookingWithAthletes.athletes);
        } else {
          console.log('⚠️ No bookings found with athletes array');
        }
      } else {
        console.log('❌ Failed to fetch bookings list');
      }
      
    } else {
      const error = await createResponse.json();
      console.log('❌ Failed to create booking:', error);
    }

    // 4. Test direct database query
    console.log('\n4. Testing direct database queries...');
    
    const dbTestResponse = await fetch(`${BASE_URL}/rest/v1/booking_athletes?select=*,bookings(id,lesson_type),athletes(name)&limit=5`, {
      headers: {
        'apikey': API_KEY,
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (dbTestResponse.ok) {
      const dbData = await dbTestResponse.json();
      console.log('✅ Direct booking_athletes query successful');
      console.log('Sample data:', dbData.slice(0, 2));
    } else {
      console.log('❌ Direct booking_athletes query failed');
    }

    console.log('\n🎉 Migration test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

if (require.main === module) {
  testBookingAthletesMigration();
}

module.exports = { testBookingAthletesMigration };
