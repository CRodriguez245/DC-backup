/**
 * Full Test for Research Session Storage
 * Tests a complete Jamie session (20 turns = 40 messages)
 * Includes timing measurements
 * Run with: node utils/test-research-session-full.js
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

// Generate realistic DQ scores
function generateDQScore() {
  return {
    framing: Math.round((Math.random() * 0.7 + 0.2) * 100) / 100,
    alternatives: Math.round((Math.random() * 0.6 + 0.1) * 100) / 100,
    information: Math.round((Math.random() * 0.7 + 0.2) * 100) / 100,
    values: Math.round((Math.random() * 0.6 + 0.1) * 100) / 100,
    reasoning: Math.round((Math.random() * 0.7 + 0.2) * 100) / 100,
    commitment: Math.round((Math.random() * 0.5 + 0.1) * 100) / 100,
    overall: Math.round((Math.random() * 0.6 + 0.25) * 100) / 100
  };
}

// Generate realistic conversation messages
const sampleUserMessages = [
  "I'm feeling really stuck about choosing between engineering and design. My parents want me to do engineering but I love design.",
  "I guess I'm worried about disappointing them, you know? They've invested so much in my education.",
  "What if I choose design and can't find a good job? Engineering feels safer.",
  "I've been researching design programs, and there are some good options. But my parents think it's not practical.",
  "I don't know how to have that conversation with them. Every time I bring it up, it turns into an argument.",
  "Maybe I could do engineering with a minor in design? Or double major?",
  "I think I need to understand what I really want before I can talk to them about it.",
  "What questions should I be asking myself to figure this out?",
  "I've been journaling about my values, and creativity and self-expression are really important to me.",
  "But stability and financial security are also important. I don't want to struggle financially.",
  "I've talked to some design professionals, and they say the job market is actually pretty good.",
  "My engineering friends seem stressed and unhappy, even though they have good jobs.",
  "I guess I'm trying to figure out if I can be happy in engineering even if it's not my passion.",
  "What if I try engineering for a year and switch if I don't like it?",
  "I think I'm ready to have that conversation with my parents now.",
  "Thank you for helping me think through this. I feel more confident about my decision.",
  "I'm going to schedule a time to sit down with them and really explain my perspective.",
  "I think they'll come around once they understand how much thought I've put into this.",
  "I'm feeling excited about the future now, which is a big change from where I started.",
  "Thanks for everything. This conversation really helped me clarify what I want."
];

const sampleCoachMessages = [
  "I hear you're feeling stuck between engineering and design. That's a really important decision. Can you tell me more about what draws you to each option?",
  "It sounds like your relationship with your parents is really important to you. What do you think it would mean to 'disappoint' them?",
  "It's understandable to worry about job prospects. What have you learned so far about career paths in design versus engineering?",
  "It sounds like you've done some research. What did you find that was particularly interesting or concerning?",
  "Difficult conversations with parents can be really challenging. What's worked or not worked in past conversations?",
  "That's an interesting possibility. What do you think you'd gain from that approach?",
  "That self-awareness is really valuable. What insights have you had so far?",
  "Great question. Let's think about what matters most to you in a career and in your life overall.",
  "That's a great practice. What patterns are you noticing about what's important to you?",
  "Both of those values are valid and important. How might you honor both in your decision?",
  "That's excellent that you're gathering information. What stood out to you in those conversations?",
  "That's an important observation. What does that tell you about career satisfaction?",
  "That's a thoughtful question. What would 'happiness' look like for you in an engineering career?",
  "That's one approach. What would you need to know to make that experiment useful?",
  "It sounds like you've done a lot of reflection. What feels different now than at the start?",
  "I'm glad this was helpful. What's the most important thing you've learned about yourself?",
  "That's a great plan. How do you want to prepare for that conversation?",
  "That confidence comes through. What do you think will help them understand your perspective?",
  "That shift in feeling is really significant. What do you think made the difference?",
  "You're welcome. You've done really thoughtful work here. I'm excited to see where this leads you."
];

async function runFullTest() {
  console.log('🧪 Full Research Session Storage Test (20 Turns)');
  console.log('============================================================\n');

  try {
    // Step 1: Get test user and research code
    console.log('Step 1: Getting test user and research code...');
    const { data: users } = await supabase
      .from('users')
      .select('id, email')
      .eq('role', 'student')
      .limit(1)
      .single();

    if (!users) {
      throw new Error('No test user available');
    }

    const testUserId = users.id;
    console.log(`✅ Using test user: ${users.email}`);

    // Get or create research code
    let researchCode;
    try {
      // Try to get existing code first
      const { data: existing } = await supabase
        .from('research_code_mappings')
        .select('research_code')
        .eq('user_id', testUserId)
        .eq('character_name', 'jamie')
        .single();
      
      if (existing) {
        researchCode = existing.research_code;
        console.log(`✅ Using existing research code: ${researchCode}`);
        
        // Delete any existing session for this code (to allow fresh test)
        const { data: existingSession } = await supabase
          .from('research_sessions')
          .select('id')
          .eq('research_code', researchCode)
          .single();
        
        if (existingSession) {
          // Delete messages first (CASCADE should handle this, but being explicit)
          await supabase
            .from('research_messages')
            .delete()
            .eq('research_session_id', existingSession.id);
          
          // Delete session
          await supabase
            .from('research_sessions')
            .delete()
            .eq('id', existingSession.id);
          
          console.log(`   (Deleted existing session for fresh test)`);
        }
      } else {
        researchCode = await createResearchCode(testUserId, 'jamie');
        console.log(`✅ Created research code: ${researchCode}`);
      }
    } catch (error) {
      throw new Error(`Could not get or create research code: ${error.message}`);
    }
    console.log('');

    // Step 2: Create full session data (20 turns)
    console.log('Step 2: Creating full session data (20 turns = 40 messages)...');
    const sessionStartTime = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago
    const sessionEndTime = new Date();
    
    const MAX_TURNS = 20;
    const sessionData = {
      startedAt: sessionStartTime.toISOString(),
      completedAt: sessionEndTime.toISOString(),
      turnsUsed: MAX_TURNS,
      maxTurns: MAX_TURNS,
      sessionStatus: 'completed'
    };
    console.log(`✅ Session data created (${MAX_TURNS} turns)\n`);

    // Step 3: Generate full conversation history (20 turns = 40 messages)
    console.log('Step 3: Generating conversation history...');
    const conversationHistory = [];
    const dqScoresArray = [];

    for (let turn = 0; turn < MAX_TURNS; turn++) {
      // User message
      const userMsg = sampleUserMessages[turn] || `User message for turn ${turn + 1}`;
      conversationHistory.push({
        role: 'user',
        content: userMsg
      });
      
      // Generate DQ score for this user message
      dqScoresArray.push(generateDQScore());

      // Coach message
      const coachMsg = sampleCoachMessages[turn] || `Coach response for turn ${turn + 1}`;
      conversationHistory.push({
        role: 'coach',
        content: coachMsg
      });
    }

    console.log(`✅ Generated ${conversationHistory.length} messages:`);
    console.log(`   - ${MAX_TURNS} user messages (with DQ scores)`);
    console.log(`   - ${MAX_TURNS} coach messages\n`);

    // Step 4: Convert to storage format
    console.log('Step 4: Converting to storage format...');
    const messages = convertConversationHistoryToMessages(
      conversationHistory,
      dqScoresArray,
      sessionStartTime.toISOString()
    );
    console.log(`✅ Converted ${messages.length} messages for storage\n`);

    // Step 5: Save complete research session (WITH TIMING)
    console.log('Step 5: Saving research session and messages...');
    console.log('────────────────────────────────────────────────────────────');
    const saveStartTime = Date.now();
    
    const result = await saveCompleteResearchSession(researchCode, sessionData, messages);
    
    const saveEndTime = Date.now();
    const saveDuration = saveEndTime - saveStartTime;
    
    console.log('────────────────────────────────────────────────────────────');
    console.log(`✅ Successfully saved in ${saveDuration}ms (${(saveDuration / 1000).toFixed(2)}s)`);
    console.log(`   Session ID: ${result.session.id}`);
    console.log(`   Research Code: ${result.researchCode}`);
    console.log(`   Messages Saved: ${result.messagesCount}`);
    console.log(`   Turns Used: ${result.session.turns_used}/${result.session.max_turns}`);
    console.log(`   Status: ${result.session.session_status}`);
    console.log(`   Duration: ${result.session.duration_seconds}s`);
    console.log(`   Avg time per message: ${(saveDuration / result.messagesCount).toFixed(2)}ms\n`);

    // Step 6: Verify data integrity
    console.log('Step 6: Verifying data integrity...');
    
    // Verify session
    const { data: verifySession } = await supabase
      .from('research_sessions')
      .select('*')
      .eq('id', result.session.id)
      .single();

    if (verifySession) {
      console.log('✅ Session verified in database');
      console.log(`   Research Code: ${verifySession.research_code}`);
      console.log(`   Turns: ${verifySession.turns_used}/${verifySession.max_turns}`);
      console.log(`   Status: ${verifySession.session_status}`);
      console.log(`   Duration: ${verifySession.duration_seconds}s`);
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
      console.log(`   Coach messages: ${verifyMessages.filter(m => m.message_type === 'jamie').length}`);
      console.log(`   Turn numbers: 1-${Math.max(...verifyMessages.map(m => m.turn_number))}`);
      
      // Verify turn number integrity
      let turnIntegrityPassed = true;
      for (let turn = 1; turn <= MAX_TURNS; turn++) {
        const turnMessages = verifyMessages.filter(m => m.turn_number === turn);
        if (turnMessages.length !== 2) {
          console.log(`   ⚠️  Turn ${turn} has ${turnMessages.length} messages (expected 2)`);
          turnIntegrityPassed = false;
        }
      }
      if (turnIntegrityPassed) {
        console.log('   ✅ All turns have exactly 2 messages (user + coach)');
      }
    }

    console.log('\n============================================================');
    console.log('✅ Full test completed successfully!');
    console.log('============================================================\n');

    console.log('📊 Performance Summary:');
    console.log(`   Total messages saved: ${result.messagesCount}`);
    console.log(`   Total save time: ${saveDuration}ms (${(saveDuration / 1000).toFixed(2)}s)`);
    console.log(`   Average per message: ${(saveDuration / result.messagesCount).toFixed(2)}ms`);
    console.log(`   Messages per second: ${((result.messagesCount / saveDuration) * 1000).toFixed(1)}`);
    console.log(`   Research Code: ${researchCode}`);
    console.log(`   Session ID: ${result.session.id}\n`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  runFullTest();
}

module.exports = { runFullTest };

