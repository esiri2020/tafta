import { useRouter } from 'next/router';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Typography, Box, Button, FormHelperText, TextField, InputAdornment, IconButton, Link as MuiLink } from '@mui/material';
import toast from 'react-hot-toast';
import { signIn } from 'next-auth/react';
import NextLink from 'next/link';
import { useState } from 'react';
import { Visibility, VisibilityOff } from '@mui/icons-material';

export const LoginScout = ({providers, csrfToken, ...others}) => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
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
      const promise = new Promise(async (resolve, reject) => {
        let req = await signIn('credentials', {
          redirect: false,
          callbackUrl: '/role',
          email,
          password,
        })
        if (req.status === 200) resolve(req)
        else reject(req)
      })
      toast.promise(
        promise,
        {
          loading: 'Logging In...',
          success: <b>Login successful!</b>,
          error: err => {
            console.error(err)
            if (err.status === 401) return (<b>Invalid Credentials.</b>)
            return (<b>Could not login.</b>)
          },
        }
      ).then(res => {
        router.replace('/role')
      }).catch(err => {
        console.error(err);
        helpers.setStatus({ success: false });
        helpers.setErrors({ submit: err.message });
        helpers.setSubmitting(false);
      })
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
                ahref="https://terraacademyforarts.com/"
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
            type={showPassword ? 'text' : 'password'}
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
        <MuiLink
            component={NextLink}
            href="/forgot-password"
            variant="body2"
            underline="hover"
            sx={{ cursor: 'pointer' }}
          >
            <Typography component="span" variant="p">
              Forgot Password?
            </Typography>
          </MuiLink>
        </Box>
    </Box>
  );
};
