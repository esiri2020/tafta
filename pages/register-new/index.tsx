import {useState, useEffect} from 'react';
import {MainLayout} from '../../components/main-layout';
import Head from 'next/head';
import NextLink from 'next/link';
import {
  CourseInformationNew,
  PersonalInformationNew,
  EducationInformationNew,
  VerifyEmail,
  MoreInformationNew,
  EndOfApplicationNew,
  InitialCourseSelectionNew,
} from '../../components/home/personal-information-new';
import {RegisterStepNew} from '../../components/home/register-step0-new';
import {
  Card,
  CardContent,
  Paper,
  Avatar,
  Box,
  Button,
  Grid,
  Container,
  Typography,
} from '@mui/material';
import Image from '../../public/static/images/info.png';
import * as React from 'react';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import {useRouter} from 'next/router';
import {
  useGetApplicantQuery,
  useEditApplicantMutation,
  useGetCohortCoursesQuery,
} from '../../services/api';
import {GetServerSideProps, NextPageContext} from 'next';
import {SplashScreen} from '../../components/splash-screen';
import {signIn, useSession} from 'next-auth/react';

const steps = [
  'Course Selection',
  'Register',
  'Verify Email',
  'Personal Information',
  'EndOfApplication',
];

type StepContentProps = {
  activeStep: number;
  userId: string | string[] | undefined;
  session: any;
  applicant: any;
  coursesData: any;
  handlers: any;
};

function StepContent({
  activeStep,
  userId,
  session,
  applicant,
  coursesData,
  handlers,
}: StepContentProps) {
  switch (activeStep) {
    case 0:
      return (
        <InitialCourseSelectionNew
          handlers={handlers}
          cohortCourses={coursesData}
        />
      );
    case 1:
      return <RegisterStepNew handlers={handlers} />;
    case 2:
      return <VerifyEmail />;
    case 3:
      return (
        <PersonalInformationNew
          userId={(session as any)?.userData?.userId}
          handlers={handlers}
          state={{editApplicant: handlers.editApplicant}}
          applicant={applicant}
        />
      );
    case 4:
      return <EndOfApplicationNew />;
    default:
      return <div>Step not found</div>;
  }
}

