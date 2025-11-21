-- Fix RLS policies for Supabase integration
-- Run this in your Supabase SQL Editor

-- Enable Row Level Security for all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dq_analytics ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies for all tables
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Allow public user registration" ON public.users;
DROP POLICY IF EXISTS "Individual users can view their own data." ON public.users;
DROP POLICY IF EXISTS "Individual users can create their own data." ON public.users;
DROP POLICY IF EXISTS "Individual users can update their own data." ON public.users;

DROP POLICY IF EXISTS "Teachers can view their own data" ON public.teachers;
DROP POLICY IF EXISTS "Teachers can insert their own data" ON public.teachers;
DROP POLICY IF EXISTS "Teachers can update their own data" ON public.teachers;
DROP POLICY IF EXISTS "Allow public teacher registration" ON public.teachers;
DROP POLICY IF EXISTS "Teachers can view their own data." ON public.teachers;
DROP POLICY IF EXISTS "Teachers can create their own data." ON public.teachers;
DROP POLICY IF EXISTS "Teachers can update their own data." ON public.teachers;

DROP POLICY IF EXISTS "Teachers can view their own classrooms" ON public.classrooms;
DROP POLICY IF EXISTS "Teachers can create classrooms" ON public.classrooms;
DROP POLICY IF EXISTS "Teachers can update their own classrooms" ON public.classrooms;
DROP POLICY IF EXISTS "Students can view enrolled classrooms" ON public.classrooms;

DROP POLICY IF EXISTS "Teachers can view enrollments in their classrooms" ON public.enrollments;
DROP POLICY IF EXISTS "Students can view their own enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Students can join classrooms" ON public.enrollments;

DROP POLICY IF EXISTS "Students can view their own sessions" ON public.sessions;
DROP POLICY IF EXISTS "Students can create sessions" ON public.sessions;
DROP POLICY IF EXISTS "Teachers can view student sessions in their classrooms" ON public.sessions;

DROP POLICY IF EXISTS "Students can view messages in their sessions" ON public.messages;
DROP POLICY IF EXISTS "Students can create messages in their sessions" ON public.messages;
DROP POLICY IF EXISTS "Teachers can view messages in their students' sessions" ON public.messages;

DROP POLICY IF EXISTS "Students can view their own progress" ON public.student_progress;
DROP POLICY IF EXISTS "Students can update their own progress" ON public.student_progress;
DROP POLICY IF EXISTS "Teachers can view progress of their students" ON public.student_progress;

DROP POLICY IF EXISTS "Students can view their own analytics" ON public.dq_analytics;
DROP POLICY IF EXISTS "Students can create their own analytics" ON public.dq_analytics;
DROP POLICY IF EXISTS "Teachers can view analytics of their students" ON public.dq_analytics;

-- USERS TABLE POLICIES
CREATE POLICY "Users can view their own data" ON public.users
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own data" ON public.users
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON public.users
FOR UPDATE USING (auth.uid() = id);

-- Allow public access for user registration
CREATE POLICY "Allow public user registration" ON public.users
FOR INSERT WITH CHECK (true);

-- TEACHERS TABLE POLICIES
CREATE POLICY "Teachers can view their own data" ON public.teachers
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Teachers can insert their own data" ON public.teachers
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Teachers can update their own data" ON public.teachers
FOR UPDATE USING (auth.uid() = id);

-- Allow public access for teacher registration
CREATE POLICY "Allow public teacher registration" ON public.teachers
FOR INSERT WITH CHECK (true);

-- CLASSROOMS TABLE POLICIES
CREATE POLICY "Teachers can view their own classrooms" ON public.classrooms
FOR SELECT USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can create classrooms" ON public.classrooms
FOR INSERT WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update their own classrooms" ON public.classrooms
FOR UPDATE USING (auth.uid() = teacher_id);

-- Students can view classrooms they're enrolled in
CREATE POLICY "Students can view enrolled classrooms" ON public.classrooms
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.enrollments 
    WHERE enrollments.classroom_id = classrooms.id 
    AND enrollments.student_id = auth.uid()
  )
);

-- ENROLLMENTS TABLE POLICIES
CREATE POLICY "Teachers can view enrollments in their classrooms" ON public.enrollments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.classrooms 
    WHERE classrooms.id = enrollments.classroom_id 
    AND classrooms.teacher_id = auth.uid()
  )
);

CREATE POLICY "Students can view their own enrollments" ON public.enrollments
FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can join classrooms" ON public.enrollments
FOR INSERT WITH CHECK (auth.uid() = student_id);

-- SESSIONS TABLE POLICIES
CREATE POLICY "Students can view their own sessions" ON public.sessions
FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can create sessions" ON public.sessions
FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Teachers can view student sessions in their classrooms" ON public.sessions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.enrollments 
    JOIN public.classrooms ON enrollments.classroom_id = classrooms.id
    WHERE enrollments.student_id = sessions.student_id 
    AND classrooms.teacher_id = auth.uid()
  )
);

-- MESSAGES TABLE POLICIES
CREATE POLICY "Students can view messages in their sessions" ON public.messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.sessions 
    WHERE sessions.id = messages.session_id 
    AND sessions.student_id = auth.uid()
  )
);

CREATE POLICY "Students can create messages in their sessions" ON public.messages
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.sessions 
    WHERE sessions.id = messages.session_id 
    AND sessions.student_id = auth.uid()
  )
);

CREATE POLICY "Teachers can view messages in their students' sessions" ON public.messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.sessions 
    JOIN public.enrollments ON enrollments.student_id = sessions.student_id
    JOIN public.classrooms ON enrollments.classroom_id = classrooms.id
    WHERE sessions.id = messages.session_id 
    AND classrooms.teacher_id = auth.uid()
  )
);

-- STUDENT_PROGRESS TABLE POLICIES
CREATE POLICY "Students can view their own progress" ON public.student_progress
FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can update their own progress" ON public.student_progress
FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own progress" ON public.student_progress
FOR UPDATE USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view progress of their students" ON public.student_progress
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.enrollments 
    JOIN public.classrooms ON enrollments.classroom_id = classrooms.id
    WHERE enrollments.student_id = student_progress.student_id 
    AND classrooms.teacher_id = auth.uid()
  )
);

-- DQ_ANALYTICS TABLE POLICIES
CREATE POLICY "Students can view their own analytics" ON public.dq_analytics
FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can create their own analytics" ON public.dq_analytics
FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Teachers can view analytics of their students" ON public.dq_analytics
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.enrollments 
    JOIN public.classrooms ON enrollments.classroom_id = classrooms.id
    WHERE enrollments.student_id = dq_analytics.student_id 
    AND classrooms.teacher_id = auth.uid()
  )
);

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

