// Test Supabase connection
// Run this with: node test-supabase.js

const { createClient } = require('@supabase/supabase-js')

// Replace with your actual Supabase credentials
const supabaseUrl = 'YOUR_SUPABASE_URL_HERE'
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY_HERE'

if (supabaseUrl === 'YOUR_SUPABASE_URL_HERE' || supabaseKey === 'YOUR_SUPABASE_ANON_KEY_HERE') {
  console.log('❌ Please update the Supabase credentials in this file first!')
  console.log('1. Go to your Supabase dashboard')
  console.log('2. Go to Settings → API')
  console.log('3. Copy your Project URL and anon public key')
  console.log('4. Replace the values in this file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log('🧪 Testing Supabase connection...')
  
  try {
    // Test 1: Check if we can connect
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      console.log('❌ Connection failed:', error.message)
      return false
    }
    
    console.log('✅ Supabase connection successful!')
    
    // Test 2: Check if tables exist
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_schema_tables')
      .limit(1)
    
    if (tablesError) {
      console.log('⚠️  Could not verify tables (this is normal for new projects)')
    } else {
      console.log('✅ Database tables accessible!')
    }
    
    console.log('🎉 Your Supabase setup is working correctly!')
    return true
    
  } catch (err) {
    console.log('❌ Test failed:', err.message)
    return false
  }
}

testConnection()
