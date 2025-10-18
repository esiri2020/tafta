import {useEffect, useRef} from 'react';
import {MainLayout} from '../components/main-layout';
import Head from 'next/head';
import {Box, Grid, Container, Typography} from '@mui/material';
import {useSession} from 'next-auth/react';
import {useEditApplicantMutation, useCreateEnrollmentMutation} from '../services/api';
import toast from 'react-hot-toast';
import {useRouter} from 'next/router';

export default function VerifyEmail() {
  const {data: session} = useSession();
  const router = useRouter();
  const {courseId, cohortId, courseName, actualCourseId} = router.query;
  const [editApplicant, result] = useEditApplicantMutation();
  const [createEnrollment] = useCreateEnrollmentMutation();
  const verificationProcessed = useRef(false);

  useEffect(() => {
    // ✅ Store course information from URL parameters in localStorage (more persistent)
    if (typeof window !== 'undefined') {
      if (courseId)
        localStorage.setItem('selectedCourse', courseId as string);
      if (cohortId)
        localStorage.setItem('selectedCohortId', cohortId as string);
      if (courseName)
        localStorage.setItem('selectedCourseName', courseName as string);
      if (actualCourseId)
        localStorage.setItem(
          'selectedCourseActualId',
          actualCourseId as string,
        );

      console.log('✅ Stored course parameters in localStorage:', {
        courseId,
        cohortId,
        courseName,
        actualCourseId,
      });
    }
  }, [courseId, cohortId, courseName, actualCourseId]);

  useEffect(() => {
    if ((session as any)?.userData?.userId && !verificationProcessed.current) {
      // Check if we've already processed this verification to prevent multiple tabs
      const verificationKey = `verified_${(session as any)?.userData?.userId}`;
      // ✅ USE LOCALSTORAGE to persist across tabs
      if (localStorage.getItem(verificationKey)) {
        console.log('✅ Email verification already processed, skipping...');
        return;
      }
      
      // Mark as processing to prevent duplicate execution
      verificationProcessed.current = true;

      const promise = new Promise(async (resolve, reject) => {
        let req: any = await editApplicant({
          id: (session as any)?.userData?.userId,
          body: {emailVerified: new Date()},
        });
        if (req?.data?.message === 'Applicant Updated') resolve(req);
        else reject(req);
      });
      toast
        .promise(promise, {
          loading: 'Loading...',
          success: <b>Email Verified!</b>,
          error: err => {
            console.error(err);
            if (err.error?.status === 401)
              return <b>Please login with your registered credentials.</b>;
            return <b>An error occurred.</b>;
          },
        })
        .then(async (res) => {
          // ✅ Mark verification as processed to prevent multiple tabs
          localStorage.setItem(verificationKey, 'true');
          
          console.log('🔍 Full editApplicant response:', res);
          console.log('🔍 Applicant data:', (res as any)?.data?.applicant);
          console.log('🔍 UserCohort data:', (res as any)?.data?.applicant?.userCohort);
          console.log('🔍 Enrollments data:', (res as any)?.data?.applicant?.userCohort?.[0]?.enrollments);
          
          // Enrollment will be activated after completing registration Step 3
          console.log('✅ Email verified successfully. Enrollment will be activated after completing registration.');
          
          // Redirect to personal information form to complete registration
          router.replace({
            pathname: '/register-new',
            query: { step: 3 },
          });
        })
        .catch(err => {
          console.error(err);
        });
    }
  }, [session]);

  return (
    <>
      <Head>
        <title>Verify Email</title>
      </Head>
      <Box
        sx={{
          justifyContent: 'center',
          display: 'flex',
          alignItems: 'center',
        }}>
        <Grid
          container
          justifyContent='center'
          maxWidth='lg'
          sx={{
            justifyContent: 'center',
            display: 'flex',
            alignItems: 'center',
          }}>
          <Grid
            item
            md={6}
            sm={8}
            xs={12}
            sx={{
              width: '100%',
              height: '100vh',
              objectFit: 'cover',
              display: {xs: 'block', sm: 'none', md: 'block'},
            }}>
            <img
              alt='header image'
              style={{width: '100%', height: '100vh'}}
              src='/static/images/tafta-login.png'
            />
          </Grid>
          <Grid
            item
            md={6}
            sm={8}
            xs={12}
            sx={{
              justifyContent: 'center',
              display: 'flex',
              padding: 5,
            }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant='h4' sx={{ mb: 2 }}>
                Email Verification
              </Typography>
              <Typography variant='body1' sx={{ mb: 3 }}>
                Please check your email and click the verification link to continue with your registration.
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                After verification, you'll be redirected to complete your personal information. Your enrollment will be activated when you complete the registration process.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

VerifyEmail.getLayout = (page: any) => <MainLayout>{page}</MainLayout>;
