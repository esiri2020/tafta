import pandas as pd
import psycopg2
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def connect_to_db():
    """Connect to the PostgreSQL database"""
    return psycopg2.connect(
        dbname=os.getenv('POSTGRES_DB'),
        user=os.getenv('POSTGRES_USER'),
        password=os.getenv('POSTGRES_PASSWORD'),
        host=os.getenv('POSTGRES_HOST'),
        port=os.getenv('POSTGRES_PORT')
    )

def export_applicant_data():
    """Export all applicant data to Excel"""
    conn = connect_to_db()
    cur = conn.cursor()

    try:
        # Query to get all applicants with their profiles and assessments
        cur.execute("""
            SELECT 
                u.id as user_id,
                u.email,
                u.firstName,
                u.lastName,
                u.middleName,
                u.createdAt,
                u.role,
                u.thinkific_user_id,
                p.phoneNumber,
                p.gender,
                p.dob,
                p.homeAddress,
                p.stateOfResidence,
                p.LGADetails,
                p.communityArea,
                p.educationLevel,
                p.employmentStatus,
                p.employmentSector,
                p.selfEmployedType,
                p.residencyStatus,
                p.disability,
                p.source,
                p.type as profile_type,
                p.registrationMode,
                p.businessName,
                p.businessType,
                p.businessSize,
                p.businessSector,
                p.businessPartners,
                p.companyPhoneNumber,
                p.additionalPhoneNumber,
                p.companyEmail,
                p.revenueRange,
                p.entrepreneurRegistrationType,
                p.businessSupportNeeds,
                a.courseOfStudy,
                a.enrollmentStatus,
                a.hadJobBeforeAdmission,
                a.employmentStatus as assessment_employment_status,
                a.employmentType,
                a.workTimeType,
                a.employedInCreativeSector,
                a.creativeJobNature,
                a.nonCreativeJobInfo,
                a.yearsOfExperienceCreative,
                a.satisfactionLevel,
                a.skillRating,
                a.monthlyIncome,
                a.hasReliableIncome,
                a.earningMeetsNeeds,
                a.workIsDecentAndGood,
                a.jobGivesPurpose,
                a.feelRespectedAtWork,
                a.lmsPlatformRating,
                a.taftaPreparationRating,
                a.preparationFeedback,
                a.qualityOfInteractionRating,
                a.trainingMaterialsRating,
                a.topicSequencingRating,
                a.facilitatorsResponseRating,
                a.wouldRecommendTafta,
                a.improvementSuggestions,
                a.mostStrikingFeature,
                a.turnOffs,
                a.practicalClassChallenges,
                a.onlineClassChallenges,
                a.completionMotivation,
                uc.cohortId,
                c.name as cohort_name,
                c.startDate as cohort_start_date,
                c.endDate as cohort_end_date
            FROM "User" u
            LEFT JOIN "Profile" p ON u.id = p.userId
            LEFT JOIN "Assessment" a ON u.id = a.userId
            LEFT JOIN "UserCohort" uc ON u.id = uc.userId
            LEFT JOIN "Cohort" c ON uc.cohortId = c.id
            WHERE u.role = 'APPLICANT'
        """)

        # Get column names
        columns = [desc[0] for desc in cur.description]
        
        # Fetch all rows
        rows = cur.fetchall()
        
        # Create DataFrame
        df = pd.DataFrame(rows, columns=columns)
        
        # Create Excel writer
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        excel_file = f'applicant_data_export_{timestamp}.xlsx'
        
        with pd.ExcelWriter(excel_file, engine='openpyxl') as writer:
            # Main applicant data sheet
            df.to_excel(writer, sheet_name='Applicants', index=False)
            
            # Create separate sheets for different data types
            # 1. Basic Information
            basic_info = df[['user_id', 'email', 'firstName', 'lastName', 'middleName', 
                           'createdAt', 'role', 'thinkific_user_id']]
            basic_info.to_excel(writer, sheet_name='Basic_Info', index=False)
            
            # 2. Profile Information
            profile_info = df[['user_id', 'phoneNumber', 'gender', 'dob', 'homeAddress',
                             'stateOfResidence', 'LGADetails', 'communityArea', 'educationLevel',
                             'employmentStatus', 'employmentSector', 'selfEmployedType',
                             'residencyStatus', 'disability', 'source', 'profile_type',
                             'registrationMode']]
            profile_info.to_excel(writer, sheet_name='Profile_Info', index=False)
            
            # 3. Business Information (for entrepreneurs)
            business_info = df[['user_id', 'businessName', 'businessType', 'businessSize',
                              'businessSector', 'businessPartners', 'companyPhoneNumber',
                              'additionalPhoneNumber', 'companyEmail', 'revenueRange',
                              'entrepreneurRegistrationType', 'businessSupportNeeds']]
            business_info.to_excel(writer, sheet_name='Business_Info', index=False)
            
            # 4. Assessment Information
            assessment_info = df[['user_id', 'courseOfStudy', 'enrollmentStatus',
                                'hadJobBeforeAdmission', 'assessment_employment_status',
                                'employmentType', 'workTimeType', 'employedInCreativeSector',
                                'creativeJobNature', 'nonCreativeJobInfo',
                                'yearsOfExperienceCreative', 'satisfactionLevel',
                                'skillRating', 'monthlyIncome', 'hasReliableIncome',
                                'earningMeetsNeeds', 'workIsDecentAndGood', 'jobGivesPurpose',
                                'feelRespectedAtWork', 'lmsPlatformRating',
                                'taftaPreparationRating', 'preparationFeedback',
                                'qualityOfInteractionRating', 'trainingMaterialsRating',
                                'topicSequencingRating', 'facilitatorsResponseRating',
                                'wouldRecommendTafta', 'improvementSuggestions',
                                'mostStrikingFeature', 'turnOffs', 'practicalClassChallenges',
                                'onlineClassChallenges', 'completionMotivation']]
            assessment_info.to_excel(writer, sheet_name='Assessment_Info', index=False)
            
            # 5. Cohort Information
            cohort_info = df[['user_id', 'cohortId', 'cohort_name', 'cohort_start_date',
                            'cohort_end_date']]
            cohort_info.to_excel(writer, sheet_name='Cohort_Info', index=False)

        print(f"Data exported successfully to {excel_file}")
        return excel_file

    except Exception as e:
        print(f"Error exporting data: {str(e)}")
        return None
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    export_applicant_data() 