// manual-fix-test.mjs
import 'dotenv/config';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testAdminEmailWithBothLessonTypeFormats() {
  console.log('🧪 Testing admin email with both string and object lessonType formats');
  
  try {
    // Import directly instead of using the dynamic import
    const emailModule = await import('./server/lib/email.ts');
    const { sendAdminNewBooking } = emailModule;
    
    // The admin email we'll send to
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@coachwilltumbles.com';
    
    console.log(`Using admin email: ${adminEmail}`);
    
    // Base test data
    const baseData = {
      bookingId: "12345",
      parentName: "Test Parent",
      parentEmail: "test@example.com",
      parentPhone: "555-123-4567",
      athleteNames: ["Test Athlete"],
      sessionDate: "2025-09-15",
      sessionTime: "10:00 AM",
      paymentStatus: "reservation-paid",
      totalAmount: "40",
      specialRequests: "This is a test",
      adminPanelLink: "http://localhost:5173/admin/bookings/12345",
      bookingMethod: "Website"
    };
    
    // Test with string lessonType
    console.log('\n🔍 Testing with string lessonType:');
    const stringData = {
      ...baseData,
      lessonType: "Quick Journey"
    };
    
    try {
      console.log('Sending admin email with string lessonType...');
      const stringResult = await sendAdminNewBooking(adminEmail, stringData);
      console.log('✅ String lessonType test succeeded:', stringResult);
    } catch (stringError) {
      console.error('❌ String lessonType test failed:', stringError);
    }
    
    // Test with object lessonType
    console.log('\n🔍 Testing with object lessonType:');
    const objectData = {
      ...baseData,
      lessonType: {
        id: 1,
        name: "Quick Journey",
        duration: 30,
        price: 40,
        description: "Perfect for skill checks, focused practice, or when time is limited",
        key: "quick-journey"
      }
    };
    
    try {
      console.log('Sending admin email with object lessonType...');
      const objectResult = await sendAdminNewBooking(adminEmail, objectData);
      console.log('✅ Object lessonType test succeeded:', objectResult);
    } catch (objectError) {
      console.error('❌ Object lessonType test failed:', objectError);
    }
    
  } catch (error) {
    console.error('❌ Test setup failed:', error);
  }
}

// Run the tests
testAdminEmailWithBothLessonTypeFormats().catch(console.error);
