'use client';

import {useEffect, useState} from 'react';
import {useFormik, FormikHelpers} from 'formik';
import {useRouter} from 'next/router';
import {Card, CardContent} from '@/components/ui/card';
import {Button} from '@/components/ui/button';

// Types
import type {Applicant, FormValues} from '@/types/applicant';

// Custom hooks
import {useFormValidation} from '@/hooks/use-form-validation';
import {useFormSubmission} from '@/hooks/use-form-submission';

// Form sections
import {BasicInformation} from '@/components/home/form-sections/basic-information';
import {LocationInformation} from '@/components/home/form-sections/location-information';
import {EducationDisability} from '@/components/home/form-sections/education-disability';
import {EmploymentResidency} from '@/components/home/form-sections/employment-residency';
import {ReferralInformation} from '@/components/home/form-sections/referral-information';
import {RegistrationTalp} from '@/components/home/form-sections/registration-talp';
import {JobReadiness} from '@/components/home/form-sections/job-readiness';
import {BusinessInformation} from '@/components/home/form-sections/business-information';
import {useCreateEnrollmentMutation} from '@/services/api';

// Update the PersonalInformationProps interface to make props optional
interface PersonalInformationProps {
  userId?: string;
  applicant?: Applicant;
  handlers?: {
    activeStep: number;
    isStepOptional: (step: number) => boolean;
    handleNext: () => void;
    handleBack: () => void;
    handleSkip: () => void;
  };
  state?: {
    editApplicant: (params: {id: string; body: any}) => Promise<any>;
  };
}

/**
 * PersonalInformation Component
 *
 * A multi-section form for collecting personal information from applicants.
 * This component is designed to be part of a multi-step form process.
 */
