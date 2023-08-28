import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Box, Container, Grid } from '@mui/material';
import { EnrolledApplicants } from '../../components/dashboard/enrolled-applicants';
// import { LatestOrders } from '../../components/dashboard/latest-orders';
// import { LatestProducts } from '../../components/dashboard/latest-products';
import { EnrollmentsCompletedGraph } from '../../components/dashboard/enrollments-completion-graph';
import { FemaleEnrollees } from '../../components/dashboard/female-enrollees';
import { MaleEnrollees } from '../../components/dashboard/male-enrollees';
import { ActiveEnrollees } from '../../components/dashboard/active-enrollees';
import { TotalApplicants } from '../../components/dashboard/total-applicants';
import { CertifiedEnrollees } from '../../components/dashboard/certified-enrollees';
import { EnrollmentStatus } from '../../components/dashboard/enrollment-status';
import { DashboardLayout } from '../../components/dashboard/dashboard-layout';
import { SplashScreen } from '../../components/splash-screen';
import { useGetDashboardDataQuery } from '../../services/api'
import { selectCohort } from '../../services/cohortSlice'
import { useAppSelector } from '../../hooks/rtkHook'

const IndexPage = () => {
  const [skip, setSkip] = useState(true)
  const cohort = useAppSelector(state => selectCohort(state))
  const { data, error, isLoading } = useGetDashboardDataQuery({cohortId: cohort?.id}, {skip})
  
  useEffect(() => {
    if(cohort?.id) setSkip(false)
  }, [cohort])

  if (isLoading) {
    return (<SplashScreen />)
  }
  if (error) return (<div>An error occured.</div>)
  if(!data) return null
  
  return (
    <>
    <Head>
      <title>
        Super Admin Dashboard
      </title>
    </Head>
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        py: 8
      }}
    >
      <Container maxWidth={false}>
        <Grid
          container
          spacing={3}
        >
          <Grid
            item
            lg={2}
            sm={6}
            xl={2}
            xs={12}
          >
            <TotalApplicants 
            sx={{ height: '100%' }}
            count={data?.total_applicants}/>
          </Grid>
          <Grid
            item
            lg={2}
            sm={6}
            xl={2}
            xs={12}
          >
            <EnrolledApplicants 
            sx={{ height: '100%' }}
            count={data?.total_enrolled_applicants}
            />
          </Grid>
          <Grid
            item
            xl={2}
            lg={2}
            sm={6}
            xs={12}
          >
            <MaleEnrollees 
            sx={{ height: '100%' }}
            count={data?.male_enrollments} 
            />
          </Grid>
          <Grid
            item
            xl={2}
            lg={2}
            sm={6}
            xs={12}
          >
            <FemaleEnrollees 
            sx={{ height: '100%' }}
            count={data?.female_enrollments}
            />
          </Grid>
          <Grid
            item
            xl={2}
            lg={2}
            sm={6}
            xs={12}
          >
            <ActiveEnrollees
            sx={{ height: '100%' }} 
            count={data?.active_enrollees} 
            />
          </Grid>
          <Grid
            item
            xl={2}
            lg={2}
            sm={6}
            xs={12}
          >
            <CertifiedEnrollees 
            sx={{ height: '100%' }} 
            count={data?.certified_enrollees}/>
          </Grid>
          <Grid
            item
            lg={8}
            md={12}
            xl={9}
            xs={12}
          >
            <EnrollmentsCompletedGraph data={data?.enrollment_completion_graph} />
          </Grid>
          <Grid
            item
            lg={4}
            md={6}
            xl={3}
            xs={12}
          >
            <EnrollmentStatus 
              sx={{ height: '100%' }} 
              data={[
                data?.inactive_enrollments,
                data?.active_enrollees,
                data?.certified_enrollees,
              ]}
            />
          </Grid>
          {/* <Grid
            item
            lg={4}
            md={6}
            xl={3}
            xs={12}
          >
            <LatestProducts sx={{ height: '100%' }} />
          </Grid>
          <Grid
            item
            lg={8}
            md={12}
            xl={9}
            xs={12}
          >
            <LatestOrders />
          </Grid> */}
        </Grid>
      </Container>
    </Box>
  </>
  )
}

IndexPage.getLayout = (page: any) => (
  <DashboardLayout>
    {page}
  </DashboardLayout>
);

export default IndexPage;