import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Typography,
  Avatar,
  LinearProgress,
  Button,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useGetMobilizerByIdQuery } from '@/services/api';
import type { Mobilizer, MobilizerReferral } from '@/types/mobilizer';
import { format } from 'date-fns';

interface ReferralsListProps {
  mobilizer: Mobilizer;
  onViewReferral: (referral: MobilizerReferral) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'active':
      return 'primary';
    case 'pending':
      return 'warning';
    default:
      return 'default';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircleIcon fontSize="small" />;
    case 'active':
      return <SchoolIcon fontSize="small" />;
    case 'pending':
      return <PendingIcon fontSize="small" />;
    default:
      return <PendingIcon fontSize="small" />;
  }
};

export const ReferralsList: React.FC<ReferralsListProps> = ({ mobilizer, onViewReferral }) => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data, isLoading, error } = useGetMobilizerByIdQuery(mobilizer.id);

  const referrals = data?.referrals || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 10);

  // Filter referrals by search term
  const filteredReferrals = referrals.filter((referral: any) =>
    referral.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    referral.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleStatusFilterChange = (event: any) => {
    setStatusFilter(event.target.value);
    setPage(1); // Reset to first page when filter changes
  };

  if (isLoading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Typography color="error">
            Error loading referrals. Please try again.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      {/* Filters and Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              label="Search referrals"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              sx={{ minWidth: 250 }}
            />

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                label="Status Filter"
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ ml: 'auto' }}>
              <Typography variant="body2" color="text.secondary">
                Total Referrals: {total}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Referrals Table */}
      <Card>
        <CardHeader title="My Referrals" />
        <CardContent>
          {filteredReferrals.length > 0 ? (
            <>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Student</TableCell>
                      <TableCell>Course</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Progress</TableCell>
                      <TableCell>Last Activity</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredReferrals.map((referral: any) => (
                      <TableRow key={referral.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              {referral.fullName.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {referral.fullName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {referral.email}
                              </Typography>
                              {referral.profile.phoneNumber && (
                                <Typography variant="caption" display="block" color="text.secondary">
                                  {referral.profile.phoneNumber}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {referral.courseName || 'Not enrolled'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(referral.enrollmentStatus || 'pending')}
                            label={referral.enrollmentStatus?.charAt(0).toUpperCase() + (referral.enrollmentStatus?.slice(1) || 'pending')}
                            color={getStatusColor(referral.enrollmentStatus || 'pending')}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {referral.completionPercentage !== undefined ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={referral.completionPercentage}
                                sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
                              />
                              <Typography variant="body2" sx={{ minWidth: 35 }}>
                                {Math.round(referral.completionPercentage)}%
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              N/A
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {referral.lastActivity
                              ? format(new Date(referral.lastActivity), 'MMM dd, yyyy')
                              : 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => onViewReferral(referral)}
                              color="primary"
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
            </>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No referrals found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm || statusFilter
                  ? 'Try adjusting your search criteria or filters'
                  : 'You haven\'t referred any students yet'}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

