'use client';

import {useState} from 'react';
import Link from 'next/link';
import {format} from 'date-fns';
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  MoreHorizontal,
  UserCircle,
  BookOpen,
  Calendar,
  Mail,
  ExternalLink,
  Users,
} from 'lucide-react';
import axios from 'axios';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Progress} from '@/components/ui/progress';
import {Separator} from '@/components/ui/separator';
import {Card, CardContent} from '@/components/ui/card';
import {Avatar, AvatarFallback} from '@/components/ui/avatar';
import {toast} from 'sonner';

export function EnrollmentListTable({
  enrollments,
  enrollmentsCount,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}) {
  const [expandedRow, setExpandedRow] = useState(null);
  const [retryingUid, setRetryingUid] = useState(null);

  const toggleRowExpansion = uid => {
    setExpandedRow(expandedRow === uid ? null : uid);
  };

  const getStatusBadge = enrollment => {
    if (enrollment.expired) {
      return <Badge variant='destructive'>Expired</Badge>;
    } else if (enrollment.completed) {
      return <Badge variant='success'>Completed</Badge>;
    } else if (enrollment.activated_at) {
      if (enrollment.percentage_completed === 0) {
        return <Badge variant='outline'>Not Started</Badge>;
      }
      return <Badge variant='default'>Active</Badge>;
    }
    return <Badge variant='secondary'>Pending</Badge>;
  };

  const getProgressColor = percentage => {
    if (percentage === null || percentage === undefined) return 'bg-gray-200';
    if (percentage >= 0.75) return 'bg-green-500';
    if (percentage >= 0.5) return 'bg-blue-500';
    if (percentage >= 0.25) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const formatDate = dateString => {
    if (!dateString) return '—';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const totalPages = Math.ceil(enrollmentsCount / rowsPerPage);
  const startItem = page * rowsPerPage + 1;
  const endItem = Math.min((page + 1) * rowsPerPage, enrollmentsCount);

  const handleRetryEnrollment = async (uid) => {
    setRetryingUid(uid);
    try {
      const res = await axios.post('/api/enrollments/retry', { uid });
      toast.success(res.data.message || 'Enrollment retried successfully');
      // Optionally: trigger a reload of enrollments here
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Retry failed');
    } finally {
      setRetryingUid(null);
    }
  };

  return (
    <div>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead style={{width: '48px'}}></TableHead>
              <TableHead>Student</TableHead>
              <TableHead className='hidden md:table-cell'>Course</TableHead>
              <TableHead className='hidden lg:table-cell'>Progress</TableHead>
              <TableHead className='hidden md:table-cell'>Status</TableHead>
              <TableHead className='hidden lg:table-cell'>Start Date</TableHead>
              <TableHead className='hidden xl:table-cell'>Completion</TableHead>
              <TableHead style={{width: '64px'}}></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enrollments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className='h-24 text-center'>
                  No enrollments found
                </TableCell>
              </TableRow>
            ) : (
              enrollments.map(enrollment => (
                <>
                  <TableRow key={enrollment.uid}>
                    <TableCell>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => toggleRowExpansion(enrollment.uid)}>
                        {expandedRow === enrollment.uid ? (
                          <ChevronDown className='h-4 w-4' />
                        ) : (
                          <ChevronRight className='h-4 w-4' />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-3'>
                        <Avatar className='h-8 w-8'>
                          <AvatarFallback
                            className={
                              enrollment.userCohort.user.profile.gender ===
                              'MALE'
                                ? 'bg-blue-100'
                                : 'bg-pink-100'
                            }>
                            {enrollment.userCohort?.user?.firstName && typeof enrollment.userCohort.user.firstName === 'string' ? enrollment.userCohort.user.firstName.charAt(0) : ''}
                            {enrollment.userCohort?.user?.lastName && typeof enrollment.userCohort.user.lastName === 'string' ? enrollment.userCohort.user.lastName.charAt(0) : ''}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          {/* Fix: Wrap the content in a span to ensure Link has only one child */}
                          <Link
                            href={`/dashboard/students/${enrollment.userCohort.user.id}`}
                            className='font-medium hover:underline'>
                            <span>
                              {enrollment.userCohort.user.firstName}{' '}
                              {enrollment.userCohort.user.lastName}
                            </span>
                          </Link>
                          <div className='text-xs text-muted-foreground'>
                            {enrollment.userCohort.user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className='hidden md:table-cell'>
                      <div className='max-w-[220px]'>
                        <span className='font-medium truncate block'>
                          {enrollment.course_name}
                        </span>
                        {enrollment.userCohort?.cohort && (
                          <span className='text-xs text-muted-foreground flex items-center mt-1'>
                            <Users className='h-3 w-3 mr-1 opacity-70' />
                            {enrollment.userCohort.cohort.name}
                            <Badge
                              variant={
                                enrollment.userCohort.cohort.active
                                  ? 'success'
                                  : 'outline'
                              }
                              className='ml-2 text-[10px] h-4 px-1'>
                              {enrollment.userCohort.cohort.active
                                ? 'Active'
                                : 'Ended'}
                            </Badge>
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className='hidden lg:table-cell'>
                      <div className='flex items-center gap-2'>
                        <Progress
                          value={
                            enrollment.percentage_completed
                              ? enrollment.percentage_completed * 100
                              : 0
                          }
                          className='h-2 w-16'
                        />
                        <span className='text-xs'>
                          {enrollment.percentage_completed !== null
                            ? `${(
                                enrollment.percentage_completed * 100
                              ).toFixed(0)}%`
                            : '—'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className='hidden md:table-cell'>
                      <div className='flex items-center gap-2'>
                        {getStatusBadge(enrollment)}
                        {/* Retry Enrollment Button: show if stuck */}
                        {(!enrollment.activated_at || getStatusBadge(enrollment).props.children === 'Pending') && (
                          <Button
                            size='xs'
                            variant='outline'
                            disabled={retryingUid === enrollment.uid}
                            onClick={() => handleRetryEnrollment(enrollment.uid)}
                          >
                            {retryingUid === enrollment.uid ? 'Retrying...' : 'Retry Enrollment'}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className='hidden lg:table-cell'>
                      {formatDate(enrollment.activated_at)}
                    </TableCell>
                    <TableCell className='hidden xl:table-cell'>
                      {formatDate(enrollment.completed_at)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' size='icon'>
                            <MoreHorizontal className='h-4 w-4' />
                            <span className='sr-only'>Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/dashboard/students/${enrollment.userCohort.user.id}`}>
                              <span>View Student</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/dashboard/enrollments/${enrollment.uid}`}>
                              <span>View Enrollment</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              toast.info('This feature is not yet implemented');
                            }}>
                            Send Reminder
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  {expandedRow === enrollment.uid && (
                    <TableRow>
                      <TableCell colSpan={8} className='p-0'>
                        <div className='p-4 bg-muted/50'>
                          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <Card>
                              <CardContent className='p-4'>
                                <h3 className='text-sm font-semibold mb-3 flex items-center'>
                                  <UserCircle className='mr-2 h-4 w-4' />
                                  Student Information
                                </h3>
                                <div className='space-y-2'>
                                  <div className='flex justify-between'>
                                    <span className='text-sm text-muted-foreground'>
                                      Name:
                                    </span>
                                    <span className='text-sm font-medium'>
                                      {enrollment.userCohort.user.firstName}{' '}
                                      {enrollment.userCohort.user.lastName}
                                    </span>
                                  </div>
                                  <div className='flex justify-between'>
                                    <span className='text-sm text-muted-foreground'>
                                      Email:
                                    </span>
                                    <span className='text-sm'>
                                      {enrollment.userCohort.user.email}
                                    </span>
                                  </div>
                                  <div className='flex justify-between'>
                                    <span className='text-sm text-muted-foreground'>
                                      Gender:
                                    </span>
                                    <span className='text-sm'>
                                      {
                                        enrollment.userCohort.user.profile
                                          .gender
                                      }
                                    </span>
                                  </div>
                                  <div className='flex justify-between'>
                                    <span className='text-sm text-muted-foreground'>
                                      User ID:
                                    </span>
                                    <span className='text-sm font-mono'>
                                      {enrollment.userCohort.user.id}
                                    </span>
                                  </div>
                                </div>
                                <Separator className='my-3' />
                                <div className='flex justify-end'>
                                  <Button variant='outline' size='sm' asChild>
                                    <Link
                                      href={`/dashboard/students/${enrollment.userCohort.user.id}`}>
                                      <span className='flex items-center'>
                                        <ExternalLink className='mr-2 h-3 w-3' />
                                        View Profile
                                      </span>
                                    </Link>
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardContent className='p-4'>
                                <h3 className='text-sm font-semibold mb-3 flex items-center'>
                                  <BookOpen className='mr-2 h-4 w-4' />
                                  Enrollment Details
                                </h3>
                                <div className='space-y-2'>
                                  <div className='flex justify-between'>
                                    <span className='text-sm text-muted-foreground'>
                                      Course:
                                    </span>
                                    <span className='text-sm font-medium max-w-[250px] truncate'>
                                      {enrollment.course_name}
                                    </span>
                                  </div>
                                  {enrollment.userCohort?.cohort && (
                                    <div className='flex justify-between'>
                                      <span className='text-sm text-muted-foreground'>
                                        Cohort:
                                      </span>
                                      <div className='text-sm flex items-center'>
                                        {enrollment.userCohort.cohort.name}
                                        <Badge
                                          variant={
                                            enrollment.userCohort.cohort.active
                                              ? 'success'
                                              : 'outline'
                                          }
                                          className='ml-2 text-[10px] h-4 px-1'>
                                          {enrollment.userCohort.cohort.active
                                            ? 'Active'
                                            : 'Ended'}
                                        </Badge>
                                      </div>
                                    </div>
                                  )}
                                  <div className='flex justify-between'>
                                    <span className='text-sm text-muted-foreground'>
                                      Course ID:
                                    </span>
                                    <span className='text-sm'>
                                      {enrollment.course_id}
                                    </span>
                                  </div>
                                  <div className='flex justify-between'>
                                    <span className='text-sm text-muted-foreground'>
                                      Progress:
                                    </span>
                                    <span className='text-sm'>
                                      {enrollment.percentage_completed !== null
                                        ? `${(
                                            enrollment.percentage_completed *
                                            100
                                          ).toFixed(0)}%`
                                        : 'Not started'}
                                    </span>
                                  </div>
                                  <div className='flex justify-between'>
                                    <span className='text-sm text-muted-foreground'>
                                      Status:
                                    </span>
                                    <span className='text-sm'>
                                      {getStatusBadge(enrollment)}
                                    </span>
                                  </div>
                                  <div className='flex justify-between'>
                                    <span className='text-sm text-muted-foreground'>
                                      Enrollment ID:
                                    </span>
                                    <span className='text-sm font-mono'>
                                      {enrollment.uid}
                                    </span>
                                  </div>
                                </div>
                                <Separator className='my-3' />
                                <div className='flex justify-between items-center'>
                                  <div className='flex items-center text-xs text-muted-foreground'>
                                    <Calendar className='mr-1 h-3 w-3' />
                                    Created: {formatDate(enrollment.created_at)}
                                  </div>
                                  <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={() => {
                                      toast.info(
                                        'This feature is not yet implemented',
                                      );
                                    }}>
                                    <Mail className='mr-2 h-3 w-3' />
                                    Contact
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className='flex items-center justify-between px-2 py-4'>
        <div className='text-sm text-muted-foreground'>
          Showing {enrollments.length > 0 ? startItem : 0} to {endItem} of{' '}
          {enrollmentsCount} entries
        </div>
        <div className='flex items-center space-x-6 lg:space-x-8'>
          <div className='flex items-center space-x-2'>
            <p className='text-sm font-medium'>Rows per page</p>
            <select
              className='h-8 w-[70px] rounded-md border border-input bg-transparent px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring'
              value={rowsPerPage}
              onChange={e => onRowsPerPageChange(Number(e.target.value))}>
              {[10, 25, 50, 100].map(value => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <div className='flex items-center space-x-2'>
            <Button
              variant='outline'
              size='icon'
              onClick={() => onPageChange(page - 1)}
              disabled={page === 0}>
              <ChevronLeft className='h-4 w-4' />
              <span className='sr-only'>Previous page</span>
            </Button>
            <div className='text-sm'>
              Page {page + 1} of {totalPages || 1}
            </div>
            <Button
              variant='outline'
              size='icon'
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages - 1}>
              <ChevronRight className='h-4 w-4' />
              <span className='sr-only'>Next page</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
