import {useCallback, useEffect, useState} from 'react';
import NextLink from 'next/link';
import Head from 'next/head';
import {useRouter} from 'next/router';
import {Avatar, Box, Chip, Container, Link, Typography} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {DashboardLayout} from '../../../../components/dashboard/dashboard-layout';
import {ApplicantEditForm} from '../../../../components/dashboard/applicants/applicant-edit';
import {getInitials} from '../../../../utils/get-initials';
import {useGetApplicantQuery} from '../../../../services/api';
import {SplashScreen} from '../../../../components/splash-screen';

const ApplicantEdit = () => {
  const router = useRouter();
  const {id} = router.query;

  const {data, error, isLoading} = useGetApplicantQuery(id);

  if (isLoading) return <SplashScreen />;

  if (error) {
    return <div>Error</div>;
  }

  const {user: applicant} = data;
  if (!applicant) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Applicant Edit</title>
      </Head>
      <Box
        component='main'
        sx={{
          backgroundColor: 'background.default',
          flexGrow: 1,
          py: 8,
        }}>
        <Container maxWidth='md'>
          <Box sx={{ mb: 4 }}>
            <Link href="/admin-dashboard/applicants" passHref legacyBehavior style={{textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center'}}>
              <a style={{textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center'}}>Back to Applicants</a>
            </Link>
          </Box>
          <Box
            sx={{
              alignItems: 'center',
              display: 'flex',
              overflow: 'hidden',
            }}>
            <Avatar
              src={applicant.avatar}
              sx={{
                height: 64,
                mr: 2,
                width: 64,
              }}>
              {getInitials(`${applicant.firstName} ${applicant.lastName}`)}
            </Avatar>
            <div>
              <Typography noWrap variant='h4'>
                {`${applicant.firstName} ${applicant.lastName}`}
              </Typography>
              <Box
                sx={{
                  alignItems: 'center',
                  display: 'flex',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                <Typography variant='subtitle2'>user_id:</Typography>
                <Chip label={applicant.id} size='small' sx={{ml: 1}} />
              </Box>
            </div>
          </Box>
          <Box mt={3}>
            <ApplicantEditForm applicant={applicant} />
          </Box>
        </Container>
      </Box>
    </>
  );
};

ApplicantEdit.getLayout = page => <DashboardLayout>{page}</DashboardLayout>;

export default ApplicantEdit;
