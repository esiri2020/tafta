import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Grid, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Button, CircularProgress } from '@mui/material';
import { useGetCohortsQuery, useGetCohortCoursesQuery } from '../../services/api';

interface CohortSelectorProps {
  onSelect: (courseId: string) => void;
}

interface Cohort {
  id: string;
  name: string;
}

interface Course {
  id: string;
  name: string;
  description?: string;
}

interface CohortCourse {
  id: string;
  course: Course;
}

export const CohortSelector = ({ onSelect }: CohortSelectorProps) => {
  const { data: cohortsData, isLoading: isLoadingCohorts } = useGetCohortsQuery({ page: 0, limit: 20 });
  const [selectedCohort, setSelectedCohort] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  
  const { 
    data: cohortCoursesData, 
    isLoading: isLoadingCourses,
    isFetching: isFetchingCourses
  } = useGetCohortCoursesQuery(
    { id: selectedCohort },
    { skip: !selectedCohort }
  );

  const handleCohortChange = (event: SelectChangeEvent) => {
    setSelectedCohort(event.target.value);
    setSelectedCourse(''); // Reset selected course when cohort changes
  };

  const handleCourseChange = (event: SelectChangeEvent) => {
    setSelectedCourse(event.target.value);
  };

  const handleContinue = () => {
    if (selectedCourse) {
      onSelect(selectedCourse);
    }
  };

  if (isLoadingCohorts) {
    return (
      <Card>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading cohorts...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (!cohortsData || !cohortsData.cohorts || cohortsData.cohorts.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography>No cohorts are currently available.</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Select a Course
        </Typography>
        <Typography variant="body1" align="center" color="textSecondary" sx={{ mb: 4 }}>
          Please select a cohort and then choose a course to register for
        </Typography>

        <Grid container spacing={3}>
          {/* Cohort Selection */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="cohort-select-label">Cohort</InputLabel>
              <Select
                labelId="cohort-select-label"
                id="cohort-select"
                value={selectedCohort}
                label="Cohort"
                onChange={handleCohortChange}
              >
                {cohortsData.cohorts.map((cohort: Cohort) => (
                  <MenuItem key={cohort.id} value={cohort.id}>
                    {cohort.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Course Selection - only shown after cohort is selected */}
          {selectedCohort && (
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="course-select-label">Course</InputLabel>
                {isLoadingCourses || isFetchingCourses ? (
                  <CircularProgress size={24} sx={{ mt: 2 }} />
                ) : cohortCoursesData?.cohortCourses?.length ? (
                  <Select
                    labelId="course-select-label"
                    id="course-select"
                    value={selectedCourse}
                    label="Course"
                    onChange={handleCourseChange}
                  >
                    {cohortCoursesData.cohortCourses.map((cohortCourse: CohortCourse) => (
                      <MenuItem key={cohortCourse.id} value={cohortCourse.course.id.toString()}>
                        {cohortCourse.course.name}
                      </MenuItem>
                    ))}
                  </Select>
                ) : (
                  <Typography color="text.secondary" sx={{ mt: 2 }}>
                    No courses available for this cohort
                  </Typography>
                )}
              </FormControl>
            </Grid>
          )}

          <Grid item xs={12} sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              onClick={handleContinue}
              disabled={!selectedCourse}
            >
              Continue
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}; 