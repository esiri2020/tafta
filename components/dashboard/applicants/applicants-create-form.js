import {useState, useEffect, useRef} from 'react';
import {useRouter} from 'next/router';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardActions} from '@/components/ui/card';
import {Tabs, TabsList, TabsTrigger, TabsContent} from '@/components/ui/tabs';
import {Separator} from '@/components/ui/separator';
import {FormSection} from '@/components/form-section';

// Form Sections
import {BasicInformation} from '@/components/home/form-sections/basic-information';
import {LocationInformation} from '@/components/home/form-sections/location-information';
import {EducationDisability} from '@/components/home/form-sections/education-disability';
import {EmploymentResidency} from '@/components/home/form-sections/employment-residency';
import {ReferralInformation} from '@/components/home/form-sections/referral-information';
import {RegistrationTalp} from '@/components/home/form-sections/registration-talp';
import {JobReadiness} from '@/components/home/form-sections/job-readiness';
import {BusinessInformation} from '@/components/home/form-sections/business-information';

// API
import {useCreateApplicantMutation} from '../../../services/api';

// Form Options
import {
  levels_of_education,
  employment_status,
  salary_ranges,
  revenue_ranges,
  business_sectors,
} from '@/data/form-options';

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
  LGADetails: Yup.string().required('LGA is required'),
  homeAddress: Yup.string().required('Home address is required'),
  communityArea: Yup.string().required('Community area is required'),
  educationLevel: Yup.string().required('Education level is required'),
  employmentStatus: Yup.string().required('Employment status is required'),
  employmentSector: Yup.string().when('employmentStatus', {
    is: val => val === 'employed',
    then: schema => schema.required('Employment sector is required'),
    otherwise: schema => schema.notRequired(),
  }),
  selfEmployedType: Yup.string().when('employmentStatus', {
    is: val => val === 'self-employed',
    then: schema => schema.required('Self-employment type is required'),
    otherwise: schema => schema.notRequired(),
  }),
  disability: Yup.string().when('_disability', {
    is: true,
    then: schema => schema.required('Disability type is required'),
    otherwise: schema => schema.notRequired(),
  }),
  talpType: Yup.string().when('talpParticipation', {
    is: true,
    then: schema => schema.required('TALP program is required'),
    otherwise: schema => schema.notRequired(),
  }),
  jobReadiness: Yup.array().when('employmentStatus', {
    is: val => val === 'unemployed',
    then: schema =>
      schema.min(1, 'At least one job readiness support is required'),
    otherwise: schema => schema.notRequired(),
  }),
  businessType: Yup.string().when('applicantType', {
    is: 'ENTERPRISE',
    then: schema => schema.required('Business type is required'),
    otherwise: schema => schema.notRequired(),
  }),
  businessSize: Yup.string().when('applicantType', {
    is: 'ENTERPRISE',
    then: schema => schema.required('Business size is required'),
    otherwise: schema => schema.notRequired(),
  }),
  businessSector: Yup.string().when('applicantType', {
    is: 'ENTERPRISE',
    then: schema => schema.required('Business sector is required'),
    otherwise: schema => schema.notRequired(),
  }),
  entrepreneurRegistrationType: Yup.array().when('applicantType', {
    is: 'ENTERPRISE',
    then: schema => schema.min(1, 'At least one registration type is required'),
    otherwise: schema => schema.notRequired(),
  }),
  businessSupport: Yup.array().when('applicantType', {
    is: 'ENTERPRISE',
    then: schema => schema.min(1, 'At least one business support is required'),
    otherwise: schema => schema.notRequired(),
  }),
});

