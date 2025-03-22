/*
  Warnings:

  - The `internshipProgram` column on the `Profile` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `projectType` column on the `Profile` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "InternshipProgramOption" AS ENUM ('TheatreGroup', 'ShortFilm', 'MarketingCommunication', 'CreativeManagementConsultant', 'SponsorshipMarketers', 'ContentCreationSkits');

-- CreateEnum
CREATE TYPE "ProjectTypeOption" AS ENUM ('GroupInternship', 'IndividualInternship', 'CorporateInternship');

-- CreateEnum
CREATE TYPE "RegistrationType" AS ENUM ('INDIVIDUAL', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "BusinessType" AS ENUM ('STARTUP', 'EXISTING');

-- CreateEnum
CREATE TYPE "BusinessRegistrationType" AS ENUM ('CAC', 'SMEDAN');

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "businessName" TEXT,
ADD COLUMN     "businessSupportNeeds" TEXT[],
ADD COLUMN     "businessType" "BusinessType",
ADD COLUMN     "currentSalary" DOUBLE PRECISION,
ADD COLUMN     "registrationPath" "RegistrationType" NOT NULL DEFAULT 'INDIVIDUAL',
ADD COLUMN     "registrationType" "BusinessRegistrationType",
ADD COLUMN     "revenueRange" TEXT,
ADD COLUMN     "salaryExpectation" DOUBLE PRECISION,
ADD COLUMN     "type" "RegistrationType" NOT NULL DEFAULT 'INDIVIDUAL',
DROP COLUMN "internshipProgram",
ADD COLUMN     "internshipProgram" "InternshipProgramOption",
DROP COLUMN "projectType",
ADD COLUMN     "projectType" "ProjectTypeOption";

-- DropEnum
DROP TYPE "InternshipProgram";

-- DropEnum
DROP TYPE "ProjectType";
