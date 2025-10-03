import React, { useState, useEffect } from 'react';
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
  Typography,
  IconButton,
  Tooltip,
  Chip,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, People as PeopleIcon } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import { useGetCohortsQuery } from '@/services/api';

interface MobilizerStatsTableProps {
  mobilizers: any[];
  onEdit: (mobilizer: any) => void;
  onDelete: (mobilizerId: string) => void;
  cohortId: string;
  onCohortChange: (cohortId: string) => void;
  isDeleting: boolean;
}

export const MobilizerStatsTable: React.FC<MobilizerStatsTableProps> = ({
  mobilizers,
  onEdit,
  onDelete,
  cohortId,
  onCohortChange,
  isDeleting,
}) => {
  const router = useRouter();
  const [mobilizerStats, setMobilizerStats] = useState<any[]>([]);

  // Get cohorts for filtering
  const { data: cohortsData } = useGetCohortsQuery({
    page: 0,
    limit: 100,
  });

  // Calculate mobilizer statistics based on cohort filter
  useEffect(() => {
    if (mobilizers.length > 0) {
      // In a real implementation, you would fetch this data from an API
      // For now, we'll use the existing mobilizer data
      const stats = mobilizers.map(mobilizer => ({
        ...mobilizer,
        // These would come from API calls with cohort filtering
        totalReferrals: mobilizer.totalReferrals || 0,
        activeReferrals: mobilizer.activeReferrals || 0,
        completedReferrals: mobilizer.completedReferrals || 0,
        completionRate: mobilizer.totalReferrals > 0 
          ? Math.round((mobilizer.completedReferrals / mobilizer.totalReferrals) * 100)
          : 0,
      }));
      setMobilizerStats(stats);
    }
  }, [mobilizers, cohortId]);

  const handleViewApplicants = (mobilizerCode: string) => {
    // Navigate to applicants page with mobilizer filter using referrerName parameter
    const params = new URLSearchParams({
      referrerName: mobilizerCode,
    });
    
    if (cohortId) {
      params.append('cohortId', cohortId);
    }
    
    router.push(`/admin-dashboard/applicants?${params.toString()}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'INACTIVE':
        return 'default';
      case 'SUSPENDED':
        return 'error';
      case 'UNREGISTERED':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Card>
      <CardHeader
        title="Mobilizer Statistics"
        subheader="View and manage mobilizer performance"
        action={
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Cohort Filter</InputLabel>
            <Select
              value={cohortId}
              onChange={(e) => onCohortChange(e.target.value)}
              label="Cohort Filter"
            >
              <MenuItem value="">All Cohorts</MenuItem>
              {cohortsData?.cohorts?.map((cohort: any) => (
                <MenuItem key={cohort.id} value={cohort.id}>
                  {cohort.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        }
      />
      <CardContent>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Mobilizer Code</TableCell>
                <TableCell>Full Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Organization</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Total Referrals</TableCell>
                <TableCell align="center">Active Referrals</TableCell>
                <TableCell align="center">Completed</TableCell>
                <TableCell align="center">Completion Rate</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mobilizerStats.map((mobilizer, index) => (
                <TableRow key={mobilizer.id || `mobilizer-${index}-${mobilizer.code}`} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {mobilizer.code}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color={mobilizer.status === 'PENDING' ? 'text.disabled' : 'text.primary'}>
                      {mobilizer.fullName || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color={mobilizer.status === 'PENDING' ? 'text.disabled' : 'text.secondary'}>
                      {mobilizer.email || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color={mobilizer.status === 'PENDING' ? 'text.disabled' : 'text.secondary'}>
                      {mobilizer.organization || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={mobilizer.status}
                      color={getStatusColor(mobilizer.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Link
                      component="button"
                      variant="body2"
                      onClick={() => handleViewApplicants(mobilizer.code)}
                      sx={{ 
                        textDecoration: 'none',
                        fontWeight: 'bold',
                        color: 'primary.main',
                        '&:hover': {
                          textDecoration: 'underline'
                        }
                      }}
                    >
                      {mobilizer.totalReferrals || 0}
                    </Link>
                  </TableCell>
                  <TableCell align="center">
                    <Link
                      component="button"
                      variant="body2"
                      onClick={() => handleViewApplicants(mobilizer.code)}
                      sx={{ 
                        textDecoration: 'none',
                        fontWeight: 'bold',
                        color: 'primary.main',
                        '&:hover': {
                          textDecoration: 'underline'
                        }
                      }}
                    >
                      {mobilizer.activeReferrals || 0}
                    </Link>
                  </TableCell>
                  <TableCell align="center">
                    <Link
                      component="button"
                      variant="body2"
                      onClick={() => handleViewApplicants(mobilizer.code)}
                      sx={{ 
                        textDecoration: 'none',
                        fontWeight: 'bold',
                        color: 'success.main',
                        '&:hover': {
                          textDecoration: 'underline'
                        }
                      }}
                    >
                      {mobilizer.completedReferrals || 0}
                    </Link>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" color="text.secondary">
                      {mobilizer.completionRate}%
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      {mobilizer.status === 'ACTIVE' && (
                        <>
                          <Tooltip title="Edit Mobilizer">
                            <IconButton
                              size="small"
                              onClick={() => onEdit(mobilizer)}
                              disabled={isDeleting}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Mobilizer">
                            <IconButton
                              size="small"
                              onClick={() => onDelete(mobilizer.id)}
                              disabled={isDeleting}
                              color="error"
                            >
                              {isDeleting ? (
                                <CircularProgress size={16} />
                              ) : (
                                <DeleteIcon fontSize="small" />
                              )}
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      {mobilizer.status === 'PENDING' && (
                        <Typography variant="caption" color="text.disabled">
                          Not registered
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {mobilizerStats.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <PeopleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Mobilizers Found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create your first mobilizer to start tracking referrals.
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