const initialValues = {
  applicantType: 'INDIVIDUAL',
  courseId: '',
  cohortId: '',
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  gender: '',
  dob: '',
  ageRange: '',
  stateOfResidence: '',
  LGADetails: '',
  homeAddress: '',
  communityArea: '',
  _disability: false,
  disability: '',
  educationLevel: '',
  employmentStatus: '',
  employmentSector: '',
  selfEmployedType: '',
  residencyStatus: '',
  salaryRange: '',
  businessName: '',
  businessType: '',
  businessSize: '',
  businessSector: '',
  businessPartners: '',
  companyPhoneNumber: '',
  additionalPhoneNumber: '',
  companyEmail: '',
  revenueRange: '',
  entrepreneurRegistrationType: [],
  businessSupport: [],
  businessSupportNeeds: [],
  registrationMode: 'online',
  source: '',
  referrer_fullName: '',
  referrer_phoneNumber: '',
  talpParticipation: false,
  talpType: '',
  talpOther: '',
  jobReadiness: [],
};

const ApplicantCreateForm = () => {
  const [createApplicant] = useCreateApplicantMutation();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('individual');
  const [cohorts, setCohorts] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState(undefined);
  const [error, setError] = useState(null);
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
      console.log('Form values before submission:', values);
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
          dob: values.dob,
          homeAddress: values.homeAddress,
          stateOfResidence: values.stateOfResidence,
          LGADetails: values.LGADetails,
          communityArea: values.communityArea,
          educationLevel: values.educationLevel,
          employmentStatus: values.employmentStatus,
          employmentSector:
            values.employmentStatus === 'employed'
              ? values.employmentSector
              : null,
          selfEmployedType:
            values.employmentStatus === 'self-employed'
              ? values.selfEmployedType
              : null,
          residencyStatus: values.residencyStatus,
          disability: values._disability ? values.disability : '',
          talpParticipation: values.talpParticipation,
          talpType: values.talpParticipation ? values.talpType : null,
          talpOther:
            values.talpParticipation && values.talpType === 'other'
              ? values.talpOther
              : null,
          jobReadiness: values.jobReadiness,
          businessSupport: values.businessSupport,
          businessSupportNeeds: values.businessSupportNeeds,
          source: values.source,
          referrer_fullName: values.referrer_fullName,
          referrer_phoneNumber: values.referrer_phoneNumber,
          salaryRange: values.salaryRange || null,
        };

        // Add enterprise specific data if type is ENTERPRISE
        if (values.applicantType === 'ENTERPRISE') {
          profile.businessName = values.businessName;
          profile.businessType = values.businessType;
          profile.businessSize = values.businessSize;
          profile.businessSector = values.businessSector;
          profile.businessPartners = values.businessPartners;
          profile.companyPhoneNumber = values.companyPhoneNumber;
          profile.additionalPhoneNumber = values.additionalPhoneNumber;
          profile.companyEmail = values.companyEmail;
          profile.revenueRange = values.revenueRange;
          profile.entrepreneurRegistrationType =
            values.entrepreneurRegistrationType;
        }

        const requestPayload = {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          password: 'tafta1234', // Default password
          type: values.applicantType,
          cohortId: values.cohortId,
          selectedCourseId: values.courseId,
          selectedCourseName: values.selectedCourseName || '',
          profile,
          skipVerification: true,
          autoEnroll: true,
        };

        console.log(
          'API request payload:',
          JSON.stringify(requestPayload, null, 2),
        );

        // Make API request to create applicant
        const response = await createApplicant({
          body: requestPayload,
        }).unwrap();

        console.log('API response:', response);

        if (response) {
          helpers.setStatus({success: true});
          helpers.setSubmitting(false);
          toast.success('Applicant Created and Enrolled Successfully!');
          router.replace({pathname: '/admin-dashboard/applicants/'});
        }
      } catch (err) {
        console.error('Form submission error:', err);
        toast.error(err.data?.message || 'Something went wrong!');
        helpers.setStatus({success: false});
        helpers.setErrors({submit: err.message});
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
        const transformedCourses = cohortCoursesData.cohortCourses.map(
          cohortCourse => ({
            id: cohortCourse.id,
            name: cohortCourse.course.name,
            slug: cohortCourse.course.slug,
            courseId: cohortCourse.course.id,
          }),
        );
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

  // Course Selection Section Component
  const CourseSelection = () => (
    <FormSection title='Course and Cohort Selection'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div className='space-y-2'>
          <label htmlFor='cohortId' className='block text-sm font-medium'>
            Cohort
          </label>
          <select
            id='cohortId'
            name='cohortId'
            className='block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
            value={formik.values.cohortId}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}>
            <option value=''>Select a cohort</option>
            {cohorts.map(cohort => (
              <option key={cohort.id} value={cohort.id}>
                {cohort.name}
              </option>
            ))}
          </select>
          {formik.touched.cohortId && formik.errors.cohortId && (
            <p className='text-sm text-red-500'>{formik.errors.cohortId}</p>
          )}
        </div>

        <div className='space-y-2'>
          <label htmlFor='courseId' className='block text-sm font-medium'>
            Course
          </label>
          <select
            id='courseId'
            name='courseId'
            className='block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
            value={formik.values.courseId}
            onChange={e => {
              const course = courses?.find(c => c.id === e.target.value);
              if (course) {
                formik.setFieldValue('courseId', e.target.value);
                formik.setFieldValue('selectedCourseName', course.name);
              }
            }}
            onBlur={formik.handleBlur}
            disabled={!formik.values.cohortId || isLoading}>
            <option value=''>
              {isLoading
                ? 'Loading courses...'
                : !formik.values.cohortId
                ? 'Select a cohort first'
                : courses.length === 0
                ? 'No courses available'
                : 'Select a course'}
            </option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
          {formik.touched.courseId && formik.errors.courseId && (
            <p className='text-sm text-red-500'>{formik.errors.courseId}</p>
          )}
        </div>
      </div>
    </FormSection>
  );

  return (
    <form onSubmit={formik.handleSubmit} className='space-y-6'>
      <Card>
        <CardHeader>
          <h3 className='text-lg font-medium'>Create Applicant</h3>
        </CardHeader>
        <Separator />
        <CardContent>
          {/* <div className='mb-6'> */}
          <Tabs
            defaultValue='individual'
            value={activeTab}
            onValueChange={value => {
              setActiveTab(value);
              formik.setFieldValue(
                'applicantType',
                value === 'individual' ? 'INDIVIDUAL' : 'ENTERPRISE',
              );
            }}>
            <TabsList className='grid grid-cols-2 w-full max-w-md'>
              <TabsTrigger value='individual'>Individual</TabsTrigger>
              <TabsTrigger value='enterprise'>Enterprise [For Business Owners]</TabsTrigger>
            </TabsList>
            {/* </Tabs> */}
            {/* </div> */}

            {/* <div className='space-y-8'> */}
            <CourseSelection />

            <TabsContent value='individual' className='space-y-6'>
              <BasicInformation formik={formik} date={date} setDate={setDate} />
              <LocationInformation formik={formik} />
              <EducationDisability formik={formik} />
              <EmploymentResidency formik={formik} />
              <ReferralInformation formik={formik} />
              <RegistrationTalp formik={formik} />
              <JobReadiness formik={formik} />
            </TabsContent>

            <TabsContent value='enterprise' className='space-y-6'>
              <BasicInformation formik={formik} date={date} setDate={setDate} />
              <LocationInformation formik={formik} />
              <EmploymentResidency formik={formik} isEnterpriseType={true} />
              <BusinessInformation formik={formik} />
              <ReferralInformation formik={formik} />
            </TabsContent>
          </Tabs>
          {/* </div> */}
        </CardContent>
        <Separator />
        <CardActions className='flex justify-between p-6'>
          <div>
            <Button
              type='submit'
              disabled={formik.isSubmitting || isSubmitting}>
              {formik.isSubmitting || isSubmitting
                ? 'Creating...'
                : 'Create Applicant'}
            </Button>
            <Link href='/admin-dashboard/applicants' passHref>
              <Button
                variant='outline'
                className='ml-2'
                disabled={formik.isSubmitting || isSubmitting}>
                Cancel
              </Button>
            </Link>
          </div>
        </CardActions>
      </Card>
    </form>
  );
};

export default ApplicantCreateForm;
