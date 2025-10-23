# Decision Coach - Supabase Integration Guide

## 🚀 **Integration Complete!**

Your Decision Coach app now supports both local authentication and Supabase authentication. Here's how to use it:

## 📋 **Setup Instructions**

### **1. Configure Environment Variables**

Create a `.env.local` file in your `jamie-ai-frontend` directory:

```bash
# Supabase Configuration
REACT_APP_SUPABASE_URL=your_supabase_project_url_here
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Feature flag to enable Supabase authentication
# Set to 'true' to use Supabase, 'false' or leave empty to use local authentication
REACT_APP_USE_SUPABASE_AUTH=false
```

### **2. Get Your Supabase Credentials**

1. Go to your Supabase dashboard
2. Click **Settings** → **API**
3. Copy your:
   - **Project URL** → `REACT_APP_SUPABASE_URL`
   - **anon public key** → `REACT_APP_SUPABASE_ANON_KEY`

### **3. Enable Supabase Authentication**

To switch to Supabase authentication, change your `.env.local`:

```bash
REACT_APP_USE_SUPABASE_AUTH=true
```

## 🔄 **How It Works**

### **Local Authentication (Default)**
- Uses existing `AuthService.js`
- Stores data in localStorage
- No database required
- Perfect for development and demos

### **Supabase Authentication (New)**
- Uses new `SupabaseAuthService.js`
- Stores data in Supabase database
- Real-time updates
- Production-ready with security

## 🎯 **Features Added**

### **✅ Authentication System**
- **Dual support**: Local + Supabase authentication
- **Seamless switching**: Environment variable controls which system to use
- **Backward compatibility**: Existing users continue to work

### **✅ Database Integration**
- **User profiles**: Stored in Supabase with proper security
- **Session tracking**: All coaching sessions saved to database
- **Progress tracking**: Student progress synced across devices
- **Teacher dashboards**: Real-time student data

### **✅ Security Features**
- **Row Level Security (RLS)**: Users can only see their own data
- **Teacher permissions**: Teachers can see their students' progress
- **Data anonymization**: Built-in research data protection

## 🧪 **Testing the Integration**

### **Test Local Authentication (Default)**
```bash
cd jamie-ai-frontend
npm start
# Visit http://localhost:3000
# Create account and test - uses localStorage
```

### **Test Supabase Authentication**
1. Set `REACT_APP_USE_SUPABASE_AUTH=true` in `.env.local`
2. Restart the development server
3. Create account and test - uses Supabase database

## 📊 **Database Schema**

Your Supabase database now includes:

- **`users`**: Student and teacher accounts
- **`teachers`**: Teacher-specific information
- **`classrooms`**: Teacher-created classes
- **`enrollments`**: Student-classroom relationships
- **`sessions`**: Coaching session records
- **`messages`**: Individual chat messages
- **`student_progress`**: Character completion tracking
- **`dq_analytics`**: Research data for IRB compliance

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **"Missing Supabase environment variables"**
   - Check your `.env.local` file
   - Ensure variables are named correctly

2. **"Authentication failed"**
   - Verify your Supabase credentials
   - Check if Supabase project is active

3. **"Database connection failed"**
   - Ensure you've run the SQL schema
   - Check Supabase project status

### **Debug Commands:**

```javascript
// In browser console:
window.debugAuth() // Shows current authentication state
```

## 🚀 **Next Steps**

1. **Test both authentication systems**
2. **Create sample users and sessions**
3. **Test teacher-student relationships**
4. **Verify data persistence**

## 📈 **Production Deployment**

When ready for production:

1. **Set `REACT_APP_USE_SUPABASE_AUTH=true`**
2. **Deploy to Vercel with environment variables**
3. **Test with real users**
4. **Monitor Supabase dashboard for usage**

## 🎉 **You're Ready!**

Your Decision Coach app now has:
- ✅ **Dual authentication systems**
- ✅ **Database integration**
- ✅ **Real-time updates**
- ✅ **Research compliance**
- ✅ **Production readiness**

**Start testing and let me know how it works!** 🚀
