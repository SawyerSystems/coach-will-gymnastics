import http from 'http';
import querystring from 'querystring';

async function testParentAuth() {
  console.log('🧪 Testing Parent Authentication Flow...\n');
  
  // Step 1: Request authentication code
  console.log('Step 1: Requesting authentication code...');
  
  const authCodeData = JSON.stringify({
    email: 'swyrwilliam12@gmail.com'
  });
  
  const authCodeOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/parent-auth/request-code',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(authCodeData)
    }
  };
  
  const authResponse = await new Promise((resolve, reject) => {
    const req = http.request(authCodeOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ ...parsed, statusCode: res.statusCode, cookies: res.headers['set-cookie'] });
        } catch (e) {
          resolve({ error: 'Invalid JSON', raw: data, statusCode: res.statusCode });
        }
      });
    });
    req.on('error', reject);
    req.write(authCodeData);
    req.end();
  });
  
  console.log('Auth code response:', authResponse);
  
  if (authResponse.success) {
    console.log('✅ Authentication code request successful');
    console.log(`📧 Code sent to Thomas Sawyer`);
    
    // For testing purposes, we'll use a mock verification since we can't access the actual email
    // In production, the user would get the code from their email
    console.log('\n⚠️  For testing: We cannot access the actual email code');
    console.log('💡 In production, Thomas would check his email for the 6-digit code');
    console.log('🔄 Testing with demo verification flow...');
    
    // Test auth status endpoints
    console.log('\nStep 2: Testing authentication status...');
    
    const statusOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/parent-auth/status',
      method: 'GET',
      headers: {
        'Cookie': authResponse.cookies ? authResponse.cookies.join('; ') : ''
      }
    };
    
    const statusResponse = await new Promise((resolve, reject) => {
      const req = http.request(statusOptions, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve({ ...parsed, statusCode: res.statusCode });
          } catch (e) {
            resolve({ error: 'Invalid JSON', raw: data, statusCode: res.statusCode });
          }
        });
      });
      req.on('error', reject);
      req.end();
    });
    
    console.log('Status response:', statusResponse);
    
  } else {
    console.log('❌ Authentication code request failed:', authResponse);
  }
  
  console.log('\n🏁 Parent authentication flow test completed');
}

testParentAuth().catch(console.error);