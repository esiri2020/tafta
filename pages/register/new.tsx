// New page for testing the updated registration flow
// This keeps the original /register page working 

import { useState } from 'react';
import { Box, Container, Paper, Stepper, Step, StepLabel, Typography } from '@mui/material';
import { RegisterTypeSelector } from '../../components/home/register-type-selector';
import { RegisterEnterprise } from '../../components/home/register-enterprise';
import { RegisterIndividual } from '../../components/home/register-individual';
import { VerifyEmail } from '../../components/home/verify-email';
import { CohortSelector } from '../../components/home/cohort-selector';
import { PersonalInformation } from '../../components/home/personal-information';
import { RegistrationType, RegistrationHandlers } from '../../types/registration';
import { NextPage } from 'next';

// These are the steps for the registration process
const steps = ['Course Selection', 'Registration Type', 'Complete Registration', 'Verify Email', 'Personal Information'];

const NewRegisterPage: NextPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [registrationType, setRegistrationType] = useState<RegistrationType | null>(null);
  const [email, setEmail] = useState<string>('');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');

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

  const handleNext = (email?: string) => {
    if (email) {
      setEmail(email);
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
        return <PersonalInformation handlers={{ handleNext }} registrationType={registrationType} cohortId={selectedCourseId} />;
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