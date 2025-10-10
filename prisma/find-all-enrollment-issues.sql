-- =====================================================
-- COMPREHENSIVE ENROLLMENT ISSUE FINDER
-- Find ALL users who have verified email but enrollment issues
-- =====================================================

-- 1️⃣ VERIFIED USERS WITH NO THINKIFIC ID (Highest Priority)
-- These users are stuck and need immediate attention
SELECT 
  '1. No Thinkific ID' as issue_type,
  u.id as user_id,
  u.email,
  u."firstName",
  u."lastName",
  u."emailVerified" as verified_at,
  u.thinkific_user_id,
  u."createdAt" as registered_at,
  e.uid as enrollment_uid,
  e.enrolled as enrolled_on_thinkific,
  e.course_name,
  e.course_id,
  c.name as cohort_name,
  p."selectedCourseName" as profile_selected_course
FROM "User" u
LEFT JOIN "Profile" p ON p."userId" = u.id
LEFT JOIN "UserCohort" uc ON uc."userId" = u.id
LEFT JOIN "Enrollment" e ON e."userCohortId" = uc.id
LEFT JOIN "Cohort" c ON c.id = uc."cohortId"
WHERE u."emailVerified" IS NOT NULL
  AND u.thinkific_user_id IS NULL
  AND u.role = 'APPLICANT'
ORDER BY u."emailVerified" DESC;

-- 2️⃣ VERIFIED USERS WITH INACTIVE ENROLLMENTS (Has Thinkific ID but not enrolled)
-- These users have Thinkific account but enrollment failed
SELECT 
  '2. Has Thinkific ID but Not Enrolled' as issue_type,
  u.id as user_id,
  u.email,
  u."firstName",
  u."lastName",
  u."emailVerified" as verified_at,
  u.thinkific_user_id,
  e.uid as enrollment_uid,
  e.enrolled as enrolled_on_thinkific,
  e.course_name,
  e.course_id,
  e.activated_at,
  c.name as cohort_name
FROM "User" u
JOIN "UserCohort" uc ON uc."userId" = u.id
JOIN "Enrollment" e ON e."userCohortId" = uc.id
LEFT JOIN "Cohort" c ON c.id = uc."cohortId"
WHERE u."emailVerified" IS NOT NULL
  AND u.thinkific_user_id IS NOT NULL
  AND e.enrolled = false
  AND u.role = 'APPLICANT'
ORDER BY u."emailVerified" DESC;

-- 3️⃣ VERIFIED USERS WITH NO ENROLLMENT RECORD AT ALL
-- These users verified but have no enrollment created
SELECT 
  '3. No Enrollment Record' as issue_type,
  u.id as user_id,
  u.email,
  u."firstName",
  u."lastName",
  u."emailVerified" as verified_at,
  u.thinkific_user_id,
  uc.id as user_cohort_id,
  c.name as cohort_name,
  p."selectedCourseName" as profile_selected_course,
  p."selectedCourseId" as profile_selected_course_id
FROM "User" u
LEFT JOIN "Profile" p ON p."userId" = u.id
LEFT JOIN "UserCohort" uc ON uc."userId" = u.id
LEFT JOIN "Enrollment" e ON e."userCohortId" = uc.id
LEFT JOIN "Cohort" c ON c.id = uc."cohortId"
WHERE u."emailVerified" IS NOT NULL
  AND u.role = 'APPLICANT'
  AND uc.id IS NOT NULL  -- Has cohort
  AND e.uid IS NULL      -- But NO enrollment
ORDER BY u."emailVerified" DESC;

-- 4️⃣ SUMMARY COUNTS BY ISSUE TYPE
SELECT 
  'No Thinkific ID' as issue,
  COUNT(*) as affected_count
FROM "User" u
WHERE u."emailVerified" IS NOT NULL
  AND u.thinkific_user_id IS NULL
  AND u.role = 'APPLICANT'

UNION ALL

SELECT 
  'Has Thinkific ID but Not Enrolled' as issue,
  COUNT(*) as affected_count
FROM "User" u
JOIN "UserCohort" uc ON uc."userId" = u.id
JOIN "Enrollment" e ON e."userCohortId" = uc.id
WHERE u."emailVerified" IS NOT NULL
  AND u.thinkific_user_id IS NOT NULL
  AND e.enrolled = false
  AND u.role = 'APPLICANT'

UNION ALL

SELECT 
  'No Enrollment Record' as issue,
  COUNT(*) as affected_count
FROM "User" u
LEFT JOIN "UserCohort" uc ON uc."userId" = u.id
LEFT JOIN "Enrollment" e ON e."userCohortId" = uc.id
WHERE u."emailVerified" IS NOT NULL
  AND u.role = 'APPLICANT'
  AND uc.id IS NOT NULL
  AND e.uid IS NULL;

-- 5️⃣ COUNT BY REGISTRATION DATE (to find patterns)
SELECT 
  DATE(u."createdAt") as registration_date,
  COUNT(DISTINCT CASE WHEN u.thinkific_user_id IS NULL THEN u.id END) as missing_thinkific_id,
  COUNT(DISTINCT CASE WHEN u.thinkific_user_id IS NOT NULL AND e.enrolled = false THEN u.id END) as not_enrolled,
  COUNT(DISTINCT CASE WHEN e.uid IS NULL AND uc.id IS NOT NULL THEN u.id END) as no_enrollment_record,
  COUNT(DISTINCT u.id) as total_verified
FROM "User" u
LEFT JOIN "UserCohort" uc ON uc."userId" = u.id
LEFT JOIN "Enrollment" e ON e."userCohortId" = uc.id
WHERE u."emailVerified" IS NOT NULL
  AND u.role = 'APPLICANT'
GROUP BY DATE(u."createdAt")
HAVING COUNT(DISTINCT CASE WHEN u.thinkific_user_id IS NULL THEN u.id END) > 0
    OR COUNT(DISTINCT CASE WHEN e.enrolled = false THEN u.id END) > 0
    OR COUNT(DISTINCT CASE WHEN e.uid IS NULL AND uc.id IS NOT NULL THEN u.id END) > 0
ORDER BY registration_date DESC;

-- 6️⃣ CHECK FAILED ENROLLMENT TABLE (if migration was run)
SELECT 
  fe.id,
  fe."userId",
  u.email,
  fe."enrollmentUid",
  fe.error,
  fe."errorDetails",
  fe."retryCount",
  fe."lastRetryAt",
  fe."resolvedAt",
  fe."createdAt"
FROM "FailedEnrollment" fe
JOIN "User" u ON u.id = fe."userId"
WHERE fe."resolvedAt" IS NULL
ORDER BY fe."createdAt" DESC;

-- 7️⃣ EXPORT ALL AFFECTED USER EMAILS (for batch processing)
-- Copy this list to use with the manual enrollment script
\echo '📧 All Affected User Emails:'
SELECT u.email
FROM "User" u
LEFT JOIN "UserCohort" uc ON uc."userId" = u.id
LEFT JOIN "Enrollment" e ON e."userCohortId" = uc.id
WHERE u."emailVerified" IS NOT NULL
  AND u.role = 'APPLICANT'
  AND (
    u.thinkific_user_id IS NULL
    OR (e.uid IS NOT NULL AND e.enrolled = false)
    OR (uc.id IS NOT NULL AND e.uid IS NULL)
  )
ORDER BY u."emailVerified" DESC;

