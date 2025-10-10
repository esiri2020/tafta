-- ========================================
-- COURSE SELECTION DIAGNOSTIC QUERY
-- Find why users don't have course info saved
-- ========================================

-- 1️⃣ Users with email verified but NO course selection in profile
SELECT 
  '1. No Course Selection' as issue,
  u.id,
  u.email,
  u."firstName",
  u."lastName",
  u."emailVerified",
  u.thinkific_user_id,
  p."selectedCourse",
  p."selectedCourseName",
  p."selectedCourseId",
  p."cohortId",
  uc."cohortId" as user_cohort_cohort_id,
  c.name as cohort_name
FROM "User" u
LEFT JOIN "Profile" p ON p."userId" = u.id
LEFT JOIN "UserCohort" uc ON uc."userId" = u.id
LEFT JOIN "Cohort" c ON c.id = uc."cohortId"
WHERE u."emailVerified" IS NOT NULL
  AND u.role = 'APPLICANT'
  AND (p."selectedCourse" IS NULL 
    OR p."selectedCourseName" IS NULL 
    OR p."selectedCourseId" IS NULL
    OR p."selectedCourse" = ''
    OR p."selectedCourseName" = ''
    OR p."selectedCourseId" = '')
ORDER BY u."emailVerified" DESC
LIMIT 20;

-- 2️⃣ Count of users by course selection status
SELECT 
  CASE 
    WHEN p."selectedCourse" IS NOT NULL AND p."selectedCourse" != '' THEN 'Has Course Selection'
    WHEN p."selectedCourse" IS NULL OR p."selected Course" = '' THEN 'No Course Selection'
  END as status,
  COUNT(*) as user_count
FROM "User" u
LEFT JOIN "Profile" p ON p."userId" = u.id
WHERE u."emailVerified" IS NOT NULL
  AND u.role = 'APPLICANT'
GROUP BY 
  CASE 
    WHEN p."selectedCourse" IS NOT NULL AND p."selectedCourse" != '' THEN 'Has Course Selection'
    WHEN p."selectedCourse" IS NULL OR p."selectedCourse" = '' THEN 'No Course Selection'
  END;

-- 3️⃣ Check if there are active cohorts WITH courses available
SELECT 
  c.id as cohort_id,
  c.name as cohort_name,
  c.active,
  c.start_date,
  c.end_date,
  COUNT(cc.id) as course_count,
  STRING_AGG(co.name, ', ') as available_courses
FROM "Cohort" c
LEFT JOIN "CohortCourse" cc ON cc."cohortId" = c.id
LEFT JOIN "Course" co ON co.id = cc.course_id
WHERE c.active = true
GROUP BY c.id, c.name, c.active, c.start_date, c.end_date
ORDER BY c.start_date DESC;

-- 4️⃣ Users with enrollments but NO course selection in profile
-- This shows the mismatch between enrollment and profile
SELECT 
  u.email,
  u."firstName",
  u."lastName",
  p."selectedCourse" as profile_course,
  p."selectedCourseName" as profile_course_name,
  p."selectedCourseId" as profile_course_id,
  e.course_name as enrollment_course_name,
  e.course_id as enrollment_course_id,
  e.enrolled as is_enrolled,
  e.created_at as enrollment_created_at
FROM "User" u
LEFT JOIN "Profile" p ON p."userId" = u.id
LEFT JOIN "UserCohort" uc ON uc."userId" = u.id
LEFT JOIN "Enrollment" e ON e."userCohortId" = uc.id
WHERE u."emailVerified" IS NOT NULL
  AND u.role = 'APPLICANT'
  AND e.uid IS NOT NULL
  AND (p."selectedCourse" IS NULL OR p."selectedCourse" = '')
ORDER BY e.created_at DESC
LIMIT 20;

-- 5️⃣ Recent users who registered (last 7 days) - check their data
SELECT 
  u.id,
  u.email,
  u."firstName",
  u."createdAt" as registration_date,
  u."emailVerified" as verification_date,
  p."selectedCourse",
  p."selectedCourseName",
  p."selectedCourseId",
  p."cohortId" as profile_cohort_id,
  uc."cohortId" as user_cohort_id,
  c.name as cohort_name,
  e.course_name as enrollment_course,
  e.enrolled as is_enrolled
FROM "User" u
LEFT JOIN "Profile" p ON p."userId" = u.id
LEFT JOIN "UserCohort" uc ON uc."userId" = u.id
LEFT JOIN "Cohort" c ON c.id = uc."cohortId"
LEFT JOIN "Enrollment" e ON e."userCohortId" = uc.id
WHERE u.role = 'APPLICANT'
  AND u."createdAt" >= NOW() - INTERVAL '7 days'
ORDER BY u."createdAt" DESC
LIMIT 30;

-- 6️⃣ Summary: Registration completeness
SELECT 
  'Total Verified Users' as metric,
  COUNT(*) as count
FROM "User"
WHERE "emailVerified" IS NOT NULL AND role = 'APPLICANT'

UNION ALL

SELECT 
  'With Course Selection',
  COUNT(*)
FROM "User" u
JOIN "Profile" p ON p."userId" = u.id
WHERE u."emailVerified" IS NOT NULL 
  AND u.role = 'APPLICANT'
  AND p."selectedCourse" IS NOT NULL 
  AND p."selectedCourse" != ''

UNION ALL

SELECT 
  'With Enrollment Record',
  COUNT(DISTINCT u.id)
FROM "User" u
JOIN "UserCohort" uc ON uc."userId" = u.id
JOIN "Enrollment" e ON e."userCohortId" = uc.id
WHERE u."emailVerified" IS NOT NULL 
  AND u.role = 'APPLICANT'

UNION ALL

SELECT 
  'With Active Enrollment',
  COUNT(DISTINCT u.id)
FROM "User" u
JOIN "UserCohort" uc ON uc."userId" = u.id
JOIN "Enrollment" e ON e."userCohortId" = uc.id
WHERE u."emailVerified" IS NOT NULL 
  AND u.role = 'APPLICANT'
  AND e.enrolled = true;

-- 7️⃣ Find patterns: When did the issue start?
SELECT 
  DATE(u."createdAt") as registration_date,
  COUNT(*) as total_users,
  COUNT(CASE WHEN p."selectedCourse" IS NOT NULL AND p."selectedCourse" != '' THEN 1 END) as with_course_selection,
  COUNT(CASE WHEN p."selectedCourse" IS NULL OR p."selectedCourse" = '' THEN 1 END) as without_course_selection,
  ROUND(100.0 * COUNT(CASE WHEN p."selectedCourse" IS NOT NULL AND p."selectedCourse" != '' THEN 1 END) / COUNT(*), 2) as selection_rate_percent
FROM "User" u
LEFT JOIN "Profile" p ON p."userId" = u.id
WHERE u.role = 'APPLICANT'
  AND u."createdAt" >= NOW() - INTERVAL '30 days'
GROUP BY DATE(u."createdAt")
ORDER BY registration_date DESC;

