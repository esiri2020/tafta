import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../../components/dashboard/dashboard-layout';
import { SplashScreen } from '../../../components/splash-screen';
import { useGetReportsQuery } from '../../../services/api'
import Head from 'next/head';
import NextLink from 'next/link';
import { Box, Button, Card, Container, Grid, Typography } from '@mui/material';
import { ViewReportsFilters } from '../../../components/dashboard/reports/view-reports-filters';
import { ViewReportsTable } from '../../../components/dashboard/reports/view-reports-table';
import { Plus as PlusIcon } from '../../../icons/plus';
import toast from 'react-hot-toast';


const supportReport = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    name: undefined,
    cohort: [],
    status: [],
    inStock: undefined
  });
  const { data, error, isLoading, isFetching } = useGetReportsQuery({ page, limit: rowsPerPage, cohort: filters.cohort, query: filters.name })

  useEffect(()=>{
    if(isFetching) {
      toast.loading('Loading...')
    } else {
      toast.dismiss()
    }
  },[isFetching])

  const handleFiltersChange = (filters) => {
    setFilters(filters);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  if(isLoading){
    return <SplashScreen/>
  }
  if(!data) return null
  const { reports = [], count} = data

  return (
    <>
      <Head>
        <title>
          Reports
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
                  Reports
                </Typography>
              </Grid>
              <Grid item>
                <NextLink
                  href="/admin-dashboard/reports/new"
                  passHref
                >
                  <Button
                    component="a"
                    startIcon={<PlusIcon fontSize="small" />}
                    variant="contained"
                  >
                    Add
                  </Button>
                </NextLink>
              </Grid>
            </Grid>
            <Box
              sx={{
                m: -1,
                mt: 3
              }}
            >
            </Box>
          </Box>
          <Card>
            <ViewReportsFilters onChange={handleFiltersChange} />
            <ViewReportsTable
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              page={page}
              reports={reports}
              reportsCount={count}
              rowsPerPage={rowsPerPage}
            />
          </Card>
        </Container>
      </Box>
    </>
  );
};

supportReport.getLayout = (page) => (
  <DashboardLayout>
    {page}
  </DashboardLayout>
);

export default supportReport;
