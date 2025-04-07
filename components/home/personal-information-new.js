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
  Checkbox,
} from '@mui/material';
import {useCreateEnrollmentMutation} from '../../services/api';
import {useRouter} from 'next/router';
import {useFormik} from 'formik';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';
import {Button as ButtonUI} from '@/components/ui/button';
import {Calendar} from '@/components/ui/calendar';
import {cn} from '@/lib/utils';
import {format} from 'date-fns';
import {CalendarIcon} from 'lucide-react';
import {Label} from '@/components/ui/label';

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

const cohortCourses = [
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
                    {cohortCourses.map(cohort_course => (
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

export const PersonalInformation = ({
  userId,
  applicant,
  handlers,
  state,
  ...other
}) => {
  const {activeStep, isStepOptional, handleNext, handleBack, handleSkip} =
    handlers;
  console.log(applicant);
  const [date, setDate] = useState('');
  const {editApplicant} = state;

  // Add useEffect to initialize date from form value when component mounts
  useEffect(() => {
    if (applicant?.profile?.dob) {
      try {
        const dateObj = new Date(applicant.profile.dob);
        if (!isNaN(dateObj.getTime())) {
          setDate(dateObj);
        }
      } catch (err) {
        console.error('Error parsing date:', err);
      }
    }
  }, [applicant]);

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
          _disability: applicant?.profile?.disability ? true : false,
          disability: applicant?.profile?.disability || '',
          source: applicant?.profile?.referrer ? 'by_referral' : '',
          referrer_fullName: applicant?.profile?.referrer?.fullName || '',
          referrer_phoneNumber: applicant?.profile?.referrer?.phoneNumber || '',
          employmentStatus: applicant?.profile?.employmentStatus || '',
          selfEmployedType: applicant?.profile?.selfEmployedType || '',
          residencyStatus: applicant?.profile?.residencyStatus || '',
          registrationMode: applicant.profile?.registrationMode || 'online',
          talpParticipation: applicant.profile?.talpParticipation === true,
          talpType: applicant.profile?.talpType || '',
          talpOther: applicant.profile?.talpOther || '',
          jobReadiness: applicant.profile?.jobReadiness || [],
          businessSupport: applicant.profile?.businessSupport || [],
          submit: null,
          dob: applicant.profile?.dob || '',
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
          _disability: false,
          disability: '',
          source: '',
          referrer_fullName: '',
          referrer_phoneNumber: '',
          employmentStatus: '',
          residencyStatus: '',
          selfEmployedType: '',
          registrationMode: 'online',
          talpParticipation: false,
          talpType: '',
          talpOther: '',
          jobReadiness: [],
          businessSupport: [],
          dob: '',
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
      residencyStatus: Yup.string().required('Residency Status is required'),
      selfEmployedType: Yup.string().when('employmentStatus', {
        is: 'self-employed',
        then: Yup.string().required('Self-Employed Type is required'),
      }),
      communityArea: Yup.string().required('Community Area is required'),
      ageRange: Yup.string().required('Age Range is required'),
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
          ...profile
        } = values;

        console.log(values);

        // Add disability back to profile if it's true
        if (_disability === true) {
          profile.disability = values.disability;
        }

        // Make sure all fields are included in the profile object
        profile.homeAddress = values.homeAddress;
        profile.LGADetails = values.LGADetails;
        profile.stateOfResidence = values.stateOfResidence;
        profile.communityArea = values.communityArea;
        profile.ageRange = values.ageRange;
        profile.gender = values.gender;
        profile.educationLevel = values.educationLevel;
        profile.phoneNumber = values.phoneNumber;
        profile.employmentStatus = values.employmentStatus;
        profile.selfEmployedType = values.selfEmployedType;
        profile.residencyStatus = values.residencyStatus;
        profile.registrationMode = values.registrationMode;
        profile.talpParticipation = values.talpParticipation;
        profile.talpType = values.talpType;
        profile.talpOther = values.talpOther;
        profile.jobReadiness = values.jobReadiness;
        profile.businessSupport = values.businessSupport;
        profile.dob = values.dob;

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
          .then(async (res) => {
            // Now create enrollment
            if (sessionStorage.getItem('selectedCourse')) {
              try {
                const courseId = sessionStorage.getItem('selectedCourse');
                const cohortId = sessionStorage.getItem('selectedCohortId');
                
                // Get course details from API or passed props
                const course = cohortCourses.find(c => c.id === courseId);
                
                if (course) {
                  const enrollmentBody = {
                    userCohortId: cohortId,
                    course_name: course.course.name,
                    course_id: parseInt(course.course.id),
                    user_email: values.email,
                  };
                  
                  const enrollmentResult = await createEnrollment({ body: enrollmentBody });
                  if (enrollmentResult.data?.message === 'Enrollment created') {
                    // Enrollment successful
                    console.log('Enrollment created successfully');
                  }
                }
              } catch (enrollError) {
                console.error('Enrollment creation error:', enrollError);
                // Consider whether to show this error to user
              }
            }
            
            // Continue to next step
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
                  required
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
                      name='LGADetails'
                    />
                  )}
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
                      value={formik.values._disability.toString()}
                      required
                      onChange={e => {
                        const value = e.target.value === 'true';
                        if (!value) {
                          formik.setFieldValue('disability', '');
                        }
                        formik.setFieldValue('_disability', value);
                      }}>
                      <FormControlLabel
                        control={<Radio sx={{ml: 1}} />}
                        value='true'
                        label={<Typography variant='body1'>Yes</Typography>}
                      />
                      <FormControlLabel
                        control={<Radio sx={{ml: 1}} />}
                        value='false'
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
                          disabled={formik.values._disability !== true}
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

              {/* Registration Mode - Learning Train vs Online */}
              <Grid item md={6} xs={12}>
                <Typography sx={{ml: 2}} variant='p'>
                  Registration Mode
                </Typography>
                <Grid sx={{ml: 2}}>
                  <RadioGroup
                    name='registrationMode'
                    sx={{flexDirection: 'row'}}
                    value={formik.values.registrationMode}
                    onChange={formik.handleChange}
                    required>
                    <FormControlLabel
                      control={<Radio sx={{ml: 1}} />}
                      label={<Typography variant='body1'>Online</Typography>}
                      value='online'
                    />
                    <FormControlLabel
                      control={<Radio sx={{ml: 1}} />}
                      label={
                        <Typography variant='body1'>Learning Train</Typography>
                      }
                      value='learning_train'
                    />
                  </RadioGroup>
                </Grid>
              </Grid>

              {/* TALP Participation */}
              <Grid item md={6} xs={12}>
                <Typography sx={{ml: 2}} variant='p'>
                  TALP Participation
                </Typography>
                <Grid sx={{ml: 2}}>
                  <RadioGroup
                    name='talpParticipation'
                    sx={{flexDirection: 'row'}}
                    value={formik.values.talpParticipation.toString()}
                    onChange={e => {
                      const value = e.target.value === 'true';
                      if (!value) {
                        formik.setFieldValue('talpType', '');
                        formik.setFieldValue('talpOther', '');
                      }
                      formik.setFieldValue('talpParticipation', value);
                    }}
                    required>
                    <FormControlLabel
                      control={<Radio sx={{ml: 1}} />}
                      value='true'
                      label={<Typography variant='body1'>Yes</Typography>}
                    />
                    <FormControlLabel
                      control={<Radio sx={{ml: 1}} />}
                      value='false'
                      label={<Typography variant='body1'>No</Typography>}
                    />
                  </RadioGroup>
                </Grid>
              </Grid>

              {/* TALP Type - Only shown if TALP participation is true */}
              {formik.values.talpParticipation === true && (
                <Grid item md={6} xs={12}>
                  <Typography sx={{ml: 2}} variant='p'>
                    TALP Type
                  </Typography>
                  <Grid sx={{ml: 2}}>
                    <RadioGroup
                      name='talpType'
                      sx={{flexDirection: 'column'}}
                      value={formik.values.talpType}
                      onChange={e => {
                        if (e.target.value !== 'other') {
                          formik.setFieldValue('talpOther', '');
                        }
                        formik.handleChange(e);
                      }}
                      required>
                      <FormControlLabel
                        control={<Radio sx={{ml: 1}} />}
                        label={<Typography variant='body1'>Film</Typography>}
                        value='film'
                      />
                      <FormControlLabel
                        control={<Radio sx={{ml: 1}} />}
                        label={<Typography variant='body1'>Theater</Typography>}
                        value='theater'
                      />
                      <FormControlLabel
                        control={<Radio sx={{ml: 1}} />}
                        label={<Typography variant='body1'>Content</Typography>}
                        value='content'
                      />
                      <FormControlLabel
                        control={<Radio sx={{ml: 1}} />}
                        label={<Typography variant='body1'>Other</Typography>}
                        value='other'
                      />
                    </RadioGroup>
                  </Grid>
                </Grid>
              )}

              {/* TALP Other - Only shown if TALP type is 'other' */}
              {formik.values.talpParticipation === true &&
                formik.values.talpType === 'other' && (
                  <Grid item md={6} xs={12}>
                    <TextField
                      error={Boolean(
                        formik.touched.talpOther && formik.errors.talpOther,
                      )}
                      fullWidth
                      helperText={
                        formik.touched.talpOther && formik.errors.talpOther
                      }
                      label='Please specify'
                      name='talpOther'
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      value={formik.values.talpOther}
                      required
                    />
                  </Grid>
                )}

              {/* Job Readiness Indicators */}
              <Grid item md={6} xs={12}>
                <Typography sx={{ml: 2}} variant='p'>
                  Job Readiness
                </Typography>
                <Grid sx={{ml: 2}}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formik.values.jobReadiness.includes(
                          'cv_reviewed',
                        )}
                        onChange={e => {
                          const newValues = e.target.checked
                            ? [...formik.values.jobReadiness, 'cv_reviewed']
                            : formik.values.jobReadiness.filter(
                                v => v !== 'cv_reviewed',
                              );
                          formik.setFieldValue('jobReadiness', newValues);
                        }}
                      />
                    }
                    label='CV Reviewed'
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formik.values.jobReadiness.includes(
                          'coaching_attended',
                        )}
                        onChange={e => {
                          const newValues = e.target.checked
                            ? [
                                ...formik.values.jobReadiness,
                                'coaching_attended',
                              ]
                            : formik.values.jobReadiness.filter(
                                v => v !== 'coaching_attended',
                              );
                          formik.setFieldValue('jobReadiness', newValues);
                        }}
                      />
                    }
                    label='Coaching Attended'
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formik.values.jobReadiness.includes(
                          'internship_placed',
                        )}
                        onChange={e => {
                          const newValues = e.target.checked
                            ? [
                                ...formik.values.jobReadiness,
                                'internship_placed',
                              ]
                            : formik.values.jobReadiness.filter(
                                v => v !== 'internship_placed',
                              );
                          formik.setFieldValue('jobReadiness', newValues);
                        }}
                      />
                    }
                    label='Internship Placed'
                  />
                </Grid>
              </Grid>

              {/* Business Support Options */}
              <Grid item md={6} xs={12}>
                <Typography sx={{ml: 2}} variant='p'>
                  Business Support
                </Typography>
                <Grid sx={{ml: 2}}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formik.values.businessSupport.includes(
                          'business_registered',
                        )}
                        onChange={e => {
                          const newValues = e.target.checked
                            ? [
                                ...formik.values.businessSupport,
                                'business_registered',
                              ]
                            : formik.values.businessSupport.filter(
                                v => v !== 'business_registered',
                              );
                          formik.setFieldValue('businessSupport', newValues);
                        }}
                      />
                    }
                    label='Business Registered'
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formik.values.businessSupport.includes(
                          'clinic_attended',
                        )}
                        onChange={e => {
                          const newValues = e.target.checked
                            ? [
                                ...formik.values.businessSupport,
                                'clinic_attended',
                              ]
                            : formik.values.businessSupport.filter(
                                v => v !== 'clinic_attended',
                              );
                          formik.setFieldValue('businessSupport', newValues);
                        }}
                      />
                    }
                    label='Business Clinic Attended'
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formik.values.businessSupport.includes(
                          'coaching_attended',
                        )}
                        onChange={e => {
                          const newValues = e.target.checked
                            ? [
                                ...formik.values.businessSupport,
                                'coaching_attended',
                              ]
                            : formik.values.businessSupport.filter(
                                v => v !== 'coaching_attended',
                              );
                          formik.setFieldValue('businessSupport', newValues);
                        }}
                      />
                    }
                    label='Business Coaching Attended'
                  />
                </Grid>
              </Grid>

              {/* Date of Birth */}
              <Grid item md={6} xs={12} className=''>
                <Label htmlFor='date-of-birth' className='mb-2'>
                  Date of Birth
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <ButtonUI
                      variant={'outline'}
                      className={cn(
                        'w-[240px] text-left font-normal flex justify-start',
                        !date && 'text-muted-foreground',
                      )}>
                      <CalendarIcon />
                      {date ? format(date, 'PPP') : <span>Pick a date</span>}
                    </ButtonUI>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      mode='single'
                      selected={date}
                      onSelect={newDate => {
                        setDate(newDate);
                        // Update formik's dob field when date is selected
                        formik.setFieldValue(
                          'dob',
                          newDate ? newDate.toISOString() : '',
                        );
                      }}
                      initialFocus
                      captionLayout='dropdown'
                      fromYear={new Date().getFullYear() - 100}
                      toYear={new Date().getFullYear()}
                    />
                  </PopoverContent>
                </Popover>
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
            <Grid container spacing={2}>
              <Grid container spacing={3}>
                <Grid item md={6} xs={12}>
                  <Typography sx={{ml: 2}} variant='p'>
                    Disabilities
                  </Typography>
                  <Grid sx={{ml: 2}}>
                    <RadioGroup
                      name='_disability'
                      sx={{flexDirection: 'column'}}
                      value={formik.values._disability.toString()}
                      required
                      onChange={e => {
                        const value = e.target.value === 'true';
                        if (!value) {
                          formik.setFieldValue('disability', '');
                        }
                        formik.setFieldValue('_disability', value);
                      }}>
                      <FormControlLabel
                        control={<Radio sx={{ml: 1}} />}
                        value='true'
                        label={<Typography variant='body1'>Yes</Typography>}
                      />
                      <FormControlLabel
                        control={<Radio sx={{ml: 1}} />}
                        value='false'
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
                          disabled={formik.values._disability !== true}
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

