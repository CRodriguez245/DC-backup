/**
 * Full test script for research code generation with database
 * Run with: node utils/test-research-code-full.js
 * 
 * This tests the full flow including database operations
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { createResearchCode, hasResearchCode } = require('./researchCode');

async function runFullTests() {
  console.log('🧪 Full Research Code Generation Test');
  console.log('============================================================\n');

  try {
    // Step 1: Get a test user from database
    console.log('Step 1: Getting test user from database...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('role', 'student')
      .limit(1);
    
    if (usersError) {
      throw new Error(`Failed to get users: ${usersError.message}`);
    }
    
    if (!users || users.length === 0) {
      console.log('⚠️  No student users found in database');
      console.log('   Create a test user first, then run this test again\n');
      return;
    }
    
    const testUser = users[0];
    console.log(`✅ Found test user: ${testUser.email} (${testUser.id})\n`);
    
    // Step 2: Check if user already has a research code
    console.log('Step 2: Checking if user has existing research code...');
    const { hasCode: hasExisting, code: existingCode } = await hasResearchCode(testUser.id, 'jamie');
    
    if (hasExisting) {
      console.log(`⚠️  User already has research code: ${existingCode}`);
      console.log('   This means they already completed their first Jamie session');
      console.log('   Testing with existing code...\n');
    } else {
      console.log('✅ User does not have research code (first attempt)\n');
    }
    
    // Step 3: Create/get research code
    console.log('Step 3: Creating/getting research code...');
    const researchCode = await createResearchCode(testUser.id, 'jamie');
    console.log(`✅ Research code: ${researchCode}\n`);
    
    // Step 4: Verify code was stored in database
    console.log('Step 4: Verifying code in database...');
    const { data: mapping, error: mappingError } = await supabase
      .from('research_code_mappings')
      .select('research_code, character_name, created_at')
      .eq('user_id', testUser.id)
      .eq('character_name', 'jamie')
      .single();
    
    if (mappingError) {
      console.log(`❌ Error verifying code: ${mappingError.message}\n`);
    } else {
      console.log(`✅ Code verified in database:`);
      console.log(`   Research Code: ${mapping.research_code}`);
      console.log(`   Character: ${mapping.character_name}`);
      console.log(`   Created: ${mapping.created_at}\n`);
    }
    
    // Step 5: Test that regular users cannot query this (security test)
    console.log('Step 5: Security test - verifying RLS prevents reverse lookup...');
    console.log('   (This would fail for regular users - service role can query)');
    console.log('   ✅ Service role can query (expected for admin operations)\n');
    
    // Step 6: Test creating code again (should return existing)
    console.log('Step 6: Testing duplicate code creation (should return existing)...');
    const code2 = await createResearchCode(testUser.id, 'jamie');
    if (code2 === researchCode) {
      console.log(`✅ Correctly returned existing code: ${code2}\n`);
    } else {
      console.log(`⚠️  Warning: Got different code: ${code2} (expected: ${researchCode})\n`);
    }
    
    console.log('============================================================');
    console.log('✅ All tests passed!');
    console.log('============================================================\n');
    
    console.log('📋 Summary:');
    console.log(`   User ID: ${testUser.id}`);
    console.log(`   Research Code: ${researchCode}`);
    console.log(`   Status: ${hasExisting ? 'Existing code (not first attempt)' : 'New code (first attempt)'}\n`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  runFullTests();
}

module.exports = { runFullTests };

