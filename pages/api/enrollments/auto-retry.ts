import { getToken } from 'next-auth/jwt';
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

  // Only allow admins to trigger automatic retries
  if (token?.userData?.role !== 'SUPERADMIN' && token?.userData?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Unauthorized - Admin access required' });
  }

  try {
    console.log('🔄 Starting automatic enrollment retry process...');

    // Find all failed enrollments (enrolled: false, no activated_at)
    const failedEnrollments = await prisma.enrollment.findMany({
      where: {
        enrolled: false,
        activated_at: null,
        created_at: {
          // Only retry enrollments created in the last 7 days
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      include: {
        userCohort: {
          include: {
            user: true,
            cohort: true,
          },
        },
      },
      take: 50, // Process max 50 at a time to avoid overwhelming the system
      orderBy: {
        created_at: 'asc' // Oldest first
      }
    });

    console.log(`📊 Found ${failedEnrollments.length} failed enrollments to retry`);

    if (failedEnrollments.length === 0) {
      return safeJson(res, { 
        message: 'No failed enrollments found to retry',
        processed: 0,
        successful: 0,
        failed: 0
      }, 200);
    }

    let successful = 0;
    let failed = 0;
    const results = [];

    // Process each failed enrollment
    for (const enrollment of failedEnrollments) {
      try {
        console.log(`🔄 Retrying enrollment: ${enrollment.uid} for user: ${enrollment.userCohort?.user?.email}`);
        
        // Call the retry API internally
        const retryResponse = await fetch(`${req.headers.host?.includes('localhost') ? 'http://localhost:3000' : 'https://reg.terraacademyforarts.com'}/api/enrollments/retry`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': req.headers.authorization || '',
            'Cookie': req.headers.cookie || '',
          },
          body: JSON.stringify({
            uid: enrollment.uid,
            user_email: enrollment.userCohort?.user?.email,
            course_id: enrollment.course_id.toString(),
            course_name: enrollment.course_name,
            userCohortId: enrollment.userCohort?.id
          })
        });

        if (retryResponse.ok) {
          successful++;
          results.push({
            enrollmentUid: enrollment.uid,
            userEmail: enrollment.userCohort?.user?.email,
            status: 'success',
            message: 'Enrollment activated successfully'
          });
          console.log(`✅ Successfully retried enrollment: ${enrollment.uid}`);
        } else {
          failed++;
          const errorData = await retryResponse.text();
          results.push({
            enrollmentUid: enrollment.uid,
            userEmail: enrollment.userCohort?.user?.email,
            status: 'failed',
            error: errorData
          });
          console.log(`❌ Failed to retry enrollment: ${enrollment.uid} - ${errorData}`);
        }

        // Add a small delay between requests to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error: any) {
        failed++;
        results.push({
          enrollmentUid: enrollment.uid,
          userEmail: enrollment.userCohort?.user?.email,
          status: 'error',
          error: error.message
        });
        console.error(`💥 Error processing enrollment ${enrollment.uid}:`, error.message);
      }
    }

    console.log(`🎯 Automatic retry completed: ${successful} successful, ${failed} failed`);

    return safeJson(res, {
      message: 'Automatic enrollment retry completed',
      processed: failedEnrollments.length,
      successful,
      failed,
      results: results.slice(0, 10) // Return first 10 results to avoid huge responses
    }, 200);

  } catch (error: any) {
    console.error('❌ Automatic retry process error:', error);
    return safeJson(res, { 
      error: 'Failed to process automatic retries', 
      details: error.message 
    }, 500);
  }
}