export const InitialCourseSelection = ({handlers, cohortCourses, ...other}) => {
  const {
    activeStep,
    isStepOptional,
    handleNext,
    handleBack,
    handleSkip,

    setActiveStep,
  } = handlers;
  const [registrationType, setRegistrationType] = useState('INDIVIDUAL');

  console.log('Course data:', cohortCourses);

  useEffect(() => {
    // Get registration type from previous step
    if (typeof window !== 'undefined') {
      const savedType = sessionStorage.getItem('registrationType');
      if (savedType) {
        setRegistrationType(savedType);
      }
    }
  }, []);

  const handleRegistrationTypeChange = event => {
    const type = event.target.value;
    setRegistrationType(type);
    sessionStorage.setItem('registrationType', type);
  };

  const formik = useFormik({
    initialValues: {
      enrollmentId: '',
    },
    validationSchema: Yup.object({
      enrollmentId: Yup.string().required('Course selection is required'),
    }),
    onSubmit: values => {
      sessionStorage.setItem('selectedCourse', values.enrollmentId);
      handleNext();
    },
  });

  // Extract course data
  const coursesData = cohortCourses?.map(course => course.course) || [];
  const hasCourses = coursesData.length > 0;

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
            Select Registration Type and Course
          </Typography>
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography sx={{ml: 2}} variant='p'>
                  Registration Type
                </Typography>
                <Grid sx={{ml: 2}}>
                  <RadioGroup
                    name='registrationType'
                    sx={{flexDirection: 'row'}}
                    value={registrationType}
                    onChange={handleRegistrationTypeChange}
                    required>
                    <FormControlLabel
                      control={<Radio sx={{ml: 1}} />}
                      label={
                        <Typography variant='body1'>Individual</Typography>
                      }
                      value='INDIVIDUAL'
                    />
                    <FormControlLabel
                      control={<Radio sx={{ml: 1}} />}
                      label={
                        <Typography variant='body1'>Enterprise</Typography>
                      }
                      value='ENTERPRISE'
                    />
                  </RadioGroup>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Typography sx={{ml: 2}} variant='p'>
                  Select Course
                </Typography>
                <Grid sx={{ml: 2}}>
                  {!hasCourses ? (
                    <Typography color='error' sx={{mt: 2, ml: 2}}>
                      No courses available. Please contact the administrator.
                    </Typography>
                  ) : (
                    <RadioGroup
                      name='enrollmentId'
                      sx={{flexDirection: 'column'}}
                      value={formik.values.enrollmentId}
                      onChange={formik.handleChange}>
                      {cohortCourses.map(cohort_course => (
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
                      ))}
                    </RadioGroup>
                  )}
                </Grid>
              </Grid>
            </Grid>
            <Grid sx={{display: 'flex', flexDirection: 'row', pt: 2}}>
              <Button
                color='inherit'
                disabled={activeStep === 0}
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
              <Button variant='contained' type='submit' disabled={!hasCourses}>
                Continue
              </Button>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export const CourseInformationNew = CourseInformation;
export const PersonalInformationNew = PersonalInformation;
export const EducationInformationNew = EducationInformation;
export const VerifyEmailNew = VerifyEmail;
export const MoreInformationNew = MoreInformation;
export const EndOfApplicationNew = EndOfApplication;
export const InitialCourseSelectionNew = InitialCourseSelection;
