import {useCallback, useEffect, useState} from 'react';
import NextLink from 'next/link';
import Head from 'next/head';
import {useRouter} from 'next/router';
import {useSession} from 'next-auth/react';
import Error from 'next/error';
import {
  Chip,
  Avatar,
  Box,
  Container,
  Divider,
  Tab,
  Tabs,
  Typography,
  Badge,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemIcon,
  Pagination,
  Stack,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Autocomplete,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  Button,
  Grid,
  Switch,
  TextField,
} from '@mui/material';
import {MainLayout} from '../../components/main-layout';
import {SeatBooking} from '../../components/home/book-a-seat';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {DashboardLayout} from '../../components/dashboard/dashboard-layout';
import {ApplicantBasicDetails} from '../../components/dashboard/applicants/applicants-basic-details';
import {ApplicantDataManagement} from '../../components/dashboard/applicants/applicant-data-management';
import {ApplicantEnrollment} from '../../components/dashboard/applicants/applicants-enrollment';
import {PencilAlt as PencilAltIcon} from '../../icons/pencil-alt';
import {getInitials} from '../../utils/get-initials';
import {
  useGetApplicantQuery,
  useGetSeatBookingsQuery,
  useGetCohortCoursesQuery,
  useGetNotificationsQuery,
  useMarkNotificationsAsReadMutation,
  useDeleteNotificationsMutation,
} from '../../services/api';
import {SplashScreen} from '../../components/splash-screen';
import {
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
  School as SchoolIcon,
  AccessTime as AccessTimeIcon,
  Check as CheckIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  MarkEmailRead as MarkEmailReadIcon,
  Announcement as AnnouncementIcon,
  Mail as MailIcon,
  MailOpen as MailOpenIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import {format} from 'date-fns';
import NotificationPanel from '../../components/dashboard/notifications/notification-panel';

const tabs = [
  {label: 'Welcome Message', value: 'general'},
  {label: 'Current Enrollment', value: 'current-enrollment'},
  {label: 'Active Courses', value: 'active-courses'},
  {label: 'Book a Seat', value: 'book-a-seat'},
  {label: 'Notifications', value: 'notifications'},
  {label: 'Personal Information', value: 'personal-information'},
  {label: 'Assessment', value: 'assessment'},
];

export const Profile = () => (
  <Box
    sx={{
      alignItems: 'center',
      display: 'flex',
      mt: 5,
    }}>
    <Avatar
      src='/static/images/tafta-login.jpg'
      sx={{
        height: 64,
        width: 64,
      }}
    />
    <Box sx={{ml: 2}}>
      <Typography variant='h5'>John Carter</Typography>
    </Box>
    <Box sx={{flexGrow: 1}} />
  </Box>
);

export const Scheduler = ({seatBooking, seatDataQueryRes}) => (
  <Box
    sx={{
      justifyContent: 'center',
      display: 'flex',
      alignItems: 'center',
    }}>
    <Grid
      container
      justifyContent='center'
      maxWidth='lg'
      sx={{
        justifyContent: 'center',
        display: 'flex',
        my: 5,
      }}>
      <Grid
        item
        md={6}
        sm={8}
        xs={12}
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: {xs: 'block', sm: 'none', md: 'block'},
          justifyContent: 'center',
          display: 'flex',
          alignItems: 'center',
        }}>
        <img
          alt='header image'
          style={{width: '100%', height: '100%'}}
          src='/static/images/book-a-seat.png'
        />
      </Grid>
      <Grid
        item
        md={6}
        sm={8}
        xs={12}
        sx={{
          px: 2,
        }}>
        <SeatBooking
          seatBooking={seatBooking}
          seatDataQueryRes={seatDataQueryRes}
        />
      </Grid>
    </Grid>
  </Box>
);

