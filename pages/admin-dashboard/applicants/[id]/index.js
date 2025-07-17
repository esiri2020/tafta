import { useCallback, useEffect, useState } from 'react';
import NextLink from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router'
import Error from "next/error";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Grid,
  Link,
  Tab,
  Tabs,
  Typography
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { DashboardLayout } from '../../../../components/dashboard/dashboard-layout';
import { ApplicantBasicDetails } from '../../../../components/dashboard/applicants/applicants-basic-details';
import { ApplicantDataManagement } from '../../../../components/dashboard/applicants/applicant-data-management';
import { ApplicantEnrollment } from '../../../../components/dashboard/applicants/applicants-enrollment';
import { ChevronDown as ChevronDownIcon } from '../../../../icons/chevron-down';
import { PencilAlt as PencilAltIcon } from '../../../../icons/pencil-alt';
import { getInitials } from '../../../../utils/get-initials';
import { useGetApplicantQuery, useApproveApplicantsMutation } from '../../../../services/api'
import { SplashScreen } from '../../../../components/splash-screen';


const tabs = [
  { label: 'Details', value: 'details' },
  { label: 'Enrollments', value: 'enrollments' }
];

const ApplicantDetails = () => {
  const [currentTab, setCurrentTab] = useState('details');
  const router = useRouter()
  const { id } = router.query

  const handleTabsChange = (event, value) => {
    setCurrentTab(value);
  };

  const { data, error, isLoading } = useGetApplicantQuery(id)
  const [approveApplicant, result] = useApproveApplicantsMutation()

  if (isLoading) return (<SplashScreen />)
  if (error) {
    if (error.status === 404) {
      return <Error statusCode={404} title="User not found" />
    }
    return <Error statusCode={400} title="An error occured" />
  }
  const { user: applicant } = data
  if (!applicant) return (<div>No Data!</div>);

  return (
    <>
      <Head>
        <title>
          Applicant Details
        </title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8
        }}
      >
        <Container maxWidth="md">
          <div>
            <Box sx={{ mb: 4 }}>
              <Link href="/admin-dashboard/applicants" passHref legacyBehavior style={{textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center'}}>
                <a style={{textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center'}}>Back to Applicants</a>
              </Link>
            </Box>
            <Grid
              container
              justifyContent="space-between"
              spacing={3}
            >
              <Grid
                item
                sx={{
                  alignItems: 'center',
                  display: 'flex',
                  overflow: 'hidden'
                }}
              >
                <Avatar
                  src={applicant.avatar}
                  sx={{
                    height: 64,
                    mr: 2,
                    width: 64
                  }}
                >
                  {getInitials(`${applicant.firstName} ${applicant.lastName}`)}
                </Avatar>
                <div>
                  <Typography variant="h4">
                    {`${applicant.firstName} ${applicant.lastName}`}
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Typography variant="subtitle2">
                      User ID:
                    </Typography>
                    <Chip
                      label={applicant.email}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                </div>
              </Grid>
              <Grid
                item
                sx={{ m: -1 }}
              >
                <Button
                  component={NextLink}
                  href={`/admin-dashboard/applicants/${applicant.id}/edit`}
                  endIcon={<PencilAltIcon fontSize="small" />}
                  sx={{ m: 1 }}
                  variant="outlined"
                >
                  Edit
                </Button>
                {applicant.thinkific_user_id ? '' :
                  <Button
                    sx={{ m: 1 }}
                    variant="contained"
                    onClick={() => approveApplicant({ ids: [applicant.id] })}
                  >
                    Approve and Enroll
                  </Button>}
              </Grid>
            </Grid>
            <Tabs
              indicatorColor="primary"
              onChange={handleTabsChange}
              scrollButtons="auto"
              sx={{ mt: 3 }}
              textColor="primary"
              value={currentTab}
              variant="scrollable"
            >
              {tabs.map((tab) => (
                <Tab
                  key={tab.value}
                  label={tab.label}
                  value={tab.value}
                />
              ))}
            </Tabs>
          </div>
          <Divider />
          <Box sx={{ mt: 3 }}>
            {currentTab === 'details' && (
              <Grid
                container
                spacing={3}
              >
                <Grid
                  item
                  xs={12}
                >
                  <ApplicantBasicDetails
                    applicant={applicant}
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                >
                  <ApplicantDataManagement id={id} />
                </Grid>
              </Grid>
            )}
            {currentTab === 'enrollments' && <ApplicantEnrollment enrollments={applicant.userCohort[0]?.enrollments} />}
          </Box>
        </Container>
      </Box>
    </>
  );
};

ApplicantDetails.getLayout = (page) => (
  <DashboardLayout>
    {page}
  </DashboardLayout>
);

export default ApplicantDetails;

