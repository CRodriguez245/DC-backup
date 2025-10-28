# Check Your Supabase Database Schema

## 🔍 **Verify Database Setup**

### **Step 1: Check if Tables Exist**
1. Go to your Supabase dashboard
2. Click **"Table Editor"** in the left sidebar
3. You should see these tables:
   - `users`
   - `teachers` 
   - `classrooms`
   - `enrollments`
   - `sessions`
   - `messages`
   - `student_progress`
   - `dq_analytics`

### **Step 2: If Tables Don't Exist**
1. Go to **"SQL Editor"** in Supabase dashboard
2. Copy the contents of `supabase-schema.sql`
3. Paste and click **"Run"**

### **Step 3: Check Authentication Settings**
1. Go to **"Authentication" → "Settings"**
2. Make sure **"Enable email confirmations"** is **OFF** (for testing)
3. Make sure **"Enable phone confirmations"** is **OFF**

### **Step 4: Check Row Level Security**
1. Go to **"Table Editor"**
2. Click on the `users` table
3. Check if RLS (Row Level Security) is enabled
4. If it is, we might need to adjust the policies

## 🎯 **Quick Test**

Try creating a user again after checking these settings. The 429 error should resolve after a few minutes.
