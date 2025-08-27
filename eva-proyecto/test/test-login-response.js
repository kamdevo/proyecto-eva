/**
 * Test script to check the login API response structure
 */

const http = require('http');

const testLogin = async () => {
  console.log('🔍 Testing login API response structure...\n');

  const postData = JSON.stringify({
    username: 'admin',
    password: 'admin123'
  });

  const options = {
    hostname: '127.0.0.1',
    port: 8001,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('📊 Login API Response:');
          console.log('Status Code:', res.statusCode);
          console.log('Response Structure:');
          console.log(JSON.stringify(response, null, 2));
          
          if (response.success && response.data && response.data.user) {
            console.log('\n🔍 User Object Analysis:');
            const user = response.data.user;
            console.log('- User ID:', user.id);
            console.log('- Role ID:', user.rol_id);
            console.log('- Role Name:', user.rol);
            console.log('- Has Permissions:', !!user.permissions);
            console.log('- Permissions Type:', typeof user.permissions);
            console.log('- Permissions Keys:', user.permissions ? Object.keys(user.permissions) : 'N/A');
            console.log('- Permissions Count:', user.permissions ? Object.keys(user.permissions).length : 0);
            
            if (user.permissions) {
              console.log('\n📋 Permissions Structure:');
              for (const [module, perms] of Object.entries(user.permissions)) {
                console.log(`  ${module}:`, perms);
              }
            }
          }
          
          resolve(response);
        } catch (error) {
          console.error('❌ Error parsing response:', error);
          console.log('Raw response:', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request error:', error);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
};

// Run the test
testLogin()
  .then(() => {
    console.log('\n✅ Login API test completed');
  })
  .catch((error) => {
    console.error('\n❌ Login API test failed:', error.message);
  });
