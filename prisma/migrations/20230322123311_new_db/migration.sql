/*
  Warnings:

  - Added the required column `course_id` to the `CohortCourse` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CohortCourse" DROP CONSTRAINT "CohortCourse_courseId_fkey";

-- AlterTable
ALTER TABLE "CohortCourse" ADD COLUMN     "course_id" BIGINT NOT NULL;

-- AddForeignKey
ALTER TABLE "CohortCourse" ADD CONSTRAINT "CohortCourse_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
