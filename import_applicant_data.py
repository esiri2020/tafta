import pandas as pd
import psycopg2
from datetime import datetime
import os
from dotenv import load_dotenv
import json
from urllib.parse import urlparse

# Load environment variables
load_dotenv()

def connect_to_db():
    """Connect to the PostgreSQL database using DATABASE_URL"""
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        raise ValueError("DATABASE_URL environment variable is not set")
    
    # Parse the DATABASE_URL
    url = urlparse(database_url)
    
    # Extract connection parameters
    dbname = url.path[1:]  # Remove leading slash
    user = url.username
    password = url.password
    host = url.hostname
    port = url.port or 5432  # Default to 5432 if not specified
    
    return psycopg2.connect(
        dbname=dbname,
        user=user,
        password=password,
        host=host,
        port=port
    )

def clean_data(value):
    """Clean and format data values"""
    if pd.isna(value):
        return None
    if isinstance(value, (list, dict)):
        return json.dumps(value)
    return str(value)

def update_user_data(cur, user_id, data):
    """Update user information"""
    cur.execute("""
        UPDATE "User"
        SET 
            email = %s,
            firstName = %s,
            lastName = %s,
            middleName = %s,
            thinkific_user_id = %s
        WHERE id = %s
    """, (
        clean_data(data['email']),
        clean_data(data['firstName']),
        clean_data(data['lastName']),
        clean_data(data['middleName']),
        clean_data(data['thinkific_user_id']),
        user_id
    ))

def update_profile_data(cur, user_id, data):
    """Update profile information"""
    cur.execute("""
        UPDATE "Profile"
        SET 
            phoneNumber = %s,
            gender = %s,
            dob = %s,
            homeAddress = %s,
            stateOfResidence = %s,
            LGADetails = %s,
            communityArea = %s,
            educationLevel = %s,
            employmentStatus = %s,
            employmentSector = %s,
            selfEmployedType = %s,
            residencyStatus = %s,
            disability = %s,
            source = %s,
            type = %s,
            registrationMode = %s,
            businessName = %s,
            businessType = %s,
            businessSize = %s,
            businessSector = %s,
            businessPartners = %s,
            companyPhoneNumber = %s,
            additionalPhoneNumber = %s,
            companyEmail = %s,
            revenueRange = %s,
            entrepreneurRegistrationType = %s,
            businessSupportNeeds = %s
        WHERE userId = %s
    """, (
        clean_data(data['phoneNumber']),
        clean_data(data['gender']),
        clean_data(data['dob']),
        clean_data(data['homeAddress']),
        clean_data(data['stateOfResidence']),
        clean_data(data['LGADetails']),
        clean_data(data['communityArea']),
        clean_data(data['educationLevel']),
        clean_data(data['employmentStatus']),
        clean_data(data['employmentSector']),
        clean_data(data['selfEmployedType']),
        clean_data(data['residencyStatus']),
        clean_data(data['disability']),
        clean_data(data['source']),
        clean_data(data['profile_type']),
        clean_data(data['registrationMode']),
        clean_data(data['businessName']),
        clean_data(data['businessType']),
        clean_data(data['businessSize']),
        clean_data(data['businessSector']),
        clean_data(data['businessPartners']),
        clean_data(data['companyPhoneNumber']),
        clean_data(data['additionalPhoneNumber']),
        clean_data(data['companyEmail']),
        clean_data(data['revenueRange']),
        clean_data(data['entrepreneurRegistrationType']),
        clean_data(data['businessSupportNeeds']),
        user_id
    ))

