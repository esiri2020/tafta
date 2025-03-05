import { useState, useEffect } from 'react';
import { MainLayout } from '../../components/main-layout';
import Head from 'next/head';
import NextLink from 'next/link';
import { CourseInformation, PersonalInformation, EducationInformation, VerifyEmail, MoreInformation, EndOfApplication } from '../../components/home/personal-information';
import { RegisterStep } from '../../components/home/register-step0';
import { Card, CardContent, Paper, Avatar, Box, Button, Grid, Container, Typography } from '@mui/material';
import Image from '../../public/static/images/info.png';
import * as React from 'react';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import { useRouter } from 'next/router';
import { useGetApplicantQuery, useEditApplicantMutation, useGetCohortCoursesQuery } from '../../services/api';
import { GetServerSideProps, NextPageContext } from 'next';
import { SplashScreen } from '../../components/splash-screen';
import { signIn } from 'next-auth/react';


const steps = [
  'Register',
  'Verify Email',
  'Personal Information',
  'Course Information',
  'EndOfApplication',
];

function _renderStepContent(userId: string | string[] | undefined, activeStep: any,
  {
    isStepOptional, handleNext, handleBack,
    handleSkip, editApplicant, setActiveStep
  }:
    {
      isStepOptional: Function, handleNext: Function,
      handleBack: Function, handleSkip: Function,
      editApplicant: Function, setActiveStep: Function
    },
  applicant: any, cohortCourses: any) {
  switch (activeStep) {
    case 0:
      return <RegisterStep
        handlers={{
          activeStep, steps, isStepOptional,
          handleNext, handleBack, handleSkip,
          setActiveStep
        }} />;
    case 1: return <VerifyEmail />
    case 2:
      return <PersonalInformation
        userId={userId}
        handlers={{
          activeStep, steps, isStepOptional, handleNext, handleBack, handleSkip
        }}
        state={{ editApplicant }}
        applicant={applicant} />;
    case 3:
      return <CourseInformation
        userId={userId}
        handlers={{
          activeStep, steps, isStepOptional, handleNext, handleBack, handleSkip
        }}
        state={{}}
        applicant={applicant}
        cohortCourses={cohortCourses}
      />;
    case 4:
      return <EndOfApplication/>;
    default:
      return <div> Not Found </div>;
  }
}


function completeRegistration() {
  const [activeStep, setActiveStep] = useState(0);
  const [skipped, setSkipped] = useState(new Set<number>());
  const [skip, setSkip] = useState(true);
  const [skipCC, setSkipCC] = useState(true);
  const router = useRouter();
  const { userId, cohortId } = router.query
  const [cID, setCID] = useState(undefined)
  const { data, error, isLoading }: { data?: any, error?: any, isLoading: Boolean } = useGetApplicantQuery(userId, { skip })
  const { data: { cohortCourses } = {}, error: cc_error }:
    { data?: any, error?: any } = useGetCohortCoursesQuery(
      { id: cohortId ? cohortId : cID },
      { skip: skipCC }
    )
  if (cID == undefined && data?.message === 'success') {
    setCID(data.user.userCohort[0].cohort.id)
  }


  if (error?.status == 401) {
    signIn('credentials', { callbackUrl: `/register?userId=${userId}` })
  }

  const [editApplicant, result] = useEditApplicantMutation()

  useEffect(() => {
    if (userId) setSkip(false)
  }, [userId])
  // TODO: Simplify logic for setting cohortId. cohortId is only used to fetch 
  //  courses available in the cohort in the course info form.
  useEffect(() => {
    if (skipCC) {
      if (cohortId !== undefined) setSkipCC(false)
      else if (skipCC && data && isLoading == false) {
        setCID(data.user.userCohort[0].cohort.id)
        setSkipCC(false)
      }
    }
  }, [cohortId, data, isLoading, skipCC])

  const isStepOptional = (step: number) => {
    return step === null;
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

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      // You probably want to guard against something like this,
      // it should never occur unless someone's actively trying to break something.
      throw new Error("You can't skip a step that isn't optional.");
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };

  const handleReset = () => {
    setActiveStep(0);
  };
  if (isLoading) return (<SplashScreen />)
  const { user: applicant } = data ? data : { user: undefined }

  return (
    <>
      <Head>
        <title>
          Register
        </title>
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
          }}
        >
          <Typography
            variant="h2"
            color='#fff'
            align="center"
            sx={{
              marginBottom: '50px'
            }}
          >
            Registration Form
          </Typography>          
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Paper elevation={3} sx={{ width: '1300px', m: '50px', p: '20px' }}>
            <Box>
              {activeStep >= steps.length - 1 ? (
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
                          variant="h5"
                          align="center"
                          sx={{
                            marginBottom: '50px',
                            padding: '50px'
                          }}
                        >
                          Dear User, you have successfully completed your application. Click Finish to proceed to your dashboard.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                  <Grid sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                    <Grid sx={{ flex: '1 1 auto' }} />
                    <NextLink
                      href="/dashboard"
                      passHref
                    >
                      <Button variant='contained'>Finish</Button>
                    </NextLink>
                  </Grid>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  {/* <Typography sx={{ mt: 2, mb: 1 }}>Step {activeStep + 1}</Typography> */}
                  {_renderStepContent(
                    userId, activeStep,
                    {
                      isStepOptional, handleNext, handleBack,
                      handleSkip, editApplicant, setActiveStep
                    },
                    applicant, cohortCourses)}
                </React.Fragment>
              )}
            </Box>
          </Paper>
        </Box>
      </main>
    </>
  )
}

completeRegistration.getLayout = (page: any) => (
  <MainLayout>
    {page}
  </MainLayout>
);

export const getServerSideProps: any = async (context: NextPageContext) => {
  const { query } = context;
  return { props: { query } };
}

export default completeRegistration;