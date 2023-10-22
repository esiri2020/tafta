import NextLink from "next/link";
import { useRouter } from "next/router";

import PropTypes from "prop-types";
import toast from "react-hot-toast";
import * as Yup from "yup";
import { useFormik } from "formik";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  TextField,
  Typography,
  MenuItem,
  Radio,
  RadioGroup,
  FormControlLabel,
} from "@mui/material";
import { useEditApplicantMutation } from "../../../services/api";

const genderList = ["MALE", "FEMALE"];
const ranges = [
  [1, 5],
  [6, 10],
  [11, 15],
  [16, 20],
  [21, 25],
  [26, 30],
  [31, 35],
  [36, 40],
  [41, 45],
  [46, 50],
  [51, 55],
  [56, 60],
  [61, 65],
];
const levels_of_education = [
  {
    label: " Elementary School",
    value: "ELEMENTRY_SCHOOL",
  },
  {
    label: "Secondary School",
    value: "SECONDARY_SCHOOL",
  },
  {
    label: "College of Education",
    value: "COLLEGE_OF_EDUCATION",
  },
  {
    label: "ND/HND",
    value: "ND_HND",
  },
  {
    label: "Bachelor's Degree",
    value: "BSC",
  },
  {
    label: "Master's Degree",
    value: "MSC",
  },
];
const user_disabilies = [
  {
    label: "Visual impairment (seeing problem)",
    value: "seeing",
  },
  {
    label: "Speech problems",
    value: "speech",
  },
  {
    label: "Mobility disability  (Limited use of leg)",
    value: "legDisability",
  },
  {
    label: "Limited use of arms or fingers",
    value: "handDisability",
  },
  {
    label: "Intellectual disability",
    value: "intellectualDisability",
  },
  {
    label: "Albinism",
    value: "albinism",
  },
  {
    label: "Others",
    value: "others",
  },
];

const employment_status = [
  {
    label: "Employed",
    value: "employed",
  },
  {
    label: "Unemployed",
    value: "unemployed",
  },
  {
    label: "Self-employed",
    value: "self-employed",
  },
];

const residency_status = [
  {
    label: "Refugee",
    value: "refugee",
  },
  {
    label: "Migrant-worker",
    value: "migrant-worker",
  },
  {
    label: "IDP",
    value: "idp",
  },
  {
    label: "Resident",
    value: "resident",
  },
];

const self_employed_types = [
  {
    label: "Entrepreneur",
    value: "entrepreneur",
  },

  {
    label: "Contractor",
    value: "contractor",
  },
];

