# Research Exports RLS Fix

## Issue Identified

The `research_exports` table shows as **"UNRESTRICTED"** in the Supabase table editor, meaning Row Level Security (RLS) is **not enabled**.

### Security Concern

The `research_exports` table contains:
- `requested_by UUID NOT NULL REFERENCES users(id)` - User identifier
- Export tracking information (who requested exports, when, what type)

**Without RLS:**
- Any user with database access could see all export requests
- Could reveal who is requesting data exports
- Privacy/security risk

### Why This Happened

The `research_exports` table was created in the original `supabase-schema.sql` file, but RLS was not enabled on it. The original schema enabled RLS on other tables but missed this one.

---

## Solution

A migration has been created to enable RLS and add appropriate policies:

**File:** `jamie-backend/migrations/006_enable_rls_research_exports.sql`

### What It Does:

1. **Enables RLS** on `research_exports` table
2. **Creates SELECT policy:** Users can only view their own export requests
3. **Creates INSERT policy:** Users can create their own export requests (if needed)

### Policy Details:

- **Users can SELECT:** Only their own export requests (`auth.uid() = requested_by`)
- **Users can INSERT:** Only create export requests for themselves
- **Service role:** Can access all records (for admin/export processing)
- **No UPDATE/DELETE:** Exports should not be modified once created

---

## How to Apply the Fix

### Option 1: Run SQL Migration in Supabase

1. Go to Supabase Dashboard → **SQL Editor**
2. Open `jamie-backend/migrations/006_enable_rls_research_exports.sql`
3. Copy and paste the SQL into the editor
4. Click **Run**
5. Verify the table now shows RLS enabled (should no longer say "UNRESTRICTED")

### Option 2: Verify Current Status

Run this query to check if RLS is already enabled:

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'research_exports';
```

**Expected:** `rowsecurity = true`

If it's already `true`, RLS is enabled (but policies might be missing).

### Option 3: Check Policies

To see what policies exist:

```sql
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'research_exports';
```

---

## Impact on IRB Compliance

### Good News:

✅ **This table is NOT part of our new IRB-compliant research implementation**

Our IRB-compliant research uses:
- `research_sessions` ✅ (RLS enabled)
- `research_messages` ✅ (RLS enabled)
- `research_code_mappings` ✅ (RLS enabled)

The `research_exports` table is:
- From the original schema
- Used for tracking export requests (metadata)
- Does NOT contain the actual research data

### However:

⚠️ **Still should be fixed** because:
- It contains user identifiers (`requested_by`)
- Without RLS, it exposes who requested exports
- Best practice: All tables with user data should have RLS enabled

---

## Verification

After running the migration, verify:

1. **Check RLS is enabled:**
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public' AND tablename = 'research_exports';
   ```
   Should show: `rowsecurity = true`

2. **Check policies exist:**
   ```sql
   SELECT policyname, cmd 
   FROM pg_policies
   WHERE schemaname = 'public' AND tablename = 'research_exports';
   ```
   Should show: 2 policies (SELECT and INSERT)

3. **In Supabase UI:**
   - Go to Table Editor
   - Check `research_exports` table
   - Should **NOT** show "UNRESTRICTED" tag anymore
   - Should show RLS is enabled (shield icon)

---

## Summary

- **Issue:** `research_exports` table missing RLS (shows "UNRESTRICTED")
- **Risk:** Low (table contains export metadata, not research data)
- **Fix:** Enable RLS and add policies (migration file created)
- **Priority:** Medium (should fix for security best practices, but not blocking IRB compliance)

The fix is quick and easy - just run the migration SQL in Supabase.

