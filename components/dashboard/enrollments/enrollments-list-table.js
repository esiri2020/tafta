// import { Fragment, useState } from 'react';
// import NextLink from 'next/link';
// import PropTypes from 'prop-types';
// import { toast } from 'react-hot-toast';
// import {
//   Box,
//   Button,
//   CardContent,
//   Divider,
//   Grid,
//   IconButton,
//   InputAdornment,
//   LinearProgress,
//   Link,
//   MenuItem,
//   Switch,
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TablePagination,
//   TableRow,
//   TextField,
//   Typography
// } from '@mui/material';
// import { ChevronDown as ChevronDownIcon } from '../../../icons/chevron-down';
// import { ChevronRight as ChevronRightIcon } from '../../../icons/chevron-right';
// import { DotsHorizontal as DotsHorizontalIcon } from '../../../icons/dots-horizontal';
// import { Scrollbar } from '../../scrollbar';
// import { SeverityPill } from '../../severity-pill';
// import { formatInTimeZone } from '../../../utils';
// import { EnrollmentBasicDetails } from './enrollment-basic-details'
// import { EnrollmentUserDetails } from './enrollment-user-details'


// export const EnrollmentListTable = (props) => {
//   const {
//     onPageChange,
//     onRowsPerPageChange,
//     page,
//     enrollments,
//     enrollmentsCount,
//     rowsPerPage,
//     ...other
//   } = props;
//   const [openEnrollment, setOpenEnrollment] = useState(null);

//   const handleOpenEnrollment = (enrollmentId) => {
//     setOpenEnrollment((prevValue) => (prevValue === enrollmentId ? null : enrollmentId));
//   };

//   const handleUpdateEnrollment = () => {
//     setOpenEnrollment(null);
//     toast.success('Enrollment updated');
//   };

//   const handleCancelEdit = () => {
//     setOpenEnrollment(null);
//   };

//   const handleDeleteEnrollment = () => {
//     toast.error('Enrollment cannot be deleted');
//   };

//   return (
//     <div {...other}>
//       <Scrollbar>
//         <Table sx={{ minWidth: 1200 }}>
//           <TableHead>
//             <TableRow>
//               <TableCell />
//               <TableCell>
//                 Applicant Name
//               </TableCell>
//               <TableCell width="25%">
//                 Course Name
//               </TableCell>
//               <TableCell>
//                 Percentage complete
//               </TableCell>
//               <TableCell>
//                 Start Date
//               </TableCell>
//               <TableCell>
//                 Date Completed
//               </TableCell>
//               <TableCell>
//                 Expiry Date
//               </TableCell>
//               <TableCell>
//                 Status
//               </TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {enrollments.map((enrollment) => {
//               const open = enrollment.uid === openEnrollment;
//               return (
//                 <Fragment key={enrollment.uid}>
//                   <TableRow
//                     hover
//                     key={enrollment.uid}
//                   >
//                     <TableCell
//                       padding="checkbox"
//                       sx={{
//                         ...(open && {
//                           position: 'relative',
//                           '&:after': {
//                             position: 'absolute',
//                             content: '" "',
//                             top: 0,
//                             left: 0,
//                             backgroundColor: 'primary.main',
//                             width: 3,
//                             height: 'calc(100% + 1px)'
//                           }
//                         })
//                       }}
//                       width="25%"
//                     >
//                       <IconButton onClick={() => handleOpenEnrollment(enrollment.uid)}>
//                         {open
//                           ? <ChevronDownIcon fontSize="small" />
//                           : <ChevronRightIcon fontSize="small" />}
//                       </IconButton>
//                     </TableCell>
//                     <TableCell>
//                     <NextLink
//                           href={`/admin-dashboard/applicants/${enrollment.userCohort.user.id}`}
//                           passHref
//                         >
//                           <Link
//                             color="inherit"
//                             variant="subtitle2"
//                           >
//                             {`${enrollment.userCohort.user.firstName} ${enrollment.userCohort.user.lastName}`}
//                           </Link>
//                         </NextLink>
//                     </TableCell>
//                     <TableCell width="25%">
//                       <Box
//                         sx={{
//                           alignItems: 'center',
//                           display: 'flex'
//                         }}
//                       >
//                         <Box
//                           sx={{
//                             cursor: 'pointer',
//                             ml: 2
//                           }}
//                         >
//                           <Typography variant="subtitle2">
//                             {enrollment.course_name}
//                           </Typography>
//                         </Box>
//                       </Box>
//                     </TableCell>
//                     <TableCell>
//                       <LinearProgress
//                         value={enrollment.percentage_completed}
//                         variant="determinate"
//                         color={
//                           enrollment.percentage_completed >= 0.1 ? 
//                           enrollment.percentage_completed >= 0.5 ? 
//                           enrollment.percentage_completed == 1 ? 'success' : 'info': 'warning':'error'}
//                         sx={{
//                           height: 8,
//                           width: 36
//                         }}
//                       />
//                       <Typography
//                         color="textSecondary"
//                         variant="body2"
//                       >
//                         {parseFloat(enrollment.percentage_completed).toLocaleString("en", { style: "percent", minimumFractionDigits: 2 })}
                        
