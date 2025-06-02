import React, {useState, useEffect} from 'react';
import Head from 'next/head';
import {Box, Container, Grid} from '@mui/material';
import dynamic from 'next/dynamic';
import {DashboardLayout} from '@/components/dashboard/dashboard-layout';
import {SplashScreen} from '@/components/splash-screen';
import {
  useGetDashboardDataQuery,
  useGetLocationBreakdownQuery,
} from '@/services/api';
import {selectCohort} from '@/services/cohortSlice';
import {useAppSelector} from '@/hooks/rtkHook';
import type {DashboardData, LocationData, CourseEnrollment} from '@/types/api';
import {CourseCompletionStats} from '@/components/dashboard/statistics/course-completion-stats';

// Dynamically import chart components
const EnrollmentOverTimeChart = dynamic(
  () =>
    import('@/components/dashboard/enrollment-over-time-chart').then(
      mod => mod.EnrollmentOverTimeChart,
    ),
  {ssr: false},
);

const CourseDistributionChart = dynamic(
  () =>
    import('@/components/dashboard/course-distribution-chart').then(
      mod => mod.CourseDistributionChart,
    ),
  {ssr: false},
);

const EnrollmentStatusChart = dynamic(
  () =>
    import('@/components/dashboard/enrollment-status-chart').then(
      mod => mod.EnrollmentStatusChart,
    ),
  {ssr: false},
);

const LocationBreakdown = dynamic(
  () =>
    import('@/components/dashboard/location-breakdown').then(
      mod => mod.LocationBreakdown,
    ),
  {ssr: false},
);

const MetricsCards = dynamic(
  () =>
    import('@/components/dashboard/metrics-cards').then(
      mod => mod.MetricsCards,
    ),
  {ssr: false},
);

const LocationMetrics = dynamic(
  () =>
    import('@/components/dashboard/location-metrics').then(
      mod => mod.LocationMetrics,
    ),
  {ssr: false},
);

const IndexPage = () => {
  const [skip, setSkip] = useState(false);
  const cohort = useAppSelector(state => selectCohort(state));
  const {data, error, isLoading} = useGetDashboardDataQuery(
    {cohortId: cohort?.id},
    {skip},
  );
  const {data: locationData, isLoading: locationLoading} =
    useGetLocationBreakdownQuery({cohortId: cohort?.id}, {skip});

  useEffect(() => {
    setSkip(false);
  }, [cohort]);

  if (isLoading || locationLoading) {
    return <SplashScreen />;
  }
  if (error) return <div>An error occurred.</div>;
  if (!data) return null;

  // Transform location data to match the expected format
  const transformedLocationData = locationData?.states.map(
    (state: LocationData['states'][0]) => ({
      location: state.state,
      courses: state.courses.map(
        (course: LocationData['states'][0]['courses'][0]) => ({
          course_name: course.course,
          male_enrollments: course.male,
          female_enrollments: course.female,
        }),
      ),
    }),
  );

  return (
    <>
      <Head>
        <title>Super Admin Dashboard</title>
      </Head>
      <Box
        component='main'
        sx={{
          flexGrow: 1,
          py: 8,
        }}>
        <Container maxWidth={false}>
          {/* <CourseCompletionStats /> */}
          

          <Grid container spacing={3}>
            {/* Metrics Cards */}
            <Grid item xs={12}>
              <MetricsCards data={data} />
            </Grid>

            {/* Location Metrics */}
            <Grid item xs={12}>
              <LocationMetrics data={locationData || {states: []}} />
            </Grid>

            {/* Enrollment Over Time Chart */}
            <Grid item lg={8} md={12} xl={9} xs={12}>
              <EnrollmentOverTimeChart
                data={data.enrollment_completion_graph.map(item => ({
                  date: item.date,
                  male_count: Number(item.count),
                  female_count: Number(item.count), // TODO: Update when API provides gender breakdown
                }))}
              />
            </Grid>

            {/* Enrollment Status Chart */}
            <Grid item lg={4} md={6} xl={3} xs={12}>
              <EnrollmentStatusChart
                data={{
                  active: Number(data.active_enrollees),
                  inactive: Number(data.inactive_enrollments),
                  certified: Number(data.certified_enrollees),
                }}
              />
            </Grid>

            {/* Course Distribution Chart */}
            <Grid item lg={12} md={12} xl={9} xs={12}>
              <CourseDistributionChart
                data={
                  data.courseEnrollmentData?.map(
                    (course: CourseEnrollment) => ({
                      course_name: course.name,
                      total_enrollments: Number(course.count),
                      male_enrollments: Number(course.male_count || 0),
                      female_enrollments: Number(course.female_count || 0),
                    }),
                  ) || []
                }
              />
            </Grid>

            {/* Location Breakdown */}
            <Grid item lg={12} md={8} xl={3} xs={12}>
              <LocationBreakdown data={transformedLocationData || []} />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

IndexPage.getLayout = (page: any) => <DashboardLayout>{page}</DashboardLayout>;

export default IndexPage;
