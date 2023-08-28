-- CreateTable
CREATE TABLE "Referee" (
    "id" TEXT NOT NULL,
    "profileId" TEXT,
    "fullName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,

    CONSTRAINT "Referee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Referee_profileId_key" ON "Referee"("profileId");

-- AddForeignKey
ALTER TABLE "Referee" ADD CONSTRAINT "Referee_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
