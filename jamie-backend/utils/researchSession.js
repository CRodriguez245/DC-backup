/**
 * Research Session Storage Utility
 * 
 * Purpose: Save anonymous research sessions and messages to research tables
 * 
 * Features:
 * - Saves research sessions with research codes (not user_id)
 * - Saves all chat messages with DQ scores
 * - Maintains data integrity
 * - No user identity information stored
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client with service role key (for admin operations)
// Use lazy initialization to avoid errors if env vars aren't set during module load
let supabase = null;

function getSupabaseClient() {
  if (!supabase) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase environment variables not configured. SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
    }
    
    supabase = createClient(supabaseUrl, supabaseKey);
  }
  return supabase;
}

/**
 * Calculate duration in seconds between two timestamps
 * 
 * @param {string|Date} startTime - Start timestamp (ISO string or Date)
 * @param {string|Date} endTime - End timestamp (ISO string or Date)
 * @returns {number} Duration in seconds
 */
function calculateDuration(startTime, endTime) {
  const start = new Date(startTime);
  const end = new Date(endTime);
  return Math.floor((end - start) / 1000); // Convert to seconds
}

/**
 * Save a research session to the database
 * 
 * @param {string} researchCode - Research code (e.g., "RES-ABC123")
 * @param {Object} sessionData - Session data object
 * @param {string} sessionData.startedAt - Session start time (ISO string)
 * @param {string} sessionData.completedAt - Session completion time (ISO string)
 * @param {number} sessionData.turnsUsed - Number of turns used
 * @param {number} sessionData.maxTurns - Maximum turns allowed
 * @param {string} sessionData.sessionStatus - Session status ('in-progress', 'completed', 'abandoned')
 * @returns {Promise<Object>} Created session object
 */
