-- Comprehensive RLS Policies for Decision Coach
-- This script sets up proper Row Level Security without infinite recursion

-- Step 1: Drop all existing policies to start fresh
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Step 2: Temporarily disable RLS to ensure clean state
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.teachers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.classrooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.student_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.dq_analytics DISABLE ROW LEVEL SECURITY;

-- Step 3: Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dq_analytics ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Users can view their own record (MUST be first - simplest check)
CREATE POLICY "users_select_own" ON public.users
    FOR SELECT
    USING (auth.uid() = id);

-- Users can insert their own record (for registration)
-- Also allow public inserts during registration (before auth.uid() is set)
CREATE POLICY "users_insert_own" ON public.users
    FOR INSERT
    WITH CHECK (auth.uid() = id OR auth.uid() IS NULL);

-- Users can update their own record
CREATE POLICY "users_update_own" ON public.users
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Teachers can view their students (through enrollments -> classrooms)
-- This avoids recursion by going through enrollments, not directly to users
-- Made more defensive to prevent errors
CREATE POLICY "teachers_select_students" ON public.users
    FOR SELECT
    USING (
        -- Only apply this policy if current user is authenticated
        auth.uid() IS NOT NULL
        -- And the user being queried is a student
        AND users.role = 'student'
        -- And the current user is a teacher who has this student enrolled
        AND EXISTS (
            SELECT 1 
            FROM public.enrollments e
            JOIN public.classrooms c ON e.classroom_id = c.id
            WHERE e.student_id = users.id
            AND c.teacher_id = auth.uid()
        )
    );

-- ============================================
-- TEACHERS TABLE POLICIES
-- ============================================

-- Teachers can view their own record
CREATE POLICY "teachers_select_own" ON public.teachers
    FOR SELECT
    USING (auth.uid() = id);

-- Teachers can insert their own record
CREATE POLICY "teachers_insert_own" ON public.teachers
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Teachers can update their own record
CREATE POLICY "teachers_update_own" ON public.teachers
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ============================================
-- CLASSROOMS TABLE POLICIES
-- ============================================

-- Teachers can view their own classrooms
CREATE POLICY "classrooms_select_own" ON public.classrooms
    FOR SELECT
    USING (teacher_id = auth.uid());

-- Teachers can create classrooms
CREATE POLICY "classrooms_insert_own" ON public.classrooms
    FOR INSERT
    WITH CHECK (teacher_id = auth.uid());

-- Teachers can update their own classrooms
CREATE POLICY "classrooms_update_own" ON public.classrooms
    FOR UPDATE
    USING (teacher_id = auth.uid())
    WITH CHECK (teacher_id = auth.uid());

-- Students can view classrooms they're enrolled in
-- This is safe because it checks enrollments first, not classrooms
CREATE POLICY "classrooms_select_enrolled" ON public.classrooms
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 
            FROM public.enrollments e
            WHERE e.classroom_id = classrooms.id
            AND e.student_id = auth.uid()
        )
    );

-- Students can view classrooms by code to join (no recursion - direct match on code)
-- This allows students to find classrooms by code without being enrolled yet
CREATE POLICY "classrooms_select_by_code" ON public.classrooms
    FOR SELECT
    USING (
        -- Allow reading if user is authenticated (they need to see the code to join)
        auth.uid() IS NOT NULL
    );

-- ============================================
-- ENROLLMENTS TABLE POLICIES
-- ============================================

-- Teachers can view enrollments in their classrooms
CREATE POLICY "enrollments_select_teacher" ON public.enrollments
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 
            FROM public.classrooms c
            WHERE c.id = enrollments.classroom_id
            AND c.teacher_id = auth.uid()
        )
    );

-- Students can view their own enrollments
CREATE POLICY "enrollments_select_own" ON public.enrollments
    FOR SELECT
    USING (student_id = auth.uid());

-- Students can join classrooms (insert enrollments)
CREATE POLICY "enrollments_insert_own" ON public.enrollments
    FOR INSERT
    WITH CHECK (student_id = auth.uid());

