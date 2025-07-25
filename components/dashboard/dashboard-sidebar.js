import {useEffect, useRef, useState} from 'react';
import NextLink from 'next/link';
import {useRouter} from 'next/router';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  Typography,
  useMediaQuery,
  Link,
} from '@mui/material';
import {Home as HomeIcon} from '../../icons/home';
import {Selector as SelectorIcon} from '../../icons/selector';
import {UserCircle as UserCircleIcon} from '../../icons/user-circle';
import {Users as UsersIcon} from '../../icons/users';
import {Logo} from '../logo';
import {Scrollbar} from '../scrollbar';
import {DashboardSidebarSection} from './dashboard-sidebar-section';
import {CohortPopover} from './cohort-popover';
import LanIcon from '@mui/icons-material/Lan';
import SchoolIcon from '@mui/icons-material/School';
import ChairAltIcon from '@mui/icons-material/ChairAlt';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import {useGetCohortsQuery} from '../../services/api';
import {selectCohort, setCohort} from '../../services/cohortSlice';
import {useAppDispatch, useAppSelector} from '../../hooks/rtkHook';
import {useSession} from 'next-auth/react';
import {Notifications as NotificationsIcon} from '../../icons/notifications';
import {LoadingState} from '../ui/loading-state';

const getSupportSections = userId => [
  {
    title: 'General',
    items: [
      {
        title: 'Dashboard',
        path: '/admin-dashboard',
        icon: <HomeIcon fontSize='small' />,
        children: [
          {
            title: 'Enrollment Overview',
            path: '/admin-dashboard',
          },
          {
            title: 'View All Enrollments',
            path: '/admin-dashboard/enrollments',
          },
        ],
      },
      {
        title: 'Applicants',
        path: '/admin-dashboard/applicants',
        icon: <SchoolIcon fontSize='small' />,
        children: [
          {
            title: 'Create Applicants',
            path: '/admin-dashboard/applicants/create',
          },
          {
            title: 'View All Applicants',
            path: '/admin-dashboard/applicants',
          },
          {
            title: 'Applicants Overview',
            path: '/admin-dashboard/applicants/overview',
          },
        ],
      },
      {
        title: 'Assessment',
        path: '/admin-dashboard/assessment',
        icon: <SchoolIcon fontSize='small' />,
        children: [
          {
            title: 'Assessment Overview',
            path: '/admin-dashboard/assessment/overview',
          },
        ],
      },
      {
        title: 'Notifications',
        path: '/admin-dashboard/notifications',
        icon: <NotificationsIcon fontSize='small' />,
        children: [
          {
            title: 'Notification Overview',
            path: '/admin-dashboard/notifications',
          },
          {
            title: 'Cohort Alerts',
            path: '/admin-dashboard/notifications/alerts',
          },
        ],
      },
    ],
  },

  // {
  //   title: 'Scheduler',
  //   items: [
  //     {
  //       title: 'Bookings ',
  //       path: '/admin-dashboard/scheduler',
  //       icon: <ChairAltIcon fontSize='small' />,
  //       children: [
  //         {
  //           title: 'Manage Bookings',
  //           path: '/admin-dashboard/scheduler',
  //         },
  //       ],
  //     },
  //   ],
  // },
  {
    title: 'Manage Support',
    items: [
      {
        title: 'Reports',
        path: '/admin-dashboard/reports',
        icon: <SupportAgentIcon fontSize='small' />,
      },
    ],
  },
  // {
  //   title: 'Manage Users',
  //   items: [
  //     {
  //       title: 'Users',
  //       path: '/admin-dashboard/users',
  //       icon: <UsersIcon fontSize='small' />,
  //       children: [
  //         {
  //           title: 'View Users',
  //           path: '/admin-dashboard/users/',
  //         },
  //         {
  //           title: 'Create Users',
  //           path: '/admin-dashboard/users/create-user',
  //         },
  //       ],
  //     },
  //   ],
  // },
  {
    title: 'Account',
    items: [
      {
        title: 'Profile',
        path: `/admin-dashboard/profile/${userId}`,
        icon: <UserCircleIcon fontSize='small' />,
      },
    ],
  },
];

