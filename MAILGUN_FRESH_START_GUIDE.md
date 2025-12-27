# Mailgun Fresh Start - Step by Step Guide

## You're on the "Get started guide" page

Here's what you need to do for Supabase email confirmations:

---

## ✅ Step 1: Skip the Guide (Optional Steps)

**You can skip most of the guide steps for now:**
- ✅ "Activate your account" - Already done (has checkmark)
- ⏭️ "Invite a teammate" - Skip (not needed)
- ⏭️ "Send a test email" - Skip (we'll test via Supabase)
- ⏭️ "Set up a custom domain" - Skip (use sandbox for now)
- ⏭️ "Send a production email" - Skip (we'll test via Supabase)

**Just close/minimize the guide** - we'll go straight to what we need.

---

## ✅ Step 2: Find Your Sandbox Domain

1. **In the left sidebar, click "Send"** (paper airplane icon)

2. **Click "Domains"** (should be under Send)

3. **You should see your sandbox domain:**
   - Something like: `sandboxXXXXX.mailgun.org`
   - It should have a green checkmark ✅ (verified/active)

4. **Note the exact domain name** - you'll need this for Supabase

---

## ✅ Step 3: Get Your API Key

1. **Click your profile icon** (top right, "CR" avatar)

2. **Go to "Settings"** or **"Account Settings"**

3. **Click "API Keys"** (or look for API/Security section)

4. **Create a new API key:**
   - Click "Create API Key" or "Add API Key"
   - Name it: "Supabase Email Confirmations"
   - Select permissions: **"Mail Send"** or **"Full Access"**
   - Click "Create" or "Generate"

5. **COPY THE API KEY IMMEDIATELY**
   - ⚠️ You'll only see it once!
   - Store it securely (don't share it)

---

## ✅ Step 4: (Optional) Create SMTP Credentials

**Some setups work better with SMTP credentials instead of API key:**

1. **Go to:** Send → Domains

2. **Click on your sandbox domain**

3. **Look for "SMTP credentials" or "SMTP" section**

4. **Create SMTP credentials:**
   - Click "Create SMTP credentials" or "Add SMTP credentials"
   - Enter a name (e.g., "Supabase")
   - Click "Create"
   - **Copy the SMTP username and password**

5. **You can use these instead of API key in Supabase**

---

## ✅ Step 5: Configure Supabase

Once you have your domain and API key:

1. **Go to Supabase Dashboard → Authentication → Email → SMTP Settings**

2. **Enable Custom SMTP** (toggle ON)

3. **Enter settings:**
   ```
   SMTP Host: smtp.mailgun.org
   SMTP Port: 465 (or 587)
   SMTP User: postmaster@YOUR_SANDBOX_DOMAIN.mailgun.org
   SMTP Password: YOUR_NEW_API_KEY
   Sender Email: postmaster@YOUR_SANDBOX_DOMAIN.mailgun.org
   Sender Name: Decision Coach
   ```

4. **Save**

5. **Enable email confirmations:**
   - Go to Templates tab
   - Click "Confirm sign up"
   - Make sure it's enabled

---

## 🎯 Quick Path (Skip Guide)

**Fastest way to get what you need:**

1. **Left sidebar → "Send" → "Domains"**
   - Get your sandbox domain name

2. **Top right → Profile → Settings → API Keys**
   - Create new API key
   - Copy it

3. **Configure Supabase** with domain and API key

4. **Test signup**

---

## 📋 What You Need

**From Mailgun:**
- ✅ Sandbox domain name (e.g., `sandboxXXXXX.mailgun.org`)
- ✅ API key (new one, for security)

**For Supabase:**
- SMTP Host: `smtp.mailgun.org`
- SMTP Port: `465` or `587`
- SMTP User: `postmaster@YOUR_SANDBOX_DOMAIN.mailgun.org`
- SMTP Password: `YOUR_NEW_API_KEY`
- Sender Email: `postmaster@YOUR_SANDBOX_DOMAIN.mailgun.org`

---

## 🚀 Let's Start

**First, let's get your sandbox domain:**

1. **Click "Send" in the left sidebar**
2. **Click "Domains"**
3. **Tell me what sandbox domain you see**

Then we'll get your API key and configure Supabase!

