import {useState, useEffect} from 'react';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  Card,
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
  FormHelperText,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  useCreateAssessmentMutation,
  useUpdateAssessmentMutation,
  useGetUserAssessmentQuery,
  useGetApplicantQuery,
} from '../../../services/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';

// Rating options for various questions
const ratingOptions = [
  {label: 'Poor', value: 'poor'},
  {label: 'Fair', value: 'fair'},
  {label: 'Good', value: 'good'},
  {label: 'Excellent', value: 'excellent'},
];

// Satisfaction options
const satisfactionOptions = [
  {label: 'I do not know', value: 'unknown'},
  {label: 'Not satisfied', value: 'not_satisfied'},
  {label: 'Satisfied', value: 'satisfied'},
  {label: 'Very satisfied', value: 'very_satisfied'},
];

// Skill rating options
const skillRatingOptions = [
  {label: 'I have not done any work to know', value: 'no_work_done'},
  {label: 'My skill is sufficient', value: 'sufficient'},
  {label: 'My skill is insufficient', value: 'insufficient'},
  {
    label: 'I can compete in the creative sector with this level of skill',
    value: 'competitive',
  },
];

// Income range options
const incomeRangeOptions = [
  {label: 'Less than NGN 50,000', value: 'less_than_50k'},
  {label: 'Between NGN 50,000 and NGN 100,000', value: '50k_to_100k'},
  {label: 'Between NGN 101,000 and NGN 200,000', value: '101k_to_200k'},
  {label: 'Between NGN 201,000 and NGN 300,000', value: '201k_to_300k'},
  {label: 'Above NGN 300,000', value: 'above_300k'},
];

// Employment types
const employmentTypes = [
  {label: 'Freelancing', value: 'freelancing'},
  {label: '9-5', value: '9_to_5'},
  {label: 'Production', value: 'production'},
  {label: 'Business owner', value: 'business_owner'},
  {label: 'Others', value: 'others'},
];

// Work time types
const workTimeTypes = [
  {label: 'Full-Time', value: 'full_time'},
  {label: 'Part-Time', value: 'part_time'},
  {label: 'Internship', value: 'internship'},
  {label: 'Contract', value: 'contract'},
];

// Boolean options for Yes/No questions
const booleanOptions = [
  {label: 'Yes', value: 'true'},
  {label: 'No', value: 'false'},
];

