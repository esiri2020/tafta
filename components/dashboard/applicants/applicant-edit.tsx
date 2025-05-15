import React, {useState, useEffect, useRef} from 'react';
import {useRouter} from 'next/router';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {useFormik, FormikHelpers, FormikProps} from 'formik';
import * as Yup from 'yup';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardFooter} from '@/components/ui/card';
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
import {useEditApplicantMutation} from '../../../services/api';

// Types
import {FormValues} from '@/types/applicant';

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
  businessName: string;
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

  // Additional fields for form
  type: string;
  projectType: string;
  internshipProgram: string;
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
  projectType?: string;
  internshipProgram?: string;
}

interface ApiError {
  data?: {
    message?: string;
  };
  message?: string;
}

interface ApplicantEditProps {
  applicant: any;
}

const validationSchema = Yup.object().shape({
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
  businessType: Yup.string().when('type', {
    is: 'ENTERPRISE',
    then: schema => schema.required('Business type is required'),
    otherwise: schema => schema.notRequired(),
  }),
  businessSize: Yup.string().when('type', {
    is: 'ENTERPRISE',
    then: schema => schema.required('Business size is required'),
    otherwise: schema => schema.notRequired(),
  }),
  businessSector: Yup.string().when('type', {
    is: 'ENTERPRISE',
    then: schema => schema.required('Business sector is required'),
    otherwise: schema => schema.notRequired(),
  }),
  type: Yup.string()
    .oneOf(['INDIVIDUAL', 'ENTERPRISE'])
    .required('Type is required'),
  registrationMode: Yup.string().required('Registration mode is required'),
});

