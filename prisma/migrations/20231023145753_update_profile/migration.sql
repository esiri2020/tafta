/*
  Warnings:

  - You are about to drop the column `stateOfOrigin` on the `Profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "stateOfOrigin",
ADD COLUMN     "LGADetails" TEXT;
