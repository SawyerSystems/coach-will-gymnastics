#!/usr/bin/env node
/**
 * Comprehensive Test Suite for Coach Will Gymnastics
 * Consolidates all test functionality into a single, organized suite
 */

import 'dotenv/config';
import fs from 'fs';
import http from 'http';

// Test configuration
const TEST_CONFIG = {
  hostname: 'localhost',
  port: 5001,
  timeout: 30000,
  testEmail: 'test@example.com',
  adminEmail: 'admin@coachwilltumbles.com'
};

// Test utilities
class TestUtils {
  static makeRequest(method, path, body = null, headers = {}) {
    const options = {
      hostname: TEST_CONFIG.hostname,
      port: TEST_CONFIG.port,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      timeout: TEST_CONFIG.timeout
    };

    return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsedData = data ? JSON.parse(data) : {};
            resolve({
              status: res.statusCode,
              data: parsedData,
              headers: res.headers,
              raw: data
            });
          } catch (e) {
            resolve({
              status: res.statusCode,
              data: null,
              headers: res.headers,
              raw: data
            });
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => reject(new Error('Request timeout')));
      
      if (body) {
        req.write(typeof body === 'string' ? body : JSON.stringify(body));
      }
      
      req.end();
    });
  }

  static log(message, type = 'info') {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      error: '\x1b[31m',
      warning: '\x1b[33m',
      reset: '\x1b[0m'
    };
    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
  }

  static async authenticateAdmin() {
    const loginData = {
      email: 'admin@coachwilltumbles.com',
      password: 'TumbleCoach2025!'
    };

    const response = await this.makeRequest('POST', '/api/auth/login', loginData);
    
    if (response.status === 200 && response.headers['set-cookie']) {
      const sessionCookie = response.headers['set-cookie']
        .find(cookie => cookie.startsWith('cwt.sid'))
        ?.split(';')[0];
      return sessionCookie;
    }
    
    throw new Error(`Admin authentication failed: ${response.status} - ${JSON.stringify(response.data)}`);
  }
}

// Test suite classes
class DatabaseTests {
  static async runAll() {
    TestUtils.log('Starting Database Tests', 'info');
    const results = [];

    try {
      // Test database connectivity using a public endpoint
      const dbTest = await TestUtils.makeRequest('GET', '/api/focus-areas');
      results.push({
        name: 'Database Connectivity',
        passed: dbTest.status === 200,
        details: `Status: ${dbTest.status}`
      });

      // Test schema integrity
      const schemaTest = await TestUtils.makeRequest('GET', '/api/focus-areas');
      results.push({
        name: 'Schema Integrity',
        passed: schemaTest.status === 200 && Array.isArray(schemaTest.data),
        details: `Focus areas count: ${schemaTest.data?.length || 0}`
      });

      return results;
    } catch (error) {
      TestUtils.log(`Database tests failed: ${error.message}`, 'error');
      return results;
    }
  }
}

