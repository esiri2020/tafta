import pandas as pd
from prisma import Prisma
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_db_fields():
    """Get all fields from our database models"""
    db_fields = {
        'User': [
            'id', 'email', 'firstName', 'lastName', 'middleName',
            'createdAt', 'role', 'thinkific_user_id', 'type'
        ],
        'Profile': [
            'id', 'userId', 'phoneNumber', 'gender', 'dob', 'homeAddress',
            'stateOfResidence', 'LGADetails', 'communityArea', 'educationLevel',
            'employmentStatus', 'employmentSector', 'selfEmployedType',
            'residencyStatus', 'disability', 'source', 'type', 'registrationMode',
            'businessName', 'businessType', 'businessSize', 'businessSector',
            'businessPartners', 'companyPhoneNumber', 'additionalPhoneNumber',
            'companyEmail', 'revenueRange', 'registrationType', 'businessSupportNeeds'
        ],
        'Assessment': [
            'id', 'userId', 'courseOfStudy', 'enrollmentStatus',
            'hadJobBeforeAdmission', 'employmentStatus', 'employmentType',
            'workTimeType', 'employedInCreativeSector', 'creativeJobNature',
            'nonCreativeJobInfo', 'yearsOfExperienceCreative', 'satisfactionLevel',
            'skillRating', 'monthlyIncome', 'hasReliableIncome', 'earningMeetsNeeds',
            'workIsDecentAndGood', 'jobGivesPurpose', 'feelRespectedAtWork',
            'lmsPlatformRating', 'taftaPreparationRating', 'preparationFeedback',
            'qualityOfInteractionRating', 'trainingMaterialsRating',
            'topicSequencingRating', 'facilitatorsResponseRating',
            'wouldRecommendTafta', 'improvementSuggestions', 'mostStrikingFeature',
            'turnOffs', 'practicalClassChallenges', 'onlineClassChallenges',
            'completionMotivation'
        ],
        'Cohort': [
            'id', 'name', 'start_date', 'end_date', 'active', 'color'
        ]
    }
    return db_fields

def get_excel_fields(file_path):
    """Get all fields from the Excel file"""
    try:
        df = pd.read_excel(file_path, sheet_name='Masterlist_16.0 - Masterlist_16.0')
        return list(df.columns)
    except Exception as e:
        print(f"Error reading Excel file: {str(e)}")
        return []

def compare_fields():
    """Compare fields between Excel and database"""
    # Get fields from both sources
    db_fields = get_db_fields()
    excel_fields = get_excel_fields('Masterlist_16.0.xlsx')  # Update with actual file path
    
    # Create comparison DataFrame
    comparison = {
        'Excel Field': [],
        'Database Model': [],
        'Database Field': [],
        'Status': []
    }
    
    # Compare each Excel field with database fields
    for excel_field in excel_fields:
        found = False
        for model, fields in db_fields.items():
            for db_field in fields:
                # Simple matching - can be improved with fuzzy matching
                if excel_field.lower() == db_field.lower():
                    comparison['Excel Field'].append(excel_field)
                    comparison['Database Model'].append(model)
                    comparison['Database Field'].append(db_field)
                    comparison['Status'].append('Match')
                    found = True
                    break
            if found:
                break
        
        if not found:
            comparison['Excel Field'].append(excel_field)
            comparison['Database Model'].append('')
            comparison['Database Field'].append('')
            comparison['Status'].append('No Match')
    
    # Create DataFrame and save to Excel
    df = pd.DataFrame(comparison)
    df.to_excel('field_comparison.xlsx', index=False)
    print("Field comparison saved to field_comparison.xlsx")
    
    # Print summary
    total_fields = len(excel_fields)
    matched_fields = len([x for x in comparison['Status'] if x == 'Match'])
    print(f"\nSummary:")
    print(f"Total Excel fields: {total_fields}")
    print(f"Matched fields: {matched_fields}")
    print(f"Unmatched fields: {total_fields - matched_fields}")

if __name__ == "__main__":
    compare_fields() 