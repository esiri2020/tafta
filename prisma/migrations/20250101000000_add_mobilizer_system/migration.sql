-- CreateEnum
CREATE TYPE "MobilizerStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateTable
CREATE TABLE "Mobilizer" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "organization" TEXT,
    "status" "MobilizerStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,
    "totalReferrals" INTEGER NOT NULL DEFAULT 0,
    "activeReferrals" INTEGER NOT NULL DEFAULT 0,
    "completedReferrals" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Mobilizer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MobilizerReferrals" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Mobilizer_code_key" ON "Mobilizer"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Mobilizer_email_key" ON "Mobilizer"("email");

-- CreateIndex
CREATE INDEX "Mobilizer_code_idx" ON "Mobilizer"("code");

-- CreateIndex
CREATE INDEX "Mobilizer_status_idx" ON "Mobilizer"("status");

-- CreateIndex
CREATE UNIQUE INDEX "_MobilizerReferrals_AB_unique" ON "_MobilizerReferrals"("A", "B");

-- CreateIndex
CREATE INDEX "_MobilizerReferrals_B_index" ON "_MobilizerReferrals"("B");

-- AddForeignKey
ALTER TABLE "Mobilizer" ADD CONSTRAINT "Mobilizer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MobilizerReferrals" ADD CONSTRAINT "_MobilizerReferrals_A_fkey" FOREIGN KEY ("A") REFERENCES "Mobilizer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MobilizerReferrals" ADD CONSTRAINT "_MobilizerReferrals_B_fkey" FOREIGN KEY ("B") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add column to User table
ALTER TABLE "User" ADD COLUMN "mobilizerId" TEXT;

-- Add column to Profile table
ALTER TABLE "Profile" ADD COLUMN "mobilizerId" TEXT;

-- Add foreign key constraints
ALTER TABLE "User" ADD CONSTRAINT "User_mobilizerId_fkey" FOREIGN KEY ("mobilizerId") REFERENCES "Mobilizer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Profile" ADD CONSTRAINT "Profile_mobilizerId_fkey" FOREIGN KEY ("mobilizerId") REFERENCES "Mobilizer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

