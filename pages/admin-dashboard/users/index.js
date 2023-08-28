import { useCallback, useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import NextLink from 'next/link';
import {
  Box,
  Button,
  Card,
  Container,
  Divider,
  Grid,
  InputAdornment,
  Tab,
  Tabs,
  TextField,
  Typography
} from '@mui/material';
import { useGetUsersQuery } from '../../../services/api'
import { DashboardLayout } from '../../../components/dashboard/dashboard-layout';
import { UsersListTable } from '../../../components/dashboard/users/user-list-table';
import { Plus as PlusIcon } from '../../../icons/plus';
import { Search as SearchIcon } from '../../../icons/search';
import { SplashScreen } from '../../../components/splash-screen';

const tabs = [
  {
    label: 'All',
    value: ''
  },
  {
    label: 'Superadmin',
    value: 'SUPERADMIN'
  },
  {
    label: 'Admin',
    value: 'ADMIN'
  },
  {
    label: 'Support',
    value: 'SUPPORT'
  }
];

const UserList = () => {
  const queryRef = useRef(null);
  const [currentTab, setCurrentTab] = useState('');
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [filter, setFilters] = useState('');
  const [query, setQuery] = useState('');
  const { data, error, isLoading } = useGetUsersQuery({ page, limit, filter, query })

  const handleTabsChange = (event, value) => {
    setFilters(value);
    setCurrentTab(value);
    setQuery('')
  };

  const handleQueryChange = (event) => {
    event.preventDefault();
    setFilters('')
    setQuery(queryRef.current?.value);
  };

  const handleSortChange = (event) => {
    setSort(event.target.value);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleLimitChange = (event) => {
    setLimit(parseInt(event.target.value, 10));
  };

  if (isLoading) return (<SplashScreen />)
  if (!data) return (<div>No Data!</div>);
  const { users, count } = data

  return (
    <>
      <Head>
        <title>
          User List
        </title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ mb: 4 }}>
            <Grid
              container
              justifyContent="space-between"
              spacing={3}
            >
              <Grid item>
                <Typography variant="h4">
                  Users
                </Typography>
              </Grid>
              <Grid item>
                <NextLink
                  href={`/admin-dashboard/users/create-user`}
                  passHref
                >
                  <Button
                    component="a"
                    startIcon={<PlusIcon fontSize="small" />}
                    variant="contained"
                  >
                    Add
                  </Button>
                </NextLink>
              </Grid>
            </Grid>
          </Box>
          <Card>
            <Tabs
              indicatorColor="primary"
              onChange={handleTabsChange}
              scrollButtons="auto"
              sx={{ px: 3 }}
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
            <Divider />
            <Box
              sx={{
                alignItems: 'center',
                display: 'flex',
                flexWrap: 'wrap',
                m: -1.5,
                p: 3
              }}
            >
              <Box
                component="form"
                onSubmit={handleQueryChange}
                sx={{
                  flexGrow: 1,
                  m: 1.5
                }}
              >
                <TextField
                  defaultValue=""
                  fullWidth
                  inputProps={{ ref: queryRef }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    )
                  }}
                  placeholder="Search users"
                />
              </Box>
            </Box>
            <UsersListTable
              users={users}
              usersCount={count}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
              limit={limit}
              page={page}
            />
          </Card>
        </Container>
      </Box>
    </>
  );
};

UserList.getLayout = (page) => (
  <DashboardLayout>
    {page}
  </DashboardLayout>
);

export default UserList;
