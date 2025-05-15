-- Fix completion percentages that are stored as whole numbers (0-100) to be decimals (0-1)
UPDATE "Enrollment"
SET "percentage_completed" = "percentage_completed" / 100
WHERE "percentage_completed" > 1; 