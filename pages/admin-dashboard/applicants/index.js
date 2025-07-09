import React, {useState, useEffect, useRef} from 'react';
import Link from 'next/link';
import Head from 'next/head';
import {
  ArrowUpDown,
  ChevronDown,
  Download,
  Filter,
  Plus,
  Search,
  UserPlus,
  Bell,
  Loader2,
} from 'lucide-react';
import {nigeria_states, LGAs} from '@/data/form-options';

import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader} from '@/components/ui/card';
import {Checkbox} from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {Input} from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {Badge} from '@/components/ui/badge';
import {Avatar, AvatarFallback} from '@/components/ui/avatar';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {Label} from '@/components/ui/label';
import {Separator} from '@/components/ui/separator';
import {DashboardLayout} from '@/components/dashboard/dashboard-layout';
import {useAppSelector} from '../../../hooks/rtkHook';
import {selectCohort} from '../../../services/cohortSlice';
import {
  useGetApplicantsQuery,
  useGetNotificationsQuery,
} from '../../../services/api';
import {NotificationDialog} from '../../../components/dashboard/notifications/notification-dialog';
import {CSVDownload, CSVLink} from 'react-csv';

// Mock delete mutation
const useDeleteApplicantsMutation = () => {
  return [
    ids => {
      console.log('Deleting applicants with IDs:', ids);
      return Promise.resolve({data: {success: true}});
    },
    {isLoading: false},
  ];
};

// Mock approve mutation
const useApproveApplicantsMutation = () => {
  return [
    ids => {
      console.log('Approving applicants with IDs:', ids);
      return Promise.resolve({data: {success: true}});
    },
    {isLoading: false},
  ];
};

// Mock auto enrollment mutation
const useAutoEnrollmentMutation = () => {
  return [
    params => {
      console.log('Auto enrolling applicants:', params);
      return Promise.resolve({data: {success: true}});
    },
    {isLoading: false},
  ];
};