//                         {enrollment.variants > 1 && ` in ${enrollment.variants} variants`}
//                       </Typography>
//                     </TableCell>
//                     <TableCell>
//                     {enrollment.activated_at ? formatInTimeZone(enrollment.activated_at, 'dd MMM yyyy') : ''}
//                     </TableCell>
//                     <TableCell>
//                       {enrollment.completed_at ? formatInTimeZone(enrollment.completed_at, 'dd MMM yyyy') : ''}
//                     </TableCell>
//                     <TableCell>
//                       {enrollment.expiry_date ? formatInTimeZone(enrollment.expiry_date, 'dd MMM yyyy') : ''}
//                     </TableCell>
//                     <TableCell>
//                       <SeverityPill color={enrollment.expired ? 'error' : enrollment.completed ? 'success' : enrollment.activated_at ? enrollment.percentage_completed == 0 ? 'warning':'info': 'warning'}>
//                         {enrollment.expired ? 'Expired' : enrollment.completed ? 'Completed' : enrollment.activated_at ? enrollment.percentage_completed == 0 ? 'Not started':'Active' : 'Approval Pending'}
//                       </SeverityPill>
//                     </TableCell>
//                   </TableRow>
//                   {open && (
//                     <TableRow>
//                       <TableCell
//                         colSpan={12}
//                         sx={{
//                           p: 0,
//                           position: 'relative',
//                           '&:after': {
//                             position: 'absolute',
//                             content: '" "',
//                             top: 0,
//                             left: 0,
//                             backgroundColor: 'primary.main',
//                             width: 3,
//                             height: 'calc(100% + 1px)'
//                           }
//                         }}
//                       >
//                         <Grid
//                           container
//                           spacing={3}
//                         >
//                           <Grid
//                             item
//                             lg={6}
//                             xs={12}
//                           >
//                             <EnrollmentBasicDetails enrollment={enrollment}/>
//                           </Grid>
//                           <Grid
//                             item
//                             lg={6}
//                             xs={12}
//                           >
//                             <EnrollmentUserDetails enrollment={enrollment}/>
//                           </Grid>
//                           </Grid>
//                         <Divider />
//                         <Box
//                           sx={{
//                             display: 'flex',
//                             flexWrap: 'wrap',
//                             px: 2,
//                             py: 1
//                           }}
//                         >
//                           <Button
//                             onClick={handleDeleteEnrollment}
//                             color="error"
//                             sx={{
//                               m: 1,
//                               ml: 'auto'
//                             }}
//                           >
//                             Delete enrollment
//                           </Button>
//                         </Box>
//                       </TableCell>
//                     </TableRow>
//                   )}
//                 </Fragment>
//               );
//             })}
//           </TableBody>
//         </Table>
//       </Scrollbar>
//       <TablePagination
//         component="div"
//         count={enrollmentsCount}
//         onPageChange={onPageChange}
//         onRowsPerPageChange={onRowsPerPageChange}
//         page={page}
//         rowsPerPage={rowsPerPage}
//         rowsPerPageOptions={[10, 25, 50]}
//       />
//     </div>
//   );
// };