class APITests {
  static async runAll() {
    TestUtils.log('Starting API Tests', 'info');
    const results = [];

    try {
      // Test public endpoints
      const endpoints = [
        { path: '/api/site-content', name: 'Site Content API' },
        { path: '/api/focus-areas', name: 'Focus Areas API' },
        { path: '/api/apparatus', name: 'Apparatus API' },
        { path: '/api/stripe/products', name: 'Stripe Products API' }
      ];

      for (const endpoint of endpoints) {
        const response = await TestUtils.makeRequest('GET', endpoint.path);
        results.push({
          name: endpoint.name,
          passed: response.status === 200,
          details: `Status: ${response.status}`
        });
      }

      // Test booking creation
      const bookingData = {
        lessonType: 'quick-journey',
        parentFirstName: 'Test',
        parentLastName: 'Parent',
        parentEmail: TEST_CONFIG.testEmail,
        parentPhone: '555-0123',
        emergencyContactName: 'Emergency Contact',
        emergencyContactPhone: '555-0124',
        preferredDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        preferredTime: '10:00',
        focusAreaIds: [1],
        amount: 40,
        athletes: [{
          slotOrder: 1,
          name: 'Test Athlete',
          dateOfBirth: '2012-01-01',
          allergies: 'None',
          experience: 'beginner'
        }]
      };

      // Test booking creation (using admin endpoint)
      try {
        const adminCookie = await TestUtils.authenticateAdmin();
        const bookingResponse = await TestUtils.makeRequest('POST', '/api/booking/manual-booking', bookingData, {
          'Cookie': adminCookie
        });
        results.push({
          name: 'Booking Creation',
          passed: bookingResponse.status === 201 || bookingResponse.status === 200,
          details: `Status: ${bookingResponse.status}`
        });
      } catch (error) {
        results.push({
          name: 'Booking Creation',
          passed: false,
          details: `Error: ${error.message}`
        });
      }

      return results;
    } catch (error) {
      TestUtils.log(`API tests failed: ${error.message}`, 'error');
      return results;
    }
  }
}

class AuthenticationTests {
  static async runAll() {
    TestUtils.log('Starting Authentication Tests', 'info');
    const results = [];

    try {
      // Test admin authentication
      try {
        const adminCookie = await TestUtils.authenticateAdmin();
        results.push({
          name: 'Admin Authentication',
          passed: !!adminCookie,
          details: 'Admin login successful'
        });
      } catch (error) {
        results.push({
          name: 'Admin Authentication',
          passed: false,
          details: error.message
        });
      }

      // Test parent auth code request
      const authCodeData = { email: TEST_CONFIG.testEmail };
      const authResponse = await TestUtils.makeRequest('POST', '/api/parent-auth/request-code', authCodeData);
      results.push({
        name: 'Parent Auth Code Request',
        passed: authResponse.status === 200 || authResponse.status === 404, // 404 is expected if no parent exists
        details: `Status: ${authResponse.status}`
      });

      // Test protected endpoint access (without authentication)
      // Make a fresh request without any cookies to test unauthorized access
      const protectedResponse = await TestUtils.makeRequest('GET', '/api/bookings', null, { 'Cookie': '' });
      results.push({
        name: 'Protected Endpoint Security',
        passed: protectedResponse.status === 401 || protectedResponse.status === 403,
        details: `Correctly blocked unauthorized access: ${protectedResponse.status}`
      });

      return results;
    } catch (error) {
      TestUtils.log(`Authentication tests failed: ${error.message}`, 'error');
      return results;
    }
  }
}

