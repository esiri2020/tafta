import { Box, Container, Typography, Button, Card, CardContent } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';

const VerifySuccess: NextPage = () => {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Email Verified | Terra Academy</title>
      </Head>
      <Box
        sx={{
          backgroundColor: 'background.default',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          justifyContent: 'center',
          alignItems: 'center',
          py: 8
        }}
      >
        <Container maxWidth="sm">
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 5 }}>
              <CheckCircle color="success" sx={{ fontSize: 70, mb: 3 }} />
              <Typography variant="h4" gutterBottom>
                Email Verified Successfully
              </Typography>
              <Typography variant="body1" color="textSecondary" paragraph>
                Your email has been verified successfully and your account is now active.
              </Typography>
              <Typography variant="body1" color="textSecondary" paragraph>
                You can now log in to access your account and course materials.
              </Typography>
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  onClick={() => router.push('/login')}
                >
                  Log In
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={() => router.push('/')}
                >
                  Back to Home
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </>
  );
};

export default VerifySuccess; 