export const UserAssessmentForm = ({userId}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createAssessment] = useCreateAssessmentMutation();
  const [updateAssessment] = useUpdateAssessmentMutation();
  const {data: existingAssessment, isLoading: assessmentLoading} =
    useGetUserAssessmentQuery(userId);
  const {data: applicantData, isLoading: applicantLoading} =
    useGetApplicantQuery(userId);
  const router = useRouter();

  // Extract enrolled courses from the user data
  const enrolledCourses =
    applicantData?.user?.userCohort?.[0]?.enrollments || [];
  const hasEnrollments = enrolledCourses.length > 0;

  // Define the validation schema using Yup
  const validationSchema = Yup.object({
    courseOfStudy: Yup.string().required('Course of study is required'),
    // Add other validations as needed
  });

  // Initialize formik
  const formik = useFormik({
    initialValues: {
      // 1. Course Information
      courseOfStudy: '',
      enrollmentStatus: '',

      // 2-3. Previous Employment
      hadJobBeforeAdmission: null,

      // 4-6. Current Employment
      employmentStatus: '',
      employmentType: '',
      workTimeType: '',

      // 7-9. Creative Sector Employment
      employedInCreativeSector: null,
      creativeJobNature: '',
      nonCreativeJobInfo: '',

      // 10-12. Experience and Skills
      yearsOfExperienceCreative: '',
      satisfactionLevel: '',
      skillRating: '',

      // 13-18. Income and Job Satisfaction
      monthlyIncome: '',
      hasReliableIncome: null,
      earningMeetsNeeds: null,
      workIsDecentAndGood: null,
      jobGivesPurpose: null,
      feelRespectedAtWork: null,

      // 19-25. TAFTA Program Ratings
      lmsPlatformRating: '',
      taftaPreparationRating: '',
      preparationFeedback: '',
      qualityOfInteractionRating: '',
      trainingMaterialsRating: '',
      topicSequencingRating: '',
      facilitatorsResponseRating: '',

      // 26-32. Feedback and Recommendations
      wouldRecommendTafta: null,
      improvementSuggestions: '',
      mostStrikingFeature: '',
      turnOffs: '',
      practicalClassChallenges: '',
      onlineClassChallenges: '',
      completionMotivation: '',
    },
    validationSchema,
    onSubmit: async (values, helpers) => {
      setIsSubmitting(true);
      try {
        // Convert string boolean values to actual booleans
        const processedValues = {...values};

        // Process boolean fields
        const booleanFields = [
          'hadJobBeforeAdmission',
          'employedInCreativeSector',
          'hasReliableIncome',
          'earningMeetsNeeds',
          'workIsDecentAndGood',
          'jobGivesPurpose',
          'feelRespectedAtWork',
          'wouldRecommendTafta',
        ];

        booleanFields.forEach(field => {
          if (processedValues[field] === 'true') {
            processedValues[field] = true;
          } else if (processedValues[field] === 'false') {
            processedValues[field] = false;
          }
        });

        // Determine if we're creating or updating
        if (existingAssessment) {
          await updateAssessment({
            id: existingAssessment.id,
            body: processedValues,
          }).unwrap();
          toast.success('Assessment updated successfully!');
        } else {
          await createAssessment({
            body: {
              userId,
              ...processedValues,
            },
          }).unwrap();
          toast.success('Assessment submitted successfully!');
        }
        helpers.setStatus({success: true});
        // Redirect to dashboard after success
        router.push('/dashboard');
      } catch (error) {
        console.error('Error submitting assessment:', error);
        toast.error('Failed to submit assessment');
        helpers.setStatus({success: false});
        helpers.setErrors({submit: error.message});
      } finally {
        helpers.setSubmitting(false);
        setIsSubmitting(false);
      }
    },
  });

  // Load existing assessment data if available
  useEffect(() => {
    if (existingAssessment) {
      // Populate the form with existing data
      Object.keys(existingAssessment).forEach(key => {
        if (key in formik.values) {
          // Convert boolean values to strings for radio buttons
          if (typeof existingAssessment[key] === 'boolean') {
            formik.setFieldValue(key, existingAssessment[key].toString());
          } else {
            formik.setFieldValue(key, existingAssessment[key]);
          }
        }
      });
    }
  }, [existingAssessment]);

  // Pre-select the first enrolled course if available and no course is selected yet
  useEffect(() => {
    if (
      hasEnrollments &&
      !formik.values.courseOfStudy &&
      enrolledCourses.length > 0
    ) {
      formik.setFieldValue('courseOfStudy', enrolledCourses[0].course_name);

      // If we have percentage completed data, set the enrollment status
      if (enrolledCourses[0].percentage_completed !== null) {
        const percentComplete = parseFloat(
          enrolledCourses[0].percentage_completed || 0,
        );
        let status = 'Not Started';

        if (percentComplete > 0 && percentComplete < 100) {
          status = 'In Progress';
        } else if (percentComplete >= 100 || enrolledCourses[0].completed) {
          status = 'Completed';
        }

        formik.setFieldValue('enrollmentStatus', status);
      }
    }
  }, [applicantData, formik.values.courseOfStudy]);

  if (assessmentLoading || applicantLoading) {
    return (
      <Box sx={{display: 'flex', justifyContent: 'center', my: 4}}>
        <CircularProgress />
      </Box>
    );
  }

  // Helper component for yes/no questions
  const BooleanField = ({name, label, required = false}) => (
    <FormControl
      component='fieldset'
      fullWidth
      margin='normal'
      required={required}>
      <FormLabel component='legend'>{label}</FormLabel>
      <RadioGroup
        row
        name={name}
        value={
          formik.values[name] === null ? '' : formik.values[name].toString()
        }
        onChange={formik.handleChange}
        error={formik.touched[name] && Boolean(formik.errors[name])}>
        {booleanOptions.map(option => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<Radio />}
            label={option.label}
          />
        ))}
      </RadioGroup>
      {formik.touched[name] && formik.errors[name] && (
        <FormHelperText error>{formik.errors[name]}</FormHelperText>
      )}
    </FormControl>
  );

  // Helper component for rating questions
  const RatingField = ({name, label, options, required = false}) => (
    <FormControl
      component='fieldset'
      fullWidth
      margin='normal'
      required={required}>
      <FormLabel component='legend'>{label}</FormLabel>
      <RadioGroup
        row
        name={name}
        value={formik.values[name]}
        onChange={formik.handleChange}
        error={formik.touched[name] && Boolean(formik.errors[name])}>
        {options.map(option => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<Radio />}
            label={option.label}
          />
        ))}
      </RadioGroup>
      {formik.touched[name] && formik.errors[name] && (
        <FormHelperText error>{formik.errors[name]}</FormHelperText>
      )}
    </FormControl>
  );

  return (
    <form onSubmit={formik.handleSubmit}>
      <Card>
        <CardHeader title='TAFTA Assessment Form' />
        <Divider />
        <CardContent>
          {/* Section 1: Course Information */}
          <Typography variant='h6' sx={{mb: 3, mt: 2}}>
            Course Information
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              {hasEnrollments ? (
                <TextField
                  select
                  fullWidth
                  label='1. Course of Study'
                  name='courseOfStudy'
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  required
                  value={formik.values.courseOfStudy}
                  error={
                    formik.touched.courseOfStudy &&
                    Boolean(formik.errors.courseOfStudy)
                  }
                  helperText={
                    formik.touched.courseOfStudy && formik.errors.courseOfStudy
                  }>
                  {enrolledCourses.map(enrollment => (
                    <MenuItem
                      key={enrollment.uid}
                      value={enrollment.course_name}>
                      {enrollment.course_name}
                    </MenuItem>
                  ))}
                </TextField>
              ) : (
                <TextField
                  fullWidth
                  label='1. Course of Study'
                  name='courseOfStudy'
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  required
                  value={formik.values.courseOfStudy}
                  error={
                    formik.touched.courseOfStudy &&
                    Boolean(formik.errors.courseOfStudy)
                  }
                  helperText={
                    (formik.touched.courseOfStudy &&
                      formik.errors.courseOfStudy) ||
                    'No enrolled courses found. Please enter manually.'
                  }
                />
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label='2. Enrollment Status'
                name='enrollmentStatus'
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.enrollmentStatus}>
                <MenuItem value='Not Started'>Not Started</MenuItem>
                <MenuItem value='In Progress'>In Progress</MenuItem>
                <MenuItem value='Completed'>Completed</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          {/* Section 2: Employment Background */}
          <Typography variant='h6' sx={{mb: 3, mt: 4}}>
            Employment Background
          </Typography>
          <Paper elevation={1} sx={{p: 3, mb: 3}}>
            <BooleanField
              name='hadJobBeforeAdmission'
              label='3. Did you have a job before getting admission into TAFTA?'
              required
            />

            <FormControl
              component='fieldset'
              fullWidth
              margin='normal'
              required>
              <FormLabel component='legend'>4. Employment Status</FormLabel>
              <RadioGroup
                row
                name='employmentStatus'
                value={formik.values.employmentStatus}
                onChange={formik.handleChange}>
                <FormControlLabel
                  value='employed'
                  control={<Radio />}
                  label='Employed'
                />
                <FormControlLabel
                  value='unemployed'
                  control={<Radio />}
                  label='Unemployed'
                />
              </RadioGroup>
            </FormControl>

            <TextField
              select
              fullWidth
              margin='normal'
              label='5. Employment Type'
              name='employmentType'
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.employmentType}
              disabled={formik.values.employmentStatus !== 'employed'}>
              {employmentTypes.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              margin='normal'
              label='6. What is the type of employment?'
              name='workTimeType'
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.workTimeType}
              disabled={formik.values.employmentStatus !== 'employed'}>
              {workTimeTypes.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Paper>

          {/* Section 3: Creative Sector Employment */}
          <Typography variant='h6' sx={{mb: 3}}>
            Creative Sector Employment
          </Typography>
          <Paper elevation={1} sx={{p: 3, mb: 3}}>
            <BooleanField
              name='employedInCreativeSector'
              label='7. Are you currently employed in the creative sector?'
            />

            <TextField
              fullWidth
              margin='normal'
              label='8. If Yes, kindly mention the nature of employment in the creative sector'
              placeholder='E.g., Director, Cinematographer, stage actor, etc.'
              name='creativeJobNature'
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.creativeJobNature}
              disabled={formik.values.employedInCreativeSector !== 'true'}
              multiline
              rows={2}
            />

            <TextField
              fullWidth
              margin='normal'
              label='9. If No, kindly mention the nature of employment and the sector'
              placeholder='E.g., Admin in Information Technology, Education, etc.'
              name='nonCreativeJobInfo'
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.nonCreativeJobInfo}
              disabled={
                formik.values.employedInCreativeSector !== 'false' &&
                formik.values.employedInCreativeSector !== null
              }
              multiline
              rows={2}
            />

            <TextField
              fullWidth
              margin='normal'
              label='10. How many years of experience do you have working in the creative industry?'
              name='yearsOfExperienceCreative'
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.yearsOfExperienceCreative}
            />
          </Paper>

          {/* Section 4: Experience and Skills */}
          <Typography variant='h6' sx={{mb: 3}}>
            Experience and Skills
          </Typography>
          <Paper elevation={1} sx={{p: 3, mb: 3}}>
            <RatingField
              name='satisfactionLevel'
              label='11. Generally, what is your level of satisfaction with your current work in the creative industry in the country?'
              options={satisfactionOptions}
            />

            <RatingField
              name='skillRating'
              label='12. Generally, how would you rate your skills on the course you have selected after the program in respect to the work you have done?'
              options={skillRatingOptions}
            />
          </Paper>

          {/* Section 5: Income and Job Satisfaction */}
          <Typography variant='h6' sx={{mb: 3}}>
            Income and Work Environment
          </Typography>
          <Paper elevation={1} sx={{p: 3, mb: 3}}>
            <TextField
              select
              fullWidth
              margin='normal'
              label='13. Please estimate your average MONTHLY income'
              name='monthlyIncome'
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.monthlyIncome}>
              {incomeRangeOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <BooleanField
              name='hasReliableIncome'
              label='14. Do you have a reliable income?'
            />
            <BooleanField
              name='earningMeetsNeeds'
              label='15. Do you think your current earning meets your basic needs?'
            />
            <BooleanField
              name='workIsDecentAndGood'
              label='16. Do you see your work as decent and good?'
            />
            <BooleanField
              name='jobGivesPurpose'
              label='17. Does this job give you a sense of purpose?'
            />
            <BooleanField
              name='feelRespectedAtWork'
              label='18. Do you feel respected in your workplace?'
            />
          </Paper>

          {/* Section 6: TAFTA Program Ratings */}
          <Typography variant='h6' sx={{mb: 3}}>
            TAFTA Program Ratings
          </Typography>
          <Paper elevation={1} sx={{p: 3, mb: 3}}>
            <RatingField
              name='lmsPlatformRating'
              label='19. Overall, rate the performance of the TAFTA LMS platform.'
              options={ratingOptions}
            />

            <RatingField
              name='taftaPreparationRating'
              label='20. Overall, rate the preparation (in terms of communication and logistics) the TAFTA program gave you across the duration of the training.'
              options={ratingOptions}
            />

            <TextField
              fullWidth
              margin='normal'
              label='21. How could the preparation and logistics be better?'
              name='preparationFeedback'
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.preparationFeedback}
              multiline
              rows={3}
            />

            <Typography variant='subtitle1' sx={{mt: 2, mb: 1}}>
              Please rate the following components of the program:
            </Typography>

            <RatingField
              name='qualityOfInteractionRating'
              label='22. Quality of interaction'
              options={ratingOptions}
            />

            <RatingField
              name='trainingMaterialsRating'
              label='23. Training materials'
              options={ratingOptions}
            />

            <RatingField
              name='topicSequencingRating'
              label='24. Topic sequencing'
              options={ratingOptions}
            />

            <RatingField
              name='facilitatorsResponseRating'
              label='25. Facilitators response'
              options={ratingOptions}
            />
          </Paper>

          {/* Section 7: Feedback and Recommendations */}
          <Typography variant='h6' sx={{mb: 3}}>
            Feedback and Recommendations
          </Typography>
          <Paper elevation={1} sx={{p: 3, mb: 3}}>
            <BooleanField
              name='wouldRecommendTafta'
              label='26. If you are in a position to, would you recommend this TAFTA training to your colleagues?'
            />

            <TextField
              fullWidth
              margin='normal'
              label='27. Please make suggestions for improving the TAFTA training.'
              name='improvementSuggestions'
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.improvementSuggestions}
              multiline
              rows={3}
              sx={{
                '& .MuiInputLabel-root': {
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                  lineHeight: 1.2,
                  maxWidth: '100%',
                },
              }}
            />

            <TextField
              fullWidth
              margin='normal'
              label='28. What do you consider to be the most striking feature of this TAFTA training?'
              name='mostStrikingFeature'
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.mostStrikingFeature}
              multiline
              rows={3}
              sx={{
                '& .MuiInputLabel-root': {
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                  lineHeight: 1.2,
                  maxWidth: '100%',
                },
              }}
            />

            <TextField
              fullWidth
              margin='normal'
              label='29. What do you consider to be a turn-off for you in this TAFTA training?'
              name='turnOffs'
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.turnOffs}
              multiline
              rows={3}
              sx={{
                '& .MuiInputLabel-root': {
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                  lineHeight: 1.2,
                  maxWidth: '100%',
                },
              }}
            />
          </Paper>

          {/* Section 8: Challenges and Motivation */}
          <Typography variant='h6' sx={{mb: 3}}>
            Challenges and Motivation
          </Typography>
          <Paper elevation={1} sx={{p: 3, mb: 3}}>
            <TextField
              fullWidth
              margin='normal'
              label='30. What challenges did you experience during the practical class?'
              name='practicalClassChallenges'
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.practicalClassChallenges}
              multiline
              rows={3}
            />

            <TextField
              fullWidth
              margin='normal'
              label='31. What challenges did you experience during the online class?'
              name='onlineClassChallenges'
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.onlineClassChallenges}
              multiline
              rows={3}
            />

            <TextField
              fullWidth
              margin='normal'
              label='32. What motivated you to complete the course?'
              name='completionMotivation'
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.completionMotivation}
              multiline
              rows={3}
            />
          </Paper>

          <Box sx={{mt: 4, display: 'flex', justifyContent: 'center'}}>
            <Button
              type='submit'
              variant='contained'
              size='large'
              disabled={isSubmitting}
              sx={{px: 4, py: 1}}>
              {isSubmitting
                ? 'Submitting...'
                : existingAssessment
                ? 'Update Assessment'
                : 'Submit Assessment'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </form>
  );
};

export default UserAssessmentForm;
