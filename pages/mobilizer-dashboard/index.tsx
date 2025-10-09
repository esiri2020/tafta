import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Box, Container, Typography, Alert } from '@mui/material';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { useGetMobilizerByIdQuery, useGetMobilizerStatsQuery } from '@/services/api';
import { SplashScreen } from '@/components/splash-screen';
import dynamic from 'next/dynamic';

// Dynamically import admin dashboard components with loading states
const EnrollmentOverTimeChart = dynamic(
  () =>
    import('@/components/dashboard/enrollment-over-time-chart').then(
      mod => mod.EnrollmentOverTimeChart,
    ),
  {ssr: false, loading: () => <div>Loading chart...</div>},
);

const CourseDistributionChart = dynamic(
  () =>
    import('@/components/dashboard/course-distribution-chart').then(
      mod => mod.CourseDistributionChart,
    ),
  {ssr: false, loading: () => <div>Loading chart...</div>},
);

const EnrollmentStatusChart = dynamic(
  () =>
    import('@/components/dashboard/enrollment-status-chart').then(
      mod => mod.EnrollmentStatusChart,
    ),
  {ssr: false, loading: () => <div>Loading chart...</div>},
);

const MetricsCards = dynamic(
  () =>
    import('@/components/dashboard/metrics-cards').then(
      mod => mod.MetricsCards,
    ),
  {ssr: false, loading: () => <div>Loading metrics...</div>},
);

const MobilizerDashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Get mobilizer data based on user's mobilizer code
  const mobilizerId = (session as any)?.userData?.mobilizerId;
  console.log('🔍 Mobilizer Dashboard Debug:', {
    hasSession: !!session,
    hasUserData: !!(session as any)?.userData,
    mobilizerId: mobilizerId,
    role: (session as any)?.userData?.role,
    email: (session as any)?.userData?.email,
    userId: (session as any)?.userData?.userId
  });
  
  const { data: mobilizerData, isLoading: mobilizerLoading, error: mobilizerError } = useGetMobilizerByIdQuery(
    mobilizerId || '',
    {
      skip: !mobilizerId,
    }
  );

  // Fetch mobilizer stats
  const { data: statsData, isLoading: statsLoading, error: statsError } = useGetMobilizerStatsQuery(
    mobilizerId || '',
    {
      skip: !mobilizerId,
    }
  );
  
  console.log('🔍 Mobilizer Query Debug:', {
    querySkipped: !mobilizerId,
    mobilizerData: mobilizerData,
    mobilizerLoading: mobilizerLoading,
    mobilizerError: mobilizerError,
    hasMobilizer: !!mobilizerData?.mobilizer,
    statsData: statsData,
    statsLoading: statsLoading
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    // Only redirect if session is loaded and role is not MOBILIZER
    if (status === 'authenticated' && (session as any)?.userData?.role && (session as any)?.userData?.role !== 'MOBILIZER') {
      router.push('/dashboard');
    }
  }, [session, router, status]);

  // Force session refresh if mobilizerId is missing
  useEffect(() => {
    if (session && (session as any)?.userData?.role === 'MOBILIZER' && !mobilizerId) {
      console.log('🔄 MobilizerId missing, forcing session refresh...');
      // Force a session refresh by signing out and back in
      // This is a temporary workaround
      window.location.reload();
    }
  }, [session, mobilizerId]);

  if (status === 'loading' || mobilizerLoading || statsLoading) {
    return <SplashScreen />;
  }

  if (!(session as any)?.userData || (session as any).userData.role !== 'MOBILIZER') {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error">
          Access denied. This page is only available for mobilizers.
        </Alert>
      </Container>
    );
  }

  if (mobilizerError) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error">
          Error loading mobilizer data: {(mobilizerError as any)?.message || 'Unknown error'}
        </Alert>
      </Container>
    );
  }

  // Check if mobilizerId is missing from session
  if (!mobilizerId && (session as any)?.userData?.role === 'MOBILIZER') {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>Mobilizer ID Missing</Typography>
          <Typography variant="body2">
            Your account is marked as a mobilizer, but no mobilizer record is linked to your user account.
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            User ID: {(session as any)?.userData?.userId}
          </Typography>
          <Typography variant="body2">
            Email: {(session as any)?.userData?.email}
          </Typography>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Please contact support to link your mobilizer profile.
          </Typography>
        </Alert>
      </Container>
    );
  }

  if (!mobilizerData?.mobilizer && !mobilizerLoading && mobilizerId) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>Mobilizer Profile Not Found</Typography>
          <Typography variant="body2">
            No mobilizer profile found with ID: {mobilizerId}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Please contact support.
          </Typography>
        </Alert>
      </Container>
    );
  }

  // At this point, we should have a mobilizer
  if (!mobilizerData?.mobilizer) {
    return <SplashScreen />;
  }

  const mobilizer = mobilizerData.mobilizer;
  const stats = statsData?.stats || {
    totalReferrals: mobilizer.totalReferrals,
    activeReferrals: mobilizer.activeReferrals,
    completedReferrals: mobilizer.completedReferrals,
    completionRate: 0,
    averageCompletionPercentage: 0,
    referralsByCourse: [],
    referralsByStatus: [],
  };

  return (
    <>
      <Head>
        <title>Mobilizer Dashboard - TAFTA</title>
      </Head>
      <DashboardLayout>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            py: 8,
          }}
        >
          <Container maxWidth={false}>
            <Typography variant="h4" component="h1" gutterBottom>
              Mobilizer Dashboard - {mobilizer.fullName}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Mobilizer Code: {mobilizer.code} • Organization: {mobilizer.organization || 'N/A'}
            </Typography>
            
            {/* Debug info */}
            <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Debug: Mobilizer ID: {mobilizerId} | Loading: {mobilizerLoading ? 'Yes' : 'No'} | Error: {mobilizerError ? 'Yes' : 'No'}
              </Typography>
            </Box>

            {/* Use existing admin dashboard components with mobilizer-filtered data */}
            <Box sx={{ display: 'grid', gap: 3 }}>
              {/* Metrics Cards - Temporarily commented out to isolate loading issue */}
              {/* <Box>
                <MetricsCards data={mobilizerDashboardData} />
              </Box> */}
              
              {/* Stats display */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
                <Box sx={{ p: 3, border: '1px solid #ddd', borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="h3" color="primary">{stats.totalReferrals}</Typography>
                  <Typography variant="body2" color="text.secondary">Total Referrals</Typography>
                </Box>
                <Box sx={{ p: 3, border: '1px solid #ddd', borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="h3" color="success.main">{stats.activeReferrals}</Typography>
                  <Typography variant="body2" color="text.secondary">Active Referrals</Typography>
                </Box>
                <Box sx={{ p: 3, border: '1px solid #ddd', borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="h3" color="info.main">{stats.completedReferrals}</Typography>
                  <Typography variant="body2" color="text.secondary">Completed Referrals</Typography>
                </Box>
                <Box sx={{ p: 3, border: '1px solid #ddd', borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="h3" color="warning.main">{stats.completionRate}%</Typography>
                  <Typography variant="body2" color="text.secondary">Completion Rate</Typography>
                </Box>
              </Box>

              {/* Referrals by Course */}
              {stats.referralsByCourse && stats.referralsByCourse.length > 0 && (
                <Box sx={{ mt: 3, p: 3, border: '1px solid #ddd', borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>Referrals by Course</Typography>
                  <Box sx={{ display: 'grid', gap: 2 }}>
                    {stats.referralsByCourse.map((course: any, index: number) => (
                      <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">{course.courseName}</Typography>
                        <Typography variant="body1" fontWeight="bold">{course.count}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Referrals by Status */}
              {stats.referralsByStatus && stats.referralsByStatus.length > 0 && (
                <Box sx={{ mt: 3, p: 3, border: '1px solid #ddd', borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>Referrals by Status</Typography>
                  <Box sx={{ display: 'grid', gap: 2 }}>
                    {stats.referralsByStatus.map((status: any, index: number) => (
                      <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>{status.status}</Typography>
                        <Typography variant="body1" fontWeight="bold">{status.count}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Charts Grid - Temporarily commented out to isolate loading issue */}
              {/* <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
                <Box>
                  <EnrollmentOverTimeChart
                    data={[]}
                  />
                </Box>
                <Box>
                  <EnrollmentStatusChart
                    data={{
                      active: Number(mobilizerDashboardData.active_enrollees),
                      inactive: Number(mobilizerDashboardData.inactive_enrollments),
                      certified: Number(mobilizerDashboardData.certified_enrollees),
                    }}
                  />
                </Box>
              </Box>

              <Box>
                <CourseDistributionChart
                  data={[]}
                />
              </Box> */}
            </Box>
          </Container>
        </Box>
      </DashboardLayout>
    </>
  );
};

export default MobilizerDashboard;
