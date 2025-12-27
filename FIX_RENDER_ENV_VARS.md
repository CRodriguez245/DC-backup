# Fix Render Environment Variables

**Issue:** Deployment failed because Supabase environment variables aren't set in Render.

**Fix Applied:** Code updated to use lazy initialization (better error handling)

**Action Required:** Set environment variables in Render

---

## 🔧 Quick Fix: Set Environment Variables in Render

### Step 1: Go to Render Dashboard

1. Go to https://dashboard.render.com
2. Find your `jamie-backend` service
3. Click on it

### Step 2: Add Environment Variables

1. Click **Environment** tab
2. Click **Add Environment Variable** button
3. Add these two variables:

**Variable 1:**
- **Key:** `SUPABASE_URL`
- **Value:** `https://lcvxiasswxagwcxolzmi.supabase.co`
- Click **Save**

**Variable 2:**
- **Key:** `SUPABASE_SERVICE_ROLE_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjdnhpYXNzd3hhZ3djeG9sem1pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTA4MzQxNywiZXhwIjoyMDc2NjU5NDE3fQ.tmANJk4Payy9YdiQTGlTvp8o9_kCFNnbFLzOBfAInXE`
- Click **Save**

### Step 3: Service Will Auto-Redeploy

- Render will automatically redeploy when you save environment variables
- Wait 2-3 minutes for deployment to complete
- Check **Deploys** tab to see status

---

## ✅ Verification

After deployment completes:

1. **Check Deploy Status:**
   - Render Dashboard → Deploys tab
   - Should show "Live" status

2. **Check Logs:**
   - Render Dashboard → Logs tab
   - Should NOT see "supabaseUrl is required" error
   - Should see "Server running on http://localhost:3001" (or similar)

3. **Test Endpoint:**
   ```bash
   curl -X POST https://jamie-backend.onrender.com/chat \
     -H "Content-Type: application/json" \
     -d '{"message": "test", "user_id": "test", "session_id": "test", "character": "jamie"}'
   ```
   - Should return 200 status

---

## 🔍 How to Get Supabase Credentials (If Needed)

If you need to find your Supabase credentials:

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **service_role key** (secret) → `SUPABASE_SERVICE_ROLE_KEY`

---

## 📝 Notes

- The code fix makes it so the error happens at runtime (when functions are called) rather than at module load time
- This gives better error messages and allows the server to start even if env vars are missing
- However, you still need to set the env vars for the research features to work

---

**After setting env vars, Render will redeploy automatically!**

