/**
 * Test STEP 5: Session Completion Integration
 * 
 * Tests that research code generation and session saving works
 * when a Jamie session completes (first attempt only)
 * 
 * Run with: node utils/test-step5-integration.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { createResearchCode, hasResearchCode } = require('./researchCode');
const { saveCompleteResearchSession, convertConversationHistoryToMessages } = require('./researchSession');

async function testStep5Integration() {
  console.log('🧪 Testing STEP 5: Session Completion Integration');
  console.log('============================================================\n');

  let passed = 0;
  let failed = 0;

  try {
    // Step 1: Get or create test user
    console.log('Step 1: Setting up test user...');
    let testUserId;
    const { data: users } = await supabase
      .from('users')
      .select('id, email')
      .eq('role', 'student')
      .limit(1)
      .single();

    if (users) {
      testUserId = users.id;
      console.log(`✅ Using test user: ${users.email} (${testUserId})`);
    } else {
      throw new Error('No test user available');
    }
    console.log('');

    // Step 2: Clean up any existing research code for this user
    console.log('Step 2: Cleaning up existing research code (if any)...');
    const { data: existingMapping } = await supabase
      .from('research_code_mappings')
      .select('research_code')
      .eq('user_id', testUserId)
      .eq('character_name', 'jamie')
      .single();

    if (existingMapping) {
      // Delete existing session if it exists
      const { data: existingSession } = await supabase
        .from('research_sessions')
        .select('id')
        .eq('research_code', existingMapping.research_code)
        .single();

      if (existingSession) {
        // Delete messages first
        await supabase
          .from('research_messages')
          .delete()
          .eq('research_session_id', existingSession.id);
        
        // Delete session
        await supabase
          .from('research_sessions')
          .delete()
          .eq('id', existingSession.id);
      }

      // Delete mapping
      await supabase
        .from('research_code_mappings')
        .delete()
        .eq('user_id', testUserId)
        .eq('character_name', 'jamie');

      console.log(`   ✅ Cleaned up existing research code: ${existingMapping.research_code}`);
    } else {
      console.log('   ✅ No existing research code found (this is expected for first attempt)');
    }
    console.log('');

    // Step 3: Simulate session completion (first attempt scenario)
    console.log('Step 3: Simulating first Jamie session completion...');
    
    // Check if first attempt (should return false)
    const { hasCode: hasCodeBefore, code: codeBefore } = await hasResearchCode(testUserId, 'jamie');
    
    if (hasCodeBefore) {
      console.log(`❌ User already has research code: ${codeBefore}`);
      console.log('   This test requires a user without a research code.');
      failed++;
      return;
    }
    
    console.log('✅ Confirmed: User does not have research code (first attempt)');
    
    // Simulate conversation data
    const sessionStartTime = new Date(Date.now() - 20 * 60 * 1000); // 20 minutes ago
    const sessionEndTime = new Date();
    const turnsUsed = 5;
    const maxTurns = 20;
    
    // Simulate conversation history
    const conversationHistory = [
      { role: 'user', content: 'I need help deciding between engineering and design.' },
      { role: 'coach', content: 'I understand you\'re feeling overwhelmed. Can you tell me more about what specifically is making you feel stuck?' },
      { role: 'user', content: 'My parents want me to do engineering but I love design.' },
      { role: 'coach', content: 'That sounds really challenging. What specifically feels most overwhelming to you right now?' },
      { role: 'user', content: 'I don\'t want to disappoint them.' },
      { role: 'coach', content: 'I hear that. It\'s natural to care about your parents\' opinions.' },
      { role: 'user', content: 'What should I do?' },
      { role: 'coach', content: 'Let\'s explore your values and what matters most to you.' },
      { role: 'user', content: 'I think creativity is really important to me.' },
      { role: 'coach', content: 'That\'s valuable insight. How might we honor both your creativity and your parents\' concerns?' }
    ];
    
    // Simulate DQ scores
    const dqScores = [
      { framing: 0.6, alternatives: 0.2, information: 0.5, values: 0.3, reasoning: 0.4, commitment: 0.2 },
      { framing: 0.7, alternatives: 0.3, information: 0.6, values: 0.4, reasoning: 0.5, commitment: 0.3 },
      { framing: 0.8, alternatives: 0.4, information: 0.7, values: 0.5, reasoning: 0.6, commitment: 0.4 },
      { framing: 0.7, alternatives: 0.5, information: 0.6, values: 0.6, reasoning: 0.5, commitment: 0.3 },
      { framing: 0.8, alternatives: 0.6, information: 0.7, values: 0.7, reasoning: 0.6, commitment: 0.5 }
    ];
    
    console.log(`   Session: ${turnsUsed} turns, ${conversationHistory.length} messages`);
    console.log(`   Start: ${sessionStartTime.toISOString()}`);
    console.log(`   End: ${sessionEndTime.toISOString()}`);
    console.log('');

    // Step 4: Generate research code (simulating chat.js behavior)
    console.log('Step 4: Generating research code...');
    let researchCode;
    try {
      researchCode = await createResearchCode(testUserId, 'jamie');
      console.log(`✅ Research code generated: ${researchCode}`);
      passed++;
    } catch (error) {
      console.log(`❌ Failed to generate research code: ${error.message}`);
      failed++;
      throw error;
    }
    console.log('');

    // Step 5: Convert conversation history to messages format
    console.log('Step 5: Converting conversation history to messages format...');
    const messages = convertConversationHistoryToMessages(
      conversationHistory,
      dqScores,
      sessionStartTime.toISOString()
    );
    
    console.log(`✅ Converted ${messages.length} messages`);
    console.log(`   User messages: ${messages.filter(m => m.role === 'user').length}`);
    console.log(`   Coach messages: ${messages.filter(m => m.role === 'coach').length}`);
    console.log(`   Messages with DQ scores: ${messages.filter(m => m.dqScore).length}`);
    passed++;
    console.log('');

    // Step 6: Save research session (simulating chat.js behavior)
    console.log('Step 6: Saving research session...');
    try {
      const result = await saveCompleteResearchSession(researchCode, {
        startedAt: sessionStartTime.toISOString(),
        completedAt: sessionEndTime.toISOString(),
        turnsUsed: turnsUsed,
        maxTurns: maxTurns,
        sessionStatus: 'completed'
      }, messages);
      
      console.log(`✅ Research session saved successfully`);
      console.log(`   Session ID: ${result.session.id}`);
      console.log(`   Messages saved: ${result.messagesCount}`);
      passed++;
    } catch (error) {
      console.log(`❌ Failed to save research session: ${error.message}`);
      failed++;
      throw error;
    }
    console.log('');

    // Step 7: Verify data was saved correctly
    console.log('Step 7: Verifying saved data...');
    
    // Verify research code mapping exists
    const { data: verifyMapping } = await supabase
      .from('research_code_mappings')
      .select('*')
      .eq('user_id', testUserId)
      .eq('character_name', 'jamie')
      .single();
    
    if (verifyMapping && verifyMapping.research_code === researchCode) {
      console.log('✅ Research code mapping verified');
      passed++;
    } else {
      console.log('❌ Research code mapping not found or incorrect');
      failed++;
    }
    
    // Verify session exists
    const { data: verifySession } = await supabase
      .from('research_sessions')
      .select('*')
      .eq('research_code', researchCode)
      .single();
    
    if (verifySession) {
      console.log(`✅ Research session verified`);
      console.log(`   Turns: ${verifySession.turns_used}/${verifySession.max_turns}`);
      console.log(`   Status: ${verifySession.session_status}`);
      passed++;
    } else {
      console.log('❌ Research session not found');
      failed++;
    }
    
    // Verify messages exist
    const { data: verifyMessages } = await supabase
      .from('research_messages')
      .select('*')
      .eq('research_session_id', verifySession.id)
      .order('turn_number', { ascending: true });
    
    if (verifyMessages && verifyMessages.length === messages.length) {
      console.log(`✅ Research messages verified: ${verifyMessages.length} messages`);
      const userMessagesWithScores = verifyMessages.filter(m => m.dq_scores !== null);
      console.log(`   User messages with DQ scores: ${userMessagesWithScores.length}`);
      passed++;
    } else {
      console.log(`❌ Message count mismatch: expected ${messages.length}, got ${verifyMessages?.length || 0}`);
      failed++;
    }
    console.log('');

    // Step 8: Test second attempt (should NOT save)
    console.log('Step 8: Testing second attempt (should NOT save new session)...');
    const { hasCode: hasCodeAfter, code: codeAfter } = await hasResearchCode(testUserId, 'jamie');
    
    if (hasCodeAfter && codeAfter === researchCode) {
      console.log(`✅ Second attempt correctly detected existing code: ${codeAfter}`);
      console.log('   (Would skip research save in real chat.js flow)');
      passed++;
    } else {
      console.log(`❌ Research code check failed after first attempt`);
      failed++;
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
      console.log('\n🎉 All tests passed! STEP 5 integration is working correctly.');
      console.log('');
      console.log('✅ Research code generation: Working');
      console.log('✅ Research session saving: Working');
      console.log('✅ First attempt detection: Working');
      console.log('✅ Data integrity: Verified');
      console.log('');
      console.log(`📋 Research Code: ${researchCode}`);
      console.log(`📋 Session ID: ${verifySession?.id || 'N/A'}`);
      console.log(`📋 Messages: ${verifyMessages?.length || 0}`);
    } else {
      console.log(`\n⚠️  ${failed} test(s) failed - review above`);
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  testStep5Integration();
}

module.exports = { testStep5Integration };

