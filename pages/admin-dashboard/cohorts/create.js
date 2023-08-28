import React from 'react'
import { DashboardLayout } from '../../../components/dashboard/dashboard-layout';
import { SplashScreen } from '../../../components/splash-screen';
import { useGetDashboardDataQuery } from '../../../services/api'
import Head from 'next/head';
import { Box, Button, Card, Container, Grid, Typography } from '@mui/material';
import { CohortEditForm } from '../../../components/dashboard/cohort/cohort-edit-form'
import NextLink from 'next/link';
import CreateCenter from '../../../components/dashboard/cohort/create-center';

function addCohort() {
    // const { data, error, isLoading } = useGetDashboardDataQuery('')
    // console.log(data? data : error);
    // if (isLoading) {
    //   return (<SplashScreen />)
    // }
    // if (error) return (<div>An error occured.</div>)


  return (
    <>
    <Head>
        <title>
          Add Cohort
        </title>
    </Head>
    <Box
          component="main"
          sx={{
            flexGrow: 1,
            py: 8
          }}
        >
          <Container maxWidth="xl">
            <Box sx={{ mb: 4 }}>
              <Grid
                container
                justifyContent="space-between"
                spacing={3}
              >
                <Grid item>
                  <Typography variant="h4">
                    Cohorts
                  </Typography>
                </Grid>
                
              </Grid>
            </Box>
            <Card>
            <CohortEditForm/>
            </Card>
          </Container>
        </Box>
    </>
  )
}

addCohort.getLayout = (page) => (
    <DashboardLayout>
      {page}
    </DashboardLayout>
  );
  
export default addCohort;