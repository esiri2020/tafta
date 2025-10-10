-- Check a specific user's enrollment data and course selection
-- Replace the email with the user you want to check

SELECT 
  -- User Info
  u.id as user_id,
  u.email,
  u."firstName",
  u."lastName",
  u."emailVerified",
  u.thinkific_user_id,
  u."createdAt" as registered_at,
  
  -- Profile Info (where course selection is stored)
  p.id as profile_id,
  p."selectedCourse" as selected_course_uid,
  p."selectedCourseName" as selected_course_name,
  p."selectedCourseId" as selected_course_actual_id,
  p."cohortId" as selected_cohort_id,
  
  -- Cohort Info
  c.name as cohort_name,
  c.active as cohort_active,
  c.start_date,
  c.end_date,
  
  -- Enrollment Info
  e.uid as enrollment_uid,
  e.id as enrollment_id,
  e.course_id as enrollment_course_id,
  e.course_name as enrollment_course_name,
  e.enrolled as is_enrolled_on_thinkific,
  e.created_at as enrollment_created_at,
  e.activated_at as enrollment_activated_at,
  
  -- UserCohort Info
  uc.id as user_cohort_id,
  uc."cohortId" as user_cohort_cohort_id

FROM "User" u
LEFT JOIN "Profile" p ON p."userId" = u.id
LEFT JOIN "UserCohort" uc ON uc."userId" = u.id
LEFT JOIN "Cohort" c ON c.id = uc."cohortId"
LEFT JOIN "Enrollment" e ON e."userCohortId" = uc.id
WHERE u.email = 'adedejiracheal95@gmail.com';  -- Change this email

-- Also check what's in the Course table to see available courses
SELECT 
  cc.id as cohort_course_id,
  c.id as course_actual_id,
  c.name as course_name,
  coh.name as cohort_name,
  coh.id as cohort_id
FROM "CohortCourse" cc
JOIN "Course" c ON c.id = cc.course_id
JOIN "Cohort" coh ON coh.id = cc."cohortId"
WHERE coh.active = true
ORDER BY coh.name, c.name;

