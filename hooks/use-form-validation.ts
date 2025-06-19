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
    middleName: Yup.string().max(255).required('Middle Name is required'),
    dob: Yup.date()
      .max(
        new Date(new Date().setFullYear(new Date().getFullYear() - 15)),
        'You must be at least 15 years old',
      )
      .nullable()
      .required('Date of Birth is required'),

    // Location fields
    homeAddress: Yup.string().required('Home Address is required'),
    LGADetails: Yup.string().max(255).required('LGA Details is required'),
    phoneNumber: Yup.string().max(15).required('Phone Number is required'),
    stateOfResidence: Yup.string()
      .max(255)
      .required('State of Residence is required'),
    gender: Yup.string().max(6).required('Gender is required'),
    ageRange: Yup.string().max(255).required('Age Range is required'),
    communityArea: Yup.string().required('Community Area is required'),

    // Education fields
    educationLevel: Yup.string().required('Education Level is required'),

    // Disability fields
    _disability: Yup.boolean().required(
      'Please indicate if you have any disabilities',
    ),
    disability: Yup.string().when('_disability', {
      is: true,
      then: schema => schema.required('Please specify your disability'),
      otherwise: schema => schema.notRequired(),
    }),

    // Source/Referral fields
    source: Yup.string().required('Please specify how you heard about us'),
    referrer_fullName: Yup.string().when('source', {
      is: 'by_referral',
      then: schema => schema.required('Mobilizer name is required'),
      otherwise: schema => schema.notRequired(),
    }),
    referrer_phoneNumber: Yup.string().when('source', {
      is: 'by_referral',
      then: schema => schema.notRequired(),
      otherwise: schema => schema.notRequired(),
    }),

    // Employment fields
    employmentStatus: Yup.string().required('Employment Status is required'),
    employmentSector: Yup.string().when('employmentStatus', {
      is: 'employed',
      then: schema => schema.required('Employment Sector is required'),
      otherwise: schema => schema.notRequired(),
    }),
    residencyStatus: Yup.string().required('Residency Status is required'),
    selfEmployedType: Yup.string().when('employmentStatus', {
      is: 'self-employed',
      then: schema => schema.required('Self-Employed Type is required'),
      otherwise: schema => schema.notRequired(),
    }),

    // Job Readiness Indicators
    jobReadiness: Yup.array().of(Yup.string()),

    // Registration fields
    talpParticipation: Yup.boolean().required(
      'Please indicate TALP participation',
    ),
    talpType: Yup.string().when('talpParticipation', {
      is: true,
      then: schema => schema.required('TALP Type is required'),
      otherwise: schema => schema.notRequired(),
    }),
    talpOther: Yup.string().when(['talpParticipation', 'talpType'], {
      is: (participation: boolean, type: string) =>
        participation && type === 'other',
      then: schema => schema.required('Please specify other TALP type'),
      otherwise: schema => schema.notRequired(),
    }),

    // Enterprise-specific fields (only required if isEnterpriseType is true)
    ...(isEnterpriseType
      ? {
          entrepreneurBusinessName: Yup.string().required(
            'Business Name is required',
          ),
          entrepreneurBusinessType: Yup.string().required(
            'Business Type is required',
          ),
          entrepreneurBusinessSize: Yup.string().required(
            'Business Size is required',
          ),
          entrepreneurBusinessSector: Yup.string().required(
            'Business Sector is required',
          ),
          entrepreneurCompanyPhoneNumber: Yup.string()
            .matches(/^[0-9]+$/, 'Phone number must contain only digits')
            .required('Company Phone Number is required'),
          entrepreneurAdditionalPhoneNumber: Yup.string()
            .matches(/^[0-9]+$/, 'Phone number must contain only digits')
            .required('Additional Phone Number is required'),
          entrepreneurCompanyEmail: Yup.string()
            .email('Invalid email format')
            .required('Company Email is required'),
          entrepreneurBusinessPartners: Yup.string()
            .max(255, 'Business partners must be at most 255 characters')
            .required('Business Partners information is required'),
          entrepreneurRevenueRange: Yup.string().required(
            'Revenue Range is required',
          ),
          entrepreneurRegistrationType: Yup.array()
            .min(1, 'At least one registration type must be selected')
            .required('Registration Type is required'),
          businessSupport: Yup.array()
            .min(1, 'At least one business support option must be selected')
            .required('Business Support is required'),
          businessSupportNeeds: Yup.array()
            .min(1, 'At least one business support need must be selected')
            .required('Business Support Needs are required'),
        }
      : {}),
  });

  // Custom validation function for form submission
  const validateForm = (values: FormValues) => {
    const errors: Partial<Record<keyof FormValues, string>> = {};

    // Validate employment sector only if employed
    if (values.employmentStatus === 'employed' && !values.employmentSector) {
      errors.employmentSector = 'Employment Sector is required';
    }

    // Remove any validation errors for fields that should not be validated
    // based on the current employment status
    if (values.employmentStatus !== 'employed') {
      delete errors.employmentSector;
    }

    // Validate referrer if source is by_referral
    if (values.source === 'by_referral') {
      if (!values.referrer_fullName) {
        errors.referrer_fullName = 'Mobilizer name is required';
      }
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
