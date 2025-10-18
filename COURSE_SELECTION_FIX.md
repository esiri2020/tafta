# 🎯 Course Selection Issue - Root Cause & Fix

## 🔴 THE REAL PROBLEM

You're absolutely right! The **root cause** is that **course selection data is NOT being saved to user profiles** during registration. This is why enrollment fails:

1. User selects a course during registration Step 0
2. Course selection SHOULD be saved to `Profile` table (`selectedCourse`, `selectedCourseId`, `selectedCourseName`)
3. **BUT** it's being stored in browser `sessionStorage` instead
4. During signup (Step 1), the form reads from `sessionStorage`
5. If `sessionStorage` is cleared/lost, course selection is **EMPTY**
6. User gets created with NO course info in profile
7. Email verification tries to create enrollment → **FAILS** because no course data!

---

## 🔍 Step 1: Diagnose the Problem

Run this SQL query to see how many users are affected:

```bash
psql $DATABASE_URL -f prisma/diagnose-course-selection-issue.sql
```

This will show you:
- ✅ Query 1: Users with verified email but NO course selection
- ✅ Query 2: Count of users with/without course selection
- ✅ Query 3: Available courses in active cohorts
- ✅ Query 4: Users with enrollments but missing profile course data
- ✅ Query 5: Recent registrations (last 7 days) and their data
- ✅ Query 6: Summary statistics
- ✅ Query 7: Trend analysis - when did the problem start?

---

## 🛠️ Step 2: Fix Existing Users

### Option A: Backfill from Enrollments

For users who HAVE enrollments but missing profile data:

```sql
-- Update Profile with course info from existing Enrollments
UPDATE "Profile" p
SET 
  "selectedCourseId" = e.course_id::text,
  "selectedCourseName" = e.course_name,
  "selectedCourse" = uc.id  -- Use userCohortId as selectedCourse
FROM "User" u
JOIN "UserCohort" uc ON uc."userId" = u.id
JOIN "Enrollment" e ON e."userCohortId" = uc.id
WHERE p."userId" = u.id
  AND u."emailVerified" IS NOT NULL
  AND u.role = 'APPLICANT'
  AND (p."selectedCourse" IS NULL OR p."selectedCourse" = '')
  AND e.uid IS NOT NULL;
```

### Option B: Manual Assignment

For users with NO enrollments and NO course selection:

```sql
-- See the list first
SELECT 
  u.email,
  u."firstName",
  u."lastName",
  c.name as cohort_name,
  u.id as user_id,
  p.id as profile_id
FROM "User" u
JOIN "Profile" p ON p."userId" = u.id
LEFT JOIN "UserCohort" uc ON uc."userId" = u.id
LEFT JOIN "Cohort" c ON c.id = uc."cohortId"
LEFT JOIN "Enrollment" e ON e."userCohortId" = uc.id
WHERE u."emailVerified" IS NOT NULL
  AND u.role = 'APPLICANT'
  AND (p."selectedCourse" IS NULL OR p."selectedCourse" = '')
  AND e.uid IS NULL
ORDER BY u."emailVerified" DESC;

-- Then contact these users to ask which course they wanted
-- Or assign a default course
```

---

## 💻 Step 3: Fix the Code

### Problem 1: SessionStorage is Unreliable

**Issue**: Course selection is stored in browser `sessionStorage`, which can be:
- Cleared by user
- Lost on page refresh in some browsers
- Not available in incognito mode
- Cleared between tabs

**Current Code** (`components/home/register-step0-new.js` lines 102-109):
```javascript
// ❌ Reading from sessionStorage - can be empty!
const selectedCourse = sessionStorage.getItem('selectedCourse') || '';
const selectedCohortId = sessionStorage.getItem('selectedCohortId') || '';
const selectedCourseName = sessionStorage.getItem('selectedCourseName') || '';
const selectedCourseActualId = sessionStorage.getItem('selectedCourseActualId') || '';
```

**Fix Option 1**: Validate that sessionStorage has values
**Fix Option 2**: Store in URL parameters as backup
**Fix Option 3**: Make course selection happen AFTER user account creation

### Problem 2: Conditional Spread in Signup API

**Current Code** (`pages/api/auth/signup.ts` lines 197-199):
```typescript
const profileData = {
  ...otherProfileFields,
  ...(selectedCourse && {selectedCourse}),  // ❌ Only saves if truthy!
  ...(selectedCourseName && {selectedCourseName}),
  ...(selectedCourseId && {selectedCourseId}),
  cohortId: profileCohortId || cohortId || '',
};
```

If `selectedCourse` is empty string or null, it **won't be saved**.

**Fix**: Always save these fields, even if empty (for debugging):
```typescript
const profileData = {
  ...otherProfileFields,
  selectedCourse: selectedCourse || null,
  selectedCourseName: selectedCourseName || null,
  selectedCourseId: selectedCourseId || null,
  cohortId: profileCohortId || cohortId || '',
};
```

### Problem 3: No Validation

Users can somehow skip or bypass course selection.

