import {MainLayout} from '../components/main-layout';
import Head from 'next/head';
import {Avatar, Box, Button, Grid, Container, Typography} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import {LoginScout} from '../components/home/login';
import {ReactElementLike, ReactNodeArray} from 'prop-types';
import {GetServerSidePropsContext} from 'next';
import {
  getSession,
  getProviders,
  getCsrfToken,
  ClientSafeProvider,
  LiteralUnion,
} from 'next-auth/react';
import {BuiltInProviderType} from 'next-auth/providers';

function LoginNew({
  providers,
  csrfToken,
}: {
  providers: Record<
    LiteralUnion<BuiltInProviderType, string>,
    ClientSafeProvider
  > | null;
  csrfToken: string | undefined;
}) {
  const theme = useTheme();

  return (
    <>
      <Head>
        <title>Login</title>
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
            <LoginScout providers={providers} csrfToken={csrfToken} />
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

LoginNew.getLayout = (
  page:
    | string
    | number
    | boolean
    | ReactElementLike
    | ReactNodeArray
    | null
    | undefined,
) => <MainLayout>{page}</MainLayout>;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getSession(context);

  if (session) {
    return {
      redirect: {destination: '/role'},
    };
  }

  return {
    props: {
      providers: await getProviders(),
      csrfToken: await getCsrfToken(context),
    },
  };
}

export default LoginNew;
