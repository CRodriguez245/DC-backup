# How to Send Test Email from Supabase

## Option 1: Use Supabase Test Email Button (Easiest)

### Steps:

1. **Go to Supabase Dashboard**
   - Navigate to your project

2. **Go to Authentication → Settings**
   - In the left sidebar, click **"Authentication"**
   - Then click **"Settings"** (or it might be under Authentication settings)

3. **Scroll to SMTP Settings**
   - Find the **"SMTP Settings"** section
   - You should have already entered your Mailgun credentials here

4. **Look for "Send Test Email" Button**
   - After saving your SMTP settings, there should be a button like:
     - **"Send Test Email"**
     - **"Test SMTP Connection"**
     - **"Test Email"**
   - Usually located near the SMTP configuration fields

5. **Click the Button**
   - Click "Send Test Email"
   - Supabase will send a test email to **your Supabase account email** (the email you used to sign up for Supabase)

6. **Check Your Email**
   - Check the inbox of your Supabase account email
   - The test email should arrive within a few seconds
   - ✅ If you receive it, SMTP is working correctly!

---

## Option 2: Test by Creating an Account (Alternative)

If you can't find the "Send Test Email" button, you can test by actually creating an account:

### Steps:

1. **First, make sure:**
   - ✅ SMTP settings are saved in Supabase
   - ✅ Email confirmations are enabled
   - ✅ Your email is added as authorized recipient in Mailgun
   - ✅ You've confirmed the authorized recipient email

2. **Go to Your App**
   - Open your application (or test environment)

3. **Create a Test Account**
   - Go to signup page
   - Use an email address that you've added as an authorized recipient in Mailgun
   - Fill out the signup form
   - Submit

4. **Check Email**
   - Check the email inbox you used for signup
   - You should receive a confirmation email
   - ✅ If you receive it, SMTP is working!

---

## Option 3: Check Supabase Logs

If emails aren't sending, check Supabase logs:

1. **Go to Supabase Dashboard**
2. **Go to Logs** (in left sidebar)
3. **Look for authentication logs**
   - Check for any SMTP errors
   - Check for email sending errors

---

## What If Test Email Button Isn't There?

Some Supabase versions might not have a test email button. In that case:

### Alternative Testing Methods:

1. **Test via Account Creation** (Option 2 above)
   - Most reliable way to test
   - Uses the actual email confirmation flow

2. **Check Mailgun Dashboard**
   - Go to Mailgun Dashboard → **Logs**
   - Look for recent email attempts
   - See if emails are being sent successfully

3. **Verify SMTP Settings Manually**
   - Double-check all SMTP credentials are correct
   - Verify domain name matches exactly
   - Check API key is correct

---

## Expected Results

### ✅ Success (SMTP Working):
- Test email arrives in your inbox
- Email comes from: `postmaster@sandboxaf43c165ed9648989c9075bdde8283a3.mailgun.org`
- Email arrives within 5-30 seconds
- No errors in Supabase logs

### ❌ Failure (SMTP Not Working):
- No email received
- Error message in Supabase
- Check:
  - SMTP settings are correct
  - Authorized recipients are added in Mailgun
  - Email confirmations are enabled
  - Check spam folder

---

## Quick Checklist Before Testing

- [ ] SMTP settings saved in Supabase
- [ ] Email confirmations enabled in Supabase
- [ ] Authorized recipient added in Mailgun
- [ ] Authorized recipient confirmed (clicked Mailgun's confirmation email)
- [ ] Using correct email address (the one you added as authorized recipient)

---

## Troubleshooting

### Email Not Received:
1. **Check Spam Folder** - Sometimes test emails go to spam
2. **Verify Authorized Recipient** - Must be added and confirmed in Mailgun
3. **Check Mailgun Logs** - Go to Mailgun Dashboard → Logs → See delivery status
4. **Verify SMTP Settings** - Double-check all credentials in Supabase
5. **Wait a Few Minutes** - Sometimes emails take time to process

### SMTP Connection Error:
1. **Check SMTP Port** - Try 587 (or 465 with SSL)
2. **Verify Domain** - Must match exactly (sandboxaf43c165ed9648989c9075bdde8283a3.mailgun.org)
3. **Check API Key** - Must be correct
4. **Try Different Port** - Sometimes port 465 works better

---

## Summary

**Easiest Way:**
1. Go to Supabase → Authentication → Settings → SMTP Settings
2. Look for "Send Test Email" button
3. Click it
4. Check your Supabase account email inbox

**Alternative:**
1. Create a test account in your app
2. Check for confirmation email
3. If received, SMTP is working!

Good luck! 🚀

