import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { 
  Box, 
  Container, 
  Typography, 
  Alert, 
  Card, 
  CardContent, 
  Grid, 
  Chip,
  Avatar,
  Divider
} from '@mui/material';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { useGetMobilizerByIdQuery } from '@/services/api';
import { SplashScreen } from '@/components/splash-screen';
import { Person as PersonIcon, Email as EmailIcon, Phone as PhoneIcon, Business as BusinessIcon } from '@mui/icons-material';

export default function MobilizerProfile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Use mobilizerId from session instead of URL parameter
  const mobilizerId = (session as any)?.userData?.mobilizerId;

  // Get mobilizer data
  const { data: mobilizerData, isLoading: mobilizerLoading, error: mobilizerError } = useGetMobilizerByIdQuery(
    mobilizerId || '',
    {
      skip: !mobilizerId,
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

  if (mobilizerError) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error">
          Error loading mobilizer profile: {(mobilizerError as any)?.message || 'Unknown error'}
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
        <title>My Profile - Mobilizer Dashboard</title>
      </Head>
      <DashboardLayout>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            py: 8,
          }}
        >
          <Container maxWidth="lg">
            <Typography variant="h4" component="h1" gutterBottom>
              My Profile
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Manage your mobilizer profile information
            </Typography>

            <Grid container spacing={3}>
              {/* Profile Overview Card */}
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        mx: 'auto',
                        mb: 2,
                        bgcolor: 'primary.main',
                        fontSize: '2rem'
                      }}
                    >
                      <PersonIcon fontSize="large" />
                    </Avatar>
                    <Typography variant="h5" gutterBottom>
                      {mobilizer.fullName}
                    </Typography>
                    <Chip 
                      label={`Code: ${mobilizer.code}`} 
                      color="primary" 
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Mobilizer
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Profile Details Card */}
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Profile Information
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Email
                            </Typography>
                            <Typography variant="body1">
                              {mobilizer.email}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>

                      {mobilizer.phoneNumber && (
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Phone Number
                              </Typography>
                              <Typography variant="body1">
                                {mobilizer.phoneNumber}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      )}

                      {mobilizer.organization && (
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Organization
                              </Typography>
                              <Typography variant="body1">
                                {mobilizer.organization}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Statistics Card */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Referral Statistics
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h3" color="primary">
                            {mobilizer.totalReferrals}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Total Referrals
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h3" color="success.main">
                            {mobilizer.activeReferrals}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Active Referrals
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h3" color="info.main">
                            {mobilizer.completedReferrals}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Completed Referrals
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </DashboardLayout>
    </>
  );
}
