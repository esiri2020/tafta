-- CreateTable
CREATE TABLE "StaffAlertRecipients" (
    "id" TEXT NOT NULL,
    "staffAlertId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StaffAlertRecipients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StaffAlertRecipients_staffAlertId_idx" ON "StaffAlertRecipients"("staffAlertId");

-- CreateIndex
CREATE INDEX "StaffAlertRecipients_userId_idx" ON "StaffAlertRecipients"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StaffAlertRecipients_staffAlertId_userId_key" ON "StaffAlertRecipients"("staffAlertId", "userId");

-- AddForeignKey
ALTER TABLE "StaffAlertRecipients" ADD CONSTRAINT "StaffAlertRecipients_staffAlertId_fkey" FOREIGN KEY ("staffAlertId") REFERENCES "StaffAlert"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffAlertRecipients" ADD CONSTRAINT "StaffAlertRecipients_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
