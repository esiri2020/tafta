export interface Applicant {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  profile?: {
    type?: 'INDIVIDUAL' | 'ENTERPRISE';
    phoneNumber?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    dob?: string;
    homeAddress?: string;
    zipCode?: string;
    stateOfResidence?: string;
    communityArea?: 'URBAN' | 'RURAL' | 'PERI_URBANS';
    disability?: string;
    educationLevel?:
      | 'ELEMENTRY_SCHOOL'
      | 'SECONDARY_SCHOOL'
      | 'COLLEGE_OF_EDUCATION'
      | 'ND_HND'
      | 'BSC'
      | 'MSC'
      | 'PHD';
    source?: string;
    employmentStatus?: string;
    residencyStatus?: string;
    selfEmployedType?: string;
    stateOfOrigin?: string;
    ageRange?: string;
    LGADetails?: string;
    businessName?: string;
    businessSupportNeeds?: string[];
    businessType?: 'INFORMAL' | 'STARTUP' | 'FORMAL_EXISTING';
    businessSize?: 'MICRO' | 'SMALL' | 'MEDIUM' | 'LARGE';
    businessSector?: string;
    businessPartners?: string;
    companyPhoneNumber?: string;
    additionalPhoneNumber?: string;
    companyEmail?: string;
    currentSalary?: number;
    registrationPath?: 'INDIVIDUAL' | 'ENTERPRISE';
    registrationType?: 'CAC' | 'SMEDAN';
    revenueRange?: string;
    salaryExpectation?: number;
    salaryRange?: string;
    internshipProgram?: string;
    projectType?: string;
    talpParticipation?: boolean;
    talpType?: string;
    talpOther?: string;
    jobReadiness?: string[];
    businessSupport?: string[];
    registrationMode?: string;
    selectedCourse?: string;
    cohortId?: string;
    selectedCourseName?: string;
    selectedCourseId?: string;
    referrer?: {
      fullName: string;
      phoneNumber: string;
    };
  };
}

export interface FormValues {
  homeAddress: string;
  LGADetails: string;
  email: string;
  firstName: string;
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
  residencyStatus: string;
  selfEmployedType: string;
  registrationMode: string;
  talpParticipation: boolean;
  talpType: string;
  talpOther: string;
  jobReadiness: string[];
  salaryRange: string;
  revenueRange: string;
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
}
