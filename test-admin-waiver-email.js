// Test script for admin waiver email
const { sendAdminWaiverSigned } = require('./server/lib/email');

const adminEmail = process.env.ADMIN_EMAIL || 'admin@coachwilltumbles.com';
const baseUrl = process.env.BASE_URL || 'http://localhost:5173';

async function testAdminWaiverEmail() {
  try {
    console.log('📧 Testing admin waiver signed email...');
    await sendAdminWaiverSigned(adminEmail, {
      waiverId: "TEST-WAIVER-123",
      athleteName: "Alex Johnson",
      athleteId: "555",
      parentName: "Sarah Johnson",
      parentEmail: "sarah@example.com",
      signedDate: new Date().toISOString(),
      ipAddress: "198.51.100.42",
      emergencyContactName: "Michael Johnson",
      emergencyContactPhone: "(555) 123-4567",
      medicalConditions: "Mild peanut allergy, carries EpiPen",
      adminPanelLink: `${baseUrl}/admin/waivers/TEST-WAIVER-123`,
      waiverPdfLink: `${baseUrl}/api/waivers/TEST-WAIVER-123/pdf`
    });
    console.log("✅ Admin waiver signed email sent successfully");
  } catch (err) {
    console.error("❌ Admin waiver signed email failed:", err.message);
    console.error(err);
  }
}

testAdminWaiverEmail();
