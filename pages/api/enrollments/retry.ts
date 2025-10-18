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

// Automatic retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 2000, // 2 seconds
  exponentialBackoff: true,
};

// Sleep function for delays
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Automatic retry function for Thinkific API calls
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  operationName: string,
  maxRetries: number = RETRY_CONFIG.maxRetries
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 ${operationName} - Attempt ${attempt}/${maxRetries}`);
      const result = await operation();
      console.log(`✅ ${operationName} - Success on attempt ${attempt}`);
      return result;
    } catch (error: any) {
      lastError = error;
      console.log(`❌ ${operationName} - Attempt ${attempt} failed:`, error.message);
      
      // Don't retry on certain errors
      if (error.response?.status === 422) {
        console.log(`🚫 ${operationName} - Not retrying 422 error (user already exists)`);
        throw error;
      }
      
      if (error.response?.status === 404) {
        console.log(`🚫 ${operationName} - Not retrying 404 error (resource not found)`);
        throw error;
      }
      
      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        console.log(`💥 ${operationName} - All ${maxRetries} attempts failed`);
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const delay = RETRY_CONFIG.exponentialBackoff 
        ? RETRY_CONFIG.retryDelay * Math.pow(2, attempt - 1)
        : RETRY_CONFIG.retryDelay;
      
      console.log(`⏳ ${operationName} - Waiting ${delay}ms before retry...`);
      await sleep(delay);
    }
  }
  
  throw lastError;
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
    if (!user) {
      return safeJson(res, { error: 'User not found' }, 400);
    }

    // If Thinkific user ID is missing, create it now with automatic retry
    let thinkificUserId = user.thinkific_user_id;
    if (!thinkificUserId) {
      console.log('⚠️ Thinkific user ID missing, creating now with automatic retry...');
      
      try {
        const taftaAPIData = {
          email: user.email,
          first_name: user.firstName,
          last_name: user.lastName,
          skip_custom_fields_validation: true,
          send_welcome_email: false,
        };
        
        // Use automatic retry for user creation
        const response = await retryWithBackoff(
          () => api.post('/users', taftaAPIData),
          'Create Thinkific User'
        );
        
        if (response?.status === 201) {
          thinkificUserId = response.data.id;
          
          // Update user with Thinkific ID
          await prisma.user.update({
            where: { id: user.id },
            data: { thinkific_user_id: thinkificUserId },
          });
          
          console.log(`✅ Thinkific user created with ID: ${thinkificUserId}`);
          
          // Add to cohort group if available (with retry)
          if (enrollment.userCohort?.cohort) {
            try {
              await retryWithBackoff(
                () => api.post('/group_users', {
                  group_names: [enrollment.userCohort.cohort.name],
                  user_id: thinkificUserId,
                }),
                'Add User to Cohort Group'
              );
              console.log(`✅ Added to cohort group: ${enrollment.userCohort.cohort.name}`);
            } catch (groupError) {
              console.error('Failed to add to group (non-fatal):', groupError);
            }
          }
        }
      } catch (error: any) {
        console.error('❌ Failed to create Thinkific user after retries:', error);
        
        // Check if user already exists in Thinkific (with retry)
        if (error.response?.status === 422) {
          try {
            const searchResponse = await retryWithBackoff(
              () => api.get(`/users?query[email]=${user.email}`),
              'Search Existing Thinkific User'
            );
            
            if (searchResponse.data.items && searchResponse.data.items.length > 0) {
              thinkificUserId = searchResponse.data.items[0].id;
              
              // Update DB with found ID
              await prisma.user.update({
                where: { id: user.id },
                data: { thinkific_user_id: thinkificUserId },
              });
              
              console.log(`✅ Found existing Thinkific user with ID: ${thinkificUserId}`);
            }
          } catch (searchError) {
            console.error('Failed to find existing user after retries:', searchError);
          }
        }
        
        // If still no Thinkific user ID, fail gracefully
        if (!thinkificUserId) {
          console.error('❌ CRITICAL: Failed to create/find Thinkific user after all retries');
          console.error('❌ User:', { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName });
          console.error('❌ Enrollment:', { uid: enrollment.uid, course_id: enrollment.course_id, course_name: enrollment.course_name });
          console.error('❌ Final error:', { message: error.message, response: error.response?.data });
          
          return safeJson(res, { 
            error: 'Failed to create Thinkific user after automatic retries. Please contact support.',
            details: error.message,
            userEmail: user.email,
            enrollmentUid: enrollment.uid,
            retriesAttempted: RETRY_CONFIG.maxRetries
          }, 500);
        }
      }
    }

    // 3. Attempt to re-activate with LMS using automatic retry
    try {
      console.log('🔍 Enrollment data for Thinkific API:', {
        enrollment_uid: enrollment.uid,
        course_id: enrollment.course_id,
        course_name: enrollment.course_name,
        thinkific_user_id: thinkificUserId,
        user_email: user.email,
        enrolled: enrollment.enrolled,
        activated_at: enrollment.activated_at
      });
      
      const thinkific_data = {
        course_id: enrollment.course_id.toString(),
        user_id: thinkificUserId,
        activated_at: new Date().toISOString(),
      };
      
      console.log('📤 Sending to Thinkific API with automatic retry...');
      
      // Use automatic retry for enrollment activation
      const response = await retryWithBackoff(
        () => api.post('/enrollments', thinkific_data),
        'Activate Thinkific Enrollment'
      );
      
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
        return safeJson(res, { message: 'Enrollment re-activated successfully with automatic retry' }, 200);
      } else {
        return safeJson(res, { error: 'LMS did not accept re-activation', details: response.data }, 400);
      }
    } catch (err: any) {
      console.error('❌ Thinkific enrollment API error after retries:', err);
      console.error('❌ Error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      
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
      console.error('Retry enrollment error after all attempts:', err);
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
      return safeJson(res, { 
        error: 'Failed to re-activate enrollment after automatic retries', 
        details,
        retriesAttempted: RETRY_CONFIG.maxRetries
      }, 500);
    }
  } catch (error: any) {
    return safeJson(res, { error: 'Server error', details: error.message }, 500);
  }
}