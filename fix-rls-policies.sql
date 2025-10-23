-- Fix RLS policies for user registration
-- Disable RLS temporarily for user creation
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE teachers DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS with proper policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;

-- Create policies that allow users to insert their own records
CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Teacher policies
CREATE POLICY "Teachers can insert their own profile" ON teachers
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Teachers can view their own profile" ON teachers
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Teachers can update their own profile" ON teachers
    FOR UPDATE USING (auth.uid() = id);

-- Allow public access for user registration (temporary)
CREATE POLICY "Allow public user registration" ON users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public teacher registration" ON teachers
    FOR INSERT WITH CHECK (true);
