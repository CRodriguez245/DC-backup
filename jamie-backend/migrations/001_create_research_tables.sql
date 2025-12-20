-- ============================================================================
-- IRB-Compliant Research Data Tables Migration
-- Purpose: Create anonymous research data storage for first Jamie sessions
-- Date: 2025-12-19
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Table: research_sessions
-- Purpose: Store anonymous research sessions (first Jamie attempt only)
-- Security: No user_id or identity fields - completely anonymous
-- ============================================================================
CREATE TABLE research_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Research code is the ONLY identifier (anonymous)
    research_code VARCHAR(20) UNIQUE NOT NULL, -- e.g., "RES-ABC123"
    
    -- Session metadata (all anonymous)
    character_name VARCHAR(50) NOT NULL CHECK (character_name = 'jamie'),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    
    -- Session tracking (anonymous)
    turns_used INTEGER DEFAULT 0,
    max_turns INTEGER DEFAULT 20,
    session_status VARCHAR(20) DEFAULT 'in-progress' 
        CHECK (session_status IN ('in-progress', 'completed', 'abandoned')),
    
    -- Constraint: Only Jamie sessions for research
    CONSTRAINT research_sessions_character_check CHECK (character_name = 'jamie'),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for research_sessions
CREATE INDEX idx_research_sessions_code ON research_sessions(research_code);
CREATE INDEX idx_research_sessions_completed ON research_sessions(completed_at) 
    WHERE completed_at IS NOT NULL;
CREATE INDEX idx_research_sessions_status ON research_sessions(session_status);
CREATE INDEX idx_research_sessions_started ON research_sessions(started_at);

-- ============================================================================
-- Table: research_messages
-- Purpose: Store chat messages for research sessions (anonymous)
-- Security: Linked only to research_code via research_session_id
-- ============================================================================
CREATE TABLE research_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Link to research session (NOT user)
    research_session_id UUID NOT NULL 
        REFERENCES research_sessions(id) ON DELETE CASCADE,
    
    -- Message data (anonymous)
    message_type VARCHAR(20) NOT NULL 
        CHECK (message_type IN ('user', 'jamie', 'system')),
    content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    turn_number INTEGER,
    
    -- DQ scoring data (for research analysis)
    dq_scores JSONB, -- Stores: framing, alternatives, information, values, reasoning, commitment
    dq_score_minimum DECIMAL(3,2), -- Minimum of all 6 DQ dimensions
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for research_messages
CREATE INDEX idx_research_messages_session ON research_messages(research_session_id);
CREATE INDEX idx_research_messages_turn ON research_messages(research_session_id, turn_number);
CREATE INDEX idx_research_messages_type ON research_messages(message_type);
CREATE INDEX idx_research_messages_timestamp ON research_messages(timestamp);

-- ============================================================================
-- Table: research_code_mappings
-- Purpose: Track code generation (for preventing duplicates and first-attempt detection)
-- Security: CRITICAL - Users can INSERT but NOT SELECT (prevents reverse lookup)
-- Note: This table is for code generation ONLY, not for research queries
-- ============================================================================
CREATE TABLE research_code_mappings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Link to user (for code generation only)
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Research code (unique identifier)
    research_code VARCHAR(20) UNIQUE NOT NULL,
    
    -- Character name (always 'jamie' for research)
    character_name VARCHAR(50) NOT NULL CHECK (character_name = 'jamie'),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint: One code per user per character (first attempt only)
    UNIQUE(user_id, character_name)
);

-- CRITICAL INDEX: Only index on research_code (for uniqueness checks)
-- DO NOT create index on user_id - this prevents reverse lookup queries
CREATE INDEX idx_research_code_mappings_code ON research_code_mappings(research_code);

-- ============================================================================
-- Row Level Security (RLS) Policies
-- Purpose: Ensure complete anonymity - prevent reverse lookup
-- ============================================================================

-- Enable RLS on all research tables
ALTER TABLE research_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_code_mappings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS Policy: research_sessions
-- Rule: Service role only (regular users cannot query research sessions)
-- ============================================================================
CREATE POLICY "Research sessions service role only" 
    ON research_sessions
    FOR ALL 
    USING (false); -- Deny all by default - only service role can bypass RLS

-- ============================================================================
-- RLS Policy: research_messages
-- Rule: Service role only (regular users cannot query research messages)
-- ============================================================================
CREATE POLICY "Research messages service role only" 
    ON research_messages
    FOR ALL 
    USING (false); -- Deny all by default - only service role can bypass RLS

-- ============================================================================
-- RLS Policy: research_code_mappings
-- Rule: Users can INSERT (create code) but NOT SELECT (prevents reverse lookup)
-- ============================================================================

-- Allow users to create their research code (INSERT only)
CREATE POLICY "Users can create research codes" 
    ON research_code_mappings
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- CRITICAL: Deny all SELECT operations (prevents code → user lookup)
CREATE POLICY "No reads on research code mappings" 
    ON research_code_mappings
    FOR SELECT 
    USING (false); -- Block all SELECT queries - prevents reverse lookup

-- Deny UPDATE and DELETE (codes should not be modified)
CREATE POLICY "No updates on research code mappings" 
    ON research_code_mappings
    FOR UPDATE 
    USING (false);

CREATE POLICY "No deletes on research code mappings" 
    ON research_code_mappings
    FOR DELETE 
    USING (false);

-- ============================================================================
-- Helper Function: Update updated_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION update_research_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_research_sessions_timestamp
    BEFORE UPDATE ON research_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_research_sessions_updated_at();

-- ============================================================================
-- Comments for Documentation
-- ============================================================================
COMMENT ON TABLE research_sessions IS 
    'Anonymous research sessions for IRB-compliant data collection. Contains NO user identity information.';

COMMENT ON TABLE research_messages IS 
    'Chat messages for research sessions. Linked to research_code only, not user_id.';

COMMENT ON TABLE research_code_mappings IS 
    'Code generation tracking table. Users can INSERT but NOT SELECT to prevent reverse lookup.';

COMMENT ON COLUMN research_sessions.research_code IS 
    'Unique anonymous identifier (e.g., RES-ABC123). This is the ONLY link to research data.';

COMMENT ON COLUMN research_code_mappings.user_id IS 
    'Used ONLY for code generation and duplicate prevention. NOT accessible via SELECT (RLS blocked).';

-- ============================================================================
-- Verification Queries (Run these after migration to verify)
-- ============================================================================

-- Verify tables created
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' AND table_name LIKE 'research_%';

-- Verify RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables 
-- WHERE schemaname = 'public' AND tablename LIKE 'research_%';

-- Verify indexes created
-- SELECT indexname, tablename FROM pg_indexes 
-- WHERE schemaname = 'public' AND tablename LIKE 'research_%';

-- ============================================================================
-- Migration Complete
-- Next Steps:
-- 1. Test in dev/staging environment
-- 2. Verify RLS policies work correctly
-- 3. Test code generation
-- 4. Proceed to STEP 2: Research Code Generation
-- ============================================================================

