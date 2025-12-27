# Run Production Database Migration

**Quick Guide:** Run this migration in your production Supabase instance

---

## 🚀 Quick Steps

1. **Go to Supabase Production Dashboard**
   - https://supabase.com/dashboard
   - Select your production project

2. **Open SQL Editor**
   - Click **SQL Editor** in left sidebar
   - Click **New query**

3. **Copy Migration SQL**
   - Open file: `jamie-backend/migrations/001_create_research_tables.sql`
   - Copy **entire contents** (all 225 lines)

4. **Paste and Run**
   - Paste into SQL Editor
   - Click **Run** button (or press Cmd/Ctrl + Enter)
   - ✅ Should see: "Success. No rows returned"

5. **Verify**
   - Run this query:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
     AND table_name LIKE 'research_%'
   ORDER BY table_name;
   ```
   - Should return 3 tables

---

## 📋 What This Migration Creates

- `research_sessions` - Stores anonymous research sessions
- `research_messages` - Stores chat messages with DQ scores
- `research_code_mappings` - Maps users to research codes (one-way)

**Security:**
- Row Level Security (RLS) enabled
- Service role only access for research queries
- No reverse lookup possible

---

## ⚠️ Important Notes

- **Run this in PRODUCTION Supabase** (not local/dev)
- **Backup first** if you have critical data (optional)
- **One-time operation** - safe to run multiple times (uses IF NOT EXISTS)

---

## ✅ Verification Query

After running migration, verify with:

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'research_%'
ORDER BY table_name;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename LIKE 'research_%'
ORDER BY tablename;
```

**Expected:** 3 tables, all with `rowsecurity = true`

---

**Ready?** Open Supabase dashboard and run the migration!

