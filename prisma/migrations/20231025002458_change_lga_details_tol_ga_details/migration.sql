/*
  Warnings:

  - You are about to drop the column `LGADetails` on the `Profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "LGADetails",
ADD COLUMN     "lGADetails" TEXT;
