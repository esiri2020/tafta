import {useEffect} from 'react';
import {MainLayout} from '../components/main-layout';
import Head from 'next/head';
import {Box, Grid, Container, Typography} from '@mui/material';
import {useSession} from 'next-auth/react';
import {useEditApplicantMutation} from '../services/api';
import toast from 'react-hot-toast';
import {useRouter} from 'next/router';

export default function VerifyEmailNew() {
  const {data: session} = useSession();
  const router = useRouter();
  const [editApplicant, result] = useEditApplicantMutation();
  useEffect(() => {
    if ((session as any)?.userData?.userId) {
      const promise = new Promise(async (resolve, reject) => {
        let req: any = await editApplicant({
          id: (session as any)?.userData?.userId,
          body: {emailVerified: new Date()},
        });
        if (req?.data?.message === 'Applicant Updated') resolve(req);
        else reject(req);
      });
      toast
        .promise(promise, {
          loading: 'Loading...',
          success: <b>Email Verified!</b>,
          error: err => {
            console.error(err);
            if (err.error?.status === 401)
              return <b>Please login with your registered credentials.</b>;
            return <b>An error occurred.</b>;
          },
        })
        .then(res => {
          router.replace({
            pathname: '/register-new',
            query: {
              step: 3,
            },
          });
        })
        .catch(err => {
          console.error(err);
        });
    }
  }, [session]);

  return (
    <>
      <Head>
        <title>Verify Email (New)</title>
      </Head>
      <Box
        sx={{
          justifyContent: 'center',
          display: 'flex',
          alignItems: 'center',
        }}>
        <Grid
          container
          justifyContent='center'
          maxWidth='lg'
          sx={{
            justifyContent: 'center',
            display: 'flex',
            alignItems: 'center',
          }}>
          <Grid
            item
            md={6}
            sm={8}
            xs={12}
            sx={{
              width: '100%',
              height: '100vh',
              objectFit: 'cover',
              display: {xs: 'block', sm: 'none', md: 'block'},
            }}>
            <img
              alt='header image'
              style={{width: '100%', height: '100vh'}}
              src='/static/images/tafta-login.png'
            />
          </Grid>
          <Grid
            item
            md={6}
            sm={8}
            xs={12}
            sx={{
              justifyContent: 'center',
              display: 'flex',
              padding: 5,
            }}>
            <Box
              sx={{
                p: 3,
                textAlign: 'center',
              }}>
              <Typography variant='h4' sx={{mb: 2}}>
                Verify Email (New)
              </Typography>
              <Typography>
                Thanks for confirming your email! You can now continue with your
                registration.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

VerifyEmailNew.getLayout = (page: any) => <MainLayout>{page}</MainLayout>;
