import React from 'react';
import Head from 'next/head';
import { Box, Container, Typography, Paper } from '@mui/material';
import { MobilizerRegistrationForm } from '@/components/mobilizer/registration-form';
import { MainLayout } from '@/components/main-layout';

const MobilizerRegistrationPage = () => {
  return (
    <>
      <Head>
        <title>Mobilizer Registration - TAFTA</title>
        <meta name="description" content="Register as a TAFTA mobilizer to start referring students" />
      </Head>
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, mb: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h3" component="h1" gutterBottom>
              Become a TAFTA Mobilizer
            </Typography>
            <Typography variant="h6" color="text.secondary" paragraph>
              Help students discover opportunities and track their progress
            </Typography>
            <Typography variant="body1" color="text.secondary">
              As a mobilizer, you can refer students to TAFTA programs and monitor their learning journey.
              Join our network of community leaders, educators, and professionals making a difference.
            </Typography>
          </Box>
        </Paper>

        <MobilizerRegistrationForm />

        <Paper sx={{ p: 4, mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Why Become a Mobilizer?
          </Typography>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
            <Box>
              <Typography variant="h6" gutterBottom>
                📚 Educational Impact
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Help students access quality education and skills training that can transform their careers.
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" gutterBottom>
                📊 Progress Tracking
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Monitor the progress of your referrals and celebrate their achievements as they complete courses.
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" gutterBottom>
                🤝 Community Building
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Be part of a network of mobilizers working together to create opportunities for students.
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </>
  );
};

// Add the layout function to wrap the page with MainLayout
MobilizerRegistrationPage.getLayout = (page: any) => <MainLayout>{page}</MainLayout>;

export default MobilizerRegistrationPage;

