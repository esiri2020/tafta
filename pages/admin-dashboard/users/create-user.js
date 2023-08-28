import NextLink from 'next/link';
import Head from 'next/head';
import { Box, Container, Link, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { DashboardLayout } from '../../../components/dashboard/dashboard-layout';
import { UserCreateForm } from '../../../components/dashboard/users/user-create-form';


const CreateUser = () => {
  return (
    <>
      <Head>
        <title>
          Create User
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
            <NextLink
              href="/admin-dashboard/users"
              passHref
            >
              <Link
                color="textPrimary"
                component="a"
                sx={{
                  alignItems: 'center',
                  display: 'flex'
                }}
              >
                <ArrowBackIcon
                  fontSize="small"
                  sx={{ mr: 1 }}
                />
                <Typography variant="subtitle2">
                  Users
                </Typography>
              </Link>
            </NextLink>
          </Box>
          <Box mt={3}>
            <UserCreateForm />
          </Box>
        </Container>
      </Box>
    </>
  );
};

CreateUser.getLayout = (page) => (
  <DashboardLayout>
    {page}
  </DashboardLayout>
);

export default CreateUser;
