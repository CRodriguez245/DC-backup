# Database Migrations

This directory contains SQL migration files for database schema changes.

## Migration Files

### 001_create_research_tables.sql
Creates IRB-compliant research data tables for anonymous storage of first Jamie chat sessions.

**Tables Created:**
- `research_sessions` - Anonymous research sessions
- `research_messages` - Chat messages for research sessions
- `research_code_mappings` - Code generation tracking (INSERT only, no SELECT)

**Security:**
- Row Level Security (RLS) enabled on all tables
- Service role access only for research data queries
- No reverse lookup possible (code → user blocked)

## Running Migrations

### Local/Dev Environment:
1. Open Supabase Dashboard → SQL Editor
2. Copy and paste migration SQL
3. Run the migration
4. Verify tables and RLS policies

### Production:
1. Review migration in dev first
2. Test thoroughly
3. Run in production Supabase SQL Editor
4. Verify in production

## Verification

After running migration, verify:
- [ ] Tables created successfully
- [ ] Indexes created
- [ ] RLS policies applied
- [ ] Constraints working
- [ ] Can insert test data (with service role)

## Rollback

If needed, to rollback this migration:
```sql
DROP TABLE IF EXISTS research_messages CASCADE;
DROP TABLE IF EXISTS research_sessions CASCADE;
DROP TABLE IF EXISTS research_code_mappings CASCADE;
DROP FUNCTION IF EXISTS update_research_sessions_updated_at() CASCADE;
```

