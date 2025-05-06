import NextLink from 'next/link';
import {useRouter} from 'next/router';
import {useState, useEffect, useRef} from 'react';
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
  Rating,
  Autocomplete,
} from '@mui/material';
import {useCreateApplicantMutation} from '../../../services/api';
import {salary_ranges, revenue_ranges} from '../../../data/form-options';

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
    label: 'Self-employed',
    value: 'self-employed',
  },
  {
    label: 'Unemployed',
    value: 'unemployed',
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

export const self_employment_types = [
  { label: 'Entrepreneur', value: 'entrepreneur' },
  { label: 'Contractor', value: 'contractor' }
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
    Group4: ['Kabo', 'Kiru', 'Rimin Gado', 'Shanono'],
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

const user_disabilities = [
  {value: 'visual', label: 'Visual'},
  {value: 'hearing', label: 'Hearing'},
  {value: 'physical', label: 'Physical'},
  {value: 'cognitive', label: 'Cognitive'},
  {value: 'other', label: 'Other'},
  {
    label: 'Others',
    value: 'others',
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

const talp_types = [
  {
    label: 'TALP 1.0',
    value: 'TALP_1',
  },
  {
    label: 'TALP 2.0',
    value: 'TALP_2',
  },
  {
    label: 'TALP 3.0',
    value: 'TALP_3',
  },
  {
    label: 'Other',
    value: 'other',
  },
];

const job_readiness = [
  {
    label: 'Resume Writing',
    value: 'resume_writing',
  },
  {
    label: 'Interview Skills',
    value: 'interview_skills',
  },
  {
    label: 'Career Counseling',
    value: 'career_counseling',
  },
  {
    label: 'Job Search',
    value: 'job_search',
  },
];

const business_support = [
  {
    label: 'Business Plan Development',
    value: 'business_plan',
  },
  {
    label: 'Financial Management',
    value: 'financial_management',
  },
  {
    label: 'Marketing',
    value: 'marketing',
  },
  {
    label: 'Legal Support',
    value: 'legal_support',
  },
];

const assessmentCriteria = [
  {
    id: 'technical_skills',
    label: 'Technical Skills',
    description: 'Rate the applicant\'s technical skills and knowledge'
  },
  {
    id: 'communication_skills',
    label: 'Communication Skills',
    description: 'Rate the applicant\'s ability to communicate effectively'
  },
  {
    id: 'problem_solving',
    label: 'Problem Solving',
    description: 'Rate the applicant\'s problem-solving abilities'
  },
  {
    id: 'teamwork',
    label: 'Teamwork',
    description: 'Rate the applicant\'s ability to work in a team'
  },
  {
    id: 'adaptability',
    label: 'Adaptability',
    description: 'Rate the applicant\'s ability to adapt to new situations'
  },
  {
    id: 'leadership',
    label: 'Leadership',
    description: 'Rate the applicant\'s leadership potential'
  }
];

const ratingOptions = [
  { label: 'Poor', value: 'poor' },
  { label: 'Fair', value: 'fair' },
  { label: 'Good', value: 'good' },
  { label: 'Excellent', value: 'excellent' }
];

const satisfactionOptions = [
  { label: 'I do not know', value: 'unknown' },
  { label: 'Not satisfied', value: 'not_satisfied' },
  { label: 'Satisfied', value: 'satisfied' },
  { label: 'Very satisfied', value: 'very_satisfied' }
];

const skillRatingOptions = [
  { label: 'I have not done any work to know', value: 'no_work_done' },
  { label: 'My skill is sufficient', value: 'sufficient' },
  { label: 'My skill is insufficient', value: 'insufficient' },
  { label: 'I can compete in the creative sector with this level of skill', value: 'competitive' }
];

const incomeRangeOptions = [
  { label: 'Less than NGN 50,000', value: 'less_than_50k' },
  { label: 'Between NGN 50,000 and NGN 100,000', value: '50k_to_100k' },
  { label: 'Between NGN 101,000 and NGN 200,000', value: '101k_to_200k' },
  { label: 'Between NGN 201,000 and NGN 300,000', value: '201k_to_300k' },
  { label: 'Above NGN 300,000', value: 'above_300k' }
];

const employmentTypes = [
  { label: 'Freelancing', value: 'freelancing' },
  { label: '9-5', value: '9_to_5' },
  { label: 'Production', value: 'production' },
  { label: 'Business owner', value: 'business_owner' },
  { label: 'Others', value: 'others' }
];

const workTimeTypes = [
  { label: 'Full-Time', value: 'full_time' },
  { label: 'Part-Time', value: 'part_time' },
  { label: 'Internship', value: 'internship' },
  { label: 'Contract', value: 'contract' }
];

const booleanOptions = [
  { label: 'Yes', value: 'true' },
  { label: 'No', value: 'false' }
];

const initialValues = {
  applicantType: 'individual',
  courseId: '',
  cohortId: '',
      firstName: '',
      lastName: '',
  email: '',
      phoneNumber: '',
  gender: '',
      ageRange: '',
  stateOfResidence: '',
  lga: '',
  homeAddress: '',
      communityArea: '',
  educationLevel: '',
      employmentStatus: '',
      employmentSector: '',
  selfEmployedType: '',
  salaryRange: '',
  disabilityStatus: false,
  disabilityType: '',
  talpParticipation: false,
  talpProgram: '',
  jobReadiness: [],
  businessType: '',
      businessSize: '',
      businessSector: '',
      businessPartners: '',
      companyPhoneNumber: '',
      additionalPhoneNumber: '',
      companyEmail: '',
      revenueRange: '',
  businessSupport: [],
  assessment: {
    courseOfStudy: '',
    enrollmentStatus: '',
    hadJobBeforeAdmission: '',
    employmentStatus: '',
    employmentType: '',
    workTimeType: '',
    employedInCreativeSector: '',
    creativeJobNature: '',
    nonCreativeJobInfo: '',
    yearsOfExperienceCreative: '',
    satisfactionLevel: '',
    skillRating: '',
    monthlyIncome: '',
    hasReliableIncome: '',
    earningMeetsNeeds: '',
    workIsDecentAndGood: '',
    jobGivesPurpose: '',
    feelRespectedAtWork: '',
    lmsPlatformRating: '',
    taftaPreparationRating: '',
    preparationFeedback: '',
    qualityOfInteractionRating: '',
    trainingMaterialsRating: '',
    topicSequencingRating: '',
    facilitatorsResponseRating: '',
    wouldRecommendTafta: '',
    improvementSuggestions: '',
    mostStrikingFeature: '',
    turnOffs: '',
    practicalClassChallenges: '',
    onlineClassChallenges: '',
    completionMotivation: ''
  }
};

const validationSchema = Yup.object().shape({
  applicantType: Yup.string().required('Applicant type is required'),
  courseId: Yup.string().required('Course is required'),
  cohortId: Yup.string().required('Cohort is required'),
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phoneNumber: Yup.string().required('Phone number is required'),
  gender: Yup.string().required('Gender is required'),
  ageRange: Yup.string().required('Age range is required'),
  stateOfResidence: Yup.string().required('State of residence is required'),
  lga: Yup.string().required('LGA is required'),
  homeAddress: Yup.string().required('Home address is required'),
  communityArea: Yup.string().required('Community area is required'),
  educationLevel: Yup.string().required('Education level is required'),
  employmentStatus: Yup.string().required('Employment status is required'),
      employmentSector: Yup.string().when('employmentStatus', {
    is: (val) => val === 'employed',
    then: (schema) => schema.required('Employment sector is required')
  }),
  selfEmployedType: Yup.string().when('employmentStatus', {
    is: (val) => val === 'self-employed',
    then: (schema) => schema.required('Self-employment type is required')
  }),
  disabilityType: Yup.string().when('disabilityStatus', {
    is: true,
    then: (schema) => schema.required('Disability type is required')
  }),
  talpProgram: Yup.string().when('talpParticipation', {
    is: true,
    then: (schema) => schema.required('TALP program is required')
  }),
  jobReadiness: Yup.array().when('employmentStatus', {
    is: (val) => val === 'unemployed',
    then: (schema) => schema.min(1, 'At least one job readiness support is required')
  }),
  businessType: Yup.string().when('applicantType', {
    is: 'enterprise',
    then: (schema) => schema.required('Business type is required')
  }),
  businessSize: Yup.string().when('applicantType', {
    is: 'enterprise',
    then: (schema) => schema.required('Business size is required')
  }),
  businessSector: Yup.string().when('applicantType', {
    is: 'enterprise',
    then: (schema) => schema.required('Business sector is required')
  }),
  businessSupport: Yup.array().when('applicantType', {
    is: 'enterprise',
    then: (schema) => schema.min(1, 'At least one business support is required')
  }),
  assessment: Yup.object().shape({
    courseOfStudy: Yup.string().required('Course of study is required'),
    enrollmentStatus: Yup.string(),
    hadJobBeforeAdmission: Yup.string().required('Employment background is required'),
    employmentStatus: Yup.string().required('Employment status is required'),
    employmentType: Yup.string().when('employmentStatus', {
      is: (val) => val === 'employed',
      then: (schema) => schema.required('Employment type is required')
    }),
    workTimeType: Yup.string().when('employmentStatus', {
      is: (val) => val === 'employed',
      then: (schema) => schema.required('Work time type is required')
    }),
    employedInCreativeSector: Yup.string().required('Creative sector employment status is required'),
    creativeJobNature: Yup.string().when('employedInCreativeSector', {
      is: 'true',
      then: (schema) => schema.required('Creative job nature is required')
    }),
    nonCreativeJobInfo: Yup.string().when('employedInCreativeSector', {
      is: 'false',
      then: (schema) => schema.required('Non-creative job information is required')
    }),
    yearsOfExperienceCreative: Yup.string().required('Years of experience is required'),
    satisfactionLevel: Yup.string().required('Satisfaction level is required'),
    skillRating: Yup.string().required('Skill rating is required'),
    monthlyIncome: Yup.string().required('Monthly income is required'),
    hasReliableIncome: Yup.string().required('Reliable income status is required'),
    earningMeetsNeeds: Yup.string().required('Earning meets needs status is required'),
    workIsDecentAndGood: Yup.string().required('Work quality status is required'),
    jobGivesPurpose: Yup.string().required('Job purpose status is required'),
    feelRespectedAtWork: Yup.string().required('Work respect status is required'),
    lmsPlatformRating: Yup.string().required('LMS platform rating is required'),
    taftaPreparationRating: Yup.string().required('TAFTA preparation rating is required'),
    preparationFeedback: Yup.string().required('Preparation feedback is required'),
    qualityOfInteractionRating: Yup.string().required('Quality of interaction rating is required'),
    trainingMaterialsRating: Yup.string().required('Training materials rating is required'),
    topicSequencingRating: Yup.string().required('Topic sequencing rating is required'),
    facilitatorsResponseRating: Yup.string().required('Facilitators response rating is required'),
    wouldRecommendTafta: Yup.string().required('Recommendation status is required'),
    improvementSuggestions: Yup.string().required('Improvement suggestions are required'),
    mostStrikingFeature: Yup.string().required('Most striking feature is required'),
    turnOffs: Yup.string().required('Turn-offs are required'),
    practicalClassChallenges: Yup.string().required('Practical class challenges are required'),
    onlineClassChallenges: Yup.string().required('Online class challenges are required'),
    completionMotivation: Yup.string().required('Completion motivation is required')
  })
});

export const ApplicantCreateForm = ({...other}) => {
  const [createApplicant, result] = useCreateApplicantMutation();
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [cohorts, setCohorts] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableLGAs, setAvailableLGAs] = useState([]);
  const selectedCohortId = useRef('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch active cohorts
  useEffect(() => {
    const fetchCohorts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const cohortsRes = await fetch('/api/cohorts/active');
        if (!cohortsRes.ok) throw new Error('Failed to fetch cohorts');
        const cohortsData = await cohortsRes.json();
        setCohorts(cohortsData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        toast.error('Failed to load form data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCohorts();
  }, []);

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values, helpers) => {
      if (isSubmitting) return;
      setIsSubmitting(true);
      
      try {
        // Prepare profile data
        const profile = {
          type: values.applicantType,
          registrationMode: values.registrationMode,
          phoneNumber: values.phoneNumber,
          gender: values.gender,
          ageRange: values.ageRange,
          homeAddress: values.homeAddress,
          stateOfResidence: values.stateOfResidence,
          LGADetails: values.lga,
          communityArea: values.communityArea,
          educationLevel: values.educationLevel,
          employmentStatus: values.employmentStatus,
          employmentSector: values.employmentStatus === 'employed' ? values.employmentSector : null,
          selfEmployedType: values.employmentStatus === 'self-employed' ? values.selfEmployedType : null,
          residencyStatus: values.residencyStatus,
          disability: values.disabilityStatus ? values.disabilityType : null,
          talpParticipation: values.talpParticipation,
          talpType: values.talpParticipation ? values.talpProgram : null,
          talpOther: values.talpParticipation && values.talpProgram === 'other' ? values.talpOther : null,
          jobReadiness: values.jobReadiness,
          businessSupport: values.businessSupport,
        };

        // Add enterprise specific data if type is ENTERPRISE
        if (values.applicantType === 'ENTERPRISE') {
          profile.businessType = values.businessType;
          profile.businessSize = values.businessSize;
          profile.businessSector = values.businessSector;
          profile.businessPartners = values.businessPartners;
          profile.companyPhoneNumber = values.companyPhoneNumber;
          profile.additionalPhoneNumber = values.additionalPhoneNumber;
          profile.companyEmail = values.companyEmail;
          profile.revenueRange = values.revenueRange;
        }

        // Make API request to create applicant
        const response = await createApplicant({
          body: {
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            password: values.password,
            type: values.applicantType,
            cohortId: values.cohortId,
            selectedCourseId: values.courseId,
            selectedCourseName: values.selectedCourseName,
            profile,
            skipVerification: true,
            autoEnroll: true,
          },
        }).unwrap();

        if (response) {
          helpers.setStatus({ success: true });
          helpers.setSubmitting(false);
          toast.success('Applicant Created and Enrolled Successfully!');
          router.replace({ pathname: '/admin-dashboard/applicants/' });
        }
      } catch (err) {
        console.error('Form submission error:', err);
        toast.error(err.data?.message || 'Something went wrong!');
        helpers.setStatus({ success: false });
        helpers.setErrors({ submit: err.message });
        helpers.setSubmitting(false);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Fetch courses when cohort changes
  useEffect(() => {
    const fetchCourses = async () => {
      const cohortId = formik.values.cohortId;
      if (!cohortId || cohortId === selectedCohortId.current) return;
      
      selectedCohortId.current = cohortId;
      setIsLoading(true);
      setError(null);
      try {
        const coursesRes = await fetch(`/api/cohort/${cohortId}/courses`);
        if (!coursesRes.ok) throw new Error('Failed to fetch cohort courses');
        const cohortCoursesData = await coursesRes.json();
        // Transform the data to match the expected format
        const transformedCourses = cohortCoursesData.cohortCourses.map(cohortCourse => ({
          id: cohortCourse.id,
          name: cohortCourse.course.name,
          slug: cohortCourse.course.slug,
          courseId: cohortCourse.course.id
        }));
        setCourses(transformedCourses);
      } catch (err) {
        console.error('Error fetching cohort courses:', err);
        setError(err.message);
        toast.error('Failed to load cohort courses. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [formik.values.cohortId]);

  // Update available LGAs when state changes
  useEffect(() => {
    if (formik.values.stateOfResidence) {
      const selectedState = formik.values.stateOfResidence;
      // Combine LGAs from all groups for the selected state
      const allLGAs = Object.values(LGAs[selectedState]).flat();
      setAvailableLGAs(allLGAs);
    }
  }, [formik.values.stateOfResidence]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Update tab value when type changes
  useEffect(() => {
    if (formik.values.applicantType === 'INDIVIDUAL') {
      setTabValue(0);
    } else {
      setTabValue(1);
    }
  }, [formik.values.applicantType]);

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
                onClick={() => formik.setFieldValue('applicantType', 'INDIVIDUAL')}
              />
              <Tab
                label='Enterprise'
                onClick={() => formik.setFieldValue('applicantType', 'ENTERPRISE')}
              />
            </Tabs>
          </Box>

          <Grid container spacing={3}>
            {/* Course and Cohort Selection */}
            <Grid item xs={12}>
              <Typography variant='h6' sx={{mb: 2}}>
                Course and Cohort Selection
              </Typography>
            </Grid>

            <Grid item md={6} xs={12}>
              <TextField
                error={Boolean(formik.touched.cohortId && formik.errors.cohortId)}
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
                error={Boolean(formik.touched.courseId && formik.errors.courseId)}
                fullWidth
                select
                helperText={formik.touched.courseId && formik.errors.courseId}
                label='Course'
                name='courseId'
                onBlur={formik.handleBlur}
                onChange={(e) => {
                  const course = courses?.find(c => c.id === e.target.value);
                  if (course) {
                    formik.setFieldValue('courseId', e.target.value);
                    formik.setFieldValue('selectedCourseName', course.name);
                  }
                }}
                required
                value={formik.values.courseId}
                disabled={isLoading}>
                {isLoading ? (
                  <MenuItem value="">Loading courses...</MenuItem>
                ) : error ? (
                  <MenuItem value="">Error loading courses</MenuItem>
                ) : !courses || courses.length === 0 ? (
                  <MenuItem value="">No courses available for this cohort</MenuItem>
                ) : (
                  courses.map((course) => (
                    <MenuItem key={course.id} value={course.id}>
                      {course.name}
                    </MenuItem>
                  ))
                )}
              </TextField>
            </Grid>

            {/* Personal Information Form */}
            {tabValue === 0 && (
              <Box sx={{ mt: 3 }}>
                <Card>
                  <CardHeader title="Individual Registration" />
                  <Divider />
                  <CardContent>
                    <Grid container spacing={3}>
                      {/* Personal Information */}
                      <Grid item xs={12}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Personal Information
                        </Typography>
                      </Grid>

            <Grid item md={6} xs={12}>
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

            <Grid item md={6} xs={12}>
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

            <Grid item md={6} xs={12}>
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

            <Grid item md={6} xs={12}>
              <TextField
                          error={Boolean(formik.touched.phoneNumber && formik.errors.phoneNumber)}
                fullWidth
                          helperText={formik.touched.phoneNumber && formik.errors.phoneNumber}
                          label="Phone Number"
                          name="phoneNumber"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                required
                          value={formik.values.phoneNumber}
                        />
            </Grid>

            <Grid item md={6} xs={12}>
              <TextField
                          error={Boolean(formik.touched.gender && formik.errors.gender)}
                fullWidth
                select
                          helperText={formik.touched.gender && formik.errors.gender}
                          label="Gender"
                          name="gender"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                required
                          value={formik.values.gender}
                        >
                          {genderList.map((gender) => (
                            <MenuItem key={gender} value={gender}>
                              {gender}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item md={6} xs={12}>
              <TextField
                          error={Boolean(formik.touched.ageRange && formik.errors.ageRange)}
                fullWidth
                select
                          helperText={formik.touched.ageRange && formik.errors.ageRange}
                          label="Age Range"
                          name="ageRange"
                onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                required
                          value={formik.values.ageRange}
                        >
                          {ranges.map((range) => (
                            <MenuItem key={range.join('-')} value={range.join('-')}>
                              {range.join('-')}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Location Information */}
            <Grid item xs={12}>
                        <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>
                Location Information
              </Typography>
            </Grid>

            <Grid item md={6} xs={12}>
                        <Autocomplete
                          getOptionLabel={option => option || ''}
                          options={nigeria_states}
                          value={formik.values.stateOfResidence || null}
                          onChange={(event, newValue) => {
                            formik.setFieldValue('stateOfResidence', newValue);
                            formik.setFieldValue('lga', ''); // Clear LGA when state changes
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
                              label="State of Residence"
                              name="stateOfResidence"
                              required
                            />
                          )}
              />
            </Grid>

            <Grid item md={6} xs={12}>
                        <Autocomplete
                          getOptionLabel={option => option || ''}
                          options={availableLGAs}
                          value={formik.values.lga || null}
                          onChange={(event, newValue) => {
                            formik.setFieldValue('lga', newValue);
                          }}
                          disabled={!formik.values.stateOfResidence}
                          renderInput={params => (
              <TextField
                              {...params}
                error={Boolean(
                                formik.touched.lga && formik.errors.lga,
                )}
                fullWidth
                              helperText={
                                formik.touched.lga && formik.errors.lga
                              }
                              label="LGA Details"
                              name="lga"
                              required
                            />
                          )}
              />
            </Grid>

            <Grid item md={6} xs={12}>
              <TextField
                          error={Boolean(formik.touched.homeAddress && formik.errors.homeAddress)}
                fullWidth
                          helperText={formik.touched.homeAddress && formik.errors.homeAddress}
                          label="Home Address"
                          name="homeAddress"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                          required
                value={formik.values.homeAddress}
              />
            </Grid>

                      <Grid item md={6} xs={12}>
                        <TextField
                          error={Boolean(formik.touched.communityArea && formik.errors.communityArea)}
                          fullWidth
                          select
                          helperText={formik.touched.communityArea && formik.errors.communityArea}
                          label="Community Area"
                          name="communityArea"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          required
                          value={formik.values.communityArea}
                        >
                          {communityAreas.map((area) => (
                            <MenuItem key={area} value={area}>
                              {area}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>

                      {/* Education & Employment Information */}
            <Grid item xs={12}>
                        <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>
                          Education & Employment Information
              </Typography>
            </Grid>

            <Grid item md={6} xs={12}>
              <TextField
                          error={Boolean(formik.touched.educationLevel && formik.errors.educationLevel)}
                fullWidth
                select
                          helperText={formik.touched.educationLevel && formik.errors.educationLevel}
                          label="Education Level"
                          name="educationLevel"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                          required
                          value={formik.values.educationLevel}
                        >
                          {levels_of_education.map((level) => (
                            <MenuItem key={level.value} value={level.value}>
                              {level.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item md={6} xs={12}>
              <TextField
                          error={Boolean(formik.touched.employmentStatus && formik.errors.employmentStatus)}
                fullWidth
                select
                          helperText={formik.touched.employmentStatus && formik.errors.employmentStatus}
                          label="Employment Status"
                          name="employmentStatus"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                          required
                          value={formik.values.employmentStatus}
                        >
                          {employment_status.map((status) => (
                            <MenuItem key={status.value} value={status.value}>
                              {status.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

                      {formik.values.employmentStatus === 'employed' && (
                        <>
            <Grid item md={6} xs={12}>
              <TextField
                              error={Boolean(formik.touched.employmentSector && formik.errors.employmentSector)}
                fullWidth
                select
                              helperText={formik.touched.employmentSector && formik.errors.employmentSector}
                              label="Employment Sector"
                              name="employmentSector"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                              required
                              value={formik.values.employmentSector}
                            >
                              {employment_sectors.map((sector) => (
                                <MenuItem key={sector} value={sector}>
                                  {sector}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                              error={Boolean(formik.touched.salaryRange && formik.errors.salaryRange)}
                fullWidth
                select
                              helperText={formik.touched.salaryRange && formik.errors.salaryRange}
                              label="Salary Range"
                              name="salaryRange"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                              value={formik.values.salaryRange}
                            >
                              {salary_ranges.map((range) => (
                                <MenuItem key={range.value} value={range.value}>
                                  {range.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
                        </>
                      )}

                      {formik.values.employmentStatus === 'self-employed' && (
            <Grid item md={6} xs={12}>
              <TextField
                            error={Boolean(formik.touched.selfEmployedType && formik.errors.selfEmployedType)}
                fullWidth
                select
                            helperText={formik.touched.selfEmployedType && formik.errors.selfEmployedType}
                            label="Self-Employed Type"
                            name="selfEmployedType"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                            required
                            value={formik.values.selfEmployedType}
                          >
                            {self_employment_types.map((type) => (
                              <MenuItem key={type.value} value={type.value}>
                                {type.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
                      )}

                      {/* Disability & Residency Information */}
                      <Grid item xs={12}>
                        <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>
                          Disability & Residency Information
                        </Typography>
                      </Grid>

                      <Grid item md={6} xs={12}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={formik.values.disabilityStatus}
                              onChange={(e) => {
                                formik.setFieldValue('disabilityStatus', e.target.checked);
                                if (!e.target.checked) {
                                  formik.setFieldValue('disabilityType', '');
                                }
                              }}
                              name="disabilityStatus"
                            />
                          }
                          label="Do you have a disability?"
                        />
                      </Grid>

                      {formik.values.disabilityStatus && (
              <Grid item md={6} xs={12}>
                <TextField
                            error={Boolean(formik.touched.disabilityType && formik.errors.disabilityType)}
                  fullWidth
                  select
                            helperText={formik.touched.disabilityType && formik.errors.disabilityType}
                            label="Disability Type"
                            name="disabilityType"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  required
                            value={formik.values.disabilityType}
                          >
                            {user_disabilities.map((disability) => (
                              <MenuItem key={disability.value} value={disability.value}>
                                {disability.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}

                      <Grid item md={6} xs={12}>
                        <TextField
                          error={Boolean(formik.touched.residencyStatus && formik.errors.residencyStatus)}
                          fullWidth
                          select
                          helperText={formik.touched.residencyStatus && formik.errors.residencyStatus}
                          label="Residency Status"
                          name="residencyStatus"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          required
                          value={formik.values.residencyStatus}
                        >
                          {residency_status.map((status) => (
                            <MenuItem key={status.value} value={status.value}>
                              {status.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>

                      {/* TALP & Job Readiness Information */}
                <Grid item xs={12}>
                        <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>
                          TALP & Job Readiness Information
                  </Typography>
                </Grid>

                      <Grid item md={6} xs={12}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={formik.values.talpParticipation}
                              onChange={(e) => {
                                formik.setFieldValue('talpParticipation', e.target.checked);
                                if (!e.target.checked) {
                                  formik.setFieldValue('talpProgram', '');
                                  formik.setFieldValue('talpOther', '');
                                }
                              }}
                              name="talpParticipation"
                            />
                          }
                          label="Have you participated in TALP?"
                        />
                      </Grid>

                      {formik.values.talpParticipation && (
                        <>
                <Grid item md={6} xs={12}>
                  <TextField
                              error={Boolean(formik.touched.talpProgram && formik.errors.talpProgram)}
                    fullWidth
                              select
                              helperText={formik.touched.talpProgram && formik.errors.talpProgram}
                              label="TALP Program"
                              name="talpProgram"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    required
                              value={formik.values.talpProgram}
                            >
                              {talp_types.map((type) => (
                                <MenuItem key={type.value} value={type.value}>
                                  {type.label}
                                </MenuItem>
                              ))}
                            </TextField>
                          </Grid>

                          {formik.values.talpProgram === 'other' && (
                            <Grid item md={6} xs={12}>
                              <TextField
                                error={Boolean(formik.touched.talpOther && formik.errors.talpOther)}
                                fullWidth
                                helperText={formik.touched.talpOther && formik.errors.talpOther}
                                label="Specify TALP Program"
                                name="talpOther"
                                onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                                required
                                value={formik.values.talpOther}
                              />
                            </Grid>
                          )}
                        </>
                      )}

                      {formik.values.employmentStatus === 'unemployed' && (
                        <Grid item xs={12}>
                          <Autocomplete
                            multiple
                            options={job_readiness}
                            getOptionLabel={(option) => option.label}
                            value={job_readiness.filter(option => 
                              formik.values.jobReadiness.includes(option.value)
                            )}
                            onChange={(event, newValue) => {
                              formik.setFieldValue(
                                'jobReadiness',
                                newValue.map(option => option.value)
                              );
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                error={Boolean(formik.touched.jobReadiness && formik.errors.jobReadiness)}
                                helperText={formik.touched.jobReadiness && formik.errors.jobReadiness}
                                label="Job Readiness Support Needed"
                                required
                              />
                            )}
                          />
                        </Grid>
                      )}

                      {formik.values.applicantType === 'ENTERPRISE' && (
                        <Grid item xs={12}>
                          <Autocomplete
                            multiple
                            options={business_support}
                            getOptionLabel={(option) => option.label}
                            value={business_support.filter(option => 
                              formik.values.businessSupport.includes(option.value)
                            )}
                            onChange={(event, newValue) => {
                              formik.setFieldValue(
                                'businessSupport',
                                newValue.map(option => option.value)
                              );
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                error={Boolean(formik.touched.businessSupport && formik.errors.businessSupport)}
                                helperText={formik.touched.businessSupport && formik.errors.businessSupport}
                                label="Business Support Needed"
                                required
                              />
                            )}
                          />
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              </Box>
            )}

            {/* Enterprise Information */}
            {formik.values.applicantType === 'ENTERPRISE' && (
              <>
                <Grid item xs={12}>
                  <Typography variant='h6' sx={{mb: 2, mt: 2}}>
                    Enterprise Information
                  </Typography>
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
                    select
                    helperText={
                      formik.touched.revenueRange && formik.errors.revenueRange
                    }
                    label='Revenue Range'
                    name='revenueRange'
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.revenueRange}>
                    {revenue_ranges.map((range) => (
                      <MenuItem key={range.value} value={range.value}>
                        {range.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {formik.values.employmentStatus === 'employed' && (
                <Grid item md={6} xs={12}>
                  <TextField
                    error={Boolean(
                        formik.touched.salaryRange && formik.errors.salaryRange,
                    )}
                    fullWidth
                    select
                    helperText={
                        formik.touched.salaryRange && formik.errors.salaryRange
                    }
                      label='Salary Range'
                      name='salaryRange'
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                      value={formik.values.salaryRange}>
                      {salary_ranges.map((range) => (
                        <MenuItem key={range.value} value={range.value}>
                          {range.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                )}
              </>
            )}

            {/* Assessment */}
            {tabValue === 2 && (
              <Box sx={{ mt: 3 }}>
                <Card>
                  <CardHeader title="Applicant Assessment" />
                  <Divider />
                  <CardContent>
                    <Grid container spacing={3}>
                      {/* Course Information */}
                      <Grid item xs={12}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Course Information
                        </Typography>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          select
                          fullWidth
                          label="Course of Study"
                          name="assessment.courseOfStudy"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          required
                          value={formik.values.assessment.courseOfStudy}
                          error={Boolean(
                            formik.touched.assessment?.courseOfStudy &&
                            formik.errors.assessment?.courseOfStudy
                          )}
                          helperText={
                            formik.touched.assessment?.courseOfStudy &&
                            formik.errors.assessment?.courseOfStudy
                          }
                        >
                          {courses.map((course) => (
                            <MenuItem key={course.id} value={course.name}>
                              {course.name}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>

                      {/* Employment Background */}
                      <Grid item xs={12}>
                        <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>
                          Employment Background
                        </Typography>
                      </Grid>

                      <Grid item xs={12}>
                        <FormControl component="fieldset">
                          <FormLabel component="legend">Did you have a job before admission?</FormLabel>
                          <RadioGroup
                            row
                            name="assessment.hadJobBeforeAdmission"
                            value={formik.values.assessment.hadJobBeforeAdmission || ''}
                            onChange={formik.handleChange}
                          >
                            {booleanOptions.map((option) => (
                              <FormControlLabel
                                key={option.value}
                                value={option.value}
                                control={<Radio />}
                                label={option.label}
                              />
                            ))}
                          </RadioGroup>
                        </FormControl>
                      </Grid>

                      {/* Current Employment */}
                      <Grid item xs={12}>
                        <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>
                          Current Employment
                        </Typography>
                      </Grid>

                      <Grid item md={6} xs={12}>
                        <TextField
                          select
                          fullWidth
                          label="Employment Status"
                          name="assessment.employmentStatus"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.assessment.employmentStatus || ''}
                          error={Boolean(
                            formik.touched.assessment?.employmentStatus &&
                            formik.errors.assessment?.employmentStatus
                          )}
                          helperText={
                            formik.touched.assessment?.employmentStatus &&
                            formik.errors.assessment?.employmentStatus
                          }
                        >
                          {employmentTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                      <Grid item md={6} xs={12}>
                        <TextField
                          select
                          fullWidth
                          label="Work Time Type"
                          name="assessment.workTimeType"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.assessment.workTimeType || ''}
                          error={Boolean(
                            formik.touched.assessment?.workTimeType &&
                            formik.errors.assessment?.workTimeType
                          )}
                          helperText={
                            formik.touched.assessment?.workTimeType &&
                            formik.errors.assessment?.workTimeType
                          }
                        >
                          {workTimeTypes.map((type) => (
                            <MenuItem key={type.value} value={type.value}>
                              {type.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>

                      {/* Creative Sector Employment */}
                      <Grid item xs={12}>
                        <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>
                          Creative Sector Employment
                        </Typography>
                      </Grid>

                      <Grid item xs={12}>
                        <FormControl component="fieldset">
                          <FormLabel component="legend">Are you employed in the creative sector?</FormLabel>
                          <RadioGroup
                            row
                            name="assessment.employedInCreativeSector"
                            value={formik.values.assessment.employedInCreativeSector || ''}
                            onChange={formik.handleChange}
                          >
                            {booleanOptions.map((option) => (
                              <FormControlLabel
                                key={option.value}
                                value={option.value}
                                control={<Radio />}
                                label={option.label}
                              />
                            ))}
                          </RadioGroup>
                        </FormControl>
                      </Grid>

                      {formik.values.assessment.employedInCreativeSector === 'true' && (
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Nature of Creative Job"
                            name="assessment.creativeJobNature"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.assessment.creativeJobNature || ''}
                            error={Boolean(
                              formik.touched.assessment?.creativeJobNature &&
                              formik.errors.assessment?.creativeJobNature
                            )}
                            helperText={
                              formik.touched.assessment?.creativeJobNature &&
                              formik.errors.assessment?.creativeJobNature
                            }
                          />
                        </Grid>
                      )}

                      {formik.values.assessment.employedInCreativeSector === 'false' && (
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Non-Creative Job Information"
                            name="assessment.nonCreativeJobInfo"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.assessment.nonCreativeJobInfo || ''}
                            error={Boolean(
                              formik.touched.assessment?.nonCreativeJobInfo &&
                              formik.errors.assessment?.nonCreativeJobInfo
                            )}
                            helperText={
                              formik.touched.assessment?.nonCreativeJobInfo &&
                              formik.errors.assessment?.nonCreativeJobInfo
                            }
                          />
                        </Grid>
                      )}

                      {/* Experience and Skills */}
                      <Grid item xs={12}>
                        <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>
                          Experience and Skills
                        </Typography>
                      </Grid>

                      <Grid item md={6} xs={12}>
                        <TextField
                          select
                          fullWidth
                          label="Years of Experience in Creative Sector"
                          name="assessment.yearsOfExperienceCreative"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.assessment.yearsOfExperienceCreative || ''}
                          error={Boolean(
                            formik.touched.assessment?.yearsOfExperienceCreative &&
                            formik.errors.assessment?.yearsOfExperienceCreative
                          )}
                          helperText={
                            formik.touched.assessment?.yearsOfExperienceCreative &&
                            formik.errors.assessment?.yearsOfExperienceCreative
                          }
                        >
                          {ranges.map((range) => (
                            <MenuItem key={range.join('-')} value={range.join('-')}>
                              {range.join('-')} years
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>

                      <Grid item md={6} xs={12}>
                        <TextField
                          select
                          fullWidth
                          label="Satisfaction Level"
                          name="assessment.satisfactionLevel"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.assessment.satisfactionLevel || ''}
                          error={Boolean(
                            formik.touched.assessment?.satisfactionLevel &&
                            formik.errors.assessment?.satisfactionLevel
                          )}
                          helperText={
                            formik.touched.assessment?.satisfactionLevel &&
                            formik.errors.assessment?.satisfactionLevel
                          }
                        >
                          {satisfactionOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          select
                          fullWidth
                          label="Skill Rating"
                          name="assessment.skillRating"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.assessment.skillRating || ''}
                          error={Boolean(
                            formik.touched.assessment?.skillRating &&
                            formik.errors.assessment?.skillRating
                          )}
                          helperText={
                            formik.touched.assessment?.skillRating &&
                            formik.errors.assessment?.skillRating
                          }
                        >
                          {skillRatingOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>

                      {/* Income and Job Satisfaction */}
                      <Grid item xs={12}>
                        <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>
                          Income and Job Satisfaction
                        </Typography>
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          select
                          fullWidth
                          label="Monthly Income"
                          name="assessment.monthlyIncome"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.assessment.monthlyIncome || ''}
                          error={Boolean(
                            formik.touched.assessment?.monthlyIncome &&
                            formik.errors.assessment?.monthlyIncome
                          )}
                          helperText={
                            formik.touched.assessment?.monthlyIncome &&
                            formik.errors.assessment?.monthlyIncome
                          }
                        >
                          {incomeRangeOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>

                      <Grid item xs={12}>
                        <FormControl component="fieldset">
                          <FormLabel component="legend">Do you have a reliable income?</FormLabel>
                          <RadioGroup
                            row
                            name="assessment.hasReliableIncome"
                            value={formik.values.assessment.hasReliableIncome || ''}
                            onChange={formik.handleChange}
                          >
                            {booleanOptions.map((option) => (
                              <FormControlLabel
                                key={option.value}
                                value={option.value}
                                control={<Radio />}
                                label={option.label}
                              />
                            ))}
                          </RadioGroup>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12}>
                        <FormControl component="fieldset">
                          <FormLabel component="legend">Does your current earning meet your basic needs?</FormLabel>
                          <RadioGroup
                            row
                            name="assessment.earningMeetsNeeds"
                            value={formik.values.assessment.earningMeetsNeeds || ''}
                            onChange={formik.handleChange}
                          >
                            {booleanOptions.map((option) => (
                              <FormControlLabel
                                key={option.value}
                                value={option.value}
                                control={<Radio />}
                                label={option.label}
                              />
                            ))}
                          </RadioGroup>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12}>
                        <FormControl component="fieldset">
                          <FormLabel component="legend">Do you see your work as decent and good?</FormLabel>
                          <RadioGroup
                            row
                            name="assessment.workIsDecentAndGood"
                            value={formik.values.assessment.workIsDecentAndGood || ''}
                            onChange={formik.handleChange}
                          >
                            {booleanOptions.map((option) => (
                              <FormControlLabel
                                key={option.value}
                                value={option.value}
                                control={<Radio />}
                                label={option.label}
                              />
                            ))}
                          </RadioGroup>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12}>
                        <FormControl component="fieldset">
                          <FormLabel component="legend">Does this job give you a sense of purpose?</FormLabel>
                          <RadioGroup
                            row
                            name="assessment.jobGivesPurpose"
                            value={formik.values.assessment.jobGivesPurpose || ''}
                            onChange={formik.handleChange}
                          >
                            {booleanOptions.map((option) => (
                              <FormControlLabel
                                key={option.value}
                                value={option.value}
                                control={<Radio />}
                                label={option.label}
                              />
                            ))}
                          </RadioGroup>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12}>
                        <FormControl component="fieldset">
                          <FormLabel component="legend">Do you feel respected in your workplace?</FormLabel>
                          <RadioGroup
                            row
                            name="assessment.feelRespectedAtWork"
                            value={formik.values.assessment.feelRespectedAtWork || ''}
                            onChange={formik.handleChange}
                          >
                            {booleanOptions.map((option) => (
                              <FormControlLabel
                                key={option.value}
                                value={option.value}
                                control={<Radio />}
                                label={option.label}
                              />
                            ))}
                          </RadioGroup>
                        </FormControl>
                      </Grid>

                      {/* TAFTA Program Ratings */}
                      <Grid item xs={12}>
                        <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>
                          TAFTA Program Ratings
                        </Typography>
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          select
                          fullWidth
                          label="LMS Platform Rating"
                          name="assessment.lmsPlatformRating"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.assessment.lmsPlatformRating || ''}
                          error={Boolean(
                            formik.touched.assessment?.lmsPlatformRating &&
                            formik.errors.assessment?.lmsPlatformRating
                          )}
                          helperText={
                            formik.touched.assessment?.lmsPlatformRating &&
                            formik.errors.assessment?.lmsPlatformRating
                          }
                        >
                          {ratingOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          select
                          fullWidth
                          label="TAFTA Preparation Rating"
                          name="assessment.taftaPreparationRating"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.assessment.taftaPreparationRating || ''}
                          error={Boolean(
                            formik.touched.assessment?.taftaPreparationRating &&
                            formik.errors.assessment?.taftaPreparationRating
                          )}
                          helperText={
                            formik.touched.assessment?.taftaPreparationRating &&
                            formik.errors.assessment?.taftaPreparationRating
                          }
                        >
                          {ratingOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          label="Preparation Feedback"
                          name="assessment.preparationFeedback"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.assessment.preparationFeedback || ''}
                          error={Boolean(
                            formik.touched.assessment?.preparationFeedback &&
                            formik.errors.assessment?.preparationFeedback
                          )}
                          helperText={
                            formik.touched.assessment?.preparationFeedback &&
                            formik.errors.assessment?.preparationFeedback
                          }
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                          Please rate the following components of the program:
                        </Typography>
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          select
                          fullWidth
                          label="Quality of Interaction"
                          name="assessment.qualityOfInteractionRating"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.assessment.qualityOfInteractionRating || ''}
                          error={Boolean(
                            formik.touched.assessment?.qualityOfInteractionRating &&
                            formik.errors.assessment?.qualityOfInteractionRating
                          )}
                          helperText={
                            formik.touched.assessment?.qualityOfInteractionRating &&
                            formik.errors.assessment?.qualityOfInteractionRating
                          }
                        >
                          {ratingOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          select
                          fullWidth
                          label="Training Materials"
                          name="assessment.trainingMaterialsRating"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.assessment.trainingMaterialsRating || ''}
                          error={Boolean(
                            formik.touched.assessment?.trainingMaterialsRating &&
                            formik.errors.assessment?.trainingMaterialsRating
                          )}
                          helperText={
                            formik.touched.assessment?.trainingMaterialsRating &&
                            formik.errors.assessment?.trainingMaterialsRating
                          }
                        >
                          {ratingOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          select
                          fullWidth
                          label="Topic Sequencing"
                          name="assessment.topicSequencingRating"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.assessment.topicSequencingRating || ''}
                          error={Boolean(
                            formik.touched.assessment?.topicSequencingRating &&
                            formik.errors.assessment?.topicSequencingRating
                          )}
                          helperText={
                            formik.touched.assessment?.topicSequencingRating &&
                            formik.errors.assessment?.topicSequencingRating
                          }
                        >
                          {ratingOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          select
                          fullWidth
                          label="Facilitators Response"
                          name="assessment.facilitatorsResponseRating"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.assessment.facilitatorsResponseRating || ''}
                          error={Boolean(
                            formik.touched.assessment?.facilitatorsResponseRating &&
                            formik.errors.assessment?.facilitatorsResponseRating
                          )}
                          helperText={
                            formik.touched.assessment?.facilitatorsResponseRating &&
                            formik.errors.assessment?.facilitatorsResponseRating
                          }
                        >
                          {ratingOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>

                      {/* Feedback and Recommendations */}
                      <Grid item xs={12}>
                        <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>
                          Feedback and Recommendations
                        </Typography>
                      </Grid>

                      <Grid item xs={12}>
                        <FormControl component="fieldset">
                          <FormLabel component="legend">Would you recommend TAFTA to others?</FormLabel>
                          <RadioGroup
                            row
                            name="assessment.wouldRecommendTafta"
                            value={formik.values.assessment.wouldRecommendTafta || ''}
                            onChange={formik.handleChange}
                          >
                            {booleanOptions.map((option) => (
                              <FormControlLabel
                                key={option.value}
                                value={option.value}
                                control={<Radio />}
                                label={option.label}
                              />
                            ))}
                          </RadioGroup>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          label="Improvement Suggestions"
                          name="assessment.improvementSuggestions"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.assessment.improvementSuggestions || ''}
                          error={Boolean(
                            formik.touched.assessment?.improvementSuggestions &&
                            formik.errors.assessment?.improvementSuggestions
                          )}
                          helperText={
                            formik.touched.assessment?.improvementSuggestions &&
                            formik.errors.assessment?.improvementSuggestions
                          }
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          label="Most Striking Feature"
                          name="assessment.mostStrikingFeature"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.assessment.mostStrikingFeature || ''}
                          error={Boolean(
                            formik.touched.assessment?.mostStrikingFeature &&
                            formik.errors.assessment?.mostStrikingFeature
                          )}
                          helperText={
                            formik.touched.assessment?.mostStrikingFeature &&
                            formik.errors.assessment?.mostStrikingFeature
                          }
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          label="Turn-offs"
                          name="assessment.turnOffs"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.assessment.turnOffs || ''}
                          error={Boolean(
                            formik.touched.assessment?.turnOffs &&
                            formik.errors.assessment?.turnOffs
                          )}
                          helperText={
                            formik.touched.assessment?.turnOffs &&
                            formik.errors.assessment?.turnOffs
                          }
                        />
                      </Grid>

                      {/* Challenges and Motivation */}
                      <Grid item xs={12}>
                        <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>
                          Challenges and Motivation
                        </Typography>
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          label="Practical Class Challenges"
                          name="assessment.practicalClassChallenges"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.assessment.practicalClassChallenges || ''}
                          error={Boolean(
                            formik.touched.assessment?.practicalClassChallenges &&
                            formik.errors.assessment?.practicalClassChallenges
                          )}
                          helperText={
                            formik.touched.assessment?.practicalClassChallenges &&
                            formik.errors.assessment?.practicalClassChallenges
                          }
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          label="Online Class Challenges"
                          name="assessment.onlineClassChallenges"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.assessment.onlineClassChallenges || ''}
                          error={Boolean(
                            formik.touched.assessment?.onlineClassChallenges &&
                            formik.errors.assessment?.onlineClassChallenges
                          )}
                          helperText={
                            formik.touched.assessment?.onlineClassChallenges &&
                            formik.errors.assessment?.onlineClassChallenges
                          }
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          label="Completion Motivation"
                          name="assessment.completionMotivation"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.assessment.completionMotivation || ''}
                          error={Boolean(
                            formik.touched.assessment?.completionMotivation &&
                            formik.errors.assessment?.completionMotivation
                          )}
                          helperText={
                            formik.touched.assessment?.completionMotivation &&
                            formik.errors.assessment?.completionMotivation
                          }
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Box>
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
