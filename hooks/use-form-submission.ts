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

      // Build profile object - ensure required fields are included
      const profile: any = {
        phoneNumber: phoneNumber || undefined,
        gender: gender || undefined,
        dob: dob || undefined,
        homeAddress: homeAddress || undefined,
        stateOfResidence: stateOfResidence || undefined,
        communityArea: communityArea || undefined,
        disability: disability || undefined,
        educationLevel: educationLevel || undefined,
        employmentStatus: employmentStatus || undefined,
        employmentSector: employmentSector || undefined,
        residencyStatus: residencyStatus || undefined,
        selfEmployedType: selfEmployedType || undefined,
        ageRange: ageRange || undefined,
        LGADetails: LGADetails || undefined,
        talpParticipation: talpParticipation || false,
        talpType: talpType || undefined,
        talpOther: talpOther || undefined,
        jobReadiness: jobReadiness || [],
        businessSupport: businessSupport || [],
        registrationMode: registrationMode || 'online',
        // Course selection fields
        selectedCourse: selectedCourse || undefined,
        cohortId: cohortId || undefined,
        selectedCourseName: selectedCourseName || undefined,
        selectedCourseId: selectedCourseId || undefined,
        salaryRange: salaryRange || undefined,
      };

      // Debug: Log profile data being sent
      console.log('📤 Profile data being sent to API:', {
        phoneNumber: profile.phoneNumber,
        gender: profile.gender,
        ageRange: profile.ageRange,
        stateOfResidence: profile.stateOfResidence,
        educationLevel: profile.educationLevel,
        dob: profile.dob,
        hasRequiredFields: Boolean(
          profile.phoneNumber &&
          profile.gender &&
          profile.ageRange &&
          profile.stateOfResidence &&
          profile.educationLevel
        )
      });

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
      console.log('📤 Calling editApplicant with:', {
        id: userId,
        body: {
          firstName,
          lastName,
          email,
          profileKeys: Object.keys(profile),
          profile
        }
      });

      const updateResult = await editApplicant({
        id: userId,
        body: {firstName, lastName, email, profile},
      });

      console.log('📥 editApplicant response:', updateResult);

      if (updateResult.data?.message === 'Applicant Updated') {
        console.log('✅ Profile updated successfully - enrollment will happen after email verification');
        // Don't call handleNext() here - let the component handle navigation after showing success toast
        return true;
      }

      console.error('❌ Profile update failed:', updateResult);
      return false;
    } catch (err) {
      console.error('Error submitting form:', err);
      return false;
    }
  };

  return {handleSubmit};
};
