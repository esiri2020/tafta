-- CreateTable
CREATE TABLE "ProfileChange" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "homeAddress" TEXT,
    "phoneNumber" TEXT,
    "employmentStatus" TEXT,
    "residencyStatus" TEXT,
    "businessName" TEXT,
    "businessType" "BusinessType",
    "businessSize" "BusinessSize",
    "businessSector" TEXT,
    "companyPhoneNumber" TEXT,
    "additionalPhoneNumber" TEXT,
    "companyEmail" TEXT,
    "currentSalary" DOUBLE PRECISION,
    "revenueRange" TEXT,
    "salaryExpectation" DOUBLE PRECISION,
    "salaryRange" TEXT,
    "jobReadiness" TEXT[],
    "businessSupport" TEXT[],

    CONSTRAINT "ProfileChange_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProfileChange" ADD CONSTRAINT "ProfileChange_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
