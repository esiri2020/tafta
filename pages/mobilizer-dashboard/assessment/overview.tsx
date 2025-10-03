import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Box, Container, Typography, Alert } from '@mui/material';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { useGetMobilizerByIdQuery } from '@/services/api';
import { SplashScreen } from '@/components/splash-screen';
import dynamic from 'next/dynamic';

// Dynamically import existing assessment components
const AssessmentOverview = dynamic(
  () =>
    import('@/pages/admin-dashboard/assessment/overview.js').then(
      mod => mod.default,
    ),
  {ssr: false},
);

const MobilizerAssessment = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mobilizerId, setMobilizerId] = useState<string>('');

  // Get mobilizer data based on user's mobilizer code
  const { data: mobilizerData, isLoading: mobilizerLoading } = useGetMobilizerByIdQuery(
    session?.userData?.mobilizerId || '',
    {
      skip: !session?.userData?.mobilizerId,
    }
  );

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

  useEffect(() => {
    if (mobilizerData?.mobilizer?.id) {
      setMobilizerId(mobilizerData.mobilizer.id);
    }
  }, [mobilizerData]);

  if (status === 'loading' || mobilizerLoading) {
    return <SplashScreen />;
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

  return (
    <>
      <Head>
        <title>Assessment Overview - Mobilizer Dashboard</title>
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
              Assessment Overview
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              View assessment data for applicants referred by you (Mobilizer Code: {mobilizer.code})
            </Typography>

            {/* Use existing assessment component with mobilizer filtering */}
            <Box>
              <AssessmentOverview />
            </Box>
          </Container>
        </Box>
      </DashboardLayout>
    </>
  );
};

export default MobilizerAssessment;
