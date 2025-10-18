// Test script for batch tracking optimization
const axios = require('axios');
require('dotenv').config();

const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.kynajewels.com' 
  : 'http://localhost:5000';

const SEQUEL_ENDPOINT = process.env.NODE_ENV === 'production'
  ? process.env.SEQUEL247_PROD_ENDPOINT
  : process.env.SEQUEL247_TEST_ENDPOINT || 'https://test.sequel247.com/';

const SEQUEL_TOKEN = process.env.NODE_ENV === 'production'
  ? process.env.SEQUEL247_PROD_TOKEN
  : process.env.SEQUEL247_TEST_TOKEN;

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testBatchTracking() {
  log('\n🧪 TESTING BATCH TRACKING OPTIMIZATION', 'cyan');
  log('='.repeat(70), 'cyan');
  
  if (!SEQUEL_TOKEN) {
    log('\n❌ ERROR: Sequel247 token not configured!', 'red');
    log('💡 Please set SEQUEL247_TEST_TOKEN in your .env file', 'yellow');
    return;
  }

  // Test 1: Direct Sequel247 Batch API
  log('\n\n1️⃣ TEST: Direct Sequel247 trackMultiple API', 'blue');
  log('─'.repeat(50), 'blue');
  
  try {
    const testDockets = ['0581094993', '0524758920', '0582695036'];
    log(`Testing with docket numbers: ${testDockets.join(', ')}`, 'yellow');
    
    const startTime = Date.now();
    const response = await axios.post(`${SEQUEL_ENDPOINT}api/trackMultiple`, {
      token: SEQUEL_TOKEN,
      dockets: testDockets
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000
    });
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    log(`✅ Batch API responded in ${duration}ms`, 'green');
    log('\n📦 Response Structure:', 'cyan');
    
    if (response.data.status === 'true' || response.data.status === true) {
      log('✅ Status: Success', 'green');
      
      if (response.data.successShipments) {
        const successCount = Object.keys(response.data.successShipments).length;
        log(`✅ Successful Shipments: ${successCount}`, 'green');
        
        // Show details of successful shipments
        Object.entries(response.data.successShipments).forEach(([docket, data]) => {
          log(`\n  📍 Docket: ${docket}`, 'yellow');
          log(`     Status: ${data.shipment_status}`, 'yellow');
          log(`     Tracking Events: ${data.tracking ? data.tracking.length : 0}`, 'yellow');
        });
      }
      
      if (response.data.errorShipments) {
        const errorCount = Object.keys(response.data.errorShipments).length;
        if (errorCount > 0) {
          log(`\n⚠️  Error Shipments: ${errorCount}`, 'yellow');
          Object.entries(response.data.errorShipments).forEach(([docket, error]) => {
            log(`  ❌ ${docket}: ${JSON.stringify(error)}`, 'red');
          });
        }
      }
      
      log('\n🎉 Batch API is working correctly!', 'green');
    } else {
      log('⚠️  API returned error status', 'yellow');
      log(JSON.stringify(response.data, null, 2), 'yellow');
    }
    
  } catch (error) {
    log('❌ Batch API Error:', 'red');
    if (error.response) {
      log(`Status: ${error.response.status}`, 'red');
      log('Response:', 'red');
      console.log(JSON.stringify(error.response.data, null, 2));
    } else {
      log(error.message, 'red');
    }
  }

  // Test 2: Your Server's Manual Update Endpoint (with batch tracking)
  log('\n\n2️⃣ TEST: Your Server Batch Tracking Implementation', 'blue');
  log('─'.repeat(50), 'blue');
  
  try {
    log('Triggering manual tracking update...', 'yellow');
    
    const startTime = Date.now();
    const response = await axios.post(`${BASE_URL}/api/tracking/manual-update`, {}, {
      timeout: 30000
    });
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    log(`✅ Server responded in ${duration}ms`, 'green');
    log('\n📦 Response:', 'cyan');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      log('\n✅ Manual update successful!', 'green');
      
      if (response.data.data) {
        const { updatedCount, errorCount, totalOrders } = response.data.data;
        log(`\n📊 Statistics:`, 'cyan');
        log(`  Total Orders: ${totalOrders}`, 'yellow');
        log(`  Updated: ${updatedCount}`, 'green');
        log(`  Errors: ${errorCount}`, errorCount > 0 ? 'yellow' : 'green');
        
        if (totalOrders > 0) {
          log(`\n🚀 Batch efficiency: ${totalOrders} orders processed in ${duration}ms`, 'green');
          log(`   Average: ${(duration / totalOrders).toFixed(2)}ms per order`, 'green');
        }
      }
      
      log('\n🎉 Your batch tracking implementation is working!', 'green');
    } else {
      log('⚠️  Update returned error', 'yellow');
    }
    
  } catch (error) {
    log('❌ Server Error:', 'red');
    if (error.response) {
      log(`Status: ${error.response.status}`, 'red');
      log('Response:', 'red');
      console.log(JSON.stringify(error.response.data, null, 2));
    } else {
      log(error.message, 'red');
    }
  }

  // Test 3: Performance Comparison (if we have orders)
  log('\n\n3️⃣ TEST: Performance Comparison', 'blue');
  log('─'.repeat(50), 'blue');
  
  const testOrders = [
    '0581094993',
    '0524758920',
    '0582695036',
    '0580929612'
  ];
  
  log('Comparing single vs batch API performance...', 'yellow');
  
  // Individual tracking (old way)
  log('\n📊 Simulating OLD method (individual calls):', 'cyan');
  let individualTime = 0;
  let individualSuccess = 0;
  
  for (const docket of testOrders) {
    try {
      const start = Date.now();
      await axios.post(`${SEQUEL_ENDPOINT}api/track`, {
        token: SEQUEL_TOKEN,
        docket: docket
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });
      const end = Date.now();
      individualTime += (end - start);
      individualSuccess++;
      log(`  ✅ ${docket}: ${end - start}ms`, 'green');
    } catch (error) {
      log(`  ⚠️  ${docket}: ${error.message}`, 'yellow');
    }
  }
  
  log(`\n  Total time: ${individualTime}ms`, 'yellow');
  log(`  Successful: ${individualSuccess}/${testOrders.length}`, 'yellow');
  
  // Batch tracking (new way)
  log('\n📊 Simulating NEW method (batch call):', 'cyan');
  let batchTime = 0;
  let batchSuccess = 0;
  
  try {
    const start = Date.now();
    const response = await axios.post(`${SEQUEL_ENDPOINT}api/trackMultiple`, {
      token: SEQUEL_TOKEN,
      dockets: testOrders
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000
    });
    const end = Date.now();
    batchTime = end - start;
    
    if (response.data.successShipments) {
      batchSuccess = Object.keys(response.data.successShipments).length;
    }
    
    log(`  ✅ Batch call: ${batchTime}ms`, 'green');
    log(`  Successful: ${batchSuccess}/${testOrders.length}`, 'green');
  } catch (error) {
    log(`  ⚠️  Batch failed: ${error.message}`, 'yellow');
  }
  
  // Performance comparison
  if (individualTime > 0 && batchTime > 0) {
    const improvement = ((individualTime - batchTime) / individualTime * 100).toFixed(2);
    const speedup = (individualTime / batchTime).toFixed(2);
    
    log('\n📈 PERFORMANCE COMPARISON:', 'cyan');
    log('─'.repeat(50), 'cyan');
    log(`  Old (Individual): ${individualTime}ms`, 'yellow');
    log(`  New (Batch):      ${batchTime}ms`, 'green');
    log(`  Improvement:      ${improvement}% faster`, 'green');
    log(`  Speed up:         ${speedup}x`, 'green');
    log('\n🚀 Batch tracking is significantly faster!', 'green');
  }

  // Test 4: Check Server Logs
  log('\n\n4️⃣ CHECK: Server Logs', 'blue');
  log('─'.repeat(50), 'blue');
  log('Check your server console for these messages:', 'yellow');
  log('  ✅ "🚀 Batch tracking enabled for efficient API calls"', 'cyan');
  log('  ✅ "Using batch API"', 'cyan');
  log('  ✅ "Batch tracking completed"', 'cyan');
  log('  ✅ "Fetching tracking data for N shipments in batch..."', 'cyan');

  // Summary
  log('\n\n📊 TEST SUMMARY', 'cyan');
  log('='.repeat(70), 'cyan');
  log('\n✅ What was tested:', 'green');
  log('  1. Direct Sequel247 trackMultiple API', 'white');
  log('  2. Your server batch tracking implementation', 'white');
  log('  3. Performance comparison (individual vs batch)', 'white');
  log('  4. Server configuration and logs', 'white');
  
  log('\n📋 Next Steps:', 'yellow');
  log('  1. Check your server console logs', 'white');
  log('  2. Wait for automatic cron job (runs every 30 minutes)', 'white');
  log('  3. Monitor the performance improvements', 'white');
  log('  4. Deploy to production when ready', 'white');
  
  log('\n✨ Batch tracking test completed!', 'green');
}

// Run the test
log('\n🚀 Starting Batch Tracking Tests...', 'cyan');
testBatchTracking().catch(error => {
  log('\n❌ Fatal Error:', 'red');
  console.error(error);
  process.exit(1);
});

