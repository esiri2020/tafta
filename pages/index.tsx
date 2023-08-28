import React from 'react'
import { MainLayout } from '../components/main-layout';
import Head from 'next/head';
import { HomeHero } from '../components/home/home-hero';


function Home() {
  return (
    <>
    <Head>
        <title>
          Application Portal
        </title>
    </Head>
    <main>
    <HomeHero />
    </main>
    </>
  )
}

Home.getLayout = (page: any) => (
    <MainLayout>
      {page}
    </MainLayout>
  );
  
export default Home;