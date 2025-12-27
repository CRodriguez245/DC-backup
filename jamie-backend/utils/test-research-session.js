/**
 * Test script for research session storage
 * Run with: node utils/test-research-session.js
 * 
 * Tests saving research sessions and messages to the database
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { 
  saveCompleteResearchSession,
  convertConversationHistoryToMessages
} = require('./researchSession');

const { createResearchCode } = require('./researchCode');

async function runTests() {
  console.log('🧪 Testing Research Session Storage');
  console.log('============================================================\n');

  try {
    // Step 1: Get a test user and create research code
    console.log('Step 1: Getting test user and creating research code...');
    const { data: users } = await supabase
      .from('users')
      .select('id, email')
      .eq('role', 'student')
      .limit(1)
      .single();

    if (!users) {
      console.log('⚠️  No users found - creating test user first...');
      // For testing, we can skip this or create a test user
      throw new Error('No test user available');
    }

    const testUserId = users.id;
    console.log(`✅ Using test user: ${users.email}\n`);

    // Check if user already has code, if not create one
    let researchCode;
    try {
      researchCode = await createResearchCode(testUserId, 'jamie');
      console.log(`✅ Research code: ${researchCode}\n`);
    } catch (error) {
      console.log(`⚠️  Error creating code (might already exist): ${error.message}`);
      // Try to get existing code
      const { data: existing } = await supabase
        .from('research_code_mappings')
        .select('research_code')
        .eq('user_id', testUserId)
        .eq('character_name', 'jamie')
        .single();
      
      if (existing) {
        researchCode = existing.research_code;
        console.log(`✅ Using existing research code: ${researchCode}\n`);
      } else {
        throw new Error('Could not get or create research code');
      }
    }

    // Step 2: Create test session data
    console.log('Step 2: Creating test session data...');
    const sessionStartTime = new Date(Date.now() - 15 * 60 * 1000); // 15 minutes ago
    const sessionEndTime = new Date();
    
    const sessionData = {
      startedAt: sessionStartTime.toISOString(),
      completedAt: sessionEndTime.toISOString(),
      turnsUsed: 4,
      maxTurns: 20,
      sessionStatus: 'completed'
    };

    // Step 3: Create test messages (conversation history format)
    console.log('Step 3: Creating test messages...');
    const conversationHistory = [
      {
        role: 'user',
        content: 'I understand you\'re feeling overwhelmed. Can you tell me more about what specifically is making you feel stuck?'
      },
      {
        role: 'coach',
        content: 'Um, yeah, I guess I could really use some help right now. It\'s just—I\'m feeling so, like, lost and, um, overwhelmed about everything.'
      },
      {
        role: 'user',
        content: 'That sounds really challenging. What specifically feels most overwhelming to you right now?'
      },
      {
        role: 'coach',
        content: 'I think it\'s just... I don\'t know, like, I want to do design but I also don\'t want to disappoint my parents, you know?'
      }
    ];

    // DQ scores for user messages (2 user messages)
    const dqScoresArray = [
      {
        framing: 0.6,
        alternatives: 0.2,
        information: 0.5,
        values: 0.3,
        reasoning: 0.4,
        commitment: 0.2,
        overall: 0.35
      },
      {
        framing: 0.7,
        alternatives: 0.3,
        information: 0.6,
        values: 0.4,
        reasoning: 0.5,
        commitment: 0.3,
        overall: 0.47
      }
    ];

    // Convert conversation history to messages format
    const messages = convertConversationHistoryToMessages(
      conversationHistory,
      dqScoresArray,
      sessionStartTime.toISOString()
    );

    console.log(`✅ Created ${messages.length} messages (${messages.filter(m => m.role === 'user').length} user, ${messages.filter(m => m.role === 'coach').length} coach)\n`);

    // Step 4: Save complete research session
    console.log('Step 4: Saving research session and messages...');
    const result = await saveCompleteResearchSession(researchCode, sessionData, messages);
    
    console.log(`✅ Successfully saved:`);
    console.log(`   Session ID: ${result.session.id}`);
    console.log(`   Research Code: ${result.researchCode}`);
    console.log(`   Messages Saved: ${result.messagesCount}`);
    console.log(`   Turns Used: ${result.session.turns_used}`);
    console.log(`   Status: ${result.session.session_status}\n`);

    // Step 5: Verify data was saved correctly
    console.log('Step 5: Verifying saved data...');
    
    // Verify session
    const { data: verifySession } = await supabase
      .from('research_sessions')
      .select('*')
      .eq('id', result.session.id)
      .single();

    if (verifySession) {
      console.log('✅ Session verified in database');
      console.log(`   Research Code: ${verifySession.research_code}`);
      console.log(`   Duration: ${verifySession.duration_seconds}s`);
      console.log(`   Turns: ${verifySession.turns_used}/${verifySession.max_turns}`);
    }

    // Verify messages
    const { data: verifyMessages } = await supabase
      .from('research_messages')
      .select('*')
      .eq('research_session_id', result.session.id)
      .order('turn_number', { ascending: true })
      .order('timestamp', { ascending: true });

    if (verifyMessages && verifyMessages.length > 0) {
      console.log(`✅ Messages verified: ${verifyMessages.length} messages found`);
      console.log(`   User messages with DQ scores: ${verifyMessages.filter(m => m.dq_scores !== null).length}`);
      
      // Show sample message
      const sampleMessage = verifyMessages[0];
      console.log(`   Sample message:`);
      console.log(`     Type: ${sampleMessage.message_type}`);
      console.log(`     Turn: ${sampleMessage.turn_number}`);
      console.log(`     Has DQ scores: ${sampleMessage.dq_scores !== null ? 'Yes' : 'No'}`);
    }

    console.log('\n============================================================');
    console.log('✅ All tests passed!');
    console.log('============================================================\n');

    console.log('📋 Summary:');
    console.log(`   Research Code: ${researchCode}`);
    console.log(`   Session ID: ${result.session.id}`);
    console.log(`   Messages: ${result.messagesCount}`);
    console.log(`   Status: Research session saved successfully\n`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests };

