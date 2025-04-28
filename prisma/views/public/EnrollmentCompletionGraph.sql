SELECT
  row_number() OVER () AS id,
  (e.completed_at) :: date AS date,
  count(*) FILTER (
    WHERE
      (
        (e.completed = TRUE)
        AND (e.expired = false)
      )
  ) AS count
FROM
  "Enrollment" e
GROUP BY
  ((e.completed_at) :: date)
ORDER BY
  ((e.completed_at) :: date);