export const General = () => (
  <Box>
    <Card>
      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
        <Typography
          variant='h5'
          align='center'
          sx={{
            marginBottom: '20px',
            pt: '50px',
          }}>
          Welcome Message
        </Typography>
        <Typography
          variant='h5'
          align='center'
          sx={{
            marginBottom: '50px',
            padding: '50px',
          }}>
          Thank you for Registering You can start your course here
        </Typography>
        <NextLink href='#' passHref>
          <Button>Learning Portal</Button>
        </NextLink>
      </CardContent>
    </Card>
  </Box>
);

export const CourseInformation = ({data}) => {
  if (!data || !data.cohortCourses) {
    <div>No Data!</div>;
  }
  const {cohortCourses} = data;
  return (
    <Box>
      <Card>
        <CardContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
          <Typography
            variant='h5'
            align='left'
            sx={{
              marginBottom: '50px',
            }}>
            Select A New Course
          </Typography>
          <form onSubmit={event => event.preventDefault()}>
            <Grid container spacing={3}>
              <Grid item md={12} xs={12}>
                <Box>
                  <Typography sx={{ml: 2}} variant='p'>
                    Course to study
                  </Typography>
                </Box>
                <Box sx={{ml: 2}}>
                  <RadioGroup
                    name='courseToStudy'
                    sx={{flexDirection: 'column'}}>
                    {cohortCourses.map(cohort_course => (
                      <FormControlLabel
                        control={<Radio sx={{ml: 1}} />}
                        key={cohort_course.id}
                        label={
                          <Typography variant='body1' sx={{flexGrow: 1}}>
                            {cohort_course.course.name}
                          </Typography>
                        }
                        value={cohort_course.course.id}
                      />
                    ))}
                  </RadioGroup>
                </Box>
                <Box sx={{mt: 2}}>
                  <Button
                    // disabled={formik.isSubmitting}
                    type='submit'
                    sx={{m: 1}}
                    variant='contained'>
                    Register
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

const Account = () => {
  const [currentTab, setCurrentTab] = useState('general');
  const router = useRouter();
  let {id} = router.query;
  const {data: session, status} = useSession();

  const handleTabsChange = (event, value) => {
    setCurrentTab(value);
  };

  const {data, error, isLoading} = useGetApplicantQuery(
    session?.userData.userId,
    {skip: session?.userData.userId ? false : true},
  );
  const seatDataQueryRes = useGetSeatBookingsQuery({});

  // Check if userCohort exists and has elements before accessing cohortId
  const hasUserCohort =
    data?.user?.userCohort && data.user.userCohort.length > 0;
  const cohortId = hasUserCohort
    ? data.user.userCohort.slice(-1)[0].cohortId
    : undefined;

  const {data: cohortCoursesData, error: cohortCourseError} =
    useGetCohortCoursesQuery({id: cohortId || 'default'}, {skip: !cohortId});

  // Add a query for notifications to show in the notifications tab
  const {
    data: notificationsData,
    error: notificationsError,
    isLoading: notificationsLoading,
    refetch: refetchNotifications,
  } = useGetNotificationsQuery({
    page: 0,
    limit: 10,
  });

  const handleNotificationUpdate = () => {
    refetchNotifications();
  };

  console.log('notificationsData', notificationsData);

  if (isLoading) return <SplashScreen />;
  if (error) {
    switch (error.status) {
      case 404:
        return (
          <Box sx={{bgcolor: '#000'}}>
            <Error statusCode={404} title='User not found' />
          </Box>
        );
      case 403:
        return (
          <Box sx={{bgcolor: '#000'}}>
            <Error statusCode={403} title='Unauthorized' />
          </Box>
        );
      default:
        return <Error statusCode={400} title='An error occured' />;
    }
  }
  if (!data) return <div>No Data!</div>;
  const {user: applicant} = data;

  // Get unread notifications count
  const unreadNotificationsCount =
    notificationsData?.notifications?.filter(n => !n.isRead).length || 0;

  return (
    <>
      <Head>
        <title>Dashboard</title>
      </Head>
      <Box
        component='main'
        sx={{
          flexGrow: 1,
          py: 8,
        }}>
        <Container maxWidth='lg'>
          <div>
            <Grid container justifyContent='space-between' spacing={3}>
              <Grid
                item
                sx={{
                  alignItems: 'center',
                  display: 'flex',
                  overflow: 'hidden',
                }}>
                <Avatar
                  src={applicant.avatar}
                  sx={{
                    height: 64,
                    mr: 2,
                    width: 64,
                  }}>
                  {getInitials(`${applicant.firstName} ${applicant.lastName}`)}
                </Avatar>
                <div>
                  <Typography variant='h4'>
                    {`${applicant.firstName} ${applicant.lastName}`}
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                    }}>
                    <Typography variant='subtitle2'>Email:</Typography>
                    <Chip label={applicant.email} size='small' sx={{ml: 1}} />
                  </Box>
                </div>
              </Grid>
              <Grid item sx={{m: -1}}>
                {/* <NextLink href={`/dashboard/${applicant.id}/edit`} passHref>
                  <Button
                    component='a'
                    endIcon={<PencilAltIcon fontSize='small' />}
                    sx={{m: 1}}
                    variant='outlined'>
                    Edit Personal Information
                  </Button>
                </NextLink> */}
                <Button
                  onClick={() => setCurrentTab('notifications')}
                  startIcon={
                    <Badge
                      badgeContent={unreadNotificationsCount}
                      color='error'
                      max={99}>
                      <NotificationsIcon />
                    </Badge>
                  }
                  sx={{m: 1}}
                  variant='outlined'>
                  Notifications
                </Button>
                <NextLink href='/dashboard/assessment' passHref>
                  <Button component='a' sx={{m: 1}} variant='outlined'>
                    Complete Assessment
                  </Button>
                </NextLink>
                <NextLink
                  href={`https://portal.terraacademyforarts.com/users/sign_in`}
                  passHref>
                  <Button sx={{m: 1}} variant='contained'>
                    Start Learning
                  </Button>
                </NextLink>
              </Grid>
            </Grid>
            <Tabs
              indicatorColor='primary'
              onChange={handleTabsChange}
              scrollButtons='auto'
              sx={{mt: 3}}
              textColor='primary'
              value={currentTab}
              variant='scrollable'>
              {tabs.map(tab => (
                <Tab key={tab.value} label={tab.label} value={tab.value} />
              ))}
            </Tabs>
          </div>
          <Divider sx={{mb: 3}} />
          {currentTab === 'general' && <General />}
          {currentTab === 'current-enrollment' && (
            <ApplicantEnrollment
              enrollments={applicant.userCohort[0]?.enrollments}
            />
          )}
          {currentTab === 'active-courses' && (
            // <CourseInformation data={cohortCoursesData} />
            <Typography>One Member, One Cohort </Typography>
          )}
          {currentTab === 'book-a-seat' && (
            <Scheduler
              seatBooking={applicant.seatBooking}
              seatDataQueryRes={seatDataQueryRes}
            />
          )}
          {currentTab === 'notifications' && (
            <Box sx={{mt: 3}}>
              <NotificationPanel 
                notificationsData={notificationsData} 
                onNotificationUpdate={handleNotificationUpdate}
              />
            </Box>
          )}
          {currentTab === 'personal-information' && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <ApplicantBasicDetails applicant={applicant} />
              </Grid>
              <Grid item xs={12}>
                <ApplicantDataManagement id={id} />
              </Grid>
            </Grid>
          )}
          {currentTab === 'assessment' && (
            <Box sx={{mt: 2, textAlign: 'center'}}>
              <Typography variant='h6' sx={{mb: 2}}>
                Complete your TAFTA training assessment
              </Typography>
              <NextLink href='/dashboard/assessment' passHref>
                <Button component='a' variant='contained' sx={{px: 4, py: 1}}>
                  Go to Assessment Form
                </Button>
              </NextLink>
            </Box>
          )}
        </Container>
      </Box>
    </>
  );
};

Account.getLayout = page => <MainLayout>{page}</MainLayout>;

export default Account;
