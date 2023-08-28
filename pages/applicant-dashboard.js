import React from 'react'
import { MainLayout } from '../components/main-layout';
import Head from 'next/head';

function applicantDashboard() {
  return (
    <>
    <Head>
        <title>
          Applicant Dashboard
        </title>
    </Head>
    <div style={{padding:"20px"}}>Applicant Dashboard</div>
    </>
  )
}

applicantDashboard.getLayout = (page) => (
    <MainLayout>
      {page}
    </MainLayout>
  );
  
export default applicantDashboard;