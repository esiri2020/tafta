import { FormikHelpers } from 'formik';
import { Gender, EducationLevel } from '@prisma/client';

export interface RegistrationHandlers {
  activeStep: number;
  steps: string[];
  isStepOptional: (step: number) => boolean;
  handleNext: (email?: string) => void;
  handleBack: () => void;
  handleSkip: () => void;
  setActiveStep: (step: number) => void;
}

export interface BaseRegistrationFields {
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface IndividualRegistrationFields extends BaseRegistrationFields {
  employmentStatus: string;
  salaryExpectation: string;
  // Other fields will be added later after email verification
}

export interface EnterpriseRegistrationFields extends BaseRegistrationFields {
  businessName: string;
  businessType: 'startup' | 'existing';
  revenueRange: string;
  registrationType: 'CAC' | 'SMEDAN';
  businessSupportNeeds: string[];
}

export type RegistrationType = 'individual' | 'enterprise';
export type BusinessType = 'STARTUP' | 'EXISTING';

export type CommonFormValues = {
  phoneNumber: string;
  stateOfResidence: string;
};

export type EnterpriseFormValues = CommonFormValues & {
  businessAddress: string;
  yearEstablished: string;
  numberOfEmployees: string;
  businessDescription: string;
  businessType: BusinessType;
  revenueRange: string;
};

export type IndividualFormValues = CommonFormValues & {
  dob: string;
  gender: Gender;
  address: string;
  education: EducationLevel;
  employmentStatus: string;
  disability?: string;
};

export type FormValues = EnterpriseFormValues | IndividualFormValues;

export const isEnterpriseFormValues = (values: FormValues): values is EnterpriseFormValues => {
  return 'businessType' in values;
};

export const isIndividualFormValues = (values: FormValues): values is IndividualFormValues => {
  return 'employmentStatus' in values;
}; 