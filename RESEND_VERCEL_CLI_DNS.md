# Adding DNS Records via Vercel CLI

## ✅ Vercel CLI Has DNS Commands!

**Great news:** Vercel CLI can manage DNS records even though the UI doesn't show them.

---

## 📋 DNS Records to Add from Resend

**You need to add these 4 records:**

1. **DKIM (Domain Verification):**
   - Type: `TXT`
   - Name: `resend._domainkey`
   - Value: `p=MIGfMA0GCSqGSIb3DQEB...` (full value from Resend)

2. **SPF MX (Enable Sending):**
   - Type: `MX`
   - Name: `send`
   - Value: `feedback-smtp.us-east-...` (full value from Resend)
   - Priority: `10`

3. **SPF TXT (Enable Sending):**
   - Type: `TXT`
   - Name: `send`
   - Value: `v=spf1 include:amazons...` (full value from Resend)

4. **DMARC (Optional but Recommended):**
   - Type: `TXT`
   - Name: `_dmarc`
   - Value: `v=DMARC1; p=none;`

---

## 🎯 Vercel CLI Commands

**First, let's check existing records:**
```bash
vercel dns list decisioncoach.io
```

**Then add the records:**

**1. Add DKIM TXT record:**
```bash
vercel dns add decisioncoach.io resend._domainkey TXT "p=MIGfMA0GCSqGSIb3DQEB..."
```
(Replace `p=MIGfMA0GCSqGSIb3DQEB...` with the FULL value from Resend)

**2. Add SPF MX record:**
```bash
vercel dns add decisioncoach.io send MX "feedback-smtp.us-east-..." 10
```
(Replace `feedback-smtp.us-east-...` with the FULL value from Resend)

**3. Add SPF TXT record:**
```bash
vercel dns add decisioncoach.io send TXT "v=spf1 include:amazons..."
```
(Replace `v=spf1 include:amazons...` with the FULL value from Resend)

**4. Add DMARC TXT record:**
```bash
vercel dns add decisioncoach.io _dmarc TXT "v=DMARC1; p=none;"
```

---

## ⚠️ Important Notes

**When copying values from Resend:**
- Copy the **ENTIRE** content string (might be very long)
- Include it in quotes in the command
- Make sure there are **no spaces** at the start or end

**Command format:**
```
vercel dns add <DOMAIN> <NAME> <TYPE> <VALUE>
```

**For MX records (with priority):**
```
vercel dns add <DOMAIN> <NAME> MX <VALUE> <PRIORITY>
```

---

## ✅ After Adding Records

1. **Wait 5-30 minutes** for DNS to propagate
2. **Go to Resend Dashboard → Domains**
3. **Click "Verify"** next to your domain
4. **Status should change to "Verified" ✅**

---

## 🔍 Verify Records Were Added

**To check if records were added:**
```bash
vercel dns list decisioncoach.io
```

**This will show all DNS records for your domain.**

---

## 🎯 Next Steps

1. **Make sure you're logged into Vercel CLI**
2. **Get the FULL DNS record values from Resend**
3. **Run the commands above with the actual values**
4. **Verify in Resend**

Let's do this step by step!

