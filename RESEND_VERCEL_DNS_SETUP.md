# Add Resend DNS Records in Vercel

## ✅ Your DNS is Managed in Vercel!

**Nameservers:** `ns1.vercel-dns.com` and `ns2.vercel-dns.com`

This means you'll add DNS records in the Vercel Dashboard.

---

## 📋 Step-by-Step: Add DNS Records in Vercel

### Step 1: Go to Vercel Dashboard

1. **Log into Vercel:** https://vercel.com/dashboard
2. **Go to your project** (the one with your domain)
3. **Click "Settings"** (top navigation)
4. **Click "Domains"** (left sidebar)

---

### Step 2: Select Your Domain

1. **Find your domain** in the list (e.g., `decisioncoach.io`)
2. **Click on the domain name** (not just the checkbox)

---

### Step 3: Add DNS Records

**You should see a "DNS Records" section or tab.**

**For each record from Resend, click "Add Record" or "+" and enter:**

---

### Record 1: DKIM (Domain Verification)

**Type:** `TXT`  
**Name:** `resend._domainkey`  
**Value:** `p=MIGfMA0GCSqGSIb3DQEB...` (the full string from Resend - copy the entire content value)  
**TTL:** Leave default or `3600`

**Click "Save" or "Add"**

---

### Record 2: SPF MX (Enable Sending)

**Type:** `MX`  
**Name:** `send`  
**Value:** `feedback-smtp.us-east-...` (the full value from Resend - copy the entire content)  
**Priority:** `10`  
**TTL:** `60`

**Click "Save" or "Add"**

---

### Record 3: SPF TXT (Enable Sending)

**Type:** `TXT`  
**Name:** `send`  
**Value:** `v=spf1 include:amazons...` (the full value from Resend - copy the entire content)  
**TTL:** `60`

**Click "Save" or "Add"**

---

### Record 4: DMARC (Optional, but Recommended)

**Type:** `TXT`  
**Name:** `_dmarc`  
**Value:** `v=DMARC1; p=none;`  
**TTL:** Leave default or `3600`

**Click "Save" or "Add"**

---

## ⚠️ Important Notes

**When copying values from Resend:**
- Copy the **ENTIRE** content string (it might be very long)
- Make sure there are **no spaces** at the start or end
- Paste it exactly as shown in Resend

**Vercel DNS Field Names:**
- "Name" = Host/Subdomain (e.g., `resend._domainkey`, `send`, `_dmarc`)
- "Value" = Content/Data (the actual record value)
- "Priority" = Only for MX records (use `10`)

---

## ✅ After Adding All Records

1. **Verify all 4 records are listed** in Vercel
2. **Wait 5-30 minutes** for DNS to propagate
3. **Go back to Resend Dashboard → Domains**
4. **Click "Verify"** next to your domain
5. **Resend will check the DNS records**
6. **Status should change to "Verified" ✅**

---

## 🔍 If You Don't See "DNS Records" in Vercel

**Alternative locations in Vercel:**
- Sometimes it's under "DNS" tab (separate from "Domains")
- Or check "Domain Settings" → "DNS"
- Or look for "DNS Configuration"

**If still not found:**
- Try the Vercel dashboard home → "Domains" section
- Or go directly to: `https://vercel.com/[your-team]/settings/domains`

---

## ✅ Checklist

- [ ] Logged into Vercel Dashboard
- [ ] Went to Settings → Domains
- [ ] Clicked on your domain
- [ ] Added TXT record: `resend._domainkey`
- [ ] Added MX record: `send` (priority 10)
- [ ] Added TXT record: `send`
- [ ] Added TXT record: `_dmarc` (optional)
- [ ] All records saved in Vercel
- [ ] Waited 5-30 minutes
- [ ] Verified domain in Resend Dashboard
- [ ] Domain status = "Verified" ✅

---

## 🎯 Next Steps After Verification

**Once domain is verified in Resend:**

1. **Update Supabase SMTP Settings:**
   - Go to Supabase → Authentication → Email → SMTP Settings
   - Change "Sender email address" to: `noreply@decisioncoach.io` (or your domain)
   - Keep other settings the same
   - Save

2. **Test account creation:**
   - Create a test account
   - Should receive confirmation email ✅

---

## 🚀 You're Almost There!

Add those DNS records in Vercel, wait for propagation, verify in Resend, and you'll be all set!

