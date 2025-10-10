-- Find verified users without Thinkific ID
-- These users need manual intervention

SELECT 
  u.id,
  u.email,
  u."firstName",
  u."lastName",
  u."emailVerified",
  u.thinkific_user_id,
  u.role,
  u."createdAt",
  e.uid as enrollment_uid,
  e.enrolled,
  e.course_name,
  e.course_id,
  c.name as cohort_name
FROM "User" u
LEFT JOIN "UserCohort" uc ON uc."userId" = u.id
LEFT JOIN "Enrollment" e ON e."userCohortId" = uc.id
LEFT JOIN "Cohort" c ON c.id = uc."cohortId"
WHERE u."emailVerified" IS NOT NULL
  AND u.thinkific_user_id IS NULL
  AND u.role = 'APPLICANT'
ORDER BY u."emailVerified" DESC;

-- Count by creation date to see if there's a pattern
SELECT 
  DATE(u."createdAt") as registration_date,
  COUNT(*) as affected_users
FROM "User" u
WHERE u."emailVerified" IS NOT NULL
  AND u.thinkific_user_id IS NULL
  AND u.role = 'APPLICANT'
GROUP BY DATE(u."createdAt")
ORDER BY registration_date DESC;

-- Find users who were deleted and re-registered
SELECT 
  email,
  COUNT(*) as registration_count
FROM "User"
WHERE role = 'APPLICANT'
GROUP BY email
HAVING COUNT(*) > 1;

