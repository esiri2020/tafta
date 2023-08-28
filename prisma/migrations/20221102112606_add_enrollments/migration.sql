-- CreateTable
CREATE TABLE "Enrollment" (
    "uid" BIGSERIAL NOT NULL,
    "id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiry_date" TIMESTAMP(3),
    "user_id" BIGINT NOT NULL,
    "userId" TEXT NOT NULL,
    "course_name" TEXT NOT NULL,
    "course_id" BIGINT NOT NULL,
    "percentage_complete" TEXT,
    "completed_at" TIMESTAMP(3),
    "expired" BOOLEAN NOT NULL,
    "is_free_trial" BOOLEAN NOT NULL,
    "completed" BOOLEAN NOT NULL,
    "started_at" TIMESTAMP(3),
    "activated_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("uid")
);

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_id_key" ON "Enrollment"("id");

-- CreateIndex
CREATE INDEX "Enrollment_id_course_id_idx" ON "Enrollment"("id", "course_id");

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
