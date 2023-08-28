-- CreateEnum
CREATE TYPE "CommunityArea" AS ENUM ('URBAN', 'RURAL', 'PERI_URBANS');

-- CreateEnum
CREATE TYPE "EducationLevel" AS ENUM ('ELEMENTRY_SCHOOL', 'SECONDARY_SCHOOL', 'COLLEGE_OF_EDUCATION', 'ND_HND', 'BSC', 'MSC', 'PHD');

-- DropForeignKey
ALTER TABLE "UserCohort" DROP CONSTRAINT "UserCohort_cohortId_fkey";

-- DropForeignKey
ALTER TABLE "UserCohort" DROP CONSTRAINT "UserCohort_locationId_fkey";

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "communityArea" "CommunityArea",
ADD COLUMN     "disability" TEXT,
ADD COLUMN     "educationLevel" "EducationLevel";

-- AddForeignKey
ALTER TABLE "UserCohort" ADD CONSTRAINT "UserCohort_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "Cohort"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCohort" ADD CONSTRAINT "UserCohort_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
