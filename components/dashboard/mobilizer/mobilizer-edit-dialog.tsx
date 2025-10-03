import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
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
} from '@mui/material';
import { useUpdateMobilizerMutation } from '@/services/api';

const validationSchema = Yup.object({
  fullName: Yup.string().required('Full name is required').min(2, 'Name must be at least 2 characters'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  phoneNumber: Yup.string().matches(/^[0-9+\-\s()]*$/, 'Invalid phone number format'),
  organization: Yup.string(),
  status: Yup.string().oneOf(['ACTIVE', 'INACTIVE', 'SUSPENDED']).required('Status is required'),
});

interface MobilizerEditDialogProps {
  open: boolean;
  onClose: () => void;
  mobilizer: any;
}

export const MobilizerEditDialog: React.FC<MobilizerEditDialogProps> = ({
  open,
  onClose,
  mobilizer,
}) => {
  const [updateMobilizer, { isLoading, error }] = useUpdateMobilizerMutation();

  const formik = useFormik({
    initialValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
      organization: '',
      status: 'ACTIVE',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await updateMobilizer({
          id: mobilizer?.id,
          data: values,
        }).unwrap();
        onClose();
      } catch (err) {
        console.error('Update failed:', err);
      }
    },
  });

  useEffect(() => {
    if (mobilizer) {
      formik.setValues({
        fullName: mobilizer.fullName || '',
        email: mobilizer.email || '',
        phoneNumber: mobilizer.phoneNumber || '',
        organization: mobilizer.organization || '',
        status: mobilizer.status || 'ACTIVE',
      });
    }
  }, [mobilizer]);

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Mobilizer</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {(error as any)?.data?.message || 'Failed to update mobilizer. Please try again.'}
          </Alert>
        )}

        <Box sx={{ display: 'grid', gap: 3, pt: 1 }}>
          <TextField
            fullWidth
            name="code"
            label="Mobilizer Code"
            value={mobilizer?.code || ''}
            disabled
            helperText="Mobilizer code cannot be changed"
          />

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

          <FormControl fullWidth error={formik.touched.status && Boolean(formik.errors.status)}>
            <InputLabel>Status *</InputLabel>
            <Select
              name="status"
              value={formik.values.status}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              label="Status *"
            >
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="INACTIVE">Inactive</MenuItem>
              <MenuItem value="SUSPENDED">Suspended</MenuItem>
            </Select>
          </FormControl>
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
            'Update Mobilizer'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
