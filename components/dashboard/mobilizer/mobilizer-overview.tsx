import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
} from '@mui/material';
import {
  People as PeopleIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useGetMobilizerByIdQuery } from '@/services/api';
import type { Mobilizer } from '@/types/mobilizer';

interface MobilizerOverviewProps {
  mobilizer: Mobilizer;
}

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}> = ({ title, value, icon, color, subtitle }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar sx={{ bgcolor: color, mr: 2 }}>
          {icon}
        </Avatar>
        <Box>
          <Typography variant="h4" component="div" fontWeight="bold">
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </Box>
      </Box>
      {subtitle && (
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

export const MobilizerOverview: React.FC<MobilizerOverviewProps> = ({ mobilizer }) => {
  const { data: statsData, isLoading, error } = useGetMobilizerByIdQuery(mobilizer.id);

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
            Error loading mobilizer statistics. Please try again.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const stats = statsData?.stats;

  return (
    <Box>
      {/* Welcome Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
              <PersonIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" component="h1">
                Welcome back, {mobilizer.fullName}!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Mobilizer Code: {mobilizer.code}
                {mobilizer.organization && ` • ${mobilizer.organization}`}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Referrals"
            value={stats?.totalReferrals || 0}
            icon={<PeopleIcon />}
            color="#1976d2"
            subtitle="Students referred"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Referrals"
            value={stats?.activeReferrals || 0}
            icon={<SchoolIcon />}
            color="#2e7d32"
            subtitle="Currently enrolled"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Completed"
            value={stats?.completedReferrals || 0}
            icon={<CheckCircleIcon />}
            color="#ed6c02"
            subtitle="Course completed"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Completion Rate"
            value={`${stats?.completionRate || 0}%`}
            icon={<TrendingUpIcon />}
            color="#9c27b0"
            subtitle="Success rate"
          />
        </Grid>
      </Grid>

      {/* Performance Metrics */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Course Performance" />
            <CardContent>
              {stats?.referralsByCourse && stats.referralsByCourse.length > 0 ? (
                <List>
                  {stats.referralsByCourse.map((course: any, index: number) => (
                    <React.Fragment key={course.courseName}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <SchoolIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={course.courseName}
                          secondary={`${course.count} students`}
                        />
                        <Chip
                          label={`${Math.round((course.count / (stats?.totalReferrals || 1)) * 100)}%`}
                          size="small"
                          color="primary"
                        />
                      </ListItem>
                      {index < stats.referralsByCourse.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary" textAlign="center" py={2}>
                  No course data available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Referral Status" />
            <CardContent>
              {stats?.referralsByStatus && stats.referralsByStatus.length > 0 ? (
                <List>
                  {stats.referralsByStatus.map((status: any, index: number) => (
                    <React.Fragment key={status.status}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              bgcolor:
                                status.status === 'completed'
                                  ? 'success.main'
                                  : status.status === 'active'
                                  ? 'primary.main'
                                  : 'warning.main',
                            }}
                          >
                            {status.status === 'completed' ? (
                              <CheckCircleIcon />
                            ) : status.status === 'active' ? (
                              <SchoolIcon />
                            ) : (
                              <PeopleIcon />
                            )}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={status.status.charAt(0).toUpperCase() + status.status.slice(1)}
                          secondary={`${status.count} students`}
                        />
                        <Chip
                          label={`${Math.round((status.count / (stats?.totalReferrals || 1)) * 100)}%`}
                          size="small"
                          color={
                            status.status === 'completed'
                              ? 'success'
                              : status.status === 'active'
                              ? 'primary'
                              : 'warning'
                          }
                        />
                      </ListItem>
                      {index < stats.referralsByStatus.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary" textAlign="center" py={2}>
                  No status data available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Average Completion */}
      {stats?.averageCompletionPercentage && stats.averageCompletionPercentage > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardHeader title="Overall Progress" />
          <CardContent>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Average Completion Rate
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={stats.averageCompletionPercentage}
                  sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                />
                <Typography variant="h6" fontWeight="bold">
                  {Math.round(stats.averageCompletionPercentage)}%
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

