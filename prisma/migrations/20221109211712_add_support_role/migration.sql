-- CreateTable
-- CREATE TABLE "EnrollmentCompletionGraph" (
--     "id" INTEGER NOT NULL,
--     "date" TIMESTAMP(3),
--     "count" INTEGER NOT NULL
-- );

-- CreateIndex
-- CREATE UNIQUE INDEX "EnrollmentCompletionGraph_id_key" ON "EnrollmentCompletionGraph"("id");

CREATE OR REPLACE VIEW "EnrollmentCompletionGraph" AS
 SELECT row_number() OVER () AS id,
    e.completed_at::date AS date,
    count(*) FILTER (WHERE e.completed = true AND e.expired=false) AS count
   FROM "Enrollment" e
  GROUP BY e.completed_at::date
  ORDER BY e.completed_at::date;
