import { useState } from 'react'
import { DashboardLayout } from '../../../components/dashboard/dashboard-layout';
import { SplashScreen } from '../../../components/splash-screen';
import { useGetSeatBookingsQuery } from '../../../services/api';
import { SeatBooking } from '../../../components/dashboard/scheduler/admin-book-a-seat';
import { Box, Grid } from '@mui/material';
import { BookedSeatsListTable } from '../../../components/dashboard/scheduler/booked-seats-list-table';
import Head from 'next/head';


function manageBookings() {
  const [page, setPage] = useState(0)
  const [limit, setLimit] = useState(25)
  const { data, error, isLoading } = useGetSeatBookingsQuery({ page, limit })
  if (isLoading) {
    return (<SplashScreen />)
  }
  if (error) return (<div>An error occured.</div>)


  return (
    <>
      <Head>
        <title>
          View Bookings
        </title>
      </Head>
      <div style={{ padding: "20px" }}>
        <Box
          sx={{
            justifyContent: 'center',
            display: 'flex',
            alignItems: "center",

          }}>
          <Grid
            container
            justifyContent="center"
            maxWidth='lg'
            sx={{
              justifyContent: 'center',
              display: 'flex',
              my: 5,
            }}>

            <Grid
              item
              md={6}
              sm={8}
              xs={12}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: "cover",
                display: { xs: 'block', sm: 'none', md: 'block' },
                justifyContent: 'center',
                display: 'flex',
                alignItems: "center",

              }}>
              <img
                alt="header image"
                style={{ width: "100%", height: "100%", }}
                src="/static/images/book-a-seat.png"
              />
            </Grid>
            <Grid
              item
              md={6}
              sm={8}
              xs={12}
              sx={{
                px: 2,
              }}>

              <SeatBooking data={data} />

            </Grid>
          </Grid>
        </Box>

        <Box>
          <BookedSeatsListTable data={{data, page, setPage, limit, setLimit}} />
        </Box>

      </div>
    </>
  )
}

manageBookings.getLayout = (page) => (
  <DashboardLayout>
    {page}
  </DashboardLayout>
);

export default manageBookings;