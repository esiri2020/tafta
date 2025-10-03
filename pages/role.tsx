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
    case 'APPLICANT': {
      // If the user does not have a verified profile, redirect to verify email
      if (!session?.userData?.emailVerified) {
        return {
          redirect: {
            permanent: false,
            destination: `/register-new?step=2`,
          },
        };
      }
      // If the user has a verified profile but no enrollment, redirect to personal information
      const enrollments = session?.userData?.enrollments || [];
      if (Array.isArray(enrollments) && enrollments.length === 0) {
        return {
          redirect: {
            permanent: false,
            destination: `/register-new?step=3`,
          },
        };
      }
      // If the user has a verified profile and enrollments, redirect to TAFTA portal
      return {
        redirect: {
          permanent: false,
          destination: `https://portal.terraacademyforarts.com/users/sign_in`,
        },
      };
    }
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
