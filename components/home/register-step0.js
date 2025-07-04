import { useEffect, useState } from 'react'
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Container, Card, CardContent, Grid, Paper, Box, Button, Checkbox, FormHelperText, Link, TextField, Typography, InputAdornment, IconButton } from '@mui/material';
import { useCreateApplicantMutation } from '../../services/api'
import { signIn } from 'next-auth/react';
import { Visibility, VisibilityOff } from '@mui/icons-material';


export const RegisterStep = ({ handlers, ...other }) => {
  const {
    activeStep, isStepOptional, handleNext,
    handleBack, handleSkip, setActiveStep } = handlers
  const [createApplicant, result] = useCreateApplicantMutation()
  const router = useRouter();
  const { cohortId, userId } = router.query
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  if (!userId) {
    if (!cohortId) {
      if (typeof window === "undefined") return null;
      router.replace({ pathname: '/' })
      return null
    }
  }
  useEffect(() => {
    if (userId) setActiveStep(2)
  }, [])
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      cohortId
    },
    validationSchema: Yup.object({
      email: Yup
        .string()
        .email('Must be a valid email')
        .max(100)
        .required('Email is required'),
      password: Yup
        .string()
        .min(6)
        .max(50)
        .required('Password is required'),
      confirmPassword: Yup
        .string()
        .test('passwords-match', 'Passwords must match', function (value) {
          return this.parent.password === value
        })
        .required('Confirm Password is required'),
      firstName: Yup
        .string()
        .max(255)
        .required('First Name is required'),
      lastName: Yup
        .string()
        .max(50)
        .required('Last Name is required'),
    }),
    onSubmit: async (values, helpers) => {
      const { email, firstName, lastName, password, cohortId, submit } = values
      const promise = new Promise(async (resolve, reject) => {
        let req = await createApplicant({ body: { firstName, lastName, email, password, cohortId } })
        if (req.data?.message === "User created") resolve(req)
        else reject(req)
      })
      toast.promise(
        promise,
        {
          loading: 'Loading...',
          success: <b>Success!</b>,
          error: err => {
            console.error(err)
            if (err.error.status === 422) return (<b>User already exists.</b>)
            return (<b>An error occurred.</b>)
          },
        }
      ).then(async res => {
        helpers.setStatus({ success: true });
        helpers.setSubmitting(false);
        let req = await signIn('email', {
          redirect: false,
          callbackUrl: '/verify-email',
          email,
        })
        if (req.error === null) {
          handleNext()
        }
      }).catch(err => {
        console.error(err);
        helpers.setStatus({ success: false });
        helpers.setErrors({ submit: err.error.data.message });
        if (err.error.status === 422) {
          helpers.setErrors({ email: 'User already exists' })
        }
        helpers.setSubmitting(false);
      })
      // try {

      // } catch (err) {
      //   console.error(err);
      //   toast.error('Something went wrong!');
      //   helpers.setStatus({ success: false });
      //   helpers.setErrors({ submit: err.message });
      //   helpers.setSubmitting(false);
      // }
    }
  });

  return (
    <Box
      sx={{
        p: 3
      }}
    >
      <Container maxWidth="md">
        <Card>
          <CardContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              p: 4,
            }}>
            <Typography
              variant="h5"
              align="center"
              sx={{

                marginBottom: '50px'
              }}
            >
              Register for TAFTA Cohort
            </Typography>

            <form
              noValidate
              onSubmit={formik.handleSubmit}
              {...other}>
              <Grid
                container
                spacing={3}>
                <Grid
                  item
                  md={6}
                  xs={12}
                >
                  <TextField
                    error={Boolean(formik.touched.firstName && formik.errors.firstName)}
                    fullWidth
                    helperText={formik.touched.firstName && formik.errors.firstName}
                    label="First Name"
                    name="firstName"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    required
                    value={formik.values.firstName}
                  />

                </Grid>
                <Grid
                  item
                  md={6}
                  xs={12}
                >
                  <TextField
                    error={Boolean(formik.touched.lastName && formik.errors.lastName)}
                    fullWidth
                    helperText={formik.touched.lastName && formik.errors.lastName}
                    label="Last Name"
                    name="lastName"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    required
                    value={formik.values.lastName}
                  />
                </Grid>
                <Grid
                  item
                  md={6}
                  xs={12}
                >
                  <TextField
                    error={Boolean(formik.touched.email && formik.errors.email)}
                    fullWidth
                    helperText={formik.touched.email && formik.errors.email}
                    label="Email Address"
                    name="email"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    required
                    value={formik.values.email}
                  />
                </Grid>

                <Grid
                  item
                  md={6}
                  xs={12}
                >
                  <TextField
                    error={Boolean(formik.touched.password && formik.errors.password)}
                    fullWidth
                    helperText={formik.touched.password && formik.errors.password}
                    label="Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    required
                    value={formik.values.password}
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
                <Grid
                  item
                  md={6}
                  xs={12}
                >
                  <TextField
                    error={Boolean(formik.touched.confirmPassword && formik.errors.confirmPassword)}
                    fullWidth
                    helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                    label="Confirm Password"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    required
                    value={formik.values.confirmPassword}
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
              {/* {Boolean(formik.touched.policy && formik.errors.policy) && (
                <FormHelperText error>
                  {formik.errors.policy}
                </FormHelperText>
              )}
              {formik.errors.submit && (
                <Box sx={{ mt: 3 }}>
                  <FormHelperText error>
                    {formik.errors.submit}
                  </FormHelperText>
                </Box>
              )} */}
              {/* <Box sx={{ mt: 2 }}>
                <Button
                  disabled={formik.isSubmitting}
                  type="submit"
                  sx={{ m: 1 }}
                  variant="contained"
                >
                  Register
                </Button>
              </Box> */}
              <Grid sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                <Button
                  color="inherit"
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  sx={{ mr: 1 }}
                >
                  Back
                </Button>
                <Grid sx={{ flex: '1 1 auto' }} />
                {isStepOptional(activeStep) && (
                  <Button color="inherit" onClick={handleSkip} sx={{ mr: 1 }}>
                    Skip
                  </Button>
                )}
                <Button variant="contained" type="submit">
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

