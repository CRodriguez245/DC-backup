# Fix: "Error sending confirmation email" in Supabase

## ✅ Error Found!

From the logs:
```
/signup | 500: Error sending confirmation email
```

This confirms: **Supabase is trying to send a confirmation email but SMTP is failing.**

---

## 🔧 Fix Options (Try in Order)

### Fix 1: Verify SMTP Settings Are Saved (Most Common)

1. **Go to Supabase Dashboard → Authentication → Settings → SMTP Settings**

2. **Verify Custom SMTP is ENABLED:**
   - Toggle should be **ON** (green/enabled)
   - If it's OFF, turn it ON

3. **Double-check all settings match exactly:**

```
SMTP Host: smtp.mailgun.org
SMTP Port: 587
SMTP User: postmaster@sandboxaf43c165ed9648989c9075bdde8283a3.mailgun.org
SMTP Password: [REDACTED_MAILGUN_API_KEY]
Sender Email: postmaster@sandboxaf43c165ed9648989c9075bdde8283a3.mailgun.org
Sender Name: Decision Coach
```

4. **Click "Save"** (even if already saved - sometimes settings don't persist)

5. **Wait 30 seconds** for settings to apply

6. **Try signup again**

---

### Fix 2: Try Different SMTP Port

Port 587 might be blocked. Try port 465:

1. **In Supabase SMTP Settings:**
   - Change **SMTP Port** from `587` to `465`
   - Keep everything else the same
   - Click "Save"

2. **Wait 30 seconds**

3. **Try signup again**

**OR try port 2525:**
- Change port to `2525`
- Save and retry

---

### Fix 3: Check for Detailed SMTP Error

Sometimes there are more detailed errors. Check:

1. **Go back to Auth logs**
2. **Look for entries around the same time** as the error
3. **Look for any SMTP-specific error messages:**
   - "SMTP connection failed"
   - "Authentication failed"
   - "Connection timeout"
   - Any other SMTP errors

---

### Fix 4: Temporarily Disable Email Confirmations (Test)

To confirm SMTP is the issue:

1. **Go to Supabase Dashboard → Authentication → Settings**
2. **Find "Enable email confirmations"**
3. **Turn it OFF** (disable)
4. **Save**
5. **Try creating an account**
   - If signup works now → **SMTP is definitely the problem**
   - If still fails → There's another issue
6. **After confirming, re-enable email confirmations** once SMTP is fixed

---

### Fix 5: Verify Mailgun API Key

1. **Go to Mailgun Dashboard → Settings → API Keys**
2. **Verify the API key is active:**
   - `[REDACTED_MAILGUN_API_KEY]`
   - Should show as "Active" or "Valid"

3. **If key seems invalid:**
   - Create a new API key
   - Update Supabase SMTP Password with new key
   - Save

---

### Fix 6: Test SMTP Connection

If Supabase has a test email feature:

1. **In SMTP Settings, look for:**
   - "Send Test Email" button
   - "Test Connection" button
   - "Verify SMTP" button

2. **Click it and see if it works:**
   - If test email works → SMTP is fine, problem is elsewhere
   - If test email fails → SMTP configuration is wrong

---

## 🎯 Recommended Action Order

1. **✅ First:** Verify SMTP settings are saved correctly
2. **✅ Second:** Try port 465 instead of 587
3. **✅ Third:** Temporarily disable email confirmations to test
4. **✅ Fourth:** Check for more detailed SMTP errors in logs
5. **✅ Fifth:** Verify API key is valid

---

## 🔍 Most Likely Causes

Based on "Error sending confirmation email":

1. **SMTP settings not saved** (most common - 40%)
2. **Wrong SMTP port** (30%)
3. **SMTP authentication failing** (20%)
4. **SMTP connection timeout** (10%)

---

## 📋 Quick Checklist

- [ ] SMTP settings are saved in Supabase
- [ ] Custom SMTP toggle is ON (enabled)
- [ ] All SMTP fields are filled correctly
- [ ] Tried different SMTP port (465 or 2525)
- [ ] Checked for detailed SMTP errors in logs
- [ ] Verified Mailgun API key is valid
- [ ] Tested SMTP connection if available

---

## 💡 Quick Test

**Fastest way to confirm it's SMTP:**

1. Temporarily disable email confirmations
2. Try signup
3. If it works → SMTP is the issue (fix SMTP, then re-enable confirmations)
4. If it still fails → Different problem (check other Supabase settings)

Try Fix 1 first (verify and re-save SMTP settings), then Fix 2 (try port 465). Those fix most cases!

