import { useState } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
// import PropTypes from 'prop-types';
// import { format } from 'date-fns';
import {
  Avatar,
  Box,
  Card,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography
} from '@mui/material';
import { getInitials } from '../../utils/get-initials';

import { useGetApplicantsQuery } from '../../services/api'
// import { Warning } from '@mui/icons-material';

export const ApplicantsList = (props) => {
  const { mobilizerId, cohortId, showMobilizerColumn = true, ...otherProps } = props;
  const [selectedCustomerIds, setSelectedCustomerIds] = useState([]);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(0);

  const { data, error, isLoading } = useGetApplicantsQuery({
    page, 
    limit,
    mobilizerId: mobilizerId || undefined,
    cohortId: cohortId || undefined
  })
  
  // Debug logging
  console.log('🔍 ApplicantsList Debug:', {
    isLoading,
    hasData: !!data,
    hasApplicants: !!data?.applicants,
    applicantsCount: data?.applicants?.length,
    error,
    mobilizerId
  });

  // Early return checks
  if(isLoading) {
    return (
      <div>Loading...</div>
    )
  }
  if(!data) return null;
  const { applicants, count } = data;
  
  // Handle case where applicants is undefined or null
  if (!applicants || !Array.isArray(applicants)) {
    return (
      <Card {...otherProps}>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No applicants found.
          </Typography>
        </Box>
      </Card>
    );
  }

  const handleSelectAll = (event) => {
    let newSelectedCustomerIds;

    if (event.target.checked) {
      newSelectedCustomerIds = applicants.map((customer) => customer.id);
    } else {
      newSelectedCustomerIds = [];
    }

    setSelectedCustomerIds(newSelectedCustomerIds);
  };

  const handleSelectOne = (event, id) => {
    const selectedIndex = selectedCustomerIds.indexOf(id);
    let newSelectedCustomerIds = [];

    if (selectedIndex === -1) {
      newSelectedCustomerIds = newSelectedCustomerIds.concat(selectedCustomerIds, id);
    } else if (selectedIndex === 0) {
      newSelectedCustomerIds = newSelectedCustomerIds.concat(selectedCustomerIds.slice(1));
    } else if (selectedIndex === selectedCustomerIds.length - 1) {
      newSelectedCustomerIds = newSelectedCustomerIds.concat(selectedCustomerIds.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelectedCustomerIds = newSelectedCustomerIds.concat(
        selectedCustomerIds.slice(0, selectedIndex),
        selectedCustomerIds.slice(selectedIndex + 1)
      );
    }

    setSelectedCustomerIds(newSelectedCustomerIds);
  };

  const handleLimitChange = (event) => {
    setLimit(event.target.value);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  return (
    <Card {...props}>
      <PerfectScrollbar>
        <Box sx={{ minWidth: 1050 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={applicants.length > 0 && selectedCustomerIds.length === applicants.length}
                    color="primary"
                    indeterminate={
                      selectedCustomerIds.length > 0
                      && selectedCustomerIds.length < applicants.length
                    }
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>
                  Full Name
                </TableCell>
                <TableCell>
                  Email
                </TableCell>
                <TableCell>
                  Course
                </TableCell>
                <TableCell>
                  Application Status
                </TableCell>
                <TableCell>
                  Enrollment Status
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {applicants.map((customer) => (
                <TableRow
                  hover
                  key={customer.id}
                  selected={selectedCustomerIds.indexOf(customer.id) !== -1}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedCustomerIds.indexOf(customer.id) !== -1}
                      onChange={(event) => handleSelectOne(event, customer.id)}
                      value="true"
                    />
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        alignItems: 'center',
                        display: 'flex'
                      }}
                    >
                      <Avatar
                        src={customer.avatarUrl}
                        sx={{ mr: 2 }}
                      >
                        {getInitials(`${customer.firstName} ${customer.lastName}`)}
                      </Avatar>
                      <Typography
                        color="textPrimary"
                        variant="body1"
                      >
                        {`${customer.firstName} ${customer.lastName}`}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {customer.email}
                  </TableCell>
                  <TableCell>
                    {
                      customer.enrollments && customer.enrollments.length > 0 ?
                      customer.enrollments.map(e => e.course_name).join(", ") :
                      'No Enrollments'
                    }
                  </TableCell>
                  <TableCell>
                    {
                      customer.profile ? (
                        (customer.enrollments && customer.enrollments.length > 0 && customer.enrollments[0]?.enrolled) ? (
                          <Box 
                            as="span" 
                            bgcolor={'secondary.main'}
                            sx={{
                              borderRadius: 1,
                              padding: 1
                            }}
                          >
                            Approved 
                          </Box>
                        ) : (
                          <Box 
                            as="span" 
                            bgcolor={'warning.main'}
                            sx={{
                              borderRadius: 1,
                              padding: 1
                            }}
                          >
                            Completed
                          </Box>
                        )
                      ) : (
                        <Box 
                          as="span" 
                          bgcolor={'action.disabled'}
                          sx={{
                            borderRadius: 1,
                            padding: 1
                          }}
                        >
                          Pending
                        </Box>
                      )
                    }
                  </TableCell>
                  <TableCell>
                    {
                      (customer.enrollments && customer.enrollments.length > 0) ? (
                        customer.enrollments[0]?.enrolled ? (
                          <Box 
                            as="span" 
                            bgcolor={'secondary.main'}
                            sx={{
                              borderRadius: 1,
                              padding: 1
                            }}
                          >
                            Enrolled 
                          </Box>
                        ) : (
                          <Box 
                            as="span" 
                            bgcolor={'warning.main'}
                            sx={{
                              borderRadius: 1,
                              padding: 1
                            }}
                          >
                            Pending 
                          </Box>
                        )
                      ) : (
                        <Box 
                          as="span" 
                          bgcolor={'action.disabled'}
                          sx={{
                            borderRadius: 1,
                            padding: 1
                          }}
                        >
                          None
                        </Box>
                      )
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </PerfectScrollbar>
      <TablePagination
        component="div"
        count={count}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleLimitChange}
        page={page}
        rowsPerPage={limit}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Card>
  );
};

// ApplicantsList.propTypes = {
//   applicants: PropTypes.array.isRequired
// };
