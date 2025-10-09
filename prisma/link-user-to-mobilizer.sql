-- Script to link an existing user to a mobilizer record
-- 
-- OPTION 1: Create a new Mobilizer record for an existing user
-- Replace the placeholders with actual values
/*
INSERT INTO "Mobilizer" (
  id,
  code,
  "fullName",
  email,
  "phoneNumber",
  organization,
  status,
  "createdAt",
  "updatedAt",
  "userId",
  "totalReferrals",
  "activeReferrals",
  "completedReferrals"
)
VALUES (
  gen_random_uuid()::text, -- Generates a new UUID
  'MOB001', -- Replace with desired mobilizer code
  'John Doe', -- Replace with mobilizer's full name
  'user@example.com', -- Replace with user's email
  '+1234567890', -- Replace with phone number (or NULL)
  'Organization Name', -- Replace with organization (or NULL)
  'ACTIVE', -- Status: ACTIVE, INACTIVE, or PENDING
  NOW(),
  NOW(),
  'user_id_here', -- Replace with the actual User.id from the User table
  0, -- Initial totalReferrals
  0, -- Initial activeReferrals
  0 -- Initial completedReferrals
);
*/

-- OPTION 2: Link an existing Mobilizer record to a user
-- Replace the placeholders with actual values
/*
UPDATE "Mobilizer"
SET "userId" = 'user_id_here' -- Replace with the actual User.id
WHERE code = 'mobilizer_code_here'; -- Replace with the actual mobilizer code
*/

-- OPTION 3: Update user role to MOBILIZER (if needed)
/*
UPDATE "User"
SET role = 'MOBILIZER'
WHERE id = 'user_id_here'; -- Replace with the actual User.id
*/

-- Verification query - Check if user is properly linked
-- Replace 'user_email_here' with the actual user email
/*
SELECT 
  u.id as user_id,
  u.email,
  u."firstName",
  u."lastName",
  u.role,
  m.id as mobilizer_id,
  m.code as mobilizer_code,
  m."fullName" as mobilizer_name,
  m.status as mobilizer_status
FROM "User" u
LEFT JOIN "Mobilizer" m ON m."userId" = u.id
WHERE u.email = 'user_email_here';
*/

