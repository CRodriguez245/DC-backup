# Supabase 500 Internal Server Error - Troubleshooting

## Error Details

```
POST https://lcvxiasswxagwcxolzmi.supabase.co/auth/v1/signup 500 (Internal Server Error)
```

This is a **server-side error** from Supabase, which usually means:

1. **SMTP configuration issue** (most likely)
2. **Email confirmation settings conflict**
3. **Supabase authentication configuration problem**

---

## ✅ Step 1: Verify SMTP Settings in Supabase

**This is the most common cause of 500 errors during signup.**

1. **Go to Supabase Dashboard → Authentication → Settings → SMTP Settings**

2. **Check that Custom SMTP is enabled:**
   - Toggle should be **ON**
   - If it's OFF, enable it and enter settings

3. **Verify all SMTP settings are correct:**

```
SMTP Host: smtp.mailgun.org
SMTP Port: 587 (or try 465)
SMTP User: postmaster@sandboxaf43c165ed9648989c9075bdde8283a3.mailgun.org
SMTP Password: [REDACTED_MAILGUN_API_KEY]
Sender Email: postmaster@sandboxaf43c165ed9648989c9075bdde8283a3.mailgun.org
Sender Name: Decision Coach
```

4. **Double-check for typos:**
   - Domain name must match exactly
   - No extra spaces
   - API key is correct

5. **Click "Save"** again (even if already saved)

---

## ✅ Step 2: Try Different SMTP Port

Port 587 might not be working. Try port 465:

1. **In Supabase SMTP Settings:**
   - Change **SMTP Port** from `587` to `465`
   - Save
   - Try signup again

**OR try port 2525:**
- Change port to `2525`
- Save
- Try again

---

## ✅ Step 3: Temporarily Disable Email Confirmations

**To test if SMTP is the issue:**

1. **Go to Supabase Dashboard → Authentication → Settings**

2. **Find "Enable email confirmations"**

3. **Turn it OFF** (disable)

4. **Save**

5. **Try creating an account again**
   - If it works now, SMTP is definitely the issue
   - If it still fails, there's another problem

6. **After testing, re-enable email confirmations** once SMTP is fixed

---

## ✅ Step 4: Check Supabase Logs

See the actual error message:

1. **Go to Supabase Dashboard → Logs**

2. **Look for recent errors** around the time you tried to sign up

3. **Check for:**
   - SMTP connection errors
   - Authentication errors
   - Email sending failures

4. **The error message will tell us exactly what's wrong**

---

## ✅ Step 5: Verify Mailgun API Key Still Works

1. **Go to Mailgun Dashboard → Settings → API Keys**

2. **Verify the API key is still valid:**
   - `[REDACTED_MAILGUN_API_KEY]`
   - Make sure it hasn't been rotated/deleted

3. **If needed, create a new API key:**
   - Create new key
   - Update Supabase SMTP Password with new key
   - Save

---

## ✅ Step 6: Test SMTP Connection Directly

**If Supabase has a test button:**

1. **In Supabase SMTP Settings**, look for:
   - "Send Test Email" button
   - "Test Connection" button
   - "Verify SMTP" button

2. **Click it**

3. **See if it works:**
   - If test email works → SMTP is fine, problem is elsewhere
   - If test email fails → SMTP configuration is wrong

---

## 🔍 Common Causes of 500 Error

### Cause 1: SMTP Authentication Failed (Most Common)
**Symptoms:** 500 error, SMTP settings incorrect
**Fix:** Double-check SMTP User and Password

### Cause 2: SMTP Connection Timeout
**Symptoms:** 500 error, wrong host or port
**Fix:** Try different port (465 or 2525)

### Cause 3: Email Confirmations Enabled But SMTP Not Configured
**Symptoms:** 500 error, email confirmations ON but SMTP OFF
**Fix:** Either enable SMTP or disable email confirmations

### Cause 4: Invalid Sender Email
**Symptoms:** 500 error, sender email format wrong
**Fix:** Use format: `postmaster@sandboxaf43c165ed9648989c9075bdde8283a3.mailgun.org`

### Cause 5: Mailgun Rate Limit
**Symptoms:** 500 error, too many requests
**Fix:** Wait a few minutes and try again

---

## 🎯 Quick Diagnostic Steps

**Run these in order:**

1. **Check Supabase SMTP Settings:**
   - ✅ Custom SMTP enabled?
   - ✅ All fields filled correctly?
   - ✅ Saved?

2. **Try different SMTP port:**
   - Try 465 instead of 587
   - Or try 2525

3. **Temporarily disable email confirmations:**
   - Turn OFF email confirmations
   - Try signup
   - If works → SMTP issue confirmed

4. **Check Supabase Logs:**
   - See actual error message
   - This tells us exactly what's wrong

5. **Test SMTP connection:**
   - Use test email button if available
   - Or verify in Mailgun logs

---

## 📋 Quick Fix Checklist

- [ ] SMTP settings are correct in Supabase
- [ ] SMTP settings are saved
- [ ] Tried different SMTP port (465 or 2525)
- [ ] Checked Supabase logs for actual error
- [ ] Temporarily disabled email confirmations (to test)
- [ ] Verified Mailgun API key is valid
- [ ] Tested SMTP connection if possible

---

## 🚨 Most Likely Fix

**Based on the 500 error, try this first:**

1. **Go to Supabase → Authentication → Settings → SMTP Settings**

2. **Double-check SMTP User:**
   - Should be: `postmaster@sandboxaf43c165ed9648989c9075bdde8283a3.mailgun.org`
   - Make sure it matches exactly

3. **Try changing SMTP Port:**
   - From `587` to `465`
   - Save and retry

4. **Check Supabase Logs:**
   - Go to Logs section
   - See what the actual error message says
   - This is the key to fixing it!

---

## Next Steps

1. **Check Supabase Logs first** - This will show the exact error
2. **Try changing SMTP port to 465**
3. **Temporarily disable email confirmations** to test
4. **Share the error message from logs** - That will help us fix it faster!

The logs will tell us exactly what's wrong! 🔍

