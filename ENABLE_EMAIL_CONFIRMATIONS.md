# How to Enable Email Confirmations in Supabase

## You're in the Right Place!

You're on the **Email settings** page. Here's how to enable email confirmations:

---

## ✅ Step 1: Find "Confirm sign up" Setting

**You're currently on:** Authentication → NOTIFICATIONS → Email → Templates tab

**What to do:**

1. **Look in the main content area**
2. **Find the "Authentication" section** (should be visible on the page)
3. **Look for:**
   - **"Confirm sign up"** - "Ask users to confirm their email address after signing up"
   - This is the setting you need

---

## ✅ Step 2: Enable "Confirm sign up"

1. **Click on "Confirm sign up"** (click the row with that title)
2. **This will open the configuration page**
3. **Toggle it ON** (enable it)
4. **Save the changes**

---

## ✅ Step 3: Switch to SMTP Settings Tab

**Before enabling, make sure SMTP is configured:**

1. **At the top of the page, you should see two tabs:**
   - **"Templates"** (currently active)
   - **"SMTP Settings"** ← Click this!

2. **Click "SMTP Settings" tab**

3. **Verify/Configure SMTP:**
   - Enable **"Custom SMTP"** (toggle ON)
   - Enter Mailgun SMTP settings:
     - SMTP Host: `smtp.mailgun.org`
     - SMTP Port: `587` (or `465`)
     - SMTP User: `postmaster@sandboxaf43c165ed9648989c9075bdde8283a3.mailgun.org`
     - SMTP Password: `[REDACTED_MAILGUN_API_KEY]`
     - Sender Email: `postmaster@sandboxaf43c165ed9648989c9075bdde8283a3.mailgun.org`
     - Sender Name: `Decision Coach`
   - **Click "Save"**

4. **Go back to "Templates" tab**

5. **Now enable "Confirm sign up"**

---

## ⚠️ Important Order

**SMTP must be configured BEFORE enabling email confirmations!**

1. ✅ **First:** Configure SMTP Settings (so emails can be sent)
2. ✅ **Then:** Enable "Confirm sign up" (so users need to confirm)

If you enable confirmations without SMTP working, users will get 500 errors (which is what you're experiencing).

---

## 🎯 Current Situation

Based on your error ("Error sending confirmation email"):
- Email confirmations are probably **already enabled**
- But SMTP is **not working properly**
- So users can't receive confirmation emails

**So you need to:**
1. ✅ **Fix SMTP first** (in SMTP Settings tab)
2. ✅ **Then verify** email confirmations are enabled (should already be on)

---

## 📋 Quick Steps

1. **Click "SMTP Settings" tab** (at top of page)
2. **Verify/Configure SMTP** with Mailgun settings
3. **Save SMTP settings**
4. **Click "Templates" tab**
5. **Click "Confirm sign up"**
6. **Make sure it's enabled** (toggle ON)
7. **Save**

---

## ✅ After SMTP is Fixed

Once SMTP is working properly:
- Users will receive confirmation emails
- They can click the link to confirm
- Account creation will work smoothly

---

## 🔍 Quick Check

**To see if email confirmations are currently enabled:**

1. **On the Email page, look at "Confirm sign up"**
2. **If it says something like "Enabled" or shows a toggle ON** → It's enabled
3. **If it says "Disabled" or shows toggle OFF** → It's disabled

**Most likely:** It's already enabled (that's why you're getting the error trying to send emails).

---

## Summary

**Answer:** Yes, you should enable email confirmations, BUT:
1. **First fix SMTP** (SMTP Settings tab)
2. **Then ensure** "Confirm sign up" is enabled (Templates tab)

Right now, confirmations are probably enabled but SMTP isn't working, causing the 500 error.

