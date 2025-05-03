-- CreateEnum
CREATE TYPE "StaffAlertType" AS ENUM ('INFO', 'WARNING', 'ALERT');

-- CreateTable
CREATE TABLE "StaffAlert" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "StaffAlertType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "senderId" TEXT NOT NULL,

    CONSTRAINT "StaffAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StaffAlert_senderId_idx" ON "StaffAlert"("senderId");

-- CreateIndex
CREATE INDEX "StaffAlert_type_idx" ON "StaffAlert"("type");

-- CreateIndex
CREATE INDEX "StaffAlert_createdAt_idx" ON "StaffAlert"("createdAt");

-- AddForeignKey
ALTER TABLE "StaffAlert" ADD CONSTRAINT "StaffAlert_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
