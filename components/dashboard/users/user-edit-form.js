import NextLink from 'next/link';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Switch,
  TextField,
  Typography,
  MenuItem
} from '@mui/material';
import { useEditUserMutation } from '../../../services/api'

const genderList = ['MALE', 'FEMALE']
const roles = ['SUPERADMIN', 'ADMIN', 'SUPPORT', 'GUEST', 'APPLICANT']
const ranges = [[1,5],[6,10],[11,15],[16,20],[21,25],[26,30],[31,35],[36,40]]

export const UserEditForm = ({ user, ...other }) => {
  const [ updateUser, result ] = useEditUserMutation()
  const formik = useFormik({
    initialValues: {
      homeAddress: user.profile?.homeAddress || '',
      LGADetails: user.profile?.LGADetails || '',
      email: user.email || '',
      role: user.role || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phoneNumber: user.profile?.phoneNumber || '',
      stateOfResidence: user.profile?.stateOfResidence || '',
      gender: user.profile?.gender || '',
      ageRange: user.profile?.ageRange || '',
      submit: null
    },
    validationSchema: Yup.object({
      homeAddress: Yup.string(),
      LGADetails: Yup.string().max(255),
      country: Yup.string().max(255),
      role: Yup.string().max(10).required('User role is required'),
      email: Yup
        .string()
        .email('Must be a valid email')
        .max(255)
        .required('Email is required'),
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
        const {email, firstName, lastName, role, submit, ...profile} = values
        // NOTE: Make API request
        await updateUser({id: user.id, body: {firstName, lastName, role, profile}}).unwrap()
        helpers.setStatus({ success: true });
        helpers.setSubmitting(false);
        toast.success('User updated!');
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
        <CardHeader title="Edit user" />
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
                disabled
                value={formik.values.email}
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
                error={Boolean(formik.touched.LGADetails && formik.errors.LGADetails)}
                fullWidth
                helperText={formik.touched.LGADetails && formik.errors.LGADetails}
                label="LGA Details"
                name="LGADetails"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.LGADetails}
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
                label="Home address"
                name="homeAddress"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                required
                value={formik.values.homeAddress}
              />
            </Grid>
          </Grid>
          {/* <Box
            sx={{
              alignItems: 'center',
              display: 'flex',
              justifyContent: 'space-between',
              mt: 3
            }}
          >
            <div>
              <Typography
                gutterBottom
                variant="subtitle1"
              >
                Make Contact Info Public
              </Typography>
              <Typography
                color="textSecondary"
                variant="body2"
                sx={{ mt: 1 }}
              >
                Means that anyone viewing your profile will be able to see your contacts
                details
              </Typography>
            </div>
            <Switch
              checked={formik.values.isVerified}
              color="primary"
              edge="start"
              name="isVerified"
              onChange={formik.handleChange}
              value={formik.values.isVerified}
            />
          </Box>
          <Divider sx={{ my: 3 }} />
          <Box
            sx={{
              alignItems: 'center',
              display: 'flex',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <Typography
                gutterBottom
                variant="subtitle1"
              >
                Available to hire
              </Typography>
              <Typography
                color="textSecondary"
                variant="body2"
                sx={{ mt: 1 }}
              >
                Toggling this will let your teammates know that you are available for
                acquiring new projects
              </Typography>
            </div>
            <Switch
              checked={formik.values.hasDiscount}
              color="primary"
              edge="start"
              name="hasDiscount"
              onChange={formik.handleChange}
              value={formik.values.hasDiscount}
            />
          </Box> */}
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
            Update
          </Button>
          <NextLink
            href={`/admin-dashboard/users/${user.id}`}
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
          <Button
            color="error"
            disabled={formik.isSubmitting}
          >
            Delete user
          </Button>
        </CardActions>
      </Card>
    </form>
  );
};

UserEditForm.propTypes = {
  user: PropTypes.object.isRequired
};
