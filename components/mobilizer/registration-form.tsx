import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  FormControlLabel,
  RadioGroup,
  Radio,
} from '@mui/material';
import { useRegisterMobilizerMutation } from '@/services/api';

const validationSchema = Yup.object({
  code: Yup.string()
    .required('Mobilizer code is required')
    .min(3, 'Code must be at least 3 characters')
    .max(20, 'Code must be no more than 20 characters')
    .matches(/^[A-Za-z0-9]+$/, 'Code can only contain letters and numbers'),
  fullName: Yup.string().required('Full name is required').min(2, 'Name must be at least 2 characters'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  phoneNumber: Yup.string().matches(/^[0-9+\-\s()]*$/, 'Invalid phone number format'),
  organization: Yup.string(),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

export const MobilizerRegistrationForm: React.FC = () => {
  const [registerMobilizer, { isLoading, error, isSuccess }] = useRegisterMobilizerMutation();
  const [showSuccess, setShowSuccess] = useState(false);
  const [codeType, setCodeType] = useState<'existing' | 'custom'>('existing');
  const [availableCodes, setAvailableCodes] = useState<string[]>([]);
  const [loadingCodes, setLoadingCodes] = useState(true);

  // Fetch available mobilizer codes
  const fetchCodes = async () => {
    let retries = 3;
    while (retries > 0) {
      try {
        const response = await fetch('/api/mobilizer-codes');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.codes) {
          setAvailableCodes(data.codes);
          break; // Success, exit retry loop
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error(`Error fetching mobilizer codes (attempt ${4 - retries}):`, error);
        retries--;
        if (retries === 0) {
          console.error('Failed to fetch mobilizer codes after 3 attempts');
          setAvailableCodes([]); // Set empty array as fallback
        } else {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    setLoadingCodes(false);
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  const formik = useFormik({
    initialValues: {
      code: '',
      fullName: '',
      email: '',
      phoneNumber: '',
      organization: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const { confirmPassword, ...submitData } = values;
        await registerMobilizer(submitData).unwrap();
        setShowSuccess(true);
        formik.resetForm();
        // Refetch available codes after successful registration
        setLoadingCodes(true);
        await fetchCodes();
      } catch (err) {
        console.error('Registration failed:', err);
      }
    },
  });

  if (showSuccess) {
    return (
      <Card sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Alert severity="success" sx={{ mb: 2 }}>
            Registration successful! You can now log in with your email and password.
          </Alert>
          <Button
            variant="contained"
            onClick={() => setShowSuccess(false)}
            sx={{ mt: 2 }}
          >
            Register Another Mobilizer
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <CardHeader
        title="Mobilizer Registration"
        subheader="Register as a new mobilizer to start referring students"
        sx={{ textAlign: 'center' }}
      />
      <CardContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {(error as any)?.data?.message || 'Registration failed. Please try again.'}
          </Alert>
        )}

        <form onSubmit={formik.handleSubmit}>
          <Box sx={{ display: 'grid', gap: 3 }}>
            <FormControl component="fieldset">
              <Typography variant="subtitle2" gutterBottom>
                Mobilizer Code Type *
              </Typography>
              <RadioGroup
                value={codeType}
                onChange={(e) => {
                  setCodeType(e.target.value as 'existing' | 'custom');
                  formik.setFieldValue('code', ''); // Reset code when switching types
                }}
                row
              >
                <FormControlLabel
                  value="existing"
                  control={<Radio />}
                  label="Select from existing codes"
                />
                <FormControlLabel
                  value="custom"
                  control={<Radio />}
                  label="Enter custom code"
                />
              </RadioGroup>
            </FormControl>

            {codeType === 'existing' ? (
              <FormControl fullWidth error={formik.touched.code && Boolean(formik.errors.code)}>
                <InputLabel>Mobilizer Code *</InputLabel>
                <Select
                  name="code"
                  value={formik.values.code}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Mobilizer Code *"
                  disabled={loadingCodes}
                >
                  {loadingCodes ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Loading codes...
                    </MenuItem>
                  ) : availableCodes.length === 0 ? (
                    <MenuItem disabled>No available codes</MenuItem>
                  ) : (
                    availableCodes.map((code) => (
                      <MenuItem key={code} value={code}>
                        {code}
                      </MenuItem>
                    ))
                  )}
                </Select>
                {formik.touched.code && formik.errors.code && (
                  <FormHelperText>{formik.errors.code}</FormHelperText>
                )}
              </FormControl>
            ) : (
              <TextField
                fullWidth
                name="code"
                label="Custom Mobilizer Code *"
                value={formik.values.code}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.code && Boolean(formik.errors.code)}
                helperText={formik.touched.code && formik.errors.code ? formik.errors.code : "Enter a unique mobilizer code (3-20 characters, letters and numbers only)"}
                placeholder="e.g., MYCODE123"
              />
            )}

            <TextField
              fullWidth
              name="fullName"
              label="Full Name *"
              value={formik.values.fullName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.fullName && Boolean(formik.errors.fullName)}
              helperText={formik.touched.fullName && formik.errors.fullName}
            />

            <TextField
              fullWidth
              name="email"
              label="Email Address *"
              type="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />

            <TextField
              fullWidth
              name="phoneNumber"
              label="Phone Number"
              value={formik.values.phoneNumber}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)}
              helperText={formik.touched.phoneNumber && formik.errors.phoneNumber}
            />

            <TextField
              fullWidth
              name="organization"
              label="Organization"
              value={formik.values.organization}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.organization && Boolean(formik.errors.organization)}
              helperText={formik.touched.organization && formik.errors.organization}
            />

            <TextField
              fullWidth
              name="password"
              label="Password *"
              type="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
            />

            <TextField
              fullWidth
              name="confirmPassword"
              label="Confirm Password *"
              type="password"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
              helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{ mt: 2 }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Register as Mobilizer'
              )}
            </Button>
          </Box>
        </form>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
          Already have an account?{' '}
          <Button variant="text" href="/login" sx={{ p: 0, minWidth: 'auto' }}>
            Sign in here
          </Button>
        </Typography>
      </CardContent>
    </Card>
  );
};

