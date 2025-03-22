import { useFormik, FormikErrors, FormikTouched } from 'formik';
import * as Yup from 'yup';
import {
  Box, Card, CardContent, Grid, TextField,
  Typography, MenuItem, Button
} from '@mui/material';
import { useGetApplicantQuery, useEditApplicantMutation } from '../../services/api';
import { useRouter } from 'next/router';
import { Gender, EducationLevel } from '@prisma/client';
import {
  EnterpriseFormValues,
  IndividualFormValues,
  FormValues,
  isEnterpriseFormValues,
  isIndividualFormValues,
  BusinessType,
  RegistrationType
} from '../../types/registration';

interface PersonalInformationProps {
  handlers: {
    handleNext: () => void;
  };
  registrationType?: RegistrationType | null;
  courseId?: string;
}

// Update type guard helpers
const getFieldError = (
  errors: FormikErrors<FormValues>,
  touched: FormikTouched<FormValues>,
  field: string
): string | undefined => {
  return touched[field as keyof typeof touched] && errors[field as keyof typeof errors]
    ? (errors[field as keyof typeof errors] as string)
    : undefined;
};

const hasFieldError = (
  errors: FormikErrors<FormValues>,
  touched: FormikTouched<FormValues>,
  field: string
): boolean => {
  return Boolean(
    touched[field as keyof typeof touched] && 
    errors[field as keyof typeof errors]
  );
};

