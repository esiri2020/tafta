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
} from '@mui/material';
import {useCreateApplicantMutation} from '../../services/api';
import {signIn} from 'next-auth/react';

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
  const [registrationType, setRegistrationType] = useState('individual');

  useEffect(() => {
    if (userId) setActiveStep(2);
    // Get registration type from previous step
    if (typeof window !== 'undefined') {
      const savedType = sessionStorage.getItem('registrationType');
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
          is: 'business',
          then: Yup.string().required('Business Name is required'),
        }),
    }),
    onSubmit: async (values, helpers) => {
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
        let req = await createApplicant({
          body: {
            firstName,
            middleName,
            lastName,
            businessName:
              registrationType === 'business' ? businessName : undefined,
            email,
            password,
            cohortId,
            registrationType,
            type: registrationType,
            selectedCourse: sessionStorage.getItem('selectedCourse') || '',
          },
        });
        if (req.data?.message === 'User created') resolve(req);
        else reject(req);
      });
      toast
        .promise(promise, {
          loading: 'Loading...',
          success: <b>Success!</b>,
          error: err => {
            console.error(err);
            if (err.error.status === 422) return <b>User already exists.</b>;
            return <b>An error occurred.</b>;
          },
        })
        .then(async res => {
          helpers.setStatus({success: true});
          helpers.setSubmitting(false);

          // Store the user ID in sessionStorage
          if (res.data && res.data.user && res.data.user.id) {
            sessionStorage.setItem('userId', res.data.user.id);
          }

          let req = await signIn('email', {
            redirect: false,
            callbackUrl: '/verify-email',
            email,
          });
          if (req.error === null) {
            handleNext();
          }
        })
        .catch(err => {
          console.error(err);
          helpers.setStatus({success: false});
          helpers.setErrors({submit: err.error?.data?.message});
          if (err.error?.status === 422) {
            helpers.setErrors({email: 'User already exists'});
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
              p: 4,
            }}>
            <Typography
              variant='h5'
              align='center'
              sx={{
                marginBottom: '30px',
              }}>
              Register for TAFTA Cohort (
              {registrationType === 'business' ? 'Business' : 'Individual'})
            </Typography>

            <form noValidate onSubmit={formik.handleSubmit} {...other}>
              <Grid container spacing={3}>
                {registrationType === 'business' && (
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
                    type='password'
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    required
                    value={formik.values.password}
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
                    type='password'
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    required
                    value={formik.values.confirmPassword}
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
                <Button variant='contained' type='submit'>
                  Continue
                </Button>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};
