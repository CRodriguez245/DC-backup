# Mailgun Setup for Supabase Email Confirmations

## ✅ Step 1: You Have Your API Key
- API Key: `[REDACTED_MAILGUN_API_KEY]`
- ⚠️ **Keep this secure!** Never commit to git or share publicly.

---

## 📋 Next Steps to Complete Setup

### Step 2: Get Your Mailgun Domain (Required)

1. **Log into Mailgun Dashboard**
   - Go to [app.mailgun.com](https://app.mailgun.com)
   
2. **Find Your Domain**
   - Go to **Sending** → **Domains**
   - You should see a domain (either a verified one or a sandbox domain)
   - **Sandbox domain** (for testing): Looks like `sandbox12345.mailgun.org`
   - **Custom domain** (for production): Your own domain (requires DNS setup)

3. **Note Your Domain Name** - You'll need this for SMTP

### Step 3: Get SMTP Credentials (Different from API Key!)

**Option A: Use Mailgun SMTP Credentials**

1. In Mailgun Dashboard, go to **Sending** → **Domain Settings**
2. Click on your domain
3. Go to **SMTP credentials** section
4. **Create SMTP credentials** (if not already created):
   - Click "Create SMTP credentials"
   - Enter a name (e.g., "Supabase")
   - Click "Create"
   - **Save these credentials:**
     - SMTP Username
     - SMTP Password (different from API key!)

**Option B: Use API Key as SMTP Password (Simpler)**

Mailgun also allows using:
- **SMTP Username:** `postmaster@YOUR_DOMAIN.mailgun.org`
- **SMTP Password:** Your API key (`[REDACTED_MAILGUN_API_KEY]`)

**Note:** Replace `YOUR_DOMAIN` with your actual Mailgun domain (e.g., `sandbox12345.mailgun.org`)

---

### Step 4: Configure Supabase SMTP Settings

1. **Go to Supabase Dashboard**
   - Navigate to your project
   
2. **Go to Authentication → Settings**
   - Scroll down to **"SMTP Settings"**
   
3. **Enable Custom SMTP**
   - Toggle **"Enable Custom SMTP"** to ON

4. **Enter Mailgun SMTP Credentials:**

```
SMTP Host: smtp.mailgun.org
SMTP Port: 587 (or 465 for SSL)
SMTP User: postmaster@YOUR_DOMAIN.mailgun.org
           (Replace YOUR_DOMAIN with your Mailgun domain)
SMTP Password: [REDACTED_MAILGUN_API_KEY]
Sender Email: postmaster@YOUR_DOMAIN.mailgun.org
              (Use your Mailgun domain email)
Sender Name: Decision Coach (or your app name)
```

**Example** (if your domain is `sandbox12345.mailgun.org`):
```
SMTP Host: smtp.mailgun.org
SMTP Port: 587
SMTP User: postmaster@sandbox12345.mailgun.org
SMTP Password: [REDACTED_MAILGUN_API_KEY]
Sender Email: postmaster@sandbox12345.mailgun.org
Sender Name: Decision Coach
```

5. **Click "Save"**

6. **Test the Connection**
   - Click **"Send Test Email"** button
   - Check your Supabase account email
   - If you receive it, ✅ SMTP is working!

---

### Step 5: Enable Email Confirmations

1. **Still in Authentication → Settings**
2. **Find "Enable email confirmations"**
3. **Turn it ON** (enable)
4. **Save**

---

### Step 6: Configure Email Templates (Optional)

1. **Go to Authentication → Email Templates**
2. **Review the templates:**
   - **Confirm signup** - Email users receive when signing up
   - **Magic Link** - For passwordless login
   - **Change Email Address** - When email is changed
   - **Reset Password** - Password reset emails

3. **Customize if desired** (or use defaults)

4. **Important:** Make sure redirect URLs are correct:
   - For development: `http://localhost:3000`
   - For production: `https://yourdomain.com`

---

### Step 7: Test Account Creation

1. **Try creating a new account** in your app
2. **Check email** (may take a few seconds)
3. **Click confirmation link**
4. **✅ Should work!**

---

## 🔍 What You Need to Provide Me

To complete the setup, I need:

1. **Your Mailgun Domain:**
   - What domain shows in Mailgun Dashboard?
   - Is it a sandbox domain (like `sandbox12345.mailgun.org`)?
   - Or a custom domain?

2. **SMTP Credentials:**
   - Did you create separate SMTP credentials?
   - Or are you using the API key method?

---

## ⚠️ Important Notes

### Sandbox Domain Limitations:
- **Sandbox domains** can only send to **authorized recipients**
- You must add recipient emails in Mailgun Dashboard:
  - Go to **Sending** → **Authorized Recipients**
  - Add email addresses you want to test with
  - They'll receive a confirmation email from Mailgun
  - After confirming, they can receive emails

### Custom Domain (Production):
- Requires DNS setup (more complex)
- Can send to anyone (no recipient restrictions)
- Better for production

### Free Tier Limits:
- **5,000 emails/month** for first 3 months
- Then **1,000 emails/month** free
- Perfect for signup confirmations (shouldn't exceed this)

---

## 🚨 Security Reminder

**Never commit your API key to git!**
- It's already exposed here (in this conversation)
- Consider **rotating the key** after setup if this was exposed publicly
- Store credentials securely (use environment variables if needed)

---

## Quick Checklist

- [ ] Have Mailgun account ✅
- [ ] Have API key ✅
- [ ] Find Mailgun domain (in dashboard)
- [ ] Get SMTP credentials (or use API key method)
- [ ] Configure Supabase SMTP settings
- [ ] Test SMTP connection
- [ ] Enable email confirmations in Supabase
- [ ] Test account creation and email receipt
- [ ] If using sandbox: Add authorized recipients

---

## Need Help?

Just let me know:
1. **Your Mailgun domain name**
2. **If you're using sandbox or custom domain**

And I'll give you the exact SMTP settings to enter in Supabase!