async function saveResearchSession(researchCode, sessionData) {
  try {
    const {
      startedAt,
      completedAt,
      turnsUsed,
      maxTurns = 20,
      sessionStatus = 'completed'
    } = sessionData;

    // Calculate duration if both times provided
    const durationSeconds = (startedAt && completedAt)
      ? calculateDuration(startedAt, completedAt)
      : null;

    // Insert research session
    const { data: session, error: sessionError } = await getSupabaseClient()
      .from('research_sessions')
      .insert({
        research_code: researchCode,
        character_name: 'jamie',
        started_at: startedAt || new Date().toISOString(),
        completed_at: completedAt || null,
        duration_seconds: durationSeconds,
        turns_used: turnsUsed || 0,
        max_turns: maxTurns,
        session_status: sessionStatus
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Error saving research session:', sessionError);
      throw new Error(`Failed to save research session: ${sessionError.message}`);
    }

    console.log(`✅ Saved research session: ${session.id} for code: ${researchCode}`);
    return session;

  } catch (error) {
    console.error('Exception saving research session:', error);
    throw error;
  }
}

/**
 * Save research messages to the database
 * 
 * @param {string} researchSessionId - Research session UUID (from research_sessions table)
 * @param {Array<Object>} messages - Array of message objects
 * @param {string} messages[].role - Message role ('user' or 'coach')
 * @param {string} messages[].content - Message content/text
 * @param {string} messages[].timestamp - Message timestamp (ISO string)
 * @param {Object} messages[].dqScore - DQ score object (optional, only for user messages)
 * @param {number} messages[].dqScoreMin - Minimum DQ score (optional)
 * @returns {Promise<Array<Object>>} Created messages array
 */
async function saveResearchMessages(researchSessionId, messages) {
  try {
    if (!messages || messages.length === 0) {
      console.log('⚠️  No messages to save');
      return [];
    }

    // Convert messages to database format
    const messagesToInsert = messages.map((msg, index) => {
      // Calculate turn number: each turn consists of user message + jamie response
      // Turn 1: index 0 (user), index 1 (jamie)
      // Turn 2: index 2 (user), index 3 (jamie)
      // etc.
      const turnNumber = Math.floor(index / 2) + 1;
      
      const messageType = msg.role === 'user' ? 'user' : 
                         msg.role === 'coach' ? 'jamie' : 'system';

      // DQ scores only exist for user messages
      const dqScores = (msg.role === 'user' && msg.dqScore) ? msg.dqScore : null;
      
      // Calculate minimum DQ score (only for user messages)
      let dqScoreMinimum = null;
      if (dqScores && typeof dqScores === 'object') {
        const scores = Object.values(dqScores).filter(
          v => typeof v === 'number' && !isNaN(v) && isFinite(v) && v >= 0 && v <= 1
        );
        dqScoreMinimum = scores.length > 0 ? Math.min(...scores) : null;
      }

      return {
        research_session_id: researchSessionId,
        message_type: messageType,
        content: msg.content || '',
        timestamp: msg.timestamp || new Date().toISOString(),
        turn_number: turnNumber, // Same turn number for user and jamie messages in a turn
        dq_scores: dqScores,
        dq_score_minimum: dqScoreMinimum
      };
    });

    // Insert all messages
    const { data: insertedMessages, error: messagesError } = await getSupabaseClient()
      .from('research_messages')
      .insert(messagesToInsert)
      .select();

    if (messagesError) {
      console.error('Error saving research messages:', messagesError);
      throw new Error(`Failed to save research messages: ${messagesError.message}`);
    }

    console.log(`✅ Saved ${insertedMessages.length} messages for session: ${researchSessionId}`);
    return insertedMessages;

  } catch (error) {
    console.error('Exception saving research messages:', error);
    throw error;
  }
}

/**
 * Save complete research session with messages
 * This is the main function to use - it saves both session and messages
 * 
 * @param {string} researchCode - Research code (e.g., "RES-ABC123")
 * @param {Object} sessionData - Session data
 * @param {string} sessionData.startedAt - Session start time
 * @param {string} sessionData.completedAt - Session completion time
 * @param {number} sessionData.turnsUsed - Number of turns used
 * @param {number} sessionData.maxTurns - Maximum turns allowed
 * @param {string} sessionData.sessionStatus - Session status
 * @param {Array<Object>} messages - Array of message objects
 * @returns {Promise<Object>} Created session with message count
 */
async function saveCompleteResearchSession(researchCode, sessionData, messages) {
  try {
    // Step 1: Save research session
    const session = await saveResearchSession(researchCode, sessionData);

    // Step 2: Save messages
    let savedMessages = [];
    if (messages && messages.length > 0) {
      savedMessages = await saveResearchMessages(session.id, messages);
    }

    return {
      session,
      messagesCount: savedMessages.length,
      researchCode
    };

  } catch (error) {
    console.error('Error saving complete research session:', error);
    throw error;
  }
}

/**
 * Convert conversation history format to messages array
 * Helper function to convert from sessionState format to storage format
 * 
 * @param {Array<Object>} conversationHistory - Conversation history from sessionState
 * @param {Array<Object>} dqScoresArray - Array of DQ scores (one per user message)
 * @param {string} sessionStartTime - Session start time (ISO string)
 * @returns {Array<Object>} Messages array in storage format
 */
function convertConversationHistoryToMessages(conversationHistory, dqScoresArray = [], sessionStartTime = null) {
  if (!conversationHistory || conversationHistory.length === 0) {
    return [];
  }

  const baseTime = sessionStartTime ? new Date(sessionStartTime) : new Date();
  const messages = [];

  conversationHistory.forEach((msg, index) => {
    const messageTime = new Date(baseTime.getTime() + (index * 1000)); // 1 second between messages

    const messageObj = {
      role: msg.role, // 'user' or 'coach'
      content: msg.content || '',
      timestamp: messageTime.toISOString()
    };

    // Add DQ score if this is a user message and we have scores
    if (msg.role === 'user' && dqScoresArray && dqScoresArray.length > 0) {
      // Match DQ score to message (assuming scores array aligns with user messages)
      const userMessageIndex = conversationHistory
        .slice(0, index + 1)
        .filter(m => m.role === 'user').length - 1;
      
      if (dqScoresArray[userMessageIndex]) {
        messageObj.dqScore = dqScoresArray[userMessageIndex];
        
        // Calculate minimum if it's an object with numeric values
        if (typeof messageObj.dqScore === 'object') {
          const scores = Object.values(messageObj.dqScore).filter(
            v => typeof v === 'number' && !isNaN(v) && isFinite(v) && v >= 0 && v <= 1
          );
          messageObj.dqScoreMin = scores.length > 0 ? Math.min(...scores) : null;
        }
      }
    }

    messages.push(messageObj);
  });

  return messages;
}

module.exports = {
  saveResearchSession,
  saveResearchMessages,
  saveCompleteResearchSession,
  convertConversationHistoryToMessages,
  calculateDuration
};

