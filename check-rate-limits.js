/**
 * Script to check your current OpenAI API rate limits
 * This makes a test API call and reads the rate limit headers from the response
 */

const OpenAI = require('openai');
require('dotenv').config({ path: './jamie-backend/.env' });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function checkRateLimits() {
  console.log('🔍 Checking OpenAI API Rate Limits');
  console.log('============================================================\n');

  try {
    // Make a simple test API call to get rate limit headers
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'user', content: 'Say "test"' }
      ],
      max_tokens: 10,
    });

    // Get rate limit info from response headers
    // Note: OpenAI SDK doesn't expose headers directly, so we'll check via account limits page
    // But we can infer from the response
    console.log('✅ API call successful!\n');
    console.log('📊 Rate Limit Information:');
    console.log('────────────────────────────────────────────────────────────');
    console.log('⚠️  The OpenAI Node.js SDK doesn\'t expose HTTP headers directly.');
    console.log('    To see your exact limits, check one of these methods:\n');
    
    console.log('📋 Method 1: Check Dashboard (Recommended)');
    console.log('   → Go to: https://platform.openai.com/account/limits');
    console.log('   → Look for "Rate limits" section');
    console.log('   → Check TPM (Tokens Per Minute) and RPM (Requests Per Minute)\n');
    
    console.log('📋 Method 2: Check Response Headers (via API)');
    console.log('   → Make an API call with curl to see headers:');
    console.log('   → curl -i https://api.openai.com/v1/chat/completions \\');
    console.log('        -H "Authorization: Bearer YOUR_API_KEY" \\');
    console.log('        -H "Content-Type: application/json" \\');
    console.log('        -d \'{"model":"gpt-4o","messages":[{"role":"user","content":"test"}],"max_tokens":10}\'\n');
    
    console.log('📋 Method 3: Use this script to check via curl');
    console.log('   → Run: ./check-rate-limits-curl.sh\n');

    // Check what tier they're likely in based on usage
    console.log('🎯 What to Look For:');
    console.log('────────────────────────────────────────────────────────────');
    console.log('Your Tier 2 limits should show something like:');
    console.log('  • TPM (Tokens Per Minute): 40,000 - 80,000+');
    console.log('  • RPM (Requests Per Minute): 1,000 - 3,000+');
    console.log('  • Usage Limit: $500/month\n');
    
    console.log('⚠️  IMPORTANT: Tier 2 automatic limits may still be too low!');
    console.log('   If you see TPM < 100,000, you may need to request a manual increase.');
    console.log('   For 40+ concurrent users, you need ~150,000 TPM.\n');

  } catch (error) {
    if (error.response) {
      // Try to extract rate limit headers from error response
      const headers = error.response.headers || {};
      
      console.log('📊 Rate Limit Headers (from error response):');
      console.log('────────────────────────────────────────────────────────────');
      
      if (headers['x-ratelimit-limit-tokens']) {
        console.log(`✅ TPM Limit: ${headers['x-ratelimit-limit-tokens']}`);
      }
      if (headers['x-ratelimit-limit-requests']) {
        console.log(`✅ RPM Limit: ${headers['x-ratelimit-limit-requests']}`);
      }
      if (headers['x-ratelimit-remaining-tokens']) {
        console.log(`📉 Remaining Tokens: ${headers['x-ratelimit-remaining-tokens']}`);
      }
      if (headers['x-ratelimit-remaining-requests']) {
        console.log(`📉 Remaining Requests: ${headers['x-ratelimit-remaining-requests']}`);
      }
      
      if (!headers['x-ratelimit-limit-tokens']) {
        console.log('⚠️  Rate limit headers not found in error response');
        console.log('    Check dashboard instead: https://platform.openai.com/account/limits\n');
      }
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

checkRateLimits();