export const ApplicantEditForm = ({ applicant, ...other }) => {
  const [updateApplicant, result] = useEditApplicantMutation();
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      homeAddress: applicant.profile?.homeAddress || "",
      LGADetails: applicant.profile?.LGADetails || "",
      email: applicant.email || "",
      firstName: applicant.firstName || "",
      lastName: applicant.lastName || "",
      phoneNumber: applicant.profile?.phoneNumber || "",
      stateOfResidence: applicant.profile?.stateOfResidence || "",
      gender: applicant.profile?.gender || "",
      ageRange: applicant.profile?.ageRange || "",
      educationLevel: applicant.profile?.educationLevel || "",
      referrer: applicant.profile?.referrer?.fullName || "",
      referrerPhoneNumber: applicant.profile?.referrer?.phoneNumber || "",
      taftaCenter: applicant.profile?.taftaCenter || "",
      _disability: applicant?.profile?.disability ? "true" : "false",
      disability: applicant.profile?.disability || "",
      source: applicant.profile?.source || "",
      communityArea: applicant.profile?.communityArea || "",
      employmentStatus: applicant?.profile?.employmentStatus || "",
      selfEmployedType: applicant?.profile?.selfEmployedType || "",
      residencyStatus: applicant?.profile?.residencyStatus || "",
      submit: null,
    },
    validationSchema: Yup.object({
      homeAddress: Yup.string(),
      LGADetails: Yup.string().max(255),
      country: Yup.string().max(255),
      email: Yup.string()
        .email("Must be a valid email")
        .max(255)
        .required("Email is required"),
      firstName: Yup.string().max(255).required("First Name is required"),
      lastName: Yup.string().max(255).required("Last Name is required"),
      phoneNumber: Yup.string().max(15),
      stateOfResidence: Yup.string().max(255),
      gender: Yup.string().max(6),
      educationLevel: Yup.string().max(15),
      referrer: Yup.string().max(15),
      taftaCenter: Yup.string().max(15),
      disability: Yup.string().max(128),
      source: Yup.string().max(15),
      communityArea: Yup.string().max(15),
      employmentStatus: Yup.string().required("Employment Status is required"),
      residencyStatus: Yup.string().required("Residency Status is required"),
      selfEmployedType: Yup.string().when("employmentStatus", {
        is: "self-employed",
        then: Yup.string().required("Self-Employed Type is required"),
      }),
    }),
    onSubmit: async (values, helpers) => {
      try {
        const {
          email,
          _disability,
          firstName,
          lastName,
          referrer: _referrer,
          referrerPhoneNumber,
          submit,
          ...profile
        } = values;
        if (_referrer) {
          profile.referrer = {
            fullName: _referrer,
            phoneNumber: referrerPhoneNumber,
          };
        }
        // NOTE: Make API request
        await updateApplicant({
          id: applicant.id,
          body: { firstName, lastName, profile },
        }).unwrap();
        helpers.setStatus({ success: true });
        helpers.setSubmitting(false);
        toast.success("Applicant updated!");
        router.replace({ pathname: "/admin-dashboard/applicants/" });
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong!");
        helpers.setStatus({ success: false });
        helpers.setErrors({ submit: err.message });
        helpers.setSubmitting(false);
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} {...other}>
      <Card>
        <CardHeader title="Edit applicant" />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item md={6} xs={12}>
              <TextField
                error={Boolean(
                  formik.touched.firstName && formik.errors.firstName
                )}
                fullWidth
                helperText={formik.touched.firstName && formik.errors.firstName}
                label="First Name"
                name="firstName"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                required
                value={formik.values.firstName}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                error={Boolean(
                  formik.touched.lastName && formik.errors.lastName
                )}
                fullWidth
                helperText={formik.touched.lastName && formik.errors.lastName}
                label="Last Name"
                name="lastName"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                required
                value={formik.values.lastName}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                error={Boolean(formik.touched.email && formik.errors.email)}
                fullWidth
                helperText={formik.touched.email && formik.errors.email}
                label="Email Address"
                name="email"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                required
                disabled
                value={formik.values.email}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                error={Boolean(
                  formik.touched.phoneNumber && formik.errors.phoneNumber
                )}
                fullWidth
                helperText={
                  formik.touched.phoneNumber && formik.errors.phoneNumber
                }
                label="Phone number"
                name="phoneNumber"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.phoneNumber}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                error={Boolean(
                  formik.touched.LGADetails && formik.errors.LGADetails
                )}
                fullWidth
                helperText={
                  formik.touched.LGADetails && formik.errors.LGADetails
                }
                label="LGA Details"
                name="LGADetails"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.LGADetails}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                error={Boolean(
                  formik.touched.stateOfResidence &&
                    formik.errors.stateOfResidence
                )}
                fullWidth
                helperText={
                  formik.touched.stateOfResidence &&
                  formik.errors.stateOfResidence
                }
                label="State of Residence"
                name="stateOfResidence"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.stateOfResidence}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                error={Boolean(formik.touched.gender && formik.errors.gender)}
                fullWidth
                helperText={formik.touched.gender && formik.errors.gender}
                label="Gender"
                name="gender"
                select
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.gender}
              >
                {genderList.map((gender, index) => (
                  <MenuItem key={index} value={gender}>
                    {gender}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                error={Boolean(
                  formik.touched.ageRange && formik.errors.ageRange
                )}
                fullWidth
                select
                helperText={formik.touched.ageRange && formik.errors.ageRange}
                label="Age Range"
                name="ageRange"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.ageRange}
              >
                {ranges.map((range, index) => (
                  <MenuItem key={index} value={`${range[0]} - ${range[1]}`}>
                    {`${range[0]} - ${range[1]}`}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                error={Boolean(
                  formik.touched.homeAddress && formik.errors.homeAddress
                )}
                fullWidth
                multiline
                helperText={
                  formik.touched.homeAddress && formik.errors.homeAddress
                }
                label="Home address"
                name="homeAddress"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                required
                value={formik.values.homeAddress}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                error={Boolean(
                  formik.touched.taftaCenter && formik.errors.taftaCenter
                )}
                fullWidth
                multiline
                helperText={
                  formik.touched.taftaCenter && formik.errors.taftaCenter
                }
                label="Tafta Center"
                name="taftaCenter"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.taftaCenter}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                error={Boolean(
                  formik.touched.referrer && formik.errors.referrer
                )}
                fullWidth
                helperText={formik.touched.referrer && formik.errors.referrer}
                label="Referrer"
                name="referrer"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.referrer}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                error={Boolean(
                  formik.touched.referrerPhoneNumber &&
                    formik.errors.referrerPhoneNumber
                )}
                fullWidth
                helperText={
                  formik.touched.referrerPhoneNumber &&
                  formik.errors.referrerPhoneNumber
                }
                label="Referrer Phone Number"
                name="referrerPhoneNumber"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.referrerPhoneNumber}
              />
            </Grid>
            <Grid item md={12} xs={12}>
              <Typography gutterBottom variant="subtitle1">
                Highest Level of Education Attained
              </Typography>
              <RadioGroup
                name="educationLevel"
                sx={{ flexDirection: "row" }}
                value={formik.values.educationLevel}
                onChange={formik.handleChange}
              >
                {levels_of_education.map((level_of_education) => (
                  <FormControlLabel
                    control={<Radio sx={{ ml: 1 }} />}
                    value={level_of_education.value}
                    key={level_of_education.value}
                    label={
                      <Typography variant="body1">
                        {level_of_education.label}
                      </Typography>
                    }
                  />
                ))}
              </RadioGroup>
            </Grid>

            <Grid item md={6} xs={12}>
              <Typography sx={{ ml: 2 }} variant="p">
                Disabilities
              </Typography>
              <Grid sx={{ ml: 2 }}>
                <RadioGroup
                  name="_disability"
                  sx={{ flexDirection: "column" }}
                  value={formik.values._disability}
                  onChange={(e) => {
                    if (e.target.value == "false") {
                      formik.setFieldValue("disability", "");
                    }
                    formik.setFieldValue("_disability", e.target.value);
                  }}
                >
                  <FormControlLabel
                    control={<Radio sx={{ ml: 1 }} />}
                    value={true}
                    label={<Typography variant="body1">Yes</Typography>}
                  />
                  <FormControlLabel
                    control={<Radio sx={{ ml: 1 }} />}
                    value={false}
                    label={<Typography variant="body1">No</Typography>}
                  />
                </RadioGroup>
              </Grid>
            </Grid>

            <Grid item md={6} xs={12}>
              <Typography sx={{ ml: 2 }} variant="p">
                If Yes Please Select Below
              </Typography>
              <Grid sx={{ ml: 2 }}>
                <RadioGroup
                  name="disability"
                  sx={{ flexDirection: "row" }}
                  value={formik.values.disability}
                  onChange={formik.handleChange}
                >
                  {user_disabilies.map((user_disability) => (
                    <FormControlLabel
                      disabled={formik.values._disability !== "true"}
                      control={<Radio sx={{ ml: 1 }} />}
                      key={user_disability.value}
                      label={
                        <Typography variant="body1">
                          {user_disability.label}
                        </Typography>
                      }
                      value={user_disability.value}
                    />
                  ))}
                </RadioGroup>
              </Grid>
            </Grid>
          </Grid>

          <Grid item md={6} xs={12} direction="column" spacing={3}>
            <Grid item md={6} xs={12}>
              <Typography id="employment-status-label">
                Employment Status
              </Typography>
              <Grid sx={{ ml: 2 }}>
                <RadioGroup
                  name="employmentStatus"
                  sx={{ flexDirection: "row" }}
                  value={formik.values.employmentStatus}
                  onChange={formik.handleChange}
                  id="employment-status"
                  {...formik.getFieldProps("employmentStatus")}
                  error={
                    formik.touched.employmentStatus &&
                    Boolean(formik.errors.employmentStatus)
                  }
                  helperText={
                    formik.touched.employmentStatus &&
                    formik.errors.employmentStatus
                  }
                >
                  {employment_status.map((option) => (
                    <FormControlLabel
                      control={<Radio sx={{ ml: 1 }} />}
                      label={
                        <Typography variant="body1">{option.label}</Typography>
                      }
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </FormControlLabel>
                  ))}
                </RadioGroup>
              </Grid>
            </Grid>

            {/* Self-Employed Type */}

            <Grid item md={6} xs={12}>
              <Typography id="self-employed-type-label">
                Self-Employed Type
              </Typography>
              <Grid sx={{ ml: 3 }}>
                <RadioGroup
                  name="selfEmployedType"
                  sx={{ flexDirection: "row" }}
                  value={formik.values.selfEmployedType}
                  onChange={formik.handleChange}
                  id="self-employed-type"
                  disabled={formik.values.employmentStatus !== "self-employed"}
                  error={
                    formik.touched.selfEmployedType &&
                    Boolean(formik.errors.selfEmployedType)
                  }
                  helperText={
                    formik.touched.selfEmployedType &&
                    formik.errors.selfEmployedType
                  }
                >
                  {self_employed_types.map((option) => (
                    <FormControlLabel
                      control={<Radio />}
                      label={option.label}
                      key={option.value}
                      value={option.value}
                      disabled={
                        formik.values.employmentStatus !== "self-employed"
                      }
                      checked={
                        formik.values.selfEmployedType === option.value &&
                        formik.values.employmentStatus === "self-employed"
                      }
                    />
                  ))}
                </RadioGroup>
              </Grid>
            </Grid>
          </Grid>

          {/* Residency Status */}
          <Grid item md={6} xs={12}>
            <Typography id="residency-status-label">
              Residency Status
            </Typography>
            <RadioGroup
              name="residencyStatus"
              sx={{ flexDirection: "row" }}
              value={formik.values.residencyStatus}
              onChange={formik.handleChange}
              id="residency-status"
              error={
                formik.touched.residencyStatus &&
                Boolean(formik.errors.residencyStatus)
              }
              helperText={
                formik.touched.residencyStatus && formik.errors.residencyStatus
              }
            >
              {residency_status.map((option) => (
                <FormControlLabel
                  control={<Radio />}
                  label={option.label}
                  key={option.value}
                  value={option.value}
                />
              ))}
            </RadioGroup>
          </Grid>
        </CardContent>
        <CardActions
          sx={{
            flexWrap: "wrap",
            m: -1,
          }}
        >
          <Button
            disabled={formik.isSubmitting}
            type="submit"
            sx={{ m: 1 }}
            variant="contained"
          >
            Update
          </Button>
          <NextLink
            href={`/admin-dashboard/applicants/${applicant.id}`}
            passHref
          >
            <Button
              component="a"
              disabled={formik.isSubmitting}
              sx={{
                m: 1,
                mr: "auto",
              }}
              variant="outlined"
            >
              Cancel
            </Button>
          </NextLink>
          <Button color="error" disabled={formik.isSubmitting}>
            Delete user
          </Button>
        </CardActions>
      </Card>
    </form>
  );
};

ApplicantEditForm.propTypes = {
  applicant: PropTypes.object.isRequired,
};
