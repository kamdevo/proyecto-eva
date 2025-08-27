/**
 * API Endpoints Verification Script
 * Tests the backend API endpoints to ensure they're working correctly
 */

const https = require('https');
const http = require('http');

console.log('🔍 API ENDPOINTS VERIFICATION');
console.log('============================\n');

const API_BASE_URL = 'http://127.0.0.1:8001/api/v1';

/**
 * Make HTTP request
 */
function makeRequest(url, method = 'GET') {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'EVA-API-Test/1.0'
      },
      timeout: 10000
    };

    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: jsonData,
            success: res.statusCode >= 200 && res.statusCode < 300
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data,
            success: res.statusCode >= 200 && res.statusCode < 300
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

/**
 * Test an endpoint
 */
async function testEndpoint(name, url, expectedStatus = 200) {
  try {
    console.log(`🔍 Testing: ${name}`);
    console.log(`   URL: ${url}`);
    
    const result = await makeRequest(url);
    
    if (result.success) {
      console.log(`✅ Status: ${result.status} - SUCCESS`);
      
      // Show some data info if available
      if (result.data && typeof result.data === 'object') {
        if (result.data.success !== undefined) {
          console.log(`   Response Success: ${result.data.success}`);
        }
        if (result.data.data && Array.isArray(result.data.data)) {
          console.log(`   Data Count: ${result.data.data.length}`);
        }
        if (result.data.message) {
          console.log(`   Message: ${result.data.message}`);
        }
      }
    } else {
      console.log(`❌ Status: ${result.status} - FAILED`);
      if (result.data && result.data.message) {
        console.log(`   Error: ${result.data.message}`);
      }
    }
    
    console.log('');
    return result.success;
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
    console.log('');
    return false;
  }
}

/**
 * Main testing function
 */
async function runTests() {
  console.log('Starting API endpoint verification...\n');
  
  const tests = [
    // SECOP Endpoints
    {
      name: 'SECOP Statistics',
      url: `${API_BASE_URL}/secop/estadisticas`
    },
    {
      name: 'SECOP Search (Hospital)',
      url: `${API_BASE_URL}/secop/buscar?q=hospital&limit=5`
    },
    {
      name: 'SECOP Consultation',
      url: `${API_BASE_URL}/secop/consultar?limit=5`
    },
    
    // Purchase Order Endpoints
    {
      name: 'Purchase Orders List',
      url: `${API_BASE_URL}/ordencompra`
    },
    
    // General Health Check
    {
      name: 'API Health Check',
      url: `${API_BASE_URL}/health`
    }
  ];
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  for (const test of tests) {
    const success = await testEndpoint(test.name, test.url);
    if (success) passedTests++;
  }
  
  // Summary
  console.log('============================');
  console.log('📊 TEST SUMMARY');
  console.log('============================');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);
  console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
  console.log('');
  
  if (passedTests === totalTests) {
    console.log('🎉 ALL API ENDPOINTS WORKING CORRECTLY!');
    console.log('✅ Backend is ready for frontend integration');
  } else if (passedTests >= totalTests * 0.8) {
    console.log('✅ MOST API ENDPOINTS WORKING');
    console.log('⚠️ Some endpoints may need attention');
  } else {
    console.log('⚠️ SEVERAL API ENDPOINTS NOT RESPONDING');
    console.log('🔧 Backend may need to be started or configured');
  }
  
  console.log('');
  console.log('📋 TROUBLESHOOTING:');
  console.log('1. Ensure Laravel backend is running on port 8001');
  console.log('2. Check database connection');
  console.log('3. Verify API routes are registered');
  console.log('4. Check for any server errors in Laravel logs');
  console.log('');
  console.log('🚀 To start backend: php artisan serve --port=8001');
  console.log('============================');
}

// Test external SECOP API connectivity
async function testExternalSecopApi() {
  console.log('🌐 Testing External SECOP API Connectivity...\n');
  
  try {
    const result = await makeRequest('https://www.datos.gov.co/resource/xvdy-vvsk.json?$limit=1');
    
    if (result.success && result.data && Array.isArray(result.data)) {
      console.log('✅ External SECOP API: ACCESSIBLE');
      console.log(`   Sample data available: ${result.data.length > 0 ? 'YES' : 'NO'}`);
      if (result.data.length > 0) {
        console.log(`   Sample entity: ${result.data[0].nombre_entidad || 'N/A'}`);
      }
    } else {
      console.log('⚠️ External SECOP API: LIMITED ACCESS');
      console.log('   This may be due to rate limiting or network restrictions');
    }
  } catch (error) {
    console.log('❌ External SECOP API: NOT ACCESSIBLE');
    console.log(`   Error: ${error.message}`);
    console.log('   This may affect real-time SECOP data retrieval');
  }
  
  console.log('');
}

// Run all tests
async function main() {
  await testExternalSecopApi();
  await runTests();
}

main().catch(console.error);
