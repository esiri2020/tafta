import {useEffect, useState} from 'react';
import NextLink from 'next/link';
import PropTypes from 'prop-types';
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  IconButton,
  Link,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import {ArrowRight as ArrowRightIcon} from '../../../icons/arrow-right';
import {PencilAlt as PencilAltIcon} from '../../../icons/pencil-alt';
import {getInitials} from '../../../utils/get-initials';
import {Scrollbar} from '../../scrollbar';
import {
  useDeleteApplicantsMutation,
  useApproveApplicantsMutation,
  useAutoEnrollmentMutation,
} from '../../../services/api';
import toast from 'react-hot-toast';
import {NotificationDialog} from '../notifications/notification-dialog';
import {Notifications as NotificationsIcon} from '@mui/icons-material';
import axios from 'axios';

export const ApplicantsListTable = props => {
  const {
    applicants,
    applicantsCount,
    onPageChange,
    onLimitChange,
    page,
    limit,
    cohortId,
    ...other
  } = props;
  const [selectedApplicants, setSelectedApplicants] = useState([]);
  const [deleteApplicants, result] = useDeleteApplicantsMutation();
  const [approveApplicants, approve_result] = useApproveApplicantsMutation();
  const [autoEnrollment, {isLoading, isError, error}] =
    useAutoEnrollmentMutation();

  // New state for notification dialog
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);

  // New state for retrying enrollment
  const [retryingUid, setRetryingUid] = useState(null);

  // Reset selected applicants when applicants change
  useEffect(
    () => {
      if (selectedApplicants.length) {
        setSelectedApplicants([]);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [applicants],
  );

  const handleSelectAllApplicants = event => {
    setSelectedApplicants(
      event.target.checked ? applicants.map(applicant => applicant.id) : [],
    );
  };

  const handleSelectOneApplicant = (event, applicantId) => {
    if (!selectedApplicants.includes(applicantId)) {
      setSelectedApplicants(prevSelected => [...prevSelected, applicantId]);
    } else {
      setSelectedApplicants(prevSelected =>
        prevSelected.filter(id => id !== applicantId),
      );
    }
  };

  const applicantIds = applicants?.map(item => item.id);

  const handleAutoEnrollment = async () => {
    if (window.confirm('Enroll the selected applicants?')) {
      toast
        .promise(
          autoEnrollment({
            applicants: applicantIds,
          }).unwrap(),
          {
            loading: <b>Enrolling...</b>,
            success: <b>Enrolled!</b>,
            error: err => {
              console.error(err);
              if (err.status === 401) return <b>Invalid Credentials.</b>;
              return <b>An error occurred.</b>;
            },
          },
        )
        .then(response => {
          console.log('Success');
        })
        .catch(err => console.error(err));
    }
  };

  const enableBulkActions = selectedApplicants.length > 0;
  const selectedSomeApplicants =
    selectedApplicants.length > 0 &&
    selectedApplicants.length < applicants.length;
  const selectedAllApplicants = selectedApplicants.length === applicants.length;

  // Handle opening notification dialog
  const handleOpenNotificationDialog = () => {
    setNotificationDialogOpen(true);
  };

  // Handle closing notification dialog
  const handleCloseNotificationDialog = () => {
    setNotificationDialogOpen(false);
  };

  const handleRetryEnrollment = async (uid) => {
    setRetryingUid(uid);
    try {
      const res = await axios.post('/api/enrollments/retry', { uid });
      toast.success(res.data.message || 'Enrollment retried successfully');
      // Optionally: trigger a reload of applicants here
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Retry failed');
    } finally {
      setRetryingUid(null);
    }
  };

  return (
    <div {...other}>
      {/* Notification Dialog */}
      <NotificationDialog
        open={notificationDialogOpen}
        onClose={handleCloseNotificationDialog}
        selectedApplicantIds={selectedApplicants}
        title='Send Notification to Applicants'
      />

      <Box
        sx={{
          backgroundColor: theme =>
            theme.palette.mode === 'dark' ? 'neutral.800' : 'neutral.100',
          display: enableBulkActions ? 'block' : 'none',
          px: 2,
          py: 0.5,
        }}>
        <Checkbox
          checked={selectedAllApplicants}
          indeterminate={selectedSomeApplicants}
          onChange={handleSelectAllApplicants}
        />
        <Button
          size='small'
          sx={{ml: 2}}
          onClick={() => {
            if (window.confirm('Delete these applicants?')) {
              toast
                .promise(deleteApplicants({ids: selectedApplicants}).unwrap(), {
                  loading: <b>Deleting...</b>,
                  success: <b>Deleted!</b>,
                  error: err => {
                    console.error(err);
                    if (err.status === 401) return <b>Invalid Credentials.</b>;
                    return <b>An error occurred.</b>;
                  },
                })
                .then(response => {
                  console.log('Success');
                })
                .catch(err => console.error(err));
            }
          }}>
          Delete
        </Button>

        <Button
          sx={{m: 1}}
          variant='contained'
          onClick={() => {
            if (window.confirm('Approve these applicants?')) {
              toast
                .promise(
                  approveApplicants({ids: selectedApplicants}).unwrap(),
                  {
                    loading: <b>Approving...</b>,
                    success: <b>Approved!</b>,
                    error: err => {
                      console.error(err);
                      if (err.status === 401)
                        return <b>Invalid Credentials.</b>;
                      return <b>An error occurred.</b>;
                    },
                  },
                )
                .then(response => {
                  console.log('Success');
                })
                .catch(err => console.error(err));
            }
          }}>
          Approve and Enroll
        </Button>

        {/* Add Notification Button */}
        <Button
          sx={{m: 1}}
          variant='outlined'
          color='primary'
          startIcon={<NotificationsIcon />}
          onClick={handleOpenNotificationDialog}>
          Send Notification
        </Button>
      </Box>
      <Scrollbar>
        <Table sx={{minWidth: 700}}>
          <TableHead
            sx={{visibility: enableBulkActions ? 'collapse' : 'visible'}}>
            <TableRow>
              <TableCell padding='checkbox'>
                <Checkbox
                  checked={selectedAllApplicants}
                  indeterminate={selectedSomeApplicants}
                  onChange={handleSelectAllApplicants}
                />
              </TableCell>
              <TableCell>Full Name</TableCell>
              <TableCell>Course</TableCell>
              <TableCell>Application Status</TableCell>
              <TableCell>Enrollment Status</TableCell>
              <TableCell align='right'>Options</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {applicants.map(applicant => {
              const isApplicantSelected = selectedApplicants.includes(
                applicant.id,
              );

              return (
                <TableRow
                  hover
                  key={applicant.id}
                  selected={isApplicantSelected}>
                  <TableCell padding='checkbox'>
                    <Checkbox
                      checked={isApplicantSelected}
                      onChange={event =>
                        handleSelectOneApplicant(event, applicant.id)
                      }
                      value={isApplicantSelected}
                    />
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        alignItems: 'center',
                        display: 'flex',
                      }}>
                      <Avatar
                        src={applicant.avatar}
                        sx={{
                          height: 42,
                          width: 42,
                        }}>
                        {getInitials(
                          `${applicant.firstName} ${applicant.lastName}`,
                        )}
                      </Avatar>
                      <Box sx={{ml: 1}}>
                        <Button
                          component={NextLink}
                          href={`/admin-dashboard/applicants/${applicant.id}`}
                          color='inherit'
                          variant='subtitle2'>
                          {`${applicant.firstName} ${applicant.lastName}`}
                        </Button>
                        <Typography color='textSecondary' variant='body2'>
                          {applicant.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {applicant.userCohort[0]?.enrollments?.length > 0
                      ? applicant.userCohort[0]?.enrollments
                          ?.map(e => e.course_name)
                          .join(', ')
                      : 'No Enrollments'}
                  </TableCell>
                  <TableCell>
                    {applicant.profile ? (
                      applicant.userCohort[0]?.enrollments[0]?.enrolled ? (
                        <Box
                          as='span'
                          bgcolor={'secondary.main'}
                          sx={{
                            borderRadius: 1,
                            padding: 1,
                          }}>
                          Approved
                        </Box>
                      ) : (
                        <Box
                          as='span'
                          bgcolor={'warning.main'}
                          sx={{
                            borderRadius: 1,
                            padding: 1,
                          }}>
                          Completed
                        </Box>
                      )
                    ) : (
                      <Box
                        as='span'
                        bgcolor={'action.disabled'}
                        sx={{
                          borderRadius: 1,
                          padding: 1,
                        }}>
                        Pending
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    {applicant.userCohort[0]?.enrollments.length > 0 ? (
                      applicant.userCohort[0]?.enrollments[0].enrolled ? (
                        <Box
                          as='span'
                          bgcolor={'secondary.main'}
                          sx={{
                            borderRadius: 1,
                            padding: 1,
                          }}>
                          Enrolled
                        </Box>
                      ) : (
                        <Box
                          as='span'
                          bgcolor={'warning.main'}
                          sx={{
                            borderRadius: 1,
                            padding: 1,
                          }}>
                          Pending
                        </Box>
                      )
                    ) : (
                      <Box
                        as='span'
                        bgcolor={'action.disabled'}
                        sx={{
                          borderRadius: 1,
                          padding: 1,
                        }}>
                        None
                      </Box>
                    )}
                    {/* Retry Enrollment Button: show if stuck */}
                    {applicant.userCohort[0]?.enrollments.length > 0 &&
                      (!applicant.userCohort[0].enrollments[0].activated_at || !applicant.userCohort[0].enrollments[0].enrolled) && (
                        <Button
                          size='small'
                          variant='outlined'
                          disabled={retryingUid === applicant.userCohort[0].enrollments[0].uid}
                          onClick={() => handleRetryEnrollment(applicant.userCohort[0].enrollments[0].uid)}
                          sx={{ml: 1}}
                        >
                          {retryingUid === applicant.userCohort[0].enrollments[0].uid ? 'Retrying...' : 'Retry Enrollment'}
                        </Button>
                      )}
                  </TableCell>
                  <TableCell align='right'>
                    <IconButton component={NextLink} href={`/admin-dashboard/applicants/${applicant.id}/edit`}>
                      <PencilAltIcon fontSize='small' />
                    </IconButton>
                    <IconButton component={NextLink} href={`/admin-dashboard/applicants/${applicant.id}`}>
                      <ArrowRightIcon fontSize='small' />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Scrollbar>
      <TablePagination
        component='div'
        count={applicantsCount}
        onPageChange={onPageChange}
        onRowsPerPageChange={onLimitChange}
        page={page}
        rowsPerPage={limit}
        rowsPerPageOptions={[10, 25, 50]}
      />
      <div>
        <Button
          sx={{m: 1}}
          variant='contained'
          onClick={event => handleAutoEnrollment(event, applicants)}>
          Enroll Eligible Applicants
        </Button>
      </div>
    </div>
  );
};

ApplicantsListTable.propTypes = {
  applicants: PropTypes.array.isRequired,
  applicantsCount: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onLimitChange: PropTypes.func,
  page: PropTypes.number.isRequired,
  limit: PropTypes.number.isRequired,
};
