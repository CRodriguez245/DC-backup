# Update Nameservers at Your Domain Registrar

## ✅ A Records Are Fixed - Now Update Nameservers!

**Great! All your A records are now "DNS only" (gray cloud).**

**Next step: Update nameservers at your domain registrar.**

---

## 🔍 What Cloudflare Shows You

**Cloudflare should display something like:**

**"Update your nameservers"** or **"Add these nameservers at your registrar"**

**And show you nameservers like:**
```
ns1.cloudflare.com
ns2.cloudflare.com
```

**OR custom nameservers like:**
```
[random-name].ns.cloudflare.com
[random-name].ns.cloudflare.com
```

---

## 📋 Step 1: Copy the Nameservers

**From Cloudflare:**
1. **Copy the nameservers** Cloudflare shows you
2. **Save them** (write down, screenshot, or copy to notes)
3. **You'll need them for the next step**

---

## 📋 Step 2: Identify Your Domain Registrar

**We need to know where you registered `decisioncoach.io`:**

**Common registrars:**
- **GoDaddy** - godaddy.com
- **Namecheap** - namecheap.com
- **Google Domains** - domains.google.com
- **Cloudflare** - if you registered through Cloudflare
- **Name.com** - name.com
- **Domain.com** - domain.com
- **Others** - various other registrars

**How to find out:**
- Where did you buy/register the domain?
- Check your email for domain registration receipt
- Or check where your domain billing is

---

## 📋 Step 3: Update Nameservers at Registrar

**Once you tell me your registrar, I'll give you specific steps.**

**General process:**
1. **Log into your domain registrar**
2. **Go to DNS/Nameserver settings**
3. **Find "Nameservers" or "DNS Servers"**
4. **Replace existing nameservers** with Cloudflare's nameservers
5. **Save**

---

## ⏱️ Step 4: Wait for Propagation

**After updating nameservers:**
- **Wait 5-60 minutes** for DNS propagation
- Your site should continue working during this time
- Cloudflare will take over DNS management

---

## 📋 Step 5: Verify in Cloudflare

**After propagation:**
- **Go back to Cloudflare Dashboard**
- **Check domain status** - should show "Active"
- **DNS records should be working**

---

## ✅ Next Steps After Nameservers Update

**Once nameservers are updated and propagated:**
1. ✅ DNS is now managed by Cloudflare
2. ✅ Your site continues working (A records point to Vercel)
3. ✅ Now we can add Resend DNS records!

---

## 🎯 What to Do Right Now

1. **Look at Cloudflare** - what nameservers does it show?
2. **Copy those nameservers** - save them
3. **Tell me:** Where is your domain registered? (GoDaddy, Namecheap, etc.)
4. **I'll guide you** through updating nameservers there

---

## 📋 Common Registrars - Quick Links

**GoDaddy:**
- Login → My Products → Domains → decisioncoach.io → DNS

**Namecheap:**
- Login → Domain List → Manage → Advanced DNS → Nameservers

**Google Domains:**
- Login → My Domains → decisioncoach.io → DNS → Nameservers

---

**What nameservers does Cloudflare show you? And where is your domain registered?**