class IntegrationTests {
  static async runAll() {
    TestUtils.log('Starting Integration Tests', 'info');
    const results = [];

    try {
      // Test complete booking flow
      const bookingData = {
        lessonType: 'deep-dive',
        parentFirstName: 'Integration',
        parentLastName: 'Parent',
        parentEmail: 'integration@test.com',
        parentPhone: '555-9999',
        emergencyContactName: 'Emergency Test',
        emergencyContactPhone: '555-9998',
        preferredDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split('T')[0],
        preferredTime: '14:00',
        focusAreaIds: [2],
        amount: 60,
        athletes: [{
          slotOrder: 1,
          name: 'Integration Test Athlete',
          dateOfBirth: '2010-06-15',
          allergies: 'None',
          experience: 'intermediate'
        }]
      };

      // Create booking (using admin endpoint)
      let createResponse, bookingId;
      try {
        const adminCookie = await TestUtils.authenticateAdmin();
        createResponse = await TestUtils.makeRequest('POST', '/api/booking/manual-booking', bookingData, {
          'Cookie': adminCookie
        });
        // Fix: bookingId should be extracted from data.booking.id
        bookingId = createResponse.data?.booking?.id;
      } catch (error) {
        createResponse = { status: 500, data: null };
      }
      
      results.push({
        name: 'Booking Creation Flow',
        passed: (createResponse.status === 201 || createResponse.status === 200) && !!bookingId,
        details: `Created booking ID: ${bookingId}`
      });

      if (bookingId) {
        // Check booking appears in list (send admin cookie)
        const listResponse = await TestUtils.makeRequest('GET', '/api/bookings', null, {
          'Cookie': adminCookie
        });
        // Support both array and object response
        const bookings = Array.isArray(listResponse.data) ? listResponse.data : listResponse.data.bookings;
        const foundBooking = bookings?.find(b => b.id === bookingId);

        results.push({
          name: 'Booking Retrieval',
          passed: !!foundBooking,
          details: `Booking found in list: ${!!foundBooking}`
        });

        // Test Stripe session creation (send admin cookie)
        const stripeData = {
          booking_id: bookingId,
          success_url: 'http://localhost:5001/success',
          cancel_url: 'http://localhost:5001/cancel'
        };
        const stripeResponse = await TestUtils.makeRequest('POST', '/api/stripe/create-session', stripeData, {
          'Cookie': adminCookie
        });
        results.push({
          name: 'Stripe Integration',
          passed: stripeResponse.status === 200 && !!stripeResponse.data?.url,
          details: `Stripe session created: ${!!stripeResponse.data?.url}`
        });
      }

      // Test data relationships (using admin authentication)
      try {
        const adminCookie = await TestUtils.authenticateAdmin();
        const athletesResponse = await TestUtils.makeRequest('GET', '/api/athletes', null, {
          'Cookie': adminCookie
        });
        const parentsResponse = await TestUtils.makeRequest('GET', '/api/parents', null, {
          'Cookie': adminCookie
        });
        
        results.push({
          name: 'Data Relationships',
          passed: athletesResponse.status === 200 && parentsResponse.status === 200,
          details: `Athletes: ${athletesResponse.data?.length || 0}, Parents: ${parentsResponse.data?.length || 0}`
        });
      } catch (error) {
        results.push({
          name: 'Data Relationships',
          passed: false,
          details: `Error: ${error.message}`
        });
      }

      return results;
    } catch (error) {
      TestUtils.log(`Integration tests failed: ${error.message}`, 'error');
      return results;
    }
  }
}

class PerformanceTests {
  static async runAll() {
    TestUtils.log('Starting Performance Tests', 'info');
    const results = [];

    try {
      // Test response times for PUBLIC endpoints only
      const publicEndpoints = [
        '/api/site-content',
        '/api/focus-areas',
        '/api/apparatus',
        '/api/stripe/products'
      ];

      for (const endpoint of publicEndpoints) {
        const start = Date.now();
        const response = await TestUtils.makeRequest('GET', endpoint);
        const duration = Date.now() - start;
        
        results.push({
          name: `Response Time: ${endpoint}`,
          passed: duration < 2000 && response.status === 200,
          details: `${duration}ms (target: <2000ms)`
        });
      }

      // Test concurrent requests
      const concurrentStart = Date.now();
      const concurrentRequests = Array(5).fill(0).map(() => 
        TestUtils.makeRequest('GET', '/api/site-content')
      );
      
      const concurrentResults = await Promise.all(concurrentRequests);
      const concurrentDuration = Date.now() - concurrentStart;
      const allSuccessful = concurrentResults.every(r => r.status === 200);
      
      results.push({
        name: 'Concurrent Request Handling',
        passed: allSuccessful && concurrentDuration < 5000,
        details: `5 requests in ${concurrentDuration}ms, all successful: ${allSuccessful}`
      });

      return results;
    } catch (error) {
      TestUtils.log(`Performance tests failed: ${error.message}`, 'error');
      return results;
    }
  }
}