const getAdminSelection = userId => [
  {
    title: 'General',
    items: [
      {
        title: 'Dashboard',
        path: '/admin-dashboard',
        icon: <HomeIcon fontSize='small' />,
        children: [
          {
            title: 'Enrollment Overview',
            path: '/admin-dashboard',
          },
          {
            title: 'View All Enrollments',
            path: '/admin-dashboard/enrollments',
          },
        ],
      },
      {
        title: 'Applicants',
        path: '/admin-dashboard/applicants',
        icon: <SchoolIcon fontSize='small' />,
        children: [
          {
            title: 'Create Applicants',
            path: '/admin-dashboard/applicants/create',
          },
          {
            title: 'View All Applicants',
            path: '/admin-dashboard/applicants',
          },
          {
            title: 'Applicants Overview',
            path: '/admin-dashboard/applicants/overview',
          },
        ],
      },
      {
        title: 'Assessment',
        path: '/admin-dashboard/assessment',
        icon: <SchoolIcon fontSize='small' />,
        children: [
          {
            title: 'Assessment Overview',
            path: '/admin-dashboard/assessment/overview',
          },
        ],
      },
      // {
      //   title: 'Cohorts',
      //   path: '/admin-dashboard/cohorts',
      //   icon: <LanIcon fontSize='small' />,
      //   children: [
      //     {
      //       title: 'View Cohorts',
      //       path: '/admin-dashboard/cohorts',
      //     },
      //     {
      //       title: 'Create Cohorts',
      //       path: '/admin-dashboard/cohorts/create',
      //     },
      //   ],
      // },
      {
        title: 'Notifications',
        path: '/admin-dashboard/notifications',
        icon: <NotificationsIcon fontSize='small' />,
        children: [
          {
            title: 'Notification Overview',
            path: '/admin-dashboard/notifications',
          },
          {
            title: 'Cohort Alerts',
            path: '/admin-dashboard/notifications/alerts',
          },
        ],
      },
    ],
  },

  // {
  //   title: 'Scheduler',
  //   items: [
  //     {
  //       title: 'Bookings ',
  //       path: '/admin-dashboard/scheduler',
  //       icon: <ChairAltIcon fontSize='small' />,
  //       children: [
  //         {
  //           title: 'Manage Bookings',
  //           path: '/admin-dashboard/scheduler',
  //         },
  //         {
  //           title: 'Book a Seat',
  //           path: '/admin-dashboard/scheduler/book-a-seat',
  //         },
  //       ],
  //     },
  //   ],
  // },
  {
    title: 'Manage Support',
    items: [
      {
        title: 'Reports',
        path: '/admin-dashboard/reports',
        icon: <SupportAgentIcon fontSize='small' />,
      },
    ],
  },
  // {
  //   title: 'Manage Users',
  //   items: [
  //     {
  //       title: 'Users',
  //       path: '/admin-dashboard/users',
  //       icon: <UsersIcon fontSize='small' />,
  //       children: [
  //         {
  //           title: 'View Users',
  //           path: '/admin-dashboard/users/',
  //         },
  //         {
  //           title: 'Create Users',
  //           path: '/admin-dashboard/users/create-user',
  //         },
  //       ],
  //     },
  //   ],
  // },
  {
    title: 'Account',
    items: [
      {
        title: 'Profile',
        path: `/admin-dashboard/profile/${userId}`,
        icon: <UserCircleIcon fontSize='small' />,
      },
    ],
  },
];

const getSuperAdminSections = userId => [
  {
    title: 'General',
    items: [
      {
        title: 'Dashboard',
        path: '/admin-dashboard',
        icon: <HomeIcon fontSize='small' />,
        children: [
          {
            title: 'Enrollment Overview',
            path: '/admin-dashboard',
          },
          {
            title: 'View All Enrollments',
            path: '/admin-dashboard/enrollments',
          },
        ],
      },
      {
        title: 'Applicants',
        path: '/admin-dashboard/applicants',
        icon: <SchoolIcon fontSize='small' />,
        children: [
          {
            title: 'Create Applicants',
            path: '/admin-dashboard/applicants/create',
          },
          {
            title: 'View All Applicants',
            path: '/admin-dashboard/applicants',
          },
          {
            title: 'Applicants Overview',
            path: '/admin-dashboard/applicants/overview',
          },
        ],
      },
      {
        title: 'Assessment',
        path: '/admin-dashboard/assessment',
        icon: <SchoolIcon fontSize='small' />,
        children: [
          {
            title: 'Assessment Overview',
            path: '/admin-dashboard/assessment/overview',
          },
        ],
      },
      {
        title: 'Cohorts',
        path: '/admin-dashboard/cohorts',
        icon: <LanIcon fontSize='small' />,
        children: [
          {
            title: 'View Cohorts',
            path: '/admin-dashboard/cohorts',
          },
          {
            title: 'Create Cohorts',
            path: '/admin-dashboard/cohorts/create',
          },
        ],
      },
      {
        title: 'Notifications',
        path: '/admin-dashboard/notifications',
        icon: <NotificationsIcon fontSize='small' />,
        children: [
          {
            title: 'General Notifications',
            path: '/admin-dashboard/notifications',
          },
          {
            title: 'Cohort Alerts',
            path: '/admin-dashboard/notifications/alerts',
          },
        ],
      },
    ],
  },

  {
    title: 'Scheduler',
    items: [
      {
        title: 'Bookings ',
        path: '/admin-dashboard/scheduler',
        icon: <ChairAltIcon fontSize='small' />,
        children: [
          {
            title: 'Manage Bookings',
            path: '/admin-dashboard/scheduler',
          },
        ],
      },
    ],
  },
  {
    title: 'Manage Support',
    items: [
      {
        title: 'Reports',
        path: '/admin-dashboard/reports',
        icon: <SupportAgentIcon fontSize='small' />,
      },
    ],
  },
  {
    title: 'Manage Users',
    items: [
      {
        title: 'Users',
        path: '/admin-dashboard/users',
        icon: <UsersIcon fontSize='small' />,
        children: [
          {
            title: 'View Users',
            path: '/admin-dashboard/users/',
          },
          {
            title: 'Create Users',
            path: '/admin-dashboard/users/create-user',
          },
        ],
      },
    ],
  },
  {
    title: 'Account',
    items: [
      {
        title: 'Profile',
        path: `/admin-dashboard/profile/${userId}`,
        icon: <UserCircleIcon fontSize='small' />,
      },
    ],
  },
];

