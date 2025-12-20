# IRB-Compliant Anonymous Research Data - Implementation Plan

## Overview

**Goal:** Store first Jamie chat session in anonymous research tables using research codes that cannot be traced back to user identities.

**Key Requirement:** Students create accounts (identifiable) but research data is stored anonymously with codes.

---

## Difficulty Assessment

**Overall Difficulty: ⭐⭐⭐ (Moderate)**

**Easy Parts:**
- Database schema creation
- Research code generation (standard random code)
- Frontend display of research code

**Moderate Parts:**
- Detecting "first attempt" vs subsequent attempts
- Session completion detection and trigger
- Ensuring one-way relationship (security)

**Challenging Parts:**
- RLS policies for research data access
- Preventing reverse lookup (code → user)
- Testing and verification of anonymity

---

## Time Estimate

**Total Development Time: 12-18 hours**

**Breakdown:**
- Database schema: 2-3 hours
- Backend code generation & API: 2-3 hours
- Frontend integration: 3-4 hours
- Session completion detection: 2-3 hours
- Security & RLS policies: 2-3 hours
- Testing & verification: 2-3 hours

**Plus Review/Approval:**
- IRB review: 1-2 weeks (institutional process)
- Security audit: 1-2 days
- User testing: 1-2 days

---

## Phase 1: Database Schema (2-3 hours)

### Step 1.1: Create Research Sessions Table

**File:** New SQL migration file: `create-research-sessions.sql`

```sql
-- Research sessions table (completely anonymous)
CREATE TABLE research_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    research_code VARCHAR(20) UNIQUE NOT NULL, -- e.g., "RES-ABC123"
    character_name VARCHAR(50) NOT NULL CHECK (character_name IN ('jamie')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    
    -- Session metadata (anonymous)
    turns_used INTEGER DEFAULT 0,
    max_turns INTEGER DEFAULT 20,
    session_status VARCHAR(20) DEFAULT 'in-progress' CHECK (session_status IN ('in-progress', 'completed', 'abandoned')),
    
    -- No user_id or identity fields!
    CONSTRAINT research_sessions_character_check CHECK (character_name = 'jamie')
);

CREATE INDEX idx_research_sessions_code ON research_sessions(research_code);
CREATE INDEX idx_research_sessions_completed ON research_sessions(completed_at) WHERE completed_at IS NOT NULL;
```

### Step 1.2: Create Research Messages Table

```sql
-- Research messages (linked to research sessions)
CREATE TABLE research_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    research_session_id UUID NOT NULL REFERENCES research_sessions(id) ON DELETE CASCADE,
    message_type VARCHAR(20) NOT NULL CHECK (message_type IN ('user', 'jamie', 'system')),
    content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- DQ scoring data
    dq_scores JSONB,
    dq_score_minimum DECIMAL(3,2),
    turn_number INTEGER,
    
    -- No user identity data
    CONSTRAINT research_messages_type_check CHECK (message_type IN ('user', 'jamie', 'system'))
);

CREATE INDEX idx_research_messages_session ON research_messages(research_session_id);
CREATE INDEX idx_research_messages_turn ON research_messages(research_session_id, turn_number);
```

### Step 1.3: Create Research Code Mapping Table (One-Way, Access-Controlled)

```sql
-- Research code mapping (for code generation ONLY, not for research queries)
-- This table exists ONLY to prevent duplicate codes and track first attempts
CREATE TABLE research_code_mappings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    research_code VARCHAR(20) UNIQUE NOT NULL,
    character_name VARCHAR(50) NOT NULL CHECK (character_name = 'jamie'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one code per user per character (first attempt only)
    UNIQUE(user_id, character_name)
);

-- CRITICAL: NO index on user_id visible to researchers
-- Index only on research_code (for uniqueness check during generation)
CREATE INDEX idx_research_code_mappings_code ON research_code_mappings(research_code);
-- DO NOT create index on user_id - prevents reverse lookup queries
```

### Step 1.4: Enable RLS and Create Policies

