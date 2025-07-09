/*
  Warnings:

  - You are about to drop the column `cohortId` on the `RehydrationProgress` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `RehydrationProgress` table. All the data in the column will be lost.
  - You are about to drop the column `cycle` on the `RehydrationProgress` table. All the data in the column will be lost.
  - You are about to drop the column `lastCycleDate` on the `RehydrationProgress` table. All the data in the column will be lost.
  - You are about to drop the column `lastEnrollmentUid` on the `RehydrationProgress` table. All the data in the column will be lost.
  - You are about to drop the column `lastUpdatedAt` on the `RehydrationProgress` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "RehydrationDate" ALTER COLUMN "enrollment_count" DROP NOT NULL;

-- AlterTable
ALTER TABLE "RehydrationProgress" DROP COLUMN "cohortId",
DROP COLUMN "createdAt",
DROP COLUMN "cycle",
DROP COLUMN "lastCycleDate",
DROP COLUMN "lastEnrollmentUid",
DROP COLUMN "lastUpdatedAt",
ADD COLUMN     "lastPageProcessed" INTEGER,
ADD COLUMN     "totalPages" INTEGER;
