import { useFormik } from 'formik';
import * as Yup from 'yup';
import { 
  Box, Container, Card, CardContent, Grid, TextField, 
  Typography, RadioGroup, FormControlLabel, Radio,
  MenuItem, Checkbox, FormGroup, FormControl, FormLabel,
  Alert, Button
} from '@mui/material';
import { useState } from 'react';
import { RegistrationHandlers, EnterpriseRegistrationFields, BusinessType } from '../../types/registration';
import { useCreateApplicantMutation } from '../../services/api';

interface RegisterEnterpriseProps {
  handlers: RegistrationHandlers;
}

export const RegisterEnterprise = ({ handlers }: RegisterEnterpriseProps) => {
  const [createApplicant] = useCreateApplicantMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);

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
      registrationType: 'CAC',
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
      businessType: Yup.string().oneOf(['startup', 'existing']).required('Business type is required'),
      revenueRange: Yup.string().required('Revenue range is required'),
      registrationType: Yup.string().oneOf(['CAC', 'SMEDAN']).required('Registration type is required'),
      businessSupportNeeds: Yup.array().of(Yup.string()),
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
            type: 'enterprise',
            profile: {
              type: 'enterprise',
              businessName: values.businessName,
              businessType: values.businessType.toUpperCase() as 'STARTUP' | 'EXISTING',
              revenueRange: values.revenueRange,
              registrationType: values.registrationType,
              businessSupportNeeds: values.businessSupportNeeds,
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

  const revenueRanges = [
    { value: 'UNDER_1M', label: 'Under ₦1 Million' },
    { value: '1M_5M', label: '₦1 Million - ₦5 Million' },
    { value: '5M_10M', label: '₦5 Million - ₦10 Million' },
    { value: 'ABOVE_10M', label: 'Above ₦10 Million' }
  ];

  const supportNeeds = [
    { value: 'business_planning', label: 'Business Planning' },
    { value: 'marketing', label: 'Marketing Support' },
    { value: 'financial_management', label: 'Financial Management' },
    { value: 'mentorship', label: 'Mentorship' },
  ];

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
                <Grid item xs={12}>
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
                <Grid item xs={12}>
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

                <Grid item xs={12} md={6}>
                  <FormControl component="fieldset">
                    <FormLabel>Business Type</FormLabel>
                    <RadioGroup
                      name="businessType"
                      value={formik.values.businessType}
                      onChange={formik.handleChange}
                    >
                      <FormControlLabel value="startup" control={<Radio />} label="Startup" />
                      <FormControlLabel value="existing" control={<Radio />} label="Existing Business" />
                    </RadioGroup>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Revenue Range"
                    name="revenueRange"
                    value={formik.values.revenueRange}
                    onChange={formik.handleChange}
                    error={Boolean(formik.touched.revenueRange && formik.errors.revenueRange)}
                    helperText={formik.touched.revenueRange && formik.errors.revenueRange}
                  >
                    {revenueRanges.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl component="fieldset">
                    <FormLabel>Registration Type</FormLabel>
                    <RadioGroup
                      name="registrationType"
                      value={formik.values.registrationType}
                      onChange={formik.handleChange}
                    >
                      <FormControlLabel value="CAC" control={<Radio />} label="CAC" />
                      <FormControlLabel value="SMEDAN" control={<Radio />} label="SMEDAN" />
                    </RadioGroup>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormControl component="fieldset">
                    <FormLabel>Business Support Needs</FormLabel>
                    <FormGroup>
                      {supportNeeds.map((need) => (
                        <FormControlLabel
                          key={need.value}
                          control={
                            <Checkbox
                              checked={formik.values.businessSupportNeeds.includes(need.value)}
                              onChange={(e) => {
                                const newNeeds = e.target.checked
                                  ? [...formik.values.businessSupportNeeds, need.value]
                                  : formik.values.businessSupportNeeds.filter(n => n !== need.value);
                                formik.setFieldValue('businessSupportNeeds', newNeeds);
                              }}
                            />
                          }
                          label={need.label}
                        />
                      ))}
                    </FormGroup>
                  </FormControl>
                </Grid>
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
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}; 