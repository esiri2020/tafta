import {useEffect} from 'react';
import {useRouter} from 'next/router';
import {SplashScreen} from '../../../components/splash-screen';

const AssessmentIndexPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin-dashboard/assessment/overview');
  }, [router]);

  return <SplashScreen />;
};

export default AssessmentIndexPage;