const getGuestSections = userId => [
  {
    title: 'General',
    items: [
      {
        title: 'Dashboard',
        path: '/admin-dashboard',
        icon: <HomeIcon fontSize='small' />,
        children: [
          {
            title: 'Enrollment Overview',
            path: '/admin-dashboard',
          },
          {
            title: 'View All Enrollments',
            path: '/admin-dashboard/enrollments',
          },
        ],
      },
      {
        title: 'Applicants',
        path: '/admin-dashboard/applicants',
        icon: <SchoolIcon fontSize='small' />,
        children: [
          {
            title: 'View All Applicants',
            path: '/admin-dashboard/applicants',
          },
          {
            title: 'Applicants Overview',
            path: '/admin-dashboard/applicants/overview',
          },
        ],
      },
      {
        title: 'Assessment',
        path: '/admin-dashboard/assessment',
        icon: <SchoolIcon fontSize='small' />,
        children: [
          {
            title: 'Assessment Overview',
            path: '/admin-dashboard/assessment/overview',
          },
        ],
      },
      {
        title: 'Notifications',
        path: '/admin-dashboard/notifications',
        icon: <NotificationsIcon fontSize='small' />,
        children: [
          {
            title: 'Notification Overview',
            path: '/admin-dashboard/notifications',
          },
        ],
      },
      // {
      //   title: 'Cohorts',
      //   path: '/admin-dashboard/cohorts',
      //   icon: <LanIcon fontSize='small' />,
      //   children: [
      //     {
      //       title: 'View Cohorts',
      //       path: '/admin-dashboard/cohorts',
      //     },
      //   ],
      // },
    ],
  },
  {
    title: 'Account',
    items: [
      {
        title: 'Profile',
        path: `/admin-dashboard/profile/${userId}`,
        icon: <UserCircleIcon fontSize='small' />,
      },
    ],
  },
];

