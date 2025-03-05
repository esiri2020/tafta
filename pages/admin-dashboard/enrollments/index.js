import { useState } from "react";
import Head from "next/head";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { Box, Button, Card, Container, Grid, Typography } from "@mui/material";
import { DashboardLayout } from "../../../components/dashboard/dashboard-layout";
import { EnrollmentListFilters } from "../../../components/dashboard/enrollments/enrollments-list-filters";
import { EnrollmentListTable } from "../../../components/dashboard/enrollments/enrollments-list-table";
import { Refresh as RefreshIcon } from "../../../icons/refresh";
import { useGetEnrollmentsQuery } from "../../../services/api";
import { SplashScreen } from "../../../components/splash-screen";
import { toast } from "react-hot-toast";

const EnrollmentSummary = ({ maleCount, femaleCount, count }) => {
  return (
    <div>
      <h2>Enrollment Summary</h2>
      <p>Total Enrollments: {count}</p>
      <p>Male Enrollments: {maleCount}</p>
      <p>Female Enrollments: {femaleCount}</p>
    </div>
  );
};

const EnrollmentList = () => {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [course, setCourse] = useState([]);
  const [status, setStatus] = useState("");
  const [cohort, setCohort] = useState("");

  const { data, error, isLoading } = useGetEnrollmentsQuery({
    page,
    limit: rowsPerPage,
    course,
    status,
    cohort,
  });

  console.log(data);

  const handleFiltersChange = (filters) => {
    setCourse(filters.course);
    setStatus(filters.status);
    setCohort(filters.cohort);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const rehydrate = async () => {
    toast.promise(
      fetch("/api/rehydrate").then((res) => res.json()),
      {
        loading: "Starting...",
        success: (data) => {
          return <b>{`${data?.count} enrollments updated`}</b>;
        },
        error: <b>An error occured.</b>,
      }
    );
  };

  if (isLoading) return <SplashScreen />;
  if (error) {
    if (error.status === 401) {
      router.push(`/api/auth/signin?callbackUrl=%2Fadmin-dashboard`);
    }
  }
  if (!data) return <div>No Data!</div>;
  const { enrollments, count, femaleCount, maleCount } = data;
  if (enrollments === undefined) return <div>No Data!</div>;

  return (
    <>
      <Head>
        <title>Enrollment List</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ mb: 4 }}>
            <Grid container justifyContent="space-between" spacing={3}>
              <Grid item>
                <Typography variant="h4">Enrollments</Typography>
              </Grid>
              <Grid item>
                <Button
                  startIcon={<RefreshIcon fontSize="small" />}
                  variant="contained"
                  onClick={rehydrate}
                >
                  Rehydrate
                </Button>
              </Grid>
            </Grid>
          </Box>
          <Box sx={{ mb: 4 }}>
            <EnrollmentSummary
              count={count}
              femaleCount={femaleCount}
              maleCount={maleCount}
            />
          </Box>
          <Card>
            <EnrollmentListFilters onChange={handleFiltersChange} />
            <EnrollmentListTable
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              page={page}
              enrollments={enrollments}
              enrollmentsCount={count}
              rowsPerPage={rowsPerPage}
            />
          </Card>
        </Container>
      </Box>
    </>
  );
};

EnrollmentList.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default EnrollmentList;
