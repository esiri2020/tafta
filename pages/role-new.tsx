import {getSession} from 'next-auth/react';
import {GetServerSideProps} from 'next';
import Link from 'next/link';

const RoleNew = (props: any) => {
  return (
    <Link href='/'>
      <a>Go Back to Home</a>
    </Link>
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
          destination: '/admin-dashboard-new',
        },
      };
    case 'SUPPORT':
    case 'GUEST':
      return {
        redirect: {
          permanent: false,
          destination: '/admin-dashboard-new',
        },
      };
    case 'APPLICANT':
      return session?.userData?.profile
        ? {
            redirect: {
              permanent: false,
              destination: `/dashboard-new`,
            },
          }
        : {
            redirect: {
              permanent: false,
              destination: `/register-new?userId=${session?.userData?.userId}`,
            },
          };
    default:
      return {
        redirect: {
          permanent: false,
          destination: '/login-new',
        },
      };
  }
};

export default RoleNew;
