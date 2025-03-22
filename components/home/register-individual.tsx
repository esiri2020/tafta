import { useFormik } from 'formik';
import * as Yup from 'yup';
import { 
  Box, Container, Card, CardContent, Grid, TextField, 
  Typography, RadioGroup, FormControlLabel, Radio,
  MenuItem, FormControl, FormLabel, Alert, Button
} from '@mui/material';
import { useState } from 'react';
import { RegistrationHandlers, IndividualRegistrationFields } from '../../types/registration';
import { useCreateApplicantMutation } from '../../services/api';

interface RegisterIndividualProps {
  handlers: RegistrationHandlers;
}

export const RegisterIndividual = ({ handlers }: RegisterIndividualProps) => {
  const [createApplicant] = useCreateApplicantMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const formik = useFormik<IndividualRegistrationFields>({
    initialValues: {
      firstName: '',
      lastName: '',
      middleName: '',
      email: '',
      password: '',
      confirmPassword: '',
      employmentStatus: '',
      salaryExpectation: '',
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required('First name is required'),
      lastName: Yup.string().required('Last name is required'),
      email: Yup.string().email('Must be valid email').required('Email is required'),
      password: Yup.string().min(6).required('Password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Confirm password is required'),
      employmentStatus: Yup.string().required('Employment status is required'),
      salaryExpectation: Yup.string().required('Salary expectation is required'),
    }),
    onSubmit: async (values, helpers) => {
      try {
        setSubmitError(null);
        await createApplicant({
          body: {
            firstName: values.firstName,
            lastName: values.lastName,
            middleName: values.middleName,
            email: values.email,
            password: values.password,
            type: 'individual',
            profile: {
              type: 'individual',
              employmentStatus: values.employmentStatus,
              salaryExpectation: values.salaryExpectation
            }
          }
        }).unwrap();
        handlers.handleNext(values.email);
      } catch (err) {
        console.error(err);
        helpers.setStatus({ success: false });
        setSubmitError(err.message || 'An error occurred during registration');
      }
    },
  });

  const employmentStatuses = [
    { value: 'EMPLOYED', label: 'Employed' },
    { value: 'SELF_EMPLOYED', label: 'Self Employed' },
    { value: 'UNEMPLOYED', label: 'Unemployed' },
    { value: 'STUDENT', label: 'Student' }
  ];

  const educationLevels = [
    { value: 'PRIMARY_SCHOOL', label: 'Primary School' },
    { value: 'SECONDARY_SCHOOL', label: 'Secondary School' },
    { value: 'UNDERGRADUATE', label: 'Undergraduate' },
    { value: 'GRADUATE', label: 'Graduate' },
    { value: 'POSTGRADUATE', label: 'Postgraduate' }
  ];

  const salaryRanges = [
    { value: 'UNDER_50K', label: 'Under ₦50,000' },
    { value: '50K_100K', label: '₦50,000 - ₦100,000' },
    { value: '100K_200K', label: '₦100,000 - ₦200,000' },
    { value: 'ABOVE_200K', label: 'Above ₦200,000' }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Container maxWidth="md">
        <Card>
          <CardContent>
            <Typography variant="h5" align="center" sx={{ mb: 3 }}>
              Individual Registration
            </Typography>
            {submitError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {submitError}
              </Alert>
            )}
            <form onSubmit={formik.handleSubmit}>
              <Grid container spacing={3}>
                {/* Personal Information */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={formik.values.firstName}
                    onChange={formik.handleChange}
                    error={Boolean(formik.touched.firstName && formik.errors.firstName)}
                    helperText={formik.touched.firstName && formik.errors.firstName}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Middle Name"
                    name="middleName"
                    value={formik.values.middleName}
                    onChange={formik.handleChange}
                    error={Boolean(formik.touched.middleName && formik.errors.middleName)}
                    helperText={formik.touched.middleName && formik.errors.middleName}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={formik.values.lastName}
                    onChange={formik.handleChange}
                    error={Boolean(formik.touched.lastName && formik.errors.lastName)}
                    helperText={formik.touched.lastName && formik.errors.lastName}
                  />
                </Grid>

                {/* Account Information */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    error={Boolean(formik.touched.email && formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type="password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    error={Boolean(formik.touched.password && formik.errors.password)}
                    helperText={formik.touched.password && formik.errors.password}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    error={Boolean(formik.touched.confirmPassword && formik.errors.confirmPassword)}
                    helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                  />
                </Grid>

                {/* Employment Information */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Employment Status"
                    name="employmentStatus"
                    value={formik.values.employmentStatus}
                    onChange={formik.handleChange}
                    error={Boolean(formik.touched.employmentStatus && formik.errors.employmentStatus)}
                    helperText={formik.touched.employmentStatus && formik.errors.employmentStatus}
                  >
                    {employmentStatuses.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    select
                    label="Salary Expectation"
                    name="salaryExpectation"
                    value={formik.values.salaryExpectation}
                    onChange={formik.handleChange}
                    error={Boolean(formik.touched.salaryExpectation && formik.errors.salaryExpectation)}
                    helperText={formik.touched.salaryExpectation && formik.errors.salaryExpectation}
                  >
                    {salaryRanges.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* Next Button */}
                <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                  <Button
                    variant="outlined"
                    onClick={handlers.handleBack}
                    sx={{ mr: 1 }}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    type="submit"
                    disabled={formik.isSubmitting}
                  >
                    Next
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}; 