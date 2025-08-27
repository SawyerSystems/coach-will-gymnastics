#!/usr/bin/env node

// Test script for admin email templates
import { sendAdminBookingCancellation, sendAdminBookingReschedule, sendAdminNewBooking, sendAdminNewParent, sendAdminNewAthlete, sendAdminWaiverSigned } from './server/lib/email';

async function testAllAdminEmails() {
  console.log('🧪 Testing all admin email templates...\n');
  
  const adminEmail = 'admin@coachwilltumbles.com';
  const baseUrl = 'http://localhost:5173';
  const testResults = [];
  
  // Test 1: Admin Booking Cancellation
  try {
    console.log('📧 Testing admin booking cancellation...');
    await sendAdminBookingCancellation(adminEmail, {
      bookingId: "TEST-CANCEL-001",
      parentName: "Sarah Johnson",
      parentEmail: "sarah@example.com",
      sessionDate: "Monday, January 15, 2025",
      sessionTime: "3:00 PM",
      lessonType: "Private Lesson",
      athleteNames: ["Emma Johnson"],
      cancellationReason: "Child is sick",
      wantsReschedule: true,
      preferredRescheduleDate: "Wednesday, January 17, 2025",
      preferredRescheduleTime: "4:00 PM",
      adminPanelLink: `${baseUrl}/admin/bookings/TEST-CANCEL-001`
    });
    testResults.push("✅ Admin booking cancellation sent");
    console.log("✅ Admin booking cancellation sent successfully");
  } catch (err) {
    testResults.push(`❌ Admin booking cancellation failed: ${err.message}`);
    console.error(`❌ Admin booking cancellation failed: ${err.message}`);
  }
  
  // Test 2: Admin Booking Reschedule
  try {
    console.log('📧 Testing admin booking reschedule...');
    await sendAdminBookingReschedule(adminEmail, {
      bookingId: "TEST-RESCHEDULE-002",
      parentName: "Mike Smith",
      parentEmail: "mike@example.com",
      originalSessionDate: "Tuesday, January 16, 2025",
      originalSessionTime: "2:00 PM",
      newSessionDate: "Thursday, January 18, 2025",
      newSessionTime: "3:00 PM",
      lessonType: "Group Lesson",
      athleteNames: ["Alex Smith"],
      rescheduleReason: "Coach schedule change",
      adminPanelLink: `${baseUrl}/admin/bookings/TEST-RESCHEDULE-002`
    });
    testResults.push("✅ Admin booking reschedule sent");
    console.log("✅ Admin booking reschedule sent successfully");
  } catch (err) {
    testResults.push(`❌ Admin booking reschedule failed: ${err.message}`);
    console.error(`❌ Admin booking reschedule failed: ${err.message}`);
  }
  
  // Test 3: Admin New Booking
  try {
    console.log('📧 Testing admin new booking...');
    await sendAdminNewBooking(adminEmail, {
      bookingId: "TEST-NEW-BOOKING-003",
      parentName: "Lisa Brown",
      parentEmail: "lisa@example.com",
      parentPhone: "(555) 111-2222",
      athleteNames: ["Sophia Brown", "Mason Brown"],
      sessionDate: "Friday, January 19, 2025",
      sessionTime: "4:00 PM",
      lessonType: "Semi-Private Lesson",
      paymentStatus: "reservation-paid",
      totalAmount: "$90.00",
      specialRequests: "Focus on handstand progression",
      adminPanelLink: `${baseUrl}/admin/bookings/TEST-NEW-BOOKING-003`
    });
    testResults.push("✅ Admin new booking sent");
    console.log("✅ Admin new booking sent successfully");
  } catch (err) {
    testResults.push(`❌ Admin new booking failed: ${err.message}`);
    console.error(`❌ Admin new booking failed: ${err.message}`);
  }
  
  // Test 4: Admin New Parent
  try {
    console.log('📧 Testing admin new parent...');
    await sendAdminNewParent(adminEmail, {
      parentId: "TEST-PARENT-004",
      parentName: "Jennifer Davis",
      parentEmail: "jennifer@example.com",
      parentPhone: "(555) 333-4444",
      registrationDate: new Date().toISOString(),
      athletes: [
        { id: "A001", name: "Olivia Davis", age: 7 },
        { id: "A002", name: "Ethan Davis", age: 9 }
      ],
      adminPanelLink: `${baseUrl}/admin/parents/TEST-PARENT-004`
    });
    testResults.push("✅ Admin new parent sent");
    console.log("✅ Admin new parent sent successfully");
  } catch (err) {
    testResults.push(`❌ Admin new parent failed: ${err.message}`);
    console.error(`❌ Admin new parent failed: ${err.message}`);
  }
  
  // Test 5: Admin New Athlete
  try {
    console.log('📧 Testing admin new athlete...');
    await sendAdminNewAthlete(adminEmail, {
      athleteId: "TEST-ATHLETE-005",
      athleteName: "Isabella Wilson",
      athleteAge: 6,
      athleteGender: "female",
      athleteExperience: "Intermediate",
      parentName: "Robert Wilson",
      parentEmail: "robert@example.com",
      parentPhone: "(555) 555-6666",
      registrationDate: new Date().toISOString(),
      waiverStatus: "pending",
      adminPanelLink: `${baseUrl}/admin/athletes/TEST-ATHLETE-005`
    });
    testResults.push("✅ Admin new athlete sent");
    console.log("✅ Admin new athlete sent successfully");
  } catch (err) {
    testResults.push(`❌ Admin new athlete failed: ${err.message}`);
    console.error(`❌ Admin new athlete failed: ${err.message}`);
  }
  
  // Test 6: Admin Waiver Signed
  try {
    console.log('📧 Testing admin waiver signed...');
    await sendAdminWaiverSigned(adminEmail, {
      waiverId: "TEST-WAIVER-006",
      athleteName: "Lucas Garcia",
      athleteId: "555",
      parentName: "Maria Garcia",
      parentEmail: "maria@example.com",
      signedDate: new Date().toISOString(),
      ipAddress: "198.51.100.42",
      emergencyContactName: "Carlos Garcia",
      emergencyContactPhone: "(555) 777-8888",
      medicalConditions: "Mild asthma, uses inhaler as needed",
      adminPanelLink: `${baseUrl}/admin/waivers/TEST-WAIVER-006`,
      waiverPdfLink: `${baseUrl}/api/waivers/TEST-WAIVER-006/pdf`
    });
    testResults.push("✅ Admin waiver signed sent");
    console.log("✅ Admin waiver signed sent successfully");
  } catch (err) {
    testResults.push(`❌ Admin waiver signed failed: ${err.message}`);
    console.error(`❌ Admin waiver signed failed: ${err.message}`);
  }
  
  // Summary
  console.log('\n🎉 Admin Email Test Results:');
  console.log('============================');
  testResults.forEach(result => console.log(result));
  
  const passed = testResults.filter(r => r.startsWith("✅")).length;
  const failed = testResults.filter(r => r.startsWith("❌")).length;
  
  console.log(`\n📊 Summary: ${passed} passed, ${failed} failed out of ${testResults.length} total tests`);
  
  if (failed === 0) {
    console.log('🎊 All admin email templates are working perfectly!');
  } else {
    console.log('⚠️ Some admin email templates need attention.');
  }
}

// Run the tests
testAllAdminEmails().catch(console.error);
