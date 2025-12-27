# Cloudflare: Connect Your Domain - Step by Step

## ✅ You're on the "Connect a Domain" Page

**Perfect! This is where you add your domain to Cloudflare.**

---

## 📋 Step 1: Enter Your Domain

**In the input field (currently shows "example.com"):**

1. **Delete "example.com"** (if it's there)
2. **Type:** `decisioncoach.io`
3. **Click the blue "Continue" button**

---

## 📋 Step 2: Choose a Plan

**Cloudflare will ask you to select a plan:**

1. **Choose "Free" plan**
   - It's completely free
   - Perfect for DNS management
   - Includes all the features we need

2. **Click "Continue" or "Add site"**

---

## 📋 Step 3: Cloudflare Scans Your DNS

**Cloudflare will automatically:**
- ✅ Scan your existing DNS records
- ✅ Import them automatically
- ✅ This includes the A records we found earlier (64.29.17.65, 64.29.17.1, etc.)

**Just wait a moment for this to complete** (usually takes 10-60 seconds)

---

## 📋 Step 4: You'll See Nameservers

**After scanning, Cloudflare will show you:**

**NEW Nameservers** (example):
```
ns1.cloudflare.com
ns2.cloudflare.com
```

**OR** Cloudflare might show specific nameservers like:
```
[random-name].ns.cloudflare.com
[random-name].ns.cloudflare.com
```

**⚠️ IMPORTANT: Save these nameservers!**
- Write them down
- Or screenshot them
- You'll need them for the next step

---

## 📋 Step 5: Review DNS Records

**Cloudflare will show you a list of DNS records it found/imported.**

**Verify these are there:**
- ✅ A record: `@` → `64.29.17.65`
- ✅ A record: `@` → `64.29.17.1`
- ✅ A record: `www` → `64.29.17.65`
- ✅ A record: `www` → `216.198.79.65`

**If any are missing, we'll add them manually later.**

---

## 📋 What Happens Next

**After you see the nameservers:**

1. **You'll be instructed to update nameservers at your domain registrar**
2. **This is the next step** - we'll do that together
3. **Don't update nameservers yet** - wait for my instructions!

---

## ✅ Checklist: What to Do Right Now

- [ ] Enter `decisioncoach.io` in the input field
- [ ] Click "Continue"
- [ ] Choose "Free" plan
- [ ] Wait for DNS scan to complete
- [ ] Note the nameservers Cloudflare gives you
- [ ] Verify DNS records were imported (should see A records)

---

## 🎯 Current Step

**Right now, just:**
1. **Type:** `decisioncoach.io` in the input field
2. **Click:** "Continue"

**Let me know what you see after clicking Continue!**

