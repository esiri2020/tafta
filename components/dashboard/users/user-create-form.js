import NextLink from 'next/link';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  TextField,
  MenuItem
} from '@mui/material';
import { useCreateUserMutation } from '../../../services/api'

const genderList = ['MALE', 'FEMALE']
const ranges = [[1,5],[6,10],[11,15],[16,20],[21,25],[26,30],[31,35],[36,40],[41,45],[46,50],[51,55],[56,60],[61,65]]
const roles = ['SUPERADMIN', 'ADMIN', 'SUPPORT', 'APPLICANT']

export const UserCreateForm = ({  ...other }) => {
  const [ createUser, result ] = useCreateUserMutation()
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      homeAddress: '',
      stateOfOrigin:  '',
      email: '',
      role: 'ADMIN',
      password: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      stateOfResidence: '',
      gender: 'MALE',
      ageRange: '',
      submit: null
    },
    validationSchema: Yup.object({
      homeAddress: Yup.string(),
      stateOfOrigin: Yup.string().max(255),
      role: Yup.string().max(10).required('User role is required'),
      country: Yup.string().max(255),
      email: Yup
        .string()
        .email('Must be a valid email')
        .max(255)
        .required('Email is required'),
      password: Yup
        .string()
        .min(6)
        .max(255)
        .required('Password is required'),
      firstName: Yup
        .string()
        .max(255)
        .required('First Name is required'),
      lastName: Yup
        .string()
        .max(255)
        .required('Last Name is required'),
      phoneNumber: Yup.string().max(15),
      stateOfResidence: Yup.string().max(255),
      gender: Yup.string().max(6)
    }),
    onSubmit: async (values, helpers) => {
      try {
        const {email, firstName, lastName, password, role, submit, ...profile} = values
        // NOTE: Make API request
        await createUser({ body: {firstName, lastName, email, password, role, profile}}).unwrap()
        helpers.setStatus({ success: true });
        helpers.setSubmitting(false);
        toast.success('User Created!');
        router.replace({pathname: '/admin-dashboard/users/',})
      } catch (err) {
        console.error(err);
        toast.error('Something went wrong!');
        helpers.setStatus({ success: false });
        helpers.setErrors({ submit: err.message });
        helpers.setSubmitting(false);
      }
    }
  });

  return (
    <form
      onSubmit={formik.handleSubmit}
      {...other}>
      <Card>
        <CardHeader title="Create User" />
        <Divider />
        <CardContent>
          <Grid
            container
            spacing={3}
          >
            <Grid
              item
              md={6}
              xs={12}
            >
              <TextField
                error={Boolean(formik.touched.firstName && formik.errors.firstName)}
                fullWidth
                helperText={formik.touched.firstName && formik.errors.firstName}
                label="First Name"
                name="firstName"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                required
                value={formik.values.firstName}
              />
            </Grid>
            <Grid
              item
              md={6}
              xs={12}
            >
              <TextField
                error={Boolean(formik.touched.lastName && formik.errors.lastName)}
                fullWidth
                helperText={formik.touched.lastName && formik.errors.lastName}
                label="Last Name"
                name="lastName"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                required
                value={formik.values.lastName}
              />
            </Grid>
            <Grid
              item
              md={6}
              xs={12}
            >
              <TextField
                error={Boolean(formik.touched.email && formik.errors.email)}
                fullWidth
                helperText={formik.touched.email && formik.errors.email}
                label="Email Address"
                name="email"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                required
                value={formik.values.email}
              />
            </Grid>
            <Grid
              item
              md={6}
              xs={12}
            >
              <TextField
                error={Boolean(formik.touched.password && formik.errors.password)}
                fullWidth
                helperText={formik.touched.password && formik.errors.password}
                label="Password"
                name="password"
                type="password"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                required
                value={formik.values.password}
              />
            </Grid>
            <Grid
              item
              md={6}
              xs={12}
            >
              <TextField
                error={Boolean(formik.touched.role && formik.errors.role)}
                fullWidth
                helperText={formik.touched.role && formik.errors.role}
                label="Role"
                name="role"
                select
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.role}
              >
                {
                  roles.map((role, index) => (
                    <MenuItem key={index} value={role}>
                      {role}
                    </MenuItem>
                  ))
                }
              </TextField>
            </Grid>
            <Grid
              item
              md={6}
              xs={12}
            >
              <TextField
                error={Boolean(formik.touched.phoneNumber && formik.errors.phoneNumber)}
                fullWidth
                helperText={formik.touched.phoneNumber && formik.errors.phoneNumber}
                label="Phone number"
                name="phoneNumber"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.phoneNumber}
              />
            </Grid>
            <Grid
              item
              md={6}
              xs={12}
            >
              <TextField
                error={Boolean(formik.touched.stateOfOrigin && formik.errors.stateOfOrigin)}
                fullWidth
                helperText={formik.touched.stateOfOrigin && formik.errors.stateOfOrigin}
                label="State of Origin"
                name="stateOfOrigin"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.stateOfOrigin}
              />
            </Grid>
            <Grid
              item
              md={6}
              xs={12}
            >
              <TextField
                error={Boolean(formik.touched.stateOfResidence && formik.errors.stateOfResidence)}
                fullWidth
                helperText={formik.touched.stateOfResidence && formik.errors.stateOfResidence}
                label="State of Residence"
                name="stateOfResidence"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.stateOfResidence}
              />
            </Grid>
            <Grid
              item
              md={6}
              xs={12}
            >
              <TextField
                error={Boolean(formik.touched.gender && formik.errors.gender)}
                fullWidth
                helperText={formik.touched.gender && formik.errors.gender}
                label="Gender"
                name="gender"
                select
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.gender}
              >
                {
                  genderList.map((gender, index) => (
                    <MenuItem key={index} value={gender}>
                      {gender}
                    </MenuItem>
                  ))
                }
              </TextField>
            </Grid>
            <Grid
              item
              md={6}
              xs={12}
            >
              <TextField
                error={Boolean(formik.touched.ageRange && formik.errors.ageRange)}
                fullWidth
                select
                helperText={formik.touched.ageRange && formik.errors.ageRange}
                label="Age Range"
                name="ageRange"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.ageRange}
              >
                {
                  ranges.map((range, index) => (
                    <MenuItem key={index} value={`${range[0]} - ${range[1]}`}>
                      {`${range[0]} - ${range[1]}`}
                    </MenuItem>
                  ))
                }
              </TextField>
            </Grid>
            <Grid
              item
              md={6}
              xs={12}
            >
              <TextField
                error={Boolean(formik.touched.homeAddress && formik.errors.homeAddress)}
                fullWidth
                multiline
                helperText={formik.touched.homeAddress && formik.errors.homeAddress}
                label="Home Address"
                name="homeAddress"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.homeAddress}
              />
            </Grid>
          </Grid>
        </CardContent>
        <CardActions
          sx={{
            flexWrap: 'wrap',
            m: -1
          }}
        >
          <Button
            disabled={formik.isSubmitting}
            type="submit"
            sx={{ m: 1 }}
            variant="contained"
          >
            Submit
          </Button>
          <NextLink
            href={`/admin-dashboard/users`}
            passHref
          >
            <Button
              component="a"
              disabled={formik.isSubmitting}
              sx={{
                m: 1,
                mr: 'auto'
              }}
              variant="outlined"
            >
              Cancel
            </Button>
          </NextLink>
        </CardActions>
      </Card>
    </form>
  );
};

