# SMTP Configured But Still Failing - Troubleshooting

## Situation

✅ SMTP is configured in Supabase  
❌ Still getting "Error sending confirmation email"

---

## 🔧 Troubleshooting Steps

### Step 1: Verify SMTP Settings Are Actually Saved

1. **Go to:** SMTP Settings tab
2. **Verify all fields are filled:**
   - SMTP Host
   - SMTP Port
   - SMTP User
   - SMTP Password
   - Sender Email
   - Sender Name

3. **Check if "Custom SMTP" toggle is ON** (enabled)

4. **Click "Save" again** (even if already saved)

5. **Wait 30-60 seconds** for settings to apply

6. **Try signup again**

---

### Step 2: Try Different SMTP Port

**Port 587 might be blocked. Try port 465:**

1. **In SMTP Settings:**
   - Change **SMTP Port** from `587` to `465`
   - Keep everything else the same
   - Click "Save"

2. **Wait 30 seconds**

3. **Try signup again**

**If 465 doesn't work, try port 2525:**
- Change to `2525`
- Save and retry

---

### Step 3: Check for Test Email Button

1. **In SMTP Settings page, look for:**
   - "Send Test Email" button
   - "Test Connection" button
   - "Verify SMTP" button

2. **If you find one, click it:**
   - This will test if SMTP is working
   - If test fails, SMTP configuration is wrong
   - If test succeeds, problem is elsewhere

---

### Step 4: Double-Check Mailgun Credentials

**Verify these are correct:**

1. **SMTP User:** `postmaster@sandboxaf43c165ed9648989c9075bdde8283a3.mailgun.org`
   - Must match your Mailgun domain exactly

2. **SMTP Password:** `[REDACTED_MAILGUN_API_KEY]`
   - This is your Mailgun API key
   - Verify it's still valid in Mailgun Dashboard → Settings → API Keys

3. **SMTP Host:** `smtp.mailgun.org`
   - Must be exactly this (not `mail.mailgun.org` or other variations)

4. **Sender Email:** Should match SMTP User
   - `postmaster@sandboxaf43c165ed9648989c9075bdde8283a3.mailgun.org`

---

### Step 5: Check Mailgun Dashboard for Errors

1. **Go to Mailgun Dashboard → Logs**
2. **Look for recent entries** around the time you tried to sign up
3. **Check for errors:**
   - Authentication failures
   - Connection errors
   - Invalid credentials

4. **This will tell you what Mailgun is seeing**

---

### Step 6: Check Supabase Logs for Detailed SMTP Error

1. **Go to Supabase Dashboard → Logs → Auth**
2. **Look for more detailed error messages:**
   - "SMTP connection failed"
   - "Authentication failed"
   - "Connection timeout"
   - Any other SMTP-specific errors

3. **The detailed error will tell us exactly what's wrong**

---

### Step 7: Temporarily Disable Email Confirmations (Test)

**To confirm SMTP is the issue:**

1. **Go to:** Email → Templates tab
2. **Click "Confirm sign up"**
3. **Turn it OFF** (disable)
4. **Save**
5. **Try creating an account:**
   - If signup works → SMTP is definitely the problem
   - If still fails → Different issue

6. **Re-enable after testing**

---

## 🎯 Most Likely Issues

Based on configured SMTP but still failing:

1. **Wrong SMTP Port (40%)**
   - Try 465 instead of 587
   - Or try 2525

2. **Settings Not Saved Properly (30%)**
   - Re-save settings
   - Wait for them to apply

3. **SMTP Authentication Failing (20%)**
   - Wrong API key
   - Wrong SMTP User format

4. **Connection Timeout (10%)**
   - Network/firewall issue
   - Mailgun service issue

---

## 📋 Quick Checklist

- [ ] SMTP settings are saved (clicked "Save")
- [ ] Custom SMTP toggle is ON
- [ ] Tried different SMTP port (465 or 2525)
- [ ] Verified Mailgun API key is correct
- [ ] Checked Mailgun logs for errors
- [ ] Checked Supabase logs for detailed SMTP errors
- [ ] Tried test email button (if available)
- [ ] Temporarily disabled email confirmations to test

---

## 🚨 Quick Test

**Fastest way to confirm:**

1. **Change SMTP port to 465**
2. **Save**
3. **Wait 30 seconds**
4. **Try signup**

If that doesn't work:
- Check Mailgun logs
- Check Supabase logs for detailed error
- Share the detailed error message

Try changing the port to 465 first - that fixes many cases!

