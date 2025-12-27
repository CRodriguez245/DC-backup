# Supabase SMTP Fields - Fill In These Values

## Your SMTP Form Fields

Here's what to enter in each field:

---

## 📋 Fill In Each Field

### 1. **Sender email address:**
```
postmaster@sandboxebc48f5daea344fa8a92f7b14ac2baf6.mailgun.org
```

### 2. **Sender name:**
```
Decision Coach
```
(Or whatever you want - this is just the display name)

### 3. **Host:**
```
smtp.mailgun.org
```

### 4. **Port number:**
```
465
```
(Or try `587` if 465 doesn't work)

### 5. **Minimum interval per user:**
```
60
```
(This is optional - prevents sending too many emails. 60 seconds = 1 minute between emails per user. You can leave default or adjust.)

### 6. **Username:**
```
postmaster@sandboxebc48f5daea344fa8a92f7b14ac2baf6.mailgun.org
```
(Must include "postmaster@" prefix + your full domain)

### 7. **Password:**
```
[REDACTED_MAILGUN_API_KEY]
```
(Your Mailgun API key)

---

## ✅ Complete Form Example

**Sender email address:**
`postmaster@sandboxebc48f5daea344fa8a92f7b14ac2baf6.mailgun.org`

**Sender name:**
`Decision Coach`

**Host:**
`smtp.mailgun.org`

**Port number:**
`465`

**Minimum interval per user:**
`60` (or leave default)

**Username:**
`postmaster@sandboxebc48f5daea344fa8a92f7b14ac2baf6.mailgun.org`

**Password:**
`[REDACTED_MAILGUN_API_KEY]`

---

## 🔍 Important Notes

1. **Username and Sender email should match** (both use `postmaster@...`)

2. **Host is just:** `smtp.mailgun.org` (no http:// or anything else)

3. **Port 465** uses SSL - try this first. If it doesn't work, try `587` (uses TLS)

4. **Password is your API key** - make sure there are no extra spaces

5. **Minimum interval** - This is optional. It prevents sending multiple emails to the same user within a time period. 60 seconds is reasonable for signup confirmations.

---

## ✅ After Filling Form

1. **Click "Save"** (or "Update" or similar button)
2. **Wait 30-60 seconds** for settings to apply
3. **Test by creating an account**

---

## 🔧 If Port 465 Doesn't Work

**Try port 587:**
- Change "Port number" to `587`
- Save and retry

**Or try port 2525:**
- Change "Port number" to `2525`
- Save and retry

---

## 📝 Quick Reference

Copy-paste ready values:

**Sender email:** `postmaster@sandboxebc48f5daea344fa8a92f7b14ac2baf6.mailgun.org`  
**Sender name:** `Decision Coach`  
**Host:** `smtp.mailgun.org`  
**Port:** `465`  
**Interval:** `60` (optional)  
**Username:** `postmaster@sandboxebc48f5daea344fa8a92f7b14ac2baf6.mailgun.org`  
**Password:** `[REDACTED_MAILGUN_API_KEY]`

Fill these in and save! 🚀

