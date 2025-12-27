# Custom SMTP Setup for Email Confirmations (Option B)

## Overview

Setting up custom SMTP allows Supabase to send email confirmations through a reliable email service instead of Supabase's default (which has limitations on the free tier).

---

## Is It Easy? ✅ YES - Relatively Easy

**Difficulty:** ⭐⭐ (2/5) - Moderate
- **Time Required:** 15-30 minutes
- **Technical Skill:** Basic (just need to copy/paste credentials)
- **Steps:** Sign up for SMTP service → Get credentials → Enter in Supabase → Done

---

## Is It Cheap? ✅ YES - Very Affordable

Most SMTP services offer **free tiers** that are perfect for development and small-scale production:

### Free Tier Options:

1. **SendGrid** (Recommended)
   - ✅ **Free:** 100 emails/day forever
   - ✅ Easy setup
   - ✅ Good documentation
   - ✅ Reliable

2. **Mailgun**
   - ✅ **Free:** 5,000 emails/month for 3 months, then 1,000/month
   - ✅ Good for testing
   - ⚠️ Free tier expires after 3 months

3. **AWS SES (Amazon Simple Email Service)**
   - ✅ **Free:** 62,000 emails/month (if hosted on EC2)
   - ✅ Very cheap: ~$0.10 per 1,000 emails after free tier
   - ⚠️ More complex setup (requires AWS account)

4. **Resend**
   - ✅ **Free:** 3,000 emails/month
   - ✅ Modern API
   - ✅ Developer-friendly

5. **Postmark**
   - ⚠️ No free tier
   - ✅ $15/month for 10,000 emails
   - ✅ Excellent deliverability

---

## Recommended: SendGrid (Best Balance)

**Why SendGrid:**
- ✅ **Free forever:** 100 emails/day (3,000/month) - perfect for most apps
- ✅ **Easy setup:** Takes 10 minutes
- ✅ **Reliable:** Industry standard
- ✅ **Good documentation**
- ✅ **No credit card required** for free tier

**Cost:**
- **Free tier:** 100 emails/day (sufficient for signups/testing)
- **Paid:** Starts at $19.95/month for 50,000 emails (only if you need more)

---

## Step-by-Step Setup Guide: SendGrid

### Step 1: Create SendGrid Account (5 minutes)

1. Go to [sendgrid.com](https://sendgrid.com)
2. Click **"Start for Free"**
3. Sign up (no credit card required)
4. Verify your email address

### Step 2: Create API Key (2 minutes)

1. Once logged in, go to **Settings** → **API Keys**
2. Click **"Create API Key"**
3. Name it: "Supabase Email Confirmations"
4. Select **"Full Access"** (or "Restricted Access" → Mail Send → Full Access)
5. Click **"Create & View"**
6. **COPY THE API KEY** - you'll need it in Step 4 (you can't view it again!)

### Step 3: Verify Sender Identity (5-10 minutes)

**Option A: Single Sender Verification (Easiest - Recommended for Testing)**
1. Go to **Settings** → **Sender Authentication**
2. Click **"Verify a Single Sender"**
3. Fill in:
   - **Email:** Your app's email (e.g., `noreply@yourdomain.com` or `support@yourdomain.com`)
   - **From Name:** Your app name (e.g., "Decision Coach")
   - **Reply To:** Same email
   - **Company Address:** Your address
4. Click **"Create"**
5. **Check your email** and click the verification link
6. ✅ Done! (No domain setup needed)

**Option B: Domain Authentication (For Production - More Professional)**
- Requires domain DNS setup
- Better for production (emails come from your domain)
- More complex (requires access to DNS records)
- Recommended for production apps

### Step 4: Configure Supabase (2 minutes)

1. Go to **Supabase Dashboard**
2. Click **Authentication** → **Settings**
3. Scroll down to **"SMTP Settings"**
4. Enable **"Enable Custom SMTP"**
5. Enter SendGrid credentials:

```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Password: [paste your SendGrid API key from Step 2]
Sender Email: [the email you verified in Step 3]
Sender Name: [your app name, e.g., "Decision Coach"]
```