**Fix**: Add server-side validation in signup API:
```typescript
// In pages/api/auth/signup.ts, after line 173
if (profile) {
  const {
    selectedCourse,
    selectedCourseName,
    selectedCourseId,
    cohortId: profileCohortId,
    ...otherProfileFields
  } = profile;

  // ✅ ADD THIS VALIDATION
  if (!selectedCourse || !selectedCourseName || !selectedCourseId) {
    console.error('❌ Missing course selection:', {
      selectedCourse,
      selectedCourseName,
      selectedCourseId,
      fullProfile: profile
    });
    
    return res.status(400).send({
      message: 'Course selection is required. Please go back and select a course.',
      error: 'MISSING_COURSE_SELECTION'
    });
  }
  
  console.log('✅ Course selection validated:', {
    selectedCourse,
    selectedCourseName,
    selectedCourseId
  });
```

---

## 🎯 Recommended Solution (Multi-Step Fix)

### Phase 1: Immediate (Today)

```bash
# 1. Run diagnostic to see scope
psql $DATABASE_URL -f prisma/diagnose-course-selection-issue.sql > diagnosis.txt

# 2. Backfill existing users from enrollments
psql $DATABASE_URL -c "
UPDATE \"Profile\" p
SET 
  \"selectedCourseId\" = e.course_id::text,
  \"selectedCourseName\" = e.course_name,
  \"selectedCourse\" = uc.id
FROM \"User\" u
JOIN \"UserCohort\" uc ON uc.\"userId\" = u.id
JOIN \"Enrollment\" e ON e.\"userCohortId\" = uc.id
WHERE p.\"userId\" = u.id
  AND u.\"emailVerified\" IS NOT NULL
  AND (p.\"selectedCourse\" IS NULL OR p.\"selectedCourse\" = '')
  AND e.uid IS NOT NULL;
"

# 3. Now run the fix-all script
npx tsx scripts/manual-enroll-user.ts --all
```

### Phase 2: Code Fix (Today)

1. **Add validation** to `pages/api/auth/signup.ts` (see Problem 3 above)
2. **Always save** course fields (see Problem 2 above)
3. **Add logging** to see when course data is missing

### Phase 3: Prevent Future Issues

1. **Add required indicator** to course selection UI
2. **Add JavaScript validation** before allowing "Continue" button
3. **Store in URL as backup** in addition to sessionStorage
4. **Add health check** endpoint to monitor registration success rate

---

## 📊 Monitoring Queries

### Daily Check: Users Without Course Selection
```sql
SELECT COUNT(*) as users_without_course_selection
FROM "User" u
JOIN "Profile" p ON p."userId" = u.id
WHERE u."emailVerified" IS NOT NULL
  AND u.role = 'APPLICANT'
  AND (p."selectedCourse" IS NULL OR p."selectedCourse" = '');
```

**Target**: Should be 0

### Weekly Trend: Registration Success Rate
```sql
SELECT 
  DATE(u."createdAt") as date,
  COUNT(*) as total_registrations,
  COUNT(CASE WHEN p."selectedCourse" IS NOT NULL AND p."selectedCourse" != '' THEN 1 END) as with_course,
  COUNT(CASE WHEN e.enrolled = true THEN 1 END) as enrolled,
  ROUND(100.0 * COUNT(CASE WHEN e.enrolled = true THEN 1 END) / COUNT(*), 2) as enrollment_rate_percent
FROM "User" u
LEFT JOIN "Profile" p ON p."userId" = u.id
LEFT JOIN "UserCohort" uc ON uc."userId" = u.id
LEFT JOIN "Enrollment" e ON e."userCohortId" = uc.id
WHERE u.role = 'APPLICANT'
  AND u."createdAt" >= NOW() - INTERVAL '7 days'
GROUP BY DATE(u."createdAt")
ORDER BY date DESC;
```

**Target**: enrollment_rate_percent > 95%

---

## 🚨 Quick Test

To verify the fix is working:

1. **Test Registration Flow**:
   - Open browser DevTools → Application → Session Storage
   - Start registration
   - Select a course
   - Check if sessionStorage has all 4 keys:
     - `selectedCourse`
     - `selectedCohortId`
     - `selectedCourseName`
     - `selectedCourseActualId`
   - Complete registration
   - Verify email
   - Check if enrolled

2. **Test Edge Case** (sessionStorage cleared):
   - Select course
   - Open DevTools → Application → Session Storage → Clear
   - Continue to Step 1 (registration form)
   - Submit form
   - **Expected**: Should show error "Course selection is required"

---

## 📝 Summary

| Issue | Impact | Fix |
|-------|--------|-----|
| sessionStorage unreliable | Course data lost | Add validation + URL backup |
| Conditional spread operators | Empty values not saved | Always save fields |
| No server validation | Users bypass selection | Add required field check |
| Existing users stuck | Can't enroll | Backfill from enrollments |

**Estimated Fix Time**: 
- Backfill existing users: 5 minutes
- Code fixes: 30 minutes
- Testing: 15 minutes
- **Total**: ~1 hour

---

**Next Step**: Run the diagnostic query to see the exact numbers!

```bash
psql $DATABASE_URL -f prisma/diagnose-course-selection-issue.sql
```

