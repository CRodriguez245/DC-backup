# Configure Supabase with Resend

## ✅ You Have:
- **API Key:** `[REDACTED_RESEND_API_KEY]`
- **Now we need:** Your Resend domain/sender email

---

## 📋 Step 1: Get Your Resend Domain

**We need to know what domain/sender email to use:**

### Option A: Check if You Have a Domain

1. **In Resend Dashboard, look for "Domains"** (in sidebar or navigation)
2. **Check if you have any domains listed:**
   - If you see a domain → Use that
   - If you see a test domain → Use that
   - Note the domain name

### Option B: Use Resend Test Domain (If No Domain Yet)

**Resend typically provides:**
- `onboarding@resend.dev` (test domain)
- Or check Resend dashboard for test domain info

**For now, we can use:** `onboarding@resend.dev` (standard Resend test email)

---

## 📋 Step 2: Configure Supabase SMTP Settings

1. **Go to Supabase Dashboard → Authentication → Email → SMTP Settings**

2. **Enable Custom SMTP** (toggle ON)

3. **Enter these Resend SMTP settings:**

```
SMTP Host: smtp.resend.com
SMTP Port: 587
SMTP User: resend
SMTP Password: [REDACTED_RESEND_API_KEY]
Sender Email: onboarding@resend.dev
  (OR use your custom domain email if you have one)
Sender Name: Decision Coach
```

**IMPORTANT:** 
- **SMTP User is always:** `resend` (not your API key!)
- **SMTP Password is your API key:** `[REDACTED_RESEND_API_KEY]`

4. **Click "Save"**

5. **Wait 30-60 seconds** for settings to apply

---

## 📋 Step 3: Enable Email Confirmations

1. **Go to Templates tab**

2. **Click "Confirm sign up"**

3. **Make sure it's enabled**

4. **Save**

---

## 📋 Step 4: Test Account Creation

1. **Go to your app**

2. **Create a test account**

3. **Check email** for confirmation

4. **✅ Should work!**

---

## 🔍 If You Have a Custom Domain in Resend

**If you've added your own domain (e.g., decisioncoach.com):**

1. **Use that domain's email** for sender:
   - Example: `noreply@decisioncoach.com`
   - Or: `onboarding@decisioncoach.com`
   - Or whatever email you configured in Resend

2. **SMTP settings stay the same, just change Sender Email**

---

## ✅ Complete SMTP Settings

**For Supabase form:**

**Sender email address:**
`onboarding@resend.dev`
(OR your custom domain email if you have one)

**Sender name:**
`Decision Coach`

**Host:**
`smtp.resend.com`

**Port number:**
`587`

**Username:**
`resend`
(Always "resend" for Resend - not your API key!)

**Password:**
`[REDACTED_RESEND_API_KEY]`
(Your API key)

**Minimum interval per user:**
`60` (optional)

---

## 📋 Quick Checklist

- [ ] Check Resend for domain (or use onboarding@resend.dev)
- [ ] Configure Supabase SMTP with Resend settings
- [ ] Enable email confirmations
- [ ] Test account creation
- [ ] Check email for confirmation

---

## 🎯 What We Need

**Do you have a domain in Resend, or should we use the test domain?**

**For now, use:** `onboarding@resend.dev` (standard Resend test email)

Let's configure Supabase with these settings!

