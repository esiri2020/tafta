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
import axios from 'axios';
import { useState } from 'react';
import toast from 'react-hot-toast';
// import { SeverityPill } from '../../severity-pill';

export const ApplicantEnrollment = ({ enrollments, ...others }) => {
  const [retryingUid, setRetryingUid] = useState(null);

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
            {enrollments?.map((enrollment, index) => (
              <TableRow key={enrollment.uid || enrollment.id || index}>
                <TableCell>
                  {enrollment.id}
                </TableCell>
                <TableCell>
                  {enrollment.activated_at ? formatInTimeZone(enrollment.activated_at, 'dd MMM yyyy') : (
                    <>
                      Activation Loading...
                      <button
                        type="button"
                        disabled={retryingUid === enrollment.uid}
                        onClick={() => handleRetryEnrollment(enrollment.uid)}
                        style={{ marginLeft: 8, padding: '2px 8px', borderRadius: 4, border: '1px solid #1976d2', background: '#1976d2', color: '#fff', cursor: 'pointer', fontSize: 12 }}
                      >
                        {retryingUid === enrollment.uid ? 'Retrying...' : 'Retry'}
                      </button>
                    </>
                  )}
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
