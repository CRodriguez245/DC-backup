# Resend 403 Error Troubleshooting

## ❌ Current Issue
- **Supabase:** `500: Error sending confirmation email`
- **Resend:** `403 status` on `/emails` endpoint

**403 = Authentication Failed** (API key issue or domain not verified)

---

## 🔍 Step 1: Verify API Key in Resend Dashboard

**Check if your API key is valid:**

1. **Go to Resend Dashboard**
2. **Click "API Keys"** (in sidebar)
3. **Verify your API key exists:**
   - Key: `[REDACTED_RESEND_API_KEY]`
   - Status: Should be "Active" or "Valid"
   - Permissions: Should allow sending emails

**If key is missing/invalid:**
- Create a new API key
- Copy it exactly (no spaces)
- Update Supabase with new key

---

## 🔍 Step 2: Check Resend Logs for Detailed Error

**In Resend Dashboard:**

1. **Go to "Logs" or "Activity"** (in sidebar)
2. **Click on the failed request** (the 403 one)
3. **Look for detailed error message:**
   - What does it say?
   - Does it mention "invalid API key"?
   - Does it mention "domain not verified"?
   - Does it mention "unauthorized"?

**Common error messages:**
- `Invalid API key`
- `Domain not verified`
- `Unauthorized`
- `Forbidden`

---

## 🔍 Step 3: Verify Sender Email Domain

**Problem:** `onboarding@resend.dev` might not work with SMTP

**Check in Resend:**

1. **Go to "Domains"** (in sidebar)
2. **What domains do you see?**
   - Do you have any verified domains?
   - Is `resend.dev` listed?
   - Are there any domains at all?

**If you have NO domains:**
- You might need to add/verify a domain
- OR use Resend API instead of SMTP
- OR check if Resend allows SMTP without domain

---

## 🔍 Step 4: Double-Check Supabase SMTP Settings

**Verify these EXACT values in Supabase:**

**Go to:** Supabase → Authentication → Email → SMTP Settings

**Username:**
```
resend
```
(Must be lowercase "resend", not your API key)

**Password:**
```
[REDACTED_RESEND_API_KEY]
```
(Your API key - NO spaces)

**Host:**
```
smtp.resend.com
```
(NO spaces)

**Port:**
```
587
```
(Just the number)

**Sender Email:**
```
onboarding@resend.dev
```
(Or try a different sender if you have a verified domain)

---

## 🔍 Step 5: Try Creating a New API Key

**If the current key isn't working:**

1. **Go to Resend Dashboard → API Keys**
2. **Create a new API key:**
   - Click "Create API Key"
   - Give it a name (e.g., "Supabase SMTP")
   - Copy the key (starts with `re_`)
   - **Save it somewhere safe!**

3. **Update Supabase:**
   - Go to SMTP Settings
   - Update the Password field with new API key
   - Save

4. **Test again**

---

## 🔍 Step 6: Check if Domain Verification is Needed

**Resend might require domain verification for SMTP:**

**In Resend Dashboard → Domains:**

1. **Do you see any domains?**
   - If NO domains: You might need to add one
   - If YES domains: Check if they're verified

2. **If you have a domain (e.g., decisioncoach.io):**
   - Verify it's "Verified" status
   - Use that domain's email as sender:
     - Example: `noreply@decisioncoach.io`
     - Or: `onboarding@decisioncoach.io`

3. **Update Supabase sender email** to use your verified domain

---

## 🔍 Step 7: Alternative - Use Resend API Instead of SMTP

**If SMTP continues to fail, consider using Resend API directly:**

**But first, let's try to fix SMTP.**

---

## ✅ What to Check Right Now

1. **Resend Dashboard → Logs:**
   - Click on the 403 error
   - What's the detailed error message?
   - Share it with me

2. **Resend Dashboard → API Keys:**
   - Is your API key there?
   - Is it active/valid?

3. **Resend Dashboard → Domains:**
   - Do you have any domains?
   - Are they verified?

4. **Supabase SMTP Settings:**
   - Double-check username = "resend" (lowercase)
   - Double-check password = your API key (no spaces)

---

## 🎯 Next Steps

**Share with me:**
1. What does the detailed Resend error message say?
2. Do you have any domains in Resend?
3. Is your API key showing as valid in Resend dashboard?

Then we can fix it! 🔧

