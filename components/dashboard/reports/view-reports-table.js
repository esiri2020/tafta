import { Fragment, useState } from 'react';
// import numeral from 'numeral';
import PropTypes from 'prop-types';
import { toast } from 'react-hot-toast';
import {
  Box,
  Button,
  CardContent,
  Divider,
  Grid,
  IconButton,
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
import { Scrollbar } from '../../scrollbar';
import { useDeleteReportMutation } from '../../../services/api'


export const ViewReportsTable = (props) => {
  const {
    onPageChange,
    onRowsPerPageChange,
    page,
    reports,
    reportsCount,
    rowsPerPage,
    ...other
  } = props;
  const [openReport, setOpenReport] = useState(null);
  const [deleteReport, result] = useDeleteReportMutation()

  const handleOpenReport = (ReportId) => {
    setOpenReport((prevValue) => (prevValue === ReportId ? null : ReportId));
  };

  const handleUpdateReport = () => {
    setOpenReport(null);
    toast.success('Report updated');
  };

  const handleCancelEdit = () => {
    setOpenReport(null);
  };

  const handleDeleteReport = async (id) => {
    const toastId = toast.loading('Deleting...')
    try {
      const res = await deleteReport({ id }).unwrap()
      if (res.message === 'success') {
        toast.dismiss(toastId)
        toast.success('Report deleted!')
      } else {
        toast.dismiss(toastId)
        toast.error('An error occurred')
      }
    } catch (error) {
      toast.dismiss(toastId)
      toast.error('An error occurred')
    }
  };

  return (
    <div {...other}>
      <Scrollbar>
        <Table sx={{ minWidth: 1200 }}>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell width="20%">
                User Name
              </TableCell>
              <TableCell width="10%">
                Cohort
              </TableCell>
              <TableCell width="15%">
                Report Title
              </TableCell>
              <TableCell width="20%">
                Report Description
              </TableCell>
              <TableCell width="15%">
                Files
              </TableCell>
              <TableCell width="20%">
                Date Created
              </TableCell>

            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map((Report) => {
              const open = Report.id === openReport;

              return (
                <Fragment key={Report.id}>
                  <TableRow
                    hover
                    key={Report.id}
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
                      <IconButton onClick={() => handleOpenReport(Report.id)}>
                        {open
                          ? <ChevronDownIcon fontSize="small" />
                          : <ChevronRightIcon fontSize="small" />}
                      </IconButton>
                    </TableCell>
                    <TableCell width="25%">
                      <Typography
                        color="textSecondary"
                        variant="body2"
                      >
                        {`${Report.user.firstName} ${Report.user.lastName}`}
                      </Typography>
                    </TableCell>
                    <TableCell width="25%">
                      <Typography
                        color="textSecondary"
                        variant="body2"
                      >
                        {Report.cohort.name}
                      </Typography>
                    </TableCell>
                    <TableCell width="25%">
                      <Typography
                        color="textSecondary"
                        variant="body2"
                      >
                        {Report.title}
                      </Typography>
                    </TableCell>
                    <TableCell width="25%">
                      <Typography
                        color="textSecondary"
                        variant="body2"
                      >
                        {Report.description.length > 30 ? Report.description.substring(0, 30) + '...' : Report.description}
                      </Typography>
                    </TableCell>
                    <TableCell width="25%">
                      {Report.files.map(file =>
                        <a key={file} target="_blank" href={file}>{file.split('/').at(-1)}</a>
                      )}
                    </TableCell>
                    <TableCell>
                      {Report.created_at}
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
                        <CardContent>
                          <Grid
                            container
                            spacing={3}
                          >
                            <Grid
                              item
                              md={6}
                              xs={12}
                            >
                              <Typography variant="h6">
                                Basic details
                              </Typography>
                              <Divider sx={{ my: 2 }} />
                              <Grid
                                container
                                spacing={3}
                              >
                                <Grid
                                  item
                                  md={6}
                                  xs={12}
                                >
                                  {/* username */}
                                  <Typography variant="P" >
                                    USERNAME
                                  </Typography>
                                  <Typography
                                    color="textSecondary"
                                    variant="body2"
                                  >
                                    {`${Report.user.firstName} ${Report.user.lastName}`}
                                  </Typography>
                                </Grid>
                                <Grid
                                  item
                                  md={6}
                                  xs={12}
                                >
                                  {/* cohort */}
                                  <Typography variant="P" >
                                    COHORT
                                  </Typography>
                                  <Typography
                                    color="textSecondary"
                                    variant="body2"
                                  >
                                    {Report.cohort.name}
                                  </Typography>
                                </Grid>
                                <Grid
                                  item
                                  md={6}
                                  xs={12}
                                >
                                  {/* report title */}
                                  <Typography variant="P" >
                                    REPORT TITLE
                                  </Typography>
                                  <Typography
                                    color="textSecondary"
                                    variant="body2"
                                  >
                                    {Report.title}
                                  </Typography>
                                </Grid>
                                <Grid
                                  item
                                  md={6}
                                  xs={12}
                                >
                                  {/* date created */}
                                  <Typography variant="P" >
                                    DATE CREATED
                                  </Typography>
                                  <Typography
                                    color="textSecondary"
                                    variant="body2"
                                  >
                                    {Report.created_at}
                                  </Typography>
                                </Grid>
                              </Grid>
                            </Grid>
                            <Grid
                              item
                              md={6}
                              xs={12}
                            >
                              <Typography variant="h6">
                                Files and Report Description
                              </Typography>
                              <Divider sx={{ my: 2 }} />
                              <Grid
                                container
                                spacing={3}
                              >
                                <Grid
                                  item
                                  md={12}
                                  xs={12}
                                >
                                  {/* files */}
                                  {Report.files.map(file =>
                                    <a key={file} target="_blank" href={file}>{file.split('/').at(-1)}</a>
                                  )}
                                </Grid>
                                <Grid
                                  item
                                  md={12}
                                  xs={12}
                                >
                                  {/* report description */}
                                  <Typography
                                    color="textSecondary"
                                    variant="body2"
                                  >
                                    {Report.description}
                                  </Typography>
                                </Grid>
                              </Grid>
                            </Grid>
                          </Grid>
                        </CardContent>
                        <Divider />
                        <Box
                          sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            px: 2,
                            py: 1
                          }}
                        >
                          {/* <Button
                            onClick={handleUpdateReport}
                            sx={{ m: 1 }}
                            type="submit"
                            variant="contained"
                          >
                            Update
                          </Button> */}
                          <Button
                            onClick={handleCancelEdit}
                            sx={{ m: 1 }}
                            variant="outlined"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => handleDeleteReport(openReport)}
                            color="error"
                            sx={{
                              m: 1,
                              ml: 'auto'
                            }}
                          >
                            Delete Report
                          </Button>
                        </Box>
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
        count={reportsCount}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </div>
  );
};

ViewReportsTable.propTypes = {
  reports: PropTypes.array.isRequired,
  reportsCount: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onRowsPerPageChange: PropTypes.func,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired
};
