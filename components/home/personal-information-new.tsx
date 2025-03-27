import { FC, ReactElement, useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box, Container, Card, CardContent, Grid, TextField,
  Typography, MenuItem, Button, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, FormGroup, Checkbox, Alert, InputLabel, Select, FormHelperText, CircularProgress
} from '@mui/material';
import { useGetApplicantQuery, useEditApplicantMutation } from '../../services/api';
import { useRouter } from 'next/router';
import { Gender, EducationLevel, CommunityArea, InternshipProgramOption, ProjectTypeOption, BusinessRegistrationType } from '@prisma/client';
import {
  EnterpriseFormValues,
  IndividualFormValues,
  isEnterpriseFormValues,
  isIndividualFormValues,
  BusinessType,
  RegistrationType
} from '../../types/registration';
import React from 'react';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { FormikTouched, FormikErrors } from 'formik';

interface Applicant {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  profile?: {
    type: RegistrationType;
    taftaCenter?: string;
    homeAddress?: string;
    zipCode?: string;
    phoneNumber?: string;
    gender?: Gender;
    ageRange?: string;
    stateOfResidence?: string;
    dob?: Date;
    communityArea?: CommunityArea;
    disability?: string;
    educationLevel?: EducationLevel;
    source?: string;
    employmentStatus?: string;
    residencyStatus?: string;
    selfEmployedType?: string;
    stateOfOrigin?: string;
    lGADetails?: string;
    LGADetails?: string;
    internshipProgram?: InternshipProgramOption;
    projectType?: ProjectTypeOption;
    registrationPath: RegistrationType;
    currentSalary?: number;
    salaryExpectation?: number;
    businessName?: string;
    businessType?: BusinessType;
    revenueRange?: string;
    registrationType?: BusinessRegistrationType;
    businessSupportNeeds: string[];
  };
}

interface GetApplicantResponse {
  applicant: Applicant;
}

interface PersonalInformationProps {
  handlers: {
    handleNext: () => void;
    handleBack: () => void;
  };
  userId: string;
  registrationType: RegistrationType;
  courseId: string;
  applicant: any;
  data: any;
}

