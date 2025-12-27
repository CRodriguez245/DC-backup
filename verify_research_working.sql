-- Verification Queries for Research Code Feature
-- Run these in Supabase SQL Editor to verify everything is working

-- 1. Check latest research sessions
SELECT 
    research_code,
    turns_used,
    max_turns,
    session_status,
    started_at,
    completed_at,
    duration_seconds,
    created_at
FROM research_sessions
ORDER BY created_at DESC
LIMIT 5;

-- 2. Check research messages for latest session
-- (Replace '<session_id>' with actual session ID from query 1)
SELECT 
    message_type,
    turn_number,
    CASE WHEN dq_scores IS NOT NULL THEN '✅' ELSE '❌' END as has_dq_score,
    length(content) as message_length,
    timestamp
FROM research_messages
WHERE research_session_id = (
    SELECT id FROM research_sessions ORDER BY created_at DESC LIMIT 1
)
ORDER BY turn_number, timestamp;

-- 3. Check research code mappings
SELECT 
    research_code,
    character_name,
    created_at
FROM research_code_mappings
ORDER BY created_at DESC
LIMIT 5;

-- 4. Count messages with DQ scores
SELECT 
    COUNT(*) as total_messages,
    COUNT(*) FILTER (WHERE message_type = 'user') as user_messages,
    COUNT(*) FILTER (WHERE message_type = 'user' AND dq_scores IS NOT NULL) as user_messages_with_dq,
    COUNT(*) FILTER (WHERE message_type = 'jamie') as coach_messages
FROM research_messages
WHERE research_session_id = (
    SELECT id FROM research_sessions ORDER BY created_at DESC LIMIT 1
);

-- 5. Verify data integrity - check if all user messages have DQ scores
SELECT 
    'Data Integrity Check' as check_type,
    COUNT(*) FILTER (WHERE message_type = 'user' AND dq_scores IS NULL) as missing_dq_scores,
    COUNT(*) FILTER (WHERE message_type = 'user' AND dq_scores IS NOT NULL) as has_dq_scores
FROM research_messages
WHERE research_session_id = (
    SELECT id FROM research_sessions ORDER BY created_at DESC LIMIT 1
);

