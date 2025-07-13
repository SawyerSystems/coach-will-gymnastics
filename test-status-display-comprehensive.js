import axios from 'axios';

const BASE_URL = 'http://localhost:5001';

// Test credentials
const adminCredentials = {
  email: 'admin@coachwilltumbles.com',
  password: 'TumbleCoach2025!'
};

const parentCredentials = {
  email: 'sawyer@sawyersystems.com'
};

async function makeRequest(method, endpoint, data = null, cookie = '') {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {}
    };

    if (cookie) {
      config.headers.Cookie = cookie;
    }

    if (data) {
      config.data = data;
      config.headers['Content-Type'] = 'application/json';
    }

    const response = await axios(config);
    return { status: response.status, data: response.data, headers: response.headers };
  } catch (error) {
    return { 
      status: error.response?.status || 500, 
      data: error.response?.data || { message: error.message },
      headers: error.response?.headers || {}
    };
  }
}

async function testStatusDisplayComprehensive() {
  console.log('🧪 COMPREHENSIVE STATUS DISPLAY TEST');
  console.log('=' .repeat(50));

  try {
    // 1. Admin Login
    console.log('\n1️⃣ Admin Authentication...');
    const adminLogin = await makeRequest('POST', '/api/auth/login', adminCredentials);
    
    if (adminLogin.status !== 200) {
      throw new Error(`Admin login failed: ${adminLogin.data.message}`);
    }
    
    const adminCookie = adminLogin.headers['set-cookie'] ? adminLogin.headers['set-cookie'][0] : '';
    console.log('✅ Admin authenticated successfully');

    // 2. Get all bookings to examine current status states
    console.log('\n2️⃣ Fetching All Bookings...');
    const bookingsResponse = await makeRequest('GET', '/api/bookings', null, adminCookie);
    
    if (bookingsResponse.status !== 200) {
      throw new Error(`Failed to fetch bookings: ${bookingsResponse.data.message}`);
    }
    
    const bookings = bookingsResponse.data;
    console.log(`📊 Found ${bookings.length} total bookings`);
    
    // Analyze current status distribution
    const statusAnalysis = {
      paymentStatuses: {},
      attendanceStatuses: {},
      waiverStatuses: { signed: 0, unsigned: 0 }
    };
    
    bookings.forEach(booking => {
      // Payment status analysis
      const paymentStatus = booking.paymentStatus || 'unknown';
      statusAnalysis.paymentStatuses[paymentStatus] = (statusAnalysis.paymentStatuses[paymentStatus] || 0) + 1;
      
      // Attendance status analysis
      const attendanceStatus = booking.attendanceStatus || 'unknown';
      statusAnalysis.attendanceStatuses[attendanceStatus] = (statusAnalysis.attendanceStatuses[attendanceStatus] || 0) + 1;
      
      // Waiver status analysis
      if (booking.waiverSigned) {
        statusAnalysis.waiverStatuses.signed++;
      } else {
        statusAnalysis.waiverStatuses.unsigned++;
      }
    });
    
    console.log('\n📈 STATUS DISTRIBUTION ANALYSIS:');
    console.log('Payment Statuses:', statusAnalysis.paymentStatuses);
    console.log('Attendance Statuses:', statusAnalysis.attendanceStatuses);
    console.log('Waiver Statuses:', statusAnalysis.waiverStatuses);

    // 3. Test individual booking status details
    console.log('\n3️⃣ DETAILED BOOKING STATUS EXAMINATION:');
    console.log('-'.repeat(40));
    
    bookings.slice(0, 3).forEach((booking, index) => {
      console.log(`\n📋 Booking ${index + 1} (ID: ${booking.id}):`);
      console.log(`   Athlete: ${booking.athlete1Name || 'Unknown'}`);
      console.log(`   Date: ${booking.preferredDate}`);
      console.log(`   💰 Payment Status: ${booking.paymentStatus || 'not-set'}`);
      console.log(`   📋 Attendance Status: ${booking.attendanceStatus || 'not-set'}`);
      console.log(`   📝 Waiver Signed: ${booking.waiverSigned ? 'Yes' : 'No'}`);
      console.log(`   🔗 Stripe Session: ${booking.stripeSessionId || 'None'}`);
      console.log(`   💵 Amount: $${booking.amount || '0'}`);
      console.log(`   🏷️ Overall Status: ${booking.status || 'not-set'}`);
    });

    // 4. Test Parent Portal Authentication & Status Display
    console.log('\n4️⃣ PARENT PORTAL STATUS DISPLAY TEST:');
    console.log('-'.repeat(40));
    
    // Request parent auth code
    const authCodeRequest = await makeRequest('POST', '/api/parent-auth/request-code', {
      email: parentCredentials.email
    });
    
    if (authCodeRequest.status === 200 || authCodeRequest.status === 429) {
      console.log('✅ Parent auth code request successful (or rate limited - OK)');
      
      // Try to get parent bookings (if already authenticated)
      const parentBookings = await makeRequest('GET', '/api/parent/bookings');
      
      if (parentBookings.status === 200) {
        console.log(`📊 Parent has ${parentBookings.data.length} bookings visible`);
        
        parentBookings.data.forEach((booking, index) => {
          console.log(`\n👨‍👩‍👧‍👦 Parent View - Booking ${index + 1}:`);
          console.log(`   Athlete: ${booking.athlete1Name || 'Unknown'}`);
          console.log(`   Date: ${booking.preferredDate}`);
          console.log(`   💰 Payment Display: ${booking.paymentStatus || 'not-shown'}`);
          console.log(`   📋 Status Display: ${booking.status || 'not-shown'}`);
          console.log(`   📝 Waiver Display: ${booking.waiverSigned ? 'Signed' : 'Not Signed'}`);
        });
      } else {
        console.log('⚠️  Parent not authenticated or bookings not accessible');
      }
    }

    // 5. Test Status Update Endpoints
    console.log('\n5️⃣ STATUS UPDATE FUNCTIONALITY TEST:');
    console.log('-'.repeat(40));
    
    if (bookings.length > 0) {
      const testBooking = bookings[0];
      console.log(`🧪 Testing with booking ID: ${testBooking.id}`);
      
      // Test payment status update
      const paymentUpdate = await makeRequest('PATCH', `/api/bookings/${testBooking.id}/payment-status`, {
        paymentStatus: 'session-paid'
      }, adminCookie);
      
      if (paymentUpdate.status === 200) {
        console.log('✅ Payment status update endpoint working');
        console.log('   New payment status:', paymentUpdate.data.paymentStatus);
      } else {
        console.log('❌ Payment status update failed:', paymentUpdate.data.message);
      }
      
      // Test attendance status update
      const attendanceUpdate = await makeRequest('PATCH', `/api/bookings/${testBooking.id}/attendance-status`, {
        attendanceStatus: 'completed'
      }, adminCookie);
      
      if (attendanceUpdate.status === 200) {
        console.log('✅ Attendance status update endpoint working');
        console.log('   New attendance status:', attendanceUpdate.data.attendanceStatus);
      } else {
        console.log('❌ Attendance status update failed:', attendanceUpdate.data.message);
      }
      
      // Revert changes
      await makeRequest('PATCH', `/api/bookings/${testBooking.id}/payment-status`, {
        paymentStatus: testBooking.paymentStatus || 'unpaid'
      }, adminCookie);
      
      await makeRequest('PATCH', `/api/bookings/${testBooking.id}/attendance-status`, {
        attendanceStatus: testBooking.attendanceStatus || 'pending'
      }, adminCookie);
      
      console.log('🔄 Test changes reverted');
    }

    // 6. Test Webhook Simulation
    console.log('\n6️⃣ STRIPE WEBHOOK SIMULATION TEST:');
    console.log('-'.repeat(40));
    
    // Test the admin sync function
    const syncResponse = await makeRequest('POST', '/api/admin/reset-payment-status', null, adminCookie);
    
    if (syncResponse.status === 200) {
      console.log('✅ Stripe sync endpoint working');
      console.log('   Sync result:', syncResponse.data.message);
      console.log('   Updated bookings:', syncResponse.data.updated || 0);
    } else {
      console.log('❌ Stripe sync failed:', syncResponse.data.message);
    }

    // 7. Check for Status Inconsistencies
    console.log('\n7️⃣ STATUS CONSISTENCY CHECK:');
    console.log('-'.repeat(40));
    
    const inconsistencies = [];
    
    bookings.forEach(booking => {
      // Check for payment/attendance inconsistencies
      if (booking.paymentStatus === 'session-paid' && booking.attendanceStatus === 'pending') {
        inconsistencies.push({
          id: booking.id,
          issue: 'Payment marked as session-paid but attendance still pending',
          payment: booking.paymentStatus,
          attendance: booking.attendanceStatus
        });
      }
      
      if (booking.paymentStatus === 'unpaid' && booking.attendanceStatus === 'confirmed') {
        inconsistencies.push({
          id: booking.id,
          issue: 'Attendance confirmed but payment unpaid',
          payment: booking.paymentStatus,
          attendance: booking.attendanceStatus
        });
      }
      
      // Check for missing Stripe session on paid bookings
      if ((booking.paymentStatus === 'reservation-paid' || booking.paymentStatus === 'session-paid') && !booking.stripeSessionId) {
        inconsistencies.push({
          id: booking.id,
          issue: 'Payment marked as paid but no Stripe session ID',
          payment: booking.paymentStatus,
          stripeSession: booking.stripeSessionId
        });
      }
    });
    
    if (inconsistencies.length === 0) {
      console.log('✅ No status inconsistencies found');
    } else {
      console.log(`❌ Found ${inconsistencies.length} status inconsistencies:`);
      inconsistencies.forEach((issue, index) => {
        console.log(`   ${index + 1}. Booking ${issue.id}: ${issue.issue}`);
      });
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎯 COMPREHENSIVE STATUS TEST COMPLETE');
    console.log('=' .repeat(50));
    
    // Summary recommendations
    console.log('\n📋 RECOMMENDATIONS:');
    if (Object.keys(statusAnalysis.paymentStatuses).length > 5) {
      console.log('⚠️  Many different payment statuses found - consider consolidation');
    }
    
    if (statusAnalysis.waiverStatuses.unsigned > statusAnalysis.waiverStatuses.signed) {
      console.log('⚠️  More unsigned waivers than signed - check waiver flow');
    }
    
    if (inconsistencies.length > 0) {
      console.log('🔧 Status inconsistencies found - recommend implementing webhook automation');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testStatusDisplayComprehensive().catch(console.error);
