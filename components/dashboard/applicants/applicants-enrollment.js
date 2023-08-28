// import { useCallback, useEffect, useState } from 'react';
import NextLink from 'next/link';
import { format, utcToZonedTime } from "date-fns-tz";
import {
  Card,
  CardHeader,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow
} from '@mui/material';
import { ArrowRight as ArrowRightIcon } from '../../../icons/arrow-right';
import { Scrollbar } from '../../scrollbar';
import { formatInTimeZone } from '../../../utils'
// import { SeverityPill } from '../../severity-pill';

export const ApplicantEnrollment = ({ enrollments, ...others }) => {
  if (!enrollments) return (
    <div>No enrollments</div>)
  return (
    <Card {...others}>
      <CardHeader
        title="Enrollments"
      />
      <Divider />
      <Scrollbar>
        <Table sx={{ minWidth: 600 }}>
          <TableHead>
            <TableRow>
              <TableCell>
                ID
              </TableCell>
              <TableCell>
                Date Activated
              </TableCell>
              <TableCell>
                Course Name
              </TableCell>
              <TableCell>
                Percentage Complete
              </TableCell>
              {/* <TableCell align="right">
                Actions
              </TableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>
            {enrollments?.map((enrollment) => (
              <TableRow key={enrollment.id}>
                <TableCell>
                  {enrollment.id}
                </TableCell>
                <TableCell>
                  {enrollment.activated_at ? formatInTimeZone(enrollment.activated_at, 'dd MMM yyyy') : 'Activation Loading...'}
                </TableCell>
                <TableCell>
                  {enrollment.course_name}
                </TableCell>
                <TableCell>
                  {/* <SeverityPill color={enrollment.status === 'paid' ? 'success' : 'error'}>
                    {enrollment.status}
                  </SeverityPill> */}
                  {enrollment.percentage_completed ?
                    parseFloat(enrollment.percentage_completed).toLocaleString("en", { style: "percent", minimumFractionDigits: 2 })
                    : 'Not Started'
                  }
                </TableCell>
                {/* <TableCell align="right">
                  <NextLink
                    href={`/dashboard/enrollments/${enrollment.id}`}
                    passHref
                  >
                    <IconButton component="a">
                      <ArrowRightIcon fontSize="small" />
                    </IconButton>
                  </NextLink>
                </TableCell> */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Scrollbar>
      <TablePagination
        component="div"
        count={enrollments.length}
        onPageChange={() => {
        }}
        onRowsPerPageChange={() => {
        }}
        page={0}
        rowsPerPage={5}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Card>
  );
};
