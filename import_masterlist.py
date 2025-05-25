import pandas as pd
import os
from dotenv import load_dotenv
from prisma import Prisma
import asyncio
import aiohttp
from datetime import datetime

# Load environment variables
load_dotenv()

async def rehydrate_thinkific_user(email, session):
    """Rehydrate user data from Thinkific"""
    thinkific_api_key = os.getenv('THINKIFIC_API_KEY')
    if not thinkific_api_key:
        raise ValueError("THINKIFIC_API_KEY not found in environment variables")

    # Get user from Thinkific API
    headers = {
        'X-Auth-API-Key': thinkific_api_key,
        'Content-Type': 'application/json'
    }
    
    # First, find user by email
    async with session.get(
        'https://api.thinkific.com/api/public/v1/users',
        headers=headers,
        params={'query[email]': email}
    ) as response:
        if response.status != 200:
            print(f"Error finding Thinkific user for {email}: {response.status}")
            return None
        
        users = await response.json()
        if not users.get('items'):
            print(f"No Thinkific user found for {email}")
            return None
        
        user_id = users['items'][0]['id']
        
        # Get user's enrollments
        async with session.get(
            f'https://api.thinkific.com/api/public/v1/users/{user_id}/enrollments',
            headers=headers
        ) as response:
            if response.status != 200:
                print(f"Error getting enrollments for {email}: {response.status}")
                return None
            
            enrollments = await response.json()
            return {
                'thinkific_user_id': str(user_id),
                'enrollments': enrollments.get('items', [])
            }

