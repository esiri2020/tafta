-- Drop existing unique indexes
DROP INDEX IF EXISTS "_CohortCourseToLocation_AB_unique";
DROP INDEX IF EXISTS "_CohortToLocation_AB_unique";
 
-- Add primary keys
ALTER TABLE "_CohortCourseToLocation" ADD PRIMARY KEY ("A", "B");
ALTER TABLE "_CohortToLocation" ADD PRIMARY KEY ("A", "B"); 