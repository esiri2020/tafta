/*
  Warnings:

  - A unique constraint covering the columns `[seatNumber,locationId,Date,timeslot]` on the table `SeatBooking` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SeatBooking_seatNumber_locationId_Date_timeslot_key" ON "SeatBooking"("seatNumber", "locationId", "Date", "timeslot");
