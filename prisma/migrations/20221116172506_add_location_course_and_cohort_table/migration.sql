-- CreateTable
CREATE TABLE "Cohort" (
    "id" BIGSERIAL NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL,

    CONSTRAINT "Cohort_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "uid" BIGSERIAL NOT NULL,
    "id" BIGINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN,
    "course_capacity" INTEGER,
    "course_colour" TEXT,
    "cohort_id" BIGINT NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" BIGSERIAL NOT NULL,
    "location" TEXT NOT NULL,
    "seats" INTEGER,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CourseToLocation" (
    "A" BIGINT NOT NULL,
    "B" BIGINT NOT NULL
);

-- CreateIndex
-- CREATE UNIQUE INDEX "EnrollmentCompletionGraph_id_key" ON "EnrollmentCompletionGraph"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Course_id_key" ON "Course"("id");

-- CreateIndex
CREATE UNIQUE INDEX "_CourseToLocation_AB_unique" ON "_CourseToLocation"("A", "B");

-- CreateIndex
CREATE INDEX "_CourseToLocation_B_index" ON "_CourseToLocation"("B");

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_cohort_id_fkey" FOREIGN KEY ("cohort_id") REFERENCES "Cohort"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CourseToLocation" ADD CONSTRAINT "_CourseToLocation_A_fkey" FOREIGN KEY ("A") REFERENCES "Course"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CourseToLocation" ADD CONSTRAINT "_CourseToLocation_B_fkey" FOREIGN KEY ("B") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;
