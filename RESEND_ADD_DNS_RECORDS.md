# Where to Add Resend DNS Records

## 🎯 Where Are DNS Records Added?

**DNS records are added at your domain registrar OR DNS provider** - not at Vercel (unless Vercel is managing your DNS).

---

## 🔍 Step 1: Find Out Where Your Domain DNS Is Managed

**Where did you buy/register your domain?** (e.g., `decisioncoach.io`)

**Common places:**
- **GoDaddy** → DNS managed at GoDaddy
- **Namecheap** → DNS managed at Namecheap
- **Google Domains** → DNS managed at Google Domains
- **Cloudflare** → DNS managed at Cloudflare
- **Vercel** → If domain is added to Vercel, DNS might be at Vercel
- **Route 53 (AWS)** → DNS managed at AWS Route 53
- **Other registrars** → Usually DNS managed at registrar

---

## ✅ If Your Domain Is in Vercel

**If you added your domain to Vercel:**

1. **Go to Vercel Dashboard**
2. **Click on your project**
3. **Go to "Settings" → "Domains"**
4. **Click on your domain** (e.g., `decisioncoach.io`)
5. **Look for "DNS Records" or "DNS" tab**
6. **Add the DNS records there**

**Or:**
- Vercel might redirect you to your domain registrar
- Check where Vercel says your DNS is managed

---

## ✅ If Your Domain Is NOT in Vercel

**Find your domain registrar:**

1. **Where did you buy the domain?**
   - GoDaddy? → Go to GoDaddy DNS Management
   - Namecheap? → Go to Namecheap DNS Management
   - Google Domains? → Go to Google Domains DNS
   - Cloudflare? → Go to Cloudflare DNS

2. **Log into your domain registrar**

3. **Find "DNS Management" or "DNS Settings"**
   - Usually in domain settings
   - Sometimes called "DNS Records" or "Zone Editor"

4. **Add the DNS records there**

---

## 📋 DNS Records You Need to Add (From Resend)

**Based on the Resend page you're seeing, you need to add:**

### 1. Domain Verification (DKIM)
- **Type:** `TXT`
- **Name:** `resend._domainkey`
- **Content:** `p=MIGfMA0GCSqGSIb3DQEB...` (full string from Resend)
- **TTL:** `Auto` (or `3600`)

### 2. Enable Sending (SPF - MX Record)
- **Type:** `MX`
- **Name:** `send`
- **Content:** `feedback-smtp.us-east-...` (full value from Resend)
- **TTL:** `60`
- **Priority:** `10`

### 3. Enable Sending (SPF - TXT Record)
- **Type:** `TXT`
- **Name:** `send`
- **Content:** `v=spf1 include:amazons...` (full value from Resend)
- **TTL:** `60`

### 4. DMARC (Optional, but recommended)
- **Type:** `TXT`
- **Name:** `_dmarc`
- **Content:** `v=DMARC1; p=none;`
- **TTL:** `Auto` (or `3600`)

---

## 🎯 How to Add DNS Records (General Steps)

**In your DNS provider (Vercel, GoDaddy, Cloudflare, etc.):**

1. **Log in**
2. **Go to DNS Management** (or DNS Settings, Zone Editor, etc.)
3. **Click "Add Record" or "+" button**
4. **For each record from Resend:**
   - Select **Type** (TXT, MX, etc.)
   - Enter **Name** (e.g., `resend._domainkey`, `send`, `_dmarc`)
   - Enter **Content/Value** (the full string from Resend)
   - Enter **TTL** (use `Auto` or `3600` if no preference)
   - Enter **Priority** (only for MX records, use `10`)
   - **Save**
5. **Repeat for all records**

---

## ⏱️ After Adding DNS Records

1. **Wait 5-60 minutes** for DNS to propagate
2. **Go back to Resend Dashboard → Domains**
3. **Click "Verify"** next to your domain
4. **Resend will check the DNS records**
5. **Status should change to "Verified" ✅**

---

## 🔍 Still Not Sure Where Your DNS Is?

**Check your domain's nameservers:**

1. **Go to:** https://www.whatsmydns.net/
2. **Enter your domain** (e.g., `decisioncoach.io`)
3. **Click "NS" (Nameservers)**
4. **See what nameservers are listed:**
   - If it shows `ns1.vercel-dns.com` → DNS is at Vercel
   - If it shows `ns1.godaddy.com` → DNS is at GoDaddy
   - If it shows `ns1.cloudflare.com` → DNS is at Cloudflare
   - etc.

**Then go to that provider to add DNS records.**

---

## ✅ Quick Answer

**Where did you register/buy your domain?**
- **If in Vercel:** Vercel Dashboard → Project → Settings → Domains → DNS Records
- **If elsewhere:** Go to that registrar's DNS Management page

**Tell me where your domain is, and I can give you specific steps!**

