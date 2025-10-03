import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Box, Container, Typography, Alert, Button, Chip, IconButton, Tooltip } from '@mui/material';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { SplashScreen } from '@/components/splash-screen';
import { useGetAllMobilizerCodesQuery, useDeleteMobilizerMutation } from '@/services/api';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, People as PeopleIcon, Download as DownloadIcon } from '@mui/icons-material';
import dynamic from 'next/dynamic';

// Dynamically import components
const MobilizerStatsTable = dynamic(
  () =>
    import('@/components/dashboard/mobilizer/mobilizer-stats-table').then(
      mod => mod.MobilizerStatsTable,
    ),
  {ssr: false},
);

const MobilizerCreateDialog = dynamic(
  () =>
    import('@/components/dashboard/mobilizer/mobilizer-create-dialog').then(
      mod => mod.MobilizerCreateDialog,
    ),
  {ssr: false},
);

const MobilizerEditDialog = dynamic(
  () =>
    import('@/components/dashboard/mobilizer/mobilizer-edit-dialog').then(
      mod => mod.MobilizerEditDialog,
    ),
  {ssr: false},
);

const AdminMobilizerManagement = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedMobilizer, setSelectedMobilizer] = useState<any>(null);
  const [cohortId, setCohortId] = useState<string>('');

  const { data: mobilizersData, isLoading, error, refetch } = useGetAllMobilizerCodesQuery({
    cohortId: cohortId || undefined,
  });

  const [deleteMobilizer, { isLoading: isDeleting }] = useDeleteMobilizerMutation();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if ((session as any)?.userData?.role !== 'SUPERADMIN') {
      router.push('/admin-dashboard');
    }
  }, [session, router]);

  const handleCreateMobilizer = () => {
    setCreateDialogOpen(true);
  };

  const handleEditMobilizer = (mobilizer: any) => {
    setSelectedMobilizer(mobilizer);
    setEditDialogOpen(true);
  };

  const handleDeleteMobilizer = async (mobilizerId: string) => {
    if (window.confirm('Are you sure you want to delete this mobilizer? This action cannot be undone.')) {
      try {
        await deleteMobilizer(mobilizerId).unwrap();
        refetch();
      } catch (error) {
        console.error('Error deleting mobilizer:', error);
      }
    }
  };

  const handleExportMobilizers = () => {
    if (!mobilizersData?.mobilizers) return;

    const exportData = mobilizersData.mobilizers.map(mobilizer => ({
      'Mobilizer Code': mobilizer.code,
      'Status': mobilizer.status,
      'Full Name': mobilizer.fullName || '',
      'Email': mobilizer.email || '',
      'Phone Number': mobilizer.phoneNumber || '',
      'Organization': mobilizer.organization || '',
      'Total Referrals': mobilizer.totalReferrals,
      'Active Referrals': mobilizer.activeReferrals,
      'Completed Referrals': mobilizer.completedReferrals,
      'Completion Rate (%)': mobilizer.completionRate,
      'Created At': mobilizer.createdAt ? new Date(mobilizer.createdAt).toLocaleDateString() : '',
      'Updated At': mobilizer.updatedAt ? new Date(mobilizer.updatedAt).toLocaleDateString() : '',
    }));

    // Create CSV content
    const headers = Object.keys(exportData[0]);
    const csvContent = [
      headers.join(','),
      ...exportData.map(row => 
        headers.map(header => {
          const value = (row as any)[header];
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `mobilizers-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDialogClose = () => {
    setCreateDialogOpen(false);
    setEditDialogOpen(false);
    setSelectedMobilizer(null);
    refetch();
  };

  if (status === 'loading' || isLoading) {
    return <SplashScreen />;
  }

  if (!(session as any)?.userData || (session as any).userData.role !== 'SUPERADMIN') {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error">
          Access denied. This page is only available for super administrators.
        </Alert>
      </Container>
    );
  }

  const mobilizers = mobilizersData?.mobilizers || [];

  return (
    <>
      <Head>
        <title>Mobilizer Management - Admin Dashboard</title>
      </Head>
      <DashboardLayout>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            py: 8,
          }}
        >
          <Container maxWidth={false}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Box>
                <Typography variant="h4" component="h1" gutterBottom>
                  Mobilizer Management
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Manage mobilizers and track their referral statistics
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleExportMobilizers}
                  disabled={!mobilizersData?.mobilizers?.length}
                >
                  Export CSV
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreateMobilizer}
                  sx={{ height: 'fit-content' }}
                >
                  Create Mobilizer
                </Button>
              </Box>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                Failed to load mobilizers. Please try again.
              </Alert>
            )}

            <Box sx={{ mb: 3 }}>
              <MobilizerStatsTable 
                mobilizers={mobilizers}
                onEdit={handleEditMobilizer}
                onDelete={handleDeleteMobilizer}
                cohortId={cohortId}
                onCohortChange={setCohortId}
                isDeleting={isDeleting}
              />
            </Box>
          </Container>
        </Box>
      </DashboardLayout>

      {/* Dialogs */}
      <MobilizerCreateDialog
        open={createDialogOpen}
        onClose={handleDialogClose}
      />

      <MobilizerEditDialog
        open={editDialogOpen}
        onClose={handleDialogClose}
        mobilizer={selectedMobilizer}
      />
    </>
  );
};

export default AdminMobilizerManagement;
