-- ============================================================================
-- Test Data Insert Script for Research Tables
-- Purpose: Verify that you can insert test data (requires service role)
-- WARNING: This uses service role - only run in dev/staging, NOT production!
-- ============================================================================

-- This script tests inserting data into research tables
-- You MUST use service role key to run this (regular users blocked by RLS)

-- ============================================================================
-- Step 1: Create a test research code mapping
-- ============================================================================
-- First, get a real user_id from your users table
-- Replace this with your actual user_id or use the query below to get one

DO $$
DECLARE
    test_user_id UUID;
    test_code VARCHAR(20) := 'RES-TEST01';
BEGIN
    -- Get first user (or use a specific one)
    SELECT id INTO test_user_id FROM users WHERE role = 'student' LIMIT 1;
    
    IF test_user_id IS NULL THEN
        RAISE EXCEPTION 'No student users found in database';
    END IF;
    
    -- Insert test research code
    INSERT INTO research_code_mappings (user_id, research_code, character_name)
    VALUES (test_user_id, test_code, 'jamie')
    ON CONFLICT (user_id, character_name) DO NOTHING;
    
    RAISE NOTICE '✅ Created test research code: % for user: %', test_code, test_user_id;
    
    -- ============================================================================
    -- Step 2: Create a test research session
    -- ============================================================================
    INSERT INTO research_sessions (
        research_code,
        character_name,
        started_at,
        completed_at,
        duration_seconds,
        turns_used,
        max_turns,
        session_status
    ) VALUES (
        test_code,
        'jamie',
        NOW() - INTERVAL '15 minutes',
        NOW(),
        900, -- 15 minutes
        12,
        20,
        'completed'
    )
    ON CONFLICT (research_code) DO NOTHING
    RETURNING id INTO test_user_id; -- Reusing variable for session_id
    
    RAISE NOTICE '✅ Created test research session with code: %', test_code;
    
    -- ============================================================================
    -- Step 3: Create test messages
    -- ============================================================================
    DECLARE
        session_id UUID;
    BEGIN
        SELECT id INTO session_id FROM research_sessions WHERE research_code = test_code;
        
        IF session_id IS NOT NULL THEN
            -- Insert test messages
            INSERT INTO research_messages (
                research_session_id,
                message_type,
                content,
                timestamp,
                turn_number,
                dq_scores,
                dq_score_minimum
            ) VALUES
            -- User message 1
            (
                session_id,
                'user',
                'I understand you''re feeling overwhelmed. Can you tell me more about what specifically is making you feel stuck?',
                NOW() - INTERVAL '14 minutes',
                1,
                '{"framing": 0.6, "alternatives": 0.2, "information": 0.5, "values": 0.3, "reasoning": 0.4, "commitment": 0.2}'::jsonb,
                0.2
            ),
            -- Jamie response 1
            (
                session_id,
                'jamie',
                'Um, yeah, I guess I could really use some help right now. It''s just—I''m feeling so, like, lost and, um, overwhelmed about everything.',
                NOW() - INTERVAL '13 minutes',
                1,
                NULL,
                NULL
            ),
            -- User message 2
            (
                session_id,
                'user',
                'That sounds really challenging. What specifically feels most overwhelming to you right now?',
                NOW() - INTERVAL '12 minutes',
                2,
                '{"framing": 0.7, "alternatives": 0.3, "information": 0.6, "values": 0.4, "reasoning": 0.5, "commitment": 0.3}'::jsonb,
                0.3
            ),
            -- Jamie response 2
            (
                session_id,
                'jamie',
                'I think it''s just... I don''t know, like, I want to do design but I also don''t want to disappoint my parents, you know?',
                NOW() - INTERVAL '11 minutes',
                2,
                NULL,
                NULL
            );
            
            RAISE NOTICE '✅ Created test messages for session';
        END IF;
    END;
    
    -- ============================================================================
    -- Step 4: Verify data was inserted
    -- ============================================================================
    RAISE NOTICE '';
    RAISE NOTICE '=== VERIFICATION ===';
    RAISE NOTICE 'Research code: %', test_code;
    RAISE NOTICE 'Session exists: %', (SELECT COUNT(*) > 0 FROM research_sessions WHERE research_code = test_code);
    RAISE NOTICE 'Messages count: %', (SELECT COUNT(*) FROM research_messages rm 
                                        JOIN research_sessions rs ON rm.research_session_id = rs.id 
                                        WHERE rs.research_code = test_code);
    
    -- ============================================================================
    -- Step 5: Test query (should work with service role)
    -- ============================================================================
    RAISE NOTICE '';
    RAISE NOTICE '=== TEST QUERY ===';
    RAISE NOTICE 'Querying research session by code (this should work with service role):';
    
    -- This query should work and return data
    PERFORM 1 FROM research_sessions WHERE research_code = test_code;
    
    RAISE NOTICE '✅ SUCCESS: Can query research_sessions by research_code';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ ERROR: %', SQLERRM;
    RAISE NOTICE 'This might be expected if you are NOT using service role key';
END $$;

-- ============================================================================
-- CLEANUP: Remove test data (optional - uncomment to clean up)
-- ============================================================================
-- DELETE FROM research_messages 
-- WHERE research_session_id IN (SELECT id FROM research_sessions WHERE research_code = 'RES-TEST01');
-- 
-- DELETE FROM research_sessions WHERE research_code = 'RES-TEST01';
-- 
-- DELETE FROM research_code_mappings WHERE research_code = 'RES-TEST01';

