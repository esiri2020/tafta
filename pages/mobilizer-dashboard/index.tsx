import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Box, Container, Typography, Alert } from '@mui/material';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { useGetMobilizerByIdQuery } from '@/services/api';
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
  const mobilizerId = session?.userData?.mobilizerId;
  console.log('🔍 Mobilizer Dashboard Debug:', {
    session: session,
    userData: session?.userData,
    mobilizerId: mobilizerId,
    role: session?.userData?.role
  });
  
  const { data: mobilizerData, isLoading: mobilizerLoading, error: mobilizerError } = useGetMobilizerByIdQuery(
    mobilizerId || '',
    {
      skip: !mobilizerId,
    }
  );
  
  console.log('🔍 Mobilizer Query Debug:', {
    mobilizerData,
    mobilizerLoading,
    mobilizerError
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.userData?.role !== 'MOBILIZER') {
      router.push('/dashboard');
    }
  }, [session, router]);

  // Force session refresh if mobilizerId is missing
  useEffect(() => {
    if (session && session?.userData?.role === 'MOBILIZER' && !mobilizerId) {
      console.log('🔄 MobilizerId missing, forcing session refresh...');
      // Force a session refresh by signing out and back in
      // This is a temporary workaround
      window.location.reload();
    }
  }, [session, mobilizerId]);

  if (status === 'loading') {
    return <SplashScreen />;
  }
  
  if (mobilizerLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="info">
          Loading mobilizer data...
        </Alert>
      </Container>
    );
  }

  if (!session?.userData || session.userData.role !== 'MOBILIZER') {
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
          Error loading mobilizer data: {mobilizerError?.message || 'Unknown error'}
        </Alert>
      </Container>
    );
  }

  if (!mobilizerData?.mobilizer) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="warning">
          Mobilizer profile not found. Please contact support.
        </Alert>
      </Container>
    );
  }

  const mobilizer = mobilizerData.mobilizer;

  // Mock data for mobilizer dashboard - in real implementation, this would come from API
  const mobilizerDashboardData = {
    total_enrolled_by_courses: mobilizer.totalReferrals,
    total_enrolled_applicants: mobilizer.totalReferrals,
    female_enrollments: Math.floor(mobilizer.totalReferrals * 0.6), // Mock data
    male_enrollments: Math.floor(mobilizer.totalReferrals * 0.4), // Mock data
    active_enrollees: mobilizer.activeReferrals,
    certified_enrollees: mobilizer.completedReferrals,
    total_applicants: mobilizer.totalReferrals,
    inactive_enrollments: mobilizer.totalReferrals - mobilizer.activeReferrals,
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
              
              {/* Simple stats display */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
                <Box sx={{ p: 3, border: '1px solid #ddd', borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="h3" color="primary">{mobilizer.totalReferrals}</Typography>
                  <Typography variant="body2" color="text.secondary">Total Referrals</Typography>
                </Box>
                <Box sx={{ p: 3, border: '1px solid #ddd', borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="h3" color="success.main">{mobilizer.activeReferrals}</Typography>
                  <Typography variant="body2" color="text.secondary">Active Referrals</Typography>
                </Box>
                <Box sx={{ p: 3, border: '1px solid #ddd', borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="h3" color="info.main">{mobilizer.completedReferrals}</Typography>
                  <Typography variant="body2" color="text.secondary">Completed Referrals</Typography>
                </Box>
              </Box>

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
