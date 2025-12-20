# IRB Compliance Implementation Analysis

## Current State

### Database Schema
- ✅ `users` table has `research_id` field (exists but not used)
- ❌ `sessions` table links to `student_id` (UUID) - **directly identifiable**
- ❌ `messages` table links to `session_id` → which links to `student_id` - **identifiable**
- ❌ `dq_analytics` table links to `student_id` - **identifiable**

### Current Flow
- Chat sessions are stored in Supabase with `student_id` (user UUID)
- Sessions can be directly traced back to user identity via `users` table
- No anonymization currently implemented

## Requirements for IRB Compliance

### What Needs to Happen
1. **Generate Research Code**: When student completes Jamie session, generate unique code
2. **Store Anonymously**: Save session with research code instead of `student_id`
3. **Present Code to Student**: Student receives code (e.g., "RES-ABC123")
4. **No Reverse Lookup**: Cannot look up research code → user identity
5. **Research Access**: Researchers can query by research code only

## Implementation Plan

### Phase 1: Database Schema Changes (2-3 hours)

**1.1 Create Research Codes Table**
```sql
CREATE TABLE research_codes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    research_code VARCHAR(20) UNIQUE NOT NULL, -- e.g., "RES-ABC123"
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    character_name VARCHAR(50) NOT NULL, -- 'jamie'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, character_name) -- One code per user per character
);

CREATE INDEX idx_research_codes_code ON research_codes(research_code);
-- NO index on user_id - prevents reverse lookup!
```

**1.2 Modify Sessions Table**
```sql
ALTER TABLE sessions 
  ADD COLUMN research_code VARCHAR(20),
  ALTER COLUMN student_id DROP NOT NULL; -- Make nullable for research sessions

-- Add check: either student_id OR research_code (not both)
ALTER TABLE sessions 
  ADD CONSTRAINT sessions_identity_check 
  CHECK (
    (student_id IS NOT NULL AND research_code IS NULL) OR 
    (student_id IS NULL AND research_code IS NOT NULL)
  );
```

**1.3 Modify Messages/DQ Analytics**
- Messages: No change needed (links via session_id)
- dq_analytics: Remove `student_id` column (use session_id → research_code)

### Phase 2: Research Code Generation (1-2 hours)

**2.1 Backend Function**
```javascript
// Generate unique research code
function generateResearchCode() {
  const prefix = 'RES-';
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars
  const code = Array.from({length: 6}, () => 
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join('');
  return prefix + code;
}

// Store research code (one-way: user_id → code, but NOT code → user_id)
async function createResearchCode(userId, characterName) {
  const code = generateResearchCode();
  // Insert into research_codes table
  // Return code to user
}
```

**2.2 Frontend Display**
- After Jamie session completes, generate and display code
- Show: "Your research code: RES-ABC123 - Save this code!"

### Phase 3: Session Storage Changes (3-4 hours)

**3.1 Backend API Changes**
- Modify `/chat` endpoint to accept `research_code` instead of `user_id` for research sessions
- Store session with `research_code` when provided
- Update session creation logic

**3.2 Frontend Changes**
- After session completes:
  1. Generate research code (backend call)
  2. Save session with research code (not user_id)
  3. Display code to user
  4. Clear code from client (don't store in localStorage/user profile)

**3.3 Supabase Helper Functions**
```javascript
// Save research session
createResearchSession: async (researchCode, character) => {
  // Insert into sessions with research_code (no student_id)
}

// Get research session (for researchers)
getResearchSession: async (researchCode) => {
  // Query sessions by research_code only
  // No user_id or identity info returned
}
```

### Phase 4: Security & Access Control (2-3 hours)

**4.1 RLS Policies**
```sql
-- Research codes: Users can only create, never read
CREATE POLICY "Users can create their research codes" 
  ON research_codes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Sessions with research_code: No user access
-- Only accessible via service role (for researchers)

-- Sessions with student_id: Normal user access (for non-research)
```

**4.2 API Security**
- Research sessions endpoint requires service role key
- Regular users cannot query research codes
- No endpoints that allow: research_code → user_id lookup

### Phase 5: Research Export (1-2 hours)

**5.1 Export Function**
- Query sessions by research_code
- Export all messages, DQ scores, analytics
- No user identity information included
- Export format: CSV/JSON with research codes only

## Complexity Assessment

### Difficulty: **Moderate** ⭐⭐⭐

**Easy Parts:**
- Database schema already has `research_id` field (just needs implementation)
- Code generation is straightforward
- Frontend display is simple

**Moderate Parts:**
- Database migrations (requires careful planning)
- Modifying session storage logic (affects multiple components)
- Ensuring one-way relationship (code → session, but NOT code → user)

**Challenging Parts:**
- RLS policies for research data (needs careful security review)
- Ensuring no reverse lookup possible
- Testing anonymization thoroughly

## Time Estimate

### Total: **10-15 hours** of development

**Breakdown:**
- Database schema changes: 2-3 hours
- Code generation & storage: 1-2 hours  
- Session storage modifications: 3-4 hours
- Security & RLS policies: 2-3 hours
- Testing & verification: 2-3 hours

### Plus Review Time
- IRB review of implementation: 1-2 weeks (institutional process)
- Security audit: 1-2 days
- User testing: 1-2 days

## Risks & Considerations

### 1. Data Integrity
- **Risk**: Mixing research and non-research sessions
- **Mitigation**: Clear separation, validation checks

### 2. Code Uniqueness
- **Risk**: Collision of research codes
- **Mitigation**: Database uniqueness constraint, retry logic

### 3. User Experience
- **Risk**: Users lose their research code
- **Mitigation**: Clear display, instructions to save

### 4. Research Access
- **Risk**: Researchers need access without exposing user data
- **Mitigation**: Service role API, proper access controls

## Alternative Approach (Simpler)

### Option: Separate Research Sessions Table
Instead of modifying existing tables, create separate table:

```sql
CREATE TABLE research_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    research_code VARCHAR(20) UNIQUE NOT NULL,
    character_name VARCHAR(50) NOT NULL,
    -- Copy all session fields (no user_id references)
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    -- ... other fields
);

CREATE TABLE research_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    research_session_id UUID NOT NULL REFERENCES research_sessions(id),
    -- ... message fields
);
```

**Pros:**
- Cleaner separation
- No impact on existing functionality
- Easier to maintain

**Cons:**
- Data duplication
- Two codebases to maintain

**Time: 8-12 hours** (slightly simpler)

## Recommendation

**Go with the separate tables approach** - it's cleaner, safer, and easier to verify IRB compliance.

## Next Steps

1. ✅ Review this analysis with IRB/legal team
2. ⏭️ Finalize database schema design
3. ⏭️ Implement code generation
4. ⏭️ Modify session storage for research sessions
5. ⏭️ Set up security/RLS policies
6. ⏭️ Test thoroughly
7. ⏭️ Submit to IRB for approval

---

**Bottom Line**: Moderate complexity, 10-15 hours development time, requires careful security review and IRB approval process.

