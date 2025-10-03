import { useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import toast from "react-hot-toast";
import * as Yup from "yup";
import { useFormik } from "formik";
import {
  Box,
  Button,
  Typography,
  Autocomplete,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  FormControlLabel,
  Grid,
  Chip,
  Switch,
  TextField,
  MenuItem,
} from "@mui/material";
import {
  useEditCohortMutation,
  useCreateCohortMutation,
  useDeleteCohortMutation,
  useGetCoursesQuery,
  useDeleteCohortCoursesMutation,
} from "../../../services/api";
import { toDate } from "date-fns-tz";
import { SplashScreen } from "../../splash-screen";

const nigeria_states = [
  "Kano",
  "Lagos",
  "Ogun"
];

const CourseDetails = ({ courses, updateCourse, deleteCourse, courseList }) => {
  const [editingIndex, setEditingIndex] = useState(-1);
  const [tempCourse, setTempCourse] = useState({});

  const handleEdit = (index) => {
    setEditingIndex(index);
    setTempCourse({ ...courses[index] });
  };

  const handleSave = (index) => {
    updateCourse(index, tempCourse, "courses");
    setEditingIndex(-1);
  };

  const handleCancel = () => {
    setEditingIndex(-1);
  };

  return (
    <Box>
      {courses.length > 0 &&
        courses.map((course, index) => (
          <Box key={index}>
            {editingIndex !== index ? (
              <>
                <Typography sx={{ my: 3 }} variant="h6">
                  Course {index + 1}
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="p">
                    Name:{" "}
                    {courseList.find((e) => e.value === course.course_id)
                      ?.label || "N/A"}
                  </Typography>
                  <Typography variant="p">
                    Number of Seats: {course.course_limit}
                  </Typography>
                  <Typography variant="p"></Typography>
                </Box>
                <Button
                  sx={{ my: 3 }}
                  variant="contained"
                  onClick={() => handleEdit(index)}
                >
                  Edit
                </Button>
                <Button
                  sx={{ my: 3, mx: 3 }}
                  variant="contained"
                  onClick={() => deleteCourse(index, "courses")}
                >
                  Delete
                </Button>
              </>
            ) : (
              <>
                <Grid container spacing={3}>
                  <Grid item md={4} xs={12}>
                    <TextField
                      fullWidth
                      label="Course"
                      select
                      value={tempCourse.course_id}
                      onChange={(event) =>
                        setTempCourse({
                          ...tempCourse,
                          course_id: event.target.value,
                        })
                      }
                    >
                      {courseList.map((option, index) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item md={4} xs={12}>
                    <TextField
                      fullWidth
                      label="Number of Seats"
                      type="number"
                      value={tempCourse.course_limit}
                      onChange={(event) =>
                        setTempCourse({
                          ...tempCourse,
                          course_limit: event.target.value,
                        })
                      }
                    />
                  </Grid>
                </Grid>
                <Button onClick={() => handleSave(index)}>Save</Button>
                <Button onClick={handleCancel}>Cancel</Button>
              </>
            )}
          </Box>
        ))}
    </Box>
  );
};

const CenterDetails = ({ centers, updateCenter, deleteCenter }) => {
  const [editingIndex, setEditingIndex] = useState(-1);
  const [tempCenter, setTempCenter] = useState({});

  const handleEdit = (index) => {
    setEditingIndex(index);
    setTempCenter({ ...centers[index] });
  };

  const handleSave = (index) => {
    updateCenter(index, tempCenter, "centers");
    setEditingIndex(-1);
  };

  const handleDelete = (index) => {
    deleteCenter(index, "centers");
  };

  const handleCancel = () => {
    setEditingIndex(-1);
  };

  return (
    <Box>
      {centers.length > 0 &&
        centers.map((center, index) => (
          <Box key={index}>
            {editingIndex !== index ? (
              <>
                <Typography sx={{ my: 3 }} variant="h6">
                  Center {index + 1}
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="p">Name: {center.centerName}</Typography>
                  <Typography variant="p">
                    Location: {center.location}
                  </Typography>
                  <Typography variant="p">
                    Number of Seats: {center.numberOfSeats}
                  </Typography>
                </Box>
                <Button
                  sx={{ my: 3 }}
                  variant="contained"
                  onClick={() => handleEdit(index)}
                >
                  Edit
                </Button>
                <Button
                  sx={{ my: 3, mx: 3 }}
                  variant="contained"
                  onClick={() => handleDelete(index)}
                >
                  Delete
                </Button>
              </>
            ) : (
              <>
                <Grid container spacing={3}>
                  <Grid item md={4} xs={12}>
                    <TextField
                      fullWidth
                      label="Center Name:"
                      type="text"
                      value={tempCenter.centerName}
                      onChange={(event) =>
                        setTempCenter({
                          ...tempCenter,
                          centerName: event.target.value,
                        })
                      }
                    />
                  </Grid>

                  <Grid item md={4} xs={12}>
                    <TextField
                      fullWidth
                      label="Location"
                      name="location"
                      select
                      value={tempCenter.location}
                      onChange={(event) =>
                        setTempCenter({
                          ...tempCenter,
                          location: event.target.value,
                        })
                      }
                      required
                    >
                      {nigeria_states.map((location, index) => (
                        <MenuItem key={index} value={location}>
                          {location}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item md={4} xs={12}>
                    <TextField
                      fullWidth
                      label="Number of Seats"
                      type="number"
                      value={tempCenter.numberOfSeats}
                      onChange={(event) =>
                        setTempCenter({
                          ...tempCenter,
                          numberOfSeats: event.target.value,
                        })
                      }
                    />
                  </Grid>
                </Grid>
                <Button onClick={() => handleSave(index)}>Save</Button>
                <Button onClick={handleCancel}>Cancel</Button>
              </>
            )}
          </Box>
        ))}
    </Box>
  );
};

export const CohortEditForm = ({ cohort, cancel, ...other }) => {
  const { data, error, isLoading } = useGetCoursesQuery();
  const [updateCohort, result_e] = useEditCohortMutation();
  const [createCohort, result] = useCreateCohortMutation();
  const [deleteCohort, delete_result] = useDeleteCohortMutation();
  const [deleteCC, delete_cc_result] = useDeleteCohortCoursesMutation();
  const router = useRouter();

  let courseOptions = [];
  if (data?.courses) {
    courseOptions = data.courses.map((e) => ({ label: e.name, value: e.id }));
  }

  const formik = useFormik({
    initialValues: {
      name: cohort?.name || "",
      color: cohort?.color || "",
      start_date: cohort?.start_date || "",
      end_date: cohort?.end_date || "",
      active: cohort?.active || false,
      centerName: "",
      location: "",
      numberOfSeats: "",
      centers: cohort?.centers?.length
        ? cohort.centers.map((c) => ({
            id: c.id,
            numberOfSeats: c.seats,
            location: c.location,
            centerName: c.name,
          }))
        : [],
      course: "",
      course_limit: "",
      courses: cohort?.cohortCourses ? cohort.cohortCourses : [],
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      color: Yup.string().max(7),
      start_date: Yup.date(),
      end_date: Yup.date(),
      active: Yup.boolean().required("Status is required"),
      // centerName: Yup.string().required('Name is required'),
      // location: Yup.string().required('Location is required'),
      // numberOfSeats: Yup.number().required('Number of seats is required'),
    }),
    onSubmit: async (values, helpers) => {
      const { centers, courses, name, color, start_date, end_date, active } =
        values;
      const promiseFunc = (params, id) => {
        return new Promise(async (resolve, reject) => {
          let req;
          if (id) {
            req = await updateCohort({ id, body: params });
            if (req.data?.message === "success") resolve(req);
          } else {
            req = await createCohort({ body: params });
            if (req.data?.message === "success") resolve(req);
          }
          reject(req);
        });
      };
      toast
        .promise(
          promiseFunc(
            {
              cohortCourses: courses,
              centers,
              values: {
                name,
                color,
                start_date,
                end_date,
                active,
              },
            },
            cohort?.id
          ),
          {
            loading: <b>Loading...</b>,
            success: <b>successful!</b>,
            error: (err) => {
              console.error(err);
              if (err.status === 401) return <b>Invalid Credentials.</b>;
              return <b>An error occurred.</b>;
            },
          }
        )
        .then((res) => {
          router.replace("/admin-dashboard/cohorts");
        })
        .catch((err) => {
          console.error(err);
          helpers.setStatus({ success: false });
          helpers.setErrors({ submit: err.message });
          helpers.setSubmitting(false);
        });
    },
  });

  const setCourses = (courses) => formik.setFieldValue("courses", courses);

  const setCenters = (centers) => formik.setFieldValue("centers", centers);

  const handleAddCourse = (event) => {
    setCourses([
      ...formik.values.courses,
      {
        course_id: formik.values.course,
        course_limit: formik.values.course_limit,
      },
    ]);
    formik.setFieldValue("course", "");
    formik.setFieldValue("course_limit", "");
  };
  const handleAddCenter = (event) => {
    setCenters([
      ...formik.values.centers,
      {
        centerName: formik.values.centerName,
        location: formik.values.location,
        numberOfSeats: formik.values.numberOfSeats,
      },
    ]);
    formik.setFieldValue("centerName", "");
    formik.setFieldValue("location", "");
    formik.setFieldValue("numberOfSeats", "");
  };

  const handleUpdate = (index, data, key) => {
    let values = [...formik.values[key]];

    values[index] = data;
    key === "centers" ? setCenters(values) : setCourses(values);
  };

  const handleDelete = (index, key) => {
    let data = [...formik.values[key]];
    if (data.at(index)) {
      if (data[index].id) {
        key === "courses" &&
          deleteCC({
            id: data[index].cohortId,
            cohortCourseId: data[index].id,
          });
      }
      data.splice(index, 1);
      key === "centers" ? setCenters(data) : setCourses(data);
    }
  };

  if (isLoading) return <SplashScreen />;
  if (error) {
    if (error.status === 401) {
      router.push(`/api/auth/signin?callbackUrl=%2Fadmin-dashboard`);
    }
  }
  if (!data) return <div>No Data!</div>;
  return (
    <form onSubmit={formik.handleSubmit} {...other}>
      <Card>
        <CardHeader title={cohort?.id ? "Edit Cohort" : "Create Cohort"} />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item md={6} xs={12}>
              <TextField
                error={Boolean(formik.touched.name && formik.errors.name)}
                fullWidth
                helperText={formik.touched.name && formik.errors.name}
                label="Cohort Name"
                name="name"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                required
                value={formik.values.name}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                error={Boolean(formik.touched.color && formik.errors.color)}
                fullWidth
                helperText={formik.touched.color && formik.errors.color}
                label="Cohort Color"
                name="color"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                required
                value={formik.values.color}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <MobileDatePicker
                // error={Boolean(formik.touched.startand_date && formik.errors.start_date)}
                // fullWidth
                // helperText={formik.touched.start_date && formik.errors.start_date}
                // label="Start Date"
                // name="start_date"
                // onBlur={formik.handleBlur}
                // onChange={formik.handleChange}
                // required
                // type="date"
                // value={formik.values.start_date}
                label="Start Date"
                inputFormat="dd/MM/yyyy"
                onChange={(value) => {
                  formik.setFieldValue("start_date", toDate(value));
                }}
                value={formik.values.start_date}
                name="start_date"
                maxDate={formik.values.end_date}
                required
                renderInput={(params) => (
                  <TextField
                    fullWidth
                    {...params}
                    error={Boolean(
                      formik.touched.start_date && formik.errors.start_date
                    )}
                    helperText={
                      formik.touched.start_date && formik.errors.start_date
                    }
                  />
                )}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <MobileDatePicker
                // error={Boolean(formik.touched.end_date && formik.errors.end_date)}
                // fullWidth
                // helperText={formik.touched.end_date && formik.errors.end_date}
                // label="End Date"
                // name="end_date"
                // onBlur={formik.handleBlur}
                // onChange={formik.handleChange}
                // required
                // type="date"
                // value={formik.values.end_date}
                label="End Date"
                inputFormat="dd/MM/yyyy"
                onBlur={formik.handleBlur}
                onChange={(value) => {
                  formik.setFieldValue("end_date", toDate(value));
                }}
                value={formik.values.end_date}
                name="end_date"
                minDate={formik.values.start_date}
                required
                renderInput={(params) => (
                  <TextField
                    fullWidth
                    error={Boolean(
                      formik.touched.end_date && formik.errors.end_date
                    )}
                    helperText={
                      formik.touched.end_date && formik.errors.end_date
                    }
                    {...params}
                  />
                )}
              />
            </Grid>

            <Grid item md={12} sm={12} xs={12} sx={{}}>
              <Typography
                align="left"
                variant="h5"
                color="#000"
                backgroundColor="#FF9D43"
                padding="10px"
              >
                Course Details
              </Typography>
            </Grid>

            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label="Course"
                select
                name="course"
                value={formik.values.course}
                onChange={formik.handleChange}
              >
                {courseOptions.map((option, index) => (
                  <MenuItem key={index} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item md={4} xs={12}>
              <TextField
                error={Boolean(
                  formik.touched.numberOfSeats && formik.errors.numberOfSeats
                )}
                fullWidth
                helperText={
                  formik.touched.numberOfSeats && formik.errors.numberOfSeats
                }
                label="Number of Seats"
                name="course_limit"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                type="number"
                value={formik.values.course_limit}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <Button
                color="primary"
                variant="contained"
                type="button"
                disabled={
                  formik.values.course && formik.values.course_limit
                    ? false
                    : true
                }
                onClick={() => handleAddCourse()}
              >
                Add Course
              </Button>
            </Grid>

            <Grid item md={12} xs={12}>
              <CourseDetails
                courses={formik.values.courses}
                updateCourse={handleUpdate}
                deleteCourse={handleDelete}
                courseList={courseOptions}
              />
            </Grid>

            <Grid item md={12} sm={12} xs={12} sx={{}}>
              <Typography
                align="left"
                variant="h5"
                color="#000"
                backgroundColor="#FF9D43"
                padding="10px"
              >
                Center Details
              </Typography>
            </Grid>

            <Grid item md={4} xs={12}>
              <TextField
                error={Boolean(
                  formik.touched.centerName && formik.errors.centerName
                )}
                fullWidth
                helperText={
                  formik.touched.centerName && formik.errors.centerName
                }
                label="CenterName"
                name="centerName"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.centerName}
              />
            </Grid>
            <Grid item md={4} xs={12}>
              <TextField
                error={Boolean(
                  formik.touched.location && formik.errors.location
                )}
                fullWidth
                helperText={formik.touched.location && formik.errors.location}
                label="Location"
                name="location"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                select
                value={formik.values.location}
              >
                {nigeria_states.map((location, index) => (
                  <MenuItem key={index} value={location}>
                    {location}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item md={4} xs={12}>
              <TextField
                error={Boolean(
                  formik.touched.numberOfSeats && formik.errors.numberOfSeats
                )}
                fullWidth
                helperText={
                  formik.touched.numberOfSeats && formik.errors.numberOfSeats
                }
                label="Number of Seats"
                name="numberOfSeats"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                type="number"
                value={formik.values.numberOfSeats}
              />
            </Grid>

            <Grid item md={6} xs={12}>
              <Button
                color="primary"
                variant="contained"
                type="button"
                disabled={
                  formik.values.centerName && formik.values.numberOfSeats
                    ? false
                    : true
                }
                onClick={() => handleAddCenter()}
              >
                Add Center
              </Button>
            </Grid>
            <Grid item md={12} xs={12}>
              <CenterDetails
                centers={formik.values.centers}
                updateCenter={handleUpdate}
                deleteCenter={handleDelete}
              />
            </Grid>
            {/* 
            <Grid
              item
              md={6}
              xs={12}
            >
            <TextField
              error={Boolean(formik.touched.active && formik.errors.active)}
              fullWidth
              helperText={formik.touched.active && formik.errors.active}
              label="Active"
              name="active"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              required
              select
              value={formik.values.active}
            >
              <MenuItem value={true}>Yes</MenuItem>
              <MenuItem value={false}>No</MenuItem>
            </TextField>
            </Grid> */}
            <Grid item md={6} xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.active}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    inputProps={{
                      "aria-label": "controlled",
                      name: "active",
                    }}
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        {/* <Button
            color="primary"
            variant="contained"
            type="submit"
            disabled={formik.isSubmitting}
          >
            {cohort?.id ? "Update Cohort" : "Create Cohort"}
          </Button>
          <Button
            variant="contained"
            onClick={cancel}
          >
          Cancel
          </Button> */}
        <CardActions
          sx={{
            flexWrap: "wrap",
            m: -1,
          }}
        >
          <Button type="submit" sx={{ m: 1 }} variant="contained">
            Submit
          </Button>
          {cancel ? (
            <Button
              disabled={formik.isSubmitting}
              onClick={cancel}
              sx={{
                m: 1,
                mr: "auto",
              }}
              variant="outlined"
            >
              Cancel
            </Button>
          ) : (
            <Button
              component={NextLink}
              href={`/admin-dashboard/cohorts`}
              disabled={formik.isSubmitting}
              sx={{
                m: 1,
                mr: "auto",
              }}
              variant="outlined"
            >
              Cancel
            </Button>
          )}
          {cohort?.id && (
            <Button
              color="error"
              disabled={formik.isSubmitting}
              onClick={() =>
                toast.promise(deleteCohort(cohort.id), {
                  loading: <b>Loading...</b>,
                  success: <b>successful!</b>,
                  error: (err) => {
                    console.error(err);
                    if (err.status === 401) return <b>Invalid Credentials.</b>;
                    return <b>An error occurred.</b>;
                  },
                })
              }
            >
              Delete cohort
            </Button>
          )}
        </CardActions>
      </Card>
    </form>
  );
};

// CohortEditForm.propTypes = {
//   cohort: PropTypes.object.isRequired
// };
