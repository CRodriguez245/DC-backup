# Supabase Troubleshooting Guide

## 🔧 **Fix Authentication Issues (No Paid Tier Needed)**

### **Step 1: Check Database Schema**
1. Go to Supabase dashboard → **SQL Editor**
2. Run this query to check if tables exist:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```
3. If no tables, run the `supabase-schema.sql` file

### **Step 2: Disable Email Confirmation**
1. Go to **Authentication** → **Settings**
2. Turn **OFF** "Enable email confirmations"
3. Turn **OFF** "Enable phone confirmations"

### **Step 3: Check RLS Policies**
1. Go to **Table Editor** → **users** table
2. Check if RLS is enabled (red shield icon)
3. If enabled, we might need to adjust policies

### **Step 4: Test with Simple User Creation**
Try creating a user with just email/password first, then add profile data.

## 💰 **Paid Tier Benefits**

### **Free Tier Limitations:**
- 2 requests/second
- 500 requests/hour
- 500MB database
- 2GB bandwidth

### **Pro Tier ($25/month):**
- 100 requests/second
- 10,000 requests/hour
- 8GB database
- 100GB bandwidth
- No rate limiting for development

## 🎯 **Recommendation**

**For development/testing**: Free tier is fine once we fix the configuration issues.

**For production**: Consider Pro tier for better performance and no rate limits.
