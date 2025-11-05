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
import Image from '../../public/static/images/info.jpg';
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
import PersonalInformation from '../../components/home/personal-information-main';
import toast from 'react-hot-toast';

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
      return <VerifyEmail email={session?.user?.email || session?.userData?.email || applicant?.email || ''} onBack={() => {}} />;
    case 3:
      return (
        <PersonalInformation
          userId={(session as any)?.userData?.userId}
          handlers={handlers}
          state={{editApplicant: handlers.editApplicant}}
          applicant={applicant}
          // cohortCourses={coursesData}
        />
      );
    case 4:
      return <EndOfApplicationNew handlers={{ handleNext: () => {} }} />;
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
  const [isProcessingEnrollment, setIsProcessingEnrollment] = useState(false);

  // Set the active step from URL query parameter
  useEffect(() => {
    if (step) {
      const stepNumber = parseInt(step as string);
      if (!isNaN(stepNumber) && stepNumber >= 0 && stepNumber < steps.length) {
        setActiveStep(stepNumber);
      }
    }

    // Store the cohortId in localStorage if available
    if (cohortId) {
      localStorage.setItem('selectedCohortId', cohortId as string);
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
  
  // Get cohortId from URL, localStorage, or use a default
  const effectiveCohortId = cohortId || 
    (typeof window !== 'undefined' ? localStorage.getItem('selectedCohortId') : null) ||
    'default';
  
  const skipCohortCoursesQuery =
    (activeStep !== 0 && activeStep !== 3) || !effectiveCohortId;

  // Fetch applicant data (for personal info step)
  const {data: applicantData, isLoading: applicantLoading} =
    useGetApplicantQuery((session as any)?.userData?.userId, {
      skip: skipApplicantQuery,
    });

  // Fetch cohort courses (for course selection step)
  const {data: cohortData, isLoading: coursesLoading} =
    useGetCohortCoursesQuery(
      {id: effectiveCohortId as string},
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

  // Function to handle enrollment activation after finishing registration
  const handleFinishAndEnroll = async () => {
    // Prevent multiple simultaneous calls
    if (isProcessingEnrollment) {
      console.log('⏸️ Enrollment processing already in progress, ignoring duplicate click');
      return;
    }

    setIsProcessingEnrollment(true);
    const loadingToast = toast.loading('Processing enrollment... Please wait.');

    try {
      console.log('🎯 Starting enrollment activation after registration completion...');
      
      // Get user data
      const userData = await fetch('/api/users/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!userData.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      const user = await userData.json();
      console.log('👤 User data:', user);
      
      toast.loading('Fetching enrollment information...', { id: loadingToast });
      
      // Find existing enrollment
      const enrollmentResponse = await fetch(`/api/enrollments/cached?user_email=${user.email}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!enrollmentResponse.ok) {
        throw new Error('Failed to fetch enrollment data');
      }
      
      const enrollmentData = await enrollmentResponse.json();
      console.log('📚 Enrollment data:', enrollmentData);
      
      if (enrollmentData.enrollments && enrollmentData.enrollments.length > 0) {
        const enrollment = enrollmentData.enrollments[0];
        
        toast.loading('Activating your enrollment... This may take a moment.', { id: loadingToast });
        
        // Activate enrollment using retry API
        const retryResponse = await fetch('/api/enrollments/retry', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uid: enrollment.uid,
            user_email: user.email,
            course_id: enrollment.course_id,
            course_name: enrollment.course_name,
            userCohortId: enrollment.userCohortId
          }),
        });
        
        if (retryResponse.ok) {
          console.log('✅ Enrollment activated successfully!');
          toast.success('Registration completed! You are now enrolled in your course.', { id: loadingToast });
          
          // Store enrollment success in session storage for dashboard refresh
          localStorage.setItem('enrollmentActivated', 'true');
          localStorage.setItem('enrollmentCourse', enrollment.course_name);
          
          // Redirect to dashboard
          router.push('/dashboard');
        } else {
          const errorData = await retryResponse.text();
          console.error('❌ Failed to activate enrollment:', errorData);
          toast.error('Registration completed, but enrollment activation failed. Please contact support.', { id: loadingToast });
          
          // Redirect to dashboard
          router.push('/dashboard');
        }
      } else {
        console.log('⚠️ No enrollment found for user');
        toast.error('No enrollment found. Please contact support.', { id: loadingToast });
      }
    } catch (error: any) {
      console.error('❌ Error during enrollment activation:', error);
      toast.error('Registration completed, but there was an issue with enrollment. Please contact support.', { id: loadingToast });
      
      // Still redirect to dashboard
      router.push('/dashboard');
    } finally {
      setIsProcessingEnrollment(false);
    }
  };

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
        effectiveCohortId && effectiveCohortId !== 'default' ? `&cohortId=${effectiveCohortId}` : ''
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
        effectiveCohortId && effectiveCohortId !== 'default' ? `&cohortId=${effectiveCohortId}` : ''
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
        effectiveCohortId && effectiveCohortId !== 'default' ? `&cohortId=${effectiveCohortId}` : ''
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
        <img src="/static/images/info.jpg" alt="Info" style={{ width: '100%', height: 'auto' }} />

        <Box sx={{display: 'flex', backgroundColor: '#000', justifyContent: 'center'}}> 
        <Typography
            variant='h2'
            color='#fff'
            align='center'
            display='flex'
            justifyContent='bottom'
            sx={{
              margin: '20px',
            }}>
            {activeStep === 3
              ? `${applicant?.profile?.selectedCourseName} Registration form`
              : 'Registration Form'}
          </Typography>

        </Box>

        <Box sx={{display: 'flex', justifyContent: 'center'}}>
          <Paper elevation={3} sx={{
            width: { xs: '95%', md: '90%', lg: '1300px' },
            m: { xs: '10px', md: '20px', lg: '50px' },
            p: { xs: '10px', md: '20px' },
            overflow: 'hidden'
          }}>
            <Stepper 
              activeStep={activeStep}
              sx={{
                width: '100%',
                overflowX: { xs: 'auto', md: 'visible' },
                '& .MuiStepLabel-label': {
                  fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }
                }
              }}
            >
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
                    <Button 
                      variant='contained' 
                      onClick={handleFinishAndEnroll}
                      disabled={isProcessingEnrollment}
                      sx={{ minWidth: '120px' }}
                    >
                      {isProcessingEnrollment ? 'Processing...' : 'Finish'}
                    </Button>
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