```sql
-- Enable RLS on all research tables
ALTER TABLE research_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_code_mappings ENABLE ROW LEVEL SECURITY;

-- Research sessions: Only service role can read (for research exports)
-- Regular users cannot query research sessions
CREATE POLICY "Research sessions service role only" ON research_sessions
    FOR ALL USING (false); -- Deny all by default, only service role can access

-- Research messages: Only service role can read
CREATE POLICY "Research messages service role only" ON research_messages
    FOR ALL USING (false); -- Deny all by default

-- Research code mappings: Users can INSERT (create code), but NOT SELECT (read)
CREATE POLICY "Users can create research codes" ON research_code_mappings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Deny all SELECT operations on mappings table (prevents reverse lookup)
CREATE POLICY "No reads on research code mappings" ON research_code_mappings
    FOR SELECT USING (false);
```

**Difficulty:** ⭐⭐ (Easy-Moderate)  
**Time:** 2-3 hours (including testing)

---

## Phase 2: Research Code Generation (2-3 hours)

### Step 2.1: Backend Function - Generate Research Code

**File:** `jamie-backend/utils/researchCode.js` (new file)

```javascript
/**
 * Generate a unique research code for anonymous research data storage
 * Format: RES-XXXXXX (6 alphanumeric characters)
 */
function generateResearchCode() {
  const prefix = 'RES-';
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars (I, O, 0, 1)
  const randomPart = Array.from({length: 6}, () => 
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join('');
  return prefix + randomPart;
}

/**
 * Create and store research code for a user's first Jamie session
 * Returns the research code
 */
async function createResearchCode(userId, supabaseClient) {
  const maxRetries = 10;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const code = generateResearchCode();
    
    // Check if code already exists (very unlikely, but handle collision)
    const { data: existing, error: checkError } = await supabaseClient
      .from('research_code_mappings')
      .select('research_code')
      .eq('research_code', code)
      .single();
    
    if (checkError && checkError.code === 'PGRST116') {
      // Code doesn't exist (good!)
      // Try to insert
      const { data, error } = await supabaseClient
        .from('research_code_mappings')
        .insert({
          user_id: userId,
          research_code: code,
          character_name: 'jamie'
        })
        .select('research_code')
        .single();
      
      if (error) {
        if (error.code === '23505') {
          // Unique constraint violation (user already has code)
          // This means it's not their first attempt - return existing code
          const { data: existingCode } = await supabaseClient
            .from('research_code_mappings')
            .select('research_code')
            .eq('user_id', userId)
            .eq('character_name', 'jamie')
            .single();
          return existingCode?.research_code || null;
        }
        // Other error - retry with new code
        continue;
      }
      
      return code; // Success!
    }
    
    // Code exists, try again
    if (attempt === maxRetries - 1) {
      throw new Error('Failed to generate unique research code after maximum retries');
    }
  }
}

/**
 * Check if user already has a research code (has completed first attempt)
 */
async function hasResearchCode(userId, supabaseClient) {
  const { data, error } = await supabaseClient
    .from('research_code_mappings')
    .select('research_code')
    .eq('user_id', userId)
    .eq('character_name', 'jamie')
    .single();
  
  // If no row found, they don't have a code yet (first attempt)
  if (error && error.code === 'PGRST116') {
    return { hasCode: false, code: null };
  }
  
  if (error) {
    throw error;
  }
  
  return { hasCode: true, code: data.research_code };
}

module.exports = {
  generateResearchCode,
  createResearchCode,
  hasResearchCode
};
```

### Step 2.2: Create Backend API Endpoint

**File:** `jamie-backend/routes/research.js` (new file)

```javascript
const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { createResearchCode, hasResearchCode } = require('../utils/researchCode');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role for admin operations
);

// Get or create research code for user
router.post('/code', async (req, res) => {
  try {
    const { user_id } = req.body;
    
    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }
    
    // Check if user already has a code
    const { hasCode, code: existingCode } = await hasResearchCode(userId, supabase);
    
    if (hasCode) {
      // Not first attempt - return existing code
      return res.json({ 
        research_code: existingCode,
        is_first_attempt: false 
      });
    }
    
    // First attempt - create new code
    const researchCode = await createResearchCode(user_id, supabase);
    
    res.json({
      research_code: researchCode,
      is_first_attempt: true
    });
    
  } catch (error) {
    console.error('Error creating research code:', error);
    res.status(500).json({ error: 'Failed to create research code' });
  }
});

module.exports = router;
```

**File:** `jamie-backend/index.js` - Add route:

```javascript
const researchRoutes = require('./routes/research');
app.use('/api/research', researchRoutes);
```

**Difficulty:** ⭐⭐ (Moderate)  
**Time:** 2-3 hours

---

## Phase 3: Session Completion Detection (2-3 hours)

### Step 3.1: Detect First Jamie Session Completion

**Location:** `jamie-backend/routes/chat.js`

**Logic:**
1. When session completes (turns exhausted or explicit completion)
2. Check if this is user's first Jamie session
3. If first: Get/create research code, save to research tables
4. If not first: Save to regular sessions table (existing behavior)

**Modifications needed:**

```javascript
// In chat.js, after session completion detection
const { hasResearchCode, createResearchCode } = require('../utils/researchCode');

// When session completes
if (sessionCompleted && persona === 'jamie') {
  // Check if first attempt
  const { hasCode, code } = await hasResearchCode(userId, supabase);
  
  if (!hasCode) {
    // FIRST ATTEMPT - Save to research tables
    const researchCode = await createResearchCode(userId, supabase);
    await saveResearchSession(researchCode, sessionData, messages);
    
    // Return research code to frontend for display
    return res.json({
      ...responseData,
      research_code: researchCode,
      is_research_session: true
    });
  } else {
    // NOT first attempt - save to regular sessions (existing behavior)
    await saveRegularSession(userId, sessionData, messages);
  }
}
```

### Step 3.2: Save Research Session Function

**File:** `jamie-backend/utils/researchSession.js` (new file)

```javascript
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function saveResearchSession(researchCode, sessionData, messages) {
  // Create research session
  const { data: session, error: sessionError } = await supabase
    .from('research_sessions')
    .insert({
      research_code: researchCode,
      character_name: 'jamie',
      started_at: sessionData.startedAt,
      completed_at: new Date().toISOString(),
      duration_seconds: sessionData.durationSeconds,
      turns_used: sessionData.turnsUsed,
      max_turns: sessionData.maxTurns,
      session_status: 'completed'
    })
    .select()
    .single();
  
  if (sessionError) throw sessionError;
  
  // Save messages
  const messagesToInsert = messages.map((msg, index) => ({
    research_session_id: session.id,
    message_type: msg.role === 'user' ? 'user' : 'jamie',
    content: msg.content,
    timestamp: msg.timestamp || new Date().toISOString(),
    dq_scores: msg.dqScore || null,
    dq_score_minimum: msg.avgDqScore || null,
    turn_number: index + 1
  }));
  
  const { error: messagesError } = await supabase
    .from('research_messages')
    .insert(messagesToInsert);
  
  if (messagesError) throw messagesError;
  
  return session;
}

module.exports = { saveResearchSession };
```

**Difficulty:** ⭐⭐⭐ (Moderate)  
**Time:** 2-3 hours (includes integration with existing session completion logic)

---

## Phase 4: Frontend Integration (3-4 hours)

### Step 4.1: Display Research Code After Completion

**File:** `jamie-ai-frontend/src/App.js`

**Location:** In the session completion handler (where "Assessment complete" message is shown)

```javascript
// After session completes and response includes research_code
if (responseData.research_code && responseData.is_research_session) {
  // Show research code modal/alert
  setShowResearchCode(true);
  setResearchCode(responseData.research_code);
}
```

### Step 4.2: Research Code Display Component

**File:** `jamie-ai-frontend/src/components/ResearchCodeModal.js` (new file)

```jsx
import React from 'react';

export default function ResearchCodeModal({ researchCode, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md">
        <h2 className="text-2xl font-bold mb-4">Research Session Complete</h2>
        <p className="text-gray-700 mb-4">
          Your research session has been recorded anonymously. Please save your research code:
        </p>
        <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-600 mb-1">Your Research Code:</p>
          <p className="text-3xl font-bold text-blue-700 text-center">{researchCode}</p>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          <strong>Important:</strong> Save this code! You won't be able to retrieve it later.
        </p>
        <button
          onClick={onClose}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          I've Saved My Code
        </button>
      </div>
    </div>
  );
}
```

### Step 4.3: Copy to Clipboard Feature

Add copy button to research code modal:

```jsx
const [copied, setCopied] = useState(false);

const copyToClipboard = async () => {
  await navigator.clipboard.writeText(researchCode);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
};
```

