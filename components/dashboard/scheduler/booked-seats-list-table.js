import { Fragment, useState } from 'react';
import NextLink from 'next/link';
import PropTypes from 'prop-types';
import { toast } from 'react-hot-toast';
import {
  Box,
  Button,
  CardContent,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  LinearProgress,
  Link,
  MenuItem,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import { ChevronDown as ChevronDownIcon } from '../../../icons/chevron-down';
import { ChevronRight as ChevronRightIcon } from '../../../icons/chevron-right';
import { DotsHorizontal as DotsHorizontalIcon } from '../../../icons/dots-horizontal';
import { Scrollbar } from '../../scrollbar';
import { SeverityPill } from '../../severity-pill';
import { formatInTimeZone } from '../../../utils';
import { timeslots } from '../../home/book-a-seat'


export const BookedSeatsListTable = (props) => {
  const {
    data: {
      data: {
        seatBookings,
        count: bookedSeatsCount,
      },
      page,
      setPage: onPageChange,
      setLimit: onRowsPerPageChange,
      limit: rowsPerPage,
    },
    ...other
  } = props;
  const [openBookedSeat, setOpenBookedSeat] = useState(null);

  const handleOpenBookedSeat = (bookedSeatId) => {
    setOpenBookedSeat((prevValue) => (prevValue === bookedSeatId ? null : bookedSeatId));
  };

  const handleUpdateBookedSeat = () => {
    setOpenBookedSeat(null);
    toast.success('Booked Seat updated');
  };

  const handleCancelEdit = () => {
    setOpenBookedSeat(null);
  };

  const handleDeleteBookedSeat = () => {
    toast.error('Booked Seat cannot be deleted');
  };
  return (
    <div {...other}>
      <Scrollbar>
        <Table sx={{ minWidth: 1200 }}>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>
                Applicant Name
              </TableCell>
              <TableCell width="25%">
                Cohort
              </TableCell>
              <TableCell>
                Center Location
              </TableCell>
              <TableCell>
                Sit Number
              </TableCell>
              <TableCell>
                Date Booked
              </TableCell>
              <TableCell>
                Time Booked
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {seatBookings.map((bookedSeat) => (
              <TableRow
                hover
                key={bookedSeat.id}
              >
                <TableCell
                >
                </TableCell>
                <TableCell>
                  <Typography
                    color="inherit"
                    variant="subtitle2"
                  >
                    {`${bookedSeat.user.firstName} ${bookedSeat.user.lastName}`}
                  </Typography>
                </TableCell>
                <TableCell width="25%">
                  <Box
                    sx={{
                      alignItems: 'center',
                      display: 'flex'
                    }}
                  >
                    <Box
                      sx={{
                        cursor: 'pointer',
                        ml: 2
                      }}
                    >
                      <Typography variant="subtitle2">
                        {bookedSeat.user.userCohort?.slice(-1)[0]?.cohort?.name}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography
                    color="textSecondary"
                    variant="body2"
                  >
                    {bookedSeat.location?.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    color="textSecondary"
                    variant="body2"
                  >
                    {bookedSeat.seatNumber}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    color="textSecondary"
                    variant="body2"
                  >
                    {new Date(bookedSeat.Date).toLocaleDateString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    color="textSecondary"
                    variant="body2"
                  >
                    {timeslots.find(slot => slot.id === bookedSeat.timeslot).time}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Scrollbar>
      <TablePagination
        component="div"
        count={bookedSeatsCount}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[10, 25, 50]}
      />
    </div>
  );
};

// BookedSeatsListTable.propTypes = {
//   bookedSeats: PropTypes.array.isRequired,
//   bookedSeatsCount: PropTypes.number.isRequired,
//   onPageChange: PropTypes.func.isRequired,
//   onRowsPerPageChange: PropTypes.func,
//   page: PropTypes.number.isRequired,
//   rowsPerPage: PropTypes.number.isRequired
// };
