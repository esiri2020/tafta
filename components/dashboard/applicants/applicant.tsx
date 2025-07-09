import React, {useState, useEffect, useRef} from 'react';
import {useRouter} from 'next/router';
import Link from 'next/link';
import {toast} from 'sonner';
import {useFormik, FormikHelpers, FormikProps} from 'formik';
import * as Yup from 'yup';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardFooter} from '@/components/ui/card';
import {Tabs, TabsList, TabsTrigger, TabsContent} from '@/components/ui/tabs';
import {Separator} from '@/components/ui/separator';
import {FormSection} from '@/components/form-section';

// Form Sections - Import as type any to avoid strict type checking
// We'll apply explicit type casting when using these components
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

// Types
import {FormValues} from '@/types/applicant';

// Form Options
import {
  levels_of_education,
  employment_status,
  salary_ranges,
  revenue_ranges,
  business_sectors,
} from '@/data/form-options';

// Type definitions
interface Course {
  id: string;
  name: string;
  slug: string;
  courseId: string;
}

interface Cohort {
  id: string;
  name: string;
}

interface CohortCourse {
  id: string;
  course: {
    id: string;
    name: string;
    slug: string;
  };
}

interface Profile {
  type: string;
  registrationMode: string;
  phoneNumber: string;
  gender: string;
  ageRange: string;
  dob: string;
  homeAddress: string;
  stateOfResidence: string;
  LGADetails: string;
  communityArea: string;
  educationLevel: string;
  employmentStatus: string;
  employmentSector: string | null;
  selfEmployedType: string | null;
  residencyStatus: string;
  disability: string;
  talpParticipation: boolean;
  talpType: string | null;
  talpOther: string | null;
  jobReadiness: string[];
  businessSupport: string[];
  businessSupportNeeds: string[];
  source: string;
  salaryRange: string | null;
  cohortId: string;
  referrer?: {
    fullName: string;
    phoneNumber: string;
  };
  businessName?: string;
  businessType?: string;
  businessSize?: string;
  businessSector?: string;
  businessPartners?: string;
  companyPhoneNumber?: string;
  additionalPhoneNumber?: string;
  companyEmail?: string;
  revenueRange?: string;
  entrepreneurRegistrationType?: string[];
}

interface ApiError {
  data?: {
    message?: string;
  };
  message?: string;
}

// Since we can't modify the imported FormValues, define a local version that includes our extra fields
interface LocalFormValues {
  // Base FormValues fields
  homeAddress: string;
  LGADetails: string;
  email: string;
  firstName: string;
  middleName: string;
  lastName: string;
  phoneNumber: string;
  stateOfResidence: string;
  gender: string;
  ageRange: string;
  educationLevel: string;
  communityArea: string;
  _disability: boolean;
  disability: string;
  source: string;
  referrer_fullName: string;
  referrer_phoneNumber: string;
  employmentStatus: string;
  employmentSector: string;
  residencyStatus: string;
  selfEmployedType: string;
  registrationMode: string;
  talpParticipation: boolean;
  talpType: string;
  talpOther: string;
  jobReadiness: string[];
  salaryRange: string;
  revenueRange: string;
  entrepreneurBusinessName: string;
  entrepreneurBusinessType: string;
  entrepreneurBusinessSize: string;
  entrepreneurBusinessSector: string;
  entrepreneurCompanyPhoneNumber: string;
  entrepreneurAdditionalPhoneNumber: string;
  entrepreneurCompanyEmail: string;
  entrepreneurBusinessPartners: string;
  entrepreneurRevenueRange: string;
  entrepreneurRegistrationType: string[];
  businessSupport: string[];
  businessSupportNeeds: string[];
  businessType: string;
  businessSector: string;
  businessSize: string;
  businessPartners: string;
  companyPhoneNumber: string;
  additionalPhoneNumber: string;
  companyEmail: string;
  dob: string;
  submit: null;

  // Additional fields for this component
  applicantType: string;
  courseId: string;
  cohortId: string;
  businessName: string;
  selectedCourseName?: string;
  actualCourseId: string;
}