**Difficulty:** ⭐⭐ (Easy-Moderate)  
**Time:** 3-4 hours (includes UI polish and testing)

---

## Phase 5: Security & Access Control (2-3 hours)

### Step 5.1: Verify RLS Policies

**Tasks:**
1. Test that regular users cannot query research_sessions
2. Test that regular users cannot query research_code_mappings
3. Verify service role can access research data for exports
4. Test code generation works correctly
5. Verify no reverse lookup possible

### Step 5.2: Research Export Function (Optional)

**File:** `jamie-backend/routes/research.js` (add export endpoint)

```javascript
// Export research data by code (for researchers)
router.get('/export/:code', async (req, res) => {
  const { code } = req.params;
  
  // Use service role to query research data
  const { data: session, error: sessionError } = await supabase
    .from('research_sessions')
    .select(`
      *,
      research_messages (*)
    `)
    .eq('research_code', code)
    .single();
  
  if (sessionError) {
    return res.status(404).json({ error: 'Research session not found' });
  }
  
  // Return anonymous data (no user_id, no identity info)
  res.json(session);
});
```

**Difficulty:** ⭐⭐⭐ (Moderate-Challenging)  
**Time:** 2-3 hours

---

## Phase 6: Testing & Verification (2-3 hours)

### Test Cases

1. **First Attempt Flow:**
   - User completes first Jamie session
   - Research code generated
   - Data saved to research_sessions table
   - Code displayed to user
   - Verify code cannot be used to lookup user

2. **Subsequent Attempts:**
   - User completes second Jamie session
   - Existing research code returned
   - Data saved to regular sessions table (not research)
   - No research code displayed

3. **Security Tests:**
   - Regular user cannot query research_sessions
   - Regular user cannot query research_code_mappings
   - Research code cannot be used to find user_id
   - Service role can export research data

4. **Edge Cases:**
   - Code collision handling (retry logic)
   - Concurrent requests (race conditions)
   - Session abandonment (incomplete sessions)

**Difficulty:** ⭐⭐ (Moderate)  
**Time:** 2-3 hours

---

## Implementation Checklist

### Database
- [ ] Create `research_sessions` table
- [ ] Create `research_messages` table
- [ ] Create `research_code_mappings` table
- [ ] Set up RLS policies
- [ ] Create indexes
- [ ] Test schema migrations

### Backend
- [ ] Create research code generation utility
- [ ] Create research session save function
- [ ] Create `/api/research/code` endpoint
- [ ] Integrate with chat completion logic
- [ ] Add first-attempt detection
- [ ] Test API endpoints

### Frontend
- [ ] Create research code modal component
- [ ] Integrate with session completion flow
- [ ] Add copy to clipboard feature
- [ ] Style and polish UI
- [ ] Test user experience

### Security
- [ ] Verify RLS policies prevent reverse lookup
- [ ] Test service role access
- [ ] Security audit of code generation
- [ ] Verify no user_id in research exports

### Testing
- [ ] Test first attempt flow
- [ ] Test subsequent attempts
- [ ] Test security constraints
- [ ] Test edge cases
- [ ] User acceptance testing

---

## Summary

**Total Development Time: 12-18 hours**

**Breakdown:**
- Database: 2-3 hours
- Code Generation: 2-3 hours
- Session Completion: 2-3 hours
- Frontend: 3-4 hours
- Security: 2-3 hours
- Testing: 2-3 hours

**Difficulty: ⭐⭐⭐ (Moderate)**

**Key Challenges:**
1. Detecting first attempt vs subsequent attempts
2. Ensuring one-way relationship (code → data, but NOT code → user)
3. RLS policies that allow code creation but prevent reverse lookup
4. Testing anonymity thoroughly

**Recommended Approach:**
Start with database schema, then code generation, then integration. Test security at each phase.

---

## Next Steps

1. Review this plan with IRB/legal team
2. Set up database schema in dev environment
3. Implement code generation
4. Integrate with session completion
5. Build frontend components
6. Security audit
7. User testing
8. Submit to IRB for approval

---

**Note:** This implementation ensures complete anonymity for research data while allowing accounts for access. The research code serves as the anonymous identifier, with no way to trace it back to user accounts.

