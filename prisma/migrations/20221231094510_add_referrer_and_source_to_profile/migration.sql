/*
  Warnings:

  - You are about to drop the `Referee` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Referee" DROP CONSTRAINT "Referee_profileId_fkey";

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "source" TEXT;

-- DropTable
DROP TABLE "Referee";

-- CreateTable
CREATE TABLE "Referrer" (
    "id" TEXT NOT NULL,
    "profileId" TEXT,
    "fullName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,

    CONSTRAINT "Referrer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Referrer_profileId_key" ON "Referrer"("profileId");

-- AddForeignKey
ALTER TABLE "Referrer" ADD CONSTRAINT "Referrer_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
