import {useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
import {useFormik} from 'formik';
import {
  Container,
  Card,
  CardContent,
  Grid,
  Paper,
  Box,
  Button,
  Checkbox,
  FormHelperText,
  Link,
  TextField,
  Typography,
  InputAdornment,
  IconButton
} from '@mui/material';
import {useCreateApplicantMutation} from '../../services/api';
import {signIn} from 'next-auth/react';
import { Visibility, VisibilityOff } from '@mui/icons-material';

export const RegisterStepNew = ({handlers, ...other}) => {
  const {
    activeStep,
    isStepOptional,
    handleNext,
    handleBack,
    handleSkip,
    setActiveStep,
  } = handlers;
  const [createApplicant, result] = useCreateApplicantMutation();
  const router = useRouter();
  const {cohortId, userId} = router.query;
  const [registrationType, setRegistrationType] = useState('INDIVIDUAL');
  
  // Debug router query
  useEffect(() => {
    console.log('🔍 Router query:', { cohortId, userId, routerQuery: router.query });
  }, [cohortId, userId, router.query]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (userId) setActiveStep(2);
    // Get registration type from previous step
    if (typeof window !== 'undefined') {
      // ✅ USE LOCALSTORAGE instead of sessionStorage
      const savedType = localStorage.getItem('registrationType');
      if (savedType) {
        setRegistrationType(savedType);
      }
    }
  }, []);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      middleName: '',
      lastName: '',
      businessName: '',
      cohortId,
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Must be a valid email')
        .max(100)
        .required('Email is required'),
      password: Yup.string().min(6).max(50).required('Password is required'),
      confirmPassword: Yup.string()
        .test('passwords-match', 'Passwords must match', function (value) {
          return this.parent.password === value;
        })
        .required('Confirm Password is required'),
      firstName: Yup.string().max(255).required('First Name is required'),
      middleName: Yup.string().max(255).required('Middle Name is required'),
      lastName: Yup.string().max(50).required('Last Name is required'),
      businessName: Yup.string()
        .max(255)
        .when('registrationType', {
          is: 'ENTERPRISE',
          then: Yup.string().required('Business Name is required'),
        }),
    }),
    onSubmit: async (values, helpers) => {
      // Prevent multiple submissions
      if (helpers.isSubmitting || formik.isSubmitting) {
        console.log('⏸️ Form submission already in progress, ignoring duplicate click');
        return;
      }

      const {
        email,
        firstName,
        middleName,
        lastName,
        businessName,
        password,
        cohortId,
      } = values;

      const promise = new Promise(async (resolve, reject) => {
        // ✅ USE LOCALSTORAGE instead of sessionStorage - More persistent!
        const selectedCourse = localStorage.getItem('selectedCourse') || '';
        const selectedCohortId = localStorage.getItem('selectedCohortId') || '';
        const selectedCourseName = localStorage.getItem('selectedCourseName') || '';
        const selectedCourseActualId = localStorage.getItem('selectedCourseActualId') || '';

        console.log('🔍 Retrieved course data from localStorage:', {
          selectedCourse,
          selectedCohortId,
          selectedCourseName,
          selectedCourseActualId,
        });

        // ❌ FAIL FAST - Break if course selection is missing!
        if (!selectedCourse || !selectedCourseName || !selectedCourseActualId) {
          const errorMsg = '❌ CRITICAL: Course selection is missing! Please go back to Step 1 and select a course.';
          console.error(errorMsg, {
            selectedCourse,
            selectedCourseName,
            selectedCourseActualId,
            localStorage: {
              selectedCourse: localStorage.getItem('selectedCourse'),
              selectedCohortId: localStorage.getItem('selectedCohortId'),
              selectedCourseName: localStorage.getItem('selectedCourseName'),
              selectedCourseActualId: localStorage.getItem('selectedCourseActualId'),
            }
          });
          
          // Show error to user
          toast.error('Course selection is missing. Please go back and select a course.');
          
          // Reject the promise to stop registration
          reject({
            error: {
              status: 400,
              data: {
                message: errorMsg,
                code: 'MISSING_COURSE_SELECTION'
              }
            }
          });
          return; // Stop execution
        }

        // Try to get cohortId from multiple sources
        const finalCohortId = selectedCohortId || cohortId || router.query.cohortId;
        
        console.log('🔍 Registration form data:', {
          selectedCohortId,
          cohortId,
          routerCohortId: router.query.cohortId,
          finalCohortId,
          firstName,
          lastName,
          email,
          registrationType
        });
        
        // ❌ FAIL FAST - Break if cohortId is missing!
        if (!finalCohortId) {
          const errorMsg = '❌ CRITICAL: Cohort ID is missing! Cannot proceed with registration.';
          console.error(errorMsg);
          toast.error('Cohort information is missing. Please contact support.');
          reject({
            error: {
              status: 400,
              data: {
                message: errorMsg,
                code: 'MISSING_COHORT_ID'
              }
            }
          });
          return; // Stop execution
        }

        const userData = {
          firstName,
          middleName,
          lastName,
          businessName:
            registrationType === 'ENTERPRISE' ? businessName : undefined,
          email,
          password,
          cohortId: finalCohortId,
          registrationType,
          type: registrationType,
          profile: {
            selectedCourse: selectedCourse || '',
            selectedCourseName: selectedCourseName || '',
            selectedCourseId: selectedCourseActualId || '',
            cohortId: finalCohortId || '',
            type: registrationType,
            registrationPath: registrationType,
            businessName:
              registrationType === 'ENTERPRISE' ? businessName : undefined,
          },
        };

        console.log('📤 Sending userData to API:', userData);
        
        let req = await createApplicant({
          body: userData,
        });
        
        console.log('📥 API Response:', req);
        
        if (req.data?.message === 'User created') {
          console.log('✅ User created successfully');
          resolve(req);
        } else {
          console.error('❌ User creation failed:', req);
          reject(req);
        }
      });
      
      // Show initial loading toast
      const loadingToast = toast.loading('Creating your account... Please wait.');
      
      // Ensure formik knows we're submitting (this should already be set by formik, but we're being explicit)
      helpers.setSubmitting(true);

      promise
        .then(async res => {
          toast.loading('Setting up your account...', { id: loadingToast });
          
          helpers.setStatus({success: true});

          // ✅ Store the user ID in localStorage (more persistent than sessionStorage)
          if (res.data && res.data.user && res.data.user.id) {
            localStorage.setItem('userId', res.data.user.id);
          }
          // Store the email in localStorage for later steps
          if (email) {
            localStorage.setItem('email', email);
          }

          toast.loading('Signing you in...', { id: loadingToast });

          let req = await signIn('email', {
            redirect: false,
            callbackUrl: '/verify-email',
            email,
          });
          
          if (req.error === null) {
            toast.success('Registration successful! Redirecting...', { id: loadingToast });
            setTimeout(() => {
              handleNext();
            }, 500);
          } else {
            toast.error('Registration completed, but sign-in failed. Please try logging in.', { id: loadingToast });
            helpers.setSubmitting(false);
          }
        })
        .catch(err => {
          console.error('❌ Registration error:', err);
          console.error('❌ Error details:', {
            message: err?.error?.data?.message,
            status: err?.error?.status,
            data: err?.error?.data,
            error: err
          });
          helpers.setStatus({success: false});
          helpers.setErrors({submit: err.error?.data?.message});
          if (err.error?.status === 422) {
            helpers.setErrors({email: 'User already exists'});
            toast.error('This email is already registered. Please use a different email or try logging in.', { id: loadingToast });
          } else {
            toast.error('Registration failed. Please try again.', { id: loadingToast });
          }
          helpers.setSubmitting(false);
        });
    },
  });

  return (
    <Box
      sx={{
        p: 3,
      }}>
      <Container maxWidth='md'>
        <Card>
          <CardContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              p: { xs: 2, md: 4 },
            }}>
            <Typography
              variant='h5'
              align='center'
              sx={{
                marginBottom: { xs: '20px', md: '30px' },
                fontSize: { xs: '1.5rem', md: '2rem' }
              }}>
              Register for TAFTA Cohort (
              {registrationType === 'ENTERPRISE' ? 'Enterprise' : 'Individual'})
            </Typography>

            <form noValidate onSubmit={formik.handleSubmit} {...other}>
              <Grid container spacing={{ xs: 2, md: 3 }}>
                {registrationType === 'ENTERPRISE' && (
                  <Grid item xs={12}>
                    <TextField
                      error={Boolean(
                        formik.touched.businessName &&
                          formik.errors.businessName,
                      )}
                      fullWidth
                      helperText={
                        formik.touched.businessName &&
                        formik.errors.businessName
                      }
                      label='Business Name'
                      name='businessName'
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      required
                      value={formik.values.businessName}
                    />
                  </Grid>
                )}

                <Grid item md={6} xs={12}>
                  <TextField
                    error={Boolean(
                      formik.touched.firstName && formik.errors.firstName,
                    )}
                    fullWidth
                    helperText={
                      formik.touched.firstName && formik.errors.firstName
                    }
                    label='First Name'
                    name='firstName'
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    required
                    value={formik.values.firstName}
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <TextField
                    error={Boolean(
                      formik.touched.middleName && formik.errors.middleName,
                    )}
                    fullWidth
                    helperText={
                      formik.touched.middleName && formik.errors.middleName
                    }
                    label='Middle Name'
                    name='middleName'
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.middleName}
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <TextField
                    error={Boolean(
                      formik.touched.lastName && formik.errors.lastName,
                    )}
                    fullWidth
                    helperText={
                      formik.touched.lastName && formik.errors.lastName
                    }
                    label='Last Name'
                    name='lastName'
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    required
                    value={formik.values.lastName}
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <TextField
                    error={Boolean(formik.touched.email && formik.errors.email)}
                    fullWidth
                    helperText={formik.touched.email && formik.errors.email}
                    label='Email Address'
                    name='email'
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    required
                    value={formik.values.email}
                    autoComplete='username'
                  />
                </Grid>

                <Grid item md={6} xs={12}>
                  <TextField
                    error={Boolean(
                      formik.touched.password && formik.errors.password,
                    )}
                    fullWidth
                    helperText={
                      formik.touched.password && formik.errors.password
                    }
                    label='Password'
                    name='password'
                    type={showPassword ? 'text' : 'password'}
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    required
                    value={formik.values.password}
                    autoComplete='new-password'
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <Visibility /> : <VisibilityOff />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <TextField
                    error={Boolean(
                      formik.touched.confirmPassword &&
                        formik.errors.confirmPassword,
                    )}
                    fullWidth
                    helperText={
                      formik.touched.confirmPassword &&
                      formik.errors.confirmPassword
                    }
                    label='Confirm Password'
                    name='confirmPassword'
                    type={showConfirmPassword ? 'text' : 'password'}
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    required
                    value={formik.values.confirmPassword}
                    autoComplete='new-password'
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                          >
                            {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
              </Grid>
              <Grid sx={{display: 'flex', flexDirection: 'row', pt: 2}}>
                <Button
                  color='inherit'
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  sx={{mr: 1}}>
                  Back
                </Button>
                <Grid sx={{flex: '1 1 auto'}} />
                {isStepOptional(activeStep) && (
                  <Button color='inherit' onClick={handleSkip} sx={{mr: 1}}>
                    Skip
                  </Button>
                )}
                <Button 
                  variant='contained' 
                  type='submit'
                  disabled={formik.isSubmitting}
                  sx={{ minWidth: '120px' }}
                >
                  {formik.isSubmitting ? 'Creating account...' : 'Continue'}
                </Button>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};
