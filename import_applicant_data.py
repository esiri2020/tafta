import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
from datetime import datetime
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
    """Normalize date values to ISO format with timezone"""
    if not value or pd.isna(value):
        return None
    
    # First try to parse ISO format with timezone
    try:
        if isinstance(value, str) and 'T' in value and 'Z' in value:
            return datetime.fromisoformat(value.replace('Z', '+00:00')).date()
    except Exception:
        pass
    
    # Try other common formats
    for fmt in ("%d-%m-%Y %H:%M:%S", "%d-%m-%Y", "%Y-%m-%d", "%Y/%m/%d"):
        try:
            parsed_date = datetime.strptime(str(value), fmt).date()
            # Convert to ISO format string with timezone
            return parsed_date
        except Exception:
            continue
    
    logger.warning(f"Invalid date format: {value}. Setting to None.")
    return None

def validate_row(row: Dict[str, Any]) -> Tuple[bool, str]:
    """Validate a row of data before import"""
    # Validate email
    if not row.get('email') or pd.isna(row['email']) or str(row['email']).strip() == '':
        return False, "Missing or invalid email"
    
    # Validate firstName
    if not row.get('firstName') or pd.isna(row['firstName']) or str(row['firstName']).strip() == '':
        return False, "Missing or invalid firstName"
    
    # Validate lastName
    if not row.get('lastName') or pd.isna(row['lastName']) or str(row['lastName']).strip() == '':
        return False, "Missing or invalid lastName"
    
    # Add more validation as needed
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
    if education_level_value:
        key = str(education_level_value).replace('-', '_').replace(' ', '_').upper()
        mapped = EDUCATION_LEVEL_MAP.get(key)
        if mapped and mapped != education_level_value:
            print(f"[WARNING] Normalized EducationLevel '{education_level_value}' to '{mapped}'")
            row['educationLevel'] = mapped
        elif not mapped:
            print(f"[WARNING] Invalid EducationLevel '{education_level_value}', setting to None")
            row['educationLevel'] = None
    # Type defaulting
    type_value = row.get('type')
    if not type_value or str(type_value).strip() == '' or str(type_value).lower() == 'nan':
        print(f"[WARNING] Missing type for user {row.get('email', row.get('userId', 'unknown'))}, defaulting to 'INDIVIDUAL'")
        row['type'] = 'INDIVIDUAL'
    else:
        row['type'] = str(type_value).strip().upper()
    return row

def batch_create_users(cur, rows):
    """Create multiple users in a single batch and return email->userId mapping"""
    user_map = {}
    for row in rows:
        email = clean_data(row['email'])
        # Check if user already exists
        cur.execute('SELECT id FROM "User" WHERE email = %s', (email,))
        result = cur.fetchone()
        if result:
            user_id = result[0]
        else:
            user_id = uuid.uuid4().hex
            cur.execute('''
                INSERT INTO "User" (id, email, "firstName", "lastName", "middleName", role, password, "createdAt", "thinkific_user_id")
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            ''', (
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
    return user_map

def batch_create_profiles(cur, user_map, rows):
    normalized_rows = [normalize_profile_fields(row) for row in rows]
    values = []
    for row in normalized_rows:
        email = clean_data(row['email'])
        user_id = user_map.get(email)
        if not user_id:
            print(f"[WARNING] Skipping profile for {email}: userId not found in User table.")
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
            'id', 'userId', 'phoneNumber', 'gender', 'dob', 'homeAddress', 'stateOfResidence', 'LGADetails', 'communityArea', 'educationLevel', 'employmentStatus', 'employmentSector', 'selfEmployedType', 'residencyStatus', 'disability', 'source', 'type', 'registrationMode', 'businessName', 'businessType', 'businessSize', 'businessSector', 'businessPartners', 'companyPhoneNumber', 'additionalPhoneNumber', 'companyEmail', 'revenueRange', 'registrationType', 'businessSupportNeeds'
        ]
        execute_values(cur, f'''
            INSERT INTO "Profile" ({', '.join('"'+c+'"' for c in columns)})
            VALUES %s
            ON CONFLICT ("userId") DO UPDATE SET
            {', '.join(f'"{c}" = EXCLUDED."{c}"' for c in columns if c not in ['id', 'userId'])}
        ''', values)

def batch_create_user_cohorts(cur, user_map: Dict[str, str], rows: List[Dict[str, Any]]):
    """Create multiple user cohort associations in a single batch"""
    values = []
    for row in rows:
        email = clean_data(row['email'])
        user_id = user_map.get(email)
        cohort_id = row.get('cohortId')
        
        if not user_id or not cohort_id or pd.isna(cohort_id) or str(cohort_id).strip() == '':
            continue
            
        user_cohort_id = uuid.uuid4().hex
        values.append((
            user_cohort_id,
            user_id,
            cohort_id,
            datetime.now()
        ))
    
    if values:
        execute_values(cur, """
            INSERT INTO "UserCohort" (
                id, "userId", "cohortId", "created_at"
            ) VALUES %s
            ON CONFLICT ("userId", "cohortId") DO NOTHING
        """, values)

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

def import_applicant_data(excel_file: str, batch_size: int = 100):
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
        with ThreadPoolExecutor(max_workers=4) as executor:
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
    excel_file = "applicant_data_export_20250522_test.xlsx"  # Replace with your file name
    import_applicant_data(excel_file, batch_size=100) 