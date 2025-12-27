# How to Find "Authorized Recipients" in Mailgun

## Current Situation

You're on the **"Domains"** page. To add authorized recipients, you need to access the domain settings.

---

## Method 1: Click on the Sandbox Domain (Easiest)

1. **On the Domains page**, find your sandbox domain:
   - Look for: `sandboxaf43c165ed9648989c9075bdde8283a3.mailgun.org`
   - It should have a green checkmark ✅

2. **Click on the domain name** (click directly on `sandboxaf43c165ed9648989c9075bdde8283a3.mailgun.org`)

3. **This will open the domain details page**

4. **Look for one of these sections:**
   - **"Authorized Recipients"**
   - **"Recipients"**
   - **"Email Recipients"**
   - **"Sending Settings"**
   - **"Domain Settings"** (then look for recipients)

5. **Click "Add Recipient" or similar button**

---

## Method 2: Check Left Sidebar

Sometimes "Authorized Recipients" is in the sidebar:

1. **Look in the left sidebar** under **"SENDING"** section
2. **Check for:**
   - "Authorized Recipients"
   - "Recipients"
   - "Email Recipients"
3. **If you see it, click it**

---

## Method 3: Check "Domain Settings"

1. **In the left sidebar**, under **"SENDING"**, look for **"Domain settings"**
2. **Click "Domain settings"**
3. **Click on your sandbox domain** (`sandboxaf43c165ed9648989c9075bdde8283a3.mailgun.org`)
4. **Look for "Authorized Recipients"** or **"Recipients"** section

---

## Method 4: Check "Suppressions"

Sometimes authorized recipients are under Suppressions:

1. **In the left sidebar**, under **"SENDING"**, click **"Suppressions"**
2. **Look for tabs or sections:**
   - "Bounces"
   - "Complaints"
   - "Unsubscribes"
   - **"Authorized Recipients"** (might be a tab here)

---

## Alternative: Mailgun May Have Changed Their UI

If you can't find "Authorized Recipients" anywhere, Mailgun might have:

1. **Removed the requirement** for sandbox domains (newer accounts)
2. **Moved it to a different location**
3. **Changed the name** to something else

### In This Case:

**Option A: Try sending to any email (test if it works)**
- Maybe Mailgun removed the restriction
- Try creating an account with any email address
- See if it works

**Option B: Check Mailgun Documentation**
- Go to Mailgun help/documentation
- Search for "authorized recipients sandbox"

**Option C: Use Your Custom Domain Instead**
- I see you have `decisioncoach.com` domain (orange question mark)
- Custom domains don't require authorized recipients
- But this requires DNS setup (more complex)

---

## What I See in Your Dashboard

From your screenshot, I can see:
- ✅ Sandbox domain: `sandboxaf43c165ed9648989c9075bdde8283a3.mailgun.org` (green checkmark - active)
- ⚠️ Custom domain: `decisioncoach.com` (orange question mark - needs verification)

---

## Recommended Next Steps

1. **Click on the sandbox domain name** (`sandboxaf43c165ed9648989c9075bdde8283a3.mailgun.org`)
   - This should open domain details
   - Look for "Authorized Recipients" there

2. **If that doesn't work, check Mailgun logs:**
   - Go to **"Logs"** in the left sidebar (under REPORTING)
   - See what error Mailgun is showing
   - This will tell us exactly what's wrong

3. **Try sending to any email anyway:**
   - Some newer Mailgun accounts don't require authorized recipients
   - Try creating an account
   - See if it works despite the error message

---

## Quick Checklist

- [ ] Clicked on sandbox domain name (to see domain details)
- [ ] Checked sidebar for "Authorized Recipients"
- [ ] Checked "Domain settings" section
- [ ] Checked "Suppressions" section
- [ ] Checked Mailgun logs for error details
- [ ] Tried sending email anyway (to see if restriction exists)

---

## If Still Can't Find It

**Check Mailgun Logs to see the actual error:**

1. **Go to:** Left sidebar → **"Logs"** (under REPORTING section)
2. **Look for recent entries**
3. **See what error Mailgun is showing**
4. **This will tell us exactly what's wrong**

The error message in the logs will help us figure out the exact issue!

