import { FormikHelpers } from 'formik';
import { Gender, EducationLevel } from '@prisma/client';

export interface RegistrationHandlers {
  activeStep: number;
  steps: string[];
  isStepOptional: (step: number) => boolean;
  handleNext: (email?: string, userId?: string) => void;
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
}

export interface EnterpriseRegistrationFields extends BaseRegistrationFields {
  businessName: string;
  businessType: string;
  revenueRange: string;
  businessRegType: string;
  businessSupportNeeds: string[];
}

export type RegistrationType = 'individual' | 'enterprise';
export type BusinessType = 'STARTUP' | 'EXISTING';

export interface CommonFormValues {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber: string;
  stateOfResidence: string;
  zipCode?: string;
  taftaCenter?: string;
  referrerPhoneNumber?: string;
}

export interface IndividualFormValues extends CommonFormValues {
  dob: string;
  gender: string;
  address: string;
  education: string;
  employmentStatus: string;
  salaryExpectation: string;
  disability: string;
  ageRange?: string;
  communityArea?: string;
  stateOfOrigin?: string;
  LGADetails?: string;
  residencyStatus?: string;
  zipCode?: string;
  taftaCenter?: string;
  internshipProgram?: string;
  projectType?: string;
  currentSalary?: string;
  registrationMode?: 'ONLINE' | 'LEARNING_TRAIN';
  jobReadinessInterests?: string[];
  incomeRange?: string;
}

export interface EnterpriseFormValues extends CommonFormValues {
  businessName?: string;
  businessAddress: string;
  yearEstablished: string;
  numberOfEmployees: string;
  businessDescription: string;
  businessType: BusinessType;
  revenueRange: string;
  businessRegType: string;
  businessSupportNeeds: string[];
}

export type FormValues = IndividualFormValues | EnterpriseFormValues;

export function isEnterpriseFormValues(values: FormValues): values is EnterpriseFormValues {
  return (values as EnterpriseFormValues).businessType !== undefined;
}

export function isIndividualFormValues(values: FormValues): values is IndividualFormValues {
  return (values as IndividualFormValues).education !== undefined;
} 