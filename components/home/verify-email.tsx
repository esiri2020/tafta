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
import { useGetVerificationStatusQuery, useResendVerificationMutation } from '../../services/api';
import { RegistrationHandlers } from '../../types/registration';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

interface VerifyEmailProps {
  handlers: RegistrationHandlers;
  email: string;
}

export const VerifyEmail = ({ handlers, email }: VerifyEmailProps) => {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [resendStatus, setResendStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  
  // Ensure we have a valid email before starting the query
  const skipQuery = !email || email.trim() === '';
  
  const { data: verificationStatus } = useGetVerificationStatusQuery(
    { email },
    { 
      pollingInterval: 10000, // Poll every 10 seconds
      skip: skipQuery
    }
  );
  
  const [resendVerification, { isLoading: isResending }] = useResendVerificationMutation();
  const { handleNext } = handlers;
  const router = useRouter();
  const { data: session } = useSession();

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

    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (verificationStatus?.verified) {
      handleNext();
    }
  }, [verificationStatus, handleNext]);

  useEffect(() => {
    // If the user is already verified (coming back from email verification), 
    // automatically proceed to the personal information step
    if (router.query.verified === 'true' && router.query.userId) {
      handleNext();
    }
  }, [router.query, handleNext]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleResendEmail = async () => {
    try {
      setResendStatus(null);
      const result = await resendVerification({ email }).unwrap();
      if (result.success) {
        setResendStatus({ success: true, message: 'Verification email has been resent.' });
        setTimeLeft(300); // Reset timer
      } else {
        setResendStatus({ success: false, message: 'Failed to resend verification email. Please try again.' });
      }
    } catch (error) {
      console.error('Failed to resend verification email:', error);
      setResendStatus({ success: false, message: 'An error occurred. Please try again later.' });
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

            {resendStatus && (
              <Alert 
                severity={resendStatus.success ? "success" : "error"} 
                sx={{ mb: 3 }}
              >
                {resendStatus.message}
              </Alert>
            )}

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
                  disabled={isResending}
                >
                  {isResending ? 'Sending...' : 'Resend Verification Email'}
                </Button>
              </Box>
            )}

            <Typography
              variant="body1"
              align="center"
              sx={{ marginBottom: '20px' }}
            >
              After verifying your email, you will automatically proceed to complete your personal information.
            </Typography>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                onClick={handlers.handleBack}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={() => handleNext()}
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