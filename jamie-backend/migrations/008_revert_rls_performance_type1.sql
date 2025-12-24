-- ============================================================================
-- Reverse Migration: 008_revert_rls_performance_type1.sql
-- Purpose: Revert RLS performance fix - Remove (select auth.uid()) wrapper
-- Date: 2024-12-21
-- ============================================================================
-- 
-- ROLLBACK: Revert (select auth.uid()) back to auth.uid()
-- Use this if the optimization causes issues (unlikely)
--
-- This reverses migration 008_fix_rls_performance_type1.sql
--
-- ============================================================================

-- ============================================================================
-- USERS TABLE POLICIES (Reverted)
-- ============================================================================

-- Users can view their own record
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

-- ============================================================================
-- TEACHERS TABLE POLICIES (Reverted)
-- ============================================================================

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

-- ============================================================================
-- CLASSROOMS TABLE POLICIES (Reverted)
-- ============================================================================

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

-- ============================================================================
-- ENROLLMENTS TABLE POLICIES (Reverted)
-- ============================================================================

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

-- ============================================================================
-- SESSIONS TABLE POLICIES (Reverted)
-- ============================================================================

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

-- ============================================================================
-- MESSAGES TABLE POLICIES (Reverted)
-- ============================================================================

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

-- ============================================================================
-- STUDENT_PROGRESS TABLE POLICIES (Reverted)
-- ============================================================================

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

-- ============================================================================
-- DQ_ANALYTICS TABLE POLICIES (Reverted)
-- ============================================================================

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

-- ============================================================================
-- RESEARCH_EXPORTS TABLE POLICIES (Reverted)
-- ============================================================================

-- Users can view their own export requests
CREATE POLICY "Users can view own export requests" ON public.research_exports
    FOR SELECT
    USING (auth.uid() = requested_by);

-- Users can create their own export requests
CREATE POLICY "Users can create own export requests" ON public.research_exports
    FOR INSERT
    WITH CHECK (auth.uid() = requested_by);

-- ============================================================================
-- RESEARCH_CODE_MAPPINGS TABLE POLICIES (Reverted)
-- ============================================================================

-- Users can create their own research code mappings
CREATE POLICY "Users can create research codes" ON public.research_code_mappings
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- NOTE: This is a rollback migration
-- Use only if migration 008_fix_rls_performance_type1.sql causes issues
-- ============================================================================