const PersonalInformation = ({
  userId = '',
  applicant = {},
  handlers = {
    activeStep: 0,
    isStepOptional: () => false,
    handleNext: () => {},
    handleBack: () => {},
    handleSkip: () => {},
  },
  state = {
    editApplicant: async () => ({data: {message: 'Mock response'}}),
  },
}: PersonalInformationProps) => {
  const {activeStep, isStepOptional, handleNext, handleBack, handleSkip} =
    handlers;
  const [date, setDate] = useState<Date | undefined>(undefined);
  const {editApplicant} = state;
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add utility function to scroll to first error
  const scrollToFirstError = (errors: Record<string, any>) => {
    const firstErrorField = Object.keys(errors)[0];

    if (firstErrorField) {
      // Try multiple selectors to find the error field
      const errorElement =
        document.querySelector(`[data-field="${firstErrorField}"]`) || // Try by data-field
        document.querySelector(`[name="${firstErrorField}"]`) || // Try by name
        document.querySelector(`#${firstErrorField}`); // Try by id

      if (errorElement) {
        // Add a small delay to ensure the DOM is ready
        setTimeout(() => {
          // Scroll the element into view
          errorElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });

          // Add temporary highlight effect
          errorElement.classList.add('error-highlight');
          setTimeout(() => {
            errorElement.classList.remove('error-highlight');
          }, 2000);

          // Try to focus the first input/select element
          const input = errorElement.querySelector('input, select, textarea');
          if (input) {
            (input as HTMLElement).focus();
          }
        }, 100);
      } else {
        // If we can't find the exact field, try scrolling to the form section
        const formSection = document.querySelector(
          `[data-section="${firstErrorField.split('.')[0]}"]`,
        );
        if (formSection) {
          formSection.scrollIntoView({behavior: 'smooth', block: 'start'});
        }
      }
    }
  };

  // Add CSS for error highlight effect
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .error-highlight {
        animation: errorPulse 2s ease-out;
      }
      @keyframes errorPulse {
        0% { 
          box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
          transform: scale(1);
        }
        50% {
          box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
          transform: scale(1.02);
        }
        100% { 
          box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
          transform: scale(1);
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Check if applicant is enterprise type
  const isEnterpriseType = applicant?.profile?.type === 'ENTERPRISE';

  // Enrollment will happen after email verification, not here

  // Initialize form values from applicant data
  const initialValues: FormValues = {
    homeAddress: applicant?.profile?.homeAddress || '',
    LGADetails: applicant?.profile?.LGADetails || '',
    email: applicant?.email || '',
    firstName: applicant?.firstName || '',
    lastName: applicant?.lastName || '',
    middleName: applicant?.middleName || '',
    phoneNumber: applicant?.profile?.phoneNumber || '',
    stateOfResidence: applicant?.profile?.stateOfResidence || '',
    gender: applicant?.profile?.gender || 'MALE',
    ageRange: applicant?.profile?.ageRange || '',
    educationLevel: applicant?.profile?.educationLevel || '',
    communityArea: applicant?.profile?.communityArea || '',
    _disability: applicant?.profile?.disability ? true : false,
    disability: applicant?.profile?.disability || '',
    source: applicant?.profile?.referrer ? 'by_referral' : '',
    referrer_fullName: applicant?.profile?.referrer?.fullName || '',
    referrer_phoneNumber: applicant?.profile?.referrer?.phoneNumber || '',
    employmentStatus: applicant?.profile?.employmentStatus || '',
    employmentSector: applicant?.profile?.employmentSector || '',
    residencyStatus: applicant?.profile?.residencyStatus || '',
    selfEmployedType: applicant?.profile?.selfEmployedType || '',
    registrationMode: applicant?.profile?.registrationMode || 'online',
    talpParticipation: applicant?.profile?.talpParticipation === true,
    talpType: applicant?.profile?.talpType || '',
    talpOther: applicant?.profile?.talpOther || '',
    jobReadiness: applicant?.profile?.jobReadiness || [],
    entrepreneurBusinessName:
      applicant?.profile?.entrepreneurBusinessName || '',
    entrepreneurBusinessType:
      applicant?.profile?.entrepreneurBusinessType || '',
    entrepreneurBusinessSize:
      applicant?.profile?.entrepreneurBusinessSize || '',
    entrepreneurBusinessSector:
      applicant?.profile?.entrepreneurBusinessSector || '',
    entrepreneurCompanyPhoneNumber:
      applicant?.profile?.entrepreneurCompanyPhoneNumber || '',
    entrepreneurAdditionalPhoneNumber:
      applicant?.profile?.entrepreneurAdditionalPhoneNumber || '',
    entrepreneurCompanyEmail:
      applicant?.profile?.entrepreneurCompanyEmail || '',
    entrepreneurBusinessPartners:
      applicant?.profile?.entrepreneurBusinessPartners || '',
    entrepreneurRevenueRange:
      applicant?.profile?.entrepreneurRevenueRange || '',
    entrepreneurRegistrationType:
      applicant?.profile?.entrepreneurRegistrationType || [],
    businessSupport: applicant?.profile?.businessSupport || [],
    businessSupportNeeds: applicant?.profile?.businessSupportNeeds || [],
    businessType: applicant?.profile?.businessType || '',
    businessSector: applicant?.profile?.businessSector || '',
    salaryRange: applicant?.profile?.salaryRange || '',
    businessSize: applicant?.profile?.businessSize || '',
    businessPartners: applicant?.profile?.businessPartners || '',
    companyPhoneNumber: applicant?.profile?.companyPhoneNumber || '',
    additionalPhoneNumber: applicant?.profile?.additionalPhoneNumber || '',
    companyEmail: applicant?.profile?.companyEmail || '',
    revenueRange: applicant?.profile?.revenueRange || '',
    dob: applicant?.profile?.dob || '',
    submit: null,
  };

  // Get validation schema and custom validation function
  const {validationSchema, validateForm} = useFormValidation({
    isEnterpriseType,
  });

  // Get form submission handler
  const {handleSubmit} = useFormSubmission({
    userId,
    applicant,
    editApplicant,
    handleNext,
  });

  // Initialize formik
  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnChange: false, // Only validate on submit and blur
    validateOnBlur: true,
    validate: values => {
      const errors = validateForm(values);
      return errors;
    },
    onSubmit: async (values, helpers: FormikHelpers<FormValues>) => {
      setIsSubmitting(true);

      try {
        // Submit the form
        const success = await handleSubmit(values);
        if (success) {
          helpers.setStatus({success: true});
        } else {
          helpers.setStatus({success: false});
          helpers.setErrors({submit: 'Failed to update profile'});
          // Scroll to first error if submission fails
          scrollToFirstError(formik.errors);
        }
      } catch (error) {
        helpers.setStatus({success: false});
        helpers.setErrors({submit: 'An unexpected error occurred'});
        // Scroll to first error if submission fails
        scrollToFirstError(formik.errors);
      } finally {
        helpers.setSubmitting(false);
        setIsSubmitting(false);
      }
    },
  });

  // Add effect to handle validation errors
  useEffect(() => {
    if (Object.keys(formik.errors).length > 0 && formik.submitCount > 0) {
      scrollToFirstError(formik.errors);
    }
  }, [formik.submitCount, formik.errors]);

  // Initialize date from form value when component mounts
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

  return (
    <div className='w-full mx-auto'>
      <Card>
        <CardContent className='p-6'>
          <h2 className='text-2xl font-semibold mb-8'>Personal Information</h2>

          <form onSubmit={formik.handleSubmit} className='space-y-8'>
            {/* Personal Details Section */}
            <BasicInformation formik={formik} date={date} setDate={setDate} />

            {/* Location Section */}
            <LocationInformation formik={formik} />

            {/* Education & Disability Section */}
            <EducationDisability formik={formik} />

            {/* Employment & Residency Section */}
            <EmploymentResidency
              formik={formik}
              isEnterpriseType={isEnterpriseType}
            />

            {/* Referral Section */}
            <ReferralInformation formik={formik} />

            {/* Registration & TALP Section */}
            <RegistrationTalp formik={formik} />

            {/* Job Readiness Section */}
            <JobReadiness formik={formik} />

            {/* Enterprise Section - Only shown for enterprise users */}
            {isEnterpriseType && <BusinessInformation formik={formik} />}

            {/* Form Actions */}
            <div className='flex justify-between pt-6'>
              <Button
                type='button'
                variant='outline'
                onClick={handleBack}
                disabled={activeStep === 1 || isSubmitting}>
                Back
              </Button>

              <div className='flex space-x-2'>
                {isStepOptional(activeStep) && (
                  <Button
                    type='button'
                    variant='ghost'
                    onClick={handleSkip}
                    disabled={isSubmitting}>
                    Skip
                  </Button>
                )}
                <Button
                  type='submit'
                  disabled={formik.isSubmitting || isSubmitting}>
                  {formik.isSubmitting || isSubmitting
                    ? 'Saving...'
                    : 'Continue'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalInformation;
