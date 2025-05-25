import os
from dotenv import load_dotenv
from prisma import Prisma
from datetime import datetime, timedelta

# Load environment variables
load_dotenv()

async def setup_cohorts():
    """Set up cohorts 1-10 in the database"""
    prisma = Prisma()
    await prisma.connect()

    # Define cohort colors
    colors = [
        "#FF5733", "#33FF57", "#3357FF", "#F333FF", "#33FFF3",
        "#FF3333", "#33FF33", "#3333FF", "#FF33FF", "#33FFFF"
    ]

    # Define cohort dates (example dates - adjust as needed)
    start_date = datetime(2023, 1, 1)
    cohort_duration = timedelta(days=90)  # 3 months per cohort

    try:
        for i in range(1, 11):
            cohort_name = f"Cohort {i}"
            cohort_start = start_date + (i-1) * cohort_duration
            cohort_end = cohort_start + cohort_duration

            # Check if cohort already exists
            existing_cohort = await prisma.cohort.find_first(
                where={
                    "name": cohort_name
                }
            )

            if not existing_cohort:
                # Create new cohort
                cohort = await prisma.cohort.create(
                    data={
                        "name": cohort_name,
                        "start_date": cohort_start,
                        "end_date": cohort_end,
                        "active": i == 10,  # Only the latest cohort is active
                        "color": colors[i-1]
                    }
                )
                print(f"Created cohort: {cohort_name}")
            else:
                print(f"Cohort already exists: {cohort_name}")

    except Exception as e:
        print(f"Error setting up cohorts: {str(e)}")
    finally:
        await prisma.disconnect()

if __name__ == "__main__":
    import asyncio
    asyncio.run(setup_cohorts()) 