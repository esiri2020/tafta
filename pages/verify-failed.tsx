import { Box, Container, Typography, Button, Card, CardContent } from '@mui/material';
import { Error } from '@mui/icons-material';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useEffect, useState } from 'react';

const VerifyFailed: NextPage = () => {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('An error occurred during email verification.');

  useEffect(() => {
    if (router.query.error) {
      switch (router.query.error) {
        case 'user-not-found':
          setErrorMessage('We couldn\'t find your account. Please try registering again.');
          break;
        case 'server-error':
          setErrorMessage('A server error occurred. Please try again later.');
          break;
        default:
          setErrorMessage('An error occurred during email verification.');
      }
    }
  }, [router.query.error]);

  return (
    <>
      <Head>
        <title>Verification Failed | Terra Academy</title>
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
              <Error color="error" sx={{ fontSize: 70, mb: 3 }} />
              <Typography variant="h4" gutterBottom>
                Verification Failed
              </Typography>
              <Typography variant="body1" color="textSecondary" paragraph>
                {errorMessage}
              </Typography>
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button 
                  variant="outlined" 
                  onClick={() => router.push('/register')}
                >
                  Back to Registration
                </Button>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => router.push('/login')}
                >
                  Go to Login
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </>
  );
};

export default VerifyFailed; 