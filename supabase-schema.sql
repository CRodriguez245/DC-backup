-- Decision Coach Database Schema
-- This schema supports student-teacher relationships, progress tracking, and research data

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (students and teachers)
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('student', 'teacher')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Research anonymization fields
    research_id VARCHAR(50) UNIQUE, -- For IRB compliance
    anonymized BOOLEAN DEFAULT FALSE
);

-- Teachers table (extends users)
CREATE TABLE teachers (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    school VARCHAR(255),
    department VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Classrooms table
CREATE TABLE classrooms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    classroom_code VARCHAR(10) UNIQUE NOT NULL, -- For student enrollment
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student enrollments in classrooms
CREATE TABLE enrollments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, classroom_id)
);

-- Coaching sessions
CREATE TABLE sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    character_name VARCHAR(50) NOT NULL CHECK (character_name IN ('jamie', 'andres', 'kavya')),
    session_type VARCHAR(20) DEFAULT 'coaching' CHECK (session_type IN ('coaching', 'demo')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    -- Session metadata
    turns_used INTEGER DEFAULT 0,
    max_turns INTEGER DEFAULT 20,
    session_status VARCHAR(20) DEFAULT 'in-progress' CHECK (session_status IN ('in-progress', 'completed', 'abandoned'))
);

-- Chat messages within sessions
CREATE TABLE messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    message_type VARCHAR(20) NOT NULL CHECK (message_type IN ('user', 'jamie', 'system')),
    content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- DQ scoring data
    dq_scores JSONB, -- Stores framing, alternatives, information, values, reasoning, commitment
    dq_score_minimum DECIMAL(3,2),
    turn_number INTEGER
);

-- Student progress tracking
CREATE TABLE student_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    character_name VARCHAR(50) NOT NULL CHECK (character_name IN ('jamie', 'andres', 'kavya')),
    level VARCHAR(50) NOT NULL, -- 'assessment', 'level1', 'level2', etc.
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Progress metrics
    total_sessions INTEGER DEFAULT 0,
    total_turns INTEGER DEFAULT 0,
    average_dq_score DECIMAL(3,2),
    best_dq_score DECIMAL(3,2),
    -- DQ dimension coverage
    dq_coverage JSONB, -- Tracks which DQ dimensions have been covered
    UNIQUE(student_id, character_name, level)
);

-- DQ score analytics (for research)
CREATE TABLE dq_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    -- Individual DQ scores
    framing DECIMAL(3,2),
    alternatives DECIMAL(3,2),
    information DECIMAL(3,2),
    values DECIMAL(3,2),
    reasoning DECIMAL(3,2),
    commitment DECIMAL(3,2),
    minimum_score DECIMAL(3,2),
    -- Context
    message_content TEXT,
    turn_number INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Research data export tracking
CREATE TABLE research_exports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    export_type VARCHAR(50) NOT NULL, -- 'anonymized', 'full', 'cohort'
    requested_by UUID NOT NULL REFERENCES users(id),
    export_parameters JSONB, -- What data was included
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    file_path VARCHAR(500),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed'))
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_sessions_student ON sessions(student_id);
CREATE INDEX idx_sessions_character ON sessions(character_name);
CREATE INDEX idx_messages_session ON messages(session_id);
CREATE INDEX idx_progress_student ON student_progress(student_id);
CREATE INDEX idx_dq_analytics_student ON dq_analytics(student_id);
CREATE INDEX idx_classrooms_teacher ON classrooms(teacher_id);
CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_classroom ON enrollments(classroom_id);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE dq_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies (users can only see their own data, teachers can see their students)
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Teachers can view their students" ON users FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM enrollments e 
        JOIN classrooms c ON e.classroom_id = c.id 
        WHERE e.student_id = users.id AND c.teacher_id = auth.uid()
    )
);

-- Functions for common operations
CREATE OR REPLACE FUNCTION get_student_progress(student_uuid UUID)
RETURNS TABLE (
    character_name VARCHAR,
    level VARCHAR,
    completed_at TIMESTAMP WITH TIME ZONE,
    average_dq_score DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT sp.character_name, sp.level, sp.completed_at, sp.average_dq_score
    FROM student_progress sp
    WHERE sp.student_id = student_uuid
    ORDER BY sp.character_name, sp.completed_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to anonymize data for research
CREATE OR REPLACE FUNCTION anonymize_student_data()
RETURNS TABLE (
    research_id VARCHAR,
    character_name VARCHAR,
    level VARCHAR,
    average_dq_score DECIMAL,
    completed_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT u.research_id, sp.character_name, sp.level, sp.average_dq_score, sp.completed_at
    FROM student_progress sp
    JOIN users u ON sp.student_id = u.id
    WHERE u.anonymized = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
