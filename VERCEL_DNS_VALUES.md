# Actual DNS Record Values for decisioncoach.io

## ✅ Current DNS Records (Found!)

**These are the ACTUAL values your domain currently uses:**

---

## 📋 A Records (Root Domain)

**For `decisioncoach.io` (root domain):**

```
Type: A
Name: @ (or decisioncoach.io)
Value: 64.29.17.65
TTL: 600 (or Auto)

Type: A
Name: @ (or decisioncoach.io)
Value: 64.29.17.1
TTL: 600 (or Auto)
```

**You need BOTH of these A records!**

---

## 📋 CNAME Records

**For `www.decisioncoach.io`:**

**Current status:** No CNAME record found (www resolves to A records directly)

**Options:**

**Option 1: Create CNAME (Recommended)**
```
Type: CNAME
Name: www
Value: decisioncoach.io
TTL: Auto
```

**Option 2: Create A records for www (if CNAME doesn't work)**
```
Type: A
Name: www
Value: 64.29.17.65
TTL: Auto

Type: A
Name: www
Value: 64.29.17.1
TTL: Auto
```

---

## 📋 What to Add in Cloudflare

### When Cloudflare imports your domain, make sure these exist:

**A Records for Root Domain (`decisioncoach.io`):**
1. Type: `A`
   - Name: `@` (or leave blank, or `decisioncoach.io`)
   - Content/Value: `64.29.17.65`
   - TTL: `Auto` (or `600`)

2. Type: `A`
   - Name: `@` (or leave blank, or `decisioncoach.io`)
   - Content/Value: `64.29.17.1`
   - TTL: `Auto` (or `600`)

**A Records for www Subdomain (`www.decisioncoach.io`):**
1. Type: `A`
   - Name: `www`
   - Content/Value: `64.29.17.65`
   - TTL: `Auto`

2. Type: `A`
   - Name: `www`
   - Content/Value: `216.198.79.65`
   - TTL: `Auto`

**Note:** Your www subdomain currently uses A records, not CNAME. You can keep it as A records or change to CNAME pointing to `decisioncoach.io` (both work).

---

## ✅ Summary

**Current DNS values:**
- **Root domain A records:** `64.29.17.65` and `64.29.17.1`
- **www subdomain A records:** `64.29.17.65` and `216.198.79.65`
- **Nameservers:** `ns1.vercel-dns.com` and `ns2.vercel-dns.com` (will change to Cloudflare)

**What to preserve in Cloudflare:**
- ✅ Two A records for root domain: `64.29.17.65` and `64.29.17.1`
- ✅ Two A records for www: `64.29.17.65` and `216.198.79.65`
- ✅ Or simplify www to CNAME: `www` → `decisioncoach.io` (both work)

---

## 🎯 Next Steps

1. **When Cloudflare imports your DNS, verify these A records are there**
2. **If missing, add them manually:**
   - Add A record: `@` → `64.29.17.65`
   - Add A record: `@` → `64.29.17.1`
3. **Test your site** - should still work!

---

## ⚠️ Important Notes

- **You need BOTH A records** (64.29.17.65 and 64.29.17.1)
- **These are Vercel's IP addresses** - your site won't work without them
- **Cloudflare should import them automatically** - but verify they're there!

