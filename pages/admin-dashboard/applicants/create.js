import NextLink from 'next/link';
import Head from 'next/head';
import {Box, Container, Link, Typography} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {DashboardLayout} from '../../../components/dashboard/dashboard-layout';
import ApplicantCreateForm from '../../../components/dashboard/applicants/applicant';

const CreateApplicant = () => {
  return (
    <>
      <Head>
        <title>Create Applicant</title>
      </Head>
      <Box
        component='main'
        sx={{
          backgroundColor: 'background.default',
          flexGrow: 1,
          py: 8,
        }}>
        <Container maxWidth='md'>
          <Box sx={{mb: 4}}>
            <Link href='/admin-dashboard/applicants' passHref legacyBehavior style={{textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center'}}>
              <a style={{textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center'}}>Back to Applicants</a>
            </Link>
          </Box>
          <Box mt={3}>
            <ApplicantCreateForm />
          </Box>
        </Container>
      </Box>
    </>
  );
};

CreateApplicant.getLayout = page => <DashboardLayout>{page}</DashboardLayout>;

export default CreateApplicant;
