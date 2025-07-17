import Link from 'next/link';
import Head from 'next/head';
import { Box, Breadcrumbs, Container, Typography } from '@mui/material';
import { DashboardLayout } from '../../../components/dashboard/dashboard-layout';
import { CreateReport } from '../../../components/dashboard/reports/create-report';

const ReportCreate = () => {

  return (
    <>
      <Head>
        <title>
          Dashboard: Create Report
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
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4">
              Create a new report
            </Typography>
            <Breadcrumbs
              separator="/"
              sx={{ mt: 1 }}
            >
              <Link href="/admin-dashboard/reports" passHref legacyBehavior style={{textDecoration: 'none'}}>
                <a style={{textDecoration: 'none'}}>Back to Reports</a>
              </Link>
              <Typography
                color="textSecondary"
                variant="subtitle2"
              >
                Reports
              </Typography>
            </Breadcrumbs>
          </Box>
          <CreateReport />
        </Container>
      </Box>
    </>
  );
};

ReportCreate.getLayout = (page) => (
  <DashboardLayout>
    {page}
  </DashboardLayout>
);

export default ReportCreate;
