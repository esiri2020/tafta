/*
  Warnings:

  - Made the column `enrollment_count` on table `RehydrationDate` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "RehydrationDate" ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "error" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'completed',
ALTER COLUMN "enrollment_count" SET NOT NULL;
