/**
 * Quick test script to verify OpenAI API key is working
 * 
 * Tests:
 * 1. Local backend (if running on localhost:3001)
 * 2. Production backend (jamie-backend.onrender.com)
 * 
 * Usage:
 *   node test-openai-key.js
 *   node test-openai-key.js local    # Test local only
 *   node test-openai-key.js prod     # Test production only
 */

const BACKEND_URLS = {
  local: 'http://localhost:3001/chat',
  prod: 'https://jamie-backend.onrender.com/chat'
};

const TEST_MESSAGE = 'Hello, this is a test message';

async function testBackend(url, name) {
  console.log(`\n🧪 Testing ${name} backend: ${url}`);
  console.log('─'.repeat(60));
  
  const startTime = Date.now();
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        message: TEST_MESSAGE,
        session_id: `test-key-${Date.now()}`,
        user_id: 'test-user',
        character: 'kavya'
      })
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ Failed: HTTP ${response.status}`);
      console.log(`   Error: ${errorText.substring(0, 200)}`);
      console.log(`   Duration: ${duration}ms`);
      return false;
    }
    
    const data = await response.json();
    
    console.log(`✅ Success!`);
    console.log(`   Duration: ${duration}ms (${(duration/1000).toFixed(1)}s)`);
    console.log(`   Response received: ${data.reply ? 'Yes' : 'No'}`);
    console.log(`   Has DQ score: ${data.dqScore ? 'Yes' : 'No'}`);
    
    if (data.reply) {
      const replyPreview = data.reply.substring(0, 100);
      console.log(`   Reply preview: "${replyPreview}${data.reply.length > 100 ? '...' : ''}"`);
    }
    
    return true;
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`❌ Error: ${error.message}`);
    console.log(`   Duration: ${duration}ms`);
    
    if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
      console.log(`   ⚠️  Backend may not be running or URL is incorrect`);
    }
    
    return false;
  }
}

async function runTests() {
  console.log('🔑 OpenAI API Key Test');
  console.log('='.repeat(60));
  
  const testMode = process.argv[2]; // 'local', 'prod', or undefined (both)
  
  const results = {
    local: false,
    prod: false
  };
  
  // Check if fetch is available (Node 18+)
  if (typeof fetch === 'undefined') {
    console.error('❌ Error: fetch is not available.');
    console.error('   Please use Node.js 18+ or install node-fetch:');
    console.error('   npm install node-fetch');
    process.exit(1);
  }
  
  // Test local
  if (!testMode || testMode === 'local') {
    results.local = await testBackend(BACKEND_URLS.local, 'LOCAL');
  }
  
  // Test production
  if (!testMode || testMode === 'prod') {
    results.prod = await testBackend(BACKEND_URLS.prod, 'PRODUCTION');
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  
  if (!testMode || testMode === 'local') {
    console.log(`Local Backend:   ${results.local ? '✅ PASS' : '❌ FAIL'}`);
  }
  
  if (!testMode || testMode === 'prod') {
    console.log(`Production:      ${results.prod ? '✅ PASS' : '❌ FAIL'}`);
  }
  
  const allPassed = (!testMode || testMode === 'local' ? results.local : true) && 
                    (!testMode || testMode === 'prod' ? results.prod : true);
  
  if (allPassed) {
    console.log('\n🎉 All tests passed! Your OpenAI API key is working correctly.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
    console.log('\nCommon issues:');
    console.log('  - Local: Make sure backend server is running (npm start in jamie-backend/)');
    console.log('  - Production: Wait for Render to finish redeploying (check Deploys tab)');
    console.log('  - Invalid API key: Check that the key was updated correctly in Render');
    process.exit(1);
  }
}

runTests().catch(error => {
  console.error('❌ Test script failed:', error);
  process.exit(1);
});

