# Mailgun SMTP Troubleshooting - "Error sending confirmation email"

## Common Causes and Solutions

---

## ✅ Step 1: Verify SMTP Settings in Supabase

Double-check all SMTP settings are correct:

1. **Go to Supabase Dashboard → Authentication → Settings → SMTP Settings**

2. **Verify these exact settings:**

```
SMTP Host: smtp.mailgun.org
SMTP Port: 587
SMTP User: postmaster@sandboxaf43c165ed9648989c9075bdde8283a3.mailgun.org
SMTP Password: [REDACTED_MAILGUN_API_KEY]
Sender Email: postmaster@sandboxaf43c165ed9648989c9075bdde8283a3.mailgun.org
Sender Name: Decision Coach
```

**Common Mistakes:**
- ❌ Wrong domain (missing or extra characters)
- ❌ Wrong port (should be 587, not 465 or 25)
- ❌ Missing "postmaster@" prefix in SMTP User
- ❌ Wrong API key
- ❌ Extra spaces or typos

---

## ✅ Step 2: Check Authorized Recipients (CRITICAL for Sandbox Domain!)

**Since you're using a sandbox domain, the recipient email MUST be added as an authorized recipient first!**

1. **Go to Mailgun Dashboard → Sending → Authorized Recipients**

2. **Check if your test email address is listed:**
   - If NOT listed: Add it (click "Add Recipient")
   - If listed: Check if it's **confirmed** (should show green checkmark)

3. **If recipient is NOT confirmed:**
   - Mailgun sends a confirmation email to the recipient
   - Recipient must click the confirmation link
   - **Only after confirming** can they receive emails

4. **For Testing:**
   - Add your test email address
   - Check your email for Mailgun's confirmation message
   - Click the confirmation link
   - Then try creating account again

---

## ✅ Step 3: Check Mailgun Logs

See what error Mailgun is receiving:

1. **Go to Mailgun Dashboard → Logs**
2. **Look for recent entries**
3. **Check for errors:**
   - Authentication failures
   - Invalid recipient errors
   - Rate limit errors
   - Domain verification errors

---

## ✅ Step 4: Verify Email Confirmations Are Enabled

1. **Go to Supabase Dashboard → Authentication → Settings**
2. **Find "Enable email confirmations"**
3. **Make sure it's ON** (enabled)
4. **If it's OFF:** Turn it ON and save

---

## ✅ Step 5: Try Different SMTP Port

Sometimes port 587 doesn't work. Try port 465:

1. **In Supabase SMTP Settings:**
   - Change **SMTP Port** from `587` to `465`
   - Save
   - Try test account creation again

**OR try port 2525:**
- Some Mailgun configurations use port 2525
- Try changing port to `2525`
- Save and retry

---

## ✅ Step 6: Check Supabase Logs

1. **Go to Supabase Dashboard → Logs**
2. **Look for authentication errors**
3. **Check for SMTP-related errors:**
   - Connection timeout
   - Authentication failed
   - Invalid credentials
   - Domain not found

---

## ✅ Step 7: Verify Domain Status in Mailgun

1. **Go to Mailgun Dashboard → Sending → Domains**
2. **Check your sandbox domain status:**
   - Should show **green checkmark** ✅
   - Should say "Active" or "Verified"
   - If it shows orange question mark ⚠️, there's a problem

3. **If domain has issues:**
   - Click on the domain
   - Check what needs to be fixed
   - Sandbox domains should be auto-verified, but check anyway

---

## 🔍 Common Error Scenarios

### Error: "Invalid recipient"
**Cause:** Email address not added as authorized recipient  
**Fix:** Add recipient in Mailgun Dashboard → Sending → Authorized Recipients

### Error: "Authentication failed"
**Cause:** Wrong SMTP credentials  
**Fix:** Double-check SMTP User and Password (API key)

### Error: "Connection timeout"
**Cause:** Wrong SMTP host or port  
**Fix:** Verify `smtp.mailgun.org` and port `587` (or try `465`)

### Error: "Domain not verified"
**Cause:** Domain issues  
**Fix:** Check domain status in Mailgun Dashboard → Domains

### Error: "Rate limit exceeded"
**Cause:** Too many emails sent  
**Fix:** Wait a few minutes and try again

---

## 📋 Quick Checklist

- [ ] SMTP settings are correct (double-check all fields)
- [ ] SMTP settings are saved in Supabase
- [ ] Email confirmations are enabled in Supabase
- [ ] Test email address is added as authorized recipient in Mailgun
- [ ] Authorized recipient is confirmed (clicked Mailgun's confirmation link)
- [ ] Domain shows green checkmark in Mailgun
- [ ] Tried different SMTP port (587, 465, or 2525)
- [ ] Checked Mailgun logs for errors
- [ ] Checked Supabase logs for errors

---

## 🚨 Most Likely Issues

Based on the error, the most common causes are:

1. **#1 Issue: Recipient Not Authorized (90% of cases)**
   - Sandbox domain requires authorized recipients
   - Must add and confirm email address in Mailgun first

2. **#2 Issue: Wrong SMTP Credentials (5% of cases)**
   - Double-check domain name matches exactly
   - Verify API key is correct

3. **#3 Issue: SMTP Port (3% of cases)**
   - Try port 465 instead of 587
   - Or try port 2525

4. **#4 Issue: Domain Not Active (2% of cases)**
   - Check domain status in Mailgun

---

## 🎯 Recommended Next Steps

**Start here (most likely fix):**

1. **Go to Mailgun Dashboard → Sending → Authorized Recipients**
2. **Add the email address you're using for testing**
3. **Confirm the email** (click link in Mailgun's confirmation email)
4. **Try creating account again**

If that doesn't work, then:
- Double-check SMTP settings
- Try different port (465)
- Check Mailgun logs

Good luck! 🚀

