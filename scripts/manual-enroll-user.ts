/**
 * Manual Enrollment Script
 * 
 * This script manually enrolls users who:
 * 1. Have verified their email
 * 2. Don't have a Thinkific user ID
 * 3. Have an enrollment record with enrolled: false
 * 
 * Usage:
 *   npx ts-node scripts/manual-enroll-user.ts adedejiracheal95@gmail.com
 *   
 * Or to process all affected users:
 *   npx ts-node scripts/manual-enroll-user.ts --all
 */

import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

// Configure Thinkific API
const api = axios.create({
  baseURL: `https://api.thinkific.com/api/public/v1`,
  headers: {
    'X-Auth-API-Key': process.env.API_KEY,
    'X-Auth-Subdomain': process.env.API_SUBDOMAIN,
    'Content-Type': 'application/json',
  },
});

async function createThinkificUser(user: any) {
  console.log(`📤 Creating Thinkific user for ${user.email}...`);
  
  try {
    const response = await api.post('/users', {
      email: user.email,
      first_name: user.firstName,
      last_name: user.lastName,
      skip_custom_fields_validation: true,
      send_welcome_email: false, // Don't send welcome email since they already verified
    });
    
    if (response.status === 201) {
      console.log(`✅ Thinkific user created with ID: ${response.data.id}`);
      return response.data.id;
    }
  } catch (error: any) {
    // Check if user already exists
    if (error.response?.status === 422) {
      console.log(`⚠️ User already exists in Thinkific, attempting to fetch...`);
      try {
        // Search for user by email
        const searchResponse = await api.get(`/users?query[email]=${user.email}`);
        if (searchResponse.data.items && searchResponse.data.items.length > 0) {
          const thinkificUserId = searchResponse.data.items[0].id;
          console.log(`✅ Found existing Thinkific user with ID: ${thinkificUserId}`);
          return thinkificUserId;
        }
      } catch (searchError) {
        console.error(`❌ Failed to find existing user:`, searchError);
        throw searchError;
      }
    }
    throw error;
  }
}

async function enrollUserInThinkific(thinkificUserId: string, courseId: string) {
  console.log(`📤 Enrolling user ${thinkificUserId} in course ${courseId}...`);
  
  try {
    const response = await api.post('/enrollments', {
      course_id: courseId,
      user_id: thinkificUserId,
      activated_at: new Date().toISOString(),
    });
    
    if (response.status === 201) {
      console.log(`✅ Successfully enrolled in Thinkific`);
      return response.data;
    }
  } catch (error: any) {
    // Check if already enrolled
    if (error.response?.status === 400 && error.response?.data?.errors) {
      const alreadyEnrolled = error.response.data.errors.find((e: any) => e.code === 'already_enrolled');
      if (alreadyEnrolled) {
        console.log(`✅ User already enrolled in Thinkific course`);
        return { already_enrolled: true };
      }
    }
    throw error;
  }
}

