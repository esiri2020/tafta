import {GetServerSideProps} from 'next';
import {getSession} from 'next-auth/react';
import Link from 'next/link';

const Role = () => {
  return (
    <Link href='/' passHref legacyBehavior>Go Back to Home</Link>
  );
};
export const getServerSideProps: GetServerSideProps = async context => {
  const session: any = await getSession(context);
  const role = session?.userData?.role;

  switch (role) {
    case 'SUPERADMIN':
    case 'ADMIN':
      return {
        redirect: {
          permanent: false,
          destination: '/admin-dashboard',
        },
      };
    case 'SUPPORT':
    case 'GUEST':
      return {
        redirect: {
          permanent: false,
          destination: '/admin-dashboard',
        },
      };
    case 'MOBILIZER':
      return {
        redirect: {
          permanent: false,
          destination: '/mobilizer-dashboard',
        },
      };
    case 'APPLICANT':
      return session?.userData?.profile
        ? {
            redirect: {
              permanent: false,
              destination: `/dashboard`,
            },
          }
        : {
            redirect: {
              permanent: false,
              destination: `/register-new?userId=${session?.userData?.userId}&step=3`,
            },
          };
    default:
      return {
        redirect: {
          permanent: false,
          destination: '/login',
        },
      };
  }
};

export default Role;
