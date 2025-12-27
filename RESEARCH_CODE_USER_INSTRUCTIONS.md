# Research Code - User Instructions

**Purpose:** Define what users need to know about their research code and why they need it.

---

## 🎯 Why Users Need the Research Code

### IRB Compliance Requirements

1. **Right to Withdraw from Study:**
   - Users have the right to withdraw their data from research
   - The research code is the ONLY way to identify their anonymous data
   - Without the code, researchers cannot locate or remove their data
   - **Users need the code if they want to withdraw later**

2. **Data Anonymization:**
   - User data is stored anonymously (no personal identifiers)
   - Research code is the anonymous link between user and data
   - Users can verify their data is truly anonymous (only code, no name/email)

3. **Transparency:**
   - Shows users their participation is being recorded for research
   - Provides clear identifier for their participation
   - Demonstrates IRB-compliant research practices

---

## 📋 Recommended User Instructions

### Option 1: Minimal (Recommended for First Version)

**Modal Title:** "Your Research Participation Code"

**Message:**
```
Thank you for participating in our research study!

Your anonymous research code is:

[RES-ABC123] (Copy button)

Please save this code if you want to:
• Withdraw your data from the study later
• Reference your participation

Your data is stored anonymously and linked only to this code.
```

**Button:** "Got it" or "Continue"

---

### Option 2: Detailed (If IRB Requires More Information)

**Modal Title:** "Research Participation Information"

**Message:**
```
Thank you for participating in our research study!

Your anonymous research participation code is:

[RES-ABC123] (Copy button)

What is this code?
• Your session data is stored anonymously for research purposes
• This code is the only link between you and your anonymous data
• Your name and email are NOT stored with your research data

Why do you need this code?
• You can use it to withdraw your data from the study if you choose
• You can reference it if you have questions about your participation
• It ensures your data remains anonymous and confidential

Please save this code in a safe place if you want to withdraw your data later.

[✓] I understand and have saved my research code
```

**Button:** "Continue"

---

### Option 3: Very Detailed (If Required by IRB)

Includes:
- Full IRB study information
- Contact information for questions
- Detailed withdrawal procedures
- Privacy policy link

**Use this if your IRB requires detailed consent information.**

---

## 🎨 Recommended Approach

**For initial implementation, use Option 1 (Minimal):**

**Why:**
- Clear and concise
- Explains key points (code, why save it)
- Not overwhelming
- Can be expanded later if IRB requires

**Key Points to Include:**
1. ✅ Thank them for participating
2. ✅ Show the research code prominently
3. ✅ Explain why they might need it (withdraw data)
4. ✅ Copy to clipboard button
5. ✅ Brief mention of anonymity

---

## 📝 Suggested Modal Content (Option 1 - Recommended)

```
┌─────────────────────────────────────────────┐
│  Your Research Participation Code      [×]  │
├─────────────────────────────────────────────┤
│                                             │
│  Thank you for participating in our         │
│  research study!                            │
│                                             │
│  Your anonymous research code is:           │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  RES-ABC123              [📋 Copy]  │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Please save this code if you want to:      │
│  • Withdraw your data from the study later  │
│  • Reference your participation             │
│                                             │
│  Your data is stored anonymously and        │
│  linked only to this code.                  │
│                                             │
│              [Got it]                       │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🔍 IRB Considerations

### What IRB Typically Requires:

1. **Informed Consent:**
   - Users should know their data is being used for research
   - Explain what data is collected
   - Explain how data is stored (anonymously)

2. **Right to Withdraw:**
   - Users must be able to withdraw their data
   - Must provide mechanism for withdrawal
   - Research code enables this

3. **Privacy/Anonymity:**
   - Explain how data is anonymized
   - Explain what identifiers are/aren't stored
   - Research code demonstrates anonymity

### Questions to Ask Your IRB:

1. **What level of detail is required in the modal?**
   - Minimal explanation?
   - Full consent information?
   - Link to detailed information?

2. **When should the modal appear?**
   - Immediately after first session completion?
   - Before first session starts?
   - Both?

3. **Do users need to acknowledge/consent?**
   - Simple "Got it" button?
   - Checkbox "I understand"?
   - Signature/consent form?

---

## ✅ Recommended Implementation (Option 1)

**For STEP 6, implement Option 1 (Minimal):**

**Content:**
- Title: "Your Research Participation Code"
- Thank you message
- Display research code prominently
- Copy to clipboard button
- Brief explanation of why to save it
- Simple "Got it" button to close

**This provides:**
- ✅ IRB compliance (users have their code)
- ✅ Clear instructions (why to save it)
- ✅ Good UX (not overwhelming)
- ✅ Easy to expand later if needed

---

## 🎯 Key Message for Users

**In simple terms:**
> "Here's your research code. Save it if you want to withdraw your data later. Your data is anonymous and only linked to this code."

**That's it!** Simple, clear, IRB-compliant.

---

**Recommendation:** Use Option 1 for initial implementation, then adjust based on IRB feedback if needed.

