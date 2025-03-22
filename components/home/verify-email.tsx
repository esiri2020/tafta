import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Button,
  Alert,
} from '@mui/material';
import { useGetVerificationStatusQuery } from '../../services/api';
import { RegistrationHandlers } from '../../types/registration';

interface VerifyEmailProps {
  handlers: RegistrationHandlers;
  email: string;
}

export const VerifyEmail = ({ handlers, email }: VerifyEmailProps) => {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const { data: verificationStatus, refetch } = useGetVerificationStatusQuery(
    { email },
    { pollingInterval: 10000 } // Poll every 10 seconds
  );

  useEffect(() => {
    // Start countdown
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Start polling
    const poll = setInterval(() => {
      refetch();
    }, 10000);
    setPollingInterval(poll);

    return () => {
      clearInterval(timer);
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, []);

  useEffect(() => {
    if (verificationStatus?.verified) {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
      handlers.handleNext();
    }
  }, [verificationStatus?.verified]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleResendEmail = async () => {
    try {
      // Add your resend email logic here
      setTimeLeft(300); // Reset timer
    } catch (error) {
      console.error('Failed to resend verification email:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Container maxWidth="sm">
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h5" sx={{ mb: 3 }}>
              Verify Your Email
            </Typography>

            <Alert severity="info" sx={{ mb: 3 }}>
              We've sent a verification link to <strong>{email}</strong>
            </Alert>

            <Box sx={{ mb: 3 }}>
              <CircularProgress size={60} />
              <Typography variant="body1" sx={{ mt: 2 }}>
                Waiting for verification...
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Time remaining: {formatTime(timeLeft)}
              </Typography>
            </Box>

            {timeLeft === 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body1" color="error" sx={{ mb: 2 }}>
                  Verification link expired
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleResendEmail}
                >
                  Resend Verification Email
                </Button>
              </Box>
            )}

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                onClick={handlers.handleBack}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={() => handlers.handleNext(email)}
                disabled={!verificationStatus?.verified}
              >
                Next
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}; 