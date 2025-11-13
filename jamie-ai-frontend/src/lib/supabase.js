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
    // First verify we have a valid session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      console.warn('getUserProfile: No active session, cannot query profile');
      return { data: null, error: { message: 'No active session' } };
    }
    
    // Verify the userId matches the session user
    if (session.user.id !== userId) {
      console.warn('getUserProfile: userId does not match session user', { 
        userId, 
        sessionUserId: session.user.id 
      });
    }
    
    // Use maybeSingle() instead of single() to avoid 406 errors when RLS blocks
    // However, 406 errors can still occur if RLS blocks the query entirely
    let data = null;
    let error = null;
    try {
      const result = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      if (!result) {
        console.warn('getUserProfile: Supabase query returned null result');
        return {
          data: null,
          error: { message: 'Supabase query returned null result', code: 'NO_RESULT' }
        };
      }
      data = result.data;
      error = result.error;
    } catch (httpError) {
      // Catch HTTP errors that might not be converted by Supabase client
      console.warn('getUserProfile: Caught HTTP error:', httpError);
      if (httpError.status === 406 || httpError.message?.includes('406')) {
        error = { 
          status: 406, 
          code: '406', 
          message: httpError.message || 'Not Acceptable',
          originalError: httpError
        };
      } else {
        throw httpError; // Re-throw if it's not a 406
      }
    }
    
    // Handle 406 errors (Not Acceptable) - usually means RLS is blocking
    if (error && (error.code === 'PGRST116' || error.status === 406 || error.code === '406' || error.message?.includes('406'))) {
      console.warn('getUserProfile: Got 406 error, trying SECURITY DEFINER function as fallback...', {
        userId,
        sessionUserId: session.user.id,
        error: error.message || error
      });
      
      // Try using the SECURITY DEFINER function as a fallback
      // This bypasses RLS and should work even if the policy is blocking
      try {
        const { data: functionData, error: functionError } = await supabase
          .rpc('get_user_profile', { user_uuid: userId });
        
        if (functionData && functionData.length > 0) {
          // Function returned data - convert to single object format
          const profileData = functionData[0];
          console.log('getUserProfile: Successfully retrieved profile via SECURITY DEFINER function');
          return { 
            data: {
              id: profileData.id,
              email: profileData.email,
              name: profileData.name,
              role: profileData.role,
              created_at: profileData.created_at,
              last_login: profileData.last_login
            }, 
            error: null 
          };
        }
        
        if (functionError) {
          console.warn('getUserProfile: SECURITY DEFINER function also failed:', functionError);
        }
      } catch (rpcError) {
        console.warn('getUserProfile: Error calling SECURITY DEFINER function:', rpcError);
      }
      
      // If function doesn't exist or also fails, try a simpler query to see if profile exists
      const { data: checkData, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .maybeSingle();
      
      if (checkData) {
        // Profile exists but RLS blocked the read - this indicates an RLS policy issue
        console.error('getUserProfile: Profile exists in database but RLS is blocking access', {
          userId,
          sessionUserId: session.user.id,
          error: error.message || error,
          checkError: checkError?.message || checkError
        });
        return { 
          data: null, 
          error: { 
            message: 'RLS policy is blocking access to your profile. Please check RLS policies in Supabase.',
            code: 'RLS_BLOCKED',
            originalError: error
          } 
        };
      }
      
      // Profile doesn't exist - this is expected for new users
      // Return null data, no error (will trigger profile creation)
      return { data: null, error: null };
    }
    
    // If we got data, return it
    if (data) {
      return { data, error: null };
    }
    
    // If error (but not 406), return the error
    if (error) {
      console.error('getUserProfile: Unexpected error:', error);
      return { data: null, error };
    }
    
    // No error but no data either - profile doesn't exist
    return { data: null, error: null };
  },

  // Create user profile
  createUserProfile: async (userId, email, name, role) => {
    // Try direct INSERT first
    let { data, error } = await supabase
      .from('users')
      .insert({
        id: userId,
        email,
        name,
        role
      })
      .select()
      .single();
    
    // If RLS blocks the INSERT (403 or 42501), use SECURITY DEFINER function as fallback
    if (error && (error.code === '42501' || error.status === 403 || error.code === 'PGRST301' || error.message?.includes('row-level security'))) {
      console.warn('createUserProfile: RLS blocked direct INSERT, using SECURITY DEFINER function as fallback');
      
      try {
        const { data: functionData, error: functionError } = await supabase
          .rpc('create_user_profile', {
            user_uuid: userId,
            user_email: email,
            user_name: name,
            user_role: role
          });
        
        if (functionData && functionData.length > 0) {
          console.log('createUserProfile: Successfully created profile via SECURITY DEFINER function');
          return { 
            data: functionData[0], 
            error: null 
          };
        }
        
        if (functionError) {
          console.error('createUserProfile: SECURITY DEFINER function also failed:', functionError);
          return { data: null, error: functionError };
        }
      } catch (rpcError) {
        console.error('createUserProfile: Error calling SECURITY DEFINER function:', rpcError);
        return { data: null, error: rpcError };
      }
    }
    
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
    console.log('Creating classroom with code:', classroomCode);
    
    // Debug: Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Auth check - Current user ID:', user?.id);
    console.log('Auth check - Teacher ID being used:', teacherId);
    console.log('Auth check - IDs match?', user?.id === teacherId);
    console.log('Auth error:', authError);
    
    // Debug: Check if teacher record exists
    if (user?.id) {
      const { data: teacherData, error: teacherError } = await supabase
        .from('teachers')
        .select('id')
        .eq('id', user.id)
        .single();
      console.log('Teacher record exists?', !!teacherData, teacherError);
    }
    
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
    
    console.log('Classroom creation result:', { data, error });
    if (error) {
      console.error('Full error details:', JSON.stringify(error, null, 2));
    }
    return { data, error }
  },

  // Join classroom (student)
  joinClassroom: async (studentId, classroomCode) => {
    try {
      console.log('joinClassroom called with:', { studentId, classroomCode });
      
      // First get classroom by code
      const { data: classrooms, error: classroomError } = await supabase
        .from('classrooms')
        .select('id, classroom_code, name')
        .eq('classroom_code', classroomCode)

      console.log('Classroom search result:', { classrooms, classroomError });

      if (classroomError) {
        return { data: null, error: classroomError }
      }

      if (!classrooms || classrooms.length === 0) {
        // Let's also try to see what classrooms exist
        const { data: allClassrooms } = await supabase
          .from('classrooms')
          .select('classroom_code, name')
          .limit(10);
        console.log('Available classrooms:', allClassrooms);
        return { data: null, error: { message: 'Classroom not found with that code' } }
      }

      if (classrooms.length > 1) {
        return { data: null, error: { message: 'Multiple classrooms found with that code' } }
      }

      const classroom = classrooms[0]

      // Check if student is already enrolled
      // Use .maybeSingle() instead of .single() to handle cases where no enrollment exists
      const { data: existingEnrollment, error: checkError } = await supabase
        .from('enrollments')
        .select('id')
        .eq('student_id', studentId)
        .eq('classroom_id', classroom.id)
        .maybeSingle()

      // Handle errors - ignore "not found" (PGRST116) and 406 (Not Acceptable) which can occur with RLS
      // Also handle 406 which might occur due to RLS policy evaluation
      if (checkError && 
          checkError.code !== 'PGRST116' && 
          checkError.status !== 406 && 
          checkError.code !== '406') {
        console.warn('Error checking existing enrollment (non-critical):', checkError);
        // Continue anyway - worst case we'll get a unique constraint error on insert
      }

      if (existingEnrollment) {
        return { data: null, error: { message: 'You are already enrolled in this classroom' } }
      }

      // Then enroll student
      const { data, error } = await supabase
        .from('enrollments')
        .insert({
          student_id: studentId,
          classroom_id: classroom.id
        })
        .select()
        .single()

      return { data, error }
    } catch (error) {
      return { data: null, error: { message: error.message } }
    }
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

  // Get teacher's classrooms
  getTeacherClassrooms: async (teacherId) => {
    const { data, error } = await supabase
      .from('classrooms')
      .select(`
        *,
        enrollments (
          student_id
        )
      `)
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Get student's enrolled classrooms
  getStudentClassrooms: async (studentId) => {
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        classrooms!enrollments_classroom_id_fkey (
          id,
          name,
          description,
          classroom_code,
          teacher_id,
          created_at,
          enrollments (
            student_id
          )
        )
      `)
      .eq('student_id', studentId)
    
    // If we got classrooms, fetch teacher names separately
    if (data && !error) {
      const teacherIds = [...new Set(data.map(e => e.classrooms?.teacher_id).filter(Boolean))];
      console.log('Fetching teacher names for teacherIds:', teacherIds);
      
      if (teacherIds.length > 0) {
        const { data: teachersData, error: teachersError } = await supabase
          .from('users')
          .select('id, name')
          .in('id', teacherIds);
        
        if (teachersError) {
          console.error('Error fetching teacher names:', teachersError);
        } else {
          console.log('Fetched teacher data:', teachersData);
        }
        
        // Add teacher names to classrooms
        if (teachersData && teachersData.length > 0) {
          const teacherMap = new Map(teachersData.map(t => [t.id, t.name]));
          data.forEach(enrollment => {
            if (enrollment.classrooms?.teacher_id) {
              const teacherName = teacherMap.get(enrollment.classrooms.teacher_id);
              enrollment.classrooms.teacher_name = teacherName;
              console.log(`Set teacher_name for classroom ${enrollment.classrooms.id}: ${teacherName}`);
            }
          });
        } else {
          console.warn('No teacher data returned, teacherIds were:', teacherIds);
        }
      }
    }
    
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
        dq_score_minimum: (() => {
          if (!dqScores || typeof dqScores !== 'object') return null;
          const values = Object.values(dqScores)
            .filter(v => typeof v === 'number' && !isNaN(v) && isFinite(v) && v >= 0 && v <= 1);
          return values.length > 0 ? Math.min(...values) : null;
        })()
      })
    return { data, error }
  },

  // Update student progress
  updateProgress: async (studentId, characterName, level, dqScores) => {
    console.log('db.updateProgress called with:', {
      studentId,
      characterName,
      level,
      dqScores,
      averageScore: (() => {
        if (!dqScores || typeof dqScores !== 'object') return null;
        const values = Object.values(dqScores)
          .filter(v => typeof v === 'number' && !isNaN(v) && isFinite(v) && v >= 0 && v <= 1);
        return values.length > 0 ? Math.min(...values) : null;
      })()
    });

    const { data, error } = await supabase
      .from('student_progress')
      .upsert({
        student_id: studentId,
        character_name: characterName,
        level,
        average_dq_score: (() => {
          if (!dqScores || typeof dqScores !== 'object') return null;
          const values = Object.values(dqScores)
            .filter(v => typeof v === 'number' && !isNaN(v) && isFinite(v) && v >= 0 && v <= 1);
          return values.length > 0 ? Math.min(...values) : null;
        })(),
        completed_at: new Date().toISOString()
      })
    
    console.log('db.updateProgress result:', { data, error });
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
