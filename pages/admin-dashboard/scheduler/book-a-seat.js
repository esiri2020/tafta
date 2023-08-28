import React from 'react'
import { DashboardLayout } from '../../../components/dashboard/dashboard-layout';
import { SplashScreen } from '../../../components/splash-screen';
import { useGetDashboardDataQuery } from '../../../services/api'
import Head from 'next/head';

function bookaSeat() {
    const { data, error, isLoading } = useGetDashboardDataQuery('')
    if (isLoading) {
      return (<SplashScreen />)
    }
    if (error) return (<div>An error occured.</div>)


  return (
    <>
    <Head>
        <title>
          Book a Seat
        </title>
    </Head>
    <div style={{padding:"20px"}}>Book a Seat</div>
    </>
  )
}

bookaSeat.getLayout = (page) => (
    <DashboardLayout>
      {page}
    </DashboardLayout>
  );
  
export default bookaSeat;