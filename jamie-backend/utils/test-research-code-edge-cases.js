/**
 * Edge Case Tests for Research Code Generation
 * Run with: node utils/test-research-code-edge-cases.js
 * 
 * Tests edge cases and error handling
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { 
  generateResearchCode, 
  isValidResearchCode,
  createResearchCode,
  hasResearchCode
} = require('./researchCode');

async function runEdgeCaseTests() {
  console.log('🧪 Edge Case Tests for Research Code Generation');
  console.log('============================================================\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Generate many codes to check for collisions (unlikely but possible)
  console.log('Test 1: Collision Probability Check');
  console.log('────────────────────────────────────────────────────────────');
  try {
    const codes = new Set();
    const iterations = 100;
    
    for (let i = 0; i < iterations; i++) {
      codes.add(generateResearchCode());
    }
    
    if (codes.size === iterations) {
      console.log(`✅ Generated ${iterations} unique codes (no collisions)`);
      passed++;
    } else {
      console.log(`⚠️  Found ${iterations - codes.size} collisions (statistically unlikely)`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    failed++;
  }
  console.log('');

  // Test 2: Invalid user ID handling
  console.log('Test 2: Invalid User ID Handling');
  console.log('────────────────────────────────────────────────────────────');
  try {
    const invalidUserId = '00000000-0000-0000-0000-000000000000';
    await createResearchCode(invalidUserId, 'jamie');
    console.log('✅ Handled invalid user ID gracefully');
    passed++;
  } catch (error) {
    if (error.message.includes('foreign key') || error.message.includes('user')) {
      console.log(`✅ Correctly rejected invalid user ID: ${error.message}`);
      passed++;
    } else {
      console.log(`⚠️  Unexpected error: ${error.message}`);
      failed++;
    }
  }
  console.log('');

  // Test 3: Invalid character name
  console.log('Test 3: Invalid Character Name');
  console.log('────────────────────────────────────────────────────────────');
  try {
    const { data: users } = await supabase
      .from('users')
      .select('id')
      .limit(1)
      .single();
    
    if (users) {
      try {
        await createResearchCode(users.id, 'invalid_character');
        console.log('⚠️  Accepted invalid character name (check database constraint)');
        failed++;
      } catch (error) {
        if (error.message.includes('check') || error.message.includes('constraint')) {
          console.log('✅ Correctly rejected invalid character name');
          passed++;
        } else {
          console.log(`⚠️  Unexpected error: ${error.message}`);
          failed++;
        }
      }
    } else {
      console.log('⚠️  No users found, skipping test');
    }
  } catch (error) {
    console.log(`⚠️  Test setup error: ${error.message}`);
  }
  console.log('');

  // Test 4: Code validation edge cases
  console.log('Test 4: Code Validation Edge Cases');
  console.log('────────────────────────────────────────────────────────────');
  const edgeCases = [
    { code: 'RES-ABC123', expected: true, desc: 'Valid code' },
    { code: 'RES-' + 'A'.repeat(6), expected: true, desc: 'All letters' },
    { code: 'RES-' + '1'.repeat(6), expected: true, desc: 'All numbers' },
    { code: 'res-ABC123', expected: false, desc: 'Lowercase prefix' },
    { code: 'RES-abc123', expected: false, desc: 'Lowercase chars' },
    { code: 'RES-ABC12', expected: false, desc: 'Too short' },
    { code: 'RES-ABC1234', expected: false, desc: 'Too long' },
    { code: 'RES-ABC-123', expected: false, desc: 'Extra dash' },
    { code: undefined, expected: false, desc: 'Undefined' },
    { code: null, expected: false, desc: 'Null' },
    { code: '', expected: false, desc: 'Empty string' },
    { code: 12345, expected: false, desc: 'Number' },
  ];
  
  edgeCases.forEach(testCase => {
    const result = isValidResearchCode(testCase.code);
    if (result === testCase.expected) {
      console.log(`  ✅ ${testCase.desc}: ${testCase.code || '(null/undefined)'}`);
      passed++;
    } else {
      console.log(`  ❌ ${testCase.desc}: Expected ${testCase.expected}, got ${result}`);
      failed++;
    }
  });
  console.log('');

  // Test 5: hasResearchCode with non-existent user
  console.log('Test 5: hasResearchCode with Non-Existent User');
  console.log('────────────────────────────────────────────────────────────');
  try {
    const nonExistentUserId = '00000000-0000-0000-0000-000000000000';
    const result = await hasResearchCode(nonExistentUserId, 'jamie');
    
    if (result.hasCode === false && result.code === null) {
      console.log('✅ Correctly returns no code for non-existent user');
      passed++;
    } else {
      console.log(`⚠️  Unexpected result: ${JSON.stringify(result)}`);
      failed++;
    }
  } catch (error) {
    console.log(`⚠️  Error (might be expected): ${error.message}`);
  }
  console.log('');

  // Summary
  console.log('============================================================');
  console.log('📊 Test Summary');
  console.log('============================================================');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Total: ${passed + failed}`);
  
  if (failed === 0) {
    console.log('\n🎉 All edge case tests passed!');
  } else {
    console.log(`\n⚠️  ${failed} test(s) failed - review above`);
  }
  console.log('');
}

// Run tests if called directly
if (require.main === module) {
  runEdgeCaseTests().catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
}

module.exports = { runEdgeCaseTests };