// Main test runner
class TestRunner {
  static async runAll() {
    console.clear();
    TestUtils.log('🧪 Starting Comprehensive Test Suite for Coach Will Gymnastics', 'info');
    TestUtils.log('============================================================', 'info');

    const allResults = [];
    const testSuites = [
      { name: 'Database Tests', suite: DatabaseTests },
      { name: 'API Tests', suite: APITests },
      { name: 'Authentication Tests', suite: AuthenticationTests },
      { name: 'Integration Tests', suite: IntegrationTests },
      { name: 'Performance Tests', suite: PerformanceTests }
    ];

    for (const { name, suite } of testSuites) {
      TestUtils.log(`\n📋 Running ${name}...`, 'info');
      try {
        const results = await suite.runAll();
        allResults.push({ suiteName: name, results });
        
        const passed = results.filter(r => r.passed).length;
        const total = results.length;
        const color = passed === total ? 'success' : 'warning';
        TestUtils.log(`${name}: ${passed}/${total} tests passed`, color);
        
        // Show failed tests
        const failed = results.filter(r => !r.passed);
        if (failed.length > 0) {
          failed.forEach(test => {
            TestUtils.log(`  ❌ ${test.name}: ${test.details}`, 'error');
          });
        }
      } catch (error) {
        TestUtils.log(`${name} suite failed: ${error.message}`, 'error');
        allResults.push({ suiteName: name, results: [], error: error.message });
      }
    }

    // Generate summary report
    this.generateSummaryReport(allResults);
  }

  static generateSummaryReport(allResults) {
    TestUtils.log('\n🎯 Test Suite Summary Report', 'info');
    TestUtils.log('============================', 'info');

    let totalPassed = 0;
    let totalTests = 0;
    let criticalFailures = [];

    allResults.forEach(({ suiteName, results, error }) => {
      if (error) {
        criticalFailures.push(`${suiteName}: ${error}`);
        return;
      }

      const passed = results.filter(r => r.passed).length;
      const total = results.length;
      totalPassed += passed;
      totalTests += total;

      const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;
      const status = percentage === 100 ? '✅' : percentage >= 75 ? '⚠️' : '❌';
      
      TestUtils.log(`${status} ${suiteName}: ${passed}/${total} (${percentage}%)`, 
        percentage === 100 ? 'success' : percentage >= 75 ? 'warning' : 'error');
    });

    TestUtils.log('\n📊 Overall Results:', 'info');
    const overallPercentage = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0;
    TestUtils.log(`Total: ${totalPassed}/${totalTests} tests passed (${overallPercentage}%)`, 
      overallPercentage >= 90 ? 'success' : overallPercentage >= 75 ? 'warning' : 'error');

    if (criticalFailures.length > 0) {
      TestUtils.log('\n🚨 Critical Failures:', 'error');
      criticalFailures.forEach(failure => TestUtils.log(`  ${failure}`, 'error'));
    }

    // System health assessment
    TestUtils.log('\n🏥 System Health Assessment:', 'info');
    if (overallPercentage >= 95) {
      TestUtils.log('🟢 EXCELLENT - System is production ready', 'success');
    } else if (overallPercentage >= 85) {
      TestUtils.log('🟡 GOOD - System is stable with minor issues', 'warning');
    } else if (overallPercentage >= 70) {
      TestUtils.log('🟠 FAIR - System needs attention before production', 'warning');
    } else {
      TestUtils.log('🔴 POOR - System requires immediate fixes', 'error');
    }

    // Save report to file
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        totalPassed,
        totalTests,
        overallPercentage,
        criticalFailures
      },
      suites: allResults
    };

    try {
      fs.writeFileSync('test-report.json', JSON.stringify(reportData, null, 2));
      TestUtils.log('\n📄 Detailed report saved to test-report.json', 'info');
    } catch (error) {
      TestUtils.log(`Failed to save report: ${error.message}`, 'warning');
    }
  }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  TestRunner.runAll().catch(error => {
    TestUtils.log(`Test suite failed: ${error.message}`, 'error');
    process.exit(1);
  });
}

export { TestRunner, TestUtils };
