import { useState } from 'react';
import { DashboardLayout } from '../../../components/dashboard/dashboard-layout';
import { SplashScreen } from '../../../components/splash-screen';
import Head from 'next/head';
import { Box, Button, Card, Container, Grid, Typography } from '@mui/material';
import { CohortListFilters } from '../../../components/dashboard/cohort/cohort-list-filters';
import { CohortListTable } from '../../../components/dashboard/cohort/cohort-list-table';
import { CohortDashboard } from '../../../components/dashboard/cohort/cohort-dashboard';
import { Plus as PlusIcon } from '../../../icons/plus';
import { useGetCohortsQuery, useGetDashboardDataQuery } from '../../../services/api';
import NextLink from 'next/link';

function Cohorts() {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [course, setCourse] = useState([]);
    const [status, setStatus] = useState('');
    const [selectedCohort, setSelectedCohort] = useState(null);
    
    const { data: cohortsData, error: cohortsError, isLoading: cohortsLoading } = useGetCohortsQuery({
      page,
      limit: rowsPerPage,
      filter: status
    });

    const { data: dashboardData, error: dashboardError, isLoading: dashboardLoading } = useGetDashboardDataQuery(
      { cohortId: selectedCohort?.id },
      { skip: !selectedCohort }
    );
  
    const handleFiltersChange = (filters) => {
      setCourse(filters.course);
      setStatus(filters.status);
    };
  
    const handlePageChange = (event, newPage) => {
      setPage(newPage);
    };
  
    const handleRowsPerPageChange = (event) => {
      setRowsPerPage(parseInt(event.target.value, 10));
    };

    const handleCohortSelect = (cohort) => {
      setSelectedCohort(cohort);
    };
  
    if (cohortsLoading || dashboardLoading) return <SplashScreen />;
    if (cohortsError || dashboardError) return null;
    if (!cohortsData) return <div>No Data!</div>;
    
    const { cohorts, count } = cohortsData;
    if (cohorts === undefined) return <div>No Data!</div>;
  
    return (
      <>
        <Head>
          <title>Cohort List</title>
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

            {selectedCohort && dashboardData && (
              <Box sx={{ mb: 4 }}>
                <CohortDashboard data={dashboardData} />
              </Box>
            )}

            <Card>
              <CohortListFilters onChange={handleFiltersChange} />
              <CohortListTable
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                onCohortSelect={handleCohortSelect}
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