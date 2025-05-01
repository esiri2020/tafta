import pandas as pd
import psycopg2
from datetime import datetime
import re

# Database connection
DATABASE_URL = "postgresql://technicaler_new:Techpreneur365@1.pgsqlserver.com:5432/technicaler_new"

def clean_phone(phone):
    """Clean phone number to standard format"""
    if pd.isna(phone):
        return None
    # Remove any non-digit characters
    phone = re.sub(r'\D', '', str(phone))
    # Ensure it starts with 0
    if phone.startswith('234'):
        phone = '0' + phone[3:]
    return phone

def clean_email(email):
    """Clean and validate email"""
    if pd.isna(email):
        return None
    return str(email).strip().lower()

def map_applicant_data(row):
    """Map CSV data to database schema"""
    # User data
    user_data = {
        'email': clean_email(row['Email']),
        'firstName': row['First Name'] if not pd.isna(row['First Name']) else None,
        'lastName': row['Last Name'] if not pd.isna(row['Last Name']) else None,
        'role': 'APPLICANT',
        'password': '$2a$12$defaultpassword'  # Default password that can be changed later
    }
    
    # Profile data
    profile_data = {
        'phoneNumber': clean_phone(row['Phone number']),
        'LGADetails': row['LGA Details'] if not pd.isna(row['LGA Details']) else None,
        'stateOfResidence': row['State of Residence'] if not pd.isna(row['State of Residence']) else None,
        'homeAddress': row['Address'] if not pd.isna(row['Address']) else None,
        'gender': row['Gender'] if not pd.isna(row['Gender']) else None,
        'dob': pd.to_datetime(row['Date Of Birth']) if not pd.isna(row['Date Of Birth']) else None,
        'educationLevel': row['Educational Level'] if not pd.isna(row['Educational Level']) else None,
        'taftaCenter': row['Tafta Center'] if not pd.isna(row['Tafta Center']) else None,
        'employmentStatus': row['Employment Status'] if not pd.isna(row['Employment Status']) else None,
        'residencyStatus': row['Residency Status'] if not pd.isna(row['Residency Status']) else None,
        'communityArea': row['Community Area'] if not pd.isna(row['Community Area']) else None,
        'disability': row['Disability'] if not pd.isna(row['Disability']) else None,
        'source': row['Source'] if not pd.isna(row['Source']) else None,
        'type': 'INDIVIDUAL',  # Default to individual registration
        'registrationMode': 'online'  # Default registration mode
    }
    
    return user_data, profile_data

def import_applicant(user_data, profile_data, cur):
    """Import a single applicant into the database"""
    try:
        # Insert user
        cur.execute("""
            INSERT INTO "User" (email, firstName, lastName, role, password, createdAt)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            user_data['email'],
            user_data['firstName'],
            user_data['lastName'],
            user_data['role'],
            user_data['password'],
            datetime.now()
        ))
        
        user_id = cur.fetchone()[0]
        
        # Insert profile
        cur.execute("""
            INSERT INTO "Profile" (
                userId, phoneNumber, LGADetails, stateOfResidence,
                homeAddress, gender, dob, educationLevel,
                taftaCenter, employmentStatus, residencyStatus,
                communityArea, disability, source, type, registrationMode
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            user_id,
            profile_data['phoneNumber'],
            profile_data['LGADetails'],
            profile_data['stateOfResidence'],
            profile_data['homeAddress'],
            profile_data['gender'],
            profile_data['dob'],
            profile_data['educationLevel'],
            profile_data['taftaCenter'],
            profile_data['employmentStatus'],
            profile_data['residencyStatus'],
            profile_data['communityArea'],
            profile_data['disability'],
            profile_data['source'],
            profile_data['type'],
            profile_data['registrationMode']
        ))
        
        return True
    except Exception as e:
        print(f"Error importing applicant {user_data['email']}: {str(e)}")
        return False

def main():
    # Read CSV file
    print("Reading CSV file...")
    df = pd.read_csv('master sheet.csv')
    print(f"Found {len(df)} records to process")
    
    # Connect to database
    print("Connecting to database...")
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    # Process each row
    success_count = 0
    error_count = 0
    
    print("Starting import process...")
    for index, row in df.iterrows():
        user_data, profile_data = map_applicant_data(row)
        if import_applicant(user_data, profile_data, cur):
            success_count += 1
        else:
            error_count += 1
        
        # Commit every 100 records
        if (index + 1) % 100 == 0:
            conn.commit()
            print(f"Processed {index + 1} records. Success: {success_count}, Errors: {error_count}")
    
    # Final commit
    conn.commit()
    print(f"\nImport completed. Total Success: {success_count}, Total Errors: {error_count}")
    
    # Close connection
    cur.close()
    conn.close()

if __name__ == "__main__":
    main() 