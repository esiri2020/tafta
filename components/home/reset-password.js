import { useRouter } from 'next/router';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Box, Button, FormHelperText, TextField } from '@mui/material';
import { useResetPasswordMutation } from '../../services/api'
import toast from 'react-hot-toast';


export const ResetPasswordForm = () => {
  const router = useRouter();
  const [resetPassword, result] = useResetPasswordMutation()
  const formik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      password: Yup
        .string()
        .min(8, 'Password must be at least 8 characters long')
        .required('Password is required'),
      confirmPassword: Yup
        .string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Confirm password is required'),
    }),
    onSubmit: async (values, helpers) => {
      // Call API to reset password
      try {
        const {password} = values
        const res = await resetPassword({password});
        console.log(res)
        if(res.data?.message === 'success') {
          toast.success('Password changed.')
          router.push('/role');
        } else {
          toast.error('An error occurred')
        }
      } catch (error) {
        helpers.setStatus({ success: false });
        helpers.setErrors({ submit: error.message });
        helpers.setSubmitting(false);
      }
    },
  });

  return (
    <Box>
      <form onSubmit={formik.handleSubmit}>
        <TextField
          error={Boolean(formik.touched.password && formik.errors.password)}
          fullWidth
          helperText={formik.touched.password && formik.errors.password}
          label="Password"
          margin="normal"
          name="password"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          type="password"
          value={formik.values.password}
        />
        <TextField
          error={Boolean(formik.touched.confirmPassword && formik.errors.confirmPassword)}
          fullWidth
          helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
          label="Confirm Password"
          margin="normal"
          name="confirmPassword"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          type="password"
          value={formik.values.confirmPassword}
        />
        {formik.errors.submit && (
          <Box sx={{ mt: 3 }}>
            <FormHelperText error>
              {formik.errors.submit}
            </FormHelperText>
          </Box>
        )}
        <Box sx={{ mt: 2 }}>
          <Button
            disabled={formik.isSubmitting}
            fullWidth
            size="large"
            type="submit"
            variant="contained"
          >
            Reset Password
          </Button>
        </Box>
      </form>
    </Box>
  );
};
