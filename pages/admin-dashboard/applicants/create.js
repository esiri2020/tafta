import NextLink from 'next/link';
import Head from 'next/head';
import { Box, Container, Link, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { DashboardLayout } from '../../../components/dashboard/dashboard-layout';
import { ApplicantCreateForm } from '../../../components/dashboard/applicants/applicants-create-form';

const CreateApplicant = () => {
  return (
    <>
      <Head>
        <title>
          Create Applicant
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
              href="/admin-dashboard/applicants"
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
                  Applicants
                </Typography>
              </Link>
            </NextLink>
          </Box>
          <Box mt={3}>
            <ApplicantCreateForm />
          </Box>
        </Container>
      </Box>
    </>
  );
};

CreateApplicant.getLayout = (page) => (
  <DashboardLayout>
    {page}
  </DashboardLayout>
);

export default CreateApplicant;
