/**
 * Load Testing Script for Autoscaling
 * 
 * This script simulates multiple concurrent users to test autoscaling behavior.
 * Run with: node test-autoscaling.js
 * 
 * Prerequisites:
 * - Install node-fetch: npm install node-fetch (or use built-in fetch in Node 18+)
 */

// Configuration
const BACKEND_URL = process.env.BACKEND_URL || 'https://jamie-backend.onrender.com/chat';
const NUM_CONCURRENT_USERS = parseInt(process.env.NUM_USERS || '40'); // Simulate 40 students
// Use a substantive message that triggers full processing (response + DQ scoring)
const MESSAGE = process.env.TEST_MESSAGE || 'I understand you\'re feeling overwhelmed. Can you tell me more about what specifically is making you feel stuck between these options?';

// Track results
const results = {
  startTime: null,
  endTime: null,
  requests: [],
  errors: [],
  instanceCounts: [] // Will need to be checked manually in Render dashboard
};

/**
 * Simulate a single user sending a message
 */
async function simulateUser(userId) {
  const startTime = Date.now();
  const sessionId = `test-session-${userId}-${Date.now()}`;
  
  try {
    console.log(`[User ${userId}] Sending request...`);
    
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        message: MESSAGE,
        session_id: sessionId,
        user_id: `test-user-${userId}`,
        character: 'kavya' // Using Kavya for faster responses (10 turns)
      })
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    
    const result = {
      userId,
      sessionId,
      duration,
      success: true,
      status: response.status,
      timestamp: new Date().toISOString()
    };
    
    console.log(`[User ${userId}] ✅ Completed in ${duration}ms (${(duration/1000).toFixed(1)}s)`);
    results.requests.push(result);
    
    return result;
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    const errorResult = {
      userId,
      sessionId,
      duration,
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
    
    console.error(`[User ${userId}] ❌ Failed after ${duration}ms: ${error.message}`);
    results.errors.push(errorResult);
    results.requests.push(errorResult);
    
    return errorResult;
  }
}

/**
 * Run the load test
 */
