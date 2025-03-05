-- CreateEnum
CREATE TYPE "InternshipProgram" AS ENUM ('TheatreGroup', 'ShortFilm', 'MarketingCommunication', 'CreativeManagementConsultant', 'SponsorshipMarketers', 'ContentCreationSkits');

-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('GroupInternship', 'IndividualInternship', 'CorporateInternship');

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "internshipProgram" "InternshipProgram",
ADD COLUMN     "projectType" "ProjectType";
