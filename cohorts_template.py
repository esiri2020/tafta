import pandas as pd
import numpy as np

# Create sample data
data = {
    'Cohort Name': ['Cohort 1', 'Cohort 2', 'Cohort 3'],
    'Start Date': ['2024-01-01', '2024-02-01', '2024-03-01'],
    'End Date': ['2024-06-30', '2024-07-31', '2024-08-31'],
    'Color': ['#FF5733', '#33FF57', '#3357FF']
}

# Create DataFrame
df = pd.DataFrame(data)

# Save to Excel
df.to_excel('cohorts_master.xlsx', index=False)

print("Template Excel file 'cohorts_master.xlsx' has been created.")
print("\nPlease fill in the following columns:")
print("1. Cohort Name: Name of the cohort (e.g., 'Cohort 1', 'Cohort 2', etc.)")
print("2. Start Date: Start date of the cohort (YYYY-MM-DD format)")
print("3. End Date: End date of the cohort (YYYY-MM-DD format)")
print("4. Color: Color code for the cohort (hex format, e.g., '#FF5733')") 