export const PersonalInformation: React.FC<PersonalInformationProps> = ({
  handlers,
  registrationType,
  courseId,
  userId,
  applicant: initialApplicant,
  data: initialData
}) => {
  const { handleNext, handleBack } = handlers;
  const [applicant, setApplicant] = useState<Applicant | null>(initialApplicant || null);
  const [data, setData] = useState<GetApplicantResponse | null>(initialData || null);
  const [editApplicant] = useEditApplicantMutation();

  console.log(applicant, data);

  // Update state when props change
  useEffect(() => {
    if (initialApplicant) {
      setApplicant(initialApplicant);
    }
    if (initialData) {
      setData(initialData);
    }
  }, [initialApplicant, initialData]);

  // Show loading state if no data yet
  if (!applicant || !data) {
    return (
      <Box sx={{ mt: 3 }}>
        <Card>
          <CardContent sx={{ py: 4 }}>
            <Typography variant="h6" align="center">
              Loading applicant information...
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <CircularProgress />
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Extract applicant data for easier access  
  const profile = applicant?.profile;

  // Determine type of user for form display
  const isEnterprise = registrationType === 'enterprise';

  const getEnterpriseFormInitialValues = (profile?: any, applicant?: any): EnterpriseFormValues => {
    return {
      firstName: applicant?.firstName || '',
      lastName: applicant?.lastName || '',
      email: applicant?.email || '',
      businessAddress: profile?.homeAddress || '',
      yearEstablished: profile?.yearEstablished || '',
      numberOfEmployees: profile?.numberOfEmployees?.toString() || '',
      businessDescription: profile?.businessDescription || '',
      businessType: profile?.businessType || 'STARTUP',
      revenueRange: profile?.revenueRange || 'UNDER_1M',
      phoneNumber: profile?.phoneNumber || '',
      stateOfResidence: profile?.stateOfResidence || '',
      businessRegType: profile?.businessRegType || 'CAC',
      businessSupportNeeds: profile?.businessSupportNeeds || [],
      businessName: profile?.businessName || '',
      zipCode: profile?.zipCode || '',
      taftaCenter: profile?.taftaCenter || '',
      referrerPhoneNumber: profile?.referrerPhoneNumber || '',
    };
  };

  const getIndividualFormInitialValues = (profile?: any, applicant?: any): IndividualFormValues => {
    return {
      firstName: applicant?.firstName || '',
      lastName: applicant?.lastName || '',
      email: applicant?.email || '',
      dob: profile?.dob || '',
      gender: profile?.gender || '',
      address: profile?.homeAddress || '',
      education: profile?.educationLevel || '',
      phoneNumber: profile?.phoneNumber || '',
      stateOfResidence: profile?.stateOfResidence || '',
      employmentStatus: profile?.employmentStatus || '',
      salaryExpectation: profile?.salaryExpectation || 'UNDER_50K',
      disability: profile?.disability || '',
      ageRange: profile?.ageRange || '',
      communityArea: profile?.communityArea || '',
      stateOfOrigin: profile?.stateOfOrigin || '',
      LGADetails: profile?.LGADetails || '',
      residencyStatus: profile?.residencyStatus || '',
      zipCode: profile?.zipCode || '',
      taftaCenter: profile?.taftaCenter || '',
      internshipProgram: profile?.internshipProgram || '',
      projectType: profile?.projectType || '',
      currentSalary: profile?.currentSalary || '',
      registrationMode: profile?.registrationMode || '',
      jobReadinessInterests: profile?.jobReadinessInterests || [],
      incomeRange: profile?.incomeRange || '',
      referrerPhoneNumber: profile?.referrerPhoneNumber || '',
    };
  };

  const initialEnterpriseValues = getEnterpriseFormInitialValues(profile, applicant);
  const initialIndividualValues = getIndividualFormInitialValues(profile, applicant);

  const formik = useFormik<EnterpriseFormValues | IndividualFormValues>({
    initialValues: isEnterprise ? initialEnterpriseValues : initialIndividualValues,
    validationSchema: isEnterprise ? 
      Yup.object({
        firstName: Yup.string().required('First name is required'),
        lastName: Yup.string().required('Last name is required'),
        email: Yup.string().email('Invalid email format').required('Email is required'),
        businessAddress: Yup.string().required('Business address is required'),
        yearEstablished: Yup.string().required('Year established is required'),
        numberOfEmployees: Yup.string().required('Number of employees is required'),
        businessDescription: Yup.string().required('Business description is required'),
        businessType: Yup.string().oneOf(['STARTUP', 'EXISTING']).required('Business type is required'),
        revenueRange: Yup.string().required('Revenue range is required'),
        phoneNumber: Yup.string().required('Phone number is required'),
        stateOfResidence: Yup.string().required('State is required'),
        businessRegType: Yup.string().oneOf(['CAC', 'SMEDAN']).required('Registration type is required'),
        businessSupportNeeds: Yup.array().of(Yup.string()),
        referrerPhoneNumber: Yup.string(),
      }) :
      Yup.object({
        firstName: Yup.string().required('First name is required'),
        lastName: Yup.string().required('Last name is required'),
        email: Yup.string().email('Invalid email format').required('Email is required'),
        dob: Yup.string().required('Date of birth is required'),
        gender: Yup.string().required('Gender is required'),
        address: Yup.string().required('Address is required'),
        education: Yup.string().required('Education level is required'),
        phoneNumber: Yup.string().required('Phone number is required'),
        stateOfResidence: Yup.string().required('State is required'),
        employmentStatus: Yup.string().required('Employment status is required'),
        salaryExpectation: Yup.string().required('Salary expectation is required'),
        disability: Yup.string(),
        registrationMode: Yup.string().oneOf(['ONLINE', 'LEARNING_TRAIN']),
        jobReadinessInterests: Yup.array().of(Yup.string()),
        incomeRange: Yup.string().when('employmentStatus', {
          is: (val: string) => ['EMPLOYED', 'SELF_EMPLOYED'].includes(val),
          then: Yup.string().required('Income range is required when employed'),
          otherwise: Yup.string()
        }),
        referrerPhoneNumber: Yup.string(),
      }),
    onSubmit: async (values) => {
      try {
        if (isEnterpriseFormValues(values)) {
          const profileData = {
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            homeAddress: values.businessAddress,
            businessName: values.businessName,
            businessType: values.businessType,
            revenueRange: values.revenueRange,
            phoneNumber: values.phoneNumber,
            stateOfResidence: values.stateOfResidence,
            businessDescription: values.businessDescription,
            yearEstablished: values.yearEstablished,
            numberOfEmployees: parseInt(values.numberOfEmployees),
            businessRegType: values.businessRegType,
            businessSupportNeeds: values.businessSupportNeeds,
            zipCode: values.zipCode,
            taftaCenter: values.taftaCenter,
            referrerPhoneNumber: values.referrerPhoneNumber,
            registrationPath: "ENTERPRISE",
            type: "ENTERPRISE"
          };

          await editApplicant({
            id: userId,
            body: { 
              profile: profileData,
              courseId
            }
          }).unwrap();
          
          toast.success('Profile updated successfully');
          handlers.handleNext();
        } else if (isIndividualFormValues(values)) {
          const profileData = {
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            dob: values.dob,
            gender: values.gender,
            homeAddress: values.address,
            educationLevel: values.education,
            phoneNumber: values.phoneNumber,
            stateOfResidence: values.stateOfResidence,
            employmentStatus: values.employmentStatus,
            salaryExpectation: values.salaryExpectation,
            disability: values.disability,
            ageRange: values.ageRange,
            communityArea: values.communityArea,
            stateOfOrigin: values.stateOfOrigin,
            LGADetails: values.LGADetails,
            residencyStatus: values.residencyStatus,
            zipCode: values.zipCode,
            taftaCenter: values.taftaCenter,
            internshipProgram: values.internshipProgram,
            projectType: values.projectType,
            currentSalary: values.currentSalary ? parseFloat(values.currentSalary) : undefined,
            registrationMode: values.registrationMode,
            jobReadinessInterests: values.jobReadinessInterests || [],
            incomeRange: values.incomeRange,
            referrerPhoneNumber: values.referrerPhoneNumber,
            registrationPath: "INDIVIDUAL",
            type: "INDIVIDUAL"
          };

          await editApplicant({
            id: userId,
            body: { 
              profile: profileData,
              courseId
            }
          }).unwrap();
          
          toast.success('Profile updated successfully');
          handlers.handleNext();
        }
      } catch (err) {
        toast.error('Failed to update profile');
        console.error('Error updating profile:', err);
      }
    },
  });

  // Helper functions for common fields
  const getCommonFieldError = (field: keyof (EnterpriseFormValues & IndividualFormValues)) => {
    const touched = formik.touched as FormikTouched<EnterpriseFormValues & IndividualFormValues>;
    const errors = formik.errors as FormikErrors<EnterpriseFormValues & IndividualFormValues>;
    return touched[field] && errors[field];
  };

  const hasCommonFieldError = (field: keyof (EnterpriseFormValues & IndividualFormValues)) => {
    const touched = formik.touched as FormikTouched<EnterpriseFormValues & IndividualFormValues>;
    const errors = formik.errors as FormikErrors<EnterpriseFormValues & IndividualFormValues>;
    return !!(touched[field] && errors[field]);
  };

  // Helper functions for enterprise fields
  const getEnterpriseFieldError = (field: keyof EnterpriseFormValues) => {
    if (isEnterpriseFormValues(formik.values)) {
      const touched = formik.touched as FormikTouched<EnterpriseFormValues>;
      const errors = formik.errors as FormikErrors<EnterpriseFormValues>;
      return touched[field] && errors[field];
    }
    return undefined;
  };

  const hasEnterpriseFieldError = (field: keyof EnterpriseFormValues) => {
    if (isEnterpriseFormValues(formik.values)) {
      const touched = formik.touched as FormikTouched<EnterpriseFormValues>;
      const errors = formik.errors as FormikErrors<EnterpriseFormValues>;
      return !!(touched[field] && errors[field]);
    }
    return false;
  };

  // Helper functions for individual fields
  const getIndividualFieldError = (field: keyof IndividualFormValues) => {
    if (isIndividualFormValues(formik.values)) {
      const touched = formik.touched as FormikTouched<IndividualFormValues>;
      const errors = formik.errors as FormikErrors<IndividualFormValues>;
      return touched[field] && errors[field];
    }
    return undefined;
  };

  const hasIndividualFieldError = (field: keyof IndividualFormValues) => {
    if (isIndividualFormValues(formik.values)) {
      const touched = formik.touched as FormikTouched<IndividualFormValues>;
      const errors = formik.errors as FormikErrors<IndividualFormValues>;
      return !!(touched[field] && errors[field]);
    }
    return false;
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Card>
        <CardContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" align="center">
              Personal Information
            </Typography>
            <Typography variant="body1" align="center" color="textSecondary">
              {registrationType === 'individual'
                ? 'Please provide your personal details'
                : 'Please provide your business details'}
            </Typography>
          </Box>

          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h5" sx={{ mb: 3 }}>
                  {isEnterprise ? 'Business Information' : 'Personal Information'}
                </Typography>
              </Grid>

              {/* Common Fields */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={formik.values.firstName}
                  onChange={formik.handleChange}
                  error={hasCommonFieldError('firstName')}
                  helperText={getCommonFieldError('firstName')}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={formik.values.lastName}
                  onChange={formik.handleChange}
                  error={hasCommonFieldError('lastName')}
                  helperText={getCommonFieldError('lastName')}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  error={hasCommonFieldError('email')}
                  helperText={getCommonFieldError('email')}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phoneNumber"
                  value={formik.values.phoneNumber}
                  onChange={formik.handleChange}
                  error={hasCommonFieldError('phoneNumber')}
                  helperText={getCommonFieldError('phoneNumber')}
                  required
                />
              </Grid>

              {/* Enterprise Fields */}
              {isEnterprise && isEnterpriseFormValues(formik.values) && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Business Name"
                      name="businessName"
                      value={formik.values.businessName}
                      onChange={formik.handleChange}
                      error={hasEnterpriseFieldError('businessName')}
                      helperText={getEnterpriseFieldError('businessName')}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Business Type"
                      name="businessType"
                      select
                      value={formik.values.businessType}
                      onChange={formik.handleChange}
                      error={hasEnterpriseFieldError('businessType')}
                      helperText={getEnterpriseFieldError('businessType')}
                      required
                    >
                      <MenuItem value="STARTUP">Startup</MenuItem>
                      <MenuItem value="EXISTING">Existing Business</MenuItem>
                    </TextField>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Business Address"
                      name="businessAddress"
                      value={formik.values.businessAddress}
                      onChange={formik.handleChange}
                      error={hasEnterpriseFieldError('businessAddress')}
                      helperText={getEnterpriseFieldError('businessAddress')}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Year Established"
                      name="yearEstablished"
                      value={formik.values.yearEstablished}
                      onChange={formik.handleChange}
                      error={hasEnterpriseFieldError('yearEstablished')}
                      helperText={getEnterpriseFieldError('yearEstablished')}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Number of Employees"
                      name="numberOfEmployees"
                      type="number"
                      value={formik.values.numberOfEmployees}
                      onChange={formik.handleChange}
                      error={hasEnterpriseFieldError('numberOfEmployees')}
                      helperText={getEnterpriseFieldError('numberOfEmployees')}
                      required
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Business Description"
                      name="businessDescription"
                      multiline
                      rows={4}
                      value={formik.values.businessDescription}
                      onChange={formik.handleChange}
                      error={hasEnterpriseFieldError('businessDescription')}
                      helperText={getEnterpriseFieldError('businessDescription')}
                      required
                    />
                  </Grid>
                </>
              )}

              {/* Individual Fields */}
              {!isEnterprise && isIndividualFormValues(formik.values) && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Date of Birth"
                      name="dob"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={formik.values.dob}
                      onChange={formik.handleChange}
                      error={hasIndividualFieldError('dob')}
                      helperText={getIndividualFieldError('dob')}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Gender"
                      name="gender"
                      select
                      value={formik.values.gender}
                      onChange={formik.handleChange}
                      error={hasIndividualFieldError('gender')}
                      helperText={getIndividualFieldError('gender')}
                      required
                    >
                      <MenuItem value="MALE">Male</MenuItem>
                      <MenuItem value="FEMALE">Female</MenuItem>
                      <MenuItem value="OTHER">Other</MenuItem>
                      <MenuItem value="PREFER_NOT_TO_SAY">Prefer not to say</MenuItem>
                    </TextField>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Address"
                      name="address"
                      value={formik.values.address}
                      onChange={formik.handleChange}
                      error={hasIndividualFieldError('address')}
                      helperText={getIndividualFieldError('address')}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Education Level"
                      name="education"
                      select
                      value={formik.values.education}
                      onChange={formik.handleChange}
                      error={hasIndividualFieldError('education')}
                      helperText={getIndividualFieldError('education')}
                      required
                    >
                      <MenuItem value="PRIMARY">Primary</MenuItem>
                      <MenuItem value="SECONDARY">Secondary</MenuItem>
                      <MenuItem value="TERTIARY">Tertiary</MenuItem>
                      <MenuItem value="POSTGRADUATE">Postgraduate</MenuItem>
                    </TextField>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Employment Status"
                      name="employmentStatus"
                      select
                      value={formik.values.employmentStatus}
                      onChange={formik.handleChange}
                      error={hasIndividualFieldError('employmentStatus')}
                      helperText={getIndividualFieldError('employmentStatus')}
                      required
                    >
                      <MenuItem value="EMPLOYED">Employed</MenuItem>
                      <MenuItem value="SELF_EMPLOYED">Self Employed</MenuItem>
                      <MenuItem value="UNEMPLOYED">Unemployed</MenuItem>
                      <MenuItem value="STUDENT">Student</MenuItem>
                    </TextField>
                  </Grid>

                  {(['EMPLOYED', 'SELF_EMPLOYED'].includes(formik.values.employmentStatus)) && (
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Income Range"
                        name="incomeRange"
                        select
                        value={formik.values.incomeRange}
                        onChange={formik.handleChange}
                        error={hasIndividualFieldError('incomeRange')}
                        helperText={getIndividualFieldError('incomeRange')}
                        required
                      >
                        <MenuItem value="UNDER_100K">Under ₦100,000</MenuItem>
                        <MenuItem value="BTW_100K_300K">₦100,000 - ₦300,000</MenuItem>
                        <MenuItem value="BTW_300K_500K">₦300,000 - ₦500,000</MenuItem>
                        <MenuItem value="BTW_500K_1M">₦500,000 - ₦1,000,000</MenuItem>
                        <MenuItem value="ABOVE_1M">Above ₦1,000,000</MenuItem>
                      </TextField>
                    </Grid>
                  )}
                </>
              )}

              {/* Navigation Buttons */}
              <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant="outlined"
                  onClick={handlers.handleBack}
                  sx={{ mr: 1 }}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={formik.isSubmitting}
                >
                  Next
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export const CourseInformation = ({
  userId,
  applicant,
  handlers,
  state,
  cohortCourses,
  ...other
}: any) => {
  const { 
    activeStep = 0, 
    isStepOptional = () => false, 
    handleNext = () => {}, 
    handleBack = () => {}, 
    handleSkip = () => {} 
  } = handlers || {};

  const [selectedCourse, setSelectedCourse] = React.useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleNext();
  };
  
  return (
    <Box sx={{ mt: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Course Information
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography sx={{ mb: 2 }}>
                  Select a course to enroll in:
                </Typography>
                <RadioGroup
                  name="enrollmentId"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  {Array.isArray(cohortCourses) && cohortCourses.length > 0 ? (
                    cohortCourses.map((course: any) => (
                      <FormControlLabel
                        key={course.id}
                        value={course.id}
                        control={<Radio />}
                        label={course.course?.name || 'Unnamed Course'}
                      />
                    ))
                  ) : (
                    <Typography color="text.secondary">No courses available</Typography>
                  )}
                </RadioGroup>
              </Grid>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  size="large"
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={!selectedCourse && Array.isArray(cohortCourses) && cohortCourses.length > 0}
                >
                  Continue
                </Button>
              </Grid>
              
              {/* Navigation buttons */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                  <Button
                    color="inherit"
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    sx={{ mr: 1 }}
                  >
                    Back
                  </Button>
                  <Box sx={{ flex: '1 1 auto' }} />
                  {isStepOptional && typeof isStepOptional === 'function' && isStepOptional(activeStep) && (
                    <Button color="inherit" onClick={handleSkip} sx={{ mr: 1 }}>
                      Skip
                    </Button>
                  )}
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export const EducationInformation = ({
  userId,
  applicant,
  handlers,
  state,
  ...other
}: any) => {
  const { activeStep, isStepOptional, handleNext, handleBack, handleSkip } = handlers || {
    activeStep: 0,
    isStepOptional: () => false,
    handleNext: () => {},
    handleBack: () => {},
    handleSkip: () => {}
  };
  
  // Simple placeholder implementation
  return (
    <Box sx={{ mt: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Education Information
          </Typography>
          <form onSubmit={(e) => {
            e.preventDefault();
            handlers?.handleNext();
          }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Highest Education"
                  name="highestEducation"
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  size="large"
                  type="submit"
                  variant="contained"
                  color="primary"
                >
                  Continue
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export const MoreInformation = ({
  userId,
  applicant,
  handlers,
  state,
  ...other
}: any) => {
  const { activeStep, isStepOptional, handleNext, handleBack, handleSkip } = handlers || {
    activeStep: 0,
    isStepOptional: () => false,
    handleNext: () => {},
    handleBack: () => {},
    handleSkip: () => {}
  };
  
  // Simple placeholder implementation
  return (
    <Box sx={{ mt: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Additional Information
          </Typography>
          <form onSubmit={(e) => {
            e.preventDefault();
            handlers?.handleNext();
          }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Additional Details"
                  name="additionalDetails"
                  multiline
                  rows={4}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  size="large"
                  type="submit"
                  variant="contained"
                  color="primary"
                >
                  Continue
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export const VerifyEmail = () => (
  <Box sx={{ mt: 3 }}>
    <Card>
      <CardContent sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h5" gutterBottom>
          Verification Successful
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Your email has been successfully verified. You can now proceed with your application.
        </Typography>
        <Box 
          component="img"
          src="/static/images/check.png"
          alt="Verified"
          sx={{ 
            width: 120, 
            height: 120, 
            objectFit: 'contain',
            display: 'block',
            mx: 'auto',
            mb: 3
          }}
        />
        <Typography variant="body2" color="text.secondary">
          Please complete the remaining steps of the registration process.
        </Typography>
      </CardContent>
    </Card>
  </Box>
);

export const EndOfApplication = () => (
  <Box sx={{ mt: 3 }}>
    <Card>
      <CardContent sx={{ textAlign: 'center', py: 5 }}>
        <Typography variant="h4" gutterBottom>
          Application Complete
        </Typography>
        <Box 
          component="img"
          src="/static/images/check.png"
          alt="Complete"
          sx={{ 
            width: 150, 
            height: 150, 
            objectFit: 'contain',
            display: 'block',
            mx: 'auto',
            my: 4
          }}
        />
        <Typography variant="h6" sx={{ mb: 3 }}>
          Thank you for completing your application!
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          Your application has been successfully submitted. You will receive further instructions via email.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          href="/dashboard"
          sx={{ minWidth: 200 }}
        >
          Go to Dashboard
        </Button>
      </CardContent>
    </Card>
  </Box>
); 