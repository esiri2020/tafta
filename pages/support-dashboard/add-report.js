import React from 'react'
import { DashboardLayout } from '../../components/dashboard/dashboard-layout';
import { SplashScreen } from '../../components/splash-screen';
import { useGetDashboardDataQuery } from '../../services/api'
import Head from 'next/head';

function supportAddReport() {
    const { data, error, isLoading } = useGetDashboardDataQuery('')
    if (isLoading) {
      return (<SplashScreen />)
    }
    if (error) return (<div>An error occured.</div>)


  return (
    <>
    <Head>
        <title>
          Support add Report
        </title>
    </Head>
    <div style={{padding:"20px"}}>Support Report</div>
    </>
  )
}

supportAddReport.getLayout = (page) => (
    <DashboardLayout>
      {page}
    </DashboardLayout>
  );
  
export default supportAddReport;