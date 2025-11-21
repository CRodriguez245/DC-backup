// Test script to verify student progress functionality
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lcvxiasswxagwcxolzmi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjdnhpYXNzd3hhZ3djeG9sem1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwODM0MTcsImV4cCI6MjA3NjY1OTQxN30.nhp6C4WxlYlzHbfqZGCMU2oomkS2TgI6GfsVhMZ2VcY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testStudentProgress() {
  console.log('Testing student progress functionality...');
  
  // Test 1: Check if student_progress table exists and has RLS enabled
  console.log('\n1. Checking student_progress table...');
  const { data: tables, error: tableError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .eq('table_name', 'student_progress');
  
  if (tableError) {
    console.error('Error checking tables:', tableError);
  } else {
    console.log('student_progress table exists:', tables.length > 0);
  }
  
  // Test 2: Check RLS policies
  console.log('\n2. Checking RLS policies...');
  const { data: policies, error: policyError } = await supabase
    .from('pg_policies')
    .select('policyname, cmd')
    .eq('tablename', 'student_progress');
  
  if (policyError) {
    console.error('Error checking policies:', policyError);
  } else {
    console.log('RLS policies:', policies);
  }
  
  // Test 3: Try to insert a test record (this will fail if RLS is blocking)
  console.log('\n3. Testing insert with anonymous user...');
  const testStudentId = 'test-student-id';
  const { data: insertData, error: insertError } = await supabase
    .from('student_progress')
    .insert({
      student_id: testStudentId,
      character_name: 'jamie',
      level: 'assessment',
      average_dq_score: 0.5,
      completed_at: new Date().toISOString()
    });
  
  if (insertError) {
    console.log('Insert failed (expected for anonymous user):', insertError.message);
  } else {
    console.log('Insert succeeded:', insertData);
  }
  
  // Test 4: Check if we can read from the table
  console.log('\n4. Testing read access...');
  const { data: readData, error: readError } = await supabase
    .from('student_progress')
    .select('*')
    .limit(5);
  
  if (readError) {
    console.log('Read failed:', readError.message);
  } else {
    console.log('Read succeeded, found', readData.length, 'records');
  }
}

testStudentProgress().catch(console.error);
