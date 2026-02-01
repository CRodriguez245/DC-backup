/**
 * Load Testing Script for Decision Coach
 * Simulates 60 concurrent students using the application
 * 
 * Usage:
 *   node load-test.js [backend-url] [num-users] [messages-per-user]
 * 
 * Examples:
 *   node load-test.js http://localhost:3001/chat 60 10
 *   node load-test.js https://jamie-backend.onrender.com/chat 60 10
 */

const BACKEND_URL = process.argv[2] || 'https://jamie-backend.onrender.com/chat';
const NUM_USERS = parseInt(process.argv[3]) || 60;
const MESSAGES_PER_USER = parseInt(process.argv[4]) || 10;
const RAMP_UP_TIME = 5000; // 5 seconds to ramp up all users

// Sample messages that simulate a real conversation
const SAMPLE_MESSAGES = [
  "I'm really confused about everything right now. I want to pursue design, but I worry about disappointing my parents.",
  "I don't even know where to start thinking about this. Every time I try to figure it out, I just feel more stuck.",
  "I keep going back and forth between what I want and what feels responsible. It's all just too much pressure right now.",
  "I feel torn because I really want to pursue something creative. But I worry about the risks and the uncertainty.",
  "I just can't shake off the fear of letting my parents down. They worked so hard to get me to where I am.",
  "It feels selfish to even consider abandoning engineering. Yet, I'm really not sure how long I can ignore this new passion.",
  "I haven't thought about that deeply. It sounds like it could be a good compromise. At least it might blend creativity with practicality.",
  "I'm scared of how that conversation might go with them. They might not understand why I want to change paths.",
  "I could start by researching more about design engineering programs. Maybe talk to some professionals in the field for insights.",
  "I'll try to approach disagreements with patience and understanding. I'll listen actively to their concerns and feelings."
];

// Performance metrics
const metrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  responseTimes: [],
  errors: [],
  startTime: null,
  endTime: null
};

/**
 * Send a chat message to the backend
 */
async function sendMessage(userId, sessionId, message, character = 'jamie', reset = false) {
  const startTime = Date.now();
  
  try {
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        session_id: sessionId,
        user_id: userId,
        character: character,
        reset: reset
      })
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    metrics.totalRequests++;
    metrics.responseTimes.push(responseTime);

    if (!response.ok) {
      const errorText = await response.text();
      metrics.failedRequests++;
      metrics.errors.push({
        userId,
        sessionId,
        status: response.status,
        error: errorText,
        responseTime
      });
      return { success: false, responseTime, error: errorText };
    }

    const data = await response.json();
    metrics.successfulRequests++;
    return { success: true, responseTime, data };
  } catch (error) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    metrics.totalRequests++;
    metrics.failedRequests++;
    metrics.errors.push({
      userId,
      sessionId,
      error: error.message,
      responseTime
    });
    return { success: false, responseTime, error: error.message };
  }
}

/**
 * Simulate a single user's session
 */
async function simulateUser(userId) {
  const sessionId = `load-test-session-${userId}`;
  const character = 'jamie';
  const userMessages = [...SAMPLE_MESSAGES].slice(0, MESSAGES_PER_USER);
  
  // Reset session on first message
  let reset = true;
  
  for (let i = 0; i < userMessages.length; i++) {
    const message = userMessages[i];
    const result = await sendMessage(userId, sessionId, message, character, reset);
    reset = false; // Only reset on first message
    
    if (!result.success) {
      console.error(`❌ User ${userId}, Message ${i + 1} failed:`, result.error);
    }
    
    // Small delay between messages to simulate real user behavior
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  }
  
  return { userId, sessionId, completed: true };
}

/**
 * Run load test with concurrent users
 */
async function runLoadTest() {
  console.log('🚀 Starting Load Test');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`Backend URL: ${BACKEND_URL}`);
  console.log(`Number of Users: ${NUM_USERS}`);
  console.log(`Messages per User: ${MESSAGES_PER_USER}`);
  console.log(`Total Requests: ${NUM_USERS * MESSAGES_PER_USER}`);
  console.log(`Ramp-up Time: ${RAMP_UP_TIME / 1000}s`);
  console.log('═══════════════════════════════════════════════════════\n');

  metrics.startTime = Date.now();

  // Create array of user promises with staggered start
  const userPromises = [];
  for (let i = 0; i < NUM_USERS; i++) {
    const userId = `load-test-user-${i + 1}`;
    
    // Stagger user starts over ramp-up period
    const delay = (RAMP_UP_TIME / NUM_USERS) * i;
    
    const userPromise = new Promise(resolve => {
      setTimeout(async () => {
        const result = await simulateUser(userId);
        resolve(result);
      }, delay);
    });
    
    userPromises.push(userPromise);
  }

  // Wait for all users to complete
  console.log(`⏳ Running ${NUM_USERS} concurrent user sessions...\n`);
  const results = await Promise.allSettled(userPromises);
  
  metrics.endTime = Date.now();
  
  // Calculate statistics
  const totalTime = (metrics.endTime - metrics.startTime) / 1000; // seconds
  const avgResponseTime = metrics.responseTimes.length > 0
    ? metrics.responseTimes.reduce((a, b) => a + b, 0) / metrics.responseTimes.length
    : 0;
  const minResponseTime = metrics.responseTimes.length > 0 ? Math.min(...metrics.responseTimes) : 0;
  const maxResponseTime = metrics.responseTimes.length > 0 ? Math.max(...metrics.responseTimes) : 0;
  
  // Calculate percentiles
  const sortedTimes = [...metrics.responseTimes].sort((a, b) => a - b);
  const p50 = sortedTimes[Math.floor(sortedTimes.length * 0.5)] || 0;
  const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)] || 0;
  const p99 = sortedTimes[Math.floor(sortedTimes.length * 0.99)] || 0;
  
  const successRate = metrics.totalRequests > 0
    ? (metrics.successfulRequests / metrics.totalRequests * 100).toFixed(2)
    : 0;
  const requestsPerSecond = metrics.totalRequests / totalTime;
  
  // Print results
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('📊 LOAD TEST RESULTS');
  console.log('═══════════════════════════════════════════════════════\n');
  
  console.log('Overall Statistics:');
  console.log(`  Total Time: ${totalTime.toFixed(2)}s`);
  console.log(`  Total Requests: ${metrics.totalRequests}`);
  console.log(`  Successful: ${metrics.successfulRequests}`);
  console.log(`  Failed: ${metrics.failedRequests}`);
  console.log(`  Success Rate: ${successRate}%`);
  console.log(`  Requests/Second: ${requestsPerSecond.toFixed(2)}\n`);
  
  console.log('Response Time Statistics:');
  console.log(`  Average: ${avgResponseTime.toFixed(2)}ms`);
  console.log(`  Minimum: ${minResponseTime}ms`);
  console.log(`  Maximum: ${maxResponseTime}ms`);
  console.log(`  Median (p50): ${p50}ms`);
  console.log(`  95th Percentile (p95): ${p95}ms`);
  console.log(`  99th Percentile (p99): ${p99}ms\n`);
  
  if (metrics.errors.length > 0) {
    console.log('Errors:');
    const errorSummary = {};
    metrics.errors.forEach(err => {
      const key = err.error || `Status ${err.status}` || 'Unknown';
      errorSummary[key] = (errorSummary[key] || 0) + 1;
    });
    Object.entries(errorSummary).forEach(([error, count]) => {
      console.log(`  ${error}: ${count} occurrences`);
    });
    console.log('');
  }
  
  // Performance assessment
  console.log('Performance Assessment:');
  if (avgResponseTime < 2000) {
    console.log('  ✅ Average response time is excellent (< 2s)');
  } else if (avgResponseTime < 5000) {
    console.log('  ⚠️  Average response time is acceptable (2-5s)');
  } else {
    console.log('  ❌ Average response time is slow (> 5s)');
  }
  
  if (p95 < 5000) {
    console.log('  ✅ 95th percentile response time is good (< 5s)');
  } else if (p95 < 10000) {
    console.log('  ⚠️  95th percentile response time is acceptable (5-10s)');
  } else {
    console.log('  ❌ 95th percentile response time is slow (> 10s)');
  }
  
  if (parseFloat(successRate) >= 99) {
    console.log('  ✅ Success rate is excellent (≥ 99%)');
  } else if (parseFloat(successRate) >= 95) {
    console.log('  ⚠️  Success rate is acceptable (95-99%)');
  } else {
    console.log('  ❌ Success rate is poor (< 95%)');
  }
  
  if (requestsPerSecond >= 10) {
    console.log('  ✅ Throughput is good (≥ 10 req/s)');
  } else if (requestsPerSecond >= 5) {
    console.log('  ⚠️  Throughput is acceptable (5-10 req/s)');
  } else {
    console.log('  ❌ Throughput is low (< 5 req/s)');
  }
  
  console.log('\n═══════════════════════════════════════════════════════\n');
  
  // Exit with error code if test failed
  if (parseFloat(successRate) < 95 || avgResponseTime > 10000) {
    process.exit(1);
  }
}

// Run the test
runLoadTest().catch(error => {
  console.error('❌ Load test failed:', error);
  process.exit(1);
});

