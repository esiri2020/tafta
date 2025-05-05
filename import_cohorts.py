import pandas as pd
import psycopg2
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database connection
DATABASE_URL = os.getenv('DATABASE_URL')

def clean_date(date_str):
    """Clean and parse date string"""
    if pd.isna(date_str):
        return None
    try:
        return pd.to_datetime(date_str).date()
    except:
        return None

def map_cohort_data(row):
    """Map Excel data to database schema"""
    cohort_data = {
        'name': row['Cohort Name'] if not pd.isna(row['Cohort Name']) else None,
        'start_date': clean_date(row['Start Date']),
        'end_date': clean_date(row['End Date']),
        'active': True,
        'color': row['Color'] if not pd.isna(row['Color']) else '#000000'
    }
    return cohort_data

def import_cohort(cohort_data, cur):
    """Import a single cohort into the database"""
    try:
        # Insert cohort
        cur.execute("""
            INSERT INTO "Cohort" (id, name, start_date, end_date, active, color)
            VALUES (gen_random_uuid(), %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            cohort_data['name'],
            cohort_data['start_date'],
            cohort_data['end_date'],
            cohort_data['active'],
            cohort_data['color']
        ))
        
        cohort_id = cur.fetchone()[0]
        return cohort_id, True
    except Exception as e:
        print(f"Error importing cohort {cohort_data['name']}: {str(e)}")
        return None, False

def main():
    # Read Excel file
    print("Reading Excel file...")
    df = pd.read_excel('cohorts_master.xlsx')
    print(f"Found {len(df)} records to process")
    
    # Connect to database
    print("Connecting to database...")
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    # Process each row
    success_count = 0
    error_count = 0
    imported_cohorts = []
    
    print("Starting import process...")
    for index, row in df.iterrows():
        cohort_data = map_cohort_data(row)
        cohort_id, success = import_cohort(cohort_data, cur)
        
        if success:
            success_count += 1
            imported_cohorts.append({
                'name': cohort_data['name'],
                'id': cohort_id
            })
        else:
            error_count += 1
        
        # Commit every 10 records
        if (index + 1) % 10 == 0:
            conn.commit()
            print(f"Processed {index + 1} records. Success: {success_count}, Errors: {error_count}")
    
    # Final commit
    conn.commit()
    print(f"\nImport completed. Total Success: {success_count}, Total Errors: {error_count}")
    
    # Print imported cohorts
    print("\nImported Cohorts:")
    for cohort in imported_cohorts:
        print(f"- {cohort['name']} (ID: {cohort['id']})")
    
    # Close connection
    cur.close()
    conn.close()

if __name__ == "__main__":
    main() 