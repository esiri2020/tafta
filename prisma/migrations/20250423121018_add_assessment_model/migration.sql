/*
  Warnings:

  - You are about to drop the `ProfileChange` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProfileChange" DROP CONSTRAINT "ProfileChange_profileId_fkey";

-- DropTable
DROP TABLE "ProfileChange";

-- CreateTable
CREATE TABLE "Assessment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseOfStudy" TEXT,
    "enrollmentStatus" TEXT,
    "hadJobBeforeAdmission" BOOLEAN,
    "employmentStatus" TEXT,
    "employmentType" TEXT,
    "workTimeType" TEXT,
    "employedInCreativeSector" BOOLEAN,
    "creativeJobNature" TEXT,
    "nonCreativeJobInfo" TEXT,
    "yearsOfExperienceCreative" TEXT,
    "satisfactionLevel" TEXT,
    "skillRating" TEXT,
    "monthlyIncome" TEXT,
    "hasReliableIncome" BOOLEAN,
    "earningMeetsNeeds" BOOLEAN,
    "workIsDecentAndGood" BOOLEAN,
    "jobGivesPurpose" BOOLEAN,
    "feelRespectedAtWork" BOOLEAN,
    "lmsPlatformRating" TEXT,
    "taftaPreparationRating" TEXT,
    "preparationFeedback" TEXT,
    "qualityOfInteractionRating" TEXT,
    "trainingMaterialsRating" TEXT,
    "topicSequencingRating" TEXT,
    "facilitatorsResponseRating" TEXT,
    "wouldRecommendTafta" BOOLEAN,
    "improvementSuggestions" TEXT,
    "mostStrikingFeature" TEXT,
    "turnOffs" TEXT,
    "practicalClassChallenges" TEXT,
    "onlineClassChallenges" TEXT,
    "completionMotivation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Assessment_userId_key" ON "Assessment"("userId");

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
