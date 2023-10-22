/*
  Warnings:

  - You are about to drop the column `city` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `department` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `Profile` table. All the data in the column will be lost.
  - The `dob` column on the `Profile` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "city",
DROP COLUMN "department",
DROP COLUMN "state",
ADD COLUMN     "ageRange" TEXT,
ADD COLUMN     "LGADetails" TEXT,
ADD COLUMN     "stateOfResidence" TEXT,
DROP COLUMN "dob",
ADD COLUMN     "dob" TIMESTAMP(3);
