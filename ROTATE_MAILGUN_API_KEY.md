# How to Rotate/Revoke Mailgun API Key

## ✅ Good Security Practice!

Since the API key was shared in conversation, rotating it is a smart security move.

---

## 🔄 Step 1: Create New API Key in Mailgun

1. **Go to Mailgun Dashboard → Settings → API Keys**

2. **Create a new API key:**
   - Click "Create API Key" or "Add API Key"
   - Name it: "Supabase Email Confirmations" (or whatever you prefer)
   - Select permissions: **"Mail Send"** or **"Full Access"**
   - Click "Create" or "Generate"

3. **COPY THE NEW API KEY IMMEDIATELY**
   - You'll only see it once!
   - Store it securely

---

## 🔄 Step 2: Revoke Old API Key (Optional but Recommended)

1. **Still in Mailgun Dashboard → Settings → API Keys**

2. **Find the old API key** (the one that was shared: `[REDACTED_MAILGUN_API_KEY]`)

3. **Delete/Revoke it:**
   - Click the delete/revoke button next to it
   - Confirm deletion
   - This prevents anyone who might have seen it from using it

---

## 🔄 Step 3: Update Supabase with New API Key

1. **Go to Supabase Dashboard → Authentication → Email → SMTP Settings**

2. **Update SMTP Password:**
   - Replace the old API key with your **new API key**
   - Keep everything else the same

3. **Save**

4. **Wait 30 seconds**

5. **Try signup again**

---

## 🤔 Should You Start Over?

**Pros of starting fresh:**
- ✅ Better security (new API key)
- ✅ Clean slate
- ✅ Might catch configuration mistakes

**Cons:**
- ⚠️ We've already done a lot of troubleshooting
- ⚠️ Might repeat the same issues

---

## 💡 Alternative: Simplify Approach

Since SMTP setup has been challenging, consider:

**Option 1: Disable Email Confirmations (Simplest)**
- Just turn off email confirmations in Supabase
- Users can sign up immediately
- No SMTP needed
- Perfect for development/testing
- Can enable later when ready

**Option 2: Try Different Email Service**
- SendGrid (easier setup, free tier)
- Resend (modern, developer-friendly)
- AWS SES (if you're on AWS)

**Option 3: Continue with Mailgun**
- Rotate API key
- Start fresh with configuration
- Use the troubleshooting knowledge we've gathered

---

## 🎯 My Recommendation

**If you want to continue with email confirmations:**

1. ✅ **Rotate the API key** (good security practice)
2. ✅ **Start fresh with new key**
3. ✅ **Try the SMTP credentials approach** (instead of API key)
4. ✅ **Consider trying SendGrid** (often easier than Mailgun)

**If you want to simplify:**

1. ✅ **Just disable email confirmations for now**
2. ✅ **Users can sign up immediately**
3. ✅ **Set up email later when needed**
4. ✅ **Focus on other features**

---

## 📋 Steps to Rotate Key

1. **Mailgun Dashboard → Settings → API Keys**
2. **Create new API key**
3. **Save it securely**
4. **Update Supabase SMTP Password with new key**
5. **Delete old API key** (optional but recommended)
6. **Test signup**

---

## 🔒 Security Note

- ✅ Good call on rotating the key!
- ✅ Never share API keys in conversations/commits
- ✅ Consider using environment variables in production
- ✅ Rotate keys periodically

Let me know if you want to:
- Continue with Mailgun (with new key)
- Try a different email service
- Just disable email confirmations for now

Good security practice! 🔒