def update_assessment_data(cur, user_id, data):
    """Update assessment information"""
    cur.execute("""
        UPDATE "Assessment"
        SET 
            courseOfStudy = %s,
            enrollmentStatus = %s,
            hadJobBeforeAdmission = %s,
            employmentStatus = %s,
            employmentType = %s,
            workTimeType = %s,
            employedInCreativeSector = %s,
            creativeJobNature = %s,
            nonCreativeJobInfo = %s,
            yearsOfExperienceCreative = %s,
            satisfactionLevel = %s,
            skillRating = %s,
            monthlyIncome = %s,
            hasReliableIncome = %s,
            earningMeetsNeeds = %s,
            workIsDecentAndGood = %s,
            jobGivesPurpose = %s,
            feelRespectedAtWork = %s,
            lmsPlatformRating = %s,
            taftaPreparationRating = %s,
            preparationFeedback = %s,
            qualityOfInteractionRating = %s,
            trainingMaterialsRating = %s,
            topicSequencingRating = %s,
            facilitatorsResponseRating = %s,
            wouldRecommendTafta = %s,
            improvementSuggestions = %s,
            mostStrikingFeature = %s,
            turnOffs = %s,
            practicalClassChallenges = %s,
            onlineClassChallenges = %s,
            completionMotivation = %s,
            updatedAt = %s
        WHERE userId = %s
    """, (
        clean_data(data['courseOfStudy']),
        clean_data(data['enrollmentStatus']),
        clean_data(data['hadJobBeforeAdmission']),
        clean_data(data['assessment_employment_status']),
        clean_data(data['employmentType']),
        clean_data(data['workTimeType']),
        clean_data(data['employedInCreativeSector']),
        clean_data(data['creativeJobNature']),
        clean_data(data['nonCreativeJobInfo']),
        clean_data(data['yearsOfExperienceCreative']),
        clean_data(data['satisfactionLevel']),
        clean_data(data['skillRating']),
        clean_data(data['monthlyIncome']),
        clean_data(data['hasReliableIncome']),
        clean_data(data['earningMeetsNeeds']),
        clean_data(data['workIsDecentAndGood']),
        clean_data(data['jobGivesPurpose']),
        clean_data(data['feelRespectedAtWork']),
        clean_data(data['lmsPlatformRating']),
        clean_data(data['taftaPreparationRating']),
        clean_data(data['preparationFeedback']),
        clean_data(data['qualityOfInteractionRating']),
        clean_data(data['trainingMaterialsRating']),
        clean_data(data['topicSequencingRating']),
        clean_data(data['facilitatorsResponseRating']),
        clean_data(data['wouldRecommendTafta']),
        clean_data(data['improvementSuggestions']),
        clean_data(data['mostStrikingFeature']),
        clean_data(data['turnOffs']),
        clean_data(data['practicalClassChallenges']),
        clean_data(data['onlineClassChallenges']),
        clean_data(data['completionMotivation']),
        datetime.now(),
        user_id
    ))

def update_cohort_data(cur, user_id, data):
    """Update cohort information"""
    # First, remove existing cohort associations
    cur.execute("""
        DELETE FROM "UserCohort"
        WHERE userId = %s
    """, (user_id,))
    
    # Then, add new cohort association if cohortId exists
    if not pd.isna(data['cohortId']):
        cur.execute("""
            INSERT INTO "UserCohort" (userId, cohortId)
            VALUES (%s, %s)
        """, (user_id, data['cohortId']))

def import_applicant_data(excel_file):
    """Import applicant data from Excel file"""
    conn = connect_to_db()
    cur = conn.cursor()
    
    try:
        # Read all sheets
        basic_info = pd.read_excel(excel_file, sheet_name='Basic_Info')
        profile_info = pd.read_excel(excel_file, sheet_name='Profile_Info')
        business_info = pd.read_excel(excel_file, sheet_name='Business_Info')
        assessment_info = pd.read_excel(excel_file, sheet_name='Assessment_Info')
        cohort_info = pd.read_excel(excel_file, sheet_name='Cohort_Info')
        
        # Merge all dataframes on user_id
        df = basic_info.merge(profile_info, on='user_id', how='left')
        df = df.merge(business_info, on='user_id', how='left')
        df = df.merge(assessment_info, on='user_id', how='left')
        df = df.merge(cohort_info, on='user_id', how='left')
        
        # Process each row
        for _, row in df.iterrows():
            user_id = row['user_id']
            
            try:
                # Update user data
                update_user_data(cur, user_id, row)
                
                # Update profile data
                update_profile_data(cur, user_id, row)
                
                # Update assessment data
                update_assessment_data(cur, user_id, row)
                
                # Update cohort data
                update_cohort_data(cur, user_id, row)
                
                print(f"Successfully updated data for user {user_id}")
                
            except Exception as e:
                print(f"Error updating data for user {user_id}: {str(e)}")
                continue
        
        # Commit all changes
        conn.commit()
        print("Data import completed successfully")
        
    except Exception as e:
        print(f"Error importing data: {str(e)}")
        conn.rollback()
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    # You can specify the Excel file name here or pass it as a command line argument
    excel_file = "applicant_data_export_20240321_120000.xlsx"  # Replace with your file name
    import_applicant_data(excel_file) 