import {GetServerSideProps} from 'next';
import {getSession} from 'next-auth/react';
import Link from 'next/link';
import prisma from '../lib/prismadb';

const Role = () => {
  return (
    <Link href='/' passHref legacyBehavior>Go Back to Home</Link>
  );
};

/**
 * Check if user profile is complete and has necessary course selection
 */
async function validateUserRegistrationStatus(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        userCohort: {
          include: {
            enrollments: true,
            cohort: true
          }
        }
      }
    });

    if (!user) {
      return { isComplete: false, reason: 'User not found' };
    }

    // Check if profile exists
    if (!user.profile) {
      return { isComplete: false, reason: 'No profile found' };
    }

    const profile = user.profile;

    // Check essential profile fields for completion
    const requiredFields = [
      'phoneNumber',
      'gender', 
      'ageRange',
      'stateOfResidence',
      'educationLevel',
      'selectedCourseName', // Must have selected a course
      'selectedCourseId'
    ];

    const missingFields = requiredFields.filter(field => 
      !profile[field as keyof typeof profile] || 
      profile[field as keyof typeof profile] === ''
    );

    if (missingFields.length > 0) {
      return { 
        isComplete: false, 
        reason: `Missing required profile fields: ${missingFields.join(', ')}`,
        missingFields 
      };
    }

    // Check if user has been enrolled in any courses
    const hasEnrollments = user.userCohort.some(uc => 
      uc.enrollments && uc.enrollments.length > 0
    );

    if (!hasEnrollments) {
      return { 
        isComplete: false, 
        reason: 'No enrollments found - user needs to complete course enrollment' 
      };
    }

    // Check if user has active cohort
    const hasActiveCohort = user.userCohort.some(uc => 
      uc.cohort && uc.cohort.active
    );

    if (!hasActiveCohort) {
      return { 
        isComplete: false, 
        reason: 'No active cohort found' 
      };
    }

    return { isComplete: true, reason: 'Registration complete' };
  } catch (error) {
    console.error('Error validating user registration status:', error);
    return { isComplete: false, reason: 'Validation error' };
  }
}

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
      // Enhanced validation: Check profile completion and enrollment status
      if (!session?.userData?.userId) {
        return {
          redirect: {
            permanent: false,
            destination: '/login',
          },
        };
      }

      // Validate registration completion
      const validationResult = await validateUserRegistrationStatus(session.userData.userId);
      
      console.log(`🔍 User ${session.userData.email} validation result:`, validationResult);

      if (validationResult.isComplete) {
        // User has complete profile and enrollments - redirect to dashboard
        return {
          redirect: {
            permanent: false,
            destination: `/dashboard`,
          },
        };
      } else {
        // User needs to complete registration - redirect to step 3 (Personal Information)
        console.log(`⚠️ User ${session.userData.email} needs to complete registration: ${validationResult.reason}`);
        return {
          redirect: {
            permanent: false,
            destination: `/register-new?userId=${session.userData.userId}&step=3`,
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
