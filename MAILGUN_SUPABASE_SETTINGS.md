# Mailgun SMTP Settings for Supabase

## ✅ Your Mailgun Domain
- **Domain:** `sandboxaf43c165ed9648989c9075bdde8283a3.mailgun.org`
- **API Key:** `[REDACTED_MAILGUN_API_KEY]`

---

## 📋 Exact Settings for Supabase

Go to **Supabase Dashboard → Authentication → Settings → SMTP Settings**

### Enable Custom SMTP:
- Toggle **"Enable Custom SMTP"** to **ON**

### Enter These Exact Values:

```
SMTP Host: smtp.mailgun.org
SMTP Port: 587
SMTP User: postmaster@sandboxaf43c165ed9648989c9075bdde8283a3.mailgun.org
SMTP Password: [REDACTED_MAILGUN_API_KEY]
Sender Email: postmaster@sandboxaf43c165ed9648989c9075bdde8283a3.mailgun.org
Sender Name: Decision Coach
```

### Step-by-Step:

1. **SMTP Host:** `smtp.mailgun.org`
2. **SMTP Port:** `587`
3. **SMTP User:** `postmaster@sandboxaf43c165ed9648989c9075bdde8283a3.mailgun.org`
4. **SMTP Password:** `[REDACTED_MAILGUN_API_KEY]`
5. **Sender Email:** `postmaster@sandboxaf43c165ed9648989c9075bdde8283a3.mailgun.org`
6. **Sender Name:** `Decision Coach` (or whatever you prefer)

7. **Click "Save"**

8. **Test Connection:**
   - Click **"Send Test Email"** button
   - Check your Supabase account email
   - You should receive a test email within a few seconds

---

## ⚠️ IMPORTANT: Sandbox Domain Limitation

**Your Mailgun domain is a SANDBOX domain**, which means:

### Only Authorized Recipients Can Receive Emails

Before users can receive confirmation emails, you must:

1. **Go to Mailgun Dashboard**
   - Navigate to **Sending** → **Authorized Recipients**

2. **Add Email Addresses**
   - Click **"Add Recipient"**
   - Enter email addresses that will receive emails (e.g., test accounts)
   - Click **"Add"**

3. **Recipients Must Confirm**
   - Mailgun will send a confirmation email to each recipient
   - They must click the confirmation link
   - **After confirming**, they can receive emails from your app

4. **For Testing:**
   - Add your own email address first
   - Confirm it via Mailgun's email
   - Then test account creation

### For Production (Later):

When ready for production, you'll need to:
- **Set up a custom domain** (your own domain)
- **Configure DNS records** in your domain registrar
- **Verify the domain** in Mailgun
- **Then you can send to anyone** (no recipient restrictions)

---

## ✅ Enable Email Confirmations

After SMTP is configured and tested:

1. **Still in Authentication → Settings**
2. **Find "Enable email confirmations"**
3. **Turn it ON** (enable)
4. **Save**

---

## 🧪 Testing Checklist

- [ ] Entered SMTP settings in Supabase
- [ ] Saved settings
- [ ] Sent test email from Supabase
- [ ] Received test email ✅
- [ ] Added authorized recipients in Mailgun (for testing)
- [ ] Confirmed recipient emails
- [ ] Enabled email confirmations in Supabase
- [ ] Created test account in app
- [ ] Received confirmation email ✅
- [ ] Clicked confirmation link ✅
- [ ] Account confirmed and can log in ✅

---

## 📝 Quick Reference

**Supabase SMTP Settings:**
- Host: `smtp.mailgun.org`
- Port: `587`
- User: `postmaster@sandboxaf43c165ed9648989c9075bdde8283a3.mailgun.org`
- Password: `[REDACTED_MAILGUN_API_KEY]`
- Sender: `postmaster@sandboxaf43c165ed9648989c9075bdde8283a3.mailgun.org`

**Mailgun Dashboard:**
- Domain: `sandboxaf43c165ed9648989c9075bdde8283a3.mailgun.org`
- Add recipients: **Sending → Authorized Recipients**

---

## 🚨 Security Reminder

- Your API key is in this file
- Consider rotating it after setup if this is in a public repo
- Never commit API keys to git
- Store securely (environment variables in production)

---

## Next Steps

1. **Enter the SMTP settings above in Supabase**
2. **Test the connection** (send test email)
3. **Add authorized recipients** in Mailgun (for testing)
4. **Enable email confirmations** in Supabase
5. **Test account creation** and email receipt

Good luck! 🚀

