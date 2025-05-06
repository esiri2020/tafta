'use client';

import {useEffect, useState} from 'react';
import {useFormik} from 'formik';
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
import {EntrepreneurInformation} from '@/components/home/form-sections/entrepreneur-information';
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

  // Check if applicant is enterprise type
  const isEnterpriseType = applicant?.profile?.type === 'ENTERPRISE';

  const [createEnrollment] = useCreateEnrollmentMutation();

  // Initialize form values from applicant data
  const initialValues: FormValues = {
    homeAddress: applicant?.profile?.homeAddress || '',
    LGADetails: applicant?.profile?.LGADetails || '',
    email: applicant?.email || '',
    firstName: applicant?.firstName || '',
    lastName: applicant?.lastName || '',
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
    registrationType: applicant?.profile?.registrationType || '',
    talpParticipation: applicant?.profile?.talpParticipation === true,
    talpType: applicant?.profile?.talpType || '',
    talpOther: applicant?.profile?.talpOther || '',
    jobReadiness: applicant?.profile?.jobReadiness || [],
    businessSupport: applicant?.profile?.businessSupport || [],
    businessSupportNeeds: applicant?.profile?.businessSupportNeeds || [],
    businessType: applicant?.profile?.businessType || '',
    businessSector: applicant?.profile?.businessSector || '',
    businessSize: applicant?.profile?.businessSize || '',
    businessName: applicant?.profile?.businessName || '',
    businessPartners: applicant?.profile?.businessPartners || '',
    companyPhoneNumber: applicant?.profile?.companyPhoneNumber || '',
    additionalPhoneNumber: applicant?.profile?.additionalPhoneNumber || '',
    companyEmail: applicant?.profile?.companyEmail || '',
    revenueRange: applicant?.profile?.revenueRange || '',
    salaryRange: applicant?.profile?.salaryRange || '',
    dob: applicant?.profile?.dob || '',
    submit: null,
  };

  // Get validation schema and custom validation function
  const {validationSchema, validateForm} = useFormValidation({
    isEnterpriseType,
  });

  // Wrap the validation function to add logging
  const validateFormWithLogging = (values: FormValues) => {
    const errors = validateForm(values);
    return errors;
  };

  // Get form submission handler
  const {handleSubmit} = useFormSubmission({
    userId,
    applicant,
    editApplicant,
    createEnrollment,
    handleNext,
  });

  // Initialize formik
  const formik = useFormik({
    initialValues,
    validationSchema,
    validate: validateFormWithLogging,
    onSubmit: async (values, helpers) => {
      setIsSubmitting(true);

      try {
        // Submit the form
        const success = await handleSubmit(values);
        if (success) {
          helpers.setStatus({success: true});
        } else {
          helpers.setStatus({success: false});
          helpers.setErrors({submit: 'Failed to update profile'});
        }
      } catch (error) {
        console.error('Error in form submission:', error);
        helpers.setStatus({success: false});
        helpers.setErrors({submit: 'An unexpected error occurred'});
      } finally {
        helpers.setSubmitting(false);
        setIsSubmitting(false);
      }
    },
  });

  // Check for entrepreneur status
  const isEntrepreneurStatus =
    formik.values.employmentStatus === 'entrepreneur';

  // Set defaults for employment sector based on status
  useEffect(() => {
    if (
      formik.values.employmentStatus === 'employed' &&
      !formik.values.employmentSector
    ) {
      // For employed users, default to 'other' if not set
      formik.setFieldValue('employmentSector', 'other');
    } else if (formik.values.employmentStatus === 'entrepreneur') {
      // For entrepreneurs, clear employment sector if set
      if (formik.values.employmentSector) {
        formik.setFieldValue('employmentSector', '');
      }
    }
  }, [formik.values.employmentStatus]);

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

            {/* Entrepreneur Section - Only shown for entrepreneur employment status */}
            {isEntrepreneurStatus && (
              <EntrepreneurInformation formik={formik} />
            )}

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
                  type='button'
                  disabled={formik.isSubmitting || isSubmitting}
                  onClick={async e => {
                    e.preventDefault();

                    // If button is disabled or form is already submitting, don't proceed
                    if (formik.isSubmitting || isSubmitting) return;

                    // Manually validate and submit
                    try {
                      setIsSubmitting(true);
                      formik.setSubmitting(true);

                      // Validate form
                      const errors = await formik.validateForm();

                      if (Object.keys(errors).length === 0) {
                        // Form is valid, proceed with submission
                        try {
                          const success = await handleSubmit(formik.values);
                          if (success) {
                            formik.setStatus({success: true});
                            // Force navigation to next step if handleSubmit didn't do it
                            handleNext();
                          } else {
                            formik.setStatus({success: false});
                            formik.setErrors({
                              submit: 'Failed to update profile',
                            });
                          }
                        } catch (submitError) {
                          console.error(
                            'Error during submission:',
                            submitError,
                          );
                          formik.setStatus({success: false});
                          formik.setErrors({
                            submit: 'An unexpected error occurred',
                          });
                        }
                      } else {
                        formik.setTouched(
                          Object.keys(errors).reduce(
                            (touched: Record<string, boolean>, field) => {
                              touched[field] = true;
                              return touched;
                            },
                            {},
                          ),
                        );
                      }
                    } catch (error) {
                      console.error('Error in manual form submission:', error);
                    } finally {
                      setIsSubmitting(false);
                      formik.setSubmitting(false);
                    }
                  }}>
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
