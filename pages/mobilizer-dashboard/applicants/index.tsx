import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Box, Container, Typography, Alert } from '@mui/material';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { useGetMobilizerByIdQuery } from '@/services/api';
import { SplashScreen } from '@/components/splash-screen';
import { useAppSelector } from '@/hooks/rtkHook';
import { selectCohort } from '@/services/cohortSlice';
import dynamic from 'next/dynamic';

// Dynamically import existing applicant components
const ApplicantsList = dynamic(
  () =>
    import('@/components/applicants/applicants-list').then(
      mod => mod.ApplicantsList,
    ),
  {ssr: false},
);

const ApplicantsListToolbar = dynamic(
  () =>
    import('@/components/applicants/applicants-list-toolbar').then(
      mod => mod.ApplicantsListToolbar,
    ),
  {ssr: false},
);

const MobilizerApplicants = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mobilizerId, setMobilizerId] = useState<string>('');
  
  // Get selected cohort from Redux store
  const selectedCohort = useAppSelector(selectCohort);

  // Get mobilizer data based on user's mobilizer code
  const { data: mobilizerData, isLoading: mobilizerLoading } = useGetMobilizerByIdQuery(
    (session as any)?.userData?.mobilizerId || '',
    {
      skip: !(session as any)?.userData?.mobilizerId,
    }
  );

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if ((session as any)?.userData?.role !== 'MOBILIZER') {
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

  if (!(session as any)?.userData || (session as any).userData.role !== 'MOBILIZER') {
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
        <title>My Applicants - Mobilizer Dashboard</title>
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
              My Applicants
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              View and manage all applicants referred by you (Mobilizer Code: {mobilizer.code})
            </Typography>

            {/* Cohort filter info */}
            {selectedCohort && (
              <Box sx={{ mb: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                <Typography variant="body2" color="info.contrastText">
                  Showing applicants for cohort: <strong>{selectedCohort.name}</strong>
                </Typography>
              </Box>
            )}

            {/* Use existing applicant components with mobilizer filtering */}
            <Box sx={{ mb: 3 }}>
              <ApplicantsListToolbar 
                mobilizerId={mobilizerId}
                showMobilizerFilter={false} // Hide mobilizer filter since we're already filtered
              />
            </Box>

            <Box>
              <ApplicantsList 
                mobilizerId={mobilizerId}
                cohortId={selectedCohort?.id} // Pass cohort filter
                showMobilizerColumn={false} // Hide mobilizer column since all are from this mobilizer
              />
            </Box>
          </Container>
        </Box>
      </DashboardLayout>
    </>
  );
};

export default MobilizerApplicants;
