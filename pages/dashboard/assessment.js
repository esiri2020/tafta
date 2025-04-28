import { useState } from 'react';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import { Box, Container, Typography, Button } from '@mui/material';
import { MainLayout } from '../../components/main-layout';
import { UserAssessmentForm } from '../../components/dashboard/assessment/UserAssessmentForm';
import { SplashScreen } from '../../components/splash-screen';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NextLink from 'next/link';

const AssessmentPage = () => {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <SplashScreen />;
  }

  if (!session) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5">
          You need to be logged in to access this page.
        </Typography>
        <NextLink href="/auth/login" passHref>
          <Button sx={{ mt: 2 }} variant="contained">
            Go to Login
          </Button>
        </NextLink>
      </Box>
    );
  }

  return (
    <>
      <Head>
        <title>TAFTA - Assessment Form</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ mb: 4 }}>
            <NextLink href="/dashboard" passHref>
              <Button
                component="a"
                startIcon={<ArrowBackIcon fontSize="small" />}
              >
                Back to Dashboard
              </Button>
            </NextLink>
          </Box>
          
          <Typography variant="h4" sx={{ mb: 4 }}>
            TAFTA Training Assessment
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 4 }}>
            Please complete this assessment form to help us improve our training programs. 
            Your feedback is valuable and will be used to enhance the TAFTA experience for future students.
          </Typography>
          
          <UserAssessmentForm userId={session?.userData?.userId} />
        </Container>
      </Box>
    </>
  );
};

AssessmentPage.getLayout = page => <MainLayout>{page}</MainLayout>;

export default AssessmentPage; 