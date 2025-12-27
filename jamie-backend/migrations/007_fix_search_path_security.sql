-- ============================================================================
-- Migration: 007_fix_search_path_security.sql
-- Purpose: Fix "role mutable search_path" security issues for 8 functions
-- Date: 2024-12-21
-- ============================================================================
-- 
-- SECURITY FIX: Add SET search_path = '' to all functions to prevent
-- search_path manipulation attacks. This ensures functions use fully
-- qualified schema names and prevents security vulnerabilities.
--
-- Affected functions:
-- 1. update_research_sessions_updated_at
-- 2. get_session_student_id
-- 3. is_teacher_of_student
-- 4. is_classroom_owned_by_teacher
-- 5. is_student_enrolled_with_teacher
-- 6. is_user_student
-- 7. get_student_progress
-- 8. anonymize_student_data
--
-- ============================================================================

-- ============================================================================
-- Function 1: update_research_sessions_updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_research_sessions_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''  -- SECURITY FIX: Prevent search_path manipulation
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- ============================================================================
-- Function 2: get_session_student_id
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_session_student_id(session_uuid UUID)
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''  -- SECURITY FIX: Prevent search_path manipulation
AS $$
    SELECT student_id FROM public.sessions WHERE id = session_uuid LIMIT 1;
$$;

-- ============================================================================
-- Function 3: is_teacher_of_student
-- ============================================================================
CREATE OR REPLACE FUNCTION public.is_teacher_of_student(student_uuid UUID, teacher_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''  -- SECURITY FIX: Prevent search_path manipulation
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.enrollments e
        JOIN public.classrooms c ON e.classroom_id = c.id
        WHERE e.student_id = student_uuid
        AND c.teacher_id = teacher_uuid
    );
$$;

-- ============================================================================
-- Function 4: is_classroom_owned_by_teacher
-- ============================================================================
CREATE OR REPLACE FUNCTION public.is_classroom_owned_by_teacher(classroom_uuid UUID, teacher_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''  -- SECURITY FIX: Prevent search_path manipulation
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.classrooms c
        WHERE c.id = classroom_uuid
        AND c.teacher_id = teacher_uuid
    );
$$;

-- ============================================================================
-- Function 5: is_student_enrolled_with_teacher
-- ============================================================================
CREATE OR REPLACE FUNCTION public.is_student_enrolled_with_teacher(student_uuid UUID, teacher_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''  -- SECURITY FIX: Prevent search_path manipulation
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.enrollments e
        JOIN public.classrooms c ON e.classroom_id = c.id
        WHERE e.student_id = student_uuid
        AND c.teacher_id = teacher_uuid
    );
$$;

-- ============================================================================
-- Function 6: is_user_student
-- ============================================================================
CREATE OR REPLACE FUNCTION public.is_user_student(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''  -- SECURITY FIX: Prevent search_path manipulation
AS $$
    -- Check if user exists and has role 'student' (not in teachers table)
    SELECT EXISTS (
        SELECT 1 
        FROM public.users u
        WHERE u.id = user_uuid
        AND u.role = 'student'
        AND NOT EXISTS (SELECT 1 FROM public.teachers WHERE id = user_uuid)
    );
$$;

-- ============================================================================
-- Function 7: get_student_progress
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_student_progress(student_uuid UUID)
RETURNS TABLE (
    character_name VARCHAR,
    level VARCHAR,
    completed_at TIMESTAMP WITH TIME ZONE,
    average_dq_score DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''  -- SECURITY FIX: Prevent search_path manipulation
AS $$
BEGIN
    RETURN QUERY
    SELECT sp.character_name, sp.level, sp.completed_at, sp.average_dq_score
    FROM public.student_progress sp
    WHERE sp.student_id = student_uuid
    ORDER BY sp.character_name, sp.completed_at;
END;
$$;

-- ============================================================================
-- Function 8: anonymize_student_data
-- ============================================================================
CREATE OR REPLACE FUNCTION public.anonymize_student_data()
RETURNS TABLE (
    research_id VARCHAR,
    character_name VARCHAR,
    level VARCHAR,
    average_dq_score DECIMAL,
    completed_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''  -- SECURITY FIX: Prevent search_path manipulation
AS $$
BEGIN
    RETURN QUERY
    SELECT u.research_id, sp.character_name, sp.level, sp.average_dq_score, sp.completed_at
    FROM public.student_progress sp
    JOIN public.users u ON sp.student_id = u.id
    WHERE u.anonymized = TRUE;
END;
$$;

-- ============================================================================
-- Verification: Check that all functions have search_path set
-- ============================================================================
-- Run this query after migration to verify:
--
-- SELECT 
--     p.proname AS function_name,
--     pg_get_functiondef(p.oid) LIKE '%SET search_path%' AS has_search_path_set
-- FROM pg_proc p
-- JOIN pg_namespace n ON p.pronamespace = n.oid
-- WHERE n.nspname = 'public'
--     AND p.proname IN (
--         'update_research_sessions_updated_at',
--         'get_session_student_id',
--         'is_teacher_of_student',
--         'is_classroom_owned_by_teacher',
--         'is_student_enrolled_with_teacher',
--         'is_user_student',
--         'get_student_progress',
--         'anonymize_student_data'
--     )
-- ORDER BY p.proname;
--
-- All functions should have has_search_path_set = true
-- ============================================================================

