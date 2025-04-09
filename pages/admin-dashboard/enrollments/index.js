// import { useState } from "react";
// import Head from "next/head";
// import NextLink from "next/link";
// import { useRouter } from "next/router";
// import { Box, Button, Card, Container, Grid, Typography } from "@mui/material";
// import { DashboardLayout } from "../../../components/dashboard/dashboard-layout";
// import { EnrollmentListFilters } from "../../../components/dashboard/enrollments/enrollments-list-filters";
// import { EnrollmentListTable } from "../../../components/dashboard/enrollments/enrollments-list-table";
// import { Refresh as RefreshIcon } from "../../../icons/refresh";
// import { useGetEnrollmentsQuery } from "../../../services/api";
// import { SplashScreen } from "../../../components/splash-screen";
// import { toast } from "react-hot-toast";

// const EnrollmentSummary = ({ maleCount, femaleCount, count }) => {
//   return (
//     <div>
//       <h2>Enrollment Summary</h2>
//       <p>Total Enrollments: {count}</p>
//       <p>Male Enrollments: {maleCount}</p>
//       <p>Female Enrollments: {femaleCount}</p>
//     </div>
//   );
// };

// const EnrollmentList = () => {
//   const router = useRouter();
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(10);
//   const [course, setCourse] = useState([]);
//   const [status, setStatus] = useState("");
//   const [cohort, setCohort] = useState("");

//   const { data, error, isLoading } = useGetEnrollmentsQuery({
//     page,
//     limit: rowsPerPage,
//     course,
//     status,
//     cohort,
//   });

//   console.log(data);

//   const handleFiltersChange = (filters) => {
//     setCourse(filters.course);
//     setStatus(filters.status);
//     setCohort(filters.cohort);
//   };

//   const handlePageChange = (event, newPage) => {
//     setPage(newPage);
//   };

//   const handleRowsPerPageChange = (event) => {
//     setRowsPerPage(parseInt(event.target.value, 10));
//   };

//   const rehydrate = async () => {
//     toast.promise(
//       fetch("/api/rehydrate").then((res) => res.json()),
//       {
//         loading: "Starting...",
//         success: (data) => {
//           return <b>{`${data?.count} enrollments updated`}</b>;
//         },
//         error: <b>An error occured.</b>,
//       }
//     );
//   };

//   if (isLoading) return <SplashScreen />;
//   if (error) {
//     if (error.status === 401) {
//       router.push(`/api/auth/signin?callbackUrl=%2Fadmin-dashboard`);
//     }
//   }
//   if (!data) return <div>No Data!</div>;
//   const { enrollments, count, femaleCount, maleCount } = data;
//   if (enrollments === undefined) return <div>No Data!</div>;

//   return (
//     <>
//       <Head>
//         <title>Enrollment List</title>
//       </Head>
//       <Box
//         component="main"
//         sx={{
//           flexGrow: 1,
//           py: 8,
//         }}
//       >
//         <Container maxWidth="xl">
//           <Box sx={{ mb: 4 }}>
//             <Grid container justifyContent="space-between" spacing={3}>
//               <Grid item>
//                 <Typography variant="h4">Enrollments</Typography>
//               </Grid>
//               <Grid item>
//                 <Button
//                   startIcon={<RefreshIcon fontSize="small" />}
//                   variant="contained"
//                   onClick={rehydrate}
//                 >
//                   Rehydrate
//                 </Button>
//               </Grid>
//             </Grid>
//           </Box>
//           <Box sx={{ mb: 4 }}>
//             <EnrollmentSummary
//               count={count}
//               femaleCount={femaleCount}
//               maleCount={maleCount}
//             />
//           </Box>
//           <Card>
//             <EnrollmentListFilters onChange={handleFiltersChange} />
//             <EnrollmentListTable
//               onPageChange={handlePageChange}
//               onRowsPerPageChange={handleRowsPerPageChange}
//               page={page}
//               enrollments={enrollments}
//               enrollmentsCount={count}
//               rowsPerPage={rowsPerPage}
//             />
//           </Card>
//         </Container>
//       </Box>
//     </>
//   );
// };

// EnrollmentList.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// export default EnrollmentList;
'use client';