async function runLoadTest() {
  console.log('🧪 Starting Load Test for Autoscaling');
  console.log('=' .repeat(60));
  console.log(`Backend URL: ${BACKEND_URL}`);
  console.log(`Concurrent Users: ${NUM_CONCURRENT_USERS}`);
  console.log(`Test Message: "${MESSAGE}"`);
  console.log('=' .repeat(60));
  console.log('');
  
  // Check if fetch is available (Node 18+ has it built-in)
  if (typeof fetch === 'undefined') {
    console.error('❌ Error: fetch is not available.');
    console.error('   Please use Node.js 18+ or install node-fetch:');
    console.error('   npm install node-fetch');
    console.error('   Then add: const fetch = require("node-fetch"); at the top of this file');
    process.exit(1);
  }
  
  results.startTime = Date.now();
  
  console.log('📤 Launching concurrent requests...\n');
  
  // Launch all requests simultaneously
  const promises = [];
  for (let i = 1; i <= NUM_CONCURRENT_USERS; i++) {
    promises.push(simulateUser(i));
  }
  
  // Wait for all requests to complete (or timeout after 5 minutes)
  console.log('⏳ Waiting for responses...\n');
  await Promise.all(promises);
  
  results.endTime = Date.now();
  const totalDuration = results.endTime - results.startTime;
  
  // Calculate statistics
  const successfulRequests = results.requests.filter(r => r.success);
  const failedRequests = results.requests.filter(r => !r.success);
  const durations = successfulRequests.map(r => r.duration);
  
  const stats = {
    totalRequests: results.requests.length,
    successful: successfulRequests.length,
    failed: failedRequests.length,
    successRate: (successfulRequests.length / results.requests.length * 100).toFixed(1),
    totalDuration: totalDuration,
    avgDuration: durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0,
    minDuration: durations.length > 0 ? Math.min(...durations) : 0,
    maxDuration: durations.length > 0 ? Math.max(...durations) : 0,
    medianDuration: durations.length > 0 ? durations.sort((a, b) => a - b)[Math.floor(durations.length / 2)] : 0
  };
  
  // Print results
  console.log('\n' + '=' .repeat(60));
  console.log('📊 LOAD TEST RESULTS');
  console.log('=' .repeat(60));
  console.log(`Total Requests: ${stats.totalRequests}`);
  console.log(`Successful: ${stats.successful} (${stats.successRate}%)`);
  console.log(`Failed: ${stats.failed}`);
  console.log(`\n⏱️  Timing:`);
  console.log(`   Total Test Duration: ${(stats.totalDuration / 1000).toFixed(1)}s (${(stats.totalDuration / 60000).toFixed(1)} min)`);
  console.log(`   Average Response Time: ${(stats.avgDuration / 1000).toFixed(1)}s`);
  console.log(`   Fastest Response: ${(stats.minDuration / 1000).toFixed(1)}s`);
  console.log(`   Slowest Response: ${(stats.maxDuration / 1000).toFixed(1)}s`);
  console.log(`   Median Response Time: ${(stats.medianDuration / 1000).toFixed(1)}s`);
  
  // Performance analysis
  console.log(`\n📈 Performance Analysis:`);
  const under60s = successfulRequests.filter(r => r.duration < 60000).length;
  const over60s = successfulRequests.filter(r => r.duration >= 60000 && r.duration < 120000).length;
  const over120s = successfulRequests.filter(r => r.duration >= 120000).length;
  
  console.log(`   Responses < 60s: ${under60s} (${(under60s / stats.successful * 100).toFixed(1)}%) ✅`);
  console.log(`   Responses 60-120s: ${over60s} (${(over60s / stats.successful * 100).toFixed(1)}%) ⚠️`);
  console.log(`   Responses > 120s: ${over120s} (${(over120s / stats.successful * 100).toFixed(1)}%) ❌`);
  
  // Check for issues
  console.log(`\n🔍 Health Check:`);
  if (stats.successRate >= 95) {
    console.log(`   ✅ Success rate is good (${stats.successRate}%)`);
  } else {
    console.log(`   ⚠️  Success rate is low (${stats.successRate}%)`);
  }
  
  if (stats.avgDuration < 60000) {
    console.log(`   ✅ Average response time is acceptable (${(stats.avgDuration / 1000).toFixed(1)}s)`);
  } else if (stats.avgDuration < 120000) {
    console.log(`   ⚠️  Average response time is high (${(stats.avgDuration / 1000).toFixed(1)}s)`);
  } else {
    console.log(`   ❌ Average response time is too high (${(stats.avgDuration / 1000).toFixed(1)}s)`);
  }
  
  if (over120s === 0) {
    console.log(`   ✅ No requests exceeded 2 minutes`);
  } else {
    console.log(`   ❌ ${over120s} requests exceeded 2 minutes`);
  }
  
  // Instructions for checking autoscaling
  console.log(`\n📋 Next Steps:`);
  console.log(`   1. Check Render Dashboard → jamie-backend → Metrics`);
  console.log(`   2. Look at the "Instances" graph during the test period`);
  console.log(`   3. You should see instances scale up from 1 to 3-6 during the test`);
  console.log(`   4. After the test completes, instances should scale back down to 1`);
  console.log(`   5. Check "CPU Utilization" and "Memory Utilization" graphs`);
  
  if (failedRequests.length > 0) {
    console.log(`\n❌ Failed Requests:`);
    failedRequests.forEach(req => {
      console.log(`   User ${req.userId}: ${req.error}`);
    });
  }
  
  console.log('\n' + '=' .repeat(60));
  
  // Exit with error code if there were failures
  process.exit(failedRequests.length > 0 ? 1 : 0);
}

// Run the test
runLoadTest().catch(error => {
  console.error('❌ Test failed with error:', error);
  process.exit(1);
});


