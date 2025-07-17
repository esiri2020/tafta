import { Fragment, useState } from 'react';
import NextLink from 'next/link';
import PropTypes from 'prop-types';
import { toast } from 'react-hot-toast';
import {
  Box,
  Button,
  CardContent,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  LinearProgress,
  Link,
  MenuItem,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import { ChevronDown as ChevronDownIcon } from '../../../icons/chevron-down';
import { ChevronRight as ChevronRightIcon } from '../../../icons/chevron-right';
import { DotsHorizontal as DotsHorizontalIcon } from '../../../icons/dots-horizontal';
import { Scrollbar } from '../../scrollbar';
import { SeverityPill } from '../../severity-pill';
import { formatInTimeZone } from '../../../utils';
import { CohortEditForm } from './cohort-edit-form';


export const CohortListTable = (props) => {
  const {
    onPageChange,
    onRowsPerPageChange,
    onCohortSelect,
    page,
    cohorts,
    cohortCount,
    rowsPerPage,
    openCohortId,
    ...other
  } = props;
  // Remove internal openCohort state
  // const [openCohort, setOpenCohort] = useState(null);

  // Remove handleOpenCohort, use onCohortSelect
  // const handleOpenCohort = (cohortId) => { ... };

  const handleCohortClick = (cohort) => {
    onCohortSelect(cohort);
  };

  const handleUpdateCohort = () => {
    // setOpenCohort(null); // This line is removed as per the edit hint
    toast.success('Cohort updated');
  };

  const handleCancelEdit = () => {
    // setOpenCohort(null); // This line is removed as per the edit hint
  };

  const handleDeleteCohort = () => {
    toast.error('Cohort cannot be deleted');
  };

  return (
    <div {...other}>
      <Scrollbar>
        <Table sx={{ minWidth: 1200 }}>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell width="25%">
                Cohort Name
              </TableCell>
              <TableCell>
                Start Date
              </TableCell>
              <TableCell>
                End Date
              </TableCell>
              <TableCell>
                Status
              </TableCell>
              <TableCell>
                Cohort Color
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cohorts.map((cohort) => {
              const open = cohort.id === openCohortId;
              return (
                <Fragment key={cohort.id}>
                  <TableRow
                    hover
                    key={cohort.id}
                    onClick={() => handleCohortClick(cohort)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell
                      padding="checkbox"
                      sx={{
                        ...(open && {
                          position: 'relative',
                          '&:after': {
                            position: 'absolute',
                            content: '" "',
                            top: 0,
                            left: 0,
                            backgroundColor: 'primary.main',
                            width: 3,
                            height: 'calc(100% + 1px)'
                          }
                        })
                      }}
                      width="25%"
                    >
                      <IconButton onClick={e => { e.stopPropagation(); handleCohortClick(cohort); }}>
                        {open
                          ? <ChevronDownIcon fontSize="small" />
                          : <ChevronRightIcon fontSize="small" />}
                      </IconButton>
                    </TableCell>
                    <TableCell width="25%">
                      <Box
                        sx={{
                          alignItems: 'center',
                          display: 'flex'
                        }}
                      >
                        <Box
                          sx={{
                            ml: 2
                          }}
                        >
                          <Typography variant="subtitle2">
                            {cohort.name}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {formatInTimeZone(cohort.start_date, 'dd MMM yyyy')}
                    </TableCell>
                    <TableCell>
                      {cohort.end_date ? formatInTimeZone(cohort.end_date, 'dd MMM yyyy') : ''}
                    </TableCell>
                    <TableCell>
                      <SeverityPill color={cohort.active ? 'success' : 'error'}>
                        {cohort.active ? 'Active' : 'Inactive'}
                      </SeverityPill>
                    </TableCell>
                    <TableCell>
                      {cohort.color}
                    </TableCell>
                  </TableRow>
                  {open && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        sx={{
                          p: 0,
                          position: 'relative',
                          '&:after': {
                            position: 'absolute',
                            content: '" "',
                            top: 0,
                            left: 0,
                            backgroundColor: 'primary.main',
                            width: 3,
                            height: 'calc(100% + 1px)'
                          }
                        }}
                      >
                        <CohortEditForm
                          cohort={cohort}
                          cancel={() => onCohortSelect(cohort)}
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </Scrollbar>
      <TablePagination
        component="div"
        count={cohortCount}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[10, 25, 50]}
      />
    </div>
  );
};

CohortListTable.propTypes = {
  cohorts: PropTypes.array.isRequired,
  cohortCount: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onRowsPerPageChange: PropTypes.func,
  onCohortSelect: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  openCohortId: PropTypes.string // Added propType for openCohortId
};