-- ============================================
-- SESSIONS TABLE POLICIES
-- ============================================

-- Students can view their own sessions
CREATE POLICY "sessions_select_own" ON public.sessions
    FOR SELECT
    USING (student_id = auth.uid());

-- Students can create sessions
CREATE POLICY "sessions_insert_own" ON public.sessions
    FOR INSERT
    WITH CHECK (student_id = auth.uid());

-- Students can update their own sessions
CREATE POLICY "sessions_update_own" ON public.sessions
    FOR UPDATE
    USING (student_id = auth.uid())
    WITH CHECK (student_id = auth.uid());

-- Teachers can view sessions of their students
CREATE POLICY "sessions_select_teacher" ON public.sessions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 
            FROM public.enrollments e
            JOIN public.classrooms c ON e.classroom_id = c.id
            WHERE e.student_id = sessions.student_id
            AND c.teacher_id = auth.uid()
        )
    );

-- ============================================
-- MESSAGES TABLE POLICIES
-- ============================================

-- Students can view messages in their sessions
CREATE POLICY "messages_select_own" ON public.messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 
            FROM public.sessions s
            WHERE s.id = messages.session_id
            AND s.student_id = auth.uid()
        )
    );

-- Students can create messages in their sessions
CREATE POLICY "messages_insert_own" ON public.messages
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 
            FROM public.sessions s
            WHERE s.id = messages.session_id
            AND s.student_id = auth.uid()
        )
    );

-- Teachers can view messages in their students' sessions
CREATE POLICY "messages_select_teacher" ON public.messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 
            FROM public.sessions s
            JOIN public.enrollments e ON e.student_id = s.student_id
            JOIN public.classrooms c ON e.classroom_id = c.id
            WHERE s.id = messages.session_id
            AND c.teacher_id = auth.uid()
        )
    );

-- ============================================
-- STUDENT_PROGRESS TABLE POLICIES
-- ============================================

-- Students can view their own progress
CREATE POLICY "student_progress_select_own" ON public.student_progress
    FOR SELECT
    USING (student_id = auth.uid());

-- Students can insert/update their own progress
CREATE POLICY "student_progress_insert_own" ON public.student_progress
    FOR INSERT
    WITH CHECK (student_id = auth.uid());

CREATE POLICY "student_progress_update_own" ON public.student_progress
    FOR UPDATE
    USING (student_id = auth.uid())
    WITH CHECK (student_id = auth.uid());

-- Teachers can view progress of their students
CREATE POLICY "student_progress_select_teacher" ON public.student_progress
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 
            FROM public.enrollments e
            JOIN public.classrooms c ON e.classroom_id = c.id
            WHERE e.student_id = student_progress.student_id
            AND c.teacher_id = auth.uid()
        )
    );

-- ============================================
-- DQ_ANALYTICS TABLE POLICIES
-- ============================================

-- Students can view their own analytics
CREATE POLICY "dq_analytics_select_own" ON public.dq_analytics
    FOR SELECT
    USING (student_id = auth.uid());

-- Students can create their own analytics
CREATE POLICY "dq_analytics_insert_own" ON public.dq_analytics
    FOR INSERT
    WITH CHECK (student_id = auth.uid());

-- Teachers can view analytics of their students
CREATE POLICY "dq_analytics_select_teacher" ON public.dq_analytics
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 
            FROM public.enrollments e
            JOIN public.classrooms c ON e.classroom_id = c.id
            WHERE e.student_id = dq_analytics.student_id
            AND c.teacher_id = auth.uid()
        )
    );

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;
GRANT ALL ON public.teachers TO anon, authenticated;
GRANT ALL ON public.classrooms TO anon, authenticated;
GRANT ALL ON public.enrollments TO anon, authenticated;
GRANT ALL ON public.sessions TO anon, authenticated;
GRANT ALL ON public.messages TO anon, authenticated;
GRANT ALL ON public.student_progress TO anon, authenticated;
GRANT ALL ON public.dq_analytics TO anon, authenticated;

