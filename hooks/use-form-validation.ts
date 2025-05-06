import * as Yup from 'yup';
import type {FormValues} from '@/types/applicant';

interface ValidationOptions {
  isEnterpriseType: boolean;
}

export const useFormValidation = ({isEnterpriseType}: ValidationOptions) => {
  // Basic validation schema with Yup
  const validationSchema = Yup.object({
    // Basic required fields
    email: Yup.string()
      .email('Must be a valid email')
      .max(255)
      .required('Email is required'),
    firstName: Yup.string().max(255).required('First Name is required'),
    lastName: Yup.string().max(255).required('Last Name is required'),
    dob: Yup.date()
      .max(
        new Date(new Date().setFullYear(new Date().getFullYear() - 15)),
        'You must be at least 15 years old',
      )
      .nullable()
      .required('Date of Birth is required'),

    // Optional fields with simple validation
    homeAddress: Yup.string().max(255),
    LGADetails: Yup.string().max(255),
    phoneNumber: Yup.string().max(15),
    stateOfResidence: Yup.string().max(255),
    gender: Yup.string().max(6).required('Gender is required'),
    ageRange: Yup.string().max(255).required('Age Range is required'),
    communityArea: Yup.string().required('Community Area is required'),
    disability: Yup.string().max(128),

    // Required fields
    employmentStatus: Yup.string().required('Employment Status is required'),
    employmentSector: Yup.string(),
    residencyStatus: Yup.string().required('Residency Status is required'),

    // Simple conditional validation
    selfEmployedType: Yup.string().max(255),
    referrer_fullName: Yup.string().max(64),
    referrer_phoneNumber: Yup.string().max(16),

    // Enterprise fields - simple validation without conditionals
    businessType: Yup.string().max(255),
    businessSize: Yup.string().max(255),
    businessPartners: Yup.string().max(255),
    companyPhoneNumber: Yup.string().max(15),
    additionalPhoneNumber: Yup.string().max(15),
    companyEmail: Yup.string().email('Must be a valid email').max(255),
  });

  // Custom validation function for form submission
  const validateForm = (values: FormValues) => {
    const errors: Partial<Record<keyof FormValues, string>> = {};

    // Validate self-employed type if employment status is self-employed
    if (
      values.employmentStatus === 'self-employed' &&
      !values.selfEmployedType
    ) {
      errors.selfEmployedType = 'Self-Employed Type is required';
    }

    // Only require employment sector for employed status
    if (values.employmentStatus === 'employed' && !values.employmentSector) {
      errors.employmentSector = 'Employment Sector is required';
    }

    // Validate entrepreneur fields if status is entrepreneur
    if (values.employmentStatus === 'entrepreneur') {
      if (!values.businessName) {
        errors.businessName = 'Business Name is required';
      }
      if (!values.businessType) {
        errors.businessType = 'Business Type is required';
      }
      if (!values.businessSize) {
        errors.businessSize = 'Business Size is required';
      }
      if (!values.businessSector) {
        errors.businessSector = 'Business Sector is required';
      }
    }

    // Validate referrer if source is by_referral
    if (values.source === 'by_referral' && !values.referrer_fullName) {
      errors.referrer_fullName = 'Mobilizer is required';
    }

    // Validate enterprise fields if applicant type is ENTERPRISE
    if (isEnterpriseType) {
      if (!values.businessType)
        errors.businessType = 'Business Type is required';
      if (!values.businessSize)
        errors.businessSize = 'Business Size is required';
      if (!values.businessPartners)
        errors.businessPartners = 'Business Partners is required';
      if (!values.companyPhoneNumber)
        errors.companyPhoneNumber = 'Company Phone Number is required';
      if (!values.additionalPhoneNumber)
        errors.additionalPhoneNumber = 'Additional Phone Number is required';
      if (!values.companyEmail)
        errors.companyEmail = 'Company Email is required';
    }

    return errors;
  };

  return {
    validationSchema,
    validateForm,
  };
};
