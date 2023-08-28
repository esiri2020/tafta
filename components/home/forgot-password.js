import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Box, Button, FormHelperText, TextField } from '@mui/material';
import toast from 'react-hot-toast';
import { signIn } from 'next-auth/react';


const ForgotPassword = () => {
  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: Yup.object({
      email: Yup
        .string()
        .email('Must be a valid email')
        .max(255)
        .required('Email is required'),
    }),
    onSubmit: async ({ email }, { setSubmitting, setStatus, setErrors }) => {
      try {
        // await forgotPassword(email);
        const promise = new Promise(async (resolve, reject) => {
          const res = await signIn('email', {
            redirect: false,
            callbackUrl: '/reset-password',
            email,
          })
          if (res.error == null) resolve(res)
          else reject(res)
        })
        const result = await toast.promise(
          promise,
          {
            loading: 'Processing...',
            success: <b>Password reset email sent!</b>,
            error: err => {
              console.error(err)
              return (<b>Error sending password reset email. Please try again</b>)
            },
          }
        )
        setStatus({ success: true });
      } catch (err) {
        console.error(err);
        setStatus({ success: false });
        setErrors({ submit: err.message });
        setSubmitting(false);
        toast.error(<b>Error sending password reset email.</b>);
      }
    },
  });

  return (
    <Box>
      <form onSubmit={formik.handleSubmit}>
        <TextField
          error={Boolean(formik.touched.email && formik.errors.email)}
          fullWidth
          helperText={formik.touched.email && formik.errors.email}
          label="Email Address"
          margin="normal"
          name="email"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          type="email"
          value={formik.values.email}
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
            Send Password Reset Email
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default ForgotPassword;