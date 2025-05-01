import type {Applicant, FormValues} from '@/types/applicant';

interface SubmissionOptions {
  userId: string;
  applicant: Applicant;
  editApplicant: (params: {id: string; body: any}) => Promise<any>;
  createEnrollment: (params: {body: any}) => Promise<any>;
  handleNext: () => void;
}

export const useFormSubmission = ({
  userId,
  applicant,
  editApplicant,
  createEnrollment,
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

      // Get course information from sessionStorage or applicant data
      const selectedCourse =
        applicant?.profile?.selectedCourse ||
        sessionStorage.getItem('selectedCourse') ||
        '';
      const cohortId =
        applicant?.profile?.cohortId ||
        sessionStorage.getItem('selectedCohortId') ||
        '';
      const selectedCourseName =
        applicant?.profile?.selectedCourseName ||
        sessionStorage.getItem('selectedCourseName') ||
        '';
      const selectedCourseId =
        applicant?.profile?.selectedCourseId ||
        sessionStorage.getItem('selectedCourseActualId') ||
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
        // Ensure businessType is a valid enum value or null
        profile.businessType = businessType && ['INFORMAL', 'STARTUP', 'FORMAL_EXISTING'].includes(businessType)
          ? businessType
          : null;
        profile.businessSector = businessSector;
        profile.salaryRange = salaryRange;
        profile.revenueRange = revenueRange;
        // Ensure businessSize is a valid enum value or null
        profile.businessSize = businessSize && ['MICRO', 'SMALL', 'MEDIUM', 'LARGE'].includes(businessSize)
          ? businessSize
          : null;
        profile.businessPartners = businessPartners;
        profile.companyPhoneNumber = companyPhoneNumber;
        profile.additionalPhoneNumber = additionalPhoneNumber;
        profile.companyEmail = companyEmail;
      } else {
        // For individual applicants, explicitly set business fields to null
        profile.businessType = null;
        profile.businessSize = null;
        profile.businessSector = null;
        profile.businessPartners = null;
        profile.companyPhoneNumber = null;
        profile.additionalPhoneNumber = null;
        profile.companyEmail = null;
        profile.revenueRange = null;
        profile.businessSupportNeeds = [];
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
        // Create enrollment if course info is available
        if (
          selectedCourse &&
          cohortId &&
          selectedCourseId &&
          selectedCourseName
        ) {
          console.log('Attempting to create enrollment with:', {
            userCohortId: cohortId,
            course_id: Number.parseInt(selectedCourseId),
            course_name: selectedCourseName,
            user_email: email,
          });
          try {
            await createEnrollment({
              body: {
                userCohortId: cohortId,
                course_id: Number.parseInt(selectedCourseId),
                course_name: selectedCourseName,
                user_email: email,
              },
            });
            console.log('Enrollment created successfully');
            handleNext();
          } catch (enrollErr) {
            console.error('Error creating enrollment:', enrollErr);
          }
        } else {
          console.log('Skipping enrollment creation - missing required fields');
        }

        // Move to next step
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
