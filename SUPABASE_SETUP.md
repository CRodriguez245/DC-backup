# Decision Coach - Supabase Setup Guide

## 🚀 Quick Start

### 1. Create Supabase Project
- Go to [supabase.com](https://supabase.com)
- Sign up/Login with GitHub
- Click "New Project"
- Name: `decision-coach`
- Choose region closest to your users
- Use Free tier (perfect for development)

### 2. Run Database Schema
- Go to SQL Editor in your Supabase dashboard
- Copy and paste the contents of `supabase-schema.sql`
- Click "Run" to create all tables

### 3. Get Your Project Credentials
- Go to Settings → API
- Copy your:
  - **Project URL**
  - **anon public key**
  - **service_role key** (keep this secret!)

### 4. Install Supabase Client
```bash
cd jamie-ai-frontend
npm install @supabase/supabase-js
```

### 5. Configure Environment Variables
Create `.env.local` in your frontend:
```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 📊 Database Schema Overview

### Core Tables:
- **users**: Students and teachers
- **teachers**: Teacher-specific data
- **classrooms**: Teacher-created classes
- **enrollments**: Student-classroom relationships

### Session Tracking:
- **sessions**: Complete coaching sessions
- **messages**: Individual chat messages
- **student_progress**: Character completion
- **dq_analytics**: DQ score data for research

### Research Features:
- **research_exports**: Data export tracking
- **Anonymization**: Built-in privacy protection
- **Analytics functions**: Pre-built research queries

## 🔒 Security Features

### Row Level Security (RLS):
- Users can only see their own data
- Teachers can see their students' progress
- Automatic data protection

### Authentication:
- Built-in user management
- Role-based access (student/teacher)
- Secure session handling

## 🎯 Next Steps

1. **Test the schema** with sample data
2. **Set up authentication** in React app
3. **Create user registration flow**
4. **Implement teacher-student relationships**
5. **Add progress tracking**

## 📝 Sample Data for Testing

```sql
-- Insert test teacher
INSERT INTO users (email, name, role) VALUES ('teacher@test.com', 'Test Teacher', 'teacher');
INSERT INTO teachers (id, school) VALUES ((SELECT id FROM users WHERE email = 'teacher@test.com'), 'Test University');

-- Insert test student
INSERT INTO users (email, name, role) VALUES ('student@test.com', 'Test Student', 'student');

-- Create test classroom
INSERT INTO classrooms (name, teacher_id, classroom_code) VALUES 
('Test Class', (SELECT id FROM users WHERE email = 'teacher@test.com'), 'TEST123');
```

## 🚨 Important Notes

- **Save your database password** - you'll need it for direct access
- **Keep service_role key secret** - never commit to git
- **Test with sample data** before going live
- **Backup your data** before making changes

## 🔧 Troubleshooting

### Common Issues:
- **Permission denied**: Check RLS policies
- **Connection failed**: Verify environment variables
- **Schema errors**: Check SQL syntax in Supabase editor

### Getting Help:
- Supabase documentation: [supabase.com/docs](https://supabase.com/docs)
- Community forum: [github.com/supabase/supabase/discussions](https://github.com/supabase/supabase/discussions)
