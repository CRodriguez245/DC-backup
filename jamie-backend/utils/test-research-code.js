/**
 * Test script for research code generation
 * Run with: node utils/test-research-code.js
 */

const {
  generateResearchCode,
  codeExists,
  hasResearchCode,
  createResearchCode,
  isValidResearchCode
} = require('./researchCode');

async function runTests() {
  console.log('🧪 Testing Research Code Generation');
  console.log('============================================================\n');

  // Test 1: Code generation
  console.log('Test 1: Code Generation');
  console.log('────────────────────────────────────────────────────────────');
  const codes = [];
  for (let i = 0; i < 5; i++) {
    const code = generateResearchCode();
    codes.push(code);
    console.log(`  Generated code ${i + 1}: ${code}`);
    console.log(`  Valid format: ${isValidResearchCode(code) ? '✅' : '❌'}`);
  }
  console.log(`  All unique: ${new Set(codes).size === codes.length ? '✅' : '❌'}\n`);

  // Test 2: Code format validation
  console.log('Test 2: Code Format Validation');
  console.log('────────────────────────────────────────────────────────────');
  const testCodes = [
    'RES-ABC123',      // Valid
    'RES-XYZ789',      // Valid
    'RES-123456',      // Valid
    'res-ABC123',      // Invalid (lowercase prefix)
    'RES-ABC12',       // Invalid (too short)
    'RES-ABC1234',     // Invalid (too long)
    'RES-ABC1I0',      // Invalid (contains I and 0)
    'TEST-ABC123',     // Invalid (wrong prefix)
    '',                 // Invalid (empty)
    null                // Invalid (null)
  ];
  
  testCodes.forEach(code => {
    const isValid = isValidResearchCode(code);
    console.log(`  ${code || '(null)'}: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
  });
  console.log('');

  // Test 3: Code existence check (requires database)
  console.log('Test 3: Code Existence Check');
  console.log('────────────────────────────────────────────────────────────');
  try {
    const testCode = 'RES-TEST01';
    const exists = await codeExists(testCode);
    console.log(`  Code ${testCode} exists: ${exists ? 'Yes' : 'No'}`);
    console.log('  ✅ Code existence check working\n');
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}\n`);
  }

  // Test 4: Create research code (requires valid user_id)
  console.log('Test 4: Create Research Code');
  console.log('────────────────────────────────────────────────────────────');
  console.log('  ⚠️  This test requires a valid user_id from your database');
  console.log('  To test:');
  console.log('    1. Get a user_id from your users table');
  console.log('    2. Call: createResearchCode(userId, "jamie")');
  console.log('    3. Verify code is created in research_code_mappings table\n');

  console.log('============================================================');
  console.log('✅ Basic tests complete!');
  console.log('============================================================\n');
}

// Run tests if called directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });
}

module.exports = { runTests };