export const ApplicantEditForm: React.FC<ApplicantEditProps> = ({
  applicant,
}) => {
  console.log('applicant on edit form ', applicant);
  const [updateApplicant] = useEditApplicantMutation();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>(
    applicant.profile?.type === 'ENTERPRISE' ? 'enterprise' : 'individual',
  );
  const [date, setDate] = useState<Date | undefined>(
    applicant.profile?.dob ? new Date(applicant.profile.dob) : undefined,
  );

  const initialValues: LocalFormValues = {
    homeAddress: applicant.profile?.homeAddress || '',
    LGADetails: applicant.profile?.LGADetails || '',
    email: applicant.email || '',
    firstName: applicant.firstName || '',
    middleName: applicant.middleName || '',
    lastName: applicant.lastName || '',
    phoneNumber: applicant.profile?.phoneNumber || '',
    stateOfResidence: applicant.profile?.stateOfResidence || '',
    gender: applicant.profile?.gender || '',
    ageRange: applicant.profile?.ageRange || '',
    educationLevel: applicant.profile?.educationLevel || '',
    communityArea: applicant.profile?.communityArea || '',
    _disability: applicant.profile?.disability ? true : false,
    disability: applicant.profile?.disability || '',
    source: applicant.profile?.source || '',
    referrer_fullName: applicant.profile?.referrer?.fullName || '',
    referrer_phoneNumber: applicant.profile?.referrer?.phoneNumber || '',
    employmentStatus: applicant.profile?.employmentStatus || '',
    employmentSector: applicant.profile?.employmentSector || '',
    residencyStatus: applicant.profile?.residencyStatus || '',
    selfEmployedType: applicant.profile?.selfEmployedType || '',
    type: applicant.profile?.type || 'INDIVIDUAL',
    registrationMode: applicant.profile?.registrationMode || 'online',
    projectType: applicant.profile?.projectType || '',
    internshipProgram: applicant.profile?.internshipProgram || '',
    talpParticipation: applicant.profile?.talpParticipation || false,
    talpType: applicant.profile?.talpType || '',
    talpOther: applicant.profile?.talpOther || '',
    jobReadiness: applicant.profile?.jobReadiness || [],
    salaryRange: applicant.profile?.salaryRange || '',
    revenueRange: applicant.profile?.revenueRange || '',
    entrepreneurBusinessName: applicant.profile?.entrepreneurBusinessName || '',
    entrepreneurBusinessType: applicant.profile?.entrepreneurBusinessType || '',
    entrepreneurBusinessSize: applicant.profile?.entrepreneurBusinessSize || '',
    entrepreneurBusinessSector:
      applicant.profile?.entrepreneurBusinessSector || '',
    entrepreneurCompanyPhoneNumber:
      applicant.profile?.entrepreneurCompanyPhoneNumber || '',
    entrepreneurAdditionalPhoneNumber:
      applicant.profile?.entrepreneurAdditionalPhoneNumber || '',
    entrepreneurCompanyEmail: applicant.profile?.entrepreneurCompanyEmail || '',
    entrepreneurBusinessPartners:
      applicant.profile?.entrepreneurBusinessPartners || '',
    entrepreneurRevenueRange: applicant.profile?.entrepreneurRevenueRange || '',
    entrepreneurRegistrationType:
      applicant.profile?.entrepreneurRegistrationType || [],
    businessSupport: applicant.profile?.businessSupport || [],
    businessSupportNeeds: applicant.profile?.businessSupportNeeds || [],
    businessName: applicant.profile?.businessName || '',
    businessType: applicant.profile?.businessType || '',
    businessSize: applicant.profile?.businessSize || '',
    businessSector: applicant.profile?.businessSector || '',
    businessPartners: applicant.profile?.businessPartners || '',
    companyPhoneNumber: applicant.profile?.companyPhoneNumber || '',
    additionalPhoneNumber: applicant.profile?.additionalPhoneNumber || '',
    companyEmail: applicant.profile?.companyEmail || '',
    dob: applicant.profile?.dob || '',
    submit: null,
  };

  const formik = useFormik<LocalFormValues>({
    initialValues,
    validationSchema,
    onSubmit: async (values, helpers: FormikHelpers<LocalFormValues>) => {
      console.log('Form values before submission:', values);
      if (isSubmitting) return;
      setIsSubmitting(true);

      try {
        // Prepare profile data
        const profileData = {
          type: values.type,
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
          projectType: values.projectType,
          internshipProgram: values.internshipProgram,
        };

        // Add enterprise specific data if type is ENTERPRISE
        if (values.type === 'ENTERPRISE') {
          const profileDataAny = profileData as any;
          profileDataAny.businessName = values.businessName;
          profileDataAny.businessType = values.businessType;
          profileDataAny.businessSize = values.businessSize;
          profileDataAny.businessSector = values.businessSector;
          profileDataAny.businessPartners = values.businessPartners;
          profileDataAny.companyPhoneNumber = values.companyPhoneNumber;
          profileDataAny.additionalPhoneNumber = values.additionalPhoneNumber;
          profileDataAny.companyEmail = values.companyEmail;
          profileDataAny.revenueRange = values.revenueRange;
          profileDataAny.entrepreneurRegistrationType =
            values.entrepreneurRegistrationType || [];
        }

        // Add referrer information if provided
        if (values.referrer_fullName || values.referrer_phoneNumber) {
          (profileData as any).referrer = {
            fullName: values.referrer_fullName,
            phoneNumber: values.referrer_phoneNumber,
          };
        }

        // Prepare request payload
        const requestPayload = {
          id: applicant.id,
          body: {
            firstName: values.firstName,
            lastName: values.lastName,
            middleName: values.middleName || '',
            profile: profileData,
          },
        };

        console.log(
          'API request payload:',
          JSON.stringify(requestPayload, null, 2),
        );

        // Make API request to update applicant
        const response = await updateApplicant(requestPayload).unwrap();

        console.log('API response:', response);

        helpers.setStatus({success: true});
        toast.success('Applicant updated successfully!');
        router.push('/admin-dashboard/applicants');
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

  // Update active tab when type changes
  useEffect(() => {
    setActiveTab(
      formik.values.type === 'INDIVIDUAL' ? 'individual' : 'enterprise',
    );
  }, [formik.values.type]);

  return (
    <form onSubmit={formik.handleSubmit} className='space-y-6'>
      <Card>
        <CardHeader>
          <h3 className='text-lg font-medium'>Edit Applicant</h3>
        </CardHeader>
        <Separator />
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={value => {
              setActiveTab(value);
              formik.setFieldValue(
                'type',
                value === 'individual' ? 'INDIVIDUAL' : 'ENTERPRISE',
              );
            }}>
            <TabsList className='grid grid-cols-2 w-full max-w-md'>
              <TabsTrigger value='individual'>Individual</TabsTrigger>
              <TabsTrigger value='enterprise'>Enterprise</TabsTrigger>
            </TabsList>

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
                ? 'Saving...'
                : 'Save Changes'}
            </Button>
            <Link href={`/admin-dashboard/applicants/${applicant.id}`} passHref>
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
