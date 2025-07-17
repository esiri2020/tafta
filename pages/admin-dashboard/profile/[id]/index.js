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
import { UserBasicDetails } from '../../../../components/dashboard/profile/user-basic-details';
// import { UserDataManagement } from '../../../../components/dashboard/profile/user-data-management';
import { ChevronDown as ChevronDownIcon } from '../../../../icons/chevron-down';
import { PencilAlt as PencilAltIcon } from '../../../../icons/pencil-alt';
import { getInitials } from '../../../../utils/get-initials';
import { useGetUserQuery } from '../../../../services/api'
import { SplashScreen } from '../../../../components/splash-screen';
import { Link as MuiLink } from '@mui/material';


const tabs = [
  { label: 'Details', value: 'details' },
];

const UserDetails = () => {
  const [currentTab, setCurrentTab] = useState('details');
  const router = useRouter()
  const { id } = router.query

  const handleTabsChange = (event, value) => {
    setCurrentTab(value);
  };

  const { data, error, isLoading } = useGetUserQuery(id)

  if (isLoading) return (<SplashScreen />)
  if (error) {
    if (error.status === 404) {
      return <Error statusCode={404} title="User not found" />
    }
    return <Error statusCode={400} title="An error occured" />
  }
  if (!data.user) return (<div>No Data!</div>);
  const user = data.user

  return (
    <>
      <Head>
        <title>
          User Profile
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
              <MuiLink component={NextLink} href="/admin-dashboard/users" style={{textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center'}}>
                <ArrowBackIcon fontSize="small" sx={{ mr: 1 }} />
                <Typography component="span" variant="subtitle2">Users</Typography>
              </MuiLink>
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
                  src={user.avatar}
                  sx={{
                    height: 64,
                    mr: 2,
                    width: 64
                  }}
                >
                  {getInitials(`${user.firstName} ${user.lastName}`)}
                </Avatar>
                <div>
                  <Typography variant="h4">
                    {`${user.firstName} ${user.lastName}`}
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Typography variant="subtitle2">
                      email:
                    </Typography>
                    <Chip
                      label={user.email}
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
                  href={`/admin-dashboard/users/${user.id}/edit`}
                  endIcon={<PencilAltIcon fontSize="small" />}
                  sx={{ m: 1 }}
                  variant="outlined"
                >
                  Edit
                </Button>
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
                  <UserBasicDetails
                    user={user}
                  />
                </Grid>
                {/*<Grid*/}
                {/*  item*/}
                {/*  xs={12}*/}
                {/*>*/}
                {/*  <UserDataManagement id={id} />*/}
                {/*</Grid>*/}
              </Grid>
            )}
            {/* {currentTab === 'enrollments' && <UserEnrollment enrollments={user.enrollments} />} */}
          </Box>
        </Container>
      </Box>
    </>
  );
};

UserDetails.getLayout = (page) => (
  <DashboardLayout>
    {page}
  </DashboardLayout>
);

export default UserDetails;

