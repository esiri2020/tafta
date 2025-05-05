import NextLink from 'next/link';
import {useRouter} from 'next/router';
import {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
import {useFormik} from 'formik';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  TextField,
  Typography,
  MenuItem,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  FormLabel,
  Tabs,
  Tab,
  Switch,
} from '@mui/material';
import {useCreateApplicantMutation} from '../../../services/api';

// Constants
const genderList = ['MALE', 'FEMALE'];
const registrationTypes = ['INDIVIDUAL', 'ENTERPRISE'];
const registrationModes = ['online', 'walk-in', 'referral'];
const communityAreas = ['URBAN', 'RURAL', 'PERI_URBANS'];
const ranges = [
  [1, 5],
  [6, 10],
  [11, 15],
  [16, 20],
  [21, 25],
  [26, 30],
  [31, 35],
  [36, 40],
  [41, 45],
  [46, 50],
  [51, 55],
  [56, 60],
  [61, 65],
];

const levels_of_education = [
  {
    label: 'Elementary School',
    value: 'ELEMENTRY_SCHOOL',
  },
  {
    label: 'Secondary School',
    value: 'SECONDARY_SCHOOL',
  },
  {
    label: 'College of Education',
    value: 'COLLEGE_OF_EDUCATION',
  },
  {
    label: 'ND/HND',
    value: 'ND_HND',
  },
  {
    label: "Bachelor's Degree",
    value: 'BSC',
  },
  {
    label: "Master's Degree",
    value: 'MSC',
  },
  {
    label: 'PhD',
    value: 'PHD',
  },
];

const employment_status = [
  {
    label: 'Employed',
    value: 'employed',
  },
  {
    label: 'Unemployed',
    value: 'unemployed',
  },
  {
    label: 'Self-employed',
    value: 'self-employed',
  },
];

const employment_sectors = [
  'Agriculture',
  'Manufacturing',
  'Technology',
  'Healthcare',
  'Education',
  'Finance',
  'Retail',
  'Services',
  'Transportation',
  'Construction',
  'Media',
  'Government',
  'Non-profit',
  'Other',
];

const businessTypes = [
  {label: 'Startup', value: 'STARTUP'},
  {label: 'Existing', value: 'EXISTING'},
];

const businessSizes = [
  {label: 'Micro', value: 'MICRO'},
  {label: 'Small', value: 'SMALL'},
  {label: 'Medium', value: 'MEDIUM'},
  {label: 'Large', value: 'LARGE'},
];

const businessRegistrationTypes = [
  {label: 'CAC', value: 'CAC'},
  {label: 'SMEDAN', value: 'SMEDAN'},
];

