import {hash} from 'bcryptjs';
import {formatISO} from 'date-fns';
import prisma from '../../../lib/prismadb';
import api from '../../../lib/axios.setup';
import {getToken} from 'next-auth/jwt';
import {NextApiRequest, NextApiResponse} from 'next';
import type {Cohort, RegistrationType, Role} from '@prisma/client';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    //Only POST mothod is accepted
    if (req.method === 'POST') {
    const token = await getToken({req});
    //Getting email and password from body
    const body = typeof req.body === 'object' ? req.body : JSON.parse(req.body);
    
    console.log('📥 Signup request body:', {
      hasBody: !!body,
      bodyKeys: Object.keys(body || {}),
      body: body
    });
    let {
      email,
      password,
      firstName,
      lastName,
      middleName,
      type,
      registrationType,
      cohortId,
      locationId,
      profile,
      referrer,
      businessName,
    }: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      middleName: string;
      type?: string;
      registrationType?: string;
      cohortId: string;
      locationId?: string;
      profile?: any;
      referrer?: any;
      businessName: string;
    } = body;

    let userType: any = undefined;
    if (registrationType) {
      // Map 'business' to 'ENTERPRISE' for compatibility with the enum
      if (registrationType.toLowerCase() === 'business') {
        userType = 'ENTERPRISE';
      } else {
        // Convert string to uppercase for enum matching
        userType = registrationType.toUpperCase();
      }
    } else if (type) {
      // Map 'business' to 'ENTERPRISE' for compatibility with the enum
      if (type.toLowerCase() === 'business') {
        userType = 'ENTERPRISE';
      } else {
        userType = type.toUpperCase();
      }
    }

    let role: Role = 'APPLICANT';
    if (token && token.userData?.role === 'SUPERADMIN') {
      role = body.role ? body.role : 'APPLICANT';
    }
    //Validate
    const isEmail =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/i;
    
    console.log('🔍 Signup validation:', {
      email: email ? 'present' : 'missing',
      password: password ? 'present' : 'missing',
      firstName: firstName ? 'present' : 'missing',
      lastName: lastName ? 'present' : 'missing',
      cohortId: cohortId ? 'present' : 'missing',
      emailValid: email ? isEmail.test(email) : false,
      emailValue: email,
      firstNameValue: firstName,
      lastNameValue: lastName,
      cohortIdValue: cohortId
    });
    
    const emailValid = email ? isEmail.test(email) : false;
    const hasEmail = !!email;
    const hasPassword = !!password;
    
    console.log('🔍 Detailed validation check:', {
      hasEmail,
      hasPassword,
      emailValid,
      email: email,
      password: password ? 'present' : 'missing'
    });
    
    if (!hasEmail || !emailValid || !hasPassword) {
      console.error('❌ Signup validation failed:', {
        hasEmail,
        emailValid,
        hasPassword,
        email: email,
        password: password ? 'present' : 'missing'
      });
      res.status(400).json({message: 'Invalid Data'});
      return;
    }
    
    // Additional validation for required fields
    if (!firstName || !lastName) {
      console.error('❌ Missing required fields:', {
        firstName: firstName ? 'present' : 'missing',
        lastName: lastName ? 'present' : 'missing'
      });
      res.status(400).json({message: 'First name and last name are required'});
      return;
    }
    
    // Validate cohortId - make it optional for now to debug
    if (!cohortId) {
      console.warn('⚠️ Missing cohortId, continuing without cohort assignment:', {
        cohortId: cohortId ? 'present' : 'missing',
        cohortIdValue: cohortId
      });
      // Don't return error, just continue without cohort
    }
    email = email.toLowerCase();
    //Check existing
    const checkExisting = await prisma.user.findUnique({
      where: {email: email},
    });

    //Send error response if duplicate user is found
    if (checkExisting) {
      res.status(422).json({message: 'User already exists'});
      return;
    }
    let cohort: Cohort | null = null;
    if (cohortId) {
      cohort = await prisma.cohort.findUnique({
        where: {
          id: cohortId,
        },
      });
      if (!cohort) {
        return res.status(404).send({message: 'Invalid cohort Id'});
      }
    }
    try {
      // Log incoming values
      console.log('Request values:', {
        middleName: middleName,
        registrationType: registrationType,
        type: type,
      });

      if (profile) {
        if (profile.dob) {
          profile.dob = formatISO(Date.parse(profile.dob));
        }

        // Extract course-related fields from profile
        const {
          selectedCourse,
          selectedCourseName,
          selectedCourseId,
          cohortId: profileCohortId,
          ...otherProfileFields
        } = profile;

        console.log('Profile fields:', {
          selectedCourse,
          selectedCourseName,
          selectedCourseId,
          profileCohortId,
          otherProfileFields,
        });

        // Create base user data
        const userData = {
          email,
          firstName,
          lastName,
          middleName: middleName || undefined,
          type: userType as RegistrationType,
          role,
          password: await hash(password, 12),
        };

        // Create profile data
        const profileData = {
          ...otherProfileFields,
          ...(selectedCourse && {selectedCourse}),
          ...(selectedCourseName && {selectedCourseName}),
          ...(selectedCourseId && {selectedCourseId}),
          cohortId: profileCohortId || cohortId || '',
          // Note: Referrer information is stored in the separate Referrer table, not in Profile
        };

        console.log('Profile data being sent to Prisma:', profileData);

        // Create Thinkific user first
        let thinkificUserId = null;
        try {
          console.log('Creating Thinkific user with:', { firstName, lastName, email });
          const thinkificUser = await api.post("/users", {
            first_name: firstName,
            last_name: lastName,
            email: email,
            password: password, // Use plain text password for Thinkific
            skip_custom_fields_validation: true,
            send_welcome_email: true,
          });
          thinkificUserId = thinkificUser.data.id.toString();
          console.log('✅ Thinkific user created successfully:', thinkificUserId);
        } catch (thinkificError: any) {
          console.error('❌ Failed to create Thinkific user:', thinkificError);
          console.error('Thinkific error details:', {
            status: thinkificError.response?.status,
            data: thinkificError.response?.data,
            message: thinkificError.message
          });
          // Continue with local user creation even if Thinkific fails
        }

        const user = await prisma.user.create({
          data: {
            ...userData,
            thinkific_user_id: thinkificUserId,
            profile: {
              create: profileData,
            },
            userCohort: cohortId
              ? {
                  create: {
                    cohortId,
                  },
                }
              : undefined,
          },
          include: {
            profile: true,
            userCohort: {
              include: {
                enrollments: true,
              },
            },
          },
        });

        // If a referrer was provided, update the mobilizer's referral counts if they're registered
        if (referrer?.referrer_fullName) {
          // Update the mobilizer's referral counts if they're registered
          await prisma.mobilizer.updateMany({
            where: {
              code: referrer.referrer_fullName,
            },
            data: {
              totalReferrals: {
                increment: 1,
              },
              activeReferrals: {
                increment: 1,
              },
            },
          });
        }

        // If Thinkific user was created and cohort exists, add to group
        if (thinkificUserId && cohort) {
          try {
            await api.post('/group_users', {
              group_names: [cohort.name],
              user_id: thinkificUserId
            });
            console.log('User added to Thinkific group:', cohort.name);
          } catch (groupError) {
            console.error('Failed to add user to Thinkific group:', groupError);
          }
        }

        let ref = undefined;
        if (referrer && user?.profile) {
          ref = await prisma.referrer.create({
            data: {
              profileId: user.profile.id,
              ...referrer,
            },
          });
        }
        // Log enrollment creation
        console.log('🔍 User created with enrollments:', {
          userId: user.id,
          userEmail: user.email,
          userCohort: user.userCohort?.map(uc => ({
            id: uc.id,
            cohortId: uc.cohortId,
            enrollments: uc.enrollments?.map(enrollment => ({
              uid: enrollment.uid,
              course_id: enrollment.course_id?.toString(),
              course_name: enrollment.course_name,
              enrolled: enrollment.enrolled,
            }))
          }))
        });
        
        // Convert BigInt values to strings for JSON serialization
        const serializedUser = {
          ...user,
          userCohort: user.userCohort?.map(uc => ({
            ...uc,
            enrollments: uc.enrollments?.map(enrollment => ({
              ...enrollment,
              course_id: enrollment.course_id?.toString(),
              id: enrollment.id?.toString(),
              user_id: enrollment.user_id?.toString(),
            }))
          }))
        };
        
        return res.status(201).json({message: 'User created', ...serializedUser, ref});
      } else {
        return await prisma.$transaction(async tx => {
          // Create Thinkific user first
          let thinkificUserId = null;
          try {
            console.log('Creating Thinkific user with:', { firstName, lastName, email });
            const thinkificUser = await api.post("/users", {
              first_name: firstName,
              last_name: lastName,
              email: email,
              password: password, // Use plain text password for Thinkific
              skip_custom_fields_validation: true,
              send_welcome_email: true,
            });
            thinkificUserId = thinkificUser.data.id.toString();
            console.log('✅ Thinkific user created successfully:', thinkificUserId);
          } catch (thinkificError: any) {
            console.error('❌ Failed to create Thinkific user:', thinkificError);
            console.error('Thinkific error details:', {
              status: thinkificError.response?.status,
              data: thinkificError.response?.data,
              message: thinkificError.message
            });
            // Continue with local user creation even if Thinkific fails
          }

          const user = await tx.user.create({
            data: {
              email,
              password: await hash(password, 12),
              role,
              firstName,
              lastName,
              middleName: middleName || undefined,
              type: userType,
              thinkific_user_id: thinkificUserId,
              userCohort: {
                create: cohortId
                  ? {
                      cohortId,
                    }
                  : undefined,
              },
            },
            include: {
              userCohort: {
                include: {
                  enrollments: true,
                },
              },
            },
          });

          // If Thinkific user was created and cohort exists, add to group
          if (thinkificUserId && cohort) {
            try {
              await api.post('/group_users', {
                group_names: [cohort.name],
                user_id: thinkificUserId
              });
              console.log('User added to Thinkific group:', cohort.name);
            } catch (groupError) {
              console.error('Failed to add user to Thinkific group:', groupError);
            }
          }

          // Log enrollment creation
          console.log('🔍 User created with enrollments (transaction):', {
            userId: user.id,
            userEmail: user.email,
            userCohort: user.userCohort?.map(uc => ({
              id: uc.id,
              cohortId: uc.cohortId,
              enrollments: uc.enrollments?.map(enrollment => ({
                uid: enrollment.uid,
                course_id: enrollment.course_id?.toString(),
                course_name: enrollment.course_name,
                enrolled: enrollment.enrolled,
              }))
            }))
          });
          
          // Convert BigInt values to strings for JSON serialization
          const serializedUser = {
            ...user,
            userCohort: user.userCohort?.map(uc => ({
              ...uc,
              enrollments: uc.enrollments?.map(enrollment => ({
                ...enrollment,
                course_id: enrollment.course_id?.toString(),
                id: enrollment.id?.toString(),
                user_id: enrollment.user_id?.toString(),
              }))
            }))
          };
          
          return res.status(201).json({message: 'User created', ...serializedUser});
        });
      }
    } catch (err) {
      console.error('❌ Signup API error:', err);
      console.error('❌ Error details:', {
        message: (err as any)?.message,
        stack: (err as any)?.stack,
        name: (err as any)?.name,
        err: err
      });
      if (err instanceof Error) {
        return res.status(400).json({message: err.message});
      }
      return res.status(400).json({message: 'An error occurred'});
    }
  } else {
    //Response for other than POST method
    res.status(400).json({message: 'Route not valid'});
  }
  } catch (outerErr) {
    console.error('❌ Outer signup API error:', outerErr);
    console.error('❌ Outer error details:', {
      message: (outerErr as any)?.message,
      stack: (outerErr as any)?.stack,
      name: (outerErr as any)?.name,
      err: outerErr
    });
    return res.status(500).json({message: 'Internal server error'});
  }
}

export default handler;
