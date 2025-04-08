import {hash} from 'bcryptjs';
import {formatISO} from 'date-fns';
import prisma from '../../../lib/prismadb';
import api from '../../../lib/axios.setup';
import {getToken} from 'next-auth/jwt';
import {NextApiRequest, NextApiResponse} from 'next';
import type {Cohort, RegistrationType, Role} from '@prisma/client';

// TODO: create user on thinkific
// TODO: add user to cohort group on thinkific

async function handler(req: NextApiRequest, res: NextApiResponse) {
  //Only POST mothod is accepted
  if (req.method === 'POST') {
    const token = await getToken({req});
    //Getting email and password from body
    const body = typeof req.body === 'object' ? req.body : JSON.parse(req.body);
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
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/gi;
    if (!email || !isEmail.test(email) || !password) {
      res.status(400).json({message: 'Invalid Data'});
      return;
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
        };

        console.log('Profile data being sent to Prisma:', profileData);

        const user = await prisma.user.create({
          data: {
            ...userData,
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
          },
        });
        let ref = undefined;
        if (referrer && user?.profile) {
          ref = await prisma.referrer.create({
            data: {
              profileId: user.profile.id,
              ...referrer,
            },
          });
        }
        return res.status(201).json({message: 'User created', ...user, ref});
      } else {
        return await prisma.$transaction(async tx => {
          const user = await tx.user.create({
            data: {
              email,
              password: await hash(password, 12),
              role,
              firstName,
              lastName,
              middleName: middleName || undefined,
              type: userType,
              userCohort: {
                create: cohortId
                  ? {
                      cohortId,
                    }
                  : undefined,
              },
            },
          });
          return res.status(201).json({message: 'User created', ...user});
        });
      }
    } catch (err) {
      console.error(err);
      return res.status(400).json({message: err.message});
    }
  } else {
    //Response for other than POST method
    res.status(400).json({message: 'Route not valid'});
  }
}

export default handler;
