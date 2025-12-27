# Mailgun + Supabase Setup - Next Steps

## ✅ What You've Done
- ✅ Created Mailgun account
- ✅ Got API key
- ✅ Found sandbox domain
- ✅ Skipped custom domain setup

## 📋 What's Next - Step by Step

### Step 1: Configure SMTP in Supabase (5 minutes)

1. **Go to Supabase Dashboard**
   - Navigate to your project

2. **Go to Authentication → Settings**
   - Scroll down to find **"SMTP Settings"** section

3. **Enable Custom SMTP**
   - Toggle **"Enable Custom SMTP"** to **ON**

4. **Enter Mailgun SMTP Settings:**

```
SMTP Host: smtp.mailgun.org
SMTP Port: 587
SMTP User: postmaster@sandboxaf43c165ed9648989c9075bdde8283a3.mailgun.org
SMTP Password: [REDACTED_MAILGUN_API_KEY]
Sender Email: postmaster@sandboxaf43c165ed9648989c9075bdde8283a3.mailgun.org
Sender Name: Decision Coach
```

5. **Click "Save"**

6. **Test the Connection**
   - Click the **"Send Test Email"** button (if available)
   - This will send a test email to your Supabase account email
   - Check your email - you should receive it within a few seconds
   - ✅ If you receive it, SMTP is working!

---

### Step 2: Add Authorized Recipients in Mailgun (IMPORTANT!)

**Since you're using a sandbox domain, you can only send emails to authorized recipients.**

1. **Go to Mailgun Dashboard**
   - Navigate to **Sending** → **Authorized Recipients**

2. **Add Email Addresses**
   - Click **"Add Recipient"** or **"Add Authorized Recipient"**
   - Enter email addresses that will receive emails:
     - Your own email (for testing)
     - Test account emails
     - Any emails you want to test with
   - Click **"Add"** or **"Save"**

3. **Recipients Must Confirm**
   - Mailgun will send a confirmation email to each recipient
   - They must click the confirmation link in that email
   - **After confirming**, they can receive emails from your app

4. **For Testing:**
   - Add your own email first
   - Check your email for Mailgun's confirmation message
   - Click the confirmation link
   - ✅ Now you can receive test emails

---

### Step 3: Enable Email Confirmations in Supabase

1. **Still in Supabase Dashboard → Authentication → Settings**

2. **Find "Enable email confirmations"**
   - Scroll up from SMTP settings
   - Look for the toggle/checkbox

3. **Turn it ON** (enable)

4. **Save changes**

---

### Step 4: Test Account Creation (5 minutes)

1. **Go to your app** (or test environment)

2. **Try creating a new account**
   - Use an email address you added as an authorized recipient
   - Fill out the signup form
   - Submit

3. **Check Email**
   - You should receive a confirmation email
   - It may take a few seconds
   - Check spam folder if needed

4. **Click Confirmation Link**
   - Click the link in the email
   - Should redirect to your app
   - ✅ Account should be confirmed!

5. **Try Logging In**
   - Go to login page
   - Use the email and password you just created
   - ✅ Should work!

---

## 🎯 Quick Checklist

- [ ] Configured SMTP settings in Supabase
- [ ] Tested SMTP connection (received test email)
- [ ] Added authorized recipients in Mailgun
- [ ] Recipients confirmed their emails (clicked Mailgun's confirmation link)
- [ ] Enabled email confirmations in Supabase
- [ ] Tested account creation in app
- [ ] Received confirmation email from app
- [ ] Clicked confirmation link
- [ ] Successfully logged in with new account

---

## ⚠️ Troubleshooting

### SMTP Test Email Not Working:
- Double-check all SMTP settings (especially the domain name)
- Verify API key is correct
- Check Mailgun dashboard for any errors
- Try port 465 instead of 587 (with SSL)

### App Confirmation Emails Not Sending:
- Verify email confirmations are enabled in Supabase
- Check that recipient email is added and confirmed in Mailgun
- Check spam folder
- Check Mailgun dashboard → Logs for delivery status

### Recipient Not Receiving Emails:
- Must be added as authorized recipient in Mailgun
- Must confirm via Mailgun's confirmation email first
- Check Mailgun dashboard → Authorized Recipients → Status

---

## 📝 Summary

**Current Status:**
- ✅ Mailgun account ready
- ✅ Sandbox domain ready
- ⏳ Need to configure Supabase SMTP
- ⏳ Need to add authorized recipients
- ⏳ Need to enable email confirmations
- ⏳ Need to test

**Next Action:**
1. Configure SMTP in Supabase (Step 1 above)
2. Add authorized recipients (Step 2)
3. Enable email confirmations (Step 3)
4. Test! (Step 4)

Good luck! 🚀

