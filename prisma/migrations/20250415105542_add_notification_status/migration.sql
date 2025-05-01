-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('DRAFT', 'SENT', 'DELIVERED', 'FAILED');

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN "status" "NotificationStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN "tags" TEXT[] DEFAULT ARRAY[]::TEXT[]; 