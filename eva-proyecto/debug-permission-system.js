/**
 * Debug script to test the permission system and identify issues
 */

const http = require('http');

const testLogin = async (username, password) => {
  console.log(`🔍 Testing login for user: ${username}`);

  const postData = JSON.stringify({
    username: username,
    password: password
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
          console.log(`📊 Login Response for ${username}:`);
          console.log('Status Code:', res.statusCode);
          console.log('Success:', response.success);
          
          if (response.success) {
            // Check different possible response structures
            let user = null;
            if (response.data && response.data.user) {
              user = response.data.user;
            } else if (response.user) {
              user = response.user;
            }

            if (user) {
            console.log('\n🔍 User Data Analysis:');
            console.log('- User ID:', user.id);
            console.log('- Name:', user.nombre);
            console.log('- Role ID:', user.rol_id);
            console.log('- Role Name:', user.rol);
            console.log('- Has Permissions:', !!user.permissions);
            console.log('- Permissions Type:', typeof user.permissions);
            
            if (user.permissions) {
              console.log('- Permissions Keys:', Object.keys(user.permissions));
              console.log('- Permissions Count:', Object.keys(user.permissions).length);
              
              console.log('\n📋 Permissions Structure:');
              for (const [module, perms] of Object.entries(user.permissions)) {
                console.log(`  ${module}:`, perms);
              }
            } else {
              console.log('❌ No permissions found in user object');
            }
            
            // Check if this should be an admin user
            if (user.rol_id === 1) {
              console.log('\n✅ This is a Super Administrator (Role ID 1)');
              console.log('   Should have full access to all modules');
            } else if (user.rol_id === 2) {
              console.log('\n✅ This is an Administrator (Role ID 2)');
              console.log('   Should have administrative privileges');
            } else {
              console.log(`\n📝 This is a ${user.rol} (Role ID ${user.rol_id})`);
            }
            } else {
              console.log('❌ No user data found in response');
              console.log('Response structure:', Object.keys(response));
            }
          } else {
            console.log('❌ Login failed or invalid response structure');
            if (response.message) {
              console.log('Error message:', response.message);
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

// Test different user credentials (correct admin credentials provided)
const testUsers = [
  { username: 'admin', password: 'admin' },
  { username: 'admin', password: 'admin123' },
  { username: 'jperez', password: 'password123' }
];

async function runTests() {
  console.log('🧪 PERMISSION SYSTEM DEBUG TESTS');
  console.log('=================================\n');

  for (const testUser of testUsers) {
    try {
      await testLogin(testUser.username, testUser.password);
      console.log('\n' + '='.repeat(50) + '\n');
      break; // Stop after first successful login
    } catch (error) {
      console.log(`❌ Failed to login with ${testUser.username}/${testUser.password}`);
      console.log('Error:', error.message);
      console.log('\n' + '-'.repeat(30) + '\n');
    }
  }

  console.log('🔍 PERMISSION SYSTEM ANALYSIS COMPLETE');
  console.log('\n📋 EXPECTED BEHAVIOR:');
  console.log('1. Super Admin (Role ID 1) should have full access');
  console.log('2. Admin (Role ID 2) should have administrative access');
  console.log('3. User permissions should be loaded from acciones table');
  console.log('4. Frontend should recognize admin users correctly');
  console.log('\n🔧 NEXT STEPS:');
  console.log('1. Verify user role_id in database');
  console.log('2. Check if permissions are being loaded correctly');
  console.log('3. Ensure frontend permission service handles admin users');
  console.log('4. Test with actual admin credentials');
}

runTests().catch(console.error);