async def import_masterlist(cohort_number):
    """Import data from Masterlist_16.0 for a specific cohort"""
    prisma = Prisma()
    await prisma.connect()
    
    try:
        # Read Excel file
        df = pd.read_excel('Masterlist_16.0.xlsx', sheet_name='Masterlist_16.0 - Masterlist_16.0')
        
        # Filter for the specific cohort
        cohort_df = df[df['Cohort'] == cohort_number]
        
        # Get cohort from database
        cohort = await prisma.cohort.find_first(
            where={
                "name": f"Cohort {cohort_number}"
            }
        )
        
        if not cohort:
            print(f"Cohort {cohort_number} not found in database")
            return
        
        # Process each row
        async with aiohttp.ClientSession() as session:
            for _, row in cohort_df.iterrows():
                email = row['Email']
                
                # Check if user exists
                user = await prisma.user.find_unique(
                    where={
                        "email": email
                    }
                )
                
                # Rehydrate Thinkific data
                thinkific_data = await rehydrate_thinkific_user(email, session)
                
                if user:
                    # Update existing user
                    await prisma.user.update(
                        where={
                            "id": user.id
                        },
                        data={
                            "firstName": row.get('First Name'),
                            "lastName": row.get('Last Name'),
                            "middleName": row.get('Middle Name'),
                            "thinkific_user_id": thinkific_data['thinkific_user_id'] if thinkific_data else None
                        }
                    )
                    
                    # Update or create profile
                    await prisma.profile.upsert(
                        where={
                            "userId": user.id
                        },
                        create={
                            "userId": user.id,
                            "phoneNumber": row.get('Phone Number'),
                            "gender": row.get('Gender'),
                            "dob": pd.to_datetime(row.get('Date of Birth')) if pd.notna(row.get('Date of Birth')) else None,
                            "homeAddress": row.get('Home Address'),
                            "stateOfResidence": row.get('State of Residence'),
                            "LGADetails": row.get('LGA Details'),
                            "communityArea": row.get('Community Area'),
                            "educationLevel": row.get('Education Level'),
                            "employmentStatus": row.get('Employment Status'),
                            "employmentSector": row.get('Employment Sector'),
                            "selfEmployedType": row.get('Self Employed Type'),
                            "residencyStatus": row.get('Residency Status'),
                            "disability": row.get('Disability'),
                            "source": row.get('Source'),
                            "type": row.get('Type'),
                            "registrationMode": row.get('Registration Mode'),
                            "businessName": row.get('Business Name'),
                            "businessType": row.get('Business Type'),
                            "businessSize": row.get('Business Size'),
                            "businessSector": row.get('Business Sector'),
                            "businessPartners": row.get('Business Partners'),
                            "companyPhoneNumber": row.get('Company Phone Number'),
                            "additionalPhoneNumber": row.get('Additional Phone Number'),
                            "companyEmail": row.get('Company Email'),
                            "revenueRange": row.get('Revenue Range'),
                            "registrationType": row.get('Registration Type'),
                            "businessSupportNeeds": row.get('Business Support Needs', '').split(',') if pd.notna(row.get('Business Support Needs')) else []
                        },
                        update={
                            "phoneNumber": row.get('Phone Number'),
                            "gender": row.get('Gender'),
                            "dob": pd.to_datetime(row.get('Date of Birth')) if pd.notna(row.get('Date of Birth')) else None,
                            "homeAddress": row.get('Home Address'),
                            "stateOfResidence": row.get('State of Residence'),
                            "LGADetails": row.get('LGA Details'),
                            "communityArea": row.get('Community Area'),
                            "educationLevel": row.get('Education Level'),
                            "employmentStatus": row.get('Employment Status'),
                            "employmentSector": row.get('Employment Sector'),
                            "selfEmployedType": row.get('Self Employed Type'),
                            "residencyStatus": row.get('Residency Status'),
                            "disability": row.get('Disability'),
                            "source": row.get('Source'),
                            "type": row.get('Type'),
                            "registrationMode": row.get('Registration Mode'),
                            "businessName": row.get('Business Name'),
                            "businessType": row.get('Business Type'),
                            "businessSize": row.get('Business Size'),
                            "businessSector": row.get('Business Sector'),
                            "businessPartners": row.get('Business Partners'),
                            "companyPhoneNumber": row.get('Company Phone Number'),
                            "additionalPhoneNumber": row.get('Additional Phone Number'),
                            "companyEmail": row.get('Company Email'),
                            "revenueRange": row.get('Revenue Range'),
                            "registrationType": row.get('Registration Type'),
                            "businessSupportNeeds": row.get('Business Support Needs', '').split(',') if pd.notna(row.get('Business Support Needs')) else []
                        }
                    )
                else:
                    # Create new user
                    user = await prisma.user.create(
                        data={
                            "email": email,
                            "firstName": row.get('First Name'),
                            "lastName": row.get('Last Name'),
                            "middleName": row.get('Middle Name'),
                            "role": "APPLICANT",
                            "thinkific_user_id": thinkific_data['thinkific_user_id'] if thinkific_data else None,
                            "profile": {
                                "create": {
                                    "phoneNumber": row.get('Phone Number'),
                                    "gender": row.get('Gender'),
                                    "dob": pd.to_datetime(row.get('Date of Birth')) if pd.notna(row.get('Date of Birth')) else None,
                                    "homeAddress": row.get('Home Address'),
                                    "stateOfResidence": row.get('State of Residence'),
                                    "LGADetails": row.get('LGA Details'),
                                    "communityArea": row.get('Community Area'),
                                    "educationLevel": row.get('Education Level'),
                                    "employmentStatus": row.get('Employment Status'),
                                    "employmentSector": row.get('Employment Sector'),
                                    "selfEmployedType": row.get('Self Employed Type'),
                                    "residencyStatus": row.get('Residency Status'),
                                    "disability": row.get('Disability'),
                                    "source": row.get('Source'),
                                    "type": row.get('Type'),
                                    "registrationMode": row.get('Registration Mode'),
                                    "businessName": row.get('Business Name'),
                                    "businessType": row.get('Business Type'),
                                    "businessSize": row.get('Business Size'),
                                    "businessSector": row.get('Business Sector'),
                                    "businessPartners": row.get('Business Partners'),
                                    "companyPhoneNumber": row.get('Company Phone Number'),
                                    "additionalPhoneNumber": row.get('Additional Phone Number'),
                                    "companyEmail": row.get('Company Email'),
                                    "revenueRange": row.get('Revenue Range'),
                                    "registrationType": row.get('Registration Type'),
                                    "businessSupportNeeds": row.get('Business Support Needs', '').split(',') if pd.notna(row.get('Business Support Needs')) else []
                                }
                            }
                        }
                    )
                
                # Assign user to cohort
                await prisma.userCohort.upsert(
                    where={
                        "userId_cohortId": {
                            "userId": user.id,
                            "cohortId": cohort.id
                        }
                    },
                    create={
                        "userId": user.id,
                        "cohortId": cohort.id
                    },
                    update={}
                )
                
                # Create enrollments if Thinkific data exists
                if thinkific_data and thinkific_data.get('enrollments'):
                    for enrollment in thinkific_data['enrollments']:
                        await prisma.enrollment.create(
                            data={
                                "userCohortId": cohort.id,
                                "course_name": enrollment.get('course_name', ''),
                                "course_id": enrollment.get('course_id', 0),
                                "enrolled": True,
                                "started_at": pd.to_datetime(enrollment.get('started_at')) if enrollment.get('started_at') else None,
                                "completed_at": pd.to_datetime(enrollment.get('completed_at')) if enrollment.get('completed_at') else None,
                                "percentage_completed": enrollment.get('percentage_completed', 0)
                            }
                        )
                
                print(f"Processed user: {email}")
    
    except Exception as e:
        print(f"Error importing data: {str(e)}")
    finally:
        await prisma.disconnect()

if __name__ == "__main__":
    # Get cohort number from command line argument
    import sys
    if len(sys.argv) != 2:
        print("Usage: python import_masterlist.py <cohort_number>")
        sys.exit(1)
    
    cohort_number = int(sys.argv[1])
    asyncio.run(import_masterlist(cohort_number)) 