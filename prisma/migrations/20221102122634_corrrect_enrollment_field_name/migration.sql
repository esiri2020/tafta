/*
  Warnings:

  - You are about to drop the column `percentage_complete` on the `Enrollment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Enrollment" DROP COLUMN "percentage_complete",
ADD COLUMN     "percentage_completed" TEXT;
