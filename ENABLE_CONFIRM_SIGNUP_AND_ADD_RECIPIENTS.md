# Enable "Confirm sign up" and Add Authorized Recipients

## ✅ Question 1: "Confirm sign up" Toggle

If you don't see a toggle on the "Confirm sign up" page, it might:

1. **Already be enabled** - Check if there's text saying "Enabled" or an indicator
2. **Be in a different location** - Try clicking on "Confirm sign up" to see if it opens a settings page
3. **Be a checkbox instead of toggle** - Look for a checkbox
4. **Require enabling from a different place** - Check Authentication → Settings for email confirmation settings

**To check if it's enabled:**
- Look for indicators like "Active", "Enabled", or a checkmark
- If you see "Disabled" or similar, look for an "Enable" button or link
- Try clicking on "Confirm sign up" - it might open a configuration page

**If you can't find it:**
- Email confirmations might be controlled in Authentication → Settings
- Look for "Enable email confirmations" in Settings
- Or it might already be enabled by default

---

## ✅ Question 2: How to Add Authorized Recipients in Mailgun

### Step-by-Step:

1. **Go to Mailgun Dashboard**

2. **Click "Send" in the left sidebar** (paper airplane icon)

3. **Look for one of these:**
   - **"Authorized Recipients"** (direct link in sidebar under Send)
   - **"Suppressions"** → Then look for "Authorized Recipients" tab
   - **"Domain Settings"** → Click your domain → Look for "Authorized Recipients"

4. **If you see "Authorized Recipients":**
   - Click on it
   - Click **"Add Recipient"** or **"Add Authorized Recipient"** button
   - Enter the email address
   - Click "Add" or "Save"

5. **If you don't see "Authorized Recipients" directly:**
   - Go to **"Send" → "Suppressions"**
   - Look for tabs: "Bounces", "Complaints", "Unsubscribes", **"Authorized Recipients"**
   - Click "Authorized Recipients" tab
   - Click "Add Recipient"

6. **After adding:**
   - Mailgun will send a confirmation email to that address
   - The recipient must click the confirmation link
   - **After confirming**, they can receive emails from your app

---

## 🔍 Alternative: Finding Authorized Recipients

### Method 1: Through Domain Settings

1. **Send → Domains**
2. **Click on your sandbox domain:** `sandboxebc48f5daea344fa8a92f7b14ac2baf6.mailgun.org`
3. **Look for "Authorized Recipients" section**
4. **Click "Add Recipient"**

### Method 2: Through Suppressions

1. **Send → Suppressions**
2. **Look for tabs at the top**
3. **Click "Authorized Recipients" tab** (if it exists)
4. **Click "Add Recipient"**

### Method 3: Search in Mailgun

1. **Use the search bar** (top of dashboard)
2. **Search for "authorized recipients"**
3. **Click the result**

---

## 📋 Quick Checklist for Adding Recipients

- [ ] Go to Mailgun Dashboard
- [ ] Click "Send" in left sidebar
- [ ] Find "Authorized Recipients" (or "Suppressions" → "Authorized Recipients")
- [ ] Click "Add Recipient" or "Add Authorized Recipient"
- [ ] Enter email address
- [ ] Click "Add" or "Save"
- [ ] Recipient receives confirmation email
- [ ] Recipient clicks confirmation link
- [ ] ✅ Now they can receive emails!

---

## ⚠️ Important Note About Sandbox Domains

**Sandbox domains require authorized recipients:**

- You can ONLY send to email addresses you've added as authorized recipients
- Each recipient must confirm via Mailgun's email
- After confirming, they can receive emails from your app

**For testing:**
- Add your own email address first
- Check your email for Mailgun's confirmation message
- Click the confirmation link
- Then test account creation in your app

---

## 🎯 If You Still Can't Find It

**Some newer Mailgun accounts might not require authorized recipients:**

1. **Try creating a test account anyway**
2. **Check if the email arrives**
3. **If it does, you don't need authorized recipients!**

**Or contact Mailgun support** - they can help you find where to add recipients in the new interface.

---

## Summary

**For "Confirm sign up":**
- Check if it's already enabled
- Look for an "Enable" button or checkbox
- Try clicking on it to see if it opens settings
- Check Authentication → Settings for email confirmation toggle

**For Authorized Recipients:**
- Go to Send → Look for "Authorized Recipients" or "Suppressions"
- Click "Add Recipient"
- Enter email and confirm

Let me know what you find! 🔍

