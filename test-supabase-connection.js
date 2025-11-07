// Test Supabase connection and environment variables
const { createClient } = require('@supabase/supabase-js');

// Test with the production environment variables
const supabaseUrl = 'https://lcvxiasswxagwcxolzmi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjdnhpYXNzd3hhZ3djeG9sem1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwODM0MTcsImV4cCI6MjA3NjY1OTQxN30.nhp6C4WxlYlzHbfqZGCMU2oomkS2TgI6GfsVhMZ2VcY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    // Test 1: Check if we can connect
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.error('❌ Supabase connection error:', error);
      return;
    }
    
    console.log('✅ Supabase connection successful');
    console.log('📊 Users table accessible');
    
    // Test 2: Check RLS policies
    console.log('🔍 Testing RLS policies...');
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5);
    
    if (usersError) {
      console.error('❌ RLS policy error:', usersError);
      console.log('💡 This might be due to RLS policies blocking access');
    } else {
      console.log('✅ RLS policies working correctly');
      console.log('👥 Found users:', users.length);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testConnection();