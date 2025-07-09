-- CreateTable
CREATE TABLE "RehydrationProgress" (
    "id" TEXT NOT NULL,
    "cohortId" TEXT NOT NULL,
    "lastUpdatedAt" TIMESTAMP(3) NOT NULL,
    "lastEnrollmentUid" TEXT NOT NULL,
    "cycle" INTEGER NOT NULL,
    "lastCycleDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RehydrationProgress_pkey" PRIMARY KEY ("id")
);
