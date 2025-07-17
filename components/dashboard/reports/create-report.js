import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControlLabel,
  FormHelperText,
  Grid,
  MenuItem,
  Switch,
  TextField,
  Typography,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { useCreateReportMutation } from '../../../services/api'
import { selectCohort } from '../../../services/cohortSlice'
import { useAppSelector } from '../../../hooks/rtkHook'

export const CreateReport = (props) => {
  const cohort = useAppSelector(state => selectCohort(state))
  const router = useRouter();
  const [createReport, result] = useCreateReportMutation()
  const [cohorts, setCohorts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch available cohorts
    const fetchCohorts = async () => {
      try {
        const response = await fetch('/api/cohorts/active')
        const data = await response.json()
        if (Array.isArray(data)) {
          setCohorts(data)
        }
      } catch (error) {
        console.error('Error fetching cohorts:', error)
        toast.error('Failed to load cohorts')
      } finally {
        setLoading(false)
      }
    }
    fetchCohorts()
  }, [])

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      cohortId: cohort?.id || '',
      files: [],
      submit: null
    },
    validationSchema: Yup.object({
      description: Yup.string().max(5000),
      files: Yup.array(),
      title: Yup.string().max(255).required('Title is required'),
      cohortId: Yup.string().required('Cohort is required'),
    }),
    onSubmit: async (values, helpers) => {
      const { title, description, cohortId } = values
      if (!cohortId) {
        toast.error('Please select a cohort')
        return
      }
      try {
        let toastId = toast.loading('Uploading...')
        // NOTE: Make API request
        if (files.length > 0) {
          let formData = new FormData();
          for (var i = 0; i < files.length; i++) {
            let file = files[i]
            let safeFilename = Date.now() + '_' + file.name.replace(/\s+/g, '_')
            formData.append('files[]', file, safeFilename)
          }
          console.log('Uploading files...', files);
          const res = await fetch(
            'https://files.terraacademyforarts.com/upload.php',
            {
              method: "POST",
              body: formData,
            }
          )
          if (res.status === 200) {
            let resData = await res.json()
            console.log('File upload response:', resData);
            let { files: filesRes } = resData
            let body = {
              title, description, cohortId, files: filesRes.map(file => file.url)
            }
            console.log('Creating report with body:', body);
            const apiResult = await createReport({ body }).unwrap()
            console.log('Report creation response:', apiResult);
            if (apiResult?.message == 'success') {
              toast.dismiss()
              toast.success('Report uploaded')
              router.push('/admin-dashboard/reports')
            } else {
              toast.dismiss()
              toast.error('Upload Failed')
            }
          } else {
            console.error('File upload failed:', await res.text());
            toast.dismiss()
            toast.error('Upload failed')
          }
        } else {
          let body = {
            title, description, cohortId, files: []
          }
          console.log('Creating report without files:', body);
          const apiResult = await createReport({ body }).unwrap()
          console.log('Report creation response:', apiResult);
          if (apiResult?.message == 'success') {
            toast.dismiss()
            toast.success('Report uploaded')
            router.push('/admin-dashboard/reports')
          } else {
            toast.dismiss()
            toast.error('Upload Failed')
          }
        }
      } catch (err) {
        console.error('Error details:', err);
        toast.dismiss()
        toast.error('Something went wrong!');
        helpers.setStatus({ success: false });
        helpers.setErrors({ submit: err.message });
        helpers.setSubmitting(false);
      }
    }
  });

  const [files, setFile] = useState([])

  useEffect(() => {
    if (cohort?.id) {
      formik.setFieldValue('cohortId', cohort.id)
    }
  }, [cohort])

  function handleChange(event) {
    setFile(event.target.files)
  }

  return (
    <form
      onSubmit={formik.handleSubmit}
      {...props}>
      <Card>
        <CardContent>
          <Grid
            container
            spacing={3}
          >
            <Grid
              item
              md={4}
              xs={12}
            >
              <Typography variant="h6">
                Basic details
              </Typography>
            </Grid>
            <Grid
              item
              container
              direction="column"
              md={8}
              xs={12}
              rowSpacing={2}
            >
              <Grid item>
                <TextField
                  error={Boolean(formik.touched.title && formik.errors.title)}
                  fullWidth
                  helperText={formik.touched.title && formik.errors.title}
                  label="Report Title"
                  name="title"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.title}
                />
              </Grid>
              <Grid item>
                <TextField
                  error={Boolean(formik.touched.description && formik.errors.description)}
                  fullWidth
                  multiline
                  rows={4}
                  helperText={formik.touched.description && formik.errors.description}
                  label="Report Description"
                  name="description"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.description}
                />
              </Grid>
              <Grid item>
                <FormControl fullWidth error={Boolean(formik.touched.cohortId && formik.errors.cohortId)}>
                  <InputLabel>Cohort</InputLabel>
                  <Select
                    name="cohortId"
                    value={formik.values.cohortId}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    label="Cohort"
                  >
                    {cohorts.map((cohort) => (
                      <MenuItem key={cohort.id} value={cohort.id}>
                        {cohort.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.cohortId && formik.errors.cohortId && (
                    <FormHelperText>{formik.errors.cohortId}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Grid
            container
            spacing={3}
          >
            <Grid
              item
              md={4}
              xs={12}
            >
              <Typography variant="h6">
                Files
              </Typography>
              <Typography
                color="textSecondary"
                variant="body2"
                sx={{ mt: 1 }}
              >
                Files will appear in the dashboard entries for all to see.
              </Typography>
            </Grid>
            <Grid
              item
              md={8}
              xs={12}
            >
              <input type="file" onChange={handleChange} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          mx: -1,
          mb: -1,
          mt: 3
        }}
      >
        <Button
          color="error"
          sx={{
            m: 1,
            mr: 'auto'
          }}
        >
          Delete
        </Button>
        <Button
          sx={{ m: 1 }}
          variant="outlined"
          onClick={() => router.push('/admin-dashboard/reports')}
        >
          Cancel
        </Button>
        <Button
          sx={{ m: 1 }}
          type="submit"
          variant="contained"
          disabled={loading}
        >
          Create
        </Button>
      </Box>
    </form>
  );
};


