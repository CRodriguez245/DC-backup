# Fix Proxy Status for Vercel DNS Records

## ⚠️ Important: Change Proxy Status to "DNS only"

**Your A records are currently "Proxied" (orange cloud icon).**

**For Vercel to work correctly, they need to be "DNS only" (gray cloud icon).**

---

## 🔍 What You're Seeing

**Your DNS records show:**
- ✅ A records are imported (good!)
- ⚠️ Proxy status shows "Proxied" (orange cloud) - **needs to change**
- ✅ IP addresses look correct: `64.29.17.1`, `64.29.17.65`, `216.198.79.1`

---

## ✅ What to Do

### Step 1: Change Proxy Status for Each A Record

**For each of these A records, click the orange cloud icon to change it to gray (DNS only):**

1. **A record:** `decisioncoach.io` → `64.29.17.1`
   - Click the orange cloud → should turn gray

2. **A record:** `decisioncoach.io` → `64.29.17.65`
   - Click the orange cloud → should turn gray

3. **A record:** `www` → `216.198.79.1`
   - Click the orange cloud → should turn gray

4. **A record:** `www` → `64.29.17.1`
   - Click the orange cloud → should turn gray

**You can ignore:**
- Wildcard (`*`) A records - not needed for your setup
- NS records - these will change after nameserver update
- CAA record - can stay as is
- TXT record - can stay as is

---

## 🎯 Why "DNS only" (Gray Cloud)?

**When proxy is ON (orange cloud):**
- Traffic goes through Cloudflare's proxy
- This can interfere with Vercel's hosting
- Vercel works better with direct connections

**When proxy is OFF (gray cloud - DNS only):**
- Traffic goes directly to Vercel's servers
- DNS is still managed by Cloudflare (fast DNS resolution)
- This is what we want! ✅

---

## 📋 Checklist

- [ ] Changed `decisioncoach.io` → `64.29.17.1` to DNS only (gray cloud)
- [ ] Changed `decisioncoach.io` → `64.29.17.65` to DNS only (gray cloud)
- [ ] Changed `www` → `216.198.79.1` to DNS only (gray cloud)
- [ ] Changed `www` → `64.29.17.1` to DNS only (gray cloud)

---

## ✅ After Fixing Proxy Status

**Once all A records are "DNS only" (gray cloud):**

1. **You'll see a message about updating nameservers**
2. **Cloudflare will give you new nameservers** (like `ns1.cloudflare.com`, `ns2.cloudflare.com`)
3. **We'll update those at your domain registrar next**

---

## 🚀 Quick Steps

1. **Find each A record in the list**
2. **Click the orange cloud icon** (it's in the "Proxy status" column)
3. **It should turn gray** (DNS only)
4. **Do this for all 4 A records listed above**

Let me know when you've changed them all to gray (DNS only)!

