# Async Collaboration Guide - Cursor AI Team Work

## 🎯 Overview

**How to work effectively asynchronously with team members using Cursor AI.**

---

## 📋 Best Practices

### 1. Documentation is Key

**Always document:**
- ✅ What you're working on
- ✅ What's been completed
- ✅ What's blocked/paused
- ✅ Current status of features
- ✅ Important decisions made

**Where to document:**
- Markdown files in the project (like we've been doing)
- README files for major features
- Status files for ongoing work
- Comments in code for complex logic

---

### 2. Use Status Files

**Create status files for major features:**

Example: `FEATURE_STATUS.md`
```markdown
# Feature Status

## Email Confirmations (SMTP/Resend)
- Status: ⏸️ Paused
- Blocked by: Need domain registrar access
- Last updated: [date]
- Next steps: Update nameservers at Tucows
- See: CLOUDFLARE_SETUP_PAUSED.md
```

**Benefits:**
- Quick overview of what's happening
- Easy to see what's blocked
- Clear next steps

---

### 3. Communication Protocol

**When starting work:**
1. **Check status files** - See what others are working on
2. **Read recent documentation** - Understand current state
3. **Leave a note** - Update status if you're working on something

**When finishing work:**
1. **Update status files** - Mark as complete or blocked
2. **Document what you did** - Create/update relevant docs
3. **Note any blockers** - So next person knows

**When blocked:**
1. **Document the blocker** - What's preventing progress
2. **Note what's needed** - What would unblock it
3. **Update status** - Mark as paused/blocked

---

### 4. Context Sharing

**For Cursor AI specifically:**

**Option A: Conversation History**
- Cursor saves conversation history per user
- Each team member has their own history
- **Solution:** Document important context in files

**Option B: Documentation Files (Recommended)**
- Create context files for major features
- Include: what's done, what's next, important info
- Example: `SMTP_CONTEXT_SUMMARY.md`

**Option C: README Files**
- Create README for each major feature/module
- Include setup, status, next steps
- Easy to find and read

---

### 5. File Organization

**Recommended structure:**

```
project-root/
├── docs/
│   ├── features/
│   │   ├── SMTP_SETUP.md
│   │   ├── IRB_COMPLIANCE.md
│   │   └── ...
│   ├── status/
│   │   ├── CURRENT_STATUS.md
│   │   └── BLOCKERS.md
│   └── guides/
│       └── ...
├── README.md
└── ...
```

**Or simpler (current approach):**
- Keep status/docs in root
- Use descriptive filenames
- Easy to find with search

---

### 6. Git Workflow

**Best practices:**
- ✅ Commit frequently with clear messages
- ✅ Push regularly so others see progress
- ✅ Use branches for major features
- ✅ Document in commit messages what changed

**Commit message format:**
```
[Feature] Brief description

- What was done
- What's next
- Any blockers
```

---

### 7. Status Updates

**Create a central status file:**

`CURRENT_STATUS.md`
```markdown
# Current Project Status

Last updated: [date]

## Active Work
- [Feature] Email confirmations - Paused (see CLOUDFLARE_SETUP_PAUSED.md)
- [Feature] IRB compliance - Complete (see IRB_IMPLEMENTATION_STATUS_FINAL.md)

## Blockers
- Email confirmations: Need domain registrar access (Tucows)

## Next Up
- [Feature] Frontend research code display (on hold)
```

---

## 🎯 Specific Recommendations for Your Project

### 1. Create a Status File

**Create `PROJECT_STATUS.md`:**

```markdown
# Project Status

## Active Features

### Email Confirmations (SMTP/Resend)
- **Status:** ⏸️ Paused
- **Who:** Carlos
- **Blocked by:** Need access to Tucows domain registrar
- **Next steps:** Update nameservers when access available
- **Docs:** CLOUDFLARE_SETUP_PAUSED.md, SMTP_CONTEXT_SUMMARY.md

### IRB Compliance
- **Status:** ✅ Complete
- **Who:** Carlos
- **Docs:** IRB_IMPLEMENTATION_STATUS_FINAL.md

## Team Notes
- [Date] - Carlos: Started SMTP setup, paused at Cloudflare nameserver update
```

---

### 2. Handoff Protocol

**When handing off work:**

1. **Update status file** with current state
2. **Document what's been done** in feature docs
3. **Note any blockers** clearly
4. **Include relevant file paths** and context
5. **Leave clear next steps**

**Example handoff note:**
```markdown
## Email Confirmations - Handoff

**Current state:**
- Resend configured in Supabase ✅
- Cloudflare setup started ✅
- Paused: Need Tucows access ⏸️

**Files to review:**
- CLOUDFLARE_SETUP_PAUSED.md
- SMTP_CONTEXT_SUMMARY.md
- RESEND_SUPABASE_CONFIG.md

**Next steps:**
1. Get access to Tucows account
2. Update nameservers to Cloudflare
3. Add Resend DNS records
4. Verify domain

**Important info:**
- Resend API key: [in Supabase config]
- Domain registrar: Tucows
- Current nameservers: ns1.vercel-dns.com, ns2.vercel-dns.com
```

---

### 3. Daily/Weekly Sync

**Even async, consider:**
- **Daily standup notes** (in a file)
- **Weekly summary** of what's done
- **Blocker updates** as they happen

**Example: `DAILY_NOTES.md`:**
```markdown
# Daily Notes

## 2024-12-21
- Carlos: Started SMTP setup, paused at Cloudflare
- Next: Need domain registrar access

## 2024-12-22
- [Team member]: Working on [feature]
```

---

### 4. Cursor AI Specific Tips

**For Cursor AI:**
- ✅ **Document context in files** (Cursor can read files)
- ✅ **Use clear file names** (easy to find)
- ✅ **Include "See also" links** in docs
- ✅ **Document decisions** (why, not just what)

**When starting work:**
- Read relevant status/docs first
- Ask Cursor: "What's the current status of [feature]?"
- Cursor can read your docs and summarize

---

## 📋 Quick Checklist for Team Members

**Before starting work:**
- [ ] Check `PROJECT_STATUS.md` (or equivalent)
- [ ] Read relevant feature documentation
- [ ] Check for blockers
- [ ] Update status if you're taking over something

**While working:**
- [ ] Document what you're doing
- [ ] Update status if blocked
- [ ] Commit frequently with clear messages

**After finishing/blocking:**
- [ ] Update status file
- [ ] Document what's done
- [ ] Note blockers clearly
- [ ] Push changes

---

## 🎯 Recommended Setup for Your Project

**Create these files:**

1. **`PROJECT_STATUS.md`** - Central status hub
2. **`TEAM_NOTES.md`** - Quick notes/updates
3. **Feature-specific docs** - Already have these ✅

**Example `PROJECT_STATUS.md`:**
```markdown
# Project Status

Last updated: 2024-12-21

## Quick Links
- [Email Confirmations Status](CLOUDFLARE_SETUP_PAUSED.md)
- [IRB Compliance Status](IRB_IMPLEMENTATION_STATUS_FINAL.md)
- [SMTP Context Summary](SMTP_CONTEXT_SUMMARY.md)

## Active Work
- Email confirmations: Paused (need registrar access)

## Blockers
- None currently blocking critical work

## Completed
- IRB compliance implementation
- Research code generation
- Research session storage
```

---

## ✅ Summary

**Best practices:**
1. ✅ Document everything in files
2. ✅ Create status files for visibility
3. ✅ Update status when starting/finishing/blocking
4. ✅ Use clear commit messages
5. ✅ Leave handoff notes when needed

**For Cursor AI:**
- Document context in files (Cursor can read them)
- Use descriptive file names
- Include "See also" references
- Create status summaries

**You're already doing this well!** Just formalize it a bit more with a central status file.

---

**Want me to create a `PROJECT_STATUS.md` file for your project?**