// Type for form section components
interface FormSectionComponent {
  (props: {formik: any; [key: string]: any}): JSX.Element;
}

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
    is: (val: string) => val === 'employed',
    then: schema => schema.required('Employment sector is required'),
    otherwise: schema => schema.notRequired(),
  }),
  selfEmployedType: Yup.string().when('employmentStatus', {
    is: (val: string) => val === 'self-employed',
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
    is: (val: string) => val === 'unemployed',
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

const initialValues: LocalFormValues = {
  // Base form fields
  homeAddress: '',
  LGADetails: '',
  email: '',
  firstName: '',
  middleName: '',
  lastName: '',
  phoneNumber: '',
  stateOfResidence: '',
  gender: '',
  ageRange: '',
  educationLevel: '',
  communityArea: '',
  _disability: false,
  disability: '',
  source: '',
  referrer_fullName: '',
  referrer_phoneNumber: '',
  employmentStatus: '',
  employmentSector: '',
  residencyStatus: '',
  selfEmployedType: '',
  registrationMode: 'online',
  talpParticipation: false,
  talpType: '',
  talpOther: '',
  jobReadiness: [],
  salaryRange: '',
  revenueRange: '',
  entrepreneurBusinessName: '',
  entrepreneurBusinessType: '',
  entrepreneurBusinessSize: '',
  entrepreneurBusinessSector: '',
  entrepreneurCompanyPhoneNumber: '',
  entrepreneurAdditionalPhoneNumber: '',
  entrepreneurCompanyEmail: '',
  entrepreneurBusinessPartners: '',
  entrepreneurRevenueRange: '',
  entrepreneurRegistrationType: [],
  businessSupport: [],
  businessSupportNeeds: [],
  businessType: '',
  businessSector: '',
  businessSize: '',
  businessPartners: '',
  companyPhoneNumber: '',
  additionalPhoneNumber: '',
  companyEmail: '',
  dob: '',
  submit: null,

  // Additional component-specific fields
  applicantType: 'INDIVIDUAL',
  courseId: '',
  cohortId: '',
  businessName: '',
  actualCourseId: '',
};

const ApplicantCreateForm: React.FC = () => {
  const [createApplicant] = useCreateApplicantMutation();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<string>('individual');
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const selectedCohortId = useRef<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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
        setError(typeof err === 'string' ? err : 'Failed to load cohorts');
        toast.error('Failed to load form data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCohorts();
  }, []);

  const formik = useFormik<LocalFormValues>({
    initialValues,
    validationSchema,
    onSubmit: async (values, helpers: FormikHelpers<LocalFormValues>) => {
      if (isSubmitting) return;
      setIsSubmitting(true);

      try {
        // Prepare profile data
        const profile: Profile = {
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
          salaryRange: values.salaryRange || null,
          cohortId: values.cohortId,
        };

        // Add referrer information if provided
        if (values.referrer_fullName || values.referrer_phoneNumber) {
          profile.referrer = {
            fullName: values.referrer_fullName,
            phoneNumber: values.referrer_phoneNumber,
          };
        }

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
            values.entrepreneurRegistrationType || [];
        }

        const requestPayload = {
          firstName: values.firstName,
          lastName: values.lastName,
          middleName: values.middleName || '',
          email: values.email,
          password: 'tafta1234',
          type: values.applicantType,
          cohortId: values.cohortId,
          selectedCourseId: values.courseId,
          selectedCourseName: values.selectedCourseName || '',
          profile,
          skipVerification: true,
          autoEnroll: true,
        };

        // Make API request to create applicant
        const response = await createApplicant({
          body: requestPayload,
        }).unwrap();

        if (response) {
          // Create enrollment after successful applicant creation
          try {
            const enrollmentPayload = {
              userCohortId: values.cohortId,
              course_id: parseInt(values.actualCourseId),
              course_name: values.selectedCourseName,
              user_email: values.email.toLowerCase(),
            };

            const enrollmentResponse = await fetch('/api/enrollments', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(enrollmentPayload),
            });

            if (!enrollmentResponse.ok) {
              const errorText = await enrollmentResponse.text();
              throw new Error(`Failed to create enrollment: ${errorText}`);
            }

            await enrollmentResponse.json();
          } catch (enrollError) {
            console.error('Enrollment creation failed:', enrollError);
            toast.error(
              'Applicant created but enrollment failed. Please try enrolling manually.',
            );
          }

          helpers.setStatus({success: true});
          helpers.setSubmitting(false);
          toast.success('Applicant Created and Enrolled Successfully!');
          router.replace({pathname: '/admin-dashboard/applicants/'});
        }
      } catch (err) {
        const apiError = err as ApiError;
        console.error('Form submission error:', apiError);
        toast.error(apiError.data?.message || 'Something went wrong!');
        helpers.setStatus({success: false});
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
        const cohortCoursesData: {cohortCourses: CohortCourse[]} =
          await coursesRes.json();

        // Transform the data to match the expected format
        const transformedCourses: Course[] =
          cohortCoursesData.cohortCourses.map(cohortCourse => ({
            id: cohortCourse.id,
            name: cohortCourse.course.name,
            slug: cohortCourse.course.slug,
            courseId: cohortCourse.course.id,
          }));
        setCourses(transformedCourses);
      } catch (err) {
        console.error('Error fetching cohort courses:', err);
        setError(typeof err === 'string' ? err : 'Failed to load courses');
        toast.error('Failed to load cohort courses. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();

    // Reset course selection when cohort changes
    formik.setFieldValue('courseId', '');
    formik.setFieldValue('selectedCourseName', '');
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
            onBlur={formik.handleBlur}
            disabled={isLoading}>
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
                formik.setFieldValue('actualCourseId', course.courseId);
              } else {
                formik.setFieldValue('courseId', e.target.value);
                formik.setFieldValue('selectedCourseName', '');
                formik.setFieldValue('actualCourseId', '');
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
              <TabsTrigger value='enterprise'>Enterprise[For Business Owners]</TabsTrigger>
            </TabsList>

            <CourseSelection />

            <TabsContent value='individual' className='space-y-6 mt-6'>
              <BasicInformation
                formik={formik as any}
                date={date}
                setDate={setDate}
                type='admin'
              />
              <LocationInformation formik={formik as any} />
              <EducationDisability formik={formik as any} />
              <EmploymentResidency formik={formik as any} />
              <ReferralInformation formik={formik as any} />
              <RegistrationTalp formik={formik as any} />
              <JobReadiness formik={formik as any} />
            </TabsContent>

            <TabsContent value='enterprise' className='space-y-6 mt-6'>
              <BasicInformation
                formik={formik as any}
                date={date}
                setDate={setDate}
                type='admin'
              />
              <LocationInformation formik={formik as any} />
              <EmploymentResidency
                formik={formik as any}
                isEnterpriseType={true}
              />
              <BusinessInformation formik={formik as any} />
              <ReferralInformation formik={formik as any} />
            </TabsContent>
          </Tabs>
        </CardContent>
        <Separator />
        <CardFooter className='flex justify-between p-6'>
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
        </CardFooter>
      </Card>
    </form>
  );
};

export default ApplicantCreateForm;
