import React, { useState } from 'react'
import { Button, Divider, MenuItem,  Typography,    Autocomplete,    Card,    CardActions,    CardContent,    CardHeader,    BBoxider,
    FormControlLabel,    Grid,     Switch,     TextField,   } from '@mui/material';
import { Box } from '@mui/system';

const course_items = [
    "Abia",
    "Adamawa",
    "Akwa Ibom",
    "Anambra",
    "Bauchi",
    "Bayelsa",
    "Benue",
    "Borno",
    "Cross River",
    "Delta",
    "Ebonyi",
    "Edo",
    "Ekiti",
    "Enugu",
    "FCT - Abuja",
    "Gombe",
    "Imo",
    "Jigawa",
    "Kaduna",
    "Kano",
    "Katsina",
    "Kebbi",
    "Kogi",
    "Kwara",
    "Lagos",
    "Nasarawa",
    "Niger",
    "Ogun",
    "Ondo",
    "Osun",
    "Oyo",
    "Plateau",
    "Rivers",
    "Sokoto",
    "Taraba",
    "Yobe",
    "Zamfara",
    ""
];

const CourseDetails = ({ courses, updateCourse }) => {
    const [editingIndex, setEditingIndex] = useState(-1)
    const [tempCourse, setTempCourse] = useState({})
  
    const handleEdit = (index) => {
      setEditingIndex(index)
      setTempCourse({ ...courses[index] })
    }
  
    const handleSave = (index) => {
      updateCourse(index, tempCourse)
      setEditingIndex(-1)
    }
  
    const handleCancel = () => {
      setEditingIndex(-1)
    }
  
    return (
      <Box>
        {courses.map((course, index) => (
          <Box key={index}>
            {editingIndex !== index ? (
              <>
                <Typography sx={{my: 3}}variant = 'h4'>Course {index + 1}</Typography>
                <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                <Typography variant = 'h5'>Course: {course.course}</Typography>
                <Typography variant = 'h5'>Number of Seats: {course.numberOfApplicants}</Typography>
                </Box>
                <Button sx={{my: 3}} variant='contained' onClick={() => handleEdit(index)}>Edit</Button>
              </>
            ) : (
              <>
        <Grid
            container
            spacing={3}
        >
            <Grid
                item
                md={4}
                xs={12}
            >
                <TextField
                    fullWidth
                    label="Course"
                    name="course"
                    select
                    value={tempCourse.course}
                    onChange={(event) =>
                      setTempCourse({ ...tempCourse, course: event.target.value })
                    }
                    required
                >
                    {
                        course_items.map((course, index) => (
                            <MenuItem key={index} value={course}>
                                {course}
                            </MenuItem>
                        ))
                    }
                </TextField>
            </Grid>    

            <Grid
                item
                md={4}
                xs={12}
            >
                  <TextField
                    fullWidth
                    label='Number of Seats'
                    type="number"
                    value={tempCourse.numberOfApplicants}
                    onChange={(event) =>
                      setTempCourse({ ...tempCourse, numberOfApplicants: event.target.value })
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
    )
  }

const CreateCourse = () => {
  const [course, setCourse] = useState('')
  const [numberOfApplicants, setNumberOfApplicants] = useState('')
  const [courses, setCourses] = useState([])

  const handleSubmit = (event) => {
    event.preventDefault()
    setCourses([...courses, { course, numberOfApplicants }])

    setCourse('')
    setNumberOfApplicants('')
  }

  const updateCourse = (index, updatedCourse) => {
    const newCourses = [...courses]
    newCourses[index] = updatedCourse
    setCourses(newCourses)
  }

  const handleAdd = () => {
    setCourses([...courses, { course, numberOfApplicants }])
    setCourse('')
    setNumberOfApplicants('')
  }
  console.log(courses)

  return (
    <form  onSubmit={handleSubmit}>
        <Card>
            <CardHeader title= 'Course Details'/>
            <Divider />
                <CardContent>
                    
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between'
                    }}>
                        <Grid
                            container
                            spacing={3}
                        >

                            <Grid
                                item
                                md={4}
                                xs={12}
                            >
                                <TextField
                                    fullWidth
                                    label="Course"
                                    name="course"
                                    select
                                    value={course} 
                                    onChange={(event) => setCourse(event.target.value)}
                                    required
                                >
                                    {
                                        course_items.map((course, index) => (
                                            <MenuItem key={index} value={course}>
                                                {course}
                                            </MenuItem>
                                        ))
                                    }
                                </TextField>
                            </Grid>    

                            <Grid
                                item
                                md={4}
                                xs={12}
                            >
                                <TextField
                                fullWidth
                                label='Number of Seats'
                                type="number"
                                value={numberOfApplicants}
                                onChange={(event) => setNumberOfApplicants(event.target.value)}
                                />
                            </Grid>
                        </Grid>
                    </Box>

                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        py: 3,
                    }}>
                        <Button  variant='contained' type="Button" onClick={handleAdd}>
                            Add
                        </Button>
                        <Button variant='outlined' type="submit">Submit</Button>
                    </Box>
                    <CourseDetails courses={courses}  updateCourse={updateCourse}/>
                </CardContent>

        </Card>
    </form>

  )
}

export default CreateCourse


