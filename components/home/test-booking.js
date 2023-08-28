import React, { useState } from "react";

const seats = [
  { id: 1, location: "Location 1", status: "available" },
  { id: 2, location: "Location 1", status: "available" },
  { id: 3, location: "Location 1", status: "available" },
  { id: 4, location: "Location 1", status: "available" },
  { id: 5, location: "Location 1", status: "available" },
  { id: 6, location: "Location 2", status: "available" },
  { id: 7, location: "Location 2", status: "available" },
  { id: 8, location: "Location 2", status: "available" },
  { id: 9, location: "Location 2", status: "available" },
  { id: 10, location: "Location 2", status: "available" },
  { id: 11, location: "Location 3", status: "available" },
  { id: 12, location: "Location 3", status: "available" },
  { id: 13, location: "Location 3", status: "available" },
  { id: 14, location: "Location 3", status: "available" },
  { id: 15, location: "Location 3", status: "available" },
  { id: 16, location: "Location 4", status: "available" },
  { id: 17, location: "Location 4", status: "available" },
  { id: 18, location: "Location 4", status: "available" },
  { id: 19, location: "Location 4", status: "available" },
  { id: 20, location: "Location 4", status: "available" },
  { id: 21, location: "Location 5", status: "available" },
  { id: 22, location: "Location 5", status: "available" },
  { id: 23, location: "Location 5", status: "available" },
  { id: 24, location: "Location 5", status: "available" },
  { id: 25, location: "Location 5", status: "available" },
];

const timeslots = [
  { id: 1, time: "11am" },
  { id: 2, time: "3pm" },
  { id: 3, time: "5pm" },
];

export const  SeatBooking = () => {
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSeatClick = (seat) => {
    if (seat.status === "available") {
      setSelectedSeat(seat);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleTimeSlotChange = (event) => {
    const selectedTimeSlot = timeslots.find(
        (timeSlot) => timeSlot.id === parseInt(event.target.value)
    );
    setSelectedTimeSlot(selectedTimeSlot);
  };

  const handleBookSeat = () => {
    if (!selectedSeat || !selectedDate || !selectedTimeSlot) {
      setErrorMessage("Please select a seat, date, and time slot to book.");
      return;
    }
    const bookedSeat = {
      seat: selectedSeat,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
    };
    const checkSeatAvailable = bookedSeats.find(
      (booked) =>
        booked.seat.id === bookedSeat.seat.id &&
        booked.date === bookedSeat.date &&
        booked.timeSlot.id === bookedSeat.timeSlot.id
    );
    if (checkSeatAvailable) {
      setErrorMessage("This seat is already booked for this time slot.");
      return;
    }
    setBookedSeats([...bookedSeats, bookedSeat]);
    setSelectedSeat(null);
    setSelectedDate(null);
    setSelectedTimeSlot(null);
    setErrorMessage("");
  };

  return (
    <div>
      <h1>Seat Booking</h1>
      <div>
        <label>Select Date:</label>
        <input
          type="date"
          onChange={(e) => handleDateChange(e.target.value)}
        ></input>
      </div>
      <div>
        <label>Select Time Slot:</label>
        <select onChange={(e) => handleTimeSlotChange(e.target.value)}>
          <option value="">Select Time</option>
          {timeslots.map((timeSlot) => (
            <option key={timeSlot.id} value={timeSlot}>
              {timeSlot.time}
            </option>
          ))}
        </select>
      </div>
      <div>
        {seats.map((seat) => (
          <div
            key={seat.id}
            onClick={() => handleSeatClick(seat)}
            style={{
              backgroundColor:
                seat.status === "available"
                  ? seat.id === selectedSeat?.id
                    ? "orange"
                    : "green"
                  : "red",
              width: "50px",
              height: "50px",
              border: "1px solid black",
              display: "inline-block",
              marginRight: "10px",
            }}
          >
            {seat.id}
          </div>
        ))}
      </div>
      <div>
        <button onClick={handleBookSeat}>Book Seat</button>
        <div>{errorMessage}</div>
      </div>
      <h2>Booked Seats:</h2>
      <ul>
        {bookedSeats.map((bookedSeat) => (
          <li key={bookedSeat.seat.id}>
            {bookedSeat.seat.id} - {bookedSeat.date} - {bookedSeat.timeSlot.time}
          </li>
        ))}
      </ul>
    </div>
  );
}