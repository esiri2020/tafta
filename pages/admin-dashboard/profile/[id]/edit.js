import { useCallback, useEffect, useState } from 'react';
import NextLink from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router'
import { Avatar, Box, Chip, Container, Link, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { DashboardLayout } from '../../../../components/dashboard/dashboard-layout';
import { UserEditForm } from '../../../../components/dashboard/profile/user-edit-form';
import { getInitials } from '../../../../utils/get-initials';
import { useGetUserQuery } from '../../../../services/api'
import { SplashScreen } from '../../../../components/splash-screen';

const UserEdit = () => {
  const router = useRouter()
  const { id } = router.query

  const { data, error, isLoading } = useGetUserQuery(id)

  if (isLoading) return (<SplashScreen />)

  if (error) {
    return (<div>Error</div>)
  }

  const { user: user } = data
  if (!user) {
    return null;
  }

  return (
    <>
      <Head>
        <title>
          User Edit
        </title>
      </Head>
      <Box
        component="main"
        sx={{
          backgroundColor: 'background.default',
          flexGrow: 1,
          py: 8
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ mb: 4 }}>
            <Link href="/admin-dashboard/users" passHref legacyBehavior style={{textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center'}}>
              <a style={{textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center'}}>Back to Users</a>
            </Link>
          </Box>
          <Box
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
              <Typography
                noWrap
                variant="h4"
              >
                {`${user.firstName} ${user.lastName}`}
              </Typography>
              <Box
                sx={{
                  alignItems: 'center',
                  display: 'flex',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                <Typography variant="subtitle2">
                  user_id:
                </Typography>
                <Chip
                  label={user.id}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Box>
            </div>
          </Box>
          <Box mt={3}>
            <UserEditForm user={user} />
          </Box>
        </Container>
      </Box>
    </>
  );
};

UserEdit.getLayout = (page) => (
  <DashboardLayout>
    {page}
  </DashboardLayout>
);

export default UserEdit;
