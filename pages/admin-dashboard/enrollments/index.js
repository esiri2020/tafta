'use client';

import {useState, useCallback, useEffect} from 'react';
import {useRouter} from 'next/router';
import {toast} from 'sonner';
import {Button} from '@/components/ui/button';
import {Card} from '@/components/ui/card';
import {Container} from '@/components/ui/container';
import {EnrollmentListFilters} from '@/components/dashboard/enrollments/enrollments-list-filters';
import {EnrollmentListTable} from '@/components/dashboard/enrollments/enrollments-list-table';
import {EnrollmentSummary} from '@/components/dashboard/enrollments/enrollment-summary';
import {DashboardHeader} from '@/components/dashboard/dashboard-header';
import {RefreshCcw} from 'lucide-react';
import {useGetEnrollmentsQuery} from '@/services/api';
import {LoadingSpinner} from '@/components/ui/loading-spinner';
import {DashboardLayout} from '../../../components/dashboard/dashboard-layout';
import {useAppSelector} from '../../../hooks/rtkHook';
import {selectCohort} from '../../../services/cohortSlice';
import { Progress } from "@/components/ui/progress"

export default function EnrollmentsPage() {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [course, setCourse] = useState([]);
  const [status, setStatus] = useState('');
  const [cohort, setCohort] = useState('');
  const [gender, setGender] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({from: null, to: null});
  const [rehydrationProgress, setRehydrationProgress] = useState(0);
  const [rehydrationStats, setRehydrationStats] = useState(null);
  const [isRehydrating, setIsRehydrating] = useState(false);

  // Get the selected cohort from Redux state
  const selectedCohort = useAppSelector(state => selectCohort(state));

  // Update the cohort filter when the selected cohort changes
  useEffect(() => {
    // Set cohort to the ID if a cohort is selected, or empty string if showing all cohorts
    setCohort(selectedCohort?.id || '');
  }, [selectedCohort]);

  // Prepare query parameters, ensuring we don't send undefined values
  const queryParams = {
    page,
    limit: rowsPerPage,
    course: course.length > 0 ? course : undefined,
    status: status || undefined,
    cohort: cohort || undefined,
    gender: gender || undefined,
    search: searchQuery || undefined,
    dateFrom: dateRange.from
      ? new Date(dateRange.from).toISOString()
      : undefined,
    dateTo: dateRange.to ? new Date(dateRange.to).toISOString() : undefined,
  };

  // Clean undefined values from query params
  Object.keys(queryParams).forEach(
    key => queryParams[key] === undefined && delete queryParams[key],
  );

  const {data, error, isLoading, refetch} = useGetEnrollmentsQuery(queryParams);

  const handleFiltersChange = useCallback(filters => {
    // Handle course filter (array)
    setCourse(filters.course && filters.course.length ? filters.course : []);

    // Handle string filters with empty string fallback
    setStatus(filters.status || '');
    // Don't set the cohort here, as it's managed by the sidebar cohort selector
    setGender(filters.gender || '');
    setSearchQuery(filters.search || '');

    // Handle date range
    setDateRange(filters.dateRange || {from: null, to: null});

    // Reset to first page when filters change
    setPage(0);
  }, []);

  const handlePageChange = newPage => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = newRowsPerPage => {
    setRowsPerPage(newRowsPerPage);
    setPage(0); // Reset to first page when changing rows per page
  };

  const rehydrate = async () => {
    setIsRehydrating(true);
    setRehydrationProgress(0);
    setRehydrationStats(null);

    try {
      const response = await fetch('/api/rehydrate');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        try {
          const data = JSON.parse(chunk);
          if (data.progress) {
            setRehydrationProgress(data.progress);
          }
          if (data.stats) {
            setRehydrationStats(data.stats);
          }
        } catch (e) {
          console.error('Error parsing chunk:', e);
        }
      }

      toast.success('Enrollments updated successfully');
    } catch (error) {
      toast.error('Failed to update enrollments');
      console.error('Rehydration error:', error);
    } finally {
      setIsRehydrating(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  if (error) {
    if (error.status === 401) {
      router.push(`/api/auth/signin?callbackUrl=%2Fdashboard`);
      return null;
    }
    return (
      <Container>
        <div className='py-10 text-center'>
          <h2 className='text-xl font-semibold text-destructive'>
            Error loading enrollments
          </h2>
          <p className='mt-2 text-muted-foreground'>
            {error.data?.message || 'Please try again later'}
          </p>
          <Button onClick={() => refetch()} className='mt-4'>
            Retry
          </Button>
        </div>
      </Container>
    );
  }

  if (!data)
    return (
      <Container>
        <div className='py-10 text-center'>
          <h2 className='text-xl font-semibold'>No Data Available</h2>
          <p className='mt-2 text-muted-foreground'>
            There are no enrollments to display
          </p>
        </div>
      </Container>
    );

  const {enrollments = [], count = 0, femaleCount = 0, maleCount = 0, activeCount = 0, completedCount = 0, expiredCount = 0, pendingCount = 0} = data;

  // Safe enrollment filtering with null checks
  const safeEnrollments = enrollments || [];

  return (
    <Container>
      <DashboardHeader
        title='Enrollments'
        description={
          selectedCohort
            ? `Enrollments for ${selectedCohort.name}`
            : 'Enrollments across all cohorts'
        }
        actions={
          <div className="flex items-center gap-4">
            {isRehydrating && (
              <div className="w-64">
                <Progress value={rehydrationProgress} className="mb-2" />
                <p className="text-sm text-muted-foreground">
                  Updating enrollments... {rehydrationProgress}%
                </p>
                {rehydrationStats && (
                  <div className="text-xs text-muted-foreground mt-1">
                    <p>Processed: {rehydrationStats.processed}</p>
                    <p>Skipped: {rehydrationStats.skipped}</p>
                    <p>Role Mismatch: {rehydrationStats.roleMismatch}</p>
                    <p>No Cohort: {rehydrationStats.noCohort}</p>
                  </div>
                )}
              </div>
            )}
            <Button 
              onClick={rehydrate} 
              disabled={isRehydrating}
            >
              {isRehydrating ? 'Updating...' : 'Update Enrollments'}
            </Button>
          </div>
        }
      />

      <EnrollmentSummary
        count={count}
        femaleCount={femaleCount}
        maleCount={maleCount}
        activeCount={activeCount}
        completedCount={completedCount}
        expiredCount={expiredCount}
        pendingCount={pendingCount}
      />

      <Card className='mt-6'>
        <EnrollmentListFilters onChange={handleFiltersChange} />
        <EnrollmentListTable
          enrollments={safeEnrollments}
          enrollmentsCount={count}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </Card>
    </Container>
  );
}

EnrollmentsPage.getLayout = page => <DashboardLayout>{page}</DashboardLayout>;
