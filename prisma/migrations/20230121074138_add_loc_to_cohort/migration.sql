-- CreateTable
CREATE TABLE "_CohortToLocation" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_CohortToLocation_AB_unique" ON "_CohortToLocation"("A", "B");

-- CreateIndex
CREATE INDEX "_CohortToLocation_B_index" ON "_CohortToLocation"("B");

-- AddForeignKey
ALTER TABLE "_CohortToLocation" ADD CONSTRAINT "_CohortToLocation_A_fkey" FOREIGN KEY ("A") REFERENCES "Cohort"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CohortToLocation" ADD CONSTRAINT "_CohortToLocation_B_fkey" FOREIGN KEY ("B") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;