6. Click **"Save"**
7. Test by clicking **"Send Test Email"** (sends to your Supabase account email)

### Step 5: Enable Email Confirmations (1 minute)

1. In Supabase, go to **Authentication** → **Settings**
2. Find **"Enable email confirmations"**
3. Turn it **ON** (enable)
4. Save

### Step 6: Test It! (2 minutes)

1. Try creating a new account
2. Check your email (may take a few seconds)
3. Click the confirmation link
4. ✅ Done!

---

## Cost Breakdown

### SendGrid (Recommended):
- **Free Tier:** 100 emails/day = 3,000/month
- **Cost:** $0/month (forever)
- **Upgrade (if needed):** $19.95/month for 50,000 emails

### Mailgun:
- **Free Tier:** 5,000/month (first 3 months), then 1,000/month
- **Cost:** $0/month initially
- **Upgrade (if needed):** Starts at $35/month

### AWS SES:
- **Free Tier:** 62,000/month (if on EC2), otherwise pay-as-you-go
- **Cost:** $0.10 per 1,000 emails (~$0.01 per 100)
- **Very cheap** for high volume

### Resend:
- **Free Tier:** 3,000/month
- **Cost:** $0/month
- **Upgrade:** $20/month for 50,000 emails

---

## Comparison: Which Should You Choose?

### For Development/Testing:
✅ **SendGrid** - Free, easy, reliable

### For Production (Low Volume - < 3,000 emails/month):
✅ **SendGrid** - Free tier is sufficient

### For Production (Medium Volume - 3,000-50,000 emails/month):
✅ **SendGrid** - $19.95/month, best value

### For Production (High Volume - 50,000+ emails/month):
✅ **AWS SES** - Cheapest per email (~$0.10 per 1,000)

---

## Important Notes

### Email Deliverability:
- Custom SMTP services (like SendGrid) have **much better deliverability** than Supabase's default
- Emails are less likely to go to spam
- Professional email delivery infrastructure

### Security:
- API keys are stored securely in Supabase
- SendGrid API key should have only "Mail Send" permissions (restrict access)
- Never share or commit API keys

### Limits:
- **Free tier limits:** Monitor your usage
- **Rate limits:** Usually not an issue for signup confirmations
- **Upgrade when needed:** Easy to upgrade if you exceed limits

---

## Troubleshooting

### Emails Not Sending:
1. Check SendGrid dashboard for errors
2. Verify sender email is verified
3. Check Supabase SMTP settings (credentials correct?)
4. Check spam folder

### Rate Limit Errors:
1. Check SendGrid usage dashboard
2. Upgrade to paid tier if needed
3. Consider Mailgun or AWS SES for higher limits

### Test Email Works But Confirmations Don't:
1. Check Supabase email confirmation is enabled
2. Check email templates in Supabase (Authentication → Email Templates)
3. Verify redirect URL is correct in email template

---

## Quick Setup Checklist

- [ ] Create SendGrid account
- [ ] Create API key in SendGrid
- [ ] Verify sender email address
- [ ] Enter SMTP credentials in Supabase
- [ ] Send test email (verify it works)
- [ ] Enable email confirmations in Supabase
- [ ] Test account creation and email receipt
- [ ] Verify confirmation link works

---

## Summary

### Is It Easy?
✅ **YES** - 15-30 minutes, mostly copy/paste

### Is It Cheap?
✅ **YES** - Free tiers available, $0/month for most apps

### Should You Do It?
✅ **For Production:** YES - Professional, reliable, free
❓ **For Development/Testing:** Optional - Can disable confirmations for now

### Recommendation:
1. **For now (development):** Keep email confirmations **disabled** (easier)
2. **For production:** Set up **SendGrid** (free, easy, professional)

---

## Next Steps

1. **Quick Decision:**
   - Need emails working now? → Use **SendGrid** (30 min setup)
   - Can wait? → Keep disabled for now, set up later

2. **If Setting Up SendGrid:**
   - Follow Step-by-Step Guide above
   - Takes ~15-30 minutes
   - Free forever at 100 emails/day

3. **If Keeping Disabled:**
   - No action needed
   - Can enable with SMTP later when ready

