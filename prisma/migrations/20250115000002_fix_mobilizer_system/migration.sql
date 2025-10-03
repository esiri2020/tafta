-- Fix mobilizer system to use existing Referrer table instead of MobilizerCode

-- Drop the redundant MobilizerCode table
DROP TABLE IF EXISTS "MobilizerCode";

-- Remove mobilizerCode and mobilizerId from Profile table since we'll use Referrer table
ALTER TABLE "Profile" DROP COLUMN IF EXISTS "mobilizerCode";
ALTER TABLE "Profile" DROP COLUMN IF EXISTS "mobilizerId";

-- Remove mobilizerId from User table since we'll link via Referrer
ALTER TABLE "User" DROP COLUMN IF EXISTS "mobilizerId";

-- Drop the _MobilizerReferrals table since we'll use Referrer table
DROP TABLE IF EXISTS "_MobilizerReferrals";

-- Add a relationship between Mobilizer and Referrer
-- We'll link them by matching Mobilizer.code with Referrer.fullName
-- This will be handled in application logic, not database constraints
