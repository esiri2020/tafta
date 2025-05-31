import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
from datetime import datetime, date
import os
from dotenv import load_dotenv
import json
from urllib.parse import urlparse
import bcrypt
import uuid
import traceback
from concurrent.futures import ThreadPoolExecutor
from typing import List, Dict, Any, Tuple
import logging
from psycopg2.pool import SimpleConnectionPool

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Create a connection pool
pool = None

def init_pool():
    """Initialize the connection pool"""
    global pool
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        raise ValueError("DATABASE_URL environment variable is not set")
    
    url = urlparse(database_url)
    dbname = url.path[1:]
    user = url.username
    password = url.password
    host = url.hostname
    port = url.port or 5432
    
    pool = SimpleConnectionPool(
        minconn=1,
        maxconn=10,
        dbname=dbname,
        user=user,
        password=password,
        host=host,
        port=port
    )

def get_connection():
    """Get a connection from the pool"""
    if pool is None:
        init_pool()
    return pool.getconn()

def release_connection(conn):
    """Release a connection back to the pool"""
    pool.putconn(conn)

def clean_data(value):
    """Clean and format data values"""
    if pd.isna(value):
        return None
    if isinstance(value, (list, dict)):
        return json.dumps(value)
    return str(value)

def normalize_date(value):
    """
    Normalize date values to our standard format (YYYY-MM-DD).
    Handles various input formats and ensures proper date validation.
    """
    if not value or pd.isna(value):
        return None
    
    try:
        # If it's already a datetime object, convert to date
        if isinstance(value, datetime):
            return value.date()
        
        # If it's already a date object, return as is
        if isinstance(value, date):
            return value
        
        # Handle string dates
        if isinstance(value, str):
            # Remove any time component if present
            value = value.split()[0]
            
            # Parse the date using pandas
            parsed_date = pd.to_datetime(value)
            
            # Validate the date is reasonable (not in future and not too old)
            if parsed_date > datetime.now():
                logger.warning(f"Future date detected: {value}. Setting to None.")
                return None
                
            # For DOB validation (assuming reasonable age range 15-100 years)
            min_date = datetime.now() - pd.DateOffset(years=100)
            max_date = datetime.now() - pd.DateOffset(years=15)
            if parsed_date < min_date or parsed_date > max_date:
                logger.warning(f"Unreasonable DOB date: {value}. Setting to None.")
                return None
            
            return parsed_date.date()
            
    except Exception as e:
        logger.warning(f"Invalid date format: {value}. Setting to None. Error: {str(e)}")
        return None
    
    return None

def validate_row(row: Dict[str, Any]) -> Tuple[bool, str]:
    """Validate a row of data before import"""
    # Only validate email as it's the key identifier
    if not row.get('email') or pd.isna(row['email']) or str(row['email']).strip() == '':
        return False, "Missing or invalid email"
    
    # Clean and validate email format
    email = str(row['email']).strip().lower()
    if not '@' in email or not '.' in email:
        return False, "Invalid email format"
    
    # Clean names if they exist, but don't require them
    if row.get('firstName'):
        row['firstName'] = clean_name(row['firstName'])
    if row.get('lastName'):
        row['lastName'] = clean_name(row['lastName'])
    
    # Update the row with cleaned email
    row['email'] = email
    
    return True, ""

def clean_name(name: str) -> str:
    """Clean and format a name field"""
    if pd.isna(name) or not name:
        return None
    # Remove extra whitespace and capitalize first letter of each word
    return ' '.join(word.strip().capitalize() for word in str(name).split())

