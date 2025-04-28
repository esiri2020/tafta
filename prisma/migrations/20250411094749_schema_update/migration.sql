/*
  Warnings:

  - The values [EXISTING] on the enum `BusinessType` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "BusinessSize" AS ENUM ('MICRO', 'SMALL', 'MEDIUM', 'LARGE');

-- AlterEnum
BEGIN;
CREATE TYPE "BusinessType_new" AS ENUM ('INFORMAL', 'STARTUP', 'FORMAL_EXISTING');
ALTER TABLE "Profile" ALTER COLUMN "businessType" TYPE "BusinessType_new" USING ("businessType"::text::"BusinessType_new");
ALTER TYPE "BusinessType" RENAME TO "BusinessType_old";
ALTER TYPE "BusinessType_new" RENAME TO "BusinessType";
DROP TYPE "BusinessType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "additionalPhoneNumber" TEXT,
ADD COLUMN     "businessLGA" TEXT,
ADD COLUMN     "businessPartners" TEXT,
ADD COLUMN     "businessSector" TEXT,
ADD COLUMN     "businessSize" "BusinessSize",
ADD COLUMN     "businessState" TEXT,
ADD COLUMN     "companyEmail" TEXT,
ADD COLUMN     "companyPhoneNumber" TEXT,
ADD COLUMN     "countryOfBusiness" TEXT,
ADD COLUMN     "salaryRange" TEXT;
