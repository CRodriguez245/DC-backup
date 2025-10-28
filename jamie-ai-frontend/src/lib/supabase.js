// Supabase client configuration for Decision Coach
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!')
  console.error('Please check your .env.local file')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Disable email confirmation in development
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
})

// Authentication helpers
export const auth = {
  // Sign up new user
  signUp: async (email, password, userData) => {
    // Use production URL for email confirmations
    const isDevelopment = process.env.NODE_ENV === 'development'
    const redirectUrl = isDevelopment 
      ? 'http://localhost:3000' 
      : 'https://decisioncoach.io'
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
        emailRedirectTo: redirectUrl
      }
    })
    return { data, error }
  },

  // Sign in user
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  // Sign out user
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current user
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // Listen to auth changes
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Database helpers
export const db = {
  // Get user profile
  getUserProfile: async (userId) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  // Create user profile
  createUserProfile: async (userId, email, name, role) => {
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: userId,
        email,
        name,
        role
      })
    return { data, error }
  },

  // Create teacher profile
  createTeacher: async (userId, school, department) => {
    const { data, error } = await supabase
      .from('teachers')
      .insert({
        id: userId,
        school,
        department
      })
    return { data, error }
  },

  // Create classroom
  createClassroom: async (teacherId, name, description) => {
    const classroomCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    const { data, error } = await supabase
      .from('classrooms')
      .insert({
        teacher_id: teacherId,
        name,
        description,
        classroom_code: classroomCode
      })
      .select()
      .single()
    return { data, error }
  },

  // Join classroom (student)
  joinClassroom: async (studentId, classroomCode) => {
    // First get classroom by code
    const { data: classroom, error: classroomError } = await supabase
      .from('classrooms')
      .select('id')
      .eq('classroom_code', classroomCode)
      .single()

    if (classroomError) return { data: null, error: classroomError }

    // Then enroll student
    const { data, error } = await supabase
      .from('enrollments')
      .insert({
        student_id: studentId,
        classroom_id: classroom.id
      })
    return { data, error }
  },

  // Get teacher's students
  getTeacherStudents: async (teacherId) => {
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        student_id,
        users!enrollments_student_id_fkey (
          id,
          name,
          email,
          created_at
        )
      `)
      .eq('classrooms.teacher_id', teacherId)
    return { data, error }
  },

  // Create coaching session
  createSession: async (studentId, characterName) => {
    const { data, error } = await supabase
      .from('sessions')
      .insert({
        student_id: studentId,
        character_name: characterName,
        session_type: 'coaching'
      })
      .select()
      .single()
    return { data, error }
  },

  // Save chat message
  saveMessage: async (sessionId, messageType, content, dqScores = null) => {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        session_id: sessionId,
        message_type: messageType,
        content,
        dq_scores: dqScores,
        dq_score_minimum: dqScores ? Math.min(...Object.values(dqScores)) : null
      })
    return { data, error }
  },

  // Update student progress
  updateProgress: async (studentId, characterName, level, dqScores) => {
    const { data, error } = await supabase
      .from('student_progress')
      .upsert({
        student_id: studentId,
        character_name: characterName,
        level,
        average_dq_score: dqScores ? Math.min(...Object.values(dqScores)) : null,
        completed_at: new Date().toISOString()
      })
    return { data, error }
  },

  // Get student progress
  getStudentProgress: async (studentId) => {
    const { data, error } = await supabase
      .from('student_progress')
      .select('*')
      .eq('student_id', studentId)
      .order('completed_at', { ascending: false })
    return { data, error }
  },

  // Get session history
  getSessionHistory: async (studentId, characterName = null) => {
    let query = supabase
      .from('sessions')
      .select(`
        *,
        messages (*)
      `)
      .eq('student_id', studentId)
      .order('start_time', { ascending: false })

    if (characterName) {
      query = query.eq('character_name', characterName)
    }

    const { data, error } = await query
    return { data, error }
  }
}

// Real-time subscriptions
export const realtime = {
  // Subscribe to student progress updates
  subscribeToProgress: (teacherId, callback) => {
    return supabase
      .channel('progress_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'student_progress'
      }, callback)
      .subscribe()
  },

  // Subscribe to session updates
  subscribeToSessions: (teacherId, callback) => {
    return supabase
      .channel('session_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'sessions'
      }, callback)
      .subscribe()
  }
}

export default supabase
