import type { NextApiRequest, NextApiResponse } from 'next';
import { Client } from 'pg';
import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    // Connect to PostgreSQL
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    res.write(`data: ${JSON.stringify({ log: 'Connected to database...' })}\n\n`);

    // Get mobilizer filter from query params
    const { mobilizerId } = req.query;

    // Build WHERE clause with mobilizer filtering
    let whereClause = "WHERE u.role = 'APPLICANT'";
    if (mobilizerId) {
      whereClause += ` AND r.id = '${mobilizerId}'`;
    }

    // Query data (add referrer join)
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
    res.write(`data: ${JSON.stringify({ log: 'Data fetched...' })}\n\n`);

    const rows = result.rows;
    if (!rows.length) {
      res.write(`data: ${JSON.stringify({ log: 'No data found.', done: true })}\n\n`);
      res.end();
      await client.end();
      return;
    }

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const mainSheet = workbook.addWorksheet('Applicants');
    mainSheet.columns = Object.keys(rows[0]).map((key: string) => ({ header: key, key }));
    mainSheet.addRows(rows);

    // Helper to add a sheet
    const addSheet = (name: string, columns: string[]) => {
      const ws = workbook.addWorksheet(name);
      ws.columns = columns.map((key: string) => ({ header: key, key }));
      ws.addRows(rows.map((row: any) => {
        const obj: any = {};
        columns.forEach((key: string) => { obj[key] = row[key]; });
        return obj;
      }));
    };

    // Add other sheets (include referrer fields in Basic_Info and Profile_Info)
    addSheet('Basic_Info', ['user_id', 'email', 'firstName', 'lastName', 'middleName', 'createdAt', 'role', 'thinkific_user_id', 'referrer_fullName', 'referrer_phoneNumber']);
    addSheet('Profile_Info', ['user_id', 'phoneNumber', 'gender', 'dob', 'homeAddress', 'stateOfResidence', 'LGADetails', 'communityArea', 'educationLevel', 'employmentStatus', 'employmentSector', 'selfEmployedType', 'residencyStatus', 'disability', 'source', 'profile_type', 'registrationMode', 'referrer_fullName', 'referrer_phoneNumber']);
    addSheet('Business_Info', ['user_id', 'businessName', 'businessType', 'businessSize', 'businessSector', 'businessPartners', 'companyPhoneNumber', 'additionalPhoneNumber', 'companyEmail', 'revenueRange', 'registrationType', 'businessSupportNeeds']);
    addSheet('Assessment_Info', ['user_id', 'courseOfStudy', 'enrollmentStatus', 'hadJobBeforeAdmission', 'assessment_employment_status', 'employmentType', 'workTimeType', 'employedInCreativeSector', 'creativeJobNature', 'nonCreativeJobInfo', 'yearsOfExperienceCreative', 'satisfactionLevel', 'skillRating', 'monthlyIncome', 'hasReliableIncome', 'earningMeetsNeeds', 'workIsDecentAndGood', 'jobGivesPurpose', 'feelRespectedAtWork', 'lmsPlatformRating', 'taftaPreparationRating', 'preparationFeedback', 'qualityOfInteractionRating', 'trainingMaterialsRating', 'topicSequencingRating', 'facilitatorsResponseRating', 'wouldRecommendTafta', 'improvementSuggestions', 'mostStrikingFeature', 'turnOffs', 'practicalClassChallenges', 'onlineClassChallenges', 'completionMotivation']);
    addSheet('Cohort_Info', ['user_id', 'cohortId', 'cohort_name', 'cohort_start_date', 'cohort_end_date']);

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
    res.write(`data: ${JSON.stringify({ log: 'Excel file created...' })}\n\n`);

    // Send download link
    res.write(`data: ${JSON.stringify({ done: true, downloadLink: `/exports/${fileName}` })}\n\n`);
    res.end();
    await client.end();
  } catch (err: unknown) {
    let message = 'Unknown error';
    if (err && typeof err === 'object' && 'message' in err) {
      message = (err as any).message;
    }
    res.write(`data: ${JSON.stringify({ log: message, error: true })}\n\n`);
    res.end();
  }
}

// Configure Vercel serverless function timeout (max 300 seconds on Pro plan)
export const config = {
  maxDuration: 300, // 5 minutes - allows time for large data exports
}; 