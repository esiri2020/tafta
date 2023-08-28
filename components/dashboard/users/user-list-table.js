import { useEffect, useState } from 'react';
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
  Typography
} from '@mui/material';
import { ArrowRight as ArrowRightIcon } from '../../../icons/arrow-right';
import { PencilAlt as PencilAltIcon } from '../../../icons/pencil-alt';
import { getInitials } from '../../../utils/get-initials';
import { Scrollbar } from '../../scrollbar';

export const UsersListTable = (props) => {
  const {
    users,
    usersCount,
    onPageChange,
    onLimitChange,
    page,
    limit,
    ...other
  } = props;
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Reset selected users when users change
  useEffect(() => {
      if (selectedUsers.length) {
        setSelectedUsers([]);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [users]);

  const handleSelectAllUsers = (event) => {
    setSelectedUsers(event.target.checked
      ? users.map((user) => user.id)
      : []);
  };

  const handleSelectOneUser = (event, userId) => {
    if (!selectedUsers.includes(userId)) {
      setSelectedUsers((prevSelected) => [...prevSelected, userId]);
    } else {
      setSelectedUsers((prevSelected) => prevSelected.filter((id) => id !== userId));
    }
  };

  const enableBulkActions = selectedUsers.length > 0;
  const selectedSomeUsers = selectedUsers.length > 0
    && selectedUsers.length < users.length;
  const selectedAllUsers = selectedUsers.length === users.length;

  return (
    <div {...other}>
      <Box
        sx={{
          backgroundColor: (theme) => theme.palette.mode === 'dark'
            ? 'neutral.800'
            : 'neutral.100',
          display: enableBulkActions ? 'block' : 'none',
          px: 2,
          py: 0.5
        }}
      >
        <Checkbox
          checked={selectedAllUsers}
          indeterminate={selectedSomeUsers}
          onChange={handleSelectAllUsers}
        />
        <Button
          size="small"
          sx={{ ml: 2 }}
        >
          Delete
        </Button>
        <Button
          size="small"
          sx={{ ml: 2 }}
        >
          Edit
        </Button>
      </Box>
      <Scrollbar>
        <Table sx={{ minWidth: 700 }}>
          <TableHead sx={{ visibility: enableBulkActions ? 'collapse' : 'visible' }}>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedAllUsers}
                  indeterminate={selectedSomeUsers}
                  onChange={handleSelectAllUsers}
                />
              </TableCell>
              <TableCell>
                Full Name
              </TableCell>
              <TableCell>
                Role
              </TableCell>
              
              <TableCell align="right">
                Options
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => {
              const isUserSelected = selectedUsers.includes(user.id);

              return (
                <TableRow
                  hover
                  key={user.id}
                  selected={isUserSelected}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isUserSelected}
                      onChange={(event) => handleSelectOneUser(event, user.id)}
                      value={isUserSelected}
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
                        src={user.avatar}
                        sx={{
                          height: 42,
                          width: 42
                        }}
                      >
                        {getInitials(`${user.firstName} ${user.lastName}`)}
                      </Avatar>
                      <Box sx={{ ml: 1 }}>
                        <NextLink
                          href={`/admin-dashboard/users/${user.id}`}
                          passHref
                        >
                          <Link
                            color="inherit"
                            variant="subtitle2"
                          >
                            {`${user.firstName} ${user.lastName}`}
                          </Link>
                        </NextLink>
                        <Typography
                          color="textSecondary"
                          variant="body2"
                        >
                          {user.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {
                      user.role
                    }
                  </TableCell>
                  
                  <TableCell align="right">
                    <NextLink
                      href={`/admin-dashboard/users/${user.id}/edit`}
                      passHref
                    >
                      <IconButton component="a">
                        <PencilAltIcon fontSize="small" />
                      </IconButton>
                    </NextLink>
                    <NextLink
                      href={`/admin-dashboard/users/${user.id}`}
                      passHref
                    >
                      <IconButton component="a">
                        <ArrowRightIcon fontSize="small" />
                      </IconButton>
                    </NextLink>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Scrollbar>
      <TablePagination
        component="div"
        count={usersCount}
        onPageChange={onPageChange}
        onRowsPerPageChange={onLimitChange}
        page={page}
        rowsPerPage={limit}
        rowsPerPageOptions={[10, 25, 50]}
      />
    </div>
  );
};

UsersListTable.propTypes = {
  users: PropTypes.array.isRequired,
  usersCount: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onLimitChange: PropTypes.func,
  page: PropTypes.number.isRequired,
  limit: PropTypes.number.isRequired
};
