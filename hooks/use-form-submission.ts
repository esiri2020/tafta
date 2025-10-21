import type {Applicant, FormValues} from '@/types/applicant';

interface SubmissionOptions {
  userId: string;
  applicant: Applicant;
  editApplicant: (params: {id: string; body: any}) => Promise<any>;
  handleNext: () => void;
}

export const useFormSubmission = ({
  userId,
  applicant,
  editApplicant,
  handleNext,
}: SubmissionOptions) => {
  /**
   * Handles form submission by updating applicant data and creating enrollment if needed
   * @param values - Form values to be submitted
   * @returns Promise<boolean> - Success status of the submission
   */
  const handleSubmit = async (values: FormValues): Promise<boolean> => {
    try {
      // Extract values for profile update
      const {
        firstName,
        lastName,
        email,
        phoneNumber,
        gender,
        dob,
        ageRange,
        homeAddress,
        stateOfResidence,
        communityArea,
        disability,
        educationLevel,
        source,
        employmentStatus,
        residencyStatus,
        selfEmployedType,
        LGADetails,
        talpParticipation,
        talpType,
        talpOther,
        jobReadiness,
        businessSupport,
        registrationMode,
        businessSupportNeeds,
        businessType,
        businessSector,
        salaryRange,
        revenueRange,
        businessSize,
        businessPartners,
        companyPhoneNumber,
        additionalPhoneNumber,
        companyEmail,
        employmentSector,
      } = values;

      // Check if this is an individual or enterprise applicant
      const isEnterpriseType = applicant?.profile?.type === 'ENTERPRISE';

      // Get course information from localStorage or applicant data
      const selectedCourse =
        applicant?.profile?.selectedCourse ||
        localStorage.getItem('selectedCourse') ||
        '';
      const cohortId =
        applicant?.profile?.cohortId ||
        localStorage.getItem('selectedCohortId') ||
        '';
      const selectedCourseName =
        applicant?.profile?.selectedCourseName ||
        localStorage.getItem('selectedCourseName') ||
        '';
      const selectedCourseId =
        applicant?.profile?.selectedCourseId ||
        localStorage.getItem('selectedCourseActualId') ||
        '';

      // Debug logging
      console.log('Enrollment creation check:', {
        selectedCourse,
        cohortId,
        selectedCourseId,
        selectedCourseName,
        hasAllRequiredFields: Boolean(
          selectedCourse && cohortId && selectedCourseId && selectedCourseName,
        ),
      });

      // Build profile object
      const profile: any = {
        phoneNumber,
        gender,
        dob,
        homeAddress,
        stateOfResidence,
        communityArea,
        disability,
        educationLevel,
        employmentStatus,
        employmentSector,
        residencyStatus,
        selfEmployedType,
        ageRange,
        LGADetails,
        talpParticipation,
        talpType,
        talpOther,
        jobReadiness,
        businessSupport,
        registrationMode,
        // Course selection fields
        selectedCourse,
        cohortId,
        selectedCourseName,
        selectedCourseId,
        salaryRange,
      };

      // Only include business fields for enterprise applicants or set valid default values for individuals
      if (isEnterpriseType) {
        // For enterprise applicants, include all business fields
        profile.businessSupportNeeds = businessSupportNeeds;
        profile.businessType = businessType; //
        profile.businessSector = businessSector;
        profile.salaryRange = salaryRange;
        profile.revenueRange = revenueRange;
        profile.businessSize = businessSize;
        profile.businessPartners = businessPartners;
        profile.companyPhoneNumber = companyPhoneNumber;
        profile.additionalPhoneNumber = additionalPhoneNumber;
        profile.companyEmail = companyEmail;
      }

      // Add referrer if source is by_referral
      if (source === 'by_referral') {
        profile.referrer = {
          fullName: values.referrer_fullName,
          phoneNumber: values.referrer_phoneNumber,
        };
      }

      // Update applicant
      const updateResult = await editApplicant({
        id: userId,
        body: {firstName, lastName, email, profile},
      });

      if (updateResult.data?.message === 'Applicant Updated') {
        console.log('✅ Profile updated successfully - enrollment will happen after email verification');
        handleNext();
        return true;
      }

      return false;
    } catch (err) {
      console.error('Error submitting form:', err);
      return false;
    }
  };

  return {handleSubmit};
};
