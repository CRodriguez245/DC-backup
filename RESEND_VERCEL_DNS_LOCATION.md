# Finding DNS Records in Vercel Domain Settings

## 📍 You're on the Domain Configuration Page

**What you see:**
- Domain: `decisioncoach.io`
- Environment connection settings
- Save/Cancel buttons

**But DNS records are in a DIFFERENT section!**

---

## 🔍 Where to Find DNS Records in Vercel

**DNS records are usually in one of these places:**

### Option 1: Look for a "DNS" Tab or Section

**On the same page, look for:**
- A **"DNS" tab** at the top (next to "Configuration" or similar)
- A **"DNS Records" section** below the configuration
- A **"DNS" link** in the left sidebar or tabs

**Click on it to see/add DNS records.**

---

### Option 2: Team Settings → Domains

**If not on the domain page:**

1. **Go back to:** Vercel Dashboard home
2. **Click your profile/team** (top right)
3. **Go to "Settings"** (from the dropdown or sidebar)
4. **Click "Domains"** (in left sidebar)
5. **Find your domain in the list**
6. **Click on the domain**
7. **Look for "DNS" tab or section**

---

### Option 3: Direct DNS Management Link

**Sometimes Vercel has a direct DNS section:**

1. **From the domain list** (Settings → Domains)
2. **Hover over your domain** (`decisioncoach.io`)
3. **Look for "DNS" or "DNS Records" link/button**
4. **Click it**

---

### Option 4: Check the Domain Overview

**On the domain configuration page you're on:**

1. **Scroll down** - DNS records might be below
2. **Look for tabs** at the top: "Overview", "Configuration", "DNS", etc.
3. **Click "DNS" tab** if you see it

---

## 📋 What You Should See When You Find DNS Records

**You should see a section like:**

```
DNS Records
[Add Record Button]

Name          Type    Value                    TTL
@             A       [IP address]             60
www           CNAME   decisioncoach.io         60
```

**Or a list/table of existing DNS records with an "Add Record" or "+" button.**

---

## 🎯 If You Still Can't Find DNS Records

**Try this:**

1. **Go to Vercel Dashboard home**
2. **Click "Settings"** (gear icon or in sidebar)
3. **Click "Domains"** (in left sidebar)
4. **Look for your domain** in the list
5. **There might be a "..." menu** (three dots) next to your domain
6. **Click it → Look for "DNS" or "Manage DNS" option**

---

## ✅ Once You Find the DNS Section

**You'll add these 4 records:**

1. **TXT** record: `resend._domainkey` → [DKIM value from Resend]
2. **MX** record: `send` → [MX value from Resend] (Priority: 10)
3. **TXT** record: `send` → [SPF value from Resend]
4. **TXT** record: `_dmarc` → `v=DMARC1; p=none;`

---

## 🔍 Quick Check

**On the page you're currently on:**

- **Are there any tabs** at the top (Overview, Configuration, DNS, etc.)?
- **Is there a "DNS" link** in the sidebar or navigation?
- **Can you scroll down** to see more sections?

**Let me know what you see, and I'll guide you to the exact location!**

