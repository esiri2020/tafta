import { getToken } from 'next-auth/jwt';
import api from '../../../lib/axios.setup';
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prismadb';

// Helper to safely serialize BigInt values in JSON
function safeJson(res: NextApiResponse, data: any, status: number = 200) {
  return res.status(status).send(
    JSON.stringify(data, (_key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = await getToken({ req });
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const body = typeof req.body === 'object' ? req.body : JSON.parse(req.body);
  const { uid, user_email, course_id, course_name, userCohortId } = body;

  // If UID is not provided, attempt to create a new enrollment
  if (!uid) {
    if (!user_email || !course_id || !course_name || !userCohortId) {
      return safeJson(res, { error: 'Missing required fields for new enrollment (user_email, course_id, course_name, userCohortId)' }, 400);
    }
    try {
      // Find user and cohort
      const user = await prisma.user.findUnique({
        where: { email: user_email.toLowerCase() },
        include: {
          userCohort: true,
        },
      });
      if (!user) {
        return safeJson(res, { error: 'User not found' }, 404);
      }
      // Create new enrollment
      const enrollment = await prisma.enrollment.create({
        data: {
          enrolled: false,
          course_id: BigInt(course_id),
          course_name,
          userCohort: { connect: { id: userCohortId } },
        },
      });
      // Now, recursively call the handler with the new UID to reuse the activation logic
      req.body = { uid: enrollment.uid };
      return await handler(req, res);
    } catch (err: any) {
      console.error('Retry enrollment (create) error:', err);
      let details = '';
      if (err && err.message) {
        details = err.message;
      } else if (typeof err === 'string') {
        details = err;
      } else {
        details = 'Unknown error';
      }
      return safeJson(res, { error: 'Failed to create and activate enrollment', details }, 500);
    }
  }

  try {
    // 1. Find the enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: { uid },
      include: {
        userCohort: {
          include: {
            user: true,
            cohort: true,
          },
        },
      },
    });
    if (!enrollment) {
      return safeJson(res, { error: 'Enrollment not found' }, 404);
    }

    // 2. Check if already activated
    if (enrollment.activated_at && enrollment.enrolled) {
      return safeJson(res, { message: 'Enrollment already active' }, 200);
    }

    const user = enrollment.userCohort?.user;
    if (!user || !user.thinkific_user_id) {
      return safeJson(res, { error: 'User or Thinkific user ID missing' }, 400);
    }

    // 3. Attempt to re-activate with LMS
    try {
      const thinkific_data = {
        course_id: course_id,
        user_id: user.thinkific_user_id,
        activated_at: new Date().toISOString(),
      };
      const response = await api.post('/enrollments', thinkific_data);
      if (response.status === 201) {
        const { data: enrollment_data } = response;
        let { user_email, user_name, ...data } = enrollment_data;
        if (data.percentage_completed) {
          data.percentage_completed = parseFloat(data.percentage_completed);
        }
        // Update local DB
        await prisma.enrollment.update({
          where: { uid },
          data: {
            enrolled: true,
            activated_at: data.activated_at ? new Date(data.activated_at) : new Date(),
            ...data,
          },
        });
        return safeJson(res, { message: 'Enrollment re-activated successfully' }, 200);
      } else {
        return safeJson(res, { error: 'LMS did not accept re-activation', details: response.data }, 400);
      }
    } catch (err: any) {
      // If already enrolled in LMS, fetch and update local DB
      if (err.response && err.response.status === 400 && err.response.data && err.response.data.errors) {
        const alreadyEnrolled = err.response.data.errors.find((e: any) => e.code === 'already_enrolled');
        if (alreadyEnrolled) {
          // Optionally, fetch enrollment status from LMS and update local DB
          await prisma.enrollment.update({
            where: { uid },
            data: {
              enrolled: true,
              activated_at: new Date(), // fallback, ideally fetch real date
            },
          });
          return safeJson(res, { message: 'User already enrolled in LMS. Local DB updated.' }, 200);
        }
      }
      // Improved error serialization: include full Thinkific error response if available
      console.error('Retry enrollment error:', err);
      let details = '';
      if (err && err.response && err.response.data) {
        details = err.response.data;
      } else if (err && err.message) {
        details = err.message;
      } else if (typeof err === 'string') {
        details = err;
      } else {
        details = 'Unknown error';
      }
      return safeJson(res, { error: 'Failed to re-activate enrollment', details }, 500);
    }
  } catch (error: any) {
    return safeJson(res, { error: 'Server error', details: error.message }, 500);
  }
} 