export const PersonalInformation = ({ handlers, registrationType, courseId }: PersonalInformationProps) => {
  const router = useRouter();
  const { userId } = router.query;
  const { data, isLoading } = useGetApplicantQuery(
    userId as string, 
    { skip: !userId }
  );
  const [editApplicant] = useEditApplicantMutation();

  // Extract applicant data for easier access
  const applicant = data?.applicant;
  const profile = applicant?.profile;

  // Determine type of user for form display
  const isEnterprise = registrationType ? registrationType === 'enterprise' : profile?.businessType !== undefined;

  const formik = useFormik<FormValues>({
    initialValues: isEnterprise ? {
      businessAddress: profile?.homeAddress || '',
      yearEstablished: profile?.yearEstablished || '',
      numberOfEmployees: profile?.numberOfEmployees?.toString() || '',
      businessDescription: profile?.businessDescription || '',
      businessType: (profile?.businessType as BusinessType) || 'STARTUP',
      revenueRange: profile?.revenueRange || '',
      phoneNumber: profile?.phoneNumber || '',
      stateOfResidence: profile?.stateOfResidence || '',
    } : {
      dob: profile?.dob || '',
      gender: profile?.gender || 'MALE',
      address: profile?.homeAddress || '',
      education: profile?.educationLevel || 'SECONDARY_SCHOOL',
      phoneNumber: profile?.phoneNumber || '',
      stateOfResidence: profile?.stateOfResidence || '',
      employmentStatus: profile?.employmentStatus || '',
      disability: profile?.disability || '',
    },
    validationSchema: isEnterprise ? 
      Yup.object({
        businessAddress: Yup.string().required('Business address is required'),
        yearEstablished: Yup.string().required('Year established is required'),
        numberOfEmployees: Yup.string().required('Number of employees is required'),
        businessDescription: Yup.string().required('Business description is required'),
        businessType: Yup.string().oneOf(['STARTUP', 'EXISTING']).required('Business type is required'),
        revenueRange: Yup.string().required('Revenue range is required'),
        phoneNumber: Yup.string().required('Phone number is required'),
        stateOfResidence: Yup.string().required('State is required'),
      }) :
      Yup.object({
        dob: Yup.string().required('Date of birth is required'),
        gender: Yup.string().required('Gender is required'),
        address: Yup.string().required('Address is required'),
        education: Yup.string().required('Education level is required'),
        phoneNumber: Yup.string().required('Phone number is required'),
        stateOfResidence: Yup.string().required('State is required'),
        employmentStatus: Yup.string().required('Employment status is required'),
        disability: Yup.string(),
      }),
    onSubmit: async (values) => {
      try {
        if (isEnterpriseFormValues(values)) {
          await editApplicant({
            id: userId as string,
            body: {
              profile: {
                homeAddress: values.businessAddress,
                businessType: values.businessType,
                revenueRange: values.revenueRange,
                phoneNumber: values.phoneNumber,
                stateOfResidence: values.stateOfResidence,
                businessDescription: values.businessDescription,
                yearEstablished: values.yearEstablished,
                numberOfEmployees: parseInt(values.numberOfEmployees),
              },
              courseId: courseId || ''
            }
          }).unwrap();
        } else if (isIndividualFormValues(values)) {
          await editApplicant({
            id: userId as string,
            body: {
              profile: {
                dob: values.dob,
                gender: values.gender,
                homeAddress: values.address,
                educationLevel: values.education,
                phoneNumber: values.phoneNumber,
                stateOfResidence: values.stateOfResidence,
                employmentStatus: values.employmentStatus,
                disability: values.disability,
              },
              courseId: courseId || ''
            }
          }).unwrap();
        }
        handlers.handleNext();
      } catch (err) {
        console.error(err);
      }
    },
  });

  return (
    <Box sx={{ mt: 3 }}>
      {isLoading ? (
        <Card>
          <CardContent>
            <Typography>Loading personal information...</Typography>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <form onSubmit={formik.handleSubmit}>
              <Typography variant="h6">
                {isEnterprise ? 'Business Information' : 'Personal Information'}
              </Typography>
              
              <Grid container spacing={3} sx={{ mt: 1 }}>
                {isEnterprise ? (
                  <>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Business Address"
                        name="businessAddress"
                        value={isEnterpriseFormValues(formik.values) ? formik.values.businessAddress : ''}
                        onChange={formik.handleChange}
                        error={hasFieldError(formik.errors, formik.touched, 'businessAddress')}
                        helperText={getFieldError(formik.errors, formik.touched, 'businessAddress')}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Year Established"
                        name="yearEstablished"
                        type="number"
                        value={isEnterpriseFormValues(formik.values) ? formik.values.yearEstablished : ''}
                        onChange={formik.handleChange}
                        error={hasFieldError(formik.errors, formik.touched, 'yearEstablished')}
                        helperText={getFieldError(formik.errors, formik.touched, 'yearEstablished')}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Business Type"
                        name="businessType"
                        select
                        value={isEnterpriseFormValues(formik.values) ? formik.values.businessType : ''}
                        onChange={formik.handleChange}
                        error={hasFieldError(formik.errors, formik.touched, 'businessType')}
                        helperText={getFieldError(formik.errors, formik.touched, 'businessType')}
                      >
                        <MenuItem value="STARTUP">Startup</MenuItem>
                        <MenuItem value="EXISTING">Existing Business</MenuItem>
                      </TextField>
                    </Grid>
                  </>
                ) : (
                  <>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Date of Birth"
                        name="dob"
                        type="date"
                        value={isIndividualFormValues(formik.values) ? formik.values.dob : ''}
                        onChange={formik.handleChange}
                        error={hasFieldError(formik.errors, formik.touched, 'dob')}
                        helperText={getFieldError(formik.errors, formik.touched, 'dob')}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        select
                        label="Gender"
                        name="gender"
                        value={isIndividualFormValues(formik.values) ? formik.values.gender : ''}
                        onChange={formik.handleChange}
                        error={hasFieldError(formik.errors, formik.touched, 'gender')}
                        helperText={getFieldError(formik.errors, formik.touched, 'gender')}
                      >
                        <MenuItem value="MALE">Male</MenuItem>
                        <MenuItem value="FEMALE">Female</MenuItem>
                        <MenuItem value="OTHER">Other</MenuItem>
                      </TextField>
                    </Grid>
                  </>
                )}
                {/* Common fields */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phoneNumber"
                    value={formik.values.phoneNumber}
                    onChange={formik.handleChange}
                    error={hasFieldError(formik.errors, formik.touched, 'phoneNumber')}
                    helperText={getFieldError(formik.errors, formik.touched, 'phoneNumber')}
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
      )}
    </Box>
  );
}; 