export const DashboardSidebar = props => {
  const {onClose, open} = props;
  const {data: session, status} = useSession();
  const router = useRouter();
  const lgUp = useMediaQuery(theme => theme.breakpoints.up('lg'), {
    noSsr: true,
  });
  const sections =
    session?.userData?.role === 'SUPERADMIN'
      ? getSuperAdminSections(session.userData.userId)
      : session?.userData?.role === 'ADMIN'
      ? getAdminSelection(session.userData.userId)
      : session?.userData?.role === 'SUPPORT'
      ? getSupportSections(session.userData.userId)
      : session?.userData?.role === 'GUEST'
      ? getGuestSections(session.userData.userId)
      : [];
  const cohortRef = useRef(null);
  const [cohort, setSelectedCohort] = useState(null);
  const [openCohortPopover, setOpenCohortPopover] = useState(false);
  const {data, error, isLoading} = useGetCohortsQuery({
    page: 0,
    filter: undefined,
  });

  const dispatch = useAppDispatch();
  const cohortId = useAppSelector(state => selectCohort(state));
  const [isChangingCohort, setIsChangingCohort] = useState(false);
  const [cohortChangeProgress, setCohortChangeProgress] = useState(0);

  useEffect(() => {
    if (data?.message == 'success') {
      // Get the latest active cohort (first in the array since they're ordered by start_date desc)
      const latestActiveCohort = data.cohorts?.find(cohort => cohort.active);
      setSelectedCohort(latestActiveCohort || null);
      dispatch(setCohort(latestActiveCohort || null));
    }
  }, [data, dispatch]);

  const handlePathChange = () => {
    if (!router.isReady) {
      return;
    }

    if (open) {
      onClose?.();
    }
  };

  useEffect(
    handlePathChange,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router.isReady, router.asPath],
  );

  const handleChange = async (cohort) => {
    setIsChangingCohort(true);
    setCohortChangeProgress(0);
    
    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setCohortChangeProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 100);

    try {
      setSelectedCohort(cohort);
      dispatch(setCohort(cohort));
      handleCloseCohortPopover();
      
      // Complete the progress
      setCohortChangeProgress(100);
      setTimeout(() => {
        setIsChangingCohort(false);
        setCohortChangeProgress(0);
      }, 500);
    } catch (error) {
      console.error('Error changing cohort:', error);
      setIsChangingCohort(false);
      setCohortChangeProgress(0);
    }
  };

  const handleOpenCohortPopover = () => {
    setOpenCohortPopover(true);
  };

  const handleCloseCohortPopover = () => {
    setOpenCohortPopover(false);
  };

  const content = (
    <>
      {isChangingCohort && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <LoadingState 
            progress={cohortChangeProgress}
            message="Updating cohort data..."
          />
        </div>
      )}
      <Scrollbar
        sx={{
          height: '100%',
          '& .simplebar-content': {
            height: '100%',
          },
        }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}>
          <div>
            <Box sx={{p: 3}}>
              <Link href='https://terraacademyforarts.com/' passHref legacyBehavior sx={{ display: 'flex', my: '2', mx: '0', width: '160px', '& img': { width: '100%' } }}>
                <a style={{ display: 'flex', width: '100%' }}>
                  <img src='/static/images/logo.svg' alt='Terra Academy for the Arts' />
                </a>
              </Link>
            </Box>
            <Box sx={{px: 2}}>
              {data?.cohorts && (
                <Box
                  onClick={handleOpenCohortPopover}
                  ref={cohortRef}
                  sx={{
                    alignItems: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    px: 3,
                    py: '11px',
                    borderRadius: 1,
                  }}>
                  <div>
                    <Typography color='inherit' variant='subtitle1'>
                      {cohort ? cohort.name : 'All cohorts'}
                    </Typography>
                    <Typography color='neutral.400' variant='body2'>
                      {cohort
                        ? `Status: ${cohort.active ? 'Active' : 'Ended'}`
                        : 'Viewing all cohorts'}
                    </Typography>
                  </div>
                  <SelectorIcon
                    sx={{
                      color: 'neutral.500',
                      width: 14,
                      height: 14,
                    }}
                  />
                </Box>
              )}
            </Box>
          </div>
          <Divider
            sx={{
              borderColor: '#2D3748',
              my: 3,
            }}
          />
          <Box sx={{flexGrow: 1, pb: '50px'}}>
            {sections.map(section => (
              <DashboardSidebarSection
                key={section.title}
                path={router.asPath}
                sx={{
                  mt: 2,
                  '& + &': {
                    mt: 2,
                  },
                }}
                {...section}
              />
            ))}
          </Box>
          <Divider
            sx={{
              borderColor: '#2D3748', // dark divider
            }}
          />
          <Box sx={{p: 2, display: 'flex', justifyContent: 'center'}}>
            <Typography color='neutral.500' variant='body2'>
              {'copyright 2022'}
            </Typography>
          </Box>
        </Box>
      </Scrollbar>
      <CohortPopover
        anchorEl={cohortRef.current}
        onClose={handleCloseCohortPopover}
        open={openCohortPopover}
        cohorts={data?.cohorts}
        handleChange={handleChange}
        showAllOption={true}
      />
    </>
  );

  if (lgUp) {
    return (
      <Drawer
        anchor='left'
        open
        PaperProps={{
          sx: {
            backgroundColor: '#000',
            borderRightColor: 'divider',
            borderRightStyle: 'solid',
            borderRightWidth: theme => (theme.palette.mode === 'dark' ? 1 : 0),
            color: '#FFFFFF',
            width: 280,
          },
        }}
        variant='permanent'>
        {content}
      </Drawer>
    );
  }

  return (
    <Drawer
      anchor='left'
      onClose={onClose}
      open={open}
      PaperProps={{
        sx: {
          backgroundColor: '#000',
          color: '#FFFFFF',
          width: 280,
        },
      }}
      sx={{zIndex: theme => theme.zIndex.appBar + 100}}
      variant='temporary'>
      {content}
    </Drawer>
  );
};

DashboardSidebar.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
};
