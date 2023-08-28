-- CreateTable
CREATE TABLE "RehydrationDate" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "enrollment_count" INTEGER,

    CONSTRAINT "RehydrationDate_pkey" PRIMARY KEY ("id")
);
