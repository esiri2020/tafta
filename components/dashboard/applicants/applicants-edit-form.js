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
  Radio,
  RadioGroup,
  FormControlLabel,
  Autocomplete,
  Tabs,
  Tab,
} from '@mui/material';
import {useEditApplicantMutation} from '../../../services/api';

const genderList = ['MALE', 'FEMALE'];
const registrationTypes = ['INDIVIDUAL', 'ENTERPRISE'];
const registrationModes = ['online', 'walk-in', 'referral'];
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
    label: ' Elementary School',
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
];
const user_disabilies = [
  {
    label: 'Visual impairment (seeing problem)',
    value: 'seeing',
  },
  {
    label: 'Speech problems',
    value: 'speech',
  },
  {
    label: 'Mobility disability  (Limited use of leg)',
    value: 'legDisability',
  },
  {
    label: 'Limited use of arms or fingers',
    value: 'handDisability',
  },
  {
    label: 'Intellectual disability',
    value: 'intellectualDisability',
  },
  {
    label: 'Albinism',
    value: 'albinism',
  },
  {
    label: 'Others',
    value: 'others',
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

const residency_status = [
  {
    label: 'Refugee',
    value: 'refugee',
  },
  {
    label: 'Migrant-worker',
    value: 'migrant-worker',
  },
  {
    label: 'IDP',
    value: 'idp',
  },
  {
    label: 'Resident',
    value: 'resident',
  },
];

const self_employed_types = [
  {
    label: 'Entrepreneur',
    value: 'entrepreneur',
  },

  {
    label: 'Contractor',
    value: 'contractor',
  },
];

const LGAs = {
  Lagos: {
    Group1: ['Lagos Island', 'Lagos Mainland'],
    Group2: [
      'Agege',
      'Alimosho',
      'Ifako-Ijaiye',
      'Ikeja',
      'Mushin',
      'Oshodi-Isolo',
    ],
    Group3: ['Ajeromi-Ifelodun', 'Apapa', 'Badagry', 'Ojo'],
    Group4: ['Amuwo-Odofin', 'Ikorodu', 'Kosofe', 'Surulere'],
    Group5: ['Epe', 'Eti-Osa', 'Ibeju-Lekki'],
  },
  Ogun: {
    Group1: ['Abeokuta North', 'Abeokuta South', 'Odeda', 'Obafemi Owode'],
    Group2: ['Ado-Odo/Ota', 'Ifo'],
    Group3: ['Ijebu East', 'Ijebu North', 'Ijebu North East', 'Ijebu Ode'],
    Group4: ['Egbado North', 'Egbado South', 'Imeko Afon'],
    Group5: [
      'Ewekoro',
      'Ikenne',
      'Ipokia',
      'Ogun Waterside',
      'Remo North',
      'Shagamu',
    ],
  },
  Kano: {
    Group1: [
      'Dala',
      'Fagge',
      'Gwale',
      'Kano Municipal',
      'Nasarawa',
      'Tarauni',
      'Ungogo',
    ],
    Group2: ['Dawakin Tofa', 'Gwarzo', 'Madobi', 'Makoda', 'Rogo', 'Tsanyawa'],
    Group3: [
      'Bunkure',
      'Dambatta',
      'Garun Mallam',
      'Kibiya',
      'Maimako',
      'Rano',
      'Sumaila',
      'Wudil',
    ],
    Group4: ['Kabo', 'Kibiya', 'Kiru', 'Rimin Gado', 'Shanono'],
    Group5: [
      'Ajingi',
      'Bebeji',
      'Bichi',
      'Doguwa',
      'Gezawa',
      'Karaye',
      'Kunchi',
    ],
  },
};

const nigeria_states = ['Kano', 'Lagos', 'Ogun'];

const internshipProgramOptions = [
  {label: 'Theatre Group', value: 'theatreGroup'},
  {label: 'Short Film', value: 'shortFilm'},
  {
    label: 'Marketing Communication and Social Media',
    value: 'marketingCommunication',
  },
  {label: 'Creative Management Consultant', value: 'creativeManagement'},
  {label: 'Sponsorship Marketers', value: 'sponsorshipMarketers'},
  {label: 'Content Creation Skits', value: 'contentCreationSkits'},
];

const projectTypeOptions = [
  {label: 'Group Internship Project', value: 'GroupInternship'},
  {
    label: 'Individual Internship Project (Entrepreneurs)',
    value: 'IndividualInternship',
  },
  {label: 'Corporate Internship', value: 'CorporateInternship'},
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
  {label: 'Informal', value: 'INFORMAL'},
  {label: 'Startup', value: 'STARTUP'},
  {label: 'Formal (Existing)', value: 'FORMAL_EXISTING'},
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

export const ApplicantEditForm = ({applicant, ...other}) => {
  const [updateApplicant, result] = useEditApplicantMutation();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tabValue, setTabValue] = useState(
    applicant.profile?.type === 'ENTERPRISE' ? 1 : 0,
  );

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    // Update the form value when tab changes
    if (newValue === 0) {
      formik.setFieldValue('type', 'INDIVIDUAL');
    } else {
      formik.setFieldValue('type', 'ENTERPRISE');
    }
  };

  const formik = useFormik({
    initialValues: {
      homeAddress: applicant.profile?.homeAddress || '',
      LGADetails: applicant.profile?.LGADetails || '',
      email: applicant.email || '',
      firstName: applicant.firstName || '',
      lastName: applicant.lastName || '',
      phoneNumber: applicant.profile?.phoneNumber || '',
      stateOfResidence: applicant.profile?.stateOfResidence || '',
      gender: applicant.profile?.gender || '',
      ageRange: applicant.profile?.ageRange || '',
      educationLevel: applicant.profile?.educationLevel || '',
      referrer: applicant.profile?.referrer?.fullName || '',
      referrerPhoneNumber: applicant.profile?.referrer?.phoneNumber || '',
      taftaCenter: applicant.profile?.taftaCenter || '',
      _disability: applicant?.profile?.disability ? 'true' : 'false',
      disability: applicant.profile?.disability || '',
      source: applicant.profile?.source || '',
      communityArea: applicant.profile?.communityArea || '',
      employmentStatus: applicant?.profile?.employmentStatus || '',
      employmentSector: applicant?.profile?.employmentSector || '',
      selfEmployedType: applicant?.profile?.selfEmployedType || '',
      residencyStatus: applicant?.profile?.residencyStatus || '',
      type: applicant.profile?.type || 'INDIVIDUAL',
      registrationMode: applicant.profile?.registrationMode || 'online',
      projectType: applicant?.profile?.projectType || '',
      internshipProgram: applicant?.profile?.internshipProgram || '',
      // Business information for enterprise
      businessName: applicant.profile?.businessName || '',
      businessType: applicant.profile?.businessType || '',
      businessSize: applicant.profile?.businessSize || '',
      businessSector: applicant.profile?.businessSector || '',
      businessPartners: applicant.profile?.businessPartners || '',
      companyPhoneNumber: applicant.profile?.companyPhoneNumber || '',
      additionalPhoneNumber: applicant.profile?.additionalPhoneNumber || '',
      companyEmail: applicant.profile?.companyEmail || '',
      revenueRange: applicant.profile?.revenueRange || '',
      businessSupportNeeds: applicant.profile?.businessSupportNeeds || [],
      registrationType: applicant.profile?.registrationType || '',
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
      firstName: Yup.string().max(255).required('First Name is required'),
      lastName: Yup.string().max(255).required('Last Name is required'),
      phoneNumber: Yup.string().max(15),
      stateOfResidence: Yup.string().max(255),
      gender: Yup.string().max(6),
      educationLevel: Yup.string().max(15),
      referrer: Yup.string().max(255),
      taftaCenter: Yup.string().max(255),
      disability: Yup.string().max(128),
      source: Yup.string().max(15),
      communityArea: Yup.string().max(15),
      type: Yup.string()
        .oneOf(['INDIVIDUAL', 'ENTERPRISE'])
        .required('Type is required'),
      registrationMode: Yup.string().required('Registration mode is required'),
      employmentStatus: Yup.string(),
      employmentSector: Yup.string().when('employmentStatus', {
        is: val => val === 'employed' || val === 'self-employed',
        then: Yup.string().required(
          'Employment sector is required when employed',
        ),
      }),
      residencyStatus: Yup.string(),
      selfEmployedType: Yup.string().when('employmentStatus', {
        is: 'self-employed',
        then: Yup.string().required('Self-Employed Type is required'),
      }),
      projectType: Yup.string().max(255),
      internshipProgram: Yup.string(),
    }),
    onSubmit: handleSubmit,
  });

  // Initialize an array to hold LGAs based on the selected state
  const [availableLGAs, setAvailableLGAs] = useState([]);

  useEffect(() => {
    if (formik.values.stateOfResidence) {
      const selectedState = formik.values.stateOfResidence;

      // Combine LGAs from all groups for the selected state
      const allLGAs = Object.values(LGAs[selectedState]).flat();

      setAvailableLGAs(allLGAs);
    }
  }, [formik.values.stateOfResidence]);

  // Handle profile update submission
  const handleSubmit = async (values, helpers) => {
    setIsSubmitting(true);
    try {
      // Prepare data for API
      const {
        email,
        firstName,
        middleName,
        lastName,
        role,
        submit,
        taftaCenter,
        referrer,
        referrerPhoneNumber,
        _disability,
        ...profileData
      } = values;

      // Create referrer object if referrer exists
      const referrerData = referrer
        ? {
            fullName: referrer,
            phoneNumber: referrerPhoneNumber,
          }
        : undefined;

      // Handle disability field (converting string to actual disability value)
      const disabilityValue = _disability === 'true' ? values.disability : null;

      // Restructure data to match API requirements
      const profileDataWithReferrer = {
        ...profileData,
        taftaCenter,
        referrer: referrerData,
        disability: disabilityValue,
      };

      // Submit to API
      await updateApplicant({
        id: applicant.id,
        body: {
          firstName,
          middleName,
          lastName,
          profile: profileDataWithReferrer,
        },
      }).unwrap();

      helpers.setStatus({success: true});
      toast.success('Applicant updated!');
      router.push('/admin-dashboard/applicants');
    } catch (err) {
      console.error(err);
      helpers.setStatus({success: false});
      helpers.setErrors({submit: err.message});
      toast.error('Something went wrong!');
    } finally {
      helpers.setSubmitting(false);
      setIsSubmitting(false);
    }
  };

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
        <CardHeader title='Edit Applicant' />
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
                disabled
                value={formik.values.email}
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

            {/* Location Information */}
            <Grid item xs={12}>
              <Typography variant='h6' sx={{mb: 2, mt: 2}}>
                Location Information
              </Typography>
            </Grid>

            <Grid item md={6} xs={12}>
              <Autocomplete
                getOptionLabel={option => option}
                options={nigeria_states}
                value={formik.values.stateOfResidence}
                onChange={(event, newValue) => {
                  formik.setFieldValue('stateOfResidence', newValue);
                }}
                renderInput={params => (
                  <TextField
                    {...params}
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
                  />
                )}
              />
            </Grid>

            <Grid item md={6} xs={12}>
              <Autocomplete
                getOptionLabel={option => option}
                options={availableLGAs}
                value={formik.values.LGADetails}
                onChange={(event, newValue) => {
                  formik.setFieldValue('LGADetails', newValue);
                }}
                renderInput={params => (
                  <TextField
                    {...params}
                    error={Boolean(
                      formik.touched.LGADetails && formik.errors.LGADetails,
                    )}
                    fullWidth
                    helperText={
                      formik.touched.LGADetails && formik.errors.LGADetails
                    }
                    label='LGA Details'
                  />
                )}
              />
            </Grid>

            <Grid item md={12} xs={12}>
              <TextField
                error={Boolean(
                  formik.touched.homeAddress && formik.errors.homeAddress,
                )}
                fullWidth
                multiline
                helperText={
                  formik.touched.homeAddress && formik.errors.homeAddress
                }
                label='Home address'
                name='homeAddress'
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                required
                value={formik.values.homeAddress}
              />
            </Grid>

            {/* Personal Details Section */}
            <Grid item xs={12}>
              <Typography variant='h6' sx={{mb: 2, mt: 2}}>
                Personal Details
              </Typography>
            </Grid>

            <Grid item md={6} xs={12}>
              <TextField
                error={Boolean(formik.touched.gender && formik.errors.gender)}
                fullWidth
                helperText={formik.touched.gender && formik.errors.gender}
                label='Gender'
                name='gender'
                select
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.gender}>
                {genderList.map((gender, index) => (
                  <MenuItem key={index} value={gender}>
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
                {ranges.map((range, index) => (
                  <MenuItem key={index} value={`${range[0]} - ${range[1]}`}>
                    {`${range[0]} - ${range[1]}`}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item md={6} xs={12}>
              <TextField
                error={Boolean(
                  formik.touched.taftaCenter && formik.errors.taftaCenter,
                )}
                fullWidth
                helperText={
                  formik.touched.taftaCenter && formik.errors.taftaCenter
                }
                label='Tafta Center'
                name='taftaCenter'
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.taftaCenter}
              />
            </Grid>

            {/* Education & Referral Information */}
            <Grid item xs={12}>
              <Typography variant='h6' sx={{mb: 2, mt: 2}}>
                Education & Referral
              </Typography>
            </Grid>

            <Grid item md={12} xs={12}>
              <Typography gutterBottom variant='subtitle1'>
                Highest Level of Education Attained
              </Typography>
              <RadioGroup
                name='educationLevel'
                sx={{flexDirection: 'row'}}
                value={formik.values.educationLevel}
                onChange={formik.handleChange}>
                {levels_of_education.map(level_of_education => (
                  <FormControlLabel
                    control={<Radio sx={{ml: 1}} />}
                    value={level_of_education.value}
                    key={level_of_education.value}
                    label={
                      <Typography variant='body1'>
                        {level_of_education.label}
                      </Typography>
                    }
                  />
                ))}
              </RadioGroup>
            </Grid>

            <Grid item md={6} xs={12}>
              <TextField
                error={Boolean(
                  formik.touched.referrer && formik.errors.referrer,
                )}
                fullWidth
                helperText={formik.touched.referrer && formik.errors.referrer}
                label='Referrer'
                name='referrer'
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.referrer}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                error={Boolean(
                  formik.touched.referrerPhoneNumber &&
                    formik.errors.referrerPhoneNumber,
                )}
                fullWidth
                helperText={
                  formik.touched.referrerPhoneNumber &&
                  formik.errors.referrerPhoneNumber
                }
                label='Referrer Phone Number'
                name='referrerPhoneNumber'
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.referrerPhoneNumber}
              />
            </Grid>

            {/* Health Information */}
            <Grid item xs={12}>
              <Typography variant='h6' sx={{mb: 2, mt: 2}}>
                Health Information
              </Typography>
            </Grid>

            <Grid item md={6} xs={12}>
              <Typography sx={{ml: 2}} variant='p'>
                Disabilities
              </Typography>
              <Grid sx={{ml: 2}}>
                <RadioGroup
                  name='_disability'
                  sx={{flexDirection: 'column'}}
                  value={formik.values._disability}
                  onChange={e => {
                    if (e.target.value == 'false') {
                      formik.setFieldValue('disability', '');
                    }
                    formik.setFieldValue('_disability', e.target.value);
                  }}>
                  <FormControlLabel
                    control={<Radio sx={{ml: 1}} />}
                    value={'true'}
                    label={<Typography variant='body1'>Yes</Typography>}
                  />
                  <FormControlLabel
                    control={<Radio sx={{ml: 1}} />}
                    value={'false'}
                    label={<Typography variant='body1'>No</Typography>}
                  />
                </RadioGroup>
              </Grid>
            </Grid>

            <Grid item md={6} xs={12}>
              <Typography sx={{ml: 2}} variant='p'>
                If Yes Please Select Below
              </Typography>
              <Grid sx={{ml: 2}}>
                <RadioGroup
                  name='disability'
                  sx={{flexDirection: 'row'}}
                  value={formik.values.disability}
                  onChange={formik.handleChange}>
                  {user_disabilies.map(user_disability => (
                    <FormControlLabel
                      disabled={formik.values._disability !== 'true'}
                      control={<Radio sx={{ml: 1}} />}
                      key={user_disability.value}
                      label={
                        <Typography variant='body1'>
                          {user_disability.label}
                        </Typography>
                      }
                      value={user_disability.value}
                    />
                  ))}
                </RadioGroup>
              </Grid>
            </Grid>

            {/* Employment Information */}
            <Grid item xs={12}>
              <Typography variant='h6' sx={{mb: 2, mt: 2}}>
                Employment Information
              </Typography>
            </Grid>

            <Grid item md={6} xs={12}>
              <Typography id='employment-status-label'>
                Employment Status
              </Typography>
              <Grid sx={{ml: 2}}>
                <RadioGroup
                  name='employmentStatus'
                  sx={{flexDirection: 'row'}}
                  value={formik.values.employmentStatus}
                  onChange={formik.handleChange}
                  id='employment-status'
                  {...formik.getFieldProps('employmentStatus')}
                  error={
                    formik.touched.employmentStatus &&
                    Boolean(formik.errors.employmentStatus)
                  }
                  helperText={
                    formik.touched.employmentStatus &&
                    formik.errors.employmentStatus
                  }>
                  {employment_status.map(option => (
                    <FormControlLabel
                      control={<Radio sx={{ml: 1}} />}
                      label={
                        <Typography variant='body1'>{option.label}</Typography>
                      }
                      key={option.value}
                      value={option.value}>
                      {option.label}
                    </FormControlLabel>
                  ))}
                </RadioGroup>
              </Grid>
            </Grid>

            {formik.values.employmentStatus === 'self-employed' && (
              <Grid item md={6} xs={12}>
                <Typography id='self-employed-type-label'>
                  Self-Employed Type
                </Typography>
                <Grid sx={{ml: 3}}>
                  <RadioGroup
                    name='selfEmployedType'
                    sx={{flexDirection: 'row'}}
                    value={formik.values.selfEmployedType}
                    onChange={formik.handleChange}
                    id='self-employed-type'
                    error={
                      formik.touched.selfEmployedType &&
                      Boolean(formik.errors.selfEmployedType)
                    }
                    helperText={
                      formik.touched.selfEmployedType &&
                      formik.errors.selfEmployedType
                    }>
                    {self_employed_types.map(option => (
                      <FormControlLabel
                        control={<Radio />}
                        label={option.label}
                        key={option.value}
                        value={option.value}
                      />
                    ))}
                  </RadioGroup>
                </Grid>
              </Grid>
            )}

            {formik.values.employmentStatus &&
              (formik.values.employmentStatus === 'employed' ||
                formik.values.employmentStatus === 'self-employed') && (
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
                    {employment_sectors.map((sector, index) => (
                      <MenuItem key={index} value={sector}>
                        {sector}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              )}

            <Grid item md={6} xs={12}>
              <Typography id='residency-status-label'>
                Residency Status
              </Typography>
              <RadioGroup
                name='residencyStatus'
                sx={{flexDirection: 'row'}}
                value={formik.values.residencyStatus}
                onChange={formik.handleChange}
                id='residency-status'
                error={
                  formik.touched.residencyStatus &&
                  Boolean(formik.errors.residencyStatus)
                }
                helperText={
                  formik.touched.residencyStatus &&
                  formik.errors.residencyStatus
                }>
                {residency_status.map(option => (
                  <FormControlLabel
                    control={<Radio />}
                    label={option.label}
                    key={option.value}
                    value={option.value}
                  />
                ))}
              </RadioGroup>
            </Grid>

            {/* Internship Information - can keep if relevant */}
            <Grid item xs={12}>
              <Typography variant='h6' sx={{mb: 2, mt: 2}}>
                Internship Information
              </Typography>
            </Grid>

            <Grid item md={6} xs={12}>
              <Typography id='project-type-label'>Project Type</Typography>
              <RadioGroup
                name='projectType'
                value={formik.values.projectType}
                onChange={formik.handleChange}
                id='project-type'>
                {projectTypeOptions.map(option => (
                  <FormControlLabel
                    control={<Radio />}
                    label={option.label}
                    value={option.value}
                    key={option.value}
                  />
                ))}
              </RadioGroup>
            </Grid>

            <Grid item md={6} xs={12}>
              <Typography id='internship-program-label'>
                Internship Program
              </Typography>
              <RadioGroup
                name='internshipProgram'
                value={formik.values.internshipProgram}
                onChange={formik.handleChange}
                id='internship-program'>
                {internshipProgramOptions.map(option => (
                  <FormControlLabel
                    control={<Radio />}
                    label={option.label}
                    value={option.value}
                    key={option.value}
                  />
                ))}
              </RadioGroup>
            </Grid>

            {/* Business Information Section - only for Enterprise */}
            {formik.values.type === 'ENTERPRISE' && (
              <>
                <Grid item xs={12}>
                  <Typography variant='h6' sx={{mb: 2, mt: 2}}>
                    Business Information
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
                    value={formik.values.businessType}>
                    {businessTypes.map((type, index) => (
                      <MenuItem key={index} value={type.value}>
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
                    value={formik.values.businessSize}>
                    {businessSizes.map((size, index) => (
                      <MenuItem key={index} value={size.value}>
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
                    select
                    helperText={
                      formik.touched.businessSector &&
                      formik.errors.businessSector
                    }
                    label='Business Sector'
                    name='businessSector'
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.businessSector}>
                    {employment_sectors.map((sector, index) => (
                      <MenuItem key={index} value={sector}>
                        {sector}
                      </MenuItem>
                    ))}
                  </TextField>
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
                    {businessRegistrationTypes.map((type, index) => (
                      <MenuItem key={index} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </>
            )}
          </Grid>
        </CardContent>
        <CardActions
          sx={{
            flexWrap: 'wrap',
            m: -1,
          }}>
          <Button
            color='primary'
            disabled={formik.isSubmitting || isSubmitting}
            type='submit'
            variant='contained'>
            Save Changes
          </Button>
          <NextLink
            href={`/admin-dashboard/applicants/${applicant.id}`}
            passHref>
            <Button
              component='a'
              disabled={formik.isSubmitting || isSubmitting}
              sx={{
                m: 1,
                mr: 'auto',
              }}
              variant='outlined'>
              Cancel
            </Button>
          </NextLink>
          <Button color='error' disabled={formik.isSubmitting || isSubmitting}>
            Delete user
          </Button>
        </CardActions>
      </Card>
    </form>
  );
};

ApplicantEditForm.propTypes = {
  applicant: PropTypes.object.isRequired,
};
