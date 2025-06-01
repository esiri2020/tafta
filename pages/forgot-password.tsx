import React from 'react';
import { MainLayout } from '../components/main-layout';
import Head from 'next/head';
import { Avatar, Box, Button, Grid, Container, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ForgotPassword from '../components/home/forgot-password'


export default function forgotPassword() {

  return (
    <>
    <Head>
        <title>
          Forgot Password
        </title>
    </Head>
    <Box
      sx={{
        justifyContent: 'center',
        display: 'flex',
        alignItems: "center",

    }}>
      <Grid           
        container
        justifyContent="center"
        maxWidth='lg'
        sx={{
          justifyContent: 'center',
          display: 'flex',
          alignItems: "center",

      }}>

        <Grid
          item
          md={6}
          sm={8}
          xs={12}
          
          sx={{
            width: '100%',
            height: '100vh',
            objectFit:"cover",
            display: { xs: 'block', sm: 'none', md: 'block' } 
          }}>
          <img
            alt="header image"
            style={{width:"100%", height:"100vh", }}
            src="/static/images/tafta-login.png"
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

            <ForgotPassword />

        </Grid>
      </Grid>
    </Box>

    </>
  )
}

forgotPassword.getLayout = (page: any) => (
    <MainLayout>
      {page}
    </MainLayout>
  );