// New page for testing the updated registration flow
// This keeps the original /register page working 

import { useState, useEffect } from 'react';
import { Box, Container, Paper, Stepper, Step, StepLabel, Typography, Card, CardContent, Button, CircularProgress } from '@mui/material';
import { RegisterTypeSelector } from '../../components/home/register-type-selector';
import { RegisterEnterprise } from '../../components/home/register-enterprise';
import { RegisterIndividual } from '../../components/home/register-individual';
import { VerifyEmail } from '../../components/home/verify-email';
import { CohortSelector } from '../../components/home/cohort-selector';
// Choose the right PersonalInformation component based on file extension availability
import { PersonalInformation } from '../../components/home/personal-information-new';
import { RegistrationType, RegistrationHandlers } from '../../types/registration';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEditApplicantMutation, useGetApplicantQuery } from '../../services/api';

// These are the steps for the registration process
const steps = ['Course Selection', 'Registration Type', 'Complete Registration', 'Verify Email', 'Personal Information'];

const NewRegisterPage: NextPage = () => {
  const router = useRouter();
  const { userId: queryUserId, email: verifiedEmail, verified, courseId: queryCourseId } = router.query;
  const [editApplicant] = useEditApplicantMutation();
  
  const [activeStep, setActiveStep] = useState(0);
  const [registrationType, setRegistrationType] = useState<RegistrationType | null>(null);
  const [email, setEmail] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');

  // Fetch applicant data if we have a userId
  const { data: applicantData, isLoading } = useGetApplicantQuery(
    userId || queryUserId as string,
    { 
      skip: !(userId || queryUserId),
      refetchOnMountOrArgChange: true
    }
  );

  // Handle direct navigation from email verification
  useEffect(() => {
    if (router.isReady) {
      if (verified === 'true' && queryUserId && verifiedEmail) {
        // User came from email verification, go directly to personal information step
        setEmail(verifiedEmail as string);
        setUserId(queryUserId as string);
        if (queryCourseId) {
          setSelectedCourseId(typeof queryCourseId === 'string' ? queryCourseId : queryCourseId[0]);
        }
        
        // Determine the registration type from the URL if not set
        if (!registrationType) {
          const type = router.query.registrationType as RegistrationType;
          setRegistrationType(type || 'individual');
        }
        
        setActiveStep(4); // Personal information step
      }
    }
  }, [router.isReady, verified, queryUserId, verifiedEmail, queryCourseId, registrationType]);

  // Show loading state while fetching applicant data
  if (isLoading) {
    return (
      <Box sx={{ mt: 3 }}>
        <Card>
          <CardContent sx={{ py: 4 }}>
            <Typography variant="h6" align="center">
              Loading applicant information...
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <CircularProgress />
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const handleCourseSelect = (courseId: string) => {
    setSelectedCourseId(courseId);
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleTypeSelect = (type: RegistrationType) => {
    setRegistrationType(type);
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleNext = (email?: string, newUserId?: string) => {
    if (email) {
      setEmail(email);
    }
    if (newUserId) {
      setUserId(newUserId);
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleSkip = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const isStepOptional = () => false;

  const registrationHandlers: RegistrationHandlers = {
    activeStep,
    steps,
    isStepOptional,
    handleNext,
    handleBack,
    handleSkip,
    setActiveStep
  };

  const verificationHandlers: RegistrationHandlers = {
    activeStep,
    steps,
    isStepOptional,
    handleNext,
    handleBack,
    handleSkip,
    setActiveStep
  };

  const getStepContent = (step: number) => {
    const handleBack = () => {
      setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    switch (step) {
      case 0:
        return <CohortSelector onSelect={handleCourseSelect} />;
      case 1:
        return <RegisterTypeSelector onSelect={handleTypeSelect} />;
      case 2:
        return registrationType === 'enterprise' ? (
          <RegisterEnterprise handlers={registrationHandlers} />
        ) : (
          <RegisterIndividual handlers={registrationHandlers} />
        );
      case 3:
        return <VerifyEmail handlers={verificationHandlers} email={email} />;
      case 4:
        if (!registrationType) {
          return 'Registration type not selected';
        }
        if (!userId) {
          return (
            <Box sx={{ mt: 3 }}>
              <Card>
                <CardContent sx={{ py: 4 }}>
                  <Typography variant="h6" align="center" color="error">
                    Missing user ID. Please complete the registration process.
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Button variant="outlined" onClick={() => router.push('/register/new')}>
                      Return to Registration
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          );
        }
        return (
          <PersonalInformation 
            handlers={{ handleNext, handleBack }}
            registrationType={registrationType}
            courseId={selectedCourseId}
            userId={userId}
            applicant={applicantData?.applicant}
            data={applicantData}
          />
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container component="main" maxWidth="lg" sx={{ mb: 4 }}>
      <Paper variant="outlined" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
        <Typography component="h1" variant="h4" align="center">
          Registration
        </Typography>
        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Box>{getStepContent(activeStep)}</Box>
      </Paper>
    </Container>
  );
};

export default NewRegisterPage; 