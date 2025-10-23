// Test Supabase connection
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://lcvxiasswxagwcxolzmi.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjdnhpYXNzd3hhZ3djeG9sem1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwODM0MTcsImV4cCI6MjA3NjY1OTQxN30.nhp6C4WxlYlzHbfqZGCMU2oomkS2TgI6GfsVhMZ2VcY'

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
    
    // Test 2: Try to insert a test user
    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert({
        email: 'test@example.com',
        name: 'Test User',
        role: 'student'
      })
      .select()
    
    if (insertError) {
      console.log('⚠️  Insert test failed:', insertError.message)
    } else {
      console.log('✅ Insert test successful!')
      console.log('Inserted user:', insertData)
    }
    
    return true
    
  } catch (err) {
    console.log('❌ Test failed:', err.message)
    return false
  }
}

testConnection()
