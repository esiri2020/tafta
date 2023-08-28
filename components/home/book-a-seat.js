import { useState, useEffect } from "react";
import {
  MenuItem,
  Typography,
  Grid,
  TextField,
  Button,
  Box,
} from "@mui/material";
import {
  useCreateSeatBookingMutation,
  useDeleteSeatBookingMutation,
} from "../../services/api";
import toast from "react-hot-toast";
import { SplashScreen } from "../splash-screen";

export const timeslots = [
  { id: 1, time: "11am" },
  { id: 2, time: "3pm" },
  { id: 3, time: "5pm" },
];

export const SeatBooking = ({ seatBooking, seatDataQueryRes }) => {
  const {
    data: { locations, seatBookings },
    error,
    isLoading,
  } = seatDataQueryRes;
  const [createBooking, result] = useCreateSeatBookingMutation();
  const [deleteBooking, delete_result] = useDeleteSeatBookingMutation();

  const [selectedSeat, setSelectedSeat] = useState({ id: "" });
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedCenter, setSelectedCenter] = useState({ id: "" });
  const [selectedTimeSlot, setSelectedTimeSlot] = useState({ id: "" });
  const [seats, setSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState(
    seatBooking.map((booking) => ({
      ...booking,
      Date: new Date(booking.Date),
      center:
        locations && locations.filter((l) => l.id == booking.locationId)[0],
    }))
  );
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (selectedCenter.id && selectedDate && selectedTimeSlot.id) {
      setSeats(
        [...Array(selectedCenter.seats).keys()].map((index) => ({
          id: index + 1,
          status: selectedCenter.seatBooking.find((booking) => {
            return (
              booking.seatNumber === index + 1 &&
              new Date(booking.Date).toLocaleDateString() ==
                selectedDate.toLocaleDateString() &&
              booking.timeslot === selectedTimeSlot.id
            );
          })
            ? "booked"
            : "available",
          center: selectedCenter.name,
        }))
      );
    }
  }, [selectedCenter, selectedDate, selectedTimeSlot]);

  useEffect(() => {
    if (delete_result.isSuccess) {
      const newBookedSeats = bookedSeats.filter(
        (booking) => booking.id !== delete_result.data.deleted.id
      );
      setBookedSeats(newBookedSeats);
      toast.dismiss();
      toast.success("Booking Canceled");
    } else if (delete_result.isError) {
      toast.dismiss();
      toast.error("An error occurred");
    }
  }, [delete_result]);

  const handleDeleteBooking = (id, index) => {
    deleteBooking({ id });
  };

  const handleDateChange = (date) => {
    const selectedDate = new Date(date);
    if (selectedDate.getDay() === 0 || selectedDate.getDay() === 6) {
      setErrorMessage("Bookings are not available on weekends.");
      return;
    }
    setSelectedDate(selectedDate);
    setErrorMessage("");
  };

  const handleTimeSlotChange = (event) => {
    const _selectedTimeSlot = timeslots.find(
      (timeSlot) => timeSlot.id == event.target.value
    );
    setSelectedTimeSlot(_selectedTimeSlot);
  };

  const handleCenterChange = (event) => {
    const selectedCenter = locations.find(
      (center) => center.id === event.target.value
    );
    setSelectedCenter(selectedCenter);
    setSelectedSeat(null);
  };

  const handleSeatClick = (seat) => {
    if (seat.status === "available" && seat.center === selectedCenter.name) {
      setSelectedSeat(seat);
    } else if (seat.center !== selectedCenter.name) {
      setErrorMessage("This seat does not belong to selected center");
    } else {
      setErrorMessage("This seat is not available.");
    }
  };

  const handleBookSeat = async () => {
    if (
      !selectedSeat ||
      !selectedDate ||
      !selectedTimeSlot.id ||
      !selectedCenter.id
    ) {
      setErrorMessage(
        "Please select a center, seat, date, and time slot to book."
      );
      return;
    }
    const toastId = toast.loading("Loading...");
    const bookedSeat = {
      locationId: selectedCenter.id,
      center: selectedCenter,
      seatNumber: selectedSeat.id,
      Date: selectedDate,
      timeslot: selectedTimeSlot.id,
    };
    const checkSeatAvailable = seatBookings.find((booking) => {
      return (
        booking.locationId === bookedSeat.locationId &&
        booking.seatNumber === bookedSeat.seatNumber &&
        new Date(booking.Date).toLocaleDateString() ==
          bookedSeat.Date.toLocaleDateString() &&
        booking.timeslot === bookedSeat.timeslot
      );
    });
    const checkTimeslot = bookedSeats.find((booking) => {
      return (
        booking.locationId === bookedSeat.locationId &&
        new Date(booking.Date).toLocaleDateString() ==
          bookedSeat.Date.toLocaleDateString() &&
        booking.timeslot === bookedSeat.timeslot
      );
    });
    if (checkSeatAvailable || checkTimeslot) {
      checkSeatAvailable &&
        setErrorMessage(
          "This seat is already booked for this center, date and time slot."
        );
      checkTimeslot &&
        setErrorMessage("You have already booked a seat for this timeslot");
      toast.dismiss(toastId);
      toast.error("Booking failed");
      return;
    }
    const { center, ...body } = bookedSeat;
    const result = await createBooking({ body });
    if (result.data?.message === "success") {
      setSeats([]);
      setBookedSeats([
        ...bookedSeats,
        { ...bookedSeat, id: result.data.seatBooking.id },
      ]);
      setSelectedSeat({ id: "" });
      setSelectedCenter({ id: "" });
      setSelectedTimeSlot({ id: "" });
      setErrorMessage("");
      toast.dismiss(toastId);
      toast.success("Booking Successfull");
      return;
    } else if (result.error?.status === 400) {
      setErrorMessage(result.error?.data?.error);
    } else if (result.error?.status === 401) {
      setErrorMessage("Please login to book a session");
    } else {
      setErrorMessage("An error occured");
    }
    toast.dismiss(toastId);
    toast.error("Booking Failed");
  };

  if (isLoading) return <SplashScreen />;
  if (error) {
    if (error.status === 401) {
      router.push(`/api/auth/signin?callbackUrl=%2Fadmin-dashboard`);
    }
  }
  // if (!locations) return (<div>No Data!</div>);
  return (
    <>
      <Typography variant="h2">Seat Booking</Typography>
      <Box>
        <Grid item md={12} xs={12} sx={{ mt: 3 }}>
          <TextField
            fullWidth
            label="Select Center"
            value={selectedCenter.id}
            select
            onChange={(e) => handleCenterChange(e)}
          >
            {locations.map((center) => (
              <MenuItem key={center.id} value={center.id}>
                {center.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Box>
          <Grid item md={12} xs={12} sx={{ my: 3 }}>
            <TextField
              fullWidth
              type="date"
              onChange={(e) => handleDateChange(e.target.value)}
              inputProps={{
                min: new Date().toISOString().split("T")[0],
                max: new Date(+new Date() + 2678400000)
                  .toISOString()
                  .split("T")[0],
              }}
            ></TextField>
          </Grid>
        </Box>
        <Box>
          <Grid item md={12} xs={12} sx={{ my: 3 }}>
            <TextField
              fullWidth
              label="Select Time"
              value={selectedTimeSlot.id}
              select
              onChange={handleTimeSlotChange}
            >
              {timeslots.map((timeSlot) => (
                <MenuItem key={timeSlot.time} value={timeSlot.id}>
                  {timeSlot.time}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Box>
        <Box>
          {seats.map((seat) => (
            <Button
              key={seat.id}
              disabled={seat.status === "available" ? false : true}
              onClick={() => handleSeatClick(seat)}
              value={selectedSeat}
              style={{
                backgroundColor:
                  seat.status === "available"
                    ? seat.id === selectedSeat?.id
                      ? "orange"
                      : "green"
                    : "gray",
                width: "50px",
                height: "50px",
                border: "1px solid black",
                display: "inline-block",
                marginRight: "10px",
              }}
            >
              <Typography
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  color: "#000",
                }}
              >
                {seat.id}{" "}
              </Typography>
            </Button>
          ))}
        </Box>
        <Box sx={{ my: 5 }}>
          <Button variant="contained" fullWidth onClick={handleBookSeat}>
            Book Seat
          </Button>
          <p style={{ color: "red" }}>{errorMessage}</p>
        </Box>
        <h2>Booked Seats:</h2>
        <ul>
          {bookedSeats.length
            ? bookedSeats.map((bookedSeat, index) => (
                <li key={bookedSeat.id}>
                  Center: {bookedSeat.center?.name} - Seat:{" "}
                  {bookedSeat.seatNumber} - Date:{" "}
                  {new Date(bookedSeat.Date).toLocaleDateString()} - Time:{" "}
                  {timeslots.find((t) => t.id === bookedSeat.timeslot).time}
                  <Button
                    variant="outlined"
                    onClick={() => handleDeleteBooking(bookedSeat.id, index)}
                  >
                    Cancel
                  </Button>
                </li>
              ))
            : ""}
        </ul>
      </Box>
    </>
  );
};
