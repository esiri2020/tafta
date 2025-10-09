-- Check all mobilizers in the system
SELECT 
  m.id as mobilizer_id,
  m.code,
  m."fullName" as full_name,
  m.email,
  m.status,
  m."userId" as user_id,
  m."totalReferrals" as total_referrals,
  m."activeReferrals" as active_referrals,
  m."completedReferrals" as completed_referrals,
  u.email as user_email,
  u.role as user_role,
  u."firstName" as user_first_name,
  u."lastName" as user_last_name
FROM "Mobilizer" m
LEFT JOIN "User" u ON u.id = m."userId"
ORDER BY m."createdAt" DESC;

-- Check users with MOBILIZER role but no mobilizer record
SELECT 
  u.id as user_id,
  u.email,
  u."firstName",
  u."lastName",
  u.role,
  m.id as mobilizer_id
FROM "User" u
LEFT JOIN "Mobilizer" m ON m."userId" = u.id
WHERE u.role = 'MOBILIZER' AND m.id IS NULL;

-- Check mobilizers without user link
SELECT 
  m.id as mobilizer_id,
  m.code,
  m."fullName",
  m.email,
  m."userId"
FROM "Mobilizer" m
WHERE m."userId" IS NULL;

