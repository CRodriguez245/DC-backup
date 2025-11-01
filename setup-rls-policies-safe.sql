-- Safe RLS Policies for Decision Coach
-- This version prioritizes stability and avoids complex joins in user policies

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
-- HELPER FUNCTIONS (MUST BE CREATED BEFORE POLICIES)
-- ============================================

-- Helper function to check if teacher has student (bypasses RLS recursion)
CREATE OR REPLACE FUNCTION public.is_teacher_of_student(student_uuid UUID, teacher_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.enrollments e
        JOIN public.classrooms c ON e.classroom_id = c.id
        WHERE e.student_id = student_uuid
        AND c.teacher_id = teacher_uuid
    );
$$;

-- Helper function to get student ID from session (bypasses RLS recursion)
CREATE OR REPLACE FUNCTION public.get_session_student_id(session_uuid UUID)
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT student_id FROM public.sessions WHERE id = session_uuid LIMIT 1;
$$;

-- Helper function to check if classroom belongs to teacher (bypasses RLS recursion)
CREATE OR REPLACE FUNCTION public.is_classroom_owned_by_teacher(classroom_uuid UUID, teacher_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.classrooms c
        WHERE c.id = classroom_uuid
        AND c.teacher_id = teacher_uuid
    );
$$;

-- Helper function to check if student is enrolled in teacher's classroom (bypasses RLS recursion)
CREATE OR REPLACE FUNCTION public.is_student_enrolled_with_teacher(student_uuid UUID, teacher_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.enrollments e
        JOIN public.classrooms c ON e.classroom_id = c.id
        WHERE e.student_id = student_uuid
        AND c.teacher_id = teacher_uuid
    );
$$;

-- Helper function to check if user is a student (bypasses RLS recursion)
CREATE OR REPLACE FUNCTION public.is_user_student(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
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

-- ============================================
-- USERS TABLE POLICIES (SIMPLIFIED)
-- ============================================

-- Users can view their own record (SIMPLE - no joins)
CREATE POLICY "users_select_own" ON public.users
    FOR SELECT
    USING (auth.uid() = id);

-- Users can insert their own record (for registration)
CREATE POLICY "users_insert_own" ON public.users
    FOR INSERT
    WITH CHECK (auth.uid() = id OR auth.uid() IS NULL);

-- Users can update their own record
CREATE POLICY "users_update_own" ON public.users
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Teachers can view their students (using function to avoid recursion)
CREATE POLICY "users_select_teacher_students" ON public.users
    FOR SELECT
    USING (
        -- Only apply if current user is a teacher and target user is a student
        EXISTS (SELECT 1 FROM public.teachers WHERE id = auth.uid())
        AND users.role = 'student'
        AND public.is_teacher_of_student(users.id, auth.uid())
    );

-- Students can view their teachers (teachers whose classrooms they're enrolled in)
CREATE POLICY "users_select_student_teachers" ON public.users
    FOR SELECT
    USING (
        -- Only apply if current user is a student and target user is a teacher
        public.is_user_student(auth.uid())
        AND users.role = 'teacher'
        AND public.is_student_enrolled_with_teacher(auth.uid(), users.id)
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

-- Students can view classrooms by code to join (authenticated users can read)
CREATE POLICY "classrooms_select_by_code" ON public.classrooms
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- ============================================
-- ENROLLMENTS TABLE POLICIES
-- ============================================

-- Teachers can view enrollments in their classrooms (using function to avoid recursion)
CREATE POLICY "enrollments_select_teacher" ON public.enrollments
    FOR SELECT
    USING (
        -- Only allow if current user is a teacher
        EXISTS (SELECT 1 FROM public.teachers WHERE id = auth.uid())
        AND public.is_classroom_owned_by_teacher(enrollments.classroom_id, auth.uid())
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

-- Teachers can view sessions of their students (using function to avoid recursion)
CREATE POLICY "sessions_select_teacher" ON public.sessions
    FOR SELECT
    USING (
        -- Only allow if current user is a teacher
        EXISTS (SELECT 1 FROM public.teachers WHERE id = auth.uid())
        AND public.is_teacher_of_student(sessions.student_id, auth.uid())
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

-- Teachers can view messages in their students' sessions (using function to avoid recursion)
CREATE POLICY "messages_select_teacher" ON public.messages
    FOR SELECT
    USING (
        -- Only allow if current user is a teacher
        EXISTS (SELECT 1 FROM public.teachers WHERE id = auth.uid())
        AND public.is_teacher_of_student(public.get_session_student_id(messages.session_id), auth.uid())
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

-- Teachers can view progress of their students (using function to avoid recursion)
CREATE POLICY "student_progress_select_teacher" ON public.student_progress
    FOR SELECT
    USING (
        -- Only allow if current user is a teacher
        EXISTS (SELECT 1 FROM public.teachers WHERE id = auth.uid())
        AND public.is_teacher_of_student(student_progress.student_id, auth.uid())
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

-- Teachers can view analytics of their students (using function to avoid recursion)
CREATE POLICY "dq_analytics_select_teacher" ON public.dq_analytics
    FOR SELECT
    USING (
        -- Only allow if current user is a teacher
        EXISTS (SELECT 1 FROM public.teachers WHERE id = auth.uid())
        AND public.is_teacher_of_student(dq_analytics.student_id, auth.uid())
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

-- Grant execute permissions on helper functions
GRANT EXECUTE ON FUNCTION public.is_teacher_of_student(UUID, UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_session_student_id(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_classroom_owned_by_teacher(UUID, UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_student_enrolled_with_teacher(UUID, UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_user_student(UUID) TO anon, authenticated;

