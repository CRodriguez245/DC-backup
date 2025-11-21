-- Fix RLS policies for student_progress table
-- Run this in your Supabase SQL Editor

-- Enable Row Level Security for student_progress table (if not already enabled)
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Students can view their own progress" ON public.student_progress;
DROP POLICY IF EXISTS "Students can insert their own progress" ON public.student_progress;
DROP POLICY IF EXISTS "Students can update their own progress" ON public.student_progress;
DROP POLICY IF EXISTS "Teachers can view their students' progress" ON public.student_progress;

-- Create policies for student_progress table

-- Students can view their own progress
CREATE POLICY "Students can view their own progress" ON public.student_progress
FOR SELECT USING (auth.uid() = student_id);

-- Students can insert their own progress
CREATE POLICY "Students can insert their own progress" ON public.student_progress
FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Students can update their own progress
CREATE POLICY "Students can update their own progress" ON public.student_progress
FOR UPDATE USING (auth.uid() = student_id);

-- Teachers can view their students' progress
CREATE POLICY "Teachers can view their students' progress" ON public.student_progress
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.enrollments e 
        JOIN public.classrooms c ON e.classroom_id = c.id 
        WHERE e.student_id = student_progress.student_id AND c.teacher_id = auth.uid()
    )
);

-- Grant necessary permissions
GRANT ALL ON public.student_progress TO anon, authenticated;

