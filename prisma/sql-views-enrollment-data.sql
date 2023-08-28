 CREATE OR REPLACE VIEW "EnrollmentCompletionGraph" AS
 SELECT row_number() OVER () AS id,
    e.completed_at::date AS date,
    count(*) FILTER (WHERE e.completed = true AND e.expired=false) AS count
   FROM "Enrollment" e
  GROUP BY e.completed_at::date
  ORDER BY e.completed_at::date;