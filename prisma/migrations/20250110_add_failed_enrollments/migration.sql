-- CreateTable
CREATE TABLE "FailedEnrollment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "enrollmentUid" TEXT,
    "error" TEXT NOT NULL,
    "errorDetails" JSONB,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "lastRetryAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FailedEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FailedEnrollment_userId_idx" ON "FailedEnrollment"("userId");

-- CreateIndex
CREATE INDEX "FailedEnrollment_resolvedAt_idx" ON "FailedEnrollment"("resolvedAt");

-- AddForeignKey
ALTER TABLE "FailedEnrollment" ADD CONSTRAINT "FailedEnrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