// EnrollmentListTable.propTypes = {
//   enrollments: PropTypes.array.isRequired,
//   enrollmentsCount: PropTypes.number.isRequired,
//   onPageChange: PropTypes.func.isRequired,
//   onRowsPerPageChange: PropTypes.func,
//   page: PropTypes.number.isRequired,
//   rowsPerPage: PropTypes.number.isRequired
// };
"use client"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
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
} from "lucide-react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"

// interface EnrollmentListTableProps {
//   enrollments: any[]
//   enrollmentsCount: number
//   page: number
//   rowsPerPage: number
//   onPageChange: (page: number) => void
//   onRowsPerPageChange: (rowsPerPage: number) => void
// }

export function EnrollmentListTable({
  enrollments,
  enrollmentsCount,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}) {
  const [expandedRow, setExpandedRow] = useState(null)

  const toggleRowExpansion = (uid) => {
    setExpandedRow(expandedRow === uid ? null : uid)
  }

  const getStatusBadge = (enrollment) => {
    if (enrollment.expired) {
      return <Badge variant="destructive">Expired</Badge>
    } else if (enrollment.completed) {
      return <Badge variant="success">Completed</Badge>
    } else if (enrollment.activated_at) {
      if (enrollment.percentage_completed === 0) {
        return <Badge variant="outline">Not Started</Badge>
      }
      return <Badge variant="default">Active</Badge>
    }
    return <Badge variant="secondary">Pending</Badge>
  }

  const getProgressColor = (percentage) => {
    if (percentage === null || percentage === undefined) return "bg-gray-200"
    if (percentage >= 0.75) return "bg-green-500"
    if (percentage >= 0.5) return "bg-blue-500"
    if (percentage >= 0.25) return "bg-amber-500"
    return "bg-red-500"
  }

  const formatDate = (dateString) => {
    if (!dateString) return "—"
    try {
      return format(new Date(dateString), "MMM d, yyyy")
    } catch (error) {
      return "Invalid date"
    }
  }

  const totalPages = Math.ceil(enrollmentsCount / rowsPerPage)
  const startItem = page * rowsPerPage + 1
  const endItem = Math.min((page + 1) * rowsPerPage, enrollmentsCount)

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead style={{ width: "48px" }}></TableHead>
              <TableHead>Student</TableHead>
              <TableHead className="hidden md:table-cell">Course</TableHead>
              <TableHead className="hidden lg:table-cell">Progress</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead className="hidden lg:table-cell">Start Date</TableHead>
              <TableHead className="hidden xl:table-cell">Completion</TableHead>
              <TableHead style={{ width: "64px" }}></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enrollments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No enrollments found
                </TableCell>
              </TableRow>
            ) : (
              enrollments.map((enrollment) => (
                <>
                  <TableRow key={enrollment.uid}>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => toggleRowExpansion(enrollment.uid)}>
                        {expandedRow === enrollment.uid ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback
                            className={
                              enrollment.userCohort.user.profile.gender === "MALE" ? "bg-blue-100" : "bg-pink-100"
                            }
                          >
                            {enrollment.userCohort.user.firstName.charAt(0)}
                            {enrollment.userCohort.user.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          {/* Fix: Wrap the content in a span to ensure Link has only one child */}
                          <Link
                            href={`/dashboard/students/${enrollment.userCohort.user.id}`}
                            className="font-medium hover:underline"
                          >
                            <span>
                              {enrollment.userCohort.user.firstName} {enrollment.userCohort.user.lastName}
                            </span>
                          </Link>
                          <div className="text-xs text-muted-foreground">{enrollment.userCohort.user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="max-w-[250px] truncate" title={enrollment.course_name}>
                        {enrollment.course_name}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <Progress
                          value={enrollment.percentage_completed ? enrollment.percentage_completed * 100 : 0}
                          className="h-2 w-16"
                        />
                        <span className="text-xs">
                          {enrollment.percentage_completed !== null
                            ? `${(enrollment.percentage_completed * 100).toFixed(0)}%`
                            : "—"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{getStatusBadge(enrollment)}</TableCell>
                    <TableCell className="hidden lg:table-cell">{formatDate(enrollment.activated_at)}</TableCell>
                    <TableCell className="hidden xl:table-cell">{formatDate(enrollment.completed_at)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/students/${enrollment.userCohort.user.id}`}>
                              <span>View Student</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/enrollments/${enrollment.uid}`}>
                              <span>View Enrollment</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              toast.info("This feature is not yet implemented")
                            }}
                          >
                            Send Reminder
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  {expandedRow === enrollment.uid && (
                    <TableRow>
                      <TableCell colSpan={8} className="p-0">
                        <div className="p-4 bg-muted/50">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card>
                              <CardContent className="p-4">
                                <h3 className="text-sm font-semibold mb-3 flex items-center">
                                  <UserCircle className="mr-2 h-4 w-4" />
                                  Student Information
                                </h3>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Name:</span>
                                    <span className="text-sm font-medium">
                                      {enrollment.userCohort.user.firstName} {enrollment.userCohort.user.lastName}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Email:</span>
                                    <span className="text-sm">{enrollment.userCohort.user.email}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Gender:</span>
                                    <span className="text-sm">{enrollment.userCohort.user.profile.gender}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">User ID:</span>
                                    <span className="text-sm font-mono text-xs">{enrollment.userCohort.user.id}</span>
                                  </div>
                                </div>
                                <Separator className="my-3" />
                                <div className="flex justify-end">
                                  <Button variant="outline" size="sm" asChild>
                                    <Link href={`/dashboard/students/${enrollment.userCohort.user.id}`}>
                                      <span className="flex items-center">
                                        <ExternalLink className="mr-2 h-3 w-3" />
                                        View Profile
                                      </span>
                                    </Link>
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardContent className="p-4">
                                <h3 className="text-sm font-semibold mb-3 flex items-center">
                                  <BookOpen className="mr-2 h-4 w-4" />
                                  Enrollment Details
                                </h3>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Course:</span>
                                    <span className="text-sm font-medium max-w-[250px] truncate">
                                      {enrollment.course_name}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Course ID:</span>
                                    <span className="text-sm">{enrollment.course_id}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Progress:</span>
                                    <span className="text-sm">
                                      {enrollment.percentage_completed !== null
                                        ? `${(enrollment.percentage_completed * 100).toFixed(0)}%`
                                        : "Not started"}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Status:</span>
                                    <span className="text-sm">{getStatusBadge(enrollment)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Enrollment ID:</span>
                                    <span className="text-sm font-mono text-xs">{enrollment.uid}</span>
                                  </div>
                                </div>
                                <Separator className="my-3" />
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center text-xs text-muted-foreground">
                                    <Calendar className="mr-1 h-3 w-3" />
                                    Created: {formatDate(enrollment.created_at)}
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      toast.info("This feature is not yet implemented")
                                    }}
                                  >
                                    <Mail className="mr-2 h-3 w-3" />
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

      <div className="flex items-center justify-between px-2 py-4">
        <div className="text-sm text-muted-foreground">
          Showing {enrollments.length > 0 ? startItem : 0} to {endItem} of {enrollmentsCount} entries
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <select
              className="h-8 w-[70px] rounded-md border border-input bg-transparent px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={rowsPerPage}
              onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
            >
              {[10, 25, 50, 100].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={() => onPageChange(page - 1)} disabled={page === 0}>
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous page</span>
            </Button>
            <div className="text-sm">
              Page {page + 1} of {totalPages || 1}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages - 1}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next page</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
