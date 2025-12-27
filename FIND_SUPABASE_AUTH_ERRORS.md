# How to Find Authentication Errors in Supabase Logs

## You're in the Right Place!

You're in the Supabase **Logs & Analytics** dashboard. Here's where to find authentication errors:

---

## ✅ Step 1: Click on "Auth" in Left Sidebar

**Currently you're on:** PostgREST (highlighted)

**You need:** Auth logs (for signup/authentication errors)

1. **Look at the left sidebar**
2. **Find "Auth"** under the **COLLECTIONS** section
3. **Click on "Auth"**
4. This will show authentication-related logs

---

## ✅ Step 2: Check Recent Auth Logs

After clicking "Auth":

1. **The query editor will auto-populate** with an auth logs query
2. **Look at the results** - should show recent authentication events
3. **Look for entries with errors** (red indicators, error messages)
4. **Check timestamps** - look for logs around when you tried to sign up

---

## ✅ Step 3: Use Query to Find Errors (Alternative)

If you want to query specifically for errors:

1. **In the query editor, try:**
   ```sql
   select
   cast(timestamp as datetime) as timestamp,
   event_message, 
   metadata
   from auth_logs
   where event_message ilike '%error%' or event_message ilike '%500%'
   order by timestamp desc
   limit 20
   ```

2. **Click "Run"**
3. **Look at the results** - should show error messages

---

## ✅ Step 4: Check for SMTP Errors

To specifically look for SMTP/email errors:

1. **Try this query:**
   ```sql
   select
   cast(timestamp as datetime) as timestamp,
   event_message, 
   metadata
   from auth_logs
   where event_message ilike '%smtp%' 
      or event_message ilike '%email%'
      or event_message ilike '%mail%'
   order by timestamp desc
   limit 20
   ```

2. **Click "Run"**
3. **Look for SMTP connection errors**

---

## 🔍 What to Look For

### Error Messages You Might See:

1. **"SMTP connection failed"**
   - SMTP settings wrong
   - Wrong host/port

2. **"Authentication failed"**
   - Wrong SMTP username/password
   - API key incorrect

3. **"Failed to send email"**
   - SMTP not configured
   - Email service issue

4. **"Internal server error" or "500"**
   - Generic server error
   - Check metadata for details

5. **"Invalid SMTP configuration"**
   - SMTP settings incomplete
   - Missing required fields

---

## 📋 Quick Steps Summary

1. **Click "Auth" in left sidebar** (not PostgREST)
2. **Check recent logs** - look for errors around signup time
3. **Or run query:** Look for errors containing "error", "500", "smtp", "email"
4. **Read the error message** - this tells us what's wrong
5. **Share the error message** - so we can fix it!

---

## 🎯 Expected Result

After clicking "Auth" and checking recent logs, you should see:
- ✅ Recent authentication events
- ❌ Error messages (if any)
- 📊 Timestamps showing when errors occurred

The error message will tell us exactly what's wrong with SMTP configuration!

