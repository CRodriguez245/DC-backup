# Configure Supabase with New Mailgun Credentials

## ✅ You Have:
- **New API Key:** `[REDACTED_MAILGUN_API_KEY]`
- **Domain:** `sandboxebc48f5daea344fa8a92f7b14ac2baf6.mailgun.org`

---

## 📋 Configure Supabase SMTP Settings

### Step 1: Go to SMTP Settings

1. **Go to Supabase Dashboard**
2. **Click:** Authentication → Email
3. **Click:** **"SMTP Settings"** tab (at the top, next to "Templates")

### Step 2: Enable Custom SMTP

1. **Toggle "Enable Custom SMTP" to ON** (green/enabled)

### Step 3: Enter Mailgun SMTP Settings

**Enter these exact values:**

```
SMTP Host: smtp.mailgun.org

SMTP Port: 465
  (Try 465 first, if it doesn't work, try 587 or 2525)

SMTP User: postmaster@sandboxebc48f5daea344fa8a92f7b14ac2baf6.mailgun.org

SMTP Password: [REDACTED_MAILGUN_API_KEY]

Sender Email: postmaster@sandboxebc48f5daea344fa8a92f7b14ac2baf6.mailgun.org

Sender Name: Decision Coach
  (Can be anything you want)
```

### Step 4: Save Settings

1. **Click "Save"** button
2. **Wait 30-60 seconds** for settings to apply

---

## 📋 Enable Email Confirmations

### Step 5: Enable "Confirm sign up"

1. **Click "Templates" tab** (at the top, next to SMTP Settings)
2. **Find "Confirm sign up"** (under Authentication section)
3. **Click on "Confirm sign up"**
4. **Make sure it's enabled** (toggle ON)
5. **Save**

---

## 🧪 Test Account Creation

1. **Go to your app**
2. **Try creating a new account**
3. **Check email** - you should receive a confirmation email
4. **Click the confirmation link**
5. **✅ Should work!**

---

## ⚠️ Important: Sandbox Domain Limitation

**Since you're using a sandbox domain, you MUST add authorized recipients:**

1. **Go to Mailgun Dashboard → Send → Authorized Recipients**
2. **Add email addresses** that will receive emails
3. **Recipients must confirm** via Mailgun's confirmation email
4. **After confirming**, they can receive emails from your app

**For testing:**
- Add your own email first
- Confirm it via Mailgun
- Then test account creation

---

## 🔍 Troubleshooting

### If it still doesn't work:

1. **Try different SMTP port:**
   - Try `587` instead of `465`
   - Or try `2525`

2. **Check Supabase Logs:**
   - Go to Logs → Auth
   - Look for detailed error messages

3. **Check Mailgun Logs:**
   - Go to Mailgun Dashboard → Logs
   - See if connection attempts are being received

4. **Verify settings are saved:**
   - Go back to SMTP Settings
   - Make sure all fields are still filled
   - Re-save if needed

---

## 📝 Summary

**Supabase SMTP Settings:**
- Host: `smtp.mailgun.org`
- Port: `465` (or `587`)
- User: `postmaster@sandboxebc48f5daea344fa8a92f7b14ac2baf6.mailgun.org`
- Password: `[REDACTED_MAILGUN_API_KEY]`
- Sender: `postmaster@sandboxebc48f5daea344fa8a92f7b14ac2baf6.mailgun.org`

**Next Steps:**
1. Configure SMTP in Supabase
2. Enable email confirmations
3. Add authorized recipients in Mailgun
4. Test account creation

Good luck! 🚀

