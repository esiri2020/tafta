/*
  Warnings:

  - The primary key for the `Cohort` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Course` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Enrollment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `userId` on the `Enrollment` table. All the data in the column will be lost.
  - The `percentage_completed` column on the `Enrollment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Location` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `_CourseToLocation` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `color` to the `Cohort` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Cohort` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userCohortId` to the `Enrollment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Course" DROP CONSTRAINT "Course_cohort_id_fkey";

-- DropForeignKey
ALTER TABLE "Enrollment" DROP CONSTRAINT "Enrollment_userId_fkey";

-- DropForeignKey
ALTER TABLE "_CourseToLocation" DROP CONSTRAINT "_CourseToLocation_A_fkey";

-- DropForeignKey
ALTER TABLE "_CourseToLocation" DROP CONSTRAINT "_CourseToLocation_B_fkey";

-- AlterTable
ALTER TABLE "Cohort" DROP CONSTRAINT "Cohort_pkey",
ADD COLUMN     "color" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "active" SET DEFAULT true,
ADD CONSTRAINT "Cohort_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Cohort_id_seq";

-- AlterTable
ALTER TABLE "Course" DROP CONSTRAINT "Course_pkey",
ALTER COLUMN "uid" DROP DEFAULT,
ALTER COLUMN "uid" SET DATA TYPE TEXT,
ALTER COLUMN "cohort_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Course_pkey" PRIMARY KEY ("uid");
DROP SEQUENCE "Course_uid_seq";

-- AlterTable
ALTER TABLE "Enrollment" DROP CONSTRAINT "Enrollment_pkey",
DROP COLUMN "userId",
ADD COLUMN     "userCohortId" TEXT NOT NULL,
ALTER COLUMN "uid" DROP DEFAULT,
ALTER COLUMN "uid" SET DATA TYPE TEXT,
DROP COLUMN "percentage_completed",
ADD COLUMN     "percentage_completed" DOUBLE PRECISION,
ADD CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("uid");
DROP SEQUENCE "Enrollment_uid_seq";

-- AlterTable
ALTER TABLE "Location" DROP CONSTRAINT "Location_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Location_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Location_id_seq";

-- DropTable
DROP TABLE "_CourseToLocation";

-- CreateTable
CREATE TABLE "UserCohort" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cohortId" TEXT NOT NULL,
    "locationId" TEXT,

    CONSTRAINT "UserCohort_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CohortCourse" (
    "id" TEXT NOT NULL,
    "cohortId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,

    CONSTRAINT "CohortCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CohortCourseToLocation" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_CohortCourseToLocation_AB_unique" ON "_CohortCourseToLocation"("A", "B");

-- CreateIndex
CREATE INDEX "_CohortCourseToLocation_B_index" ON "_CohortCourseToLocation"("B");

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_userCohortId_fkey" FOREIGN KEY ("userCohortId") REFERENCES "UserCohort"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCohort" ADD CONSTRAINT "UserCohort_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCohort" ADD CONSTRAINT "UserCohort_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "Cohort"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCohort" ADD CONSTRAINT "UserCohort_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CohortCourse" ADD CONSTRAINT "CohortCourse_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "Cohort"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CohortCourse" ADD CONSTRAINT "CohortCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CohortCourseToLocation" ADD CONSTRAINT "_CohortCourseToLocation_A_fkey" FOREIGN KEY ("A") REFERENCES "CohortCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CohortCourseToLocation" ADD CONSTRAINT "_CohortCourseToLocation_B_fkey" FOREIGN KEY ("B") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;
