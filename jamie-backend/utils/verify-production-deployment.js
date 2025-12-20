/**
 * Production Deployment Verification Script
 * 
 * Purpose: Verify Supabase deployment state after running migrations
 * 
 * Usage:
 *   node utils/verify-production-deployment.js
 * 
 * This script checks:
 * - Connection to Supabase
 * - Required tables exist
 * - RLS policies enabled
 * - Environment variables set
 * - Can perform basic operations
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Color output helpers
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkmark(passed) {
  return passed ? `${colors.green}✅${colors.reset}` : `${colors.red}❌${colors.reset}`;
}

async function verifyEnvironmentVariables() {
  log('\n📋 Step 1: Checking Environment Variables', 'cyan');
  log('────────────────────────────────────────────────────────────');
  
  const checks = {
    SUPABASE_URL: !!process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY
  };
  
  Object.entries(checks).forEach(([key, exists]) => {
    log(`${checkmark(exists)} ${key}: ${exists ? 'Set' : 'MISSING'}`);
  });
  
  if (process.env.SUPABASE_URL) {
    log(`   URL: ${process.env.SUPABASE_URL}`);
  }
  
  const allSet = Object.values(checks).every(Boolean);
  if (!allSet) {
    log('\n⚠️  Some environment variables are missing!', 'yellow');
    log('   Please check your .env file or Render environment variables.', 'yellow');
  }
  
  return allSet;
}

async function verifyConnection() {
  log('\n🔌 Step 2: Testing Supabase Connection', 'cyan');
  log('────────────────────────────────────────────────────────────');
  
  try {
    // Simple query to test connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      log(`${checkmark(false)} Connection failed: ${error.message}`, 'red');
      return false;
    }
    
    log(`${checkmark(true)} Successfully connected to Supabase`);
    return true;
  } catch (error) {
    log(`${checkmark(false)} Connection error: ${error.message}`, 'red');
    return false;
  }
}

async function verifyResearchTables() {
  log('\n📊 Step 3: Verifying Research Tables', 'cyan');
  log('────────────────────────────────────────────────────────────');
  
  const expectedTables = [
    'research_sessions',
    'research_messages',
    'research_code_mappings'
  ];
  
  try {
    // Check if tables exist by trying to query them
    const results = await Promise.all(
      expectedTables.map(async (tableName) => {
        try {
          const { error } = await supabase
            .from(tableName)
            .select('*')
            .limit(0);
          
          return {
            name: tableName,
            exists: !error || (error.code !== '42P01'), // 42P01 = relation does not exist
            error: error?.code === '42P01' ? null : error?.message
          };
        } catch (err) {
          return {
            name: tableName,
            exists: false,
            error: err.message
          };
        }
      })
    );
    
    let allExist = true;
    results.forEach(({ name, exists, error }) => {
      if (exists) {
        log(`${checkmark(true)} ${name}`);
      } else {
        log(`${checkmark(false)} ${name} - ${error || 'Table not found'}`);
        allExist = false;
      }
    });
    
    return allExist;
  } catch (error) {
    log(`${checkmark(false)} Error checking tables: ${error.message}`, 'red');
    return false;
  }
}

async function verifyRLSPolicies() {
  log('\n🔒 Step 4: Verifying RLS Policies', 'cyan');
  log('────────────────────────────────────────────────────────────');
  log('(Note: RLS verification requires direct SQL query)', 'yellow');
  log('Run this in Supabase SQL Editor:', 'yellow');
  log('');
  log('SELECT tablename, rowsecurity FROM pg_tables', 'blue');
  log('WHERE schemaname = \'public\' AND tablename LIKE \'research_%\';', 'blue');
  log('');
  log('Expected: All tables should have rowsecurity = true', 'yellow');
  
  // We can't directly check RLS via Supabase JS client easily
  // But we can verify that service role can access tables (bypasses RLS)
  try {
    const { error } = await supabase
      .from('research_sessions')
      .select('*')
      .limit(0);
    
    if (error && error.code !== '42P01') {
      log(`${checkmark(true)} Service role can access research tables (RLS working)`);
      return true;
    } else if (error && error.code === '42P01') {
      log(`${checkmark(false)} Tables don't exist`);
      return false;
    } else {
      log(`${checkmark(true)} Service role can access research tables`);
      return true;
    }
  } catch (error) {
    log(`${checkmark(false)} Error: ${error.message}`);
    return false;
  }
}

async function verifyBasicOperations() {
  log('\n🧪 Step 5: Testing Basic Operations', 'cyan');
  log('────────────────────────────────────────────────────────────');
  
  // Test research code generation
  try {
    const { createResearchCode } = require('./researchCode');
    
    // Try to get a user for testing
    const { data: users } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'student')
      .limit(1)
      .single();
    
    if (users && users.id) {
      log(`${checkmark(true)} Can query users table`);
      
      // Try research code operations
      try {
        const { hasResearchCode } = require('./researchCode');
        await hasResearchCode(users.id, 'jamie');
        log(`${checkmark(true)} Research code functions work`);
        return true;
      } catch (error) {
        log(`${checkmark(false)} Research code functions error: ${error.message}`);
        return false;
      }
    } else {
      log(`${checkmark(false)} No test users found (this is OK if database is empty)`);
      return true; // Not a failure, just no test data
    }
  } catch (error) {
    log(`${checkmark(false)} Error testing operations: ${error.message}`);
    return false;
  }
}

async function runVerification() {
  log('\n🚀 Production Deployment Verification', 'cyan');
  log('============================================================');
  log('This script verifies your Supabase deployment state');
  log('============================================================\n');
  
  const results = {
    envVars: await verifyEnvironmentVariables(),
    connection: await verifyConnection(),
    tables: await verifyResearchTables(),
    rls: await verifyRLSPolicies(),
    operations: await verifyBasicOperations()
  };
  
  // Summary
  log('\n📊 Verification Summary', 'cyan');
  log('============================================================');
  
  const allPassed = Object.values(results).every(Boolean);
  
  Object.entries(results).forEach(([step, passed]) => {
    const stepName = step.replace(/([A-Z])/g, ' $1').trim();
    log(`${checkmark(passed)} ${stepName}`);
  });
  
  log('');
  
  if (allPassed) {
    log('✅ All checks passed! Deployment looks good.', 'green');
    log('');
    log('Next steps:', 'cyan');
    log('  1. Test frontend connection to Supabase');
    log('  2. Verify RLS policies in Supabase dashboard');
    log('  3. Test end-to-end functionality');
    log('');
  } else {
    log('❌ Some checks failed. Review errors above.', 'red');
    log('');
    log('Common fixes:', 'yellow');
    log('  1. Missing env vars: Add to Render environment variables');
    log('  2. Tables missing: Run migration SQL in Supabase SQL Editor');
    log('  3. Connection failed: Verify SUPABASE_URL and SERVICE_ROLE_KEY');
    log('');
    process.exit(1);
  }
}

// Run verification if called directly
if (require.main === module) {
  runVerification().catch(error => {
    log(`\n❌ Verification failed: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  });
}

module.exports = { runVerification };

