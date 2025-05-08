import { useState } from 'react';
import { DashboardLayout } from '../../../components/dashboard/dashboard-layout';
import { SplashScreen } from '../../../components/splash-screen';
import Head from 'next/head';
import { Box, Button, Card, Container, Grid, Typography } from '@mui/material';
import { CohortListFilters } from '../../../components/dashboard/cohort/cohort-list-filters';
import { CohortListTable } from '../../../components/dashboard/cohort/cohort-list-table';
import { Plus as PlusIcon } from '../../../icons/plus';
import { useGetCohortsQuery } from '../../../services/api'
import NextLink from 'next/link';


function Cohorts() {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [course, setCourse] = useState([])
    const [status, setStatus] = useState('')
    
    const { data, error, isLoading } = useGetCohortsQuery({page, limit: rowsPerPage, filter: status})
  
    const handleFiltersChange = (filters) => {
      setCourse(filters.course)
      setStatus(filters.status)
    };
  
    const handlePageChange = (event, newPage) => {
      setPage(newPage);
    };
  
    const handleRowsPerPageChange = (event) => {
      setRowsPerPage(parseInt(event.target.value, 10));
    };
  
    if(isLoading) return ( <SplashScreen/> )
    if(error){
      return null
    }
    if(!data) return (<div>No Data!</div>);
    const { cohorts, count } = data
    if(cohorts === undefined) return (<div>No Data!</div>);
  
    return (
      <>
        <Head>
          <title>
            Cohort List
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
                <Grid item>
                  <NextLink
                    href="/admin-dashboard/cohorts/create/"
                    passHref
                  >
                    <Button
                      component="a"
                      startIcon={<PlusIcon fontSize="small" />}
                      variant="contained"
                    >
                      Create
                    </Button>
                  </NextLink>
                </Grid>
              </Grid>
            </Box>
            <Card>
              <CohortListFilters onChange={handleFiltersChange} />
              <CohortListTable
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                page={page}
                cohorts={cohorts}
                cohortCount={count}
                rowsPerPage={rowsPerPage}
              />
            </Card>
          </Container>
        </Box>
      </>
    );
}

Cohorts.getLayout = (page) => (
    <DashboardLayout>
      {page}
    </DashboardLayout>
  );
  
export default Cohorts;