import {useState, useCallback} from 'react';
import {useRouter} from 'next/router';
import {toast} from 'sonner';
import {Button} from '@/components/ui/button';
import {Card} from '@/components/ui/card';
import {Container} from '@/components/ui/container';
import {EnrollmentListFilters} from '@/components/dashboard/enrollments/enrollments-list-filters';
import {EnrollmentListTable} from '@/components/dashboard/enrollments/enrollments-list-table';
import {EnrollmentSummary} from '@/components/dashboard/enrollments/enrollment-summary';
import {DashboardHeader} from '@/components/dashboard/dashboard-header';
import {RefreshCcw} from 'lucide-react';
import {useGetEnrollmentsQuery} from '@/services/api';
import {LoadingSpinner} from '@/components/ui/loading-spinner';
import { DashboardLayout } from '../../../components/dashboard/dashboard-layout';

export default function EnrollmentsPage() {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [course, setCourse] = useState([]);
  const [status, setStatus] = useState('');
  const [cohort, setCohort] = useState('');
  const [gender, setGender] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({from: null, to: null});

  const {data, error, isLoading, refetch} = useGetEnrollmentsQuery({
    page,
    limit: rowsPerPage,
    course,
    status,
    cohort,
    gender,
    search: searchQuery,
    dateFrom: dateRange.from
      ? new Date(dateRange.from).toISOString()
      : undefined,
    dateTo: dateRange.to ? new Date(dateRange.to).toISOString() : undefined,
  });

  const handleFiltersChange = useCallback(filters => {
    setCourse(filters.course || []);
    setStatus(filters.status || '');
    setCohort(filters.cohort || '');
    setGender(filters.gender || '');
    setSearchQuery(filters.search || '');
    setDateRange(filters.dateRange || {from: null, to: null});
  }, []);

  const handlePageChange = newPage => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = newRowsPerPage => {
    setRowsPerPage(newRowsPerPage);
    setPage(0); // Reset to first page when changing rows per page
  };

  const rehydrate = async () => {
    toast.promise(
      fetch('/api/rehydrate').then(res => res.json()),
      {
        loading: 'Updating enrollments...',
        success: data => `${data?.count} enrollments updated successfully`,
        error: 'Failed to update enrollments',
      },
    );
  };

  if (isLoading) return <LoadingSpinner />;

  if (error) {
    if (error.status === 401) {
      router.push(`/api/auth/signin?callbackUrl=%2Fdashboard`);
      return null;
    }
    return (
      <Container>
        <div className='py-10 text-center'>
          <h2 className='text-xl font-semibold text-destructive'>
            Error loading enrollments
          </h2>
          <p className='mt-2 text-muted-foreground'>Please try again later</p>
          <Button onClick={() => refetch()} className='mt-4'>
            Retry
          </Button>
        </div>
      </Container>
    );
  }

  if (!data)
    return (
      <Container>
        <div className='py-10 text-center'>
          <h2 className='text-xl font-semibold'>No Data Available</h2>
          <p className='mt-2 text-muted-foreground'>
            There are no enrollments to display
          </p>
        </div>
      </Container>
    );

  const {enrollments, count, femaleCount, maleCount} = data;

  if (enrollments === undefined)
    return (
      <Container>
        <div className='py-10 text-center'>
          <h2 className='text-xl font-semibold'>No Enrollments Found</h2>
          <p className='mt-2 text-muted-foreground'>
            Try adjusting your filters
          </p>
        </div>
      </Container>
    );

  return (
    <Container>
      <DashboardHeader
        title='Enrollments'
        description='Manage and track student enrollments across all courses'
        actions={
          <Button onClick={rehydrate} className='ml-auto'>
            <RefreshCcw className='mr-2 h-4 w-4' />
            Rehydrate
          </Button>
        }
      />

      <EnrollmentSummary
        count={count}
        femaleCount={femaleCount}
        maleCount={maleCount}
        activeCount={
          enrollments.filter(e => !e.expired && !e.completed && e.activated_at)
            .length
        }
        completedCount={enrollments.filter(e => e.completed).length}
        expiredCount={enrollments.filter(e => e.expired).length}
        pendingCount={enrollments.filter(e => !e.activated_at).length}
      />

      <Card className='mt-6'>
        <EnrollmentListFilters onChange={handleFiltersChange} />
        <EnrollmentListTable
          enrollments={enrollments}
          enrollmentsCount={count}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </Card>
    </Container>
  );
}

EnrollmentsPage.getLayout = page => <DashboardLayout>{page}</DashboardLayout>;