function RegisterNew() {
  const router = useRouter();
  const {step, cohortId} = router.query;
  const {data: session, status: sessionStatus} = useSession();

  // State management
  const [activeStep, setActiveStep] = useState(0);
  const [skipped, setSkipped] = useState(new Set<number>());
  const [isLoading, setIsLoading] = useState(true);

  // Set the active step from URL query parameter
  useEffect(() => {
    if (step) {
      const stepNumber = parseInt(step as string);
      if (!isNaN(stepNumber) && stepNumber >= 0 && stepNumber < steps.length) {
        setActiveStep(stepNumber);
      }
    }

    // Store the cohortId in sessionStorage if available
    if (cohortId) {
      sessionStorage.setItem('selectedCohortId', cohortId as string);
    }
  }, [step, cohortId]);

  // Handle session redirection logic
  useEffect(() => {
    // If trying to access a protected step without session
    if (activeStep >= 3 && sessionStatus === 'unauthenticated') {
      router.replace('/register-new?step=1');
    }

    // Update loading state once session is determined
    if (sessionStatus !== 'loading') {
      setIsLoading(false);
    }
  }, [activeStep, sessionStatus, router]);

  // Skip data fetching for steps that don't need it
  const skipApplicantQuery =
    activeStep < 3 || !(session as any)?.userData?.userId;
  const skipCohortCoursesQuery =
    (activeStep !== 0 && activeStep !== 3) || !cohortId;

  // Fetch applicant data (for personal info step)
  const {data: applicantData, isLoading: applicantLoading} =
    useGetApplicantQuery((session as any)?.userData?.userId, {
      skip: skipApplicantQuery,
    });

  // Fetch cohort courses (for course selection step)
  const {data: cohortData, isLoading: coursesLoading} =
    useGetCohortCoursesQuery(
      {id: cohortId ? (cohortId as string) : 'default'},
      {
        skip: skipCohortCoursesQuery,
        // Provide fallback empty data structure to prevent undefined errors
        selectFromResult: result => {
          return {
            ...result,
            data: result.data || {cohortCourses: []},
          };
        },
      },
    );

  const [editApplicant] = useEditApplicantMutation();

  // Stepper navigation functions
  const isStepOptional = (step: number) => {
    return false; // No optional steps in this flow
  };

  const isStepSkipped = (step: number) => {
    return skipped.has(step);
  };

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    const nextStep = activeStep + 1;
    setActiveStep(nextStep);
    setSkipped(newSkipped);

    // Update URL to reflect step change
    router.push(
      `/register-new?step=${nextStep}${
        cohortId ? `&cohortId=${cohortId}` : ''
      }`,
      undefined,
      {shallow: true},
    );
  };

  const handleBack = () => {
    const prevStep = activeStep - 1;
    setActiveStep(prevStep);

    // Update URL to reflect step change
    router.push(
      `/register-new?step=${prevStep}${
        cohortId ? `&cohortId=${cohortId}` : ''
      }`,
      undefined,
      {shallow: true},
    );
  };

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      throw new Error("You can't skip a step that isn't optional.");
    }

    const nextStep = activeStep + 1;
    setActiveStep(nextStep);

    setSkipped(prevSkipped => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });

    // Update URL to reflect step change
    router.push(
      `/register-new?step=${nextStep}${
        cohortId ? `&cohortId=${cohortId}` : ''
      }`,
      undefined,
      {shallow: true},
    );
  };

  // Show loading screen when data is being fetched
  if (
    isLoading ||
    sessionStatus === 'loading' ||
    (activeStep === 0 && coursesLoading && !cohortData) ||
    (activeStep === 3 && applicantLoading && !applicantData)
  ) {
    return <SplashScreen />;
  }

  // Extract data from query results
  const applicant = applicantData?.user;
  const coursesData = cohortData?.cohortCourses || [];

  // Create handlers object for child components
  const handlers = {
    activeStep,
    steps,
    isStepOptional,
    handleNext,
    handleBack,
    handleSkip,
    editApplicant,
    setActiveStep,
  };

  return (
    <>
      <Head>
        <title>Register | TAFTA</title>
      </Head>
      <main>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundImage: `url(${Image.src})`,
            height: '292px',
            width: '100%',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
          }}>
          <Typography
            variant='h2'
            color='#fff'
            align='center'
            sx={{
              marginBottom: '50px',
            }}>
            Registration Form
          </Typography>
        </Box>

        <Box sx={{display: 'flex', justifyContent: 'center'}}>
          <Paper elevation={3} sx={{width: '1300px', m: '50px', p: '20px'}}>
            <Stepper activeStep={activeStep}>
              {steps.map((label, index) => {
                const stepProps: {completed?: boolean} = {};
                const labelProps: {
                  optional?: React.ReactNode;
                } = {};

                if (isStepOptional(index)) {
                  labelProps.optional = (
                    <Typography variant='caption'>Optional</Typography>
                  );
                }

                if (isStepSkipped(index)) {
                  stepProps.completed = false;
                }

                return (
                  <Step key={label} {...stepProps}>
                    <StepLabel {...labelProps}>{label}</StepLabel>
                  </Step>
                );
              })}
            </Stepper>

            <Box>
              {activeStep === steps.length - 1 ? (
                <React.Fragment>
                  <Box>
                    <Card>
                      <CardContent
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                        }}>
                        <Typography
                          variant='h5'
                          align='center'
                          sx={{
                            marginBottom: '50px',
                            padding: '50px',
                          }}>
                          Dear User, you have successfully completed your
                          application. Click Finish to proceed to your
                          dashboard.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                  <Grid sx={{display: 'flex', flexDirection: 'row', pt: 2}}>
                    <Grid sx={{flex: '1 1 auto'}} />
                    <NextLink href='/dashboard' passHref>
                      <Button variant='contained'>Finish</Button>
                    </NextLink>
                  </Grid>
                </React.Fragment>
              ) : (
                <StepContent
                  activeStep={activeStep}
                  userId={(session as any)?.userData?.userId}
                  session={session}
                  applicant={applicant}
                  coursesData={coursesData}
                  handlers={handlers}
                />
              )}
            </Box>
          </Paper>
        </Box>
      </main>
    </>
  );
}

RegisterNew.getLayout = (page: any) => <MainLayout>{page}</MainLayout>;

export default RegisterNew;

export const getServerSideProps: GetServerSideProps = async context => {
  const {query} = context;
  return {props: {query}};
};
