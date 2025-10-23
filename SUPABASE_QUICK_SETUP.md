# Quick Supabase Setup Guide

## 🚀 **Create New Supabase Project**

### **Step 1: Create Project**
1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Click **"New Project"**
4. Fill in:
   - **Name**: `decision-coach`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing**: Free tier

### **Step 2: Wait for Setup**
- Project creation takes 2-3 minutes
- You'll see a progress bar
- Don't close the browser tab

### **Step 3: Get Your Credentials**
Once ready, go to **Settings** → **API** and copy:
- **Project URL**
- **anon public key**

### **Step 4: Run Database Schema**
1. Go to **SQL Editor** in Supabase dashboard
2. Copy the contents of `supabase-schema.sql`
3. Paste and click **"Run"**

## 🎯 **Quick Test**

Once you have your credentials, create `.env.local`:

```bash
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
REACT_APP_USE_SUPABASE_AUTH=true
```

Then restart your React app and test!
