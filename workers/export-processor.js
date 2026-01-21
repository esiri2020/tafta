const { Worker } = require('bullmq');
const { Client } = require('pg');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const { getRedisClient } = require('../lib/redis');

// Create Redis connection
const redis = getRedisClient();

/**
 * Process export job
 */
async function processExport(job) {
  const { mobilizerId } = job.data;
  const jobId = job.id;

  try {
    // Update job progress
    await job.updateProgress({ stage: 'connecting', percent: 5, logs: ['Connecting to database...'] });

    // Connect to PostgreSQL
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();

    await job.updateProgress({ stage: 'querying', percent: 10, logs: ['Connected to database', 'Fetching applicant data...'] });

    // Build WHERE clause with mobilizer filtering
    let whereClause = "WHERE u.role = 'APPLICANT'";
    if (mobilizerId) {
      whereClause += ` AND r.id = '${mobilizerId}'`;
    }

    // Query data
    const query = `
      SELECT 
        u.id as user_id,
        u.email,
        u."firstName",
        u."lastName",
        u."middleName",
        u."createdAt",
        u.role,
        u."thinkific_user_id",
        p."phoneNumber",
        p.gender,
        p.dob,
        p."homeAddress",
        p."stateOfResidence",
        p."LGADetails",
        p."communityArea",
        p."educationLevel",
        p."employmentStatus",
        p."employmentSector",
        p."selfEmployedType",
        p."residencyStatus",
        p.disability,
        p.source,
        p.type as profile_type,
        p."registrationMode",
        p."businessName",
        p."businessType",
        p."businessSize",
        p."businessSector",
        p."businessPartners",
        p."companyPhoneNumber",
        p."additionalPhoneNumber",
        p."companyEmail",
        p."revenueRange",
        p."registrationType",
        p."businessSupportNeeds",
        r."fullName" as referrer_fullName,
        r."phoneNumber" as referrer_phoneNumber,
        a."courseOfStudy",
        a."enrollmentStatus",
        a."hadJobBeforeAdmission",
        a."employmentStatus" as assessment_employment_status,
        a."employmentType",
        a."workTimeType",
        a."employedInCreativeSector",
        a."creativeJobNature",
        a."nonCreativeJobInfo",
        a."yearsOfExperienceCreative",
        a."satisfactionLevel",
        a."skillRating",
        a."monthlyIncome",
        a."hasReliableIncome",
        a."earningMeetsNeeds",
        a."workIsDecentAndGood",
        a."jobGivesPurpose",
        a."feelRespectedAtWork",
        a."lmsPlatformRating",
        a."taftaPreparationRating",
        a."preparationFeedback",
        a."qualityOfInteractionRating",
        a."trainingMaterialsRating",
        a."topicSequencingRating",
        a."facilitatorsResponseRating",
        a."wouldRecommendTafta",
        a."improvementSuggestions",
        a."mostStrikingFeature",
        a."turnOffs",
        a."practicalClassChallenges",
        a."onlineClassChallenges",
        a."completionMotivation",
        uc."cohortId",
        c.name as cohort_name,
        c."start_date" as cohort_start_date,
        c."end_date" as cohort_end_date
      FROM "User" u
      LEFT JOIN "Profile" p ON u.id = p."userId"
      LEFT JOIN "Referrer" r ON p.id = r."profileId"
      LEFT JOIN "Assessment" a ON u.id = a."userId"
      LEFT JOIN "UserCohort" uc ON u.id = uc."userId"
      LEFT JOIN "Cohort" c ON uc."cohortId" = c.id
      ${whereClause}
    `;

    const result = await client.query(query);
    const rows = result.rows;

    await job.updateProgress({ 
      stage: 'processing', 
      percent: 30, 
      logs: [`Data fetched: ${rows.length} records`, 'Creating Excel file...'] 
    });

    if (!rows.length) {
      await client.end();
      return {
        downloadLink: null,
        fileName: null,
        message: 'No data found',
        recordCount: 0,
      };
    }

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const mainSheet = workbook.addWorksheet('Applicants');
    mainSheet.columns = Object.keys(rows[0]).map((key) => ({ header: key, key }));
    mainSheet.addRows(rows);

    await job.updateProgress({ stage: 'processing', percent: 50, logs: ['Main sheet created', 'Adding additional sheets...'] });

    // Helper to add a sheet
    const addSheet = (name, columns) => {
      const ws = workbook.addWorksheet(name);
      ws.columns = columns.map((key) => ({ header: key, key }));
      ws.addRows(rows.map((row) => {
        const obj = {};
        columns.forEach((key) => { obj[key] = row[key]; });
        return obj;
      }));
    };

    // Add other sheets
    addSheet('Basic_Info', ['user_id', 'email', 'firstName', 'lastName', 'middleName', 'createdAt', 'role', 'thinkific_user_id', 'referrer_fullName', 'referrer_phoneNumber']);
    addSheet('Profile_Info', ['user_id', 'phoneNumber', 'gender', 'dob', 'homeAddress', 'stateOfResidence', 'LGADetails', 'communityArea', 'educationLevel', 'employmentStatus', 'employmentSector', 'selfEmployedType', 'residencyStatus', 'disability', 'source', 'profile_type', 'registrationMode', 'referrer_fullName', 'referrer_phoneNumber']);
    addSheet('Business_Info', ['user_id', 'businessName', 'businessType', 'businessSize', 'businessSector', 'businessPartners', 'companyPhoneNumber', 'additionalPhoneNumber', 'companyEmail', 'revenueRange', 'registrationType', 'businessSupportNeeds']);
    addSheet('Assessment_Info', ['user_id', 'courseOfStudy', 'enrollmentStatus', 'hadJobBeforeAdmission', 'assessment_employment_status', 'employmentType', 'workTimeType', 'employedInCreativeSector', 'creativeJobNature', 'nonCreativeJobInfo', 'yearsOfExperienceCreative', 'satisfactionLevel', 'skillRating', 'monthlyIncome', 'hasReliableIncome', 'earningMeetsNeeds', 'workIsDecentAndGood', 'jobGivesPurpose', 'feelRespectedAtWork', 'lmsPlatformRating', 'taftaPreparationRating', 'preparationFeedback', 'qualityOfInteractionRating', 'trainingMaterialsRating', 'topicSequencingRating', 'facilitatorsResponseRating', 'wouldRecommendTafta', 'improvementSuggestions', 'mostStrikingFeature', 'turnOffs', 'practicalClassChallenges', 'onlineClassChallenges', 'completionMotivation']);
    addSheet('Cohort_Info', ['user_id', 'cohortId', 'cohort_name', 'cohort_start_date', 'cohort_end_date']);

    await job.updateProgress({ stage: 'saving', percent: 80, logs: ['Excel file created', 'Saving to disk...'] });

    // Save to public/exports
    const timestamp = Date.now();
    const fileName = mobilizerId 
      ? `mobilizer_applicants_export_${timestamp}.xlsx`
      : `applicant_data_export_${timestamp}.xlsx`;
    const exportsDir = path.join(process.cwd(), 'public', 'exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }
    const filePath = path.join(exportsDir, fileName);
    await workbook.xlsx.writeFile(filePath);

    await client.end();

    await job.updateProgress({ stage: 'completed', percent: 100, logs: ['Export completed successfully!'] });

    return {
      downloadLink: `/exports/${fileName}`,
      fileName,
      recordCount: rows.length,
      message: 'Export completed successfully',
    };
  } catch (error) {
    console.error(`❌ Export job ${jobId} failed:`, error);
    throw error;
  }
}

// Create BullMQ worker
const exportWorker = new Worker(
  'applicant-exports',
  async (job) => {
    console.log(`📊 Processing export job: ${job.id}`);
    return await processExport(job);
  },
  {
    connection: redis,
    concurrency: 1, // Process one export at a time
    removeOnComplete: {
      age: 3600, // Keep completed jobs for 1 hour
      count: 100,
    },
    removeOnFail: {
      age: 24 * 3600, // Keep failed jobs for 24 hours
    },
  }
);

// Event handlers
exportWorker.on('completed', (job) => {
  console.log(`✅ Export job ${job.id} completed`);
});

exportWorker.on('failed', (job, err) => {
  console.error(`❌ Export job ${job.id} failed:`, err);
});

exportWorker.on('error', (err) => {
  console.error('❌ Export worker error:', err);
});

console.log('✅ Export worker started');

module.exports = { exportWorker };
