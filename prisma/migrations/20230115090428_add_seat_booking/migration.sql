-- CreateTable
CREATE TABLE "SeatBooking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "seatNumber" INTEGER NOT NULL,
    "locationId" TEXT NOT NULL,
    "Date" TIMESTAMP(3) NOT NULL,
    "timeslot" INTEGER NOT NULL,

    CONSTRAINT "SeatBooking_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SeatBooking" ADD CONSTRAINT "SeatBooking_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeatBooking" ADD CONSTRAINT "SeatBooking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
