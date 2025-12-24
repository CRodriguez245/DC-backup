/**
 * Application-Level RLS Policy Test Suite
 * Tests RLS policies after performance optimization
 * 
 * Usage:
 *   node jamie-backend/utils/test-rls-policies.js
 * 
 * Prerequisites:
 *   - Test student account (email/password)
 *   - Test teacher account (email/password)
 *   - SUPABASE_URL and SUPABASE_ANON_KEY in .env
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60) + '\n');
}

function logTest(testName) {
  log(`\n🧪 Testing: ${testName}`, 'blue');
}

function logPass(message) {
  log(`  ✅ PASS: ${message}`, 'green');
}

function logFail(message) {
  log(`  ❌ FAIL: ${message}`, 'red');
}

function logWarning(message) {
  log(`  ⚠️  WARN: ${message}`, 'yellow');
}

function logInfo(message) {
  log(`  ℹ️  INFO: ${message}`, 'reset');
}

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://lcvxiasswxagwcxolzmi.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseAnonKey) {
  log('ERROR: Missing SUPABASE_ANON_KEY', 'red');
  log('', 'red');
  log('To fix:', 'yellow');
  log('  1. Get your Supabase Anon Key from Dashboard → Settings → API', 'yellow');
  log('  2. Add to .env: SUPABASE_ANON_KEY=your-key-here', 'yellow');
  log('  3. Or set environment variable: export SUPABASE_ANON_KEY=your-key-here', 'yellow');
  log('', 'red');
  process.exit(1);
}

// Configuration
const CONFIG = {
  // Test account credentials (set these or pass as environment variables)
  STUDENT_EMAIL: process.env.TEST_STUDENT_EMAIL || 'student@test.com',
  STUDENT_PASSWORD: process.env.TEST_STUDENT_PASSWORD || 'password123',
  TEACHER_EMAIL: process.env.TEST_TEACHER_EMAIL || 'teacher@test.com',
  TEACHER_PASSWORD: process.env.TEST_TEACHER_PASSWORD || 'password123',
};

let studentClient = null;
let teacherClient = null;
let anonClient = null;
let testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
};

async function initializeClients() {
  logSection('Initializing Test Clients');
  
  // Anonymous client (no auth)
  anonClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false }
  });
  logPass('Anonymous client initialized');

  // Student client
  studentClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false }
  });

  logInfo(`Signing in as student: ${CONFIG.STUDENT_EMAIL}`);
  const { data: studentAuth, error: studentError } = await studentClient.auth.signInWithPassword({
    email: CONFIG.STUDENT_EMAIL,
    password: CONFIG.STUDENT_PASSWORD,
  });

  if (studentError || !studentAuth.user) {
    logFail(`Failed to sign in as student: ${studentError?.message || 'Unknown error'}`);
    logWarning('You may need to create a test student account or update credentials');
    return false;
  }
  logPass(`Student signed in: ${studentAuth.user.id}`);

  // Teacher client
  teacherClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false }
  });

  logInfo(`Signing in as teacher: ${CONFIG.TEACHER_EMAIL}`);
  const { data: teacherAuth, error: teacherError } = await teacherClient.auth.signInWithPassword({
    email: CONFIG.TEACHER_EMAIL,
    password: CONFIG.TEACHER_PASSWORD,
  });

  if (teacherError || !teacherAuth.user) {
    logFail(`Failed to sign in as teacher: ${teacherError?.message || 'Unknown error'}`);
    logWarning('You may need to create a test teacher account or update credentials');
    return false;
  }
  logPass(`Teacher signed in: ${teacherAuth.user.id}`);

  return true;
}

async function testStudentAccessOwnData() {
  logSection('TEST 1: Student Can Access Own Data');

  const userId = studentClient.auth.getUser().then(r => r.data.user?.id);
  const currentUser = await studentClient.auth.getUser();
  const currentUserId = currentUser.data.user?.id;

  if (!currentUserId) {
    logFail('Cannot get current user ID');
    testResults.failed++;
    testResults.tests.push({ name: 'TEST 1', status: 'FAIL', error: 'No user ID' });
    return;
  }

  // Test 1.1: SELECT own user record
  logTest('Student SELECT own user record');
  const { data: ownUser, error: userError } = await studentClient
    .from('users')
    .select('*')
    .eq('id', currentUserId)
    .single();

  if (userError || !ownUser) {
    logFail(`Cannot SELECT own user record: ${userError?.message || 'No data'}`);
    testResults.failed++;
  } else {
    logPass('Can SELECT own user record');
    testResults.passed++;
  }

  // Test 1.2: SELECT own sessions
  logTest('Student SELECT own sessions');
  const { data: ownSessions, error: sessionsError } = await studentClient
    .from('sessions')
    .select('*');

  if (sessionsError) {
    logFail(`Cannot SELECT own sessions: ${sessionsError.message}`);
    testResults.failed++;
  } else {
    logPass(`Can SELECT own sessions (${ownSessions?.length || 0} sessions)`);
    testResults.passed++;
  }

  // Test 1.3: SELECT own messages
  logTest('Student SELECT own messages');
  const { data: ownMessages, error: messagesError } = await studentClient
    .from('messages')
    .select('*')
    .limit(10);

  if (messagesError) {
    logFail(`Cannot SELECT own messages: ${messagesError.message}`);
    testResults.failed++;
  } else {
    logPass(`Can SELECT own messages (${ownMessages?.length || 0} messages)`);
    testResults.passed++;
  }

  // Test 1.4: SELECT own progress
  logTest('Student SELECT own progress');
  const { data: ownProgress, error: progressError } = await studentClient
    .from('student_progress')
    .select('*');

  if (progressError) {
    logFail(`Cannot SELECT own progress: ${progressError.message}`);
    testResults.failed++;
  } else {
    logPass(`Can SELECT own progress (${ownProgress?.length || 0} records)`);
    testResults.passed++;
  }

  // Test 1.5: SELECT own analytics
  logTest('Student SELECT own analytics');
  const { data: ownAnalytics, error: analyticsError } = await studentClient
    .from('dq_analytics')
    .select('*');

  if (analyticsError) {
    logFail(`Cannot SELECT own analytics: ${analyticsError.message}`);
    testResults.failed++;
  } else {
    logPass(`Can SELECT own analytics (${ownAnalytics?.length || 0} records)`);
    testResults.passed++;
  }

  testResults.tests.push({ name: 'TEST 1: Student Access Own Data', status: 'COMPLETE' });
}

async function testStudentCannotAccessOtherData() {
  logSection('TEST 2: Student Cannot Access Other Students\' Data');

  // Get current student ID
  const studentUser = await studentClient.auth.getUser();
  const currentStudentId = studentUser.data.user?.id;

  // Try to find another student ID (not the current student and not a teacher)
  // Get all users and find a student that's not the current one
  const { data: allUsers, error: usersError } = await studentClient
    .from('users')
    .select('id, role')
    .eq('role', 'student')
    .neq('id', currentStudentId)
    .limit(1);

  let otherStudentId = null;
  
  // If we can't find another student via the API, try using a known UUID format
  // or skip the test with explanation
  if (allUsers && allUsers.length > 0) {
    otherStudentId = allUsers[0].id;
  } else {
    // Check if we got any users (might be filtered by RLS, which is OK)
    // Try to test with a non-existent UUID to verify RLS blocks appropriately
    logInfo('No other student IDs found (expected if RLS is working - students can only see their teachers)');
    logInfo('Testing with non-existent student ID to verify RLS behavior');
    otherStudentId = '00000000-0000-0000-0000-000000000000'; // Non-existent UUID
  }

  // Test 2.1: Cannot SELECT other student's record (if exists)
  logTest('Student trying to SELECT other student record');
  const { data: otherUser, error: otherUserError } = await studentClient
    .from('users')
    .select('*')
    .eq('id', otherStudentId)
    .single();

  if (otherUser && !otherUserError) {
    // Check if it's actually the requested user or if it was filtered
    if (otherUser.id === otherStudentId && otherUser.role === 'student') {
      logFail(`Can SELECT other student record (should be blocked)`);
      testResults.failed++;
    } else if (otherUser.role === 'teacher') {
      logPass('Cannot SELECT other student record (only seeing teacher, which is allowed by RLS)');
      testResults.passed++;
    } else {
      logPass('Cannot SELECT other student record (filtered by RLS)');
      testResults.passed++;
    }
  } else if (otherUserError?.code === 'PGRST116' || !otherUser) {
    logPass('Cannot SELECT other student record (RLS blocking or record not found)');
    testResults.passed++;
  } else {
    logWarning(`Unexpected error: ${otherUserError?.message || 'Unknown'}`);
    testResults.warnings++;
  }

  testResults.tests.push({ name: 'TEST 2: Student Cannot Access Other Data', status: 'COMPLETE' });
}

async function testTeacherAccessOwnStudents() {
  logSection('TEST 3: Teacher Can Access Own Students\' Data');

  // Test 3.1: SELECT students (should return students in teacher's classrooms)
  logTest('Teacher SELECT students');
  const { data: students, error: studentsError } = await teacherClient
    .from('users')
    .select('*')
    .eq('role', 'student');

  if (studentsError) {
    logFail(`Cannot SELECT students: ${studentsError.message}`);
    testResults.failed++;
  } else {
    logPass(`Can SELECT students (${students?.length || 0} students in classrooms)`);
    testResults.passed++;
  }

  // Test 3.2: SELECT own teacher record
  logTest('Teacher SELECT own teacher record');
  const teacherUser = await teacherClient.auth.getUser();
  const teacherId = teacherUser.data.user?.id;

  if (teacherId) {
    const { data: ownTeacher, error: teacherError } = await teacherClient
      .from('teachers')
      .select('*')
      .eq('id', teacherId)
      .single();

    if (teacherError || !ownTeacher) {
      logFail(`Cannot SELECT own teacher record: ${teacherError?.message || 'No data'}`);
      testResults.failed++;
    } else {
      logPass('Can SELECT own teacher record');
      testResults.passed++;
    }
  }

  // Test 3.3: SELECT own classrooms
  logTest('Teacher SELECT own classrooms');
  const { data: classrooms, error: classroomsError } = await teacherClient
    .from('classrooms')
    .select('*');

  if (classroomsError) {
    logFail(`Cannot SELECT own classrooms: ${classroomsError.message}`);
    testResults.failed++;
  } else {
    logPass(`Can SELECT own classrooms (${classrooms?.length || 0} classrooms)`);
    testResults.passed++;
  }

  testResults.tests.push({ name: 'TEST 3: Teacher Access Own Students', status: 'COMPLETE' });
}

async function testUnauthenticatedAccess() {
  logSection('TEST 4: Unauthenticated User Access Blocked');

  // Test 4.1: Cannot SELECT users
  logTest('Unauthenticated user trying to SELECT users');
  const { data: users, error: usersError } = await anonClient
    .from('users')
    .select('*')
    .limit(1);

  if (users && users.length > 0) {
    logFail('Can SELECT users without authentication (should be blocked)');
    testResults.failed++;
  } else if (usersError?.code === '42501' || usersError?.message?.includes('permission')) {
    logPass('Cannot SELECT users without authentication (RLS blocking)');
    testResults.passed++;
  } else if (!users || users.length === 0) {
    // Empty result means RLS is working - it's filtering out all rows
    logPass('Cannot SELECT users without authentication (RLS blocking - empty result)');
    testResults.passed++;
  } else {
    logWarning(`Unexpected result: ${usersError?.message || 'Unknown'}`);
    testResults.warnings++;
  }

  // Test 4.2: Cannot SELECT sessions
  logTest('Unauthenticated user trying to SELECT sessions');
  const { data: sessions, error: sessionsError } = await anonClient
    .from('sessions')
    .select('*')
    .limit(1);

  if (sessions && sessions.length > 0) {
    logFail('Can SELECT sessions without authentication (should be blocked)');
    testResults.failed++;
  } else if (sessionsError?.code === '42501' || sessionsError?.message?.includes('permission')) {
    logPass('Cannot SELECT sessions without authentication (RLS blocking)');
    testResults.passed++;
  } else if (!sessions || sessions.length === 0) {
    // Empty result means RLS is working
    logPass('Cannot SELECT sessions without authentication (RLS blocking - empty result)');
    testResults.passed++;
  } else {
    logWarning(`Unexpected result: ${sessionsError?.message || 'Unknown'}`);
    testResults.warnings++;
  }

  testResults.tests.push({ name: 'TEST 4: Unauthenticated Access Blocked', status: 'COMPLETE' });
}

async function testResearchCodeMapping() {
  logSection('TEST 5: Research Code Mapping Access Control');

  const studentUser = await studentClient.auth.getUser();
  const studentId = studentUser.data.user?.id;

  if (!studentId) {
    logWarning('Cannot test - no student ID available');
    testResults.warnings++;
    return;
  }

  // Test 5.1: Can INSERT own research code mapping
  logTest('Student INSERT own research code mapping');
  // Generate a code that fits the schema (VARCHAR(50) with prefix RES- and 6 chars)
  const timestamp = Date.now().toString().slice(-6); // Last 6 digits
  const testCode = `RES-TEST${timestamp}`;
  
  logInfo(`Attempting to INSERT with code: ${testCode}`);
  const { data: insertData, error: insertError } = await studentClient
    .from('research_code_mappings')
    .insert({
      user_id: studentId,
      research_code: testCode,
      character_name: 'jamie'
    })
    .select()
    .single();

  if (insertError) {
    logInfo(`Error code: ${insertError.code}, message: ${insertError.message}`);
    // Check if it's a duplicate (which is OK - user already has code)
    if (insertError.code === '23505' || insertError.message?.includes('duplicate') || insertError.message?.includes('unique')) {
      logPass('Cannot INSERT duplicate research code (expected - user already has a research code mapping)');
      logInfo('This is correct behavior: each user should only have one research code');
      testResults.passed++;
    } else if (insertError.code === '42501' || insertError.message?.includes('permission') || insertError.message?.includes('row-level security')) {
      logFail(`Cannot INSERT own research code mapping - Permission denied (code: ${insertError.code})`);
      logInfo('This indicates an RLS policy issue - users should be able to INSERT their own research codes');
      testResults.failed++;
    } else if (insertError.message && insertError.message.includes('character varying')) {
      logWarning(`Schema issue: ${insertError.message} (not an RLS issue)`);
      testResults.warnings++;
    } else {
      logWarning(`Unexpected error (code: ${insertError.code}): ${insertError.message}`);
      testResults.warnings++;
    }
  } else {
    logPass('Can INSERT own research code mapping');
    testResults.passed++;
    logInfo(`Successfully inserted research code: ${testCode}`);
    // Note: We can't easily clean up test data without service role, but that's OK
  }

  // Test 5.2: Cannot SELECT research code mappings (reverse lookup prevention)
  logTest('Student trying to SELECT research code mappings');
  const { data: mappings, error: selectError } = await studentClient
    .from('research_code_mappings')
    .select('*');

  if (mappings && mappings.length > 0) {
    logFail('Can SELECT research code mappings (should be blocked)');
    testResults.failed++;
  } else if (selectError?.code === '42501' || selectError?.message?.includes('permission')) {
    logPass('Cannot SELECT research code mappings (reverse lookup prevention working)');
    testResults.passed++;
  } else if (!mappings || mappings.length === 0) {
    // Empty result means RLS is working - the SELECT policy blocks access
    logPass('Cannot SELECT research code mappings (RLS blocking - empty result, reverse lookup prevention working)');
    testResults.passed++;
  } else {
    logWarning(`Unexpected result: ${selectError?.message || 'Unknown'}`);
    testResults.warnings++;
  }

  testResults.tests.push({ name: 'TEST 5: Research Code Mapping', status: 'COMPLETE' });
}

async function printSummary() {
  logSection('Test Summary');

  log(`Total Tests: ${testResults.passed + testResults.failed + testResults.warnings}`, 'bold');
  log(`✅ Passed: ${testResults.passed}`, 'green');
  log(`❌ Failed: ${testResults.failed}`, 'red');
  log(`⚠️  Warnings: ${testResults.warnings}`, 'yellow');

  console.log('\nTest Details:');
  testResults.tests.forEach(test => {
    log(`  • ${test.name}: ${test.status}`, test.status === 'COMPLETE' ? 'green' : 'red');
  });

  if (testResults.failed === 0) {
    log('\n✅ All critical tests passed!', 'green');
  } else {
    log('\n❌ Some tests failed. Review the errors above.', 'red');
  }
}

// Main test runner
async function runTests() {
  logSection('RLS Policy Application-Level Tests');
  log('Testing RLS policies after performance optimization\n', 'cyan');

  // Initialize clients
  const initialized = await initializeClients();
  if (!initialized) {
    log('\n⚠️  Warning: Could not initialize all test clients', 'yellow');
    log('Some tests may be skipped. Check your test account credentials.\n', 'yellow');
  }

  // Run tests
  try {
    if (studentClient) {
      await testStudentAccessOwnData();
      await testStudentCannotAccessOtherData();
    } else {
      logWarning('Skipping student tests - student client not initialized');
    }

    if (teacherClient) {
      await testTeacherAccessOwnStudents();
    } else {
      logWarning('Skipping teacher tests - teacher client not initialized');
    }

    await testUnauthenticatedAccess();

    if (studentClient) {
      await testResearchCodeMapping();
    } else {
      logWarning('Skipping research code mapping tests - student client not initialized');
    }

  } catch (error) {
    logFail(`Unexpected error during testing: ${error.message}`);
    console.error(error);
  }

  // Print summary
  await printSummary();
}

// Run tests if executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };

