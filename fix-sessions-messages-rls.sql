-- Fix RLS policies for sessions and messages tables
-- This allows teachers to view their students' session data and chat messages

-- RLS policies for 'sessions' table
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Allow students to view their own sessions
CREATE POLICY "Students can view their own sessions" ON public.sessions
FOR SELECT USING (auth.uid() = student_id);

-- Allow students to create their own sessions
CREATE POLICY "Students can create their own sessions" ON public.sessions
FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Allow students to update their own sessions
CREATE POLICY "Students can update their own sessions" ON public.sessions
FOR UPDATE USING (auth.uid() = student_id);

-- Allow teachers to view their students' sessions
CREATE POLICY "Teachers can view their students' sessions" ON public.sessions
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.enrollments e
        JOIN public.classrooms c ON e.classroom_id = c.id
        WHERE e.student_id = sessions.student_id AND c.teacher_id = auth.uid()
    )
);

-- RLS policies for 'messages' table
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Allow students to view messages from their own sessions
CREATE POLICY "Students can view their own messages" ON public.messages
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.sessions s
        WHERE s.id = messages.session_id AND s.student_id = auth.uid()
    )
);

-- Allow students to create messages in their own sessions
CREATE POLICY "Students can create their own messages" ON public.messages
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.sessions s
        WHERE s.id = messages.session_id AND s.student_id = auth.uid()
    )
);

-- Allow students to update messages in their own sessions
CREATE POLICY "Students can update their own messages" ON public.messages
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.sessions s
        WHERE s.id = messages.session_id AND s.student_id = auth.uid()
    )
);

-- Allow teachers to view messages from their students' sessions
CREATE POLICY "Teachers can view their students' messages" ON public.messages
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.sessions s
        JOIN public.enrollments e ON s.student_id = e.student_id
        JOIN public.classrooms c ON e.classroom_id = c.id
        WHERE s.id = messages.session_id AND c.teacher_id = auth.uid()
    )
);

-- Grant necessary permissions
GRANT ALL ON public.sessions TO anon, authenticated;
GRANT ALL ON public.messages TO anon, authenticated;

