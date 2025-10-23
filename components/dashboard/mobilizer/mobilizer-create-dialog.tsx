import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  RadioGroup,
  Radio,
  Typography,
} from '@mui/material';
import { useCreateMobilizerMutation } from '@/services/api';

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
});

interface MobilizerCreateDialogProps {
  open: boolean;
  onClose: () => void;
}

export const MobilizerCreateDialog: React.FC<MobilizerCreateDialogProps> = ({
  open,
  onClose,
}) => {
  const [createMobilizer, { isLoading, error }] = useCreateMobilizerMutation();
  const [codeType, setCodeType] = useState<'existing' | 'custom'>('existing');
  const [availableCodes, setAvailableCodes] = useState<string[]>([]);
  const [loadingCodes, setLoadingCodes] = useState(true);

  // Fetch available mobilizer codes
  const fetchCodes = async () => {
    let retries = 3;
    while (retries > 0) {
      try {
        const response = await fetch('/api/mobilizers/all-codes');
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
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await createMobilizer(values).unwrap();
        toast.success('Mobilizer created successfully!');
        formik.resetForm();
        setCodeType('existing');
        // Refetch available codes after successful creation
        setLoadingCodes(true);
        await fetchCodes();
        onClose();
      } catch (err) {
        console.error('Creation failed:', err);
        toast.error('Failed to create mobilizer. Please try again.');
      }
    },
  });

  const handleClose = () => {
    formik.resetForm();
    setCodeType('existing');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Mobilizer</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {(error as any)?.data?.message || 'Failed to create mobilizer. Please try again.'}
          </Alert>
        )}

        <Box sx={{ display: 'grid', gap: 3, pt: 1 }}>
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
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={() => formik.handleSubmit()}
          variant="contained"
          disabled={isLoading}
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Create Mobilizer'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
