# HaveIBeenPwned Quick Test Guide

## 🧪 Quick Test Steps

### Test 1: Compromised Password (Should Fail)

**Steps:**
1. Go to your signup page
   - Production: `https://decisioncoach.io/signup` (or your signup URL)
   - Or local dev environment

2. Try to create an account with a known compromised password:
   - **Email:** `test-haveibeenpwned@example.com` (any test email)
   - **Password:** `password123` (or try: `12345678`, `qwerty`, `password`, `admin123`)
   - These are commonly found in data breaches

3. **Expected Result:**
   - ❌ Signup should be **REJECTED**
   - ✅ Error message should mention:
     - "Password found in data breach"
     - "This password has been compromised"
     - "Password has been exposed in a data breach"
     - "Please choose a different password"
     - Or similar message

4. **If you see this error:** ✅ **HaveIBeenPwned is working!**

---

### Test 2: Strong Password (Should Succeed)

**Steps:**
1. Try to create an account with a strong password:
   - **Email:** `test-strong@example.com` (different email)
   - **Password:** `MySecureTest@Passw0rd2024!` (or any unique, strong password)
   - Should be unique and not commonly used

2. **Expected Result:**
   - ✅ Signup should **SUCCEED**
   - ✅ Account created normally
   - ✅ No error about compromised password

3. **If this works:** ✅ **Feature is working correctly!**

---

## 📋 What Each Test Proves

**Test 1 (Compromised Password):**
- ✅ HaveIBeenPwned is checking passwords
- ✅ Known compromised passwords are being rejected
- ✅ Security feature is active

**Test 2 (Strong Password):**
- ✅ Feature is not blocking legitimate passwords
- ✅ Only compromised passwords are rejected
- ✅ Feature working as intended

---

## ✅ Success Criteria

**Both tests pass = HaveIBeenPwned is working correctly:**
- ❌ Bad passwords are rejected
- ✅ Good passwords are accepted

---

## 🔍 Common Error Messages

**You might see error messages like:**
- "Password found in data breach"
- "This password has been exposed in a data breach. Please choose a different password."
- "Password compromised. Choose a more secure password."
- Or Supabase's standard error with breach information

**Any of these = Working correctly! ✅**

---

## ⚠️ If Test 1 Doesn't Work

**If compromised password is accepted (not rejected):**
- Check that HaveIBeenPwned is enabled in Supabase dashboard
- Some very common passwords might not be in database (rare)
- Try a different known compromised password
- Check Supabase logs for errors

**If you see a different error:**
- Might be a validation error (not breach-related)
- Or a different issue
- Share the error message for help

---

## 📝 Test Results Template

**After testing, note:**

**Test 1 (Compromised Password):**
- Password used: `password123`
- Result: [ ] Rejected ✅ / [ ] Accepted ❌
- Error message: _______________

**Test 2 (Strong Password):**
- Password used: `MySecureTest@Passw0rd2024!`
- Result: [ ] Accepted ✅ / [ ] Rejected ❌
- Error message: _______________

**Conclusion:**
- [ ] Both tests passed - Feature working ✅
- [ ] Test 1 failed - Need to check configuration
- [ ] Test 2 failed - May be different issue

---

## 🎯 Quick Test Checklist

- [ ] Go to signup page
- [ ] Try signup with `password123`
- [ ] Note error message (if any)
- [ ] Try signup with strong password
- [ ] Verify account created
- [ ] Confirm feature is working ✅

**Ready to test! Let me know what you see!**

