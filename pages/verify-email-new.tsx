import {useEffect, useRef} from 'react';
import {MainLayout} from '../components/main-layout';
import Head from 'next/head';
import {Box, Grid, Container, Typography} from '@mui/material';
import {useSession} from 'next-auth/react';
import {useEditApplicantMutation, useCreateEnrollmentMutation} from '../services/api';
import toast from 'react-hot-toast';
import {useRouter} from 'next/router';

export default function VerifyEmailNew() {
  const {data: session} = useSession();
  const router = useRouter();
  const [editApplicant, result] = useEditApplicantMutation();
  const [createEnrollment] = useCreateEnrollmentMutation();
  const verificationProcessed = useRef(false);
  useEffect(() => {
    if ((session as any)?.userData?.userId && !verificationProcessed.current) {
      // Check if we've already processed this verification to prevent multiple tabs
      const verificationKey = `verified_${(session as any)?.userData?.userId}`;
      if (sessionStorage.getItem(verificationKey)) {
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
          // Mark verification as processed to prevent multiple tabs
          sessionStorage.setItem(verificationKey, 'true');
          
          console.log('🔍 Full editApplicant response:', res);
          console.log('🔍 Applicant data:', (res as any)?.data?.applicant);
          console.log('🔍 UserCohort data:', (res as any)?.data?.applicant?.userCohort);
          console.log('🔍 Enrollments data:', (res as any)?.data?.applicant?.userCohort?.[0]?.enrollments);
          
          // Create enrollment after email verification
          try {
            // Get course information from user profile instead of sessionStorage
            const userProfile = (res as any)?.data?.applicant?.profile;
            const selectedCourse = userProfile?.selectedCourse || '';
            const selectedCohortId = userProfile?.cohortId || '';
            const selectedCourseName = userProfile?.selectedCourseName || '';
            const selectedCourseActualId = userProfile?.selectedCourseId || '';
            
            console.log('🔍 User profile data for enrollment:', {
              selectedCourse,
              selectedCohortId,
              selectedCourseName,
              selectedCourseActualId,
              userProfile,
              fullResponse: (res as any)?.data
            });
            
            // Get existing enrollment from user data
            const existingEnrollment = (res as any)?.data?.applicant?.userCohort?.[0]?.enrollments?.[0];
            
            if (existingEnrollment) {
              console.log('🎯 Activating existing enrollment after email verification:', {
                enrollmentUid: existingEnrollment.uid,
                course_id: existingEnrollment.course_id,
                course_name: existingEnrollment.course_name,
                user_email: (session as any)?.userData?.email,
              });
              
              // Use the enrollment retry API to activate the existing enrollment
              const enrollmentResult = await fetch('/api/enrollments/retry', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  uid: existingEnrollment.uid,
                  user_email: (session as any)?.userData?.email,
                }),
              });
              
              if (enrollmentResult.ok) {
                console.log('✅ Enrollment activated successfully after email verification');
              } else {
                console.error('❌ Failed to activate enrollment:', await enrollmentResult.text());
              }
            } else {
              console.log('⚠️ No existing enrollment found, creating new enrollment');
              
              // Fallback: create new enrollment if none exists
              const courseData = {
                selectedCourse: userProfile?.selectedCourse || sessionStorage.getItem('selectedCourse') || '',
                selectedCohortId: userProfile?.cohortId || sessionStorage.getItem('selectedCohortId') || '',
                selectedCourseName: userProfile?.selectedCourseName || sessionStorage.getItem('selectedCourseName') || '',
                selectedCourseActualId: userProfile?.selectedCourseId || sessionStorage.getItem('selectedCourseActualId') || '',
              };
              
              if (courseData.selectedCourse && courseData.selectedCohortId && courseData.selectedCourseActualId && courseData.selectedCourseName) {
                console.log('🔄 Creating new enrollment as fallback:', {
                  userCohortId: courseData.selectedCohortId,
                  course_id: Number.parseInt(courseData.selectedCourseActualId),
                  course_name: courseData.selectedCourseName,
                  user_email: (session as any)?.userData?.email,
                });
                
                const fallbackEnrollmentResult = await createEnrollment({
                  body: {
                    userCohortId: courseData.selectedCohortId,
                    course_id: Number.parseInt(courseData.selectedCourseActualId),
                    course_name: courseData.selectedCourseName,
                    user_email: (session as any)?.userData?.email,
                  },
                });
                
                console.log('✅ Fallback enrollment created successfully:', fallbackEnrollmentResult);
              } else {
                console.log('❌ No course data available for enrollment');
              }
            }
          } catch (enrollErr) {
            console.error('❌ Error creating enrollment after email verification:', enrollErr);
          }
          
          // Redirect current tab to personal information form first
          router.replace({
            pathname: '/register-new',
            query: { step: 3 },
          });
          
          // Open TAFTA portal sign-in in new tab after redirect
          setTimeout(() => {
            const lmsUrl = 'https://portal.terraacademyforarts.com/users/sign_in';
            window.open(lmsUrl, '_blank');
          }, 100);
        })
        .catch(err => {
          console.error(err);
        });
    }
  }, [session]);

  return (
    <>
      <Head>
        <title>Verify Email - TAFTA</title>
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
            <Box
              sx={{
                p: 3,
                textAlign: 'center',
              }}>
              <Typography variant='h4' sx={{mb: 2}}>
                Email Verification
              </Typography>
              <Typography variant='body1' sx={{mb: 2}}>
                Thanks for confirming your email! You can now continue with your
                registration.
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                After verification, you'll be redirected to complete your personal information, and a new tab will open for you to access your learning platform.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

VerifyEmailNew.getLayout = (page: any) => <MainLayout>{page}</MainLayout>;
