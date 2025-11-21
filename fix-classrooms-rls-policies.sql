-- Fix RLS policies for classrooms table
-- Run this in your Supabase SQL Editor

-- Enable Row Level Security for the 'classrooms' table
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Teachers can view their own classrooms" ON public.classrooms;
DROP POLICY IF EXISTS "Teachers can create classrooms" ON public.classrooms;
DROP POLICY IF EXISTS "Teachers can update their own classrooms" ON public.classrooms;
DROP POLICY IF EXISTS "Students can view classrooms" ON public.classrooms;

-- Create policies for classrooms table
-- Teachers can view their own classrooms
CREATE POLICY "Teachers can view their own classrooms" ON public.classrooms
FOR SELECT USING (auth.uid() = teacher_id);

-- Teachers can create classrooms
CREATE POLICY "Teachers can create classrooms" ON public.classrooms
FOR INSERT WITH CHECK (auth.uid() = teacher_id);

-- Teachers can update their own classrooms
CREATE POLICY "Teachers can update their own classrooms" ON public.classrooms
FOR UPDATE USING (auth.uid() = teacher_id);

-- Students can view all classrooms (needed to join by code)
CREATE POLICY "Students can view classrooms" ON public.classrooms
FOR SELECT USING (true);

-- Grant necessary permissions
GRANT ALL ON public.classrooms TO anon, authenticated;

-- Enable Row Level Security for the 'enrollments' table
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Students can view their enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Students can create enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Teachers can view their students' enrollments" ON public.enrollments;

-- Create policies for enrollments table
-- Students can view their own enrollments
CREATE POLICY "Students can view their enrollments" ON public.enrollments
FOR SELECT USING (auth.uid() = student_id);

-- Students can create enrollments (join classrooms)
CREATE POLICY "Students can create enrollments" ON public.enrollments
FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Teachers can view enrollments for their classrooms
CREATE POLICY "Teachers can view their students' enrollments" ON public.enrollments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.classrooms 
    WHERE classrooms.id = enrollments.classroom_id 
    AND classrooms.teacher_id = auth.uid()
  )
);

-- Grant necessary permissions
GRANT ALL ON public.enrollments TO anon, authenticated;

