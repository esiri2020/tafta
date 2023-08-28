/*
  Warnings:

  - Made the column `id` on table `Course` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Course" ALTER COLUMN "id" SET NOT NULL;
