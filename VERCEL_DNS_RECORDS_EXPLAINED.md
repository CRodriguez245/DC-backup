# Vercel DNS Records Explained - A and CNAME Records

## 📚 What Are DNS Records?

**DNS records tell the internet where to find your website.**

When someone types `decisioncoach.io` in their browser, DNS records point them to Vercel's servers where your site is hosted.

---

## 🔍 Types of DNS Records

### A Record (Address Record)
**What it does:** Points a domain to an IP address (like a street address)

**Example:**
- Domain: `decisioncoach.io`
- Points to: `76.76.21.21` (Vercel's IP address)

**Purpose:** Makes `decisioncoach.io` load your Vercel-hosted site

---

### CNAME Record (Canonical Name Record)
**What it does:** Points a domain/subdomain to another domain name (like an alias)

**Example:**
- Domain: `www.decisioncoach.io`
- Points to: `decisioncoach.io` (or `cname.vercel-dns.com`)

**Purpose:** Makes `www.decisioncoach.io` load the same site as `decisioncoach.io`

---

## 🎯 What DNS Records Does Vercel Need?

**Vercel typically needs these records to work:**

### Option 1: A Record (Root Domain)
```
Type: A
Name: @ (or decisioncoach.io)
Value: [IP address from Vercel]
TTL: Auto
```

**This makes:** `decisioncoach.io` → point to Vercel's servers

---

### Option 2: CNAME Record (www Subdomain)
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com (or your Vercel domain)
TTL: Auto
```

**This makes:** `www.decisioncoach.io` → point to `decisioncoach.io` (or Vercel)

---

## 🔍 How to Find What Records Vercel Needs

### Method 1: Check Vercel Dashboard (If Accessible)

1. **Go to:** Vercel Dashboard → Your Project → Settings → Domains
2. **Click on `decisioncoach.io`**
3. **Look for DNS configuration or records** (might show IP addresses or CNAME values)

---

### Method 2: Check Current DNS Records

**You can check what DNS records currently exist:**

**Using command line (macOS/Linux):**
```bash
dig decisioncoach.io
dig www.decisioncoach.io
```

**Or online tools:**
- https://dnschecker.org/
- Enter `decisioncoach.io` and check A records
- Enter `www.decisioncoach.io` and check CNAME records

---

### Method 3: Vercel's Typical Setup

**Vercel usually uses one of these setups:**

**Setup A: A Record for Root Domain**
```
decisioncoach.io → A record → Vercel IP address
www.decisioncoach.io → CNAME → decisioncoach.io
```

**Setup B: CNAME for Both**
```
decisioncoach.io → CNAME → cname.vercel-dns.com
www.decisioncoach.io → CNAME → decisioncoach.io
```

---

## ⚠️ What You Need to Preserve in Cloudflare

**When Cloudflare imports your DNS records, it should automatically include:**

1. **A record for `decisioncoach.io`** (if it exists)
   - Points to Vercel's IP address
   - Makes your root domain work

2. **CNAME record for `www.decisioncoach.io`** (if it exists)
   - Points to your root domain or Vercel
   - Makes www subdomain work

3. **Any other important records**
   - MX records (if you have email)
   - TXT records (for verification, etc.)

---

## ✅ How to Verify in Cloudflare

**After Cloudflare imports your DNS records:**

1. **Go to:** Cloudflare Dashboard → decisioncoach.io → DNS
2. **Check the list of records**
3. **Look for:**
   - A record with Name: `@` or `decisioncoach.io` (should point to an IP)
   - CNAME record with Name: `www` (should point to your domain or Vercel)
4. **If they're missing, you'll need to add them**

---

## 🔧 If Records Are Missing After Import

**If Cloudflare doesn't import Vercel records (or they're missing):**

### Option 1: Get Records from Vercel
**Contact Vercel support or check documentation for:**
- IP address for your domain
- Or CNAME value to use

### Option 2: Use Vercel's Domain Settings
**In Vercel Dashboard:**
- Your domain settings might show the DNS values needed
- Copy those values
- Add them manually in Cloudflare

### Option 3: Check Current DNS Before Switch
**Before switching to Cloudflare:**
- Use `dig` command or online tools to check current DNS
- Write down what A/CNAME records exist
- Use those values in Cloudflare

---

## 📋 Checklist: What to Check in Cloudflare

**After Cloudflare imports DNS, verify:**

- [ ] A record exists for `@` or `decisioncoach.io` (points to IP address)
- [ ] CNAME record exists for `www` (points to domain or Vercel)
- [ ] Your site still works at `decisioncoach.io`
- [ ] Your site still works at `www.decisioncoach.io`
- [ ] All other important records are present

---

## 🎯 Real-World Example

**Typical Vercel DNS setup might look like:**

```
Type: A
Name: @
Content: 76.76.21.21
TTL: Auto

Type: CNAME
Name: www
Content: cname.vercel-dns.com
TTL: Auto
```

**Or:**

```
Type: CNAME
Name: @
Content: cname.vercel-dns.com
TTL: Auto

Type: CNAME
Name: www
Content: decisioncoach.io
TTL: Auto
```

---

## ✅ Summary

**A/CNAME records for Vercel are:**
- **A record:** Points your root domain (`decisioncoach.io`) to Vercel's servers
- **CNAME record:** Points `www.decisioncoach.io` to your root domain or Vercel

**Why you need them:**
- Without these, your domain won't point to Vercel
- Your site won't load
- Users can't access your website

**What to do:**
1. Cloudflare will import existing records automatically
2. After import, verify A/CNAME records are present
3. If missing, add them manually (get values from Vercel or current DNS)

---

## 🚀 Bottom Line

**Don't worry too much!** Cloudflare will import existing records. Just verify they're there after the import, and test your site to make sure it still works.

If your site loads at `decisioncoach.io` after the switch, the records are correct! ✅

