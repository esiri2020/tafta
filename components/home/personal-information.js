import React, {useState, useEffect} from 'react';
import {
  MenuItem,
  Autocomplete,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Card,
  CardContent,
  Box,
  Button,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import {useCreateEnrollmentMutation} from '../../services/api';
import {useRouter} from 'next/router';
import {useFormik} from 'formik';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import * as Yup from 'yup';

const nigeria_states = ['Kano', 'Lagos', 'Ogun'];

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

const community_areas = [
  {
    label: 'Urban',
    value: 'URBAN',
  },
  {
    label: 'Rural',
    value: 'RURAL',
  },
  {
    label: 'Peri-Urbans',
    value: 'PERI_URBANS',
  },
];

const genderList = ['MALE', 'FEMALE'];
const ranges = [
  [1, 5],
  [6, 10],
  [11, 15],
  [16, 20],
  [21, 25],
  [26, 30],
  [31, 35],
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

const genders = [
  {
    label: 'Male ',
    value: 'male',
  },
  {
    label: 'Female',
    value: 'female',
  },
];

const defaultCohortCourses = [
  {
    label: 'Script Writing',
    value: 'script-writing',
  },
  {
    label: 'Stage Lighting',
    value: 'stage-lighting',
  },
  {
    label: 'Sound Design',
    value: 'sound-design',
  },
  {
    label: 'Animation',
    value: 'animation',
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

const internshipProgramOptions = [
  {label: 'Theatre Group', value: 'TheatreGroup'},
  {label: 'Short Film', value: 'ShortFilm'},
  {
    label: 'Marketing Communication and Social Media',
    value: 'MarketingCommunication',
  },
  {
    label: 'Creative Management Consultant',
    value: 'CreativeManagementConsultant',
  },
  {label: 'Sponsorship Marketers', value: 'SponsorshipMarketers'},
  {label: 'Content Creation', value: 'ContentCreation'},
];

const projectTypeOptions = [
  {label: 'Group Internship Project', value: 'GroupInternship'},
  {
    label: 'Individual Internship Project (Entrepreneurs)',
    value: 'IndividualInternship',
  },
  {label: 'Corporate Internship', value: 'CorporateInternship'},
];

const mobilizer = [
  'MUB',
  'MYD',
  'ARO',
  'NYSC',
  'RCCGDD',
  'KEN01',
  'WOMDEV',
  'LANMO',
  'AKIN T',
  'GOKE19',
  'OLUFEMISAMSON',
  'OLASAM',
  'Pearl',
  'OGJLE05',
  'ADEOLU',
  'NAFOGUN',
  'KENNYWISE',
  'TK001',
  'TK002',
  'TK003',
  'TK004',
  'TK005',
  'TK006',
  'TK007',
  'TK008',
  'TK009',
  'TK010',
  'TK011',
  'TK012',
  'TK013',
  'TK014',
  'TK015',
  'TK016',
  'UPSKILL',
  'TCA',
  'LG/LO/003',
  'LG/VA/007',
  'LG/PA/010',
  'LG/EC/011',
  'VYN',
  'DEBBIE/ FEMI OMOLERE',
  'WISCAR',
  'CYON',
  'ILEADAFRICA',
  'AZMUSIK',
  'NEW MOBILIZER',
  'LASU',
  'JAM',
  'NATH',
  'EMM',
  'MATT',
  'MAPOLY',
  'FCOC',
  'DPRINCE',
];

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

export const CourseInformation = ({
  userId,
  applicant,
  handlers,
  state,
  cohortCourses,
  ...other
}) => {
  const {activeStep, isStepOptional, handleNext, handleBack, handleSkip} =
    handlers;
  const [createEnrollment, result] = useCreateEnrollmentMutation();

  const formik = useFormik({
    initialValues: {
      enrollmentId: '',
    },
    validationSchema: Yup.object({
      enrollmentId: Yup.string().max(255).required('Course is required'),
    }),
    onSubmit: async ({enrollmentId}, helpers) => {
      try {
        const [course] = cohortCourses.filter(cc => cc.id === enrollmentId);
        const body = {
          userCohortId: course.cohortId,
          course_name: course.course.name,
          course_id: parseInt(course.course.id),
          user_email: applicant.email,
        };
        const promise = new Promise(async (resolve, reject) => {
          const req = await createEnrollment({body});
          if (req.data?.message === 'Enrollment created') resolve(req);
          else reject(req);
        });
        toast
          .promise(promise, {
            loading: 'Loading...',
            success: <b>Success!</b>,
            error: err => {
              console.error(err);
              if (err.error?.status === 401)
                return <b>Please login with your registered credentials.</b>;
              return <b>An error occurred.</b>;
            },
          })
          .then(res => {
            helpers.setStatus({success: true});
            helpers.setSubmitting(false);
            handleNext();
          })
          .catch(err => {
            console.error(err);
            helpers.setStatus({success: false});
            helpers.setErrors({submit: err.message});
            helpers.setSubmitting(false);
          });
      } catch (err) {
        console.error(err);
        toast.error('Something went wrong!');
      }
    },
  });

  return (
    <Box>
      <Card>
        <CardContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
          <Typography
            variant='h5'
            align='left'
            sx={{
              marginBottom: '50px',
            }}>
            Select A Course
          </Typography>
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid item md={12} xs={12}>
                <Typography sx={{ml: 2}} variant='p'>
                  Course to study
                </Typography>
                <Grid sx={{ml: 2}}>
                  <RadioGroup
                    name='enrollmentId'
                    sx={{flexDirection: 'column'}}
                    value={formik.values.enrollmentId}
                    onChange={formik.handleChange}>
                    {Array.isArray(cohortCourses) &&
                    cohortCourses.length > 0 ? (
                      cohortCourses.map(cohort_course => (
                        <FormControlLabel
                          control={<Radio sx={{ml: 1}} />}
                          key={cohort_course.id}
                          label={
                            <Typography variant='body1' sx={{flexGrow: 1}}>
                              {cohort_course.course.name}
                            </Typography>
                          }
                          value={cohort_course.id}
                        />
                      ))
                    ) : (
                      <Typography
                        variant='body2'
                        color='text.secondary'
                        sx={{p: 2}}>
                        No courses available
                      </Typography>
                    )}
                  </RadioGroup>
                </Grid>
              </Grid>
            </Grid>
            <Grid sx={{display: 'flex', flexDirection: 'row', pt: 2}}>
              <Button
                color='inherit'
                disabled={activeStep === 1}
                onClick={handleBack}
                sx={{mr: 1}}>
                Back
              </Button>
              <Grid sx={{flex: '1 1 auto'}} />
              {isStepOptional(activeStep) && (
                <Button color='inherit' onClick={handleSkip} sx={{mr: 1}}>
                  Skip
                </Button>
              )}
              <Button variant='contained' type='submit'>
                Continue
              </Button>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export const PersonalInformation = ({
  userId,
  applicant,
  handlers,
  state,
  cohortCourses = [],
  ...other
}) => {
  // TODO: Decouple!
  // TODO: Enable skip
  //
  const {activeStep, isStepOptional, handleNext, handleBack, handleSkip} =
    handlers;
  const {editApplicant} = state;
  const formik = useFormik({
    initialValues: applicant
      ? {
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
          communityArea: applicant.profile?.communityArea || '',
          _disability: applicant?.profile?.disability ? 'true' : 'false',
          disability: applicant?.profile?.disability || '',
          source: applicant?.profile?.referrer ? 'by_referral' : '',
          referrer_fullName: applicant?.profile?.referrer?.fullName || '',
          referrer_phoneNumber: applicant?.profile?.referrer?.phoneNumber || '',
          employmentStatus: applicant?.profile?.employmentStatus || '',
          selfEmployedType: applicant?.profile?.selfEmployedType || '',
          residencyStatus: applicant?.profile?.residencyStatus || '',
          projectType: applicant.projectType || '',
          internshipProgram: applicant.internshipProgram || '',
          submit: null,
        }
      : {
          homeAddress: '',
          LGADetails: '',
          email: '',
          firstName: '',
          lastName: '',
          phoneNumber: '',
          stateOfResidence: '',
          gender: 'MALE',
          ageRange: '',
          educationLevel: '',
          communityArea: '',
          _disability: 'false',
          disability: '',
          source: '',
          referrer_fullName: '',
          referrer_phoneNumber: '',
          employmentStatus: '',
          employmentSector: '',
          residencyStatus: '',
          selfEmployedType: '',
          projectType: '',
          internshipProgram: '',
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
      gender: Yup.string().max(6).required('Gender is required'),
      disability: Yup.string().max(128),
      referrer_fullName: Yup.string().max(64).required('Mobilizer is required'),
      referrer_phoneNumber: Yup.string().max(16),
      employmentStatus: Yup.string().required('Employment Status is required'),
      employmentSector: Yup.string().required('Employment Sector is required'),
      residencyStatus: Yup.string().required('Residency Status is required'),
      selfEmployedType: Yup.string().when('employmentStatus', {
        is: 'self-employed',
        then: Yup.string().required('Self-Employed Type is required'),
      }),
      projectType: Yup.string().max(255).required('Project Type is required'),
      internshipProgram: Yup.string().required(
        'Internship Program is required',
      ),
    }),
    onSubmit: async (values, helpers) => {
      try {
        const {
          email,
          firstName,
          lastName,
          submit,
          _disability,
          source,
          referrer_fullName,
          referrer_phoneNumber,
          // projectType,
          // internshipProgram,
          ...profile
        } = values;
        if (referrer_fullName)
          profile.referrer = {
            fullName: referrer_fullName,
            phoneNumber: referrer_phoneNumber,
          };
        const promise = new Promise(async (resolve, reject) => {
          let req = await editApplicant({
            id: userId,
            body: {firstName, lastName, email, profile},
          });
          if (req.data?.message === 'Applicant Updated') resolve(req);
          else reject(req);
        });
        toast
          .promise(promise, {
            loading: 'Loading...',
            success: <b>Success!</b>,
            error: err => {
              console.error(err);
              if (err.error?.status === 401)
                return <b>Please login with your registered credentials.</b>;
              return <b>An error occurred.</b>;
            },
          })
          .then(res => {
            helpers.setStatus({success: true});
            helpers.setSubmitting(false);
            handleNext();
          })
          .catch(err => {
            console.error(err);
            helpers.setStatus({success: false});
            helpers.setErrors({submit: err.message});
            helpers.setSubmitting(false);
          });
      } catch (err) {
        console.error(err);
        toast.error('Something went wrong!');
      }
    },
  });

  // Initialize an array to hold LGAs based on the selected state
  const [availableLGAs, setAvailableLGAs] = React.useState([]);

  useEffect(() => {
    if (formik.values.stateOfResidence) {
      const selectedState = formik.values.stateOfResidence;

      // Combine LGAs from all groups for the selected state
      const allLGAs = Object.values(LGAs[selectedState]).flat();

      setAvailableLGAs(allLGAs);
    }
  }, [formik.values.stateOfResidence]);

  return (
    <Box>
      <Card>
        <CardContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
          <Typography
            variant='h5'
            align='left'
            sx={{
              marginBottom: '50px',
            }}>
            Personal Information
          </Typography>
          <form onSubmit={formik.handleSubmit} {...other}>
            <Grid container spacing={3}>
              <Grid item md={6} xs={12}>
                <TextField
                  error={Boolean(
                    formik.touched.firstName && formik.errors.firstName,
                  )}
                  fullWidth
                  helperText={
                    formik.touched.firstName && formik.errors.firstName
                  }
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
              <Grid item md={6} xs={12}>
                <Autocomplete
                  getOptionLabel={option => option}
                  options={nigeria_states}
                  required
                  value={formik.values.stateOfResidence}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('stateOfResidence', newValue);

                    console.log(newValue);
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
                  value={formik.values.LGADetails} // Update this line
                  required
                  onChange={(event, newValue) => {
                    formik.setFieldValue('LGADetails', newValue); // Update this line
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
                      name='LGADetails' // Update this line
                    />
                  )}
                />
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
                      required
                      value={option.value}
                      key={option.value} // Don't forget to provide a unique key
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
                  required
                  onChange={formik.handleChange}
                  id='internship-program'>
                  {internshipProgramOptions.map(option => (
                    <FormControlLabel
                      control={<Radio />}
                      label={option.label}
                      value={option.value}
                      key={option.value} // Don't forget to provide a unique key
                    />
                  ))}
                </RadioGroup>
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
                  required
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <Typography sx={{ml: 2}} variant='p'>
                  Community Area
                </Typography>
                <Grid sx={{ml: 2}}>
                  <RadioGroup
                    name='communityArea'
                    sx={{flexDirection: 'row'}}
                    value={formik.values.communityArea}
                    required>
                    {community_areas.map(communityArea => (
                      <FormControlLabel
                        control={
                          <Radio
                            sx={{ml: 1}}
                            name='communityArea'
                            value={communityArea.value}
                            onChange={formik.handleChange}
                          />
                        }
                        key={communityArea.value}
                        label={
                          <Typography variant='body1'>
                            {communityArea.label}
                          </Typography>
                        }
                      />
                    ))}
                  </RadioGroup>
                </Grid>
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
                  value={formik.values.ageRange}
                  required>
                  {ranges.map((range, index) => (
                    <MenuItem key={index} value={`${range[0]} - ${range[1]}`}>
                      {`${range[0]} - ${range[1]}`}
                    </MenuItem>
                  ))}
                </TextField>
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
                  value={formik.values.gender}
                  required>
                  {genderList.map((gender, index) => (
                    <MenuItem key={index} value={gender}>
                      {gender}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item md={6} xs={12}>
                <FormLabel>
                  <Typography sx={{ml: 2}} variant='p'>
                    Education Information
                  </Typography>
                </FormLabel>
                <Grid sx={{ml: 2}}>
                  <RadioGroup
                    name='educationLevel'
                    sx={{flexDirection: 'column'}}
                    value={formik.values.educationLevel}
                    onChange={formik.handleChange}
                    required>
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
              </Grid>
              <Grid md={6} xs={12} p={2} direction='column' spacing={3}>
                <Grid item md={6} xs={12}>
                  <Typography sx={{ml: 2}} variant='p'>
                    Disabilities
                  </Typography>
                  <Grid sx={{ml: 2}}>
                    <RadioGroup
                      name='_disability'
                      sx={{flexDirection: 'column'}}
                      value={formik.values._disability}
                      required
                      onChange={e => {
                        if (e.target.value == 'false') {
                          formik.setFieldValue('disability', '');
                        }
                        formik.setFieldValue('_disability', e.target.value);
                      }}>
                      <FormControlLabel
                        control={<Radio sx={{ml: 1}} />}
                        value={true}
                        label={<Typography variant='body1'>Yes</Typography>}
                      />
                      <FormControlLabel
                        control={<Radio sx={{ml: 1}} />}
                        value={false}
                        label={<Typography variant='body1'>No</Typography>}
                      />
                    </RadioGroup>
                  </Grid>
                </Grid>
                <Grid item md={6} xs={12} mt={2}>
                  <Typography sx={{ml: 2}} variant='p'>
                    If Yes Please Select Below
                  </Typography>
                  <Grid sx={{ml: 2}}>
                    <RadioGroup
                      name='disability'
                      sx={{flexDirection: 'row'}}
                      value={formik.values.disability}
                      required
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
              </Grid>

              {/* Employment Status */}
              <Grid item md={6} xs={12} direction='column' spacing={3}>
                <Grid item md={6} xs={12}>
                  <Typography id='employment-status-label'>
                    Employment Status
                  </Typography>
                  <Grid sx={{ml: 2}}>
                    <RadioGroup
                      name='employmentStatus'
                      sx={{flexDirection: 'row'}}
                      value={formik.values.employmentStatus}
                      required
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
                            <Typography variant='body1'>
                              {option.label}
                            </Typography>
                          }
                          key={option.value}
                          value={option.value}>
                          {option.label}
                        </FormControlLabel>
                      ))}
                    </RadioGroup>
                  </Grid>
                </Grid>

                {/* Self-Employed Type */}

                <Grid item md={6} xs={12}>
                  <Typography id='self-employed-type-label'>
                    Self-Employed Type
                  </Typography>
                  <Grid sx={{ml: 3}}>
                    <RadioGroup
                      name='selfEmployedType'
                      sx={{flexDirection: 'row'}}
                      value={formik.values.selfEmployedType}
                      required
                      onChange={formik.handleChange}
                      id='self-employed-type'
                      disabled={
                        formik.values.employmentStatus !== 'self-employed'
                      }
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
                          disabled={
                            formik.values.employmentStatus !== 'self-employed'
                          }
                          checked={
                            formik.values.selfEmployedType === option.value &&
                            formik.values.employmentStatus === 'self-employed'
                          }
                        />
                      ))}
                    </RadioGroup>
                  </Grid>
                </Grid>
              </Grid>

              {/* Residency Status */}
              <Grid item md={6} xs={12}>
                <Typography id='residency-status-label'>
                  Residency Status
                </Typography>
                <RadioGroup
                  name='residencyStatus'
                  sx={{flexDirection: 'row'}}
                  value={formik.values.residencyStatus}
                  required
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

              {/* Business Information */}
              <Grid item md={6} xs={12}>
                <Typography sx={{ml: 2}} variant='p'>
                  Business Information
                </Typography>
              </Grid>

              <Grid item md={6} xs={12}>
                <Typography sx={{ml: 2}} variant='p'>
                  Business Name
                </Typography>
                <TextField
                  fullWidth
                  label='Business Name'
                  name='businessName'
                  value={formik.values.businessName}
                  onChange={formik.handleChange}
                />
              </Grid>

              <Grid item md={6} xs={12}>
                <Typography sx={{ml: 2}} variant='p'>
                  Business Size
                </Typography>
                <TextField
                  fullWidth
                  label='Business Size'
                  name='businessSize'
                  value={formik.values.businessSize}
                  onChange={formik.handleChange}
                />
              </Grid>

              <Grid item md={6} xs={12}>
                <Typography sx={{ml: 2}} variant='p'>
                  Business Partners
                </Typography>
                <TextField
                  fullWidth
                  label='Business Partners'
                  name='businessPartners'
                  value={formik.values.businessPartners}
                  onChange={formik.handleChange}
                />
              </Grid>

              <Grid item md={6} xs={12}>
                <Typography sx={{ml: 2}} variant='p'>
                  Company Phone Number
                </Typography>
                <TextField
                  fullWidth
                  label='Company Phone Number'
                  name='companyPhoneNumber'
                  value={formik.values.companyPhoneNumber}
                  onChange={formik.handleChange}
                />
              </Grid>

              <Grid item md={6} xs={12}>
                <Typography sx={{ml: 2}} variant='p'>
                  Additional Phone Number
                </Typography>
                <TextField
                  fullWidth
                  label='Additional Phone Number'
                  name='additionalPhoneNumber'
                  value={formik.values.additionalPhoneNumber}
                  onChange={formik.handleChange}
                />
              </Grid>

              <Grid item md={6} xs={12}>
                <Typography sx={{ml: 2}} variant='p'>
                  Company Email
                </Typography>
                <TextField
                  fullWidth
                  label='Company Email'
                  name='companyEmail'
                  value={formik.values.companyEmail}
                  onChange={formik.handleChange}
                />
              </Grid>

              <Grid item md={6} xs={12}>
                <Typography sx={{ml: 2}} variant='p'>
                  Country of Business
                </Typography>
                <TextField
                  fullWidth
                  label='Country of Business'
                  name='countryOfBusiness'
                  value={formik.values.countryOfBusiness}
                  onChange={formik.handleChange}
                />
              </Grid>

              <Grid item md={6} xs={12}>
                <Typography sx={{ml: 2}} variant='p'>
                  How Did You Hear About Tafta
                </Typography>
                <Grid sx={{ml: 2}}>
                  <RadioGroup
                    name='source'
                    sx={{flexDirection: 'row'}}
                    value={formik.values.source}
                    required
                    onChange={e => {
                      if (e.target.value !== 'by_referral') {
                        formik.setFieldValue('referrer_fullName', '');
                        formik.setFieldValue('referrer_phoneNumber', '');
                      }
                      formik.handleChange(e);
                    }}>
                    <FormControlLabel
                      control={<Radio sx={{ml: 1}} />}
                      label={
                        <Typography variant='body1'>Social Media</Typography>
                      }
                      value='social_media'
                    />
                    <FormControlLabel
                      control={<Radio sx={{ml: 1}} />}
                      label={<Typography variant='body1'>Website</Typography>}
                      value='website'
                    />
                    <FormControlLabel
                      control={<Radio sx={{ml: 1}} />}
                      label={
                        <Typography variant='body1'>By Mobilizer</Typography>
                      }
                      value='by_referral'
                    />
                  </RadioGroup>
                </Grid>
              </Grid>
              <Grid item md={6} xs={12}>
                <Autocomplete
                  getOptionLabel={option => option}
                  options={mobilizer}
                  value={formik.values.referrer_fullName}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('referrer_fullName', newValue);
                    console.log(newValue);
                  }}
                  renderInput={params => (
                    <TextField
                      {...params}
                      error={Boolean(
                        formik.touched.referrer_fullName &&
                          formik.errors.referrer_fullName,
                      )}
                      fullWidth
                      helperText={
                        formik.touched.referrer_fullName &&
                        formik.errors.referrer_fullName
                      }
                      label='Mobilizer'
                      name='referrer_fullName'
                      disabled={formik.values.source !== 'by_referral'}
                    />
                  )}
                />
              </Grid>

              {/* <Grid item md={3} xs={12}>
                <TextField
                  fullWidth
                  label="Referrer Phone number"
                  name="referrer_phoneNumber"
                  disabled={formik.values.source !== "by_referral"}
                  value={formik.values.referrer_phoneNumber}
                  onChange={formik.handleChange}
                />
              </Grid> */}
            </Grid>
            <Grid sx={{display: 'flex', flexDirection: 'row', pt: 2}}>
              <Button
                color='inherit'
                disabled={activeStep === 1}
                onClick={handleBack}
                sx={{mr: 1}}>
                Back
              </Button>
              <Grid sx={{flex: '1 1 auto'}} />
              {isStepOptional(activeStep) && (
                <Button color='inherit' onClick={handleSkip} sx={{mr: 1}}>
                  Skip
                </Button>
              )}
              <Button variant='contained' type='submit'>
                Continue
              </Button>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export const EducationInformation = ({
  userId,
  applicant,
  handlers,
  state,
  ...other
}) => {
  const {activeStep, isStepOptional, handleNext, handleBack, handleSkip} =
    handlers;
  const {editApplicant} = state;
  const formik = useFormik({
    initialValues: {
      educationLevel: applicant.profile?.educationLevel || '',
    },
    validationSchema: Yup.object({
      educationLevel: Yup.string()
        .max(60)
        .required('Educational Information is required'),
    }),
    onSubmit: async (values, helpers) => {
      const profile = {educationLevel: values.educationLevel};
      const promise = new Promise(async (resolve, reject) => {
        let req = await editApplicant({id: userId, body: {profile}});
        if (req.data?.message === 'Applicant Updated') resolve(req);
        else reject(req);
      });
      toast
        .promise(promise, {
          loading: 'Loading...',
          success: <b>Success!</b>,
          error: err => {
            console.error(err);
            if (err.error?.status === 401)
              return <b>Please login with your registered credentials.</b>;
            return <b>An error occurred.</b>;
          },
        })
        .then(res => {
          helpers.setStatus({success: true});
          helpers.setSubmitting(false);
          handleNext();
        })
        .catch(err => {
          console.error(err);
          helpers.setStatus({success: false});
          helpers.setErrors({submit: err.message});
          helpers.setSubmitting(false);
        });
    },
  });
  return (
    <Box>
      <Card>
        <CardContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
          <Typography
            variant='h5'
            align='left'
            sx={{
              marginBottom: '50px',
            }}>
            STEP 3 - Educational Information
          </Typography>
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid item md={6} xs={12}>
                <FormLabel>
                  <Typography sx={{ml: 2}} variant='p'>
                    Education Information
                  </Typography>
                </FormLabel>
                <Grid sx={{ml: 2}}>
                  <RadioGroup
                    name='educationLevel'
                    sx={{flexDirection: 'column'}}
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
              </Grid>
            </Grid>
            <Grid sx={{display: 'flex', flexDirection: 'row', pt: 2}}>
              <Button
                color='inherit'
                disabled={activeStep === 1}
                onClick={handleBack}
                sx={{mr: 1}}>
                Back
              </Button>
              <Grid sx={{flex: '1 1 auto'}} />
              {isStepOptional(activeStep) && (
                <Button color='inherit' onClick={handleSkip} sx={{mr: 1}}>
                  Skip
                </Button>
              )}
              <Button variant='contained' type='submit'>
                Continue
              </Button>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export const MoreInformation = ({
  userId,
  applicant,
  handlers,
  state,
  ...other
}) => {
  const {activeStep, isStepOptional, handleNext, handleBack, handleSkip} =
    handlers;
  const {editApplicant} = state;
  const formik = useFormik({
    initialValues: {
      _disability: applicant?.profile?.disability ? 'true' : 'false',
      disability: applicant?.profile?.disability || '',
      source: applicant?.profile?.source || '',
      fullName: applicant?.profile?.referrer?.fullName || '',
      phoneNumber: applicant?.profile?.referrer?.phoneNumber || '',
    },
    validationSchema: Yup.object({
      disability: Yup.string().max(128),
      fullname: Yup.string().max(64),
      phoneNumber: Yup.string().max(16),
    }),
    onSubmit: async (values, helpers) => {
      const {fullName, phoneNumber, _disability, ...profile} = values;
      if (fullName) profile.referrer = {fullName, phoneNumber};
      const promise = new Promise(async (resolve, reject) => {
        let req = await editApplicant({id: userId, body: {profile}});
        if (req.data?.message === 'Applicant Updated') resolve(req);
        else reject(req);
      });
      toast
        .promise(promise, {
          loading: 'Loading...',
          success: <b>Success!</b>,
          error: err => {
            console.error(err);
            if (err.error?.status === 401)
              return <b>Please login with your registered credentials.</b>;
            return <b>An error occurred.</b>;
          },
        })
        .then(res => {
          helpers.setStatus({success: true});
          helpers.setSubmitting(false);
          handleNext();
        })
        .catch(err => {
          console.error(err);
          helpers.setStatus({success: false});
          helpers.setErrors({submit: err.message});
          helpers.setSubmitting(false);
        });
    },
  });
  return (
    <Box>
      <Card>
        <CardContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
          <Typography
            variant='h5'
            align='left'
            sx={{
              marginBottom: '50px',
            }}>
            STEP 4 - More Information
          </Typography>
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
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
                      value={true}
                      label={<Typography variant='body1'>Yes</Typography>}
                    />
                    <FormControlLabel
                      control={<Radio sx={{ml: 1}} />}
                      value={false}
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

              <Grid item md={6} xs={12}>
                <Typography sx={{ml: 2}} variant='p'>
                  How Did You Hear About Tafta
                </Typography>
                <Grid sx={{ml: 2}}>
                  <RadioGroup
                    name='source'
                    sx={{flexDirection: 'row'}}
                    value={formik.values.source}
                    onChange={e => {
                      if (e.target.value !== 'by_referral') {
                        formik.setFieldValue('referrer_fullName', '');
                        formik.setFieldValue('referrer_phoneNumber', '');
                      }
                      formik.handleChange(e);
                    }}>
                    <FormControlLabel
                      control={<Radio sx={{ml: 1}} />}
                      label={
                        <Typography variant='body1'>Social Media</Typography>
                      }
                      value='social_media'
                    />
                    <FormControlLabel
                      control={<Radio sx={{ml: 1}} />}
                      label={<Typography variant='body1'>Website</Typography>}
                      value='website'
                    />
                    <FormControlLabel
                      control={<Radio sx={{ml: 1}} />}
                      label={
                        <Typography variant='body1'>By referral</Typography>
                      }
                      value='by_referral'
                    />
                  </RadioGroup>
                </Grid>
              </Grid>
              <Grid item md={3} xs={12}>
                <TextField
                  fullWidth
                  label='Referrer Full Name'
                  name='fullName'
                  disabled={formik.values.source !== 'by_referral'}
                  required
                  value={formik.values.fullName}
                  onChange={formik.handleChange}
                />
              </Grid>

              <Grid item md={3} xs={12}>
                <TextField
                  fullWidth
                  label='Referrer Phone number'
                  name='phoneNumber'
                  disabled={formik.values.source !== 'by_referral'}
                  value={formik.values.phoneNumber}
                  onChange={formik.handleChange}
                />
              </Grid>
            </Grid>
            <Grid sx={{display: 'flex', flexDirection: 'row', pt: 2}}>
              <Button
                color='inherit'
                disabled={activeStep === 1}
                onClick={handleBack}
                sx={{mr: 1}}>
                Back
              </Button>
              <Grid sx={{flex: '1 1 auto'}} />
              {isStepOptional(activeStep) && (
                <Button color='inherit' onClick={handleSkip} sx={{mr: 1}}>
                  Skip
                </Button>
              )}
              <Button variant='contained' type='submit'>
                Continue
              </Button>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export const VerifyEmail = () => (
  <Box>
    <Card>
      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
        <Typography
          variant='h5'
          align='center'
          sx={{
            marginBottom: '50px',
            padding: '50px',
          }}>
          Dear Applicant, <br /> Thank you, your registration was successful,{' '}
          <br />
          <br /> However, you're not there yet.
          <br /> To complete your registration, Please check your email to
          verify your account.
        </Typography>
      </CardContent>
    </Card>
  </Box>
);

export const EndOfApplication = () => (
  <Box>
    <Card>
      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
        <Typography
          variant='h5'
          align='center'
          sx={{
            marginBottom: '50px',
            padding: '50px',
          }}>
          Dear User, you have come to the end of the application, for us to
          receive your application please click on SUBMIT, you can always review
          your application on your Dashboard before the application closes.
        </Typography>
      </CardContent>
    </Card>
  </Box>
);
