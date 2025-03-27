import { useFormik } from 'formik';
import * as Yup from 'yup';
import { 
  Box, Container, Card, CardContent, Grid, TextField, 
  Typography, Alert, Button
} from '@mui/material';
import { useState } from 'react';
import { RegistrationHandlers, EnterpriseRegistrationFields } from '../../types/registration';
import { useCreateApplicantMutation } from '../../services/api';

interface RegisterEnterpriseProps {
  handlers: RegistrationHandlers;
}

export const RegisterEnterprise = ({ handlers }: RegisterEnterpriseProps) => {
  const [createApplicant] = useCreateApplicantMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [email, setEmail] = useState('');

  const formik = useFormik<EnterpriseRegistrationFields>({
    initialValues: {
      firstName: '',
      lastName: '',
      middleName: '',
      email: '',
      password: '',
      confirmPassword: '',
      businessName: '',
      businessType: 'startup',
      revenueRange: '',
      businessRegType: 'CAC',
      businessSupportNeeds: [],
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required('First name is required'),
      lastName: Yup.string().required('Last name is required'),
      email: Yup.string().email('Must be valid email').required('Email is required'),
      password: Yup.string().min(6).required('Password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Confirm password is required'),
      businessName: Yup.string().required('Business name is required'),
    }),
    onSubmit: async (values, helpers) => {
      try {
        setSubmitError(null);
        const response = await createApplicant({
          body: {
            firstName: values.firstName,
            lastName: values.lastName,
            middleName: values.middleName,
            email: values.email,
            password: values.password,
            type: 'enterprise',
            profile: {
              type: 'enterprise',
              businessName: values.businessName,
            }
          }
        }).unwrap();
        handlers.handleNext(values.email, response.user?.id);
        setEmail(values.email);
      } catch (err) {
        console.error(err);
        helpers.setStatus({ success: false });
        setSubmitError(err.message || 'An error occurred during registration');
      }
    },
  });

  return (
    <Box sx={{ p: 3 }}>
      <Container maxWidth="md">
        <Card>
          <CardContent>
            <Typography variant="h5" align="center" sx={{ mb: 3 }}>
              Enterprise Registration
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
                    label="Last Name"
                    name="lastName"
                    value={formik.values.lastName}
                    onChange={formik.handleChange}
                    error={Boolean(formik.touched.lastName && formik.errors.lastName)}
                    helperText={formik.touched.lastName && formik.errors.lastName}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Middle Name (Optional)"
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

                {/* Business Information */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Business Name"
                    name="businessName"
                    value={formik.values.businessName}
                    onChange={formik.handleChange}
                    error={Boolean(formik.touched.businessName && formik.errors.businessName)}
                    helperText={formik.touched.businessName && formik.errors.businessName}
                  />
                </Grid>

                {/* Next/Back Buttons */}
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