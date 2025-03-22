import { useRouter } from 'next/router';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Typography, Box, Button, FormHelperText, TextField } from '@mui/material';
import toast from 'react-hot-toast';
import { signIn } from 'next-auth/react';
import NextLink from 'next/link';

export const LoginScout = ({providers, csrfToken, ...others}) => {
  const router = useRouter();
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      csrfToken: csrfToken,
      submit: null
    },
    validationSchema: Yup.object({
      email: Yup
        .string()
        .email('Must be a valid email')
        .max(255)
        .required('Email is required')
    }),
    onSubmit: async ({email, password, csrfToken}, helpers) => {
      try {
        const result = await signIn('credentials', {
          redirect: false,
          callbackUrl: '/role',
          email,
          password,
          csrfToken
        });
        
        if (result.error) {
          console.error('Login error:', result);
          toast.error('Login failed: Invalid email or password');
          helpers.setStatus({ success: false });
          helpers.setErrors({ submit: 'Invalid email or password' });
          helpers.setSubmitting(false);
        } else {
          toast.success('Login successful!');
          router.replace('/role');
        }
      } catch (error) {
        console.error('Login exception:', error);
        toast.error('Login failed: An unexpected error occurred');
        helpers.setStatus({ success: false });
        helpers.setErrors({ submit: 'An unexpected error occurred' });
        helpers.setSubmitting(false);
      }
    }
  });

  return (
   <Box
   sx={{

   }}>
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                my: '5',
                p: '20px',
                '& img': {
                    width: '100%'
                }
                }}
        >
            <img
                alt="tafta logo"
                ahref="/"
                style={{margin:"20px 0px"}}
                src="/static/images/logo.svg"
            />
            <div></div>
        </Box>

        <form
        noValidate
        onSubmit={formik.handleSubmit}
        {...others}>
        <TextField
            autoFocus
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
            Log In
            </Button>
        </Box>
        </form>
        <Box         
        sx={{
          mt:5
        }}>
        <NextLink
            href="/forgot-password"
            passHref
          >
            <Typography
              component="a"
              variant="p"
            >
              Forgot Password?
            </Typography>
          </NextLink>
        </Box>
    </Box>
  );
};
