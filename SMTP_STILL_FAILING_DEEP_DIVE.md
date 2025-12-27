# SMTP Still Failing - Deep Dive Troubleshooting

## Still Getting 500 Error

Since SMTP is configured and you've tried different ports, let's dig deeper.

---

## 🔍 Step 1: Get Detailed SMTP Error Message

**This is the most important step - we need to see the exact error:**

1. **Go to Supabase Dashboard → Logs → Auth**

2. **Try creating an account again** (to generate a fresh error log)

3. **Immediately check the logs** - look for the most recent entry

4. **Look for detailed error messages like:**
   - "SMTP connection failed: ..."
   - "Authentication failed: ..."
   - "Connection timeout: ..."
   - "Invalid credentials: ..."
   - Any other SMTP-specific error

5. **The error message will tell us exactly what's wrong**

**Please share the detailed error message from the logs!**

---

## 🔍 Step 2: Check Mailgun Logs

See if Mailgun is even receiving connection attempts:

1. **Go to Mailgun Dashboard → Logs**

2. **Look for entries** around the time you tried to sign up

3. **Check for:**
   - Connection attempts
   - Authentication failures
   - Any errors

4. **If you see NOTHING in Mailgun logs:**
   - Supabase isn't reaching Mailgun (connection issue)
   - SMTP host/port wrong
   - Firewall blocking connection

5. **If you see authentication errors:**
   - Wrong SMTP credentials
   - API key invalid

---

## 🔍 Step 3: Verify SMTP Settings One More Time

Double-check everything matches exactly:

```
SMTP Host: smtp.mailgun.org
  (NOT mail.mailgun.org, NOT mailgun.org, just smtp.mailgun.org)

SMTP Port: 465 (or 587 or 2525 - whichever you're using)

SMTP User: postmaster@sandboxaf43c165ed9648989c9075bdde8283a3.mailgun.org
  (Must include "postmaster@" prefix)
  (Must match your exact Mailgun domain)

SMTP Password: [REDACTED_MAILGUN_API_KEY]
  (Your Mailgun API key)

Sender Email: postmaster@sandboxaf43c165ed9648989c9075bdde8283a3.mailgun.org
  (Should match SMTP User)

Sender Name: Decision Coach
  (Can be anything)
```

**Common mistakes:**
- Missing "postmaster@" prefix
- Wrong domain (extra/missing characters)
- API key has spaces or is truncated
- SMTP Host has extra characters

---

## 🔍 Step 4: Try Temporarily Disabling Email Confirmations

**To confirm SMTP is definitely the issue:**

1. **Go to:** Email → Templates tab
2. **Click "Confirm sign up"**
3. **Turn it OFF** (disable)
4. **Save**
5. **Try creating an account:**
   - ✅ If signup works → SMTP is definitely the problem
   - ❌ If still fails → Different issue (not SMTP)

6. **Re-enable after testing**

**This will tell us if the problem is SMTP or something else.**

---

## 🔍 Step 5: Check Mailgun API Key Status

1. **Go to Mailgun Dashboard → Settings → API Keys**

2. **Verify your API key is:**
   - Active/Valid
   - Not expired
   - Has mail send permissions

3. **If unsure, create a new API key:**
   - Create new key with "Mail Send" permissions
   - Update Supabase SMTP Password with new key
   - Save and retry

---

## 🔍 Step 6: Try Alternative: Use Mailgun's SMTP Username/Password Instead

Mailgun might require separate SMTP credentials (not API key):

1. **Go to Mailgun Dashboard → Sending → Domain Settings**

2. **Click on your sandbox domain**

3. **Look for "SMTP credentials" section**

4. **Create SMTP credentials:**
   - Click "Create SMTP credentials"
   - Enter a name (e.g., "Supabase")
   - Click "Create"
   - **Save the username and password**

5. **In Supabase SMTP Settings:**
   - Use the SMTP username (not postmaster@...)
   - Use the SMTP password (not API key)
   - Save and retry

---

## 🎯 Most Likely Issues at This Point

Since SMTP is configured and ports changed:

1. **Wrong SMTP User format (30%)**
   - Might need separate SMTP credentials instead of API key
   - Try creating SMTP credentials in Mailgun

2. **API Key Invalid/Expired (25%)**
   - Create new API key
   - Update Supabase with new key

3. **SMTP Host Wrong (20%)**
   - Verify it's exactly `smtp.mailgun.org`
   - No extra characters

4. **Connection Blocked (15%)**
   - Firewall/network issue
   - Mailgun service issue

5. **Settings Not Applied (10%)**
   - Re-save settings
   - Wait longer for propagation

---

## 📋 Action Items

**Do these in order:**

1. ✅ **Check Supabase Auth logs for detailed error** (MOST IMPORTANT!)
2. ✅ **Check Mailgun logs** (see if connection attempts are received)
3. ✅ **Try disabling email confirmations temporarily** (to confirm SMTP is issue)
4. ✅ **Try creating SMTP credentials in Mailgun** (instead of using API key)
5. ✅ **Create new API key if needed**

---

## 🚨 What We Need From You

**Please share:**

1. **Detailed error message from Supabase Auth logs** (after trying signup)
2. **What you see in Mailgun logs** (any connection attempts?)
3. **Result of disabling email confirmations** (does signup work then?)

These will tell us exactly what's wrong!