def normalize_profile_fields(row):
    # CommunityArea mapping
    COMMUNITY_AREA_MAP = {
        'PERI-URBAN': 'PERI_URBANS',
        'PERI_URBAN': 'PERI_URBANS',
        'PERI URBAN': 'PERI_URBANS',
        'PERIURBAN': 'PERI_URBANS',
        'PERI_URBANS': 'PERI_URBANS',
    }
    community_area_value = row.get('communityArea')
    if community_area_value:
        key = str(community_area_value).replace('-', '_').replace(' ', '_').upper()
        mapped = COMMUNITY_AREA_MAP.get(key)
        if mapped and mapped != community_area_value:
            print(f"[WARNING] Normalized CommunityArea '{community_area_value}' to '{mapped}'")
            row['communityArea'] = mapped
        elif not mapped:
            print(f"[WARNING] Invalid CommunityArea '{community_area_value}', setting to None")
            row['communityArea'] = None
    # EducationLevel mapping
    EDUCATION_LEVEL_MAP = {
        'ELEMENTARY_SCHOOL': 'ELEMENTRY_SCHOOL',
        'ELEMENTRY_SCHOOL': 'ELEMENTRY_SCHOOL',
    }
    education_level_value = row.get('educationLevel')
    if isinstance(education_level_value, bool) or pd.isna(education_level_value):
        row['educationLevel'] = None
    elif education_level_value:
        key = str(education_level_value).replace('-', '_').replace(' ', '_').upper()
        mapped = EDUCATION_LEVEL_MAP.get(key)
        if mapped and mapped != education_level_value:
            print(f"[WARNING] Normalized EducationLevel '{education_level_value}' to '{mapped}'")
            row['educationLevel'] = mapped
        else:
            education_level_value = str(education_level_value).strip().upper()
            if education_level_value not in ['ELEMENTRY_SCHOOL', 'HIGH_SCHOOL', 'BACHELORS', 'MASTERS', 'PHD']:
                print(f"[WARNING] Invalid educationLevel '{education_level_value}', setting to None")
                row['educationLevel'] = None
            else:
                row['educationLevel'] = education_level_value
    else:
        row['educationLevel'] = None
    # Type defaulting
    type_value = row.get('type')
    if not type_value or str(type_value).strip() == '' or str(type_value).lower() == 'nan':
        print(f"[WARNING] Missing type for user {row.get('email', row.get('userId', 'unknown'))}, defaulting to 'INDIVIDUAL'")
        row['type'] = 'INDIVIDUAL'
    else:
        row['type'] = str(type_value).strip().upper()
    # Validate gender
    gender_value = row.get('gender')
    if gender_value:
        gender_value = str(gender_value).strip().upper()
        if gender_value not in ['MALE', 'FEMALE', 'OTHER']:
            print(f"[WARNING] Invalid gender '{gender_value}', setting to None")
            row['gender'] = None
        else:
            row['gender'] = gender_value
    # Validate employmentStatus
    employment_status_value = row.get('employmentStatus')
    if employment_status_value:
        employment_status_value = str(employment_status_value).strip().upper()
        if employment_status_value not in ['EMPLOYED', 'UNEMPLOYED', 'SELF_EMPLOYED']:
            print(f"[WARNING] Invalid employmentStatus '{employment_status_value}', setting to None")
            row['employmentStatus'] = None
        else:
            row['employmentStatus'] = employment_status_value
    # Validate employmentSector
    employment_sector_value = row.get('employmentSector')
    if employment_sector_value:
        employment_sector_value = str(employment_sector_value).strip().upper()
        if employment_sector_value not in ['PRIVATE', 'PUBLIC', 'NON_PROFIT']:
            print(f"[WARNING] Invalid employmentSector '{employment_sector_value}', setting to None")
            row['employmentSector'] = None
        else:
            row['employmentSector'] = employment_sector_value
    # Validate selfEmployedType
    self_employed_type_value = row.get('selfEmployedType')
    if self_employed_type_value:
        self_employed_type_value = str(self_employed_type_value).strip().upper()
        if self_employed_type_value not in ['FREELANCER', 'BUSINESS_OWNER', 'CONTRACTOR']:
            print(f"[WARNING] Invalid selfEmployedType '{self_employed_type_value}', setting to None")
            row['selfEmployedType'] = None
        else:
            row['selfEmployedType'] = self_employed_type_value
    # Validate residencyStatus
    residency_status_value = row.get('residencyStatus')
    if residency_status_value:
        residency_status_value = str(residency_status_value).strip().upper()
        if residency_status_value not in ['CITIZEN', 'RESIDENT', 'NON_RESIDENT']:
            print(f"[WARNING] Invalid residencyStatus '{residency_status_value}', setting to None")
            row['residencyStatus'] = None
        else:
            row['residencyStatus'] = residency_status_value
    # Validate disability
    disability_value = row.get('disability')
    if disability_value:
        disability_value = str(disability_value).strip().upper()
        if disability_value not in ['YES', 'NO']:
            print(f"[WARNING] Invalid disability '{disability_value}', setting to None")
            row['disability'] = None
        else:
            row['disability'] = disability_value
    # Validate type
    type_value = row.get('type')
    if type_value:
        type_value = str(type_value).strip().upper()
        if type_value not in ['INDIVIDUAL', 'BUSINESS']:
            print(f"[WARNING] Invalid type '{type_value}', setting to 'INDIVIDUAL'")
            row['type'] = 'INDIVIDUAL'
        else:
            row['type'] = type_value
    # Validate registrationMode
    registration_mode_value = row.get('registrationMode')
    if registration_mode_value:
        registration_mode_value = str(registration_mode_value).strip().upper()
        if registration_mode_value not in ['ONLINE', 'OFFLINE']:
            print(f"[WARNING] Invalid registrationMode '{registration_mode_value}', setting to None")
            row['registrationMode'] = None
        else:
            row['registrationMode'] = registration_mode_value
    # Validate businessType
    business_type_value = row.get('businessType')
    if business_type_value:
        business_type_value = str(business_type_value).strip().upper()
        if business_type_value not in ['SOLE_PROPRIETORSHIP', 'PARTNERSHIP', 'CORPORATION']:
            print(f"[WARNING] Invalid businessType '{business_type_value}', setting to None")
            row['businessType'] = None
        else:
            row['businessType'] = business_type_value
    # Validate businessSize
    business_size_value = row.get('businessSize')
    if business_size_value:
        business_size_value = str(business_size_value).strip().upper()
        if business_size_value not in ['SMALL', 'MEDIUM', 'LARGE']:
            print(f"[WARNING] Invalid businessSize '{business_size_value}', setting to None")
            row['businessSize'] = None
        else:
            row['businessSize'] = business_size_value
    # Validate businessSector
    business_sector_value = row.get('businessSector')
    if business_sector_value:
        business_sector_value = str(business_sector_value).strip().upper()
        if business_sector_value not in ['TECHNOLOGY', 'HEALTHCARE', 'RETAIL', 'MANUFACTURING']:
            print(f"[WARNING] Invalid businessSector '{business_sector_value}', setting to None")
            row['businessSector'] = None
        else:
            row['businessSector'] = business_sector_value
    # Validate revenueRange
    revenue_range_value = row.get('revenueRange')
    if revenue_range_value:
        revenue_range_value = str(revenue_range_value).strip().upper()
        if revenue_range_value not in ['UNDER_100K', '100K_TO_500K', 'OVER_500K']:
            print(f"[WARNING] Invalid revenueRange '{revenue_range_value}', setting to None")
            row['revenueRange'] = None
        else:
            row['revenueRange'] = revenue_range_value
    # Validate registrationType
    registration_type_value = row.get('registrationType')
    if registration_type_value:
        registration_type_value = str(registration_type_value).strip().upper()
        if registration_type_value not in ['NEW', 'RENEWAL']:
            print(f"[WARNING] Invalid registrationType '{registration_type_value}', setting to None")
            row['registrationType'] = None
        else:
            row['registrationType'] = registration_type_value
    return row