export const ApplicantCreateForm = ({...other}) => {
  const [createApplicant, result] = useCreateApplicantMutation();
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [cohorts, setCohorts] = useState([]);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    // Fetch active cohorts
    fetch('/api/cohorts/active')
      .then(res => res.json())
      .then(data => setCohorts(data))
      .catch(err => console.error('Error fetching cohorts:', err));

    // Fetch courses
    fetch('/api/courses')
      .then(res => res.json())
      .then(data => setCourses(data))
      .catch(err => console.error('Error fetching courses:', err));
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const formik = useFormik({
    initialValues: {
      homeAddress: '',
      LGADetails: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      stateOfResidence: '',
      gender: 'MALE',
      ageRange: '',
      type: 'INDIVIDUAL',
      registrationMode: 'online',
      educationLevel: '',
      communityArea: '',
      employmentStatus: '',
      employmentSector: '',
      // Business information for enterprise
      businessName: '',
      businessType: undefined,
      businessSize: '',
      businessSector: '',
      businessPartners: '',
      companyPhoneNumber: '',
      additionalPhoneNumber: '',
      companyEmail: '',
      revenueRange: '',
      businessSupportNeeds: [],
      registrationType: '',
      // Course and cohort information
      cohortId: '',
      selectedCourse: '',
      selectedCourseName: '',
      selectedCourseId: '',
      submit: null,
    },
    validationSchema: Yup.object({
      homeAddress: Yup.string(),
      LGADetails: Yup.string().max(255),
      country: Yup.string().max(255),
      email: Yup.string()
        .email('Must be a valid email')
        .max(255)
        .required('Email is required'),
      password: Yup.string().min(6).max(255).required('Password is required'),
      firstName: Yup.string().max(255).required('First Name is required'),
      lastName: Yup.string().max(255).required('Last Name is required'),
      phoneNumber: Yup.string().max(15),
      stateOfResidence: Yup.string().max(255),
      gender: Yup.string().max(6),
      type: Yup.string()
        .oneOf(['INDIVIDUAL', 'ENTERPRISE'])
        .required('Type is required'),
      registrationMode: Yup.string().required('Registration mode is required'),
      educationLevel: Yup.string(),
      communityArea: Yup.string(),
      employmentStatus: Yup.string(),
      employmentSector: Yup.string().when('employmentStatus', {
        is: val => val === 'employed' || val === 'self-employed',
        then: Yup.string().required(
          'Employment sector is required when employed',
        ),
      }),
      // Conditional validation for enterprise fields
      businessName: Yup.string().when('type', {
        is: 'ENTERPRISE',
        then: Yup.string().required(
          'Business name is required for enterprises',
        ),
      }),
      businessType: Yup.string().when('type', {
        is: 'ENTERPRISE',
        then: Yup.string()
          .oneOf(['STARTUP', 'EXISTING'], 'Invalid business type')
          .required('Business type is required for enterprises'),
      }),
      businessSize: Yup.string().when('type', {
        is: 'ENTERPRISE',
        then: Yup.string().required(
          'Business size is required for enterprises',
        ),
      }),
      businessSector: Yup.string().when('type', {
        is: 'ENTERPRISE',
        then: Yup.string().required(
          'Business sector is required for enterprises',
        ),
      }),
      companyEmail: Yup.string().when('type', {
        is: 'ENTERPRISE',
        then: Yup.string().email('Must be a valid email').max(255),
      }),
      // Course and cohort validation
      cohortId: Yup.string().required('Cohort is required'),
      selectedCourse: Yup.string().required('Course is required'),
    }),
    onSubmit: async (values, helpers) => {
      try {
        const {
          email,
          firstName,
          lastName,
          password,
          submit,
          dob,
          ageRange,
          type,
          registrationMode,
          educationLevel,
          communityArea,
          employmentStatus,
          employmentSector,
          cohortId,
          selectedCourseId,
          selectedCourseName,
          businessName,
          businessType,
          businessSize,
          businessSector,
          businessPartners,
          companyPhoneNumber,
          additionalPhoneNumber,
          companyEmail,
          revenueRange,
          businessSupportNeeds,
          registrationType,
          ...otherFields
        } = values;

        // Prepare profile data
        const profile = {
          dob: dob || undefined,
          ageRange,
          type,
          registrationMode,
          educationLevel,
          communityArea,
          employmentStatus,
          employmentSector,
          cohortId,
          selectedCourseId,
          selectedCourseName,
          businessName,
          businessType,
          businessSize,
          businessSector,
          businessPartners,
          companyPhoneNumber,
          additionalPhoneNumber,
          companyEmail,
          revenueRange,
          businessSupportNeeds,
          registrationType,
          ...otherFields,
        };

        // Make API request
        const response = await createApplicant({
          body: {
            firstName,
            lastName,
            email,
            password,
            type,
            cohortId,
            profile,
          },
        }).unwrap();

        if (response) {
          helpers.setStatus({success: true});
          helpers.setSubmitting(false);
          toast.success('Applicant Created!');
          router.replace({pathname: '/admin-dashboard/applicants/'});
        }
      } catch (err) {
        console.error('Form submission error:', err);
        toast.error(err.data?.message || 'Something went wrong!');
        helpers.setStatus({success: false});
        helpers.setErrors({submit: err.message});
        helpers.setSubmitting(false);
      }
    },
  });

  // Update tab value when type changes
  useEffect(() => {
    if (formik.values.type === 'INDIVIDUAL') {
      setTabValue(0);
    } else {
      setTabValue(1);
    }
  }, [formik.values.type]);

  return (
    <form onSubmit={formik.handleSubmit} {...other}>
      <Card>
        <CardHeader title='Create Applicant' />
        <Divider />
        <CardContent>
          <Box sx={{mb: 4}}>
            <Typography variant='h6' gutterBottom>
              Applicant Type
            </Typography>
            <Tabs value={tabValue} onChange={handleTabChange} sx={{mb: 2}}>
              <Tab
                label='Individual'
                onClick={() => formik.setFieldValue('type', 'INDIVIDUAL')}
              />
              <Tab
                label='Enterprise'
                onClick={() => formik.setFieldValue('type', 'ENTERPRISE')}
              />
            </Tabs>
          </Box>

          <Grid container spacing={3}>
            {/* Basic Information - common for both types */}
            <Grid item xs={12}>
              <Typography variant='h6' sx={{mb: 2}}>
                Basic Information
              </Typography>
            </Grid>

            <Grid item md={6} xs={12}>
              <TextField
                error={Boolean(
                  formik.touched.firstName && formik.errors.firstName,
                )}
                fullWidth
                helperText={formik.touched.firstName && formik.errors.firstName}
                label='First Name'
                name='firstName'
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                required
                value={formik.values.firstName}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                error={Boolean(
                  formik.touched.lastName && formik.errors.lastName,
                )}
                fullWidth
                helperText={formik.touched.lastName && formik.errors.lastName}
                label='Last Name'
                name='lastName'
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                required
                value={formik.values.lastName}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                error={Boolean(formik.touched.email && formik.errors.email)}
                fullWidth
                helperText={formik.touched.email && formik.errors.email}
                label='Email Address'
                name='email'
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                required
                value={formik.values.email}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                error={Boolean(
                  formik.touched.password && formik.errors.password,
                )}
                fullWidth
                helperText={formik.touched.password && formik.errors.password}
                label='Password'
                name='password'
                type='password'
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                required
                value={formik.values.password}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                error={Boolean(
                  formik.touched.phoneNumber && formik.errors.phoneNumber,
                )}
                fullWidth
                helperText={
                  formik.touched.phoneNumber && formik.errors.phoneNumber
                }
                label='Phone number'
                name='phoneNumber'
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.phoneNumber}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                error={Boolean(
                  formik.touched.registrationMode &&
                    formik.errors.registrationMode,
                )}
                fullWidth
                select
                helperText={
                  formik.touched.registrationMode &&
                  formik.errors.registrationMode
                }
                label='Registration Mode'
                name='registrationMode'
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                required
                value={formik.values.registrationMode}>
                {registrationModes.map((mode, index) => (
                  <MenuItem key={index} value={mode}>
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Course and Cohort Selection */}
            <Grid item xs={12}>
              <Typography variant='h6' sx={{mb: 2, mt: 2}}>
                Course and Cohort Selection
              </Typography>
            </Grid>

            <Grid item md={6} xs={12}>
              <TextField
                error={Boolean(
                  formik.touched.cohortId && formik.errors.cohortId,
                )}
                fullWidth
                select
                helperText={formik.touched.cohortId && formik.errors.cohortId}
                label='Cohort'
                name='cohortId'
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                required
                value={formik.values.cohortId}>
                {cohorts.map((cohort) => (
                  <MenuItem key={cohort.id} value={cohort.id}>
                    {cohort.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item md={6} xs={12}>
              <TextField
                error={Boolean(
                  formik.touched.selectedCourse && formik.errors.selectedCourse,
                )}
                fullWidth
                select
                helperText={
                  formik.touched.selectedCourse && formik.errors.selectedCourse
                }
                label='Course'
                name='selectedCourse'
                onBlur={formik.handleBlur}
                onChange={(e) => {
                  const course = courses.find(c => c.id === e.target.value);
                  formik.setFieldValue('selectedCourse', e.target.value);
                  formik.setFieldValue('selectedCourseId', course.id);
                  formik.setFieldValue('selectedCourseName', course.name);
                }}
                required
                value={formik.values.selectedCourse}>
                {courses.map((course) => (
                  <MenuItem key={course.id} value={course.id}>
                    {course.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Location Information */}
            <Grid item xs={12}>
              <Typography variant='h6' sx={{mb: 2, mt: 2}}>
                Location Information
              </Typography>
            </Grid>

            <Grid item md={6} xs={12}>
              <TextField
                error={Boolean(
                  formik.touched.stateOfResidence &&
                    formik.errors.stateOfResidence,
                )}
                fullWidth
                helperText={
                  formik.touched.stateOfResidence &&
                  formik.errors.stateOfResidence
                }
                label='State of Residence'
                name='stateOfResidence'
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.stateOfResidence}
              />
            </Grid>

            <Grid item md={6} xs={12}>
              <TextField
                error={Boolean(
                  formik.touched.LGADetails && formik.errors.LGADetails,
                )}
                fullWidth
                helperText={formik.touched.LGADetails && formik.errors.LGADetails}
                label='LGA Details'
                name='LGADetails'
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.LGADetails}
              />
            </Grid>

            <Grid item md={6} xs={12}>
              <TextField
                error={Boolean(
                  formik.touched.homeAddress && formik.errors.homeAddress,
                )}
                fullWidth
                helperText={
                  formik.touched.homeAddress && formik.errors.homeAddress
                }
                label='Home Address'
                name='homeAddress'
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.homeAddress}
              />
            </Grid>

            {/* Additional Information */}
            <Grid item xs={12}>
              <Typography variant='h6' sx={{mb: 2, mt: 2}}>
                Additional Information
              </Typography>
            </Grid>

            <Grid item md={6} xs={12}>
              <TextField
                error={Boolean(formik.touched.gender && formik.errors.gender)}
                fullWidth
                select
                helperText={formik.touched.gender && formik.errors.gender}
                label='Gender'
                name='gender'
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.gender}>
                {genderList.map((gender) => (
                  <MenuItem key={gender} value={gender}>
                    {gender}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item md={6} xs={12}>
              <TextField
                error={Boolean(
                  formik.touched.ageRange && formik.errors.ageRange,
                )}
                fullWidth
                select
                helperText={formik.touched.ageRange && formik.errors.ageRange}
                label='Age Range'
                name='ageRange'
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.ageRange}>
                {ranges.map((range) => (
                  <MenuItem key={range.join('-')} value={range.join('-')}>
                    {range.join('-')}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item md={6} xs={12}>
              <TextField
                error={Boolean(
                  formik.touched.educationLevel &&
                    formik.errors.educationLevel,
                )}
                fullWidth
                select
                helperText={
                  formik.touched.educationLevel && formik.errors.educationLevel
                }
                label='Education Level'
                name='educationLevel'
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.educationLevel}>
                {levels_of_education.map((level) => (
                  <MenuItem key={level.value} value={level.value}>
                    {level.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item md={6} xs={12}>
              <TextField
                error={Boolean(
                  formik.touched.communityArea && formik.errors.communityArea,
                )}
                fullWidth
                select
                helperText={
                  formik.touched.communityArea && formik.errors.communityArea
                }
                label='Community Area'
                name='communityArea'
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.communityArea}>
                {communityAreas.map((area) => (
                  <MenuItem key={area} value={area}>
                    {area}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item md={6} xs={12}>
              <TextField
                error={Boolean(
                  formik.touched.employmentStatus &&
                    formik.errors.employmentStatus,
                )}
                fullWidth
                select
                helperText={
                  formik.touched.employmentStatus &&
                  formik.errors.employmentStatus
                }
                label='Employment Status'
                name='employmentStatus'
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.employmentStatus}>
                {employment_status.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {formik.values.employmentStatus === 'employed' && (
              <Grid item md={6} xs={12}>
                <TextField
                  error={Boolean(
                    formik.touched.employmentSector &&
                      formik.errors.employmentSector,
                  )}
                  fullWidth
                  select
                  helperText={
                    formik.touched.employmentSector &&
                    formik.errors.employmentSector
                  }
                  label='Employment Sector'
                  name='employmentSector'
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  required
                  value={formik.values.employmentSector}>
                  {employment_sectors.map((sector) => (
                    <MenuItem key={sector} value={sector}>
                      {sector}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}

            {/* Enterprise Information */}
            {formik.values.type === 'ENTERPRISE' && (
              <>
                <Grid item xs={12}>
                  <Typography variant='h6' sx={{mb: 2, mt: 2}}>
                    Enterprise Information
                  </Typography>
                </Grid>

                <Grid item md={6} xs={12}>
                  <TextField
                    error={Boolean(
                      formik.touched.businessName && formik.errors.businessName,
                    )}
                    fullWidth
                    helperText={
                      formik.touched.businessName && formik.errors.businessName
                    }
                    label='Business Name'
                    name='businessName'
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    required
                    value={formik.values.businessName}
                  />
                </Grid>

                <Grid item md={6} xs={12}>
                  <TextField
                    error={Boolean(
                      formik.touched.businessType && formik.errors.businessType,
                    )}
                    fullWidth
                    select
                    helperText={
                      formik.touched.businessType && formik.errors.businessType
                    }
                    label='Business Type'
                    name='businessType'
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    required
                    value={formik.values.businessType}>
                    {businessTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item md={6} xs={12}>
                  <TextField
                    error={Boolean(
                      formik.touched.businessSize && formik.errors.businessSize,
                    )}
                    fullWidth
                    select
                    helperText={
                      formik.touched.businessSize && formik.errors.businessSize
                    }
                    label='Business Size'
                    name='businessSize'
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    required
                    value={formik.values.businessSize}>
                    {businessSizes.map((size) => (
                      <MenuItem key={size.value} value={size.value}>
                        {size.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item md={6} xs={12}>
                  <TextField
                    error={Boolean(
                      formik.touched.businessSector &&
                        formik.errors.businessSector,
                    )}
                    fullWidth
                    helperText={
                      formik.touched.businessSector &&
                      formik.errors.businessSector
                    }
                    label='Business Sector'
                    name='businessSector'
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    required
                    value={formik.values.businessSector}
                  />
                </Grid>

                <Grid item md={6} xs={12}>
                  <TextField
                    error={Boolean(
                      formik.touched.businessPartners &&
                        formik.errors.businessPartners,
                    )}
                    fullWidth
                    helperText={
                      formik.touched.businessPartners &&
                      formik.errors.businessPartners
                    }
                    label='Business Partners'
                    name='businessPartners'
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.businessPartners}
                  />
                </Grid>

                <Grid item md={6} xs={12}>
                  <TextField
                    error={Boolean(
                      formik.touched.companyPhoneNumber &&
                        formik.errors.companyPhoneNumber,
                    )}
                    fullWidth
                    helperText={
                      formik.touched.companyPhoneNumber &&
                      formik.errors.companyPhoneNumber
                    }
                    label='Company Phone Number'
                    name='companyPhoneNumber'
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.companyPhoneNumber}
                  />
                </Grid>

                <Grid item md={6} xs={12}>
                  <TextField
                    error={Boolean(
                      formik.touched.additionalPhoneNumber &&
                        formik.errors.additionalPhoneNumber,
                    )}
                    fullWidth
                    helperText={
                      formik.touched.additionalPhoneNumber &&
                      formik.errors.additionalPhoneNumber
                    }
                    label='Additional Phone Number'
                    name='additionalPhoneNumber'
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.additionalPhoneNumber}
                  />
                </Grid>

                <Grid item md={6} xs={12}>
                  <TextField
                    error={Boolean(
                      formik.touched.companyEmail && formik.errors.companyEmail,
                    )}
                    fullWidth
                    helperText={
                      formik.touched.companyEmail && formik.errors.companyEmail
                    }
                    label='Company Email'
                    name='companyEmail'
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.companyEmail}
                  />
                </Grid>

                <Grid item md={6} xs={12}>
                  <TextField
                    error={Boolean(
                      formik.touched.revenueRange && formik.errors.revenueRange,
                    )}
                    fullWidth
                    helperText={
                      formik.touched.revenueRange && formik.errors.revenueRange
                    }
                    label='Revenue Range'
                    name='revenueRange'
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.revenueRange}
                  />
                </Grid>

                <Grid item md={6} xs={12}>
                  <TextField
                    error={Boolean(
                      formik.touched.registrationType &&
                        formik.errors.registrationType,
                    )}
                    fullWidth
                    select
                    helperText={
                      formik.touched.registrationType &&
                      formik.errors.registrationType
                    }
                    label='Registration Type'
                    name='registrationType'
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.registrationType}>
                    {businessRegistrationTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </>
            )}
          </Grid>
        </CardContent>
        <Divider />
        <CardActions>
          <Button
            variant='contained'
            color='primary'
            type='submit'
            disabled={formik.isSubmitting}>
            {formik.isSubmitting ? 'Creating...' : 'Create Applicant'}
          </Button>
          <NextLink href='/admin-dashboard/applicants' passHref>
            <Button
              component='a'
              color='inherit'
              sx={{ml: 2}}
              disabled={formik.isSubmitting}>
              Cancel
            </Button>
          </NextLink>
        </CardActions>
      </Card>
    </form>
  );
};

// ApplicantEditForm.propTypes = {
//   applicant: PropTypes.object.isRequired
// };