async function processUser(email: string) {
  console.log(`\n🔍 Processing user: ${email}`);
  console.log(`═══════════════════════════════════════`);
  
  try {
    // 1. Fetch user with all related data
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        profile: true,
        userCohort: {
          include: {
            enrollments: true,
            cohort: true,
          },
        },
      },
    });
    
    if (!user) {
      console.error(`❌ User not found: ${email}`);
      return false;
    }
    
    console.log(`📋 User Info:
  - Name: ${user.firstName} ${user.lastName}
  - Email Verified: ${user.emailVerified ? '✅' : '❌'}
  - Thinkific ID: ${user.thinkific_user_id || '❌ MISSING'}
`);
    
    if (!user.emailVerified) {
      console.error(`❌ Email not verified yet`);
      return false;
    }
    
    // 2. Get enrollment info
    const userCohort = user.userCohort[0];
    if (!userCohort) {
      console.error(`❌ No cohort assigned to user`);
      return false;
    }
    
    const enrollment = userCohort.enrollments[0];
    if (!enrollment) {
      console.error(`❌ No enrollment record found`);
      
      // Check profile for course selection
      if (user.profile?.selectedCourseId) {
        console.log(`📝 Found course selection in profile: ${user.profile.selectedCourseName}`);
        console.log(`   Creating new enrollment...`);
        
        const newEnrollment = await prisma.enrollment.create({
          data: {
            course_id: BigInt(user.profile.selectedCourseId),
            course_name: user.profile.selectedCourseName!,
            enrolled: false,
            userCohortId: userCohort.id,
          },
        });
        
        console.log(`✅ Enrollment record created`);
        return await processUser(email); // Retry with new enrollment
      } else {
        console.error(`❌ No course selection found in profile either`);
        return false;
      }
    }
    
    console.log(`📋 Enrollment Info:
  - Course: ${enrollment.course_name}
  - Course ID: ${enrollment.course_id}
  - Enrolled on Thinkific: ${enrollment.enrolled ? '✅' : '❌'}
  - Cohort: ${userCohort.cohort?.name}
`);
    
    // 3. Create Thinkific user if missing
    let thinkificUserId = user.thinkific_user_id;
    if (!thinkificUserId) {
      thinkificUserId = await createThinkificUser(user);
      
      // Update DB with Thinkific user ID
      await prisma.user.update({
        where: { id: user.id },
        data: { thinkific_user_id: thinkificUserId },
      });
      console.log(`✅ Database updated with Thinkific user ID`);
    }
    
    // Ensure we have a Thinkific user ID before proceeding
    if (!thinkificUserId) {
      console.error(`❌ Failed to obtain Thinkific user ID`);
      return false;
    }
    
    // 4. Enroll in Thinkific if not already enrolled
    if (!enrollment.enrolled) {
      const enrollmentData = await enrollUserInThinkific(
        thinkificUserId,
        enrollment.course_id.toString()
      );
      
      // Update local enrollment record
      await prisma.enrollment.update({
        where: { uid: enrollment.uid },
        data: {
          enrolled: true,
          activated_at: new Date(),
          ...(enrollmentData && !enrollmentData.already_enrolled ? {
            id: enrollmentData.id ? BigInt(enrollmentData.id) : undefined,
            percentage_completed: enrollmentData.percentage_completed 
              ? parseFloat(enrollmentData.percentage_completed) 
              : undefined,
          } : {}),
        },
      });
      
      console.log(`✅ Local enrollment record updated`);
    }
    
    // 5. Add to cohort group if needed
    if (userCohort.cohort) {
      try {
        await api.post('/group_users', {
          group_names: [userCohort.cohort.name],
          user_id: thinkificUserId,
        });
        console.log(`✅ Added to cohort group: ${userCohort.cohort.name}`);
      } catch (groupError: any) {
        if (groupError.response?.status === 422) {
          console.log(`ℹ️ User already in cohort group`);
        } else {
          console.error(`⚠️ Failed to add to cohort group:`, groupError.message);
        }
      }
    }
    
    console.log(`\n✅ SUCCESS: User fully enrolled!`);
    console.log(`═══════════════════════════════════════\n`);
    return true;
    
  } catch (error: any) {
    console.error(`\n❌ ERROR: Failed to process user`);
    console.error(`Details:`, error.message);
    console.error(`═══════════════════════════════════════\n`);
    return false;
  }
}

async function processAllAffectedUsers() {
  console.log(`\n🔍 Finding all affected users...`);
  
  const affectedUsers = await prisma.user.findMany({
    where: {
      emailVerified: { not: null },
      thinkific_user_id: null,
      role: 'APPLICANT',
    },
    select: {
      email: true,
    },
    orderBy: {
      emailVerified: 'desc',
    },
  });
  
  console.log(`Found ${affectedUsers.length} affected users\n`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (const user of affectedUsers) {
    const success = await processUser(user.email);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    
    // Wait 1 second between users to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n📊 SUMMARY:`);
  console.log(`  ✅ Successfully processed: ${successCount}`);
  console.log(`  ❌ Failed: ${failCount}`);
  console.log(`  📝 Total: ${affectedUsers.length}\n`);
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error(`Usage: npx ts-node scripts/manual-enroll-user.ts <email>`);
    console.error(`   Or: npx ts-node scripts/manual-enroll-user.ts --all`);
    process.exit(1);
  }
  
  try {
    if (args[0] === '--all') {
      await processAllAffectedUsers();
    } else {
      const email = args[0];
      await processUser(email);
    }
  } catch (error: any) {
    console.error(`Fatal error:`, error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