// Component for displaying filtered out applicants
const FilteredOutApplicantsCard = ({
  filteredOutCount,
  filteredOutSample,
  isExpanded,
  onToggleExpand,
}) => {
  if (!filteredOutCount || filteredOutCount === 0) return null;

  return (
    <Card className='mt-6'>
      <CardHeader className='pb-2'>
        <div className='flex justify-between items-center'>
          <div>
            <h3 className='text-lg font-medium'>Filtered Out Applicants</h3>
            <p className='text-sm text-muted-foreground'>
              {isExpanded
                ? `Showing ${
                    filteredOutSample?.length || 0
                  } of ${filteredOutCount} filtered out applicants`
                : `${filteredOutCount} applicants are filtered out by your current criteria`}
            </p>
          </div>
          <Button variant='ghost' size='sm' onClick={onToggleExpand}>
            {isExpanded ? 'Hide' : 'Show Preview'}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && filteredOutSample?.length > 0 && (
        <CardContent>
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead className='hidden md:table-cell'>
                    Profile Details
                  </TableHead>
                  <TableHead>Application Status</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOutSample.map(applicant => (
                  <TableRow key={applicant.id}>
                    <TableCell>
                      <div className='flex items-center gap-3'>
                        <Avatar>
                          <AvatarFallback>
                            {applicant.firstName &&
                            typeof applicant.firstName === 'string'
                              ? applicant.firstName.charAt(0)
                              : ''}
                            {applicant.lastName &&
                            typeof applicant.lastName === 'string'
                              ? applicant.lastName.charAt(0)
                              : ''}
                          </AvatarFallback>
                        </Avatar>
                        <div className='flex flex-col'>
                          <span className='font-medium'>
                            {applicant.firstName} {applicant.lastName}
                          </span>
                          <span className='text-sm text-muted-foreground'>
                            {applicant.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className='hidden md:table-cell'>
                      {applicant.profile ? (
                        <div className='text-sm space-y-1'>
                          <div className='flex gap-2'>
                            <span className='font-medium'>Gender:</span>
                            <span>{applicant.profile.gender || 'N/A'}</span>
                          </div>
                          <div className='flex gap-2'>
                            <span className='font-medium'>Age:</span>
                            <span>{applicant.profile.ageRange || 'N/A'}</span>
                          </div>
                          <div className='flex gap-2'>
                            <span className='font-medium'>State:</span>
                            <span>
                              {applicant.profile.stateOfResidence || 'N/A'}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className='text-muted-foreground'>
                          No profile data
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {applicant.profile ? (
                        applicant.userCohort?.[0]?.enrollments?.[0]
                          ?.enrolled ? (
                          <Badge variant='secondary'>Approved</Badge>
                        ) : (
                          <Badge variant='outline' className='bg-yellow-100'>
                            Completed
                          </Badge>
                        )
                      ) : (
                        <Badge variant='outline'>Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell className='text-right'>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button variant='ghost' size='sm' type='button'>
                            <span className='sr-only'>Open menu</span>
                            <ChevronDown className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Link
                              href={`/admin-dashboard/applicants/${applicant.id}`}>
                              <a>View Details</a>
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

function ApplicantList() {
  // State for filters
  const [filters, setFilters] = useState({
    gender: [],
    status: [],
    ageRange: [],
    educationLevel: [],
    employmentStatus: [],
    residencyStatus: [],
    communityArea: [],
    talpParticipation: null,
    type: [],
    location: [], // State of residence
    lga: [], // Local Government Area
  });

  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [cohortId, setCohortId] = useState(null);
  const [selectedApplicants, setSelectedApplicants] = useState([]);
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  const [showFilteredOut, setShowFilteredOut] = useState(false);

  // Get the selected cohort from redux state
  const selectedCohort = useAppSelector(selectCohort);

  // Update cohortId when the selected cohort changes
  useEffect(() => {
    if (selectedCohort) {
      setCohortId(selectedCohort.id);
      console.log('Cohort changed to:', selectedCohort.name, selectedCohort.id);
    } else {
      setCohortId(null);
      console.log('Cohort reset to all cohorts');
    }
    // Reset page when cohort changes
    setPage(0);
    // Reset selected applicants when cohort changes
    setSelectedApplicants([]);
  }, [selectedCohort]);

  // Get unread notifications count
  const {
    data: notificationsData,
    error: notificationsError,
    isLoading: notificationsLoading,
  } = useGetNotificationsQuery({
    page: 0,
    limit: 1,
    isRead: false, // Only unread notifications
  });

  // Log notifications errors for debugging
  useEffect(() => {
    if (notificationsError) {
      console.error('Error fetching notifications:', notificationsError);
    }
  }, [notificationsError]);

  const unreadNotificationsCount = notificationsData?.count || 0;

  // Transform the complex filters object into the format expected by the API
  // and stringify it so it's properly sent in the URL
  const filterObject = {
    gender: filters.gender.length > 0 ? filters.gender : undefined,
    status: filters.status.length > 0 ? filters.status : undefined,
    ageRange: filters.ageRange.length > 0 ? filters.ageRange : undefined,
    educationLevel:
      filters.educationLevel.length > 0 ? filters.educationLevel : undefined,
    employmentStatus:
      filters.employmentStatus.length > 0
        ? filters.employmentStatus
        : undefined,
    residencyStatus:
      filters.residencyStatus.length > 0 ? filters.residencyStatus : undefined,
    communityArea:
      filters.communityArea.length > 0 ? filters.communityArea : undefined,
    talpParticipation:
      filters.talpParticipation !== null
        ? filters.talpParticipation
        : undefined,
    type: filters.type.length > 0 ? filters.type : undefined,
    location: filters.location.length > 0 ? filters.location : undefined,
    lga: filters.lga.length > 0 ? filters.lga : undefined,
  };

  // Remove undefined values to avoid sending empty object
  const cleanFilterObject = Object.fromEntries(
    Object.entries(filterObject).filter(([_, value]) => value !== undefined)
  );

  // Only stringify if there are actual filters, otherwise send undefined
  const filterParams = Object.keys(cleanFilterObject).length > 0 
    ? JSON.stringify(cleanFilterObject) 
    : undefined;

  // Log the current filter state for debugging
  useEffect(() => {
    console.log('Current filters object:', filters);
    console.log('Stringified filter params for API:', filterParams);
    // Try parsing it back to verify it's valid JSON (only if filterParams exists)
    if (filterParams) {
      try {
        const parsed = JSON.parse(filterParams);
        console.log('Parsed back from JSON:', parsed);
      } catch (e) {
        console.error('Error parsing JSON:', e);
      }
    } else {
      console.log('No filters applied - filterParams is undefined');
    }
  }, [filters, filterParams]);

  // Get paginated applicants data for display
  const {data, error, isLoading} = useGetApplicantsQuery({
    page,
    limit,
    ...(filterParams && { filter: filterParams }),
    query: searchQuery,
    cohortId,
  });

  // Get all filtered data for export (without pagination)
  const {
    data: exportData,
    isLoading: isExportLoading,
    isFetching: isExportFetching,
  } = useGetApplicantsQuery(
    {
      page: 0,
      limit: 100000, // Very large number to get all records
      ...(filterParams && { filter: filterParams }),
      query: searchQuery,
      cohortId,
      includeAssessment: true, // Add this to request assessment data
    },
    {
      skip: !data, // Only fetch after main data is loaded
    },
  );

  // Determine if export is loading
  const isExporting = isExportLoading || isExportFetching;

  const [deleteApplicants] = useDeleteApplicantsMutation();
  const [approveApplicants] = useApproveApplicantsMutation();
  const [autoEnrollment] = useAutoEnrollmentMutation();

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => {
      const newFilters = {...prev};

      if (Array.isArray(newFilters[filterType])) {
        if (newFilters[filterType].includes(value)) {
          newFilters[filterType] = newFilters[filterType].filter(
            item => item !== value,
          );
        } else {
          newFilters[filterType] = [...newFilters[filterType], value];
        }
      } else {
        newFilters[filterType] = value;
      }

      return newFilters;
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      gender: [],
      status: [],
      ageRange: [],
      educationLevel: [],
      employmentStatus: [],
      residencyStatus: [],
      communityArea: [],
      talpParticipation: null,
      type: [],
      location: [],
      lga: [],
    });
    setSearchQuery('');
  };

  // Handle search
  const handleSearch = e => {
    e.preventDefault();
    const searchInput = e.target.elements.search.value;
    setSearchQuery(searchInput);
  };

  // Handle pagination
  const handlePageChange = newPage => {
    if (
      newPage >= 0 &&
      (newPage * limit < (data?.count || 0) || newPage < page)
    ) {
      setPage(newPage);
    }
  };

  // Handle limit change
  const handleLimitChange = newLimit => {
    const limitNum = Number.parseInt(newLimit);
    setLimit(limitNum);
    // Reset to first page when changing limit to avoid issues
    setPage(0);
  };

  // Handle select all applicants
  const handleSelectAllApplicants = checked => {
    if (checked) {
      setSelectedApplicants(
        data?.applicants.map(applicant => applicant.id) || [],
      );
    } else {
      setSelectedApplicants([]);
    }
  };

  // Handle select one applicant
  const handleSelectOneApplicant = (applicantId, checked) => {
    if (checked) {
      setSelectedApplicants(prev => [...prev, applicantId]);
    } else {
      setSelectedApplicants(prev => prev.filter(id => id !== applicantId));
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (window.confirm('Are you sure you want to delete these applicants?')) {
      try {
        await deleteApplicants({ids: selectedApplicants});
        setSelectedApplicants([]);
        // Refetch data or update local state
      } catch (error) {
        console.error('Error deleting applicants:', error);
      }
    }
  };

  // Handle bulk approve
  const handleBulkApprove = async () => {
    if (
      window.confirm(
        'Are you sure you want to approve and enroll these applicants?',
      )
    ) {
      try {
        await approveApplicants({ids: selectedApplicants});
        setSelectedApplicants([]);
        // Refetch data or update local state
      } catch (error) {
        console.error('Error approving applicants:', error);
      }
    }
  };

  // Handle auto enrollment
  const handleAutoEnrollment = async () => {
    if (
      window.confirm('Are you sure you want to enroll eligible applicants?')
    ) {
      try {
        await autoEnrollment({
          applicants: data?.applicants.map(a => a.id) || [],
        });
        // Refetch data or update local state
      } catch (error) {
        console.error('Error auto-enrolling applicants:', error);
      }
    }
  };

  // Format data for CSV export using exportData instead of data
  const csvData = React.useMemo(() => {
    if (!exportData?.applicants) return [];

    return [
      // Headers - Comprehensive data columns
      [
        // Basic Applicant Information
        'First Name',
        'Last Name',
        'Email',
        'Phone Number',
        'Registration Type',
        'Thinkific User ID',
        'Created At',
        
        // Profile Information
        'Business Name',
        'Gender',
        'Age Range',
        'Education Level',
        'Employment Status',
        'Residency Status',
        'Community Area',
        'TALP Participation',
        'State of Residence',
        'LGA Details',
        'Type of Applicant',
        'Referrer ID',
        'Referrer Name',
        'Referrer Phone',
        'Source of Information',
        
        // Cohort Information
        'Cohort Name',
        'Cohort Start Date',
        'Cohort End Date',
        'Cohort Active Status',
        'Cohort Color',
        'Location Name',
        'Location Seats',
        
        // Enrollment Information
        'Course Name',
        'Course ID',
        'Course Description',
        'Course Active Status',
        'Course Capacity',
        'Enrollment Status',
        'Enrollment Date',
        'Activation Date',
        'Completion Date',
        'Expiry Date',
        'Percentage Completed',
        'Is Free Trial',
        'Is Completed',
        'Is Expired',
        'Started At',
        'Updated At',
        
        // Assessment Information
        'Course of Study',
        'Assessment Enrollment Status',
        'Had Job Before Admission',
        'Assessment Employment Status',
        'Employment Type',
        'Work Time Type',
        'Employed in Creative Sector',
        'Creative Job Nature',
        'Non-Creative Job Info',
        'Years of Experience Creative',
        'Satisfaction Level',
        'Skill Rating',
        'Monthly Income',
        'Has Reliable Income',
        'Earning Meets Needs',
        'Work Is Decent and Good',
        'Job Gives Purpose',
        'Feel Respected at Work',
        'LMS Platform Rating',
        'Tafta Preparation Rating',
        'Preparation Feedback',
        'Quality of Interaction Rating',
        'Training Materials Rating',
        'Topic Sequencing Rating',
        'Facilitators Response Rating',
        'Would Recommend Tafta',
        'Improvement Suggestions',
        'Most Striking Feature',
        'Turn Offs',
        'Practical Class Challenges',
        'Online Class Challenges',
        'Completion Motivation',
        'Assessment Created At',
        'Assessment Updated At',
      ],
      // Data rows
      ...exportData.applicants.map(applicant => {
        const userCohort = applicant.userCohort?.[0];
        const cohort = userCohort?.cohort;
        const location = userCohort?.location;
        const enrollments = userCohort?.enrollments || [];
        const assessment = applicant.assessment;
        
        // Get primary enrollment (first one) or create a default structure
        const primaryEnrollment = enrollments[0] || {};
        
        // Handle multiple enrollments by joining course names
        const allCourseNames = enrollments.map(e => e.course_name).filter(Boolean).join('; ');
        const allCourseIds = enrollments.map(e => e.course_id?.toString()).filter(Boolean).join('; ');
        
        return [
          // Basic Applicant Information
          applicant.firstName || '',
          applicant.lastName || '',
          applicant.email || '',
          applicant.profile?.phoneNumber || '',
          applicant.type || '',
          applicant.thinkific_user_id || '',
          applicant.createdAt ? new Date(applicant.createdAt).toISOString() : '',
          
          // Profile Information
          applicant.profile?.businessName || '',
          applicant.profile?.gender || '',
          applicant.profile?.ageRange || '',
          applicant.profile?.educationLevel || '',
          applicant.profile?.employmentStatus || '',
          applicant.profile?.residencyStatus || '',
          applicant.profile?.communityArea || '',
          applicant.profile?.talpParticipation ? 'Yes' : 'No',
          applicant.profile?.stateOfResidence || '',
          applicant.profile?.LGADetails || '',
          applicant.profile?.type || '',
          applicant.profile?.referrer?.id || '',
          applicant.profile?.referrer?.fullName || '',
          applicant.profile?.referrer?.phoneNumber || '',
          applicant.profile?.source || '',
          
          // Cohort Information
          cohort?.name || '',
          cohort?.start_date ? new Date(cohort.start_date).toISOString() : '',
          cohort?.end_date ? new Date(cohort.end_date).toISOString() : '',
          cohort?.active ? 'Active' : 'Inactive',
          cohort?.color || '',
          location?.name || '',
          location?.seats?.toString() || '',
          
          // Enrollment Information
          allCourseNames || primaryEnrollment?.course_name || '',
          allCourseIds || primaryEnrollment?.course_id?.toString() || '',
          '', // Course description would need to be fetched separately
          '', // Course active status would need to be fetched separately
          '', // Course capacity would need to be fetched separately
          primaryEnrollment?.enrolled ? 'Enrolled' : 'Not Enrolled',
          primaryEnrollment?.created_at ? new Date(primaryEnrollment.created_at).toISOString() : '',
          primaryEnrollment?.activated_at ? new Date(primaryEnrollment.activated_at).toISOString() : '',
          primaryEnrollment?.completed_at ? new Date(primaryEnrollment.completed_at).toISOString() : '',
          primaryEnrollment?.expiry_date ? new Date(primaryEnrollment.expiry_date).toISOString() : '',
          primaryEnrollment?.percentage_completed?.toString() || '',
          primaryEnrollment?.is_free_trial ? 'Yes' : 'No',
          primaryEnrollment?.completed ? 'Yes' : 'No',
          primaryEnrollment?.expired ? 'Yes' : 'No',
          primaryEnrollment?.started_at ? new Date(primaryEnrollment.started_at).toISOString() : '',
          primaryEnrollment?.updated_at ? new Date(primaryEnrollment.updated_at).toISOString() : '',
          
          // Assessment Information
          assessment?.courseOfStudy || '',
          assessment?.enrollmentStatus || '',
          assessment?.hadJobBeforeAdmission ? 'Yes' : 'No',
          assessment?.employmentStatus || '',
          assessment?.employmentType || '',
          assessment?.workTimeType || '',
          assessment?.employedInCreativeSector ? 'Yes' : 'No',
          assessment?.creativeJobNature || '',
          assessment?.nonCreativeJobInfo || '',
          assessment?.yearsOfExperienceCreative || '',
          assessment?.satisfactionLevel || '',
          assessment?.skillRating || '',
          assessment?.monthlyIncome || '',
          assessment?.hasReliableIncome ? 'Yes' : 'No',
          assessment?.earningMeetsNeeds ? 'Yes' : 'No',
          assessment?.workIsDecentAndGood ? 'Yes' : 'No',
          assessment?.jobGivesPurpose ? 'Yes' : 'No',
          assessment?.feelRespectedAtWork ? 'Yes' : 'No',
          assessment?.lmsPlatformRating || '',
          assessment?.taftaPreparationRating || '',
          assessment?.preparationFeedback || '',
          assessment?.qualityOfInteractionRating || '',
          assessment?.trainingMaterialsRating || '',
          assessment?.topicSequencingRating || '',
          assessment?.facilitatorsResponseRating || '',
          assessment?.wouldRecommendTafta ? 'Yes' : 'No',
          assessment?.improvementSuggestions || '',
          assessment?.mostStrikingFeature || '',
          assessment?.turnOffs || '',
          assessment?.practicalClassChallenges || '',
          assessment?.onlineClassChallenges || '',
          assessment?.completionMotivation || '',
          assessment?.createdAt ? new Date(assessment.createdAt).toISOString() : '',
          assessment?.updatedAt ? new Date(assessment.updatedAt).toISOString() : '',
        ];
      }),
    ];
  }, [exportData?.applicants]);

  // Check if all applicants are selected
  const allApplicantsSelected =
    data?.applicants?.length > 0 &&
    selectedApplicants.length === data.applicants.length;

  // Check if some applicants are selected
  const someApplicantsSelected =
    selectedApplicants.length > 0 &&
    selectedApplicants.length < (data?.applicants?.length || 0);

  // Get filtered applicants IDs for notifications
  const getFilteredApplicantIds = () => {
    // Make sure data.applicants exists and is an array
    if (!data || !data.applicants || !Array.isArray(data.applicants)) {
      console.warn('No applicants data available for notifications');
      return [];
    }

    // Extract IDs and ensure they're all valid
    const filteredIds = data.applicants
      .map(applicant => applicant.id)
      .filter(id => !!id); // Filter out any null/undefined IDs

    console.log('Current filtered applicants:', filteredIds);
    console.log('Number of filtered applicants:', filteredIds.length);
    return filteredIds;
  };

  // Handle opening notification dialog
  const handleOpenNotificationDialog = () => {
    const filteredIds = getFilteredApplicantIds();
    console.log(
      'Opening notification dialog with filtered applicants:',
      filteredIds,
    );
    console.log('Number of filtered applicants:', filteredIds.length);
    console.log('Selected applicants:', selectedApplicants);
    setNotificationDialogOpen(true);
  };

  // Handle closing notification dialog
  const handleCloseNotificationDialog = () => {
    setNotificationDialogOpen(false);
  };

  const filteredApplicantIds = getFilteredApplicantIds();

  if (isLoading)
    return (
      <div className='flex items-center justify-center h-screen'>
        Loading...
      </div>
    );
  if (error)
    return <div className='text-red-500'>Error loading applicants</div>;

  return (
    <>
      <Head>
        <title>Applicant List</title>
      </Head>
      {/* Notification Dialog */}
      <NotificationDialog
        open={notificationDialogOpen}
        onClose={handleCloseNotificationDialog}
        selectedApplicantIds={selectedApplicants}
        filteredApplicants={filteredApplicantIds}
        title={
          selectedApplicants.length > 0
            ? 'Send Notification to Selected Applicants'
            : 'Send Notification to Filtered Applicants'
        }
      />
      <div className='container mx-auto py-8 px-4'>
        <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Applicants</h1>
            <p className='text-muted-foreground'>
              Manage and filter applicant profiles
              {selectedCohort && (
                <span className='ml-1 font-medium'>
                  {' '}
                  in cohort:{' '}
                  <span className='text-primary'>{selectedCohort.name}</span>
                </span>
              )}
            </p>
          </div>
          <div className='flex gap-2'>
            <Button variant='outline' onClick={handleOpenNotificationDialog}>
              <Bell className='mr-2 h-4 w-4' />
              {unreadNotificationsCount > 0 && (
                <span className='absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white'>
                  {unreadNotificationsCount > 99
                    ? '99+'
                    : unreadNotificationsCount}
                </span>
              )}
              {data?.applicants?.length > 0
                ? `Send Notifications (${data.applicants.length})`
                : 'Send Notifications'}
            </Button>
            <Button>
              <Link href='/admin-dashboard/applicants/create'>
                <a className='flex items-center'>
                  <UserPlus className='mr-2 h-4 w-4' />
                  Add Applicant
                </a>
              </Link>
            </Button>
            <CSVLink
              data={csvData}
              filename={`applicants-export-${
                new Date().toISOString().split('T')[0]
              }.csv`}
              className={`inline-flex items-center ${
                isExporting ? 'pointer-events-none' : ''
              }`}
              title="Export includes: Applicant details, Profile information, Cohort data, Enrollment details, Assessment responses, and Course information">
              <Button variant='outline' disabled={isExporting}>
                {isExporting ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Preparing Export...
                  </>
                ) : (
                  <>
                    <Download className='mr-2 h-4 w-4' />
                    Export Comprehensive Data ({exportData?.count || 0} records)
                  </>
                )}
              </Button>
            </CSVLink>
          </div>
        </div>

        <Card>
          <CardHeader className='pb-3'>
            <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
              <form
                onSubmit={handleSearch}
                className='flex-1 w-full md:max-w-sm'>
                <div className='relative'>
                  <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                  <Input
                    type='search'
                    name='search'
                    placeholder='Search applicants...'
                    className='pl-8 w-full'
                    defaultValue={searchQuery}
                  />
                  <Button type='submit' className='sr-only'>
                    Search
                  </Button>
                </div>
              </form>

              <div className='flex flex-wrap gap-2 items-center'>
                <Sheet>
                  <SheetTrigger>
                    <Button variant='outline' size='sm' type='button'>
                      <Filter className='mr-2 h-4 w-4' />
                      Filters
                      {Object.values(filters).some(f =>
                        Array.isArray(f) ? f.length > 0 : f !== null,
                      ) && (
                        <Badge variant='secondary' className='ml-2'>
                          {Object.values(filters).reduce(
                            (count, f) =>
                              count +
                              (Array.isArray(f)
                                ? f.length
                                : f !== null
                                ? 1
                                : 0),
                            0,
                          )}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent className='sm:max-w-md'>
                    <SheetHeader>
                      <SheetTitle>Filter Applicants</SheetTitle>
                      <SheetDescription>
                        Apply filters to narrow down the applicant list
                      </SheetDescription>
                    </SheetHeader>
                    <div className='grid gap-6 p-4 overflow-y-auto max-h-[calc(100vh-200px)]'>
                      <div className='space-y-2'>
                        <h3 className='text-sm font-medium'>Gender</h3>
                        <div className='space-y-2'>
                          <div className='flex items-center space-x-2'>
                            <Checkbox
                              id='gender-male'
                              checked={filters.gender.includes('MALE')}
                              onCheckedChange={checked =>
                                handleFilterChange('gender', 'MALE')
                              }
                            />
                            <Label htmlFor='gender-male'>Male</Label>
                          </div>
                          <div className='flex items-center space-x-2'>
                            <Checkbox
                              id='gender-female'
                              checked={filters.gender.includes('FEMALE')}
                              onCheckedChange={checked =>
                                handleFilterChange('gender', 'FEMALE')
                              }
                            />
                            <Label htmlFor='gender-female'>Female</Label>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Filter by type of applicant */}
                      <div className='space-y-2'>
                        <h3 className='text-sm font-medium'>
                          Type of Applicant
                        </h3>
                        <div className='space-y-2'>
                          {['INDIVIDUAL', 'ENTERPRISE'].map(type => (
                            <div
                              key={type}
                              className='flex items-center space-x-2'>
                              <Checkbox
                                id={type}
                                checked={filters.type.includes(type)}
                                onCheckedChange={checked =>
                                  handleFilterChange('type', type)
                                }
                              />
                              <Label htmlFor={type}>{type}</Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />
                      <div className='space-y-2'>
                        <h3 className='text-sm font-medium'>Age Range</h3>
                        <div className='space-y-2'>
                          {[
                            '16 - 20',
                            '21 - 25',
                            '26 - 29',
                            '30 - 34',
                            '35 - 39',
                            '40+',
                          ].map(range => (
                            <div
                              key={range}
                              className='flex items-center space-x-2'>
                              <Checkbox
                                id={`age-${range}`}
                                checked={filters.ageRange.includes(range)}
                                onCheckedChange={checked =>
                                  handleFilterChange('ageRange', range)
                                }
                              />
                              <Label htmlFor={`age-${range}`}>{range}</Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div className='space-y-2'>
                        <h3 className='text-sm font-medium'>Education Level</h3>
                        <div className='space-y-2'>
                          {[
                            {value: 'PRIMARY_SCHOOL', label: 'Primary School'},
                            {
                              value: 'SECONDARY_SCHOOL',
                              label: 'Secondary School',
                            },
                            {value: 'ND_HND', label: 'ND/HND'},
                            {value: 'BSC', label: 'BSc'},
                            {value: 'MSC', label: 'MSc'},
                            {value: 'PHD', label: 'PhD'},
                          ].map(edu => (
                            <div
                              key={edu.value}
                              className='flex items-center space-x-2'>
                              <Checkbox
                                id={`edu-${edu.value}`}
                                checked={filters.educationLevel.includes(
                                  edu.value,
                                )}
                                onCheckedChange={checked =>
                                  handleFilterChange(
                                    'educationLevel',
                                    edu.value,
                                  )
                                }
                              />
                              <Label htmlFor={`edu-${edu.value}`}>
                                {edu.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div className='space-y-2'>
                        <h3 className='text-sm font-medium'>
                          Employment Status
                        </h3>
                        <div className='space-y-2'>
                          {[
                            {value: 'employed', label: 'Employed'},
                            {value: 'self-employed', label: 'Self-employed'},
                            {value: 'student', label: 'Student'},
                            {value: 'unemployed', label: 'Unemployed'},
                          ].map(status => (
                            <div
                              key={status.value}
                              className='flex items-center space-x-2'>
                              <Checkbox
                                id={`emp-${status.value}`}
                                checked={filters.employmentStatus.includes(
                                  status.value,
                                )}
                                onCheckedChange={checked =>
                                  handleFilterChange(
                                    'employmentStatus',
                                    status.value,
                                  )
                                }
                              />
                              <Label htmlFor={`emp-${status.value}`}>
                                {status.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div className='space-y-2'>
                        <h3 className='text-sm font-medium'>
                          Residency Status
                        </h3>
                        <div className='space-y-2'>
                          {[
                            {value: 'resident', label: 'Resident'},
                            {value: 'non-resident', label: 'Non-resident'},
                            {value: 'refugee', label: 'Refugee'},
                            {value: 'migrant-worker', label: 'Migrant Worker'},
                          ].map(status => (
                            <div
                              key={status.value}
                              className='flex items-center space-x-2'>
                              <Checkbox
                                id={`res-${status.value}`}
                                checked={filters.residencyStatus.includes(
                                  status.value,
                                )}
                                onCheckedChange={checked =>
                                  handleFilterChange(
                                    'residencyStatus',
                                    status.value,
                                  )
                                }
                              />
                              <Label htmlFor={`res-${status.value}`}>
                                {status.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div className='space-y-2'>
                        <h3 className='text-sm font-medium'>Community Area</h3>
                        <div className='space-y-2'>
                          {[
                            {value: 'URBAN', label: 'Urban'},
                            {value: 'RURAL', label: 'Rural'},
                          ].map(area => (
                            <div
                              key={area.value}
                              className='flex items-center space-x-2'>
                              <Checkbox
                                id={`area-${area.value}`}
                                checked={filters.communityArea.includes(
                                  area.value,
                                )}
                                onCheckedChange={checked =>
                                  handleFilterChange(
                                    'communityArea',
                                    area.value,
                                  )
                                }
                              />
                              <Label htmlFor={`area-${area.value}`}>
                                {area.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div className='space-y-2'>
                        <h3 className='text-sm font-medium'>
                          TALP Participation
                        </h3>
                        <div className='space-y-2'>
                          <div className='flex items-center space-x-2'>
                            <Checkbox
                              id='talp-yes'
                              checked={filters.talpParticipation === true}
                              onCheckedChange={checked =>
                                handleFilterChange(
                                  'talpParticipation',
                                  checked ? true : null,
                                )
                              }
                            />
                            <Label htmlFor='talp-yes'>Yes</Label>
                          </div>
                          <div className='flex items-center space-x-2'>
                            <Checkbox
                              id='talp-no'
                              checked={filters.talpParticipation === false}
                              onCheckedChange={checked =>
                                handleFilterChange(
                                  'talpParticipation',
                                  checked ? false : null,
                                )
                              }
                            />
                            <Label htmlFor='talp-no'>No</Label>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className='space-y-2'>
                        <h3 className='text-sm font-medium'>
                          Application Status
                        </h3>
                        <div className='space-y-2'>
                          <div className='flex items-center space-x-2'>
                            <Checkbox
                              id='status-approved'
                              checked={filters.status.includes('approved')}
                              onCheckedChange={checked =>
                                handleFilterChange('status', 'approved')
                              }
                            />
                            <Label htmlFor='status-approved'>Approved</Label>
                          </div>
                          <div className='flex items-center space-x-2'>
                            <Checkbox
                              id='status-pending'
                              checked={filters.status.includes('pending')}
                              onCheckedChange={checked =>
                                handleFilterChange('status', 'pending')
                              }
                            />
                            <Label htmlFor='status-pending'>Pending</Label>
                          </div>
                          <div className='flex items-center space-x-2'>
                            <Checkbox
                              id='status-completed'
                              checked={filters.status.includes('completed')}
                              onCheckedChange={checked =>
                                handleFilterChange('status', 'completed')
                              }
                            />
                            <Label htmlFor='status-completed'>Completed</Label>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className='space-y-2'>
                        <h3 className='text-sm font-medium'>
                          Location (State)
                        </h3>
                        <div className='space-y-2'>
                          {nigeria_states.map(state => (
                            <div
                              key={state}
                              className='flex items-center space-x-2'>
                              <Checkbox
                                id={`location-${state}`}
                                checked={filters.location.includes(state)}
                                onCheckedChange={checked =>
                                  handleFilterChange('location', state)
                                }
                              />
                              <Label htmlFor={`location-${state}`}>
                                {state}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div className='space-y-2'>
                        <h3 className='text-sm font-medium'>LGA</h3>
                        <div className='space-y-2 max-h-[200px] overflow-y-auto'>
                          {filters.location.length > 0 ? (
                            filters.location.map(state => (
                              <div key={state}>
                                <div className='font-semibold text-xs mt-2 mb-1'>
                                  {state}
                                </div>
                                {Object.values(LGAs[state] || {})
                                  .flat()
                                  .map(lga => (
                                    <div
                                      key={lga}
                                      className='flex items-center space-x-2 ml-2 mb-2'>
                                      <Checkbox
                                        id={`lga-${lga}`}
                                        checked={filters.lga.includes(lga)}
                                        onCheckedChange={checked =>
                                          handleFilterChange('lga', lga)
                                        }
                                      />
                                      <Label htmlFor={`lga-${lga}`}>
                                        {lga}
                                      </Label>
                                    </div>
                                  ))}
                              </div>
                            ))
                          ) : (
                            <div className='text-sm text-muted-foreground italic'>
                              Select a state first to view LGAs
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <SheetFooter>
                      <Button
                        variant='outline'
                        onClick={clearFilters}
                        type='button'>
                        Clear Filters
                      </Button>
                      <SheetClose>
                        <Button type='button'>Apply Filters</Button>
                      </SheetClose>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>

                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button variant='outline' size='sm' type='button'>
                      <ArrowUpDown className='mr-2 h-4 w-4' />
                      Sort
                      <ChevronDown className='ml-2 h-4 w-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end' className='w-[200px]'>
                    <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Name (A-Z)</DropdownMenuItem>
                    <DropdownMenuItem>Name (Z-A)</DropdownMenuItem>
                    <DropdownMenuItem>Date (Newest)</DropdownMenuItem>
                    <DropdownMenuItem>Date (Oldest)</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Select
                  value={limit.toString()}
                  onValueChange={handleLimitChange}>
                  <SelectTrigger className='w-[100px]'>
                    <SelectValue placeholder='10 per page' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Rows per page</SelectLabel>
                      <SelectItem value='10'>10</SelectItem>
                      <SelectItem value='25'>25</SelectItem>
                      <SelectItem value='50'>50</SelectItem>
                      <SelectItem value='100'>100</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {selectedApplicants.length > 0 && (
              <div className='bg-muted p-2 mb-4 rounded-md flex items-center'>
                <Checkbox
                  checked={allApplicantsSelected}
                  indeterminate={someApplicantsSelected}
                  onCheckedChange={handleSelectAllApplicants}
                  className='mr-2'
                />
                <span className='text-sm font-medium mr-4'>
                  {selectedApplicants.length} selected
                </span>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleBulkDelete}
                  className='mr-2'>
                  Delete
                </Button>
                {/* <Button size='sm' onClick={handleBulkApprove}>
                  Approve and Enroll
                </Button> */}
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleOpenNotificationDialog}
                  className='ml-2'>
                  <Bell className='mr-2 h-4 w-4' />
                  Send Notification
                </Button>
              </div>
            )}

            <div className='rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-[40px]'>
                      <Checkbox
                        checked={allApplicantsSelected}
                        indeterminate={someApplicantsSelected}
                        onCheckedChange={handleSelectAllApplicants}
                      />
                    </TableHead>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Business Name</TableHead>
                    <TableHead className='hidden md:table-cell'>
                      Profile Details
                    </TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Application Status</TableHead>
                    <TableHead>Enrollment Status</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.applicants.map(applicant => (
                    <TableRow key={applicant.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedApplicants.includes(applicant.id)}
                          onCheckedChange={checked =>
                            handleSelectOneApplicant(applicant.id, checked)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-3'>
                          <Avatar>
                            <AvatarFallback>
                              {applicant.firstName &&
                              typeof applicant.firstName === 'string'
                                ? applicant.firstName.charAt(0)
                                : ''}
                              {applicant.lastName &&
                              typeof applicant.lastName === 'string'
                                ? applicant.lastName.charAt(0)
                                : ''}
                            </AvatarFallback>
                          </Avatar>
                          <div className='flex flex-col'>
                            <span className='font-medium'>
                              {applicant.firstName} {applicant.lastName}
                            </span>
                            <span className='text-sm text-muted-foreground'>
                              {applicant.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {applicant.profile?.businessName || 'Not a business'}
                      </TableCell>
                      <TableCell className='hidden md:table-cell'>
                        {applicant.profile ? (
                          <div className='text-sm space-y-1'>
                            <div className='flex gap-2'>
                              <span className='font-medium'>Gender:</span>
                              <span>{applicant.profile.gender || 'N/A'}</span>
                            </div>
                            <div className='flex gap-2'>
                              <span className='font-medium'>Age:</span>
                              <span>{applicant.profile.ageRange || 'N/A'}</span>
                            </div>
                            <div className='flex gap-2'>
                              <span className='font-medium'>Education:</span>
                              <span>
                                {applicant.profile.educationLevel || 'N/A'}
                              </span>
                            </div>
                            <div className='flex gap-2'>
                              <span className='font-medium'>Employment:</span>
                              <span>
                                {applicant.profile.employmentStatus || 'N/A'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className='text-muted-foreground'>
                            No profile data
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {applicant.userCohort?.[0]?.enrollments?.length > 0
                          ? applicant.userCohort[0].enrollments
                              .map(e => e.course_name)
                              .join(', ')
                          : 'No Enrollments'}
                      </TableCell>
                      <TableCell>
                        {applicant.profile ? (
                          applicant.userCohort?.[0]?.enrollments?.[0]
                            ?.enrolled ? (
                            <Badge variant='secondary'>Approved</Badge>
                          ) : (
                            <Badge variant='outline' className='bg-yellow-100'>
                              Completed
                            </Badge>
                          )
                        ) : (
                          <Badge variant='outline'>Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {applicant.userCohort?.[0]?.enrollments?.length > 0 ? (
                          applicant.userCohort[0].enrollments[0].enrolled ? (
                            <Badge variant='secondary'>Enrolled</Badge>
                          ) : (
                            <Badge variant='outline' className='bg-yellow-100'>
                              Pending
                            </Badge>
                          )
                        ) : (
                          <Badge variant='outline'>None</Badge>
                        )}
                      </TableCell>
                      <TableCell className='text-right'>
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <Button variant='ghost' size='sm' type='button'>
                              <span className='sr-only'>Open menu</span>
                              <ChevronDown className='h-4 w-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Link
                                href={`/admin-dashboard/applicants/${applicant.id}`}>
                                <a>View Details</a>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Link
                                href={`/admin-dashboard/applicants/${applicant.id}/edit`}>
                                <a>Edit</a>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                handleSelectOneApplicant(applicant.id, true)
                              }>
                              Select
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className='text-red-600'
                              onClick={() => {
                                if (
                                  window.confirm(
                                    'Are you sure you want to delete this applicant?',
                                  )
                                ) {
                                  deleteApplicants({ids: [applicant.id]});
                                }
                              }}>
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}

                  {data?.applicants.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className='text-center py-6'>
                        <div className='flex flex-col items-center justify-center'>
                          <p className='text-muted-foreground mb-2'>
                            No applicants found
                          </p>
                          <Button variant='outline'>
                            <Link href='/admin-dashboard/applicants/create'>
                              <a className='flex items-center'>
                                <Plus className='mr-2 h-4 w-4' />
                                Add Applicant
                              </a>
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className='flex items-center justify-between mt-4'>
              <div className='text-sm text-muted-foreground'>
                Showing {data?.applicants.length || 0} of {data?.count || 0}{' '}
                applicants
              </div>
              <div className='flex items-center space-x-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 0}>
                  Previous
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handlePageChange(page + 1)}
                  disabled={(page + 1) * limit >= (data?.count || 0)}>
                  Next
                </Button>
              </div>
            </div>

            {/* <div className='mt-6'>
              <Button variant='secondary' onClick={handleAutoEnrollment}>
                Enroll Eligible Applicants
              </Button>
            </div> */}
          </CardContent>
        </Card>

        {/* Filtered Out Applicants Card */}
        {data?.filteredOutCount > 0 && (
          <FilteredOutApplicantsCard
            filteredOutCount={data.filteredOutCount}
            filteredOutSample={data.filteredOutSample}
            isExpanded={showFilteredOut}
            onToggleExpand={() => setShowFilteredOut(prev => !prev)}
          />
        )}
      </div>
    </>
  );
}

ApplicantList.getLayout = page => <DashboardLayout>{page}</DashboardLayout>;

export default ApplicantList;
