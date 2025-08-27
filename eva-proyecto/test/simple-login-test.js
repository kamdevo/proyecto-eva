/**
 * Simple login test to see the exact response structure
 */

const http = require('http');

const testLogin = async () => {
  console.log('🔍 Testing admin login...');

  const postData = JSON.stringify({
    username: 'admin',
    password: 'admin'
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
          console.log('📊 RAW LOGIN RESPONSE:');
          console.log('Status Code:', res.statusCode);
          console.log('Response JSON:');
          console.log(JSON.stringify(response, null, 2));
          
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

testLogin()
  .then(() => {
    console.log('\n✅ Login test completed');
  })
  .catch((error) => {
    console.error('\n❌ Login test failed:', error.message);
  });
