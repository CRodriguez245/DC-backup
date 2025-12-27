# Resend Domain Verification Guide

## 🎯 The Problem

**Error Message:**
> "You can only send testing emails to your own email address. To send emails to other recipients, please verify a domain at resend.com/domains"

**Why:**
- `onboarding@resend.dev` is Resend's test domain
- Test domains only allow sending to YOUR verified email address
- For production (sending to ANY user), you need to verify YOUR domain

---

## ✅ Solution: Verify Your Domain

### Step 1: Add Domain in Resend

1. **Go to Resend Dashboard**
2. **Click "Domains"** (in sidebar)
3. **Click "Add Domain"**
4. **Enter your domain:**
   - Example: `decisioncoach.io`
   - Or: `yourdomain.com`
5. **Click "Add"**

---

### Step 2: Get DNS Records from Resend

**Resend will show you DNS records to add:**

**Example records (Resend will give you your specific ones):**

```
Type: TXT
Name: @
Value: resend-domain-verification=abc123...

Type: MX
Name: @
Value: feedback-smtp.resend.com
Priority: 10

Type: TXT
Name: resend._domainkey
Value: [DKIM key from Resend]

Type: CNAME
Name: resend
Value: [CNAME value from Resend]
```

**Copy these records** - you'll need to add them to your domain's DNS.

---

### Step 3: Add DNS Records to Your Domain

**Where to add DNS records:**
- **Your domain registrar** (GoDaddy, Namecheap, etc.)
- **OR your DNS provider** (Cloudflare, Route 53, etc.)

**How:**
1. **Log into your domain registrar/DNS provider**
2. **Go to DNS Management** (or DNS Settings)
3. **Add each record** that Resend gave you:
   - Click "Add Record"
   - Enter Type, Name, Value from Resend
   - Save

**Important:**
- Add ALL records Resend requires
- Save each one
- DNS propagation can take 5-60 minutes (usually faster)

---

### Step 4: Verify Domain in Resend

1. **Go back to Resend Dashboard → Domains**
2. **Click "Verify"** next to your domain
3. **Wait for verification** (usually 1-5 minutes after DNS propagates)
4. **Status should change to "Verified" ✅**

---

### Step 5: Update Supabase SMTP Settings

**Once domain is verified:**

1. **Go to Supabase → Authentication → Email → SMTP Settings**

2. **Update Sender Email:**
   ```
   noreply@decisioncoach.io
   ```
   (Or: `onboarding@decisioncoach.io`, `no-reply@decisioncoach.io`, etc.)
   - Use your verified domain
   - Any email address on that domain works

3. **Keep other settings the same:**
   - Host: `smtp.resend.com`
   - Port: `587`
   - Username: `resend`
   - Password: `re_UkuY2EVe_EytLvXCuUzJ6CfdqXoeV96fr`

4. **Save**

5. **Test account creation** - should work now! ✅

---

## 🔄 Quick Test Option (Without Domain Verification)

**If you just want to test RIGHT NOW:**

**The error says you can send to:** `c.a.rodriguez1999@gmail.com`

**So:**
1. **Create a test account with:** `c.a.rodriguez1999@gmail.com`
2. **The email should arrive**
3. **This confirms SMTP is working**

**But:** This only works for YOUR email. For production, you still need domain verification.

---

## ✅ What Domain Should You Use?

**Use your app's domain:**
- If your app is `decisioncoach.io` → use `decisioncoach.io`
- If your app is `yourdomain.com` → use `yourdomain.com`

**Common sender email formats:**
- `noreply@decisioncoach.io`
- `onboarding@decisioncoach.io`
- `no-reply@decisioncoach.io`
- `hello@decisioncoach.io`

---

## 📋 Checklist

- [ ] Added domain in Resend
- [ ] Got DNS records from Resend
- [ ] Added DNS records to domain registrar
- [ ] Verified domain in Resend (status = "Verified")
- [ ] Updated Supabase sender email to use verified domain
- [ ] Tested account creation
- [ ] Email arrives successfully ✅

---

## 🎯 Next Steps

**Choose one:**
1. **Verify domain** (recommended for production) - follow steps above
2. **Quick test** - create account with `c.a.rodriguez1999@gmail.com` to confirm SMTP works

Let me know which domain you want to verify!