def batch_create_users(cur, rows):
    """Create multiple users in a single batch and return email->userId mapping"""
    user_map = {}
    
    # Get all emails in the batch
    emails = [clean_data(row['email']) for row in rows]
    
    # Bulk check for existing users
    cur.execute('SELECT id, email FROM "User" WHERE email = ANY(%s)', (emails,))
    existing_users = {row[1]: row[0] for row in cur.fetchall()}
    
    # Prepare new users for insertion
    new_users = []
    for row in rows:
        email = clean_data(row['email'])
        if email not in existing_users:
            user_id = uuid.uuid4().hex
            new_users.append((
                user_id,
                email,
                clean_data(row.get('firstName')),
                clean_data(row.get('lastName')),
                clean_data(row.get('middleName')),
                'APPLICANT',
                bcrypt.hashpw('Welcome@123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
                datetime.now(),
                clean_data(row.get('thinkific_user_id'))
            ))
            user_map[email] = user_id
        else:
            user_map[email] = existing_users[email]
    
    # Bulk insert new users
    if new_users:
        execute_values(cur, '''
            INSERT INTO "User" (id, email, "firstName", "lastName", "middleName", role, password, "createdAt", "thinkific_user_id")
            VALUES %s
        ''', new_users)
    
    return user_map

def batch_create_profiles(cur, user_map, rows):
    normalized_rows = [normalize_profile_fields(row) for row in rows]
    values = []
    for row in normalized_rows:
        email = clean_data(row['email'])
        user_id = user_map.get(email)
        if not user_id:
            logger.warning(f"Skipping profile for {email}: userId not found in User table.")
            continue
            
        gender_value = row.get('gender')
        if gender_value:
            gender_value = str(gender_value).strip().upper()
        dob_value = normalize_date(row.get('dob'))
        type_value = row.get('type')
        
        values.append([
            uuid.uuid4().hex,
            user_id,
            clean_data(row.get('phoneNumber')),
            gender_value,
            dob_value,
            clean_data(row.get('homeAddress')),
            clean_data(row.get('stateOfResidence')),
            clean_data(row.get('LGADetails')),
            row.get('communityArea'),
            row.get('educationLevel'),
            clean_data(row.get('employmentStatus')),
            clean_data(row.get('employmentSector')),
            clean_data(row.get('selfEmployedType')),
            clean_data(row.get('residencyStatus')),
            clean_data(row.get('disability')),
            clean_data(row.get('source')),
            type_value,
            clean_data(row.get('registrationMode')),
            clean_data(row.get('businessName')),
            clean_data(row.get('businessType')),
            clean_data(row.get('businessSize')),
            clean_data(row.get('businessSector')),
            clean_data(row.get('businessPartners')),
            clean_data(row.get('companyPhoneNumber')),
            clean_data(row.get('additionalPhoneNumber')),
            clean_data(row.get('companyEmail')),
            clean_data(row.get('revenueRange')),
            clean_data(row.get('registrationType')),
            clean_data(row.get('businessSupportNeeds'))
        ])
    
    # Only insert if there are valid profiles
    if values:
        columns = [
            'id', 'userId', 'phoneNumber', 'gender', 'dob', 'homeAddress', 'stateOfResidence', 
            'LGADetails', 'communityArea', 'educationLevel', 'employmentStatus', 'employmentSector', 
            'selfEmployedType', 'residencyStatus', 'disability', 'source', 'type', 'registrationMode', 
            'businessName', 'businessType', 'businessSize', 'businessSector', 'businessPartners', 
            'companyPhoneNumber', 'additionalPhoneNumber', 'companyEmail', 'revenueRange', 
            'registrationType', 'businessSupportNeeds'
        ]
        
        # Use UPSERT to handle duplicates
        execute_values(cur, f'''
            INSERT INTO "Profile" ({', '.join('"'+c+'"' for c in columns)})
            VALUES %s
            ON CONFLICT ("userId") DO UPDATE SET
            {', '.join(f'"{c}" = EXCLUDED."{c}"' for c in columns if c not in ['id', 'userId'])}
        ''', values)

def batch_create_user_cohorts(cur, user_map, rows):
    values = []
    for row in rows:
        email = clean_data(row['email'])
        user_id = user_map.get(email)
        if not user_id:
            print(f"[WARNING] Skipping user cohort for {email}: userId not found in User table.")
            continue
        cohort_id = row.get('cohortId')
        if not cohort_id:
            print(f"[WARNING] Skipping user cohort for {email}: cohortId is missing.")
            continue
        values.append([
            uuid.uuid4().hex,
            user_id,
            cohort_id
        ])
    # Only insert if there are valid user cohorts
    if values:
        execute_values(cur, '''
            INSERT INTO "UserCohort" (id, "userId", "cohortId")
            VALUES %s
        ''', values)

def process_batch(batch: List[Dict[str, Any]]) -> List[Tuple[str, str]]:
    """Process a batch of rows"""
    errors = []
    conn = get_connection()
    try:
        cur = conn.cursor()
        
        # Validate all rows first
        valid_rows = []
        for row in batch:
            is_valid, error_msg = validate_row(row)
            if is_valid:
                valid_rows.append(row)
            else:
                errors.append((row.get('email', 'unknown'), error_msg))
        
        if valid_rows:
            # Batch create users
            user_map = batch_create_users(cur, valid_rows)
            
            # Batch create profiles
            batch_create_profiles(cur, user_map, valid_rows)
            
            # Batch create user cohorts
            batch_create_user_cohorts(cur, user_map, valid_rows)
            
            conn.commit()
            
    except Exception as e:
        conn.rollback()
        for row in batch:
            errors.append((row.get('email', 'unknown'), str(e)))
        logger.error(f"Error processing batch: {str(e)}")
        logger.error(traceback.format_exc())
    finally:
        cur.close()
        release_connection(conn)
    
    return errors

def import_applicant_data(excel_file: str, batch_size: int = 500):  # Increased batch size
    """Import applicant data from Excel file using batch processing"""
    logger.info(f"Starting import from {excel_file}")
    
    try:
        # Read the applicants sheet
        df = pd.read_excel(excel_file, sheet_name='Applicants')
        total_rows = len(df)
        logger.info(f"Found {total_rows} rows to process")
        
        # Convert DataFrame to list of dictionaries
        rows = df.to_dict('records')
        
        # Process in batches
        all_errors = []
        with ThreadPoolExecutor(max_workers=4) as executor:  # Keep original worker count
            for i in range(0, len(rows), batch_size):
                batch = rows[i:i + batch_size]
                future = executor.submit(process_batch, batch)
                batch_errors = future.result()
                all_errors.extend(batch_errors)
                
                # Log progress
                processed = min(i + batch_size, total_rows)
                logger.info(f"Processed {processed}/{total_rows} rows")
        
        # Log summary
        if all_errors:
            logger.warning(f"\n[SUMMARY] {len(all_errors)} errors encountered during import:")
            for email, err in all_errors:
                logger.warning(f"- {email}: {err}")
        else:
            logger.info("\n[SUMMARY] All applicants imported successfully!")
            
    except Exception as e:
        logger.error(f"Fatal error during import: {str(e)}")
        logger.error(traceback.format_exc())
        raise

def create_profile(cur, user_id, row):
    row = normalize_profile_fields(row)
    """Create profile record for user"""
    profile_id = uuid.uuid4().hex
    columns = [
        'id', 'userId', 'phoneNumber', 'gender', 'dob', 'homeAddress', 'stateOfResidence', 'LGADetails', 'communityArea', 'educationLevel', 'employmentStatus', 'employmentSector', 'selfEmployedType', 'residencyStatus', 'disability', 'source', 'type', 'registrationMode', 'businessName', 'businessType', 'businessSize', 'businessSector', 'businessPartners', 'companyPhoneNumber', 'additionalPhoneNumber', 'companyEmail', 'revenueRange', 'registrationType', 'businessSupportNeeds'
    ]
    gender_value = row.get('gender')
    if gender_value:
        gender_value = str(gender_value).strip().upper()
    dob_value = normalize_date(row.get('dob'))
    type_value = row.get('type')
    values = [
        profile_id,
        user_id,
        clean_data(row.get('phoneNumber')),
        gender_value,
        dob_value,
        clean_data(row.get('homeAddress')),
        clean_data(row.get('stateOfResidence')),
        clean_data(row.get('LGADetails')),
        row.get('communityArea'),
        row.get('educationLevel'),
        clean_data(row.get('employmentStatus')),
        clean_data(row.get('employmentSector')),
        clean_data(row.get('selfEmployedType')),
        clean_data(row.get('residencyStatus')),
        clean_data(row.get('disability')),
        clean_data(row.get('source')),
        type_value,
        clean_data(row.get('registrationMode')),
        clean_data(row.get('businessName')),
        clean_data(row.get('businessType')),
        clean_data(row.get('businessSize')),
        clean_data(row.get('businessSector')),
        clean_data(row.get('businessPartners')),
        clean_data(row.get('companyPhoneNumber')),
        clean_data(row.get('additionalPhoneNumber')),
        clean_data(row.get('companyEmail')),
        clean_data(row.get('revenueRange')),
        clean_data(row.get('registrationType')),
        clean_data(row.get('businessSupportNeeds'))
    ]
    print(f"[DEBUG] Profile columns: {len(columns)} values: {len(values)}")
    print(f"[DEBUG] Values: {values}")
    cur.execute(f"""
        INSERT INTO "Profile" ({', '.join('"'+c+'"' for c in columns)})
        VALUES ({', '.join(['%s']*len(columns))})
        ON CONFLICT ("userId") DO UPDATE SET
        {', '.join(f'"{c}" = EXCLUDED."{c}"' for c in columns if c not in ['id', 'userId'])}
    """, values)

if __name__ == "__main__":
    excel_file = "applicant_data_export_20250522_cohort_10.xlsx"  # Replace with your file name
 
    import_applicant_data(excel_file, batch_size=500) 