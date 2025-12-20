# IRB Research Data Implementation - SDLC Approach

## SDLC Phases

### ✅ Phase 1: Requirements Analysis (COMPLETE)
- ✅ IRB compliance requirements identified
- ✅ Technical requirements defined
- ✅ User stories documented
- ✅ Security requirements specified

### ✅ Phase 2: System Design (COMPLETE)
- ✅ Database schema designed
- ✅ API endpoints designed
- ✅ Data flow documented
- ✅ Security architecture defined

### 🔄 Phase 3: Implementation (START HERE)

Following SDLC best practices, we'll implement incrementally with testing at each step.

---

## Implementation Roadmap (SDLC-Aligned)

### **STEP 1: Database Schema (Foundation)** ⭐ START HERE

**Why first:** Everything else depends on the database structure.

**Tasks:**
1. Create migration SQL file
2. Test in local/dev database
3. Verify schema
4. Document any changes

**Files to create:**
- `jamie-backend/migrations/001_create_research_tables.sql`

**Acceptance Criteria:**
- [ ] Tables created successfully
- [ ] Indexes created
- [ ] RLS policies applied
- [ ] Constraints working
- [ ] Can insert test data

**Estimated Time:** 2-3 hours

---

### **STEP 2: Research Code Generation (Core Logic)**

**Why second:** Needed before we can save sessions.

**Tasks:**
1. Create utility functions
2. Test code generation
3. Test uniqueness
4. Test collision handling

**Files to create:**
- `jamie-backend/utils/researchCode.js`
- `jamie-backend/utils/researchCode.test.js` (optional, but recommended)

**Acceptance Criteria:**
- [ ] Codes generated correctly (format: RES-XXXXXX)
- [ ] Codes are unique
- [ ] Collision handling works
- [ ] Can detect existing codes

**Estimated Time:** 2-3 hours

---

### **STEP 3: Research Session Storage Functions**

**Why third:** Needed to save research data.

**Tasks:**
1. Create session save function
2. Create message save function
3. Test data saving
4. Verify data integrity

**Files to create:**
- `jamie-backend/utils/researchSession.js`

**Acceptance Criteria:**
- [ ] Can save research sessions
- [ ] Can save research messages
- [ ] Data integrity maintained
- [ ] No user_id in research tables

**Estimated Time:** 2 hours

---

### **STEP 4: API Endpoints (Interface Layer)**

**Why fourth:** Provides API access to functionality.

**Tasks:**
1. Create research routes
2. Add endpoints to main app
3. Test API endpoints
4. Add error handling

**Files to create:**
- `jamie-backend/routes/research.js`
- Update: `jamie-backend/index.js`

**Acceptance Criteria:**
- [ ] POST /api/research/code works
- [ ] Proper error handling
- [ ] Security checks in place

**Estimated Time:** 1-2 hours

---

### **STEP 5: Session Completion Integration**

**Why fifth:** Integrates with existing chat flow.

**Tasks:**
1. Detect first attempt
2. Integrate code generation
3. Save to research tables
4. Return research code to frontend

**Files to modify:**
- `jamie-backend/routes/chat.js`

**Acceptance Criteria:**
- [ ] First attempt detected correctly
- [ ] Research code generated
- [ ] Data saved to research tables
- [ ] Research code returned in response

**Estimated Time:** 3-4 hours

---

### **STEP 6: Frontend Integration**

**Why sixth:** User-facing feature.

**Tasks:**
1. Create research code modal component
2. Integrate with session completion
3. Add copy to clipboard
4. Style and polish

**Files to create:**
- `jamie-ai-frontend/src/components/ResearchCodeModal.js`

**Files to modify:**
- `jamie-ai-frontend/src/App.js`

**Acceptance Criteria:**
- [ ] Modal displays after first session completion
- [ ] Research code shown
- [ ] Copy to clipboard works
- [ ] UI is polished

**Estimated Time:** 3-4 hours

---

### **STEP 7: Testing & Verification**

**Why seventh:** Ensures everything works correctly.

**Tasks:**
1. Unit tests (if applicable)
2. Integration tests
3. Security verification
4. User acceptance testing

**Acceptance Criteria:**
- [ ] All functions work correctly
- [ ] Security verified (no reverse lookup)
- [ ] User experience tested
- [ ] Edge cases handled

**Estimated Time:** 2-3 hours

---

### **STEP 8: Documentation & Deployment Prep**

**Why eighth:** Final preparation.

**Tasks:**
1. Update documentation
2. Create deployment checklist
3. Prepare for IRB review
4. Code review

**Acceptance Criteria:**
- [ ] Documentation complete
- [ ] Deployment plan ready
- [ ] IRB submission materials prepared

**Estimated Time:** 1-2 hours

---

## Where to Start: STEP 1 - Database Schema

### Action Plan for STEP 1

1. **Create migration file**
   - Create `jamie-backend/migrations/001_create_research_tables.sql`
   - Copy schema from implementation plan

2. **Test in local Supabase**
   - Run SQL in Supabase SQL Editor
   - Verify tables created
   - Test inserts

3. **Verify security**
   - Test RLS policies
   - Verify users can't read research tables
   - Verify service role can read

4. **Document**
   - Note any changes from plan
   - Document test results

---

## SDLC Best Practices We're Following

### ✅ Version Control
- Use git branches
- Commit after each completed step
- Write clear commit messages

### ✅ Incremental Development
- Build and test one component at a time
- Don't move forward until current step works
- Test at each phase

### ✅ Testing
- Test locally first
- Verify each function works
- Test edge cases

### ✅ Documentation
- Document as you go
- Update plans if changes needed
- Keep IRB documentation current

### ✅ Code Review
- Review before merging
- Check security implications
- Verify IRB compliance

---

## Git Workflow Recommendation

```bash
# Create feature branch
git checkout -b feature/irb-research-data

# After each step, commit
git add .
git commit -m "Step 1: Create research tables schema"

# When complete, merge to main
git checkout main
git merge feature/irb-research-data
```

---

## Next Immediate Actions

**Start with STEP 1: Database Schema**

1. Create the migration file
2. Test in your local/dev Supabase instance
3. Verify everything works
4. Then move to STEP 2

---

## Questions Before Starting?

- Do you have a local/dev Supabase instance set up?
- Are you ready to start with database schema?
- Any questions about the implementation plan?

**Ready to begin? Let's start with STEP 1: Database Schema!**

