# How to Verify Research Tables Migration

After running `001_create_research_tables.sql`, follow these steps to verify everything was created correctly.

## Quick Verification (Recommended)

### Step 1: Run Verification Script

1. Open Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `002_verify_research_tables.sql`
3. Click "Run"
4. Review the output

**Expected Results:**
- ✅ 3 tables found (research_sessions, research_messages, research_code_mappings)
- ✅ 3 tables with RLS enabled
- ✅ 9+ indexes created
- ✅ 6+ RLS policies created

### Step 2: Manual Checks (Optional)

Run these individual queries if you want to check specific things:

#### Check Tables Exist
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name LIKE 'research_%';
```
**Expected:** Should return 3 rows

#### Check RLS Enabled
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename LIKE 'research_%';
```
**Expected:** All should show `rowsecurity = true`

#### Check Indexes
```sql
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
    AND tablename LIKE 'research_%';
```
**Expected:** Multiple indexes per table

## Testing Data Insert (Service Role Required)

### Step 3: Test Insert (Optional)

⚠️ **Note:** This requires service role key. Regular users will be blocked by RLS (which is correct!).

1. Use Supabase service role key (from Settings → API → service_role key)
2. Run `003_test_insert_research_data.sql`
3. Check that test data was inserted

**What this tests:**
- Can insert into research_code_mappings
- Can insert into research_sessions
- Can insert into research_messages
- Can query research data by research_code

## Common Issues

### Issue: "No rows returned" from verification script

**This is normal!** DDL statements (CREATE TABLE, etc.) don't return rows. The verification script will return results - check the output.

### Issue: "Permission denied" when trying to SELECT from research_code_mappings

**This is correct!** Regular users should NOT be able to query this table. This confirms RLS is working properly.

### Issue: Can't insert test data

**Check:**
1. Are you using service role key? (Required for inserts)
2. Do you have users in your users table?
3. Check error message for specific issue

## Verification Checklist

After running verification:

- [ ] Tables exist (3 tables)
- [ ] RLS enabled on all tables (3 tables)
- [ ] Indexes created (9+ indexes)
- [ ] Foreign keys exist (research_messages → research_sessions)
- [ ] RLS policies exist (6+ policies)
- [ ] Can insert test data (with service role)
- [ ] Cannot SELECT from research_code_mappings (with regular user - this is correct!)

## Next Steps

Once verification is complete:
1. ✅ Mark STEP 1 as complete
2. ⏭️ Proceed to STEP 2: Research Code Generation

## Troubleshooting

If something doesn't match expected results:

1. **Check Supabase logs** for any errors
2. **Review the migration file** to see what was supposed to be created
3. **Check if tables already existed** (might cause conflicts)
4. **Verify you're in the correct database** (dev vs production)

## Need Help?

If verification fails:
- Check error messages in Supabase SQL Editor
- Review the migration SQL for syntax errors
- Verify you have proper permissions in Supabase

