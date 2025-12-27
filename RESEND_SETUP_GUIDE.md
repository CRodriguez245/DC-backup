# Resend Setup for Supabase Email Confirmations

## Why Resend?

✅ **Developer-friendly** - Better documentation  
✅ **Easy setup** - Simpler than Mailgun  
✅ **Free tier** - 3,000 emails/month  
✅ **Good Supabase integration** - Works well together  
✅ **Modern API** - Clean interface  

---

## 📋 Step 1: Create Resend Account

1. **Go to [resend.com](https://resend.com)**

2. **Click "Sign Up" or "Get Started"**

3. **Sign up:**
   - Use your email
   - Create password
   - Verify your email (if required)

4. **You'll be taken to the dashboard**

---

## 📋 Step 2: Get Your API Key

1. **In Resend Dashboard, look for:**
   - **"API Keys"** in the sidebar
   - Or **"Settings" → "API Keys"**
   - Or click your profile → **"API Keys"**

2. **Create a new API key:**
   - Click **"Create API Key"** or **"Add API Key"**
   - Name it: "Supabase Email Confirmations"
   - Select permissions: **"Sending access"** or **"Full access"**
   - Click **"Create"** or **"Add"**

3. **COPY THE API KEY IMMEDIATELY**
   - ⚠️ You'll only see it once!
   - Store it securely

---

## 📋 Step 3: Add and Verify Domain (Optional for Testing)

**Resend requires a verified domain, but for testing you can use their test domain:**

### Option A: Use Resend Test Domain (Quick - For Testing)

1. **In Resend Dashboard, look for "Domains"**

2. **Resend provides a test domain** - check if one is automatically created

3. **Or look for "Use test domain" or "Test mode"**

### Option B: Add Your Own Domain (For Production)

1. **Go to "Domains" in Resend**

2. **Click "Add Domain"**

3. **Enter your domain** (e.g., `decisioncoach.com`)

4. **Add DNS records** (Resend will show you what to add)

5. **Wait for verification** (can take a few minutes)

---

## 📋 Step 4: Get Your Domain

**After adding/verifying domain:**

1. **Note your sending domain:**
   - If using test domain: Something like `onboarding.resend.dev` or similar
   - If using custom domain: Your domain name

2. **You'll need this for Supabase configuration**

---

## 📋 Step 5: Configure Supabase SMTP Settings

1. **Go to Supabase Dashboard → Authentication → Email → SMTP Settings**

2. **Enable Custom SMTP** (toggle ON)

3. **Enter Resend SMTP settings:**

**If you have a verified domain:**
```
SMTP Host: smtp.resend.com
SMTP Port: 587 (or 465)
SMTP User: resend
SMTP Password: YOUR_RESEND_API_KEY
Sender Email: noreply@YOUR_DOMAIN.com (or whatever you configured)
Sender Name: Decision Coach
```

**If using test domain:**
```
SMTP Host: smtp.resend.com
SMTP Port: 587
SMTP User: resend
SMTP Password: YOUR_RESEND_API_KEY
Sender Email: onboarding@resend.dev (or whatever test domain Resend gives you)
Sender Name: Decision Coach
```

4. **Save settings**

5. **Wait 30-60 seconds for settings to apply**

---

## 📋 Step 6: Enable Email Confirmations

1. **Go to Templates tab**

2. **Click "Confirm sign up"**

3. **Make sure it's enabled**

4. **Save**

---

## 📋 Step 7: Test Account Creation

1. **Go to your app**

2. **Create a test account**

3. **Check email** for confirmation

4. **✅ Should work!**

---

## 🔍 Resend SMTP Settings Reference

**Standard Resend SMTP:**
- **Host:** `smtp.resend.com`
- **Port:** `587` (or `465`)
- **Username:** `resend` (always this)
- **Password:** Your API key
- **Sender Email:** Must be from verified domain

---

## 📝 Quick Setup Checklist

- [ ] Create Resend account
- [ ] Get API key
- [ ] Add/verify domain (or use test domain)
- [ ] Configure Supabase SMTP with Resend settings
- [ ] Enable email confirmations
- [ ] Test account creation

---

## 💡 Tips

1. **Resend is simpler** - Should work faster than Mailgun
2. **No authorized recipients needed** - Unlike Mailgun sandbox
3. **Good documentation** - Check Resend docs if stuck
4. **Test domain available** - Can test without custom domain

---

## 🎯 Expected Time

- **Account creation:** 2 minutes
- **API key:** 1 minute
- **Domain setup:** 5-10 minutes (or use test domain)
- **Supabase config:** 2 minutes
- **Total:** ~15 minutes (much faster than Mailgun troubleshooting!)

Let's get started! 🚀

