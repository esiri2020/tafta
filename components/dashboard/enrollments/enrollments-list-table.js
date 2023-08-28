import { Fragment, useState } from 'react';
import NextLink from 'next/link';
import PropTypes from 'prop-types';
import { toast } from 'react-hot-toast';
import {
  Box,
  Button,
  CardContent,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  LinearProgress,
  Link,
  MenuItem,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import { ChevronDown as ChevronDownIcon } from '../../../icons/chevron-down';
import { ChevronRight as ChevronRightIcon } from '../../../icons/chevron-right';
import { DotsHorizontal as DotsHorizontalIcon } from '../../../icons/dots-horizontal';
import { Scrollbar } from '../../scrollbar';
import { SeverityPill } from '../../severity-pill';
import { formatInTimeZone } from '../../../utils';
import { EnrollmentBasicDetails } from './enrollment-basic-details'
import { EnrollmentUserDetails } from './enrollment-user-details'


export const EnrollmentListTable = (props) => {
  const {
    onPageChange,
    onRowsPerPageChange,
    page,
    enrollments,
    enrollmentsCount,
    rowsPerPage,
    ...other
  } = props;
  const [openEnrollment, setOpenEnrollment] = useState(null);

  const handleOpenEnrollment = (enrollmentId) => {
    setOpenEnrollment((prevValue) => (prevValue === enrollmentId ? null : enrollmentId));
  };

  const handleUpdateEnrollment = () => {
    setOpenEnrollment(null);
    toast.success('Enrollment updated');
  };

  const handleCancelEdit = () => {
    setOpenEnrollment(null);
  };

  const handleDeleteEnrollment = () => {
    toast.error('Enrollment cannot be deleted');
  };

  return (
    <div {...other}>
      <Scrollbar>
        <Table sx={{ minWidth: 1200 }}>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>
                Applicant Name
              </TableCell>
              <TableCell width="25%">
                Course Name
              </TableCell>
              <TableCell>
                Percentage complete
              </TableCell>
              <TableCell>
                Start Date
              </TableCell>
              <TableCell>
                Date Completed
              </TableCell>
              <TableCell>
                Expiry Date
              </TableCell>
              <TableCell>
                Status
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {enrollments.map((enrollment) => {
              const open = enrollment.uid === openEnrollment;
              return (
                <Fragment key={enrollment.uid}>
                  <TableRow
                    hover
                    key={enrollment.uid}
                  >
                    <TableCell
                      padding="checkbox"
                      sx={{
                        ...(open && {
                          position: 'relative',
                          '&:after': {
                            position: 'absolute',
                            content: '" "',
                            top: 0,
                            left: 0,
                            backgroundColor: 'primary.main',
                            width: 3,
                            height: 'calc(100% + 1px)'
                          }
                        })
                      }}
                      width="25%"
                    >
                      <IconButton onClick={() => handleOpenEnrollment(enrollment.uid)}>
                        {open
                          ? <ChevronDownIcon fontSize="small" />
                          : <ChevronRightIcon fontSize="small" />}
                      </IconButton>
                    </TableCell>
                    <TableCell>
                    <NextLink
                          href={`/admin-dashboard/applicants/${enrollment.userCohort.user.id}`}
                          passHref
                        >
                          <Link
                            color="inherit"
                            variant="subtitle2"
                          >
                            {`${enrollment.userCohort.user.firstName} ${enrollment.userCohort.user.lastName}`}
                          </Link>
                        </NextLink>
                    </TableCell>
                    <TableCell width="25%">
                      <Box
                        sx={{
                          alignItems: 'center',
                          display: 'flex'
                        }}
                      >
                        <Box
                          sx={{
                            cursor: 'pointer',
                            ml: 2
                          }}
                        >
                          <Typography variant="subtitle2">
                            {enrollment.course_name}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <LinearProgress
                        value={enrollment.percentage_completed}
                        variant="determinate"
                        color={
                          enrollment.percentage_completed >= 0.1 ? 
                          enrollment.percentage_completed >= 0.5 ? 
                          enrollment.percentage_completed == 1 ? 'success' : 'info': 'warning':'error'}
                        sx={{
                          height: 8,
                          width: 36
                        }}
                      />
                      <Typography
                        color="textSecondary"
                        variant="body2"
                      >
                        {parseFloat(enrollment.percentage_completed).toLocaleString("en", { style: "percent", minimumFractionDigits: 2 })}
                        
                        {enrollment.variants > 1 && ` in ${enrollment.variants} variants`}
                      </Typography>
                    </TableCell>
                    <TableCell>
                    {enrollment.activated_at ? formatInTimeZone(enrollment.activated_at, 'dd MMM yyyy') : ''}
                    </TableCell>
                    <TableCell>
                      {enrollment.completed_at ? formatInTimeZone(enrollment.completed_at, 'dd MMM yyyy') : ''}
                    </TableCell>
                    <TableCell>
                      {enrollment.expiry_date ? formatInTimeZone(enrollment.expiry_date, 'dd MMM yyyy') : ''}
                    </TableCell>
                    <TableCell>
                      <SeverityPill color={enrollment.expired ? 'error' : enrollment.completed ? 'success' : enrollment.activated_at ? enrollment.percentage_completed == 0 ? 'warning':'info': 'warning'}>
                        {enrollment.expired ? 'Expired' : enrollment.completed ? 'Completed' : enrollment.activated_at ? enrollment.percentage_completed == 0 ? 'Not started':'Active' : 'Approval Pending'}
                      </SeverityPill>
                    </TableCell>
                  </TableRow>
                  {open && (
                    <TableRow>
                      <TableCell
                        colSpan={12}
                        sx={{
                          p: 0,
                          position: 'relative',
                          '&:after': {
                            position: 'absolute',
                            content: '" "',
                            top: 0,
                            left: 0,
                            backgroundColor: 'primary.main',
                            width: 3,
                            height: 'calc(100% + 1px)'
                          }
                        }}
                      >
                        <Grid
                          container
                          spacing={3}
                        >
                          <Grid
                            item
                            lg={6}
                            xs={12}
                          >
                            <EnrollmentBasicDetails enrollment={enrollment}/>
                          </Grid>
                          <Grid
                            item
                            lg={6}
                            xs={12}
                          >
                            <EnrollmentUserDetails enrollment={enrollment}/>
                          </Grid>
                          </Grid>
                        <Divider />
                        <Box
                          sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            px: 2,
                            py: 1
                          }}
                        >
                          <Button
                            onClick={handleDeleteEnrollment}
                            color="error"
                            sx={{
                              m: 1,
                              ml: 'auto'
                            }}
                          >
                            Delete enrollment
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </Scrollbar>
      <TablePagination
        component="div"
        count={enrollmentsCount}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[10, 25, 50]}
      />
    </div>
  );
};

EnrollmentListTable.propTypes = {
  enrollments: PropTypes.array.isRequired,
  enrollmentsCount: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onRowsPerPageChange: PropTypes.func,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired
};
