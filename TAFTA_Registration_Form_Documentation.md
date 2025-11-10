# TAFTA Registration Form Documentation

## Table of Contents
1. [Registration Flow Overview](#registration-flow-overview)
2. [Step 0: Course Selection and Registration Type](#step-0-course-selection-and-registration-type)
3. [Step 1: Register for TAFTA Cohort](#step-1-register-for-tafta-cohort)
4. [Step 2: Verify Email](#step-2-verify-email)
5. [Step 3: Personal Information](#step-3-personal-information)
6. [Step 4: End of Application](#step-4-end-of-application)

---

## Registration Flow Overview

**Registration Steps:**
1. Course Selection
2. Register
3. Verify Email
4. Personal Information
5. EndOfApplication
---

## Step 0: Course Selection and Registration Type

**Component:** `InitialCourseSelectionNew`  
**File:** `components/home/personal-information-new.js`

### Title
**"Select Registration Type and Course"**

### Registration Type Section

**Label:** "Registration Type"  
**Field Name:** `registrationType`  
**Type:** Radio Group  
**Required:** Yes

**Radio Options:**
- **Option 1:**
  - **Value:** `INDIVIDUAL`
  - **Label:** "Individual"
  - **Post-Condition:** When selected, sets `registrationType` to `'INDIVIDUAL'` and stores in localStorage. Title changes to "Register for TAFTA Cohort (Individual)".

- **Option 2:**
  - **Value:** `ENTERPRISE`
  - **Label:** "Enterprise"
  - **Post-Condition:** When selected, sets `registrationType` to `'ENTERPRISE'` and stores in localStorage. Title changes to "Register for TAFTA Cohort (Enterprise)". In Step 1, "Business Name" field becomes required and visible.

### Select Course Section

**Label:** "Select Course"  
**Field Name:** `enrollmentId`  
**Type:** Radio Group  
**Required:** Yes  
**Validation:** Course selection is required

**Radio Options:**
- Dynamic list of courses from `cohortCourses`
- Each course displays: `cohort_course.course.name`
- **Value:** `cohort_course.id`
- **Post-Condition:** When course is selected:
  - Saves to localStorage:
    - `selectedCourse` = `cohort_course.id`
    - `selectedCohortId` = `cohort_course.cohortId`
    - `selectedCourseName` = `cohort_course.course.name`
    - `selectedCourseActualId` = `cohort_course.course.id.toString()`

**Error Message (if no courses):**
"No courses available. Please contact the administrator."

**Buttons:**
- **Back:** Disabled on step 0
- **Skip:** Only shown if step is optional
- **Continue:** Disabled if no courses available

---

## Step 1: Register for TAFTA Cohort

**Component:** `RegisterStepNew`  
**File:** `components/home/register-step0-new.js`

### Title
**"Register for TAFTA Cohort (Individual)"** or **"Register for TAFTA Cohort (Enterprise)"**

### Form Fields

#### Business Name (Enterprise Only - Conditional)
**Condition:** Only shown when `registrationType === 'ENTERPRISE'`

**Label:** "Business Name"  
**Field Name:** `businessName`  
**Type:** TextField  
**Required:** Yes (only for Enterprise)  
**Placeholder:** None  
**Validation:** 
- Max length: 255 characters
- Required when registrationType is 'ENTERPRISE'

#### First Name
**Label:** "First Name"  
**Field Name:** `firstName`  
**Type:** TextField  
**Required:** Yes  
**Placeholder:** None  
**Validation:** Max 255 characters, required

#### Middle Name
**Label:** "Middle Name"  
**Field Name:** `middleName`  
**Type:** TextField  
**Required:** Yes  
**Placeholder:** None  
**Validation:** Max 255 characters, required

#### Last Name
**Label:** "Last Name"  
**Field Name:** `lastName`  
**Type:** TextField  
**Required:** Yes  
**Placeholder:** None  
**Validation:** Max 50 characters, required

#### Email Address
**Label:** "Email Address"  
**Field Name:** `email`  
**Type:** TextField (email)  
**Required:** Yes  
**Placeholder:** None  
**AutoComplete:** `username`  
**Validation:** 
- Must be valid email format
- Max 100 characters
- Required

#### Password
**Label:** "Password"  
**Field Name:** `password`  
**Type:** TextField (password with show/hide toggle)  
**Required:** Yes  
**Placeholder:** None  
**AutoComplete:** `new-password`  
**Validation:** 
- Min 6 characters
- Max 50 characters
- Required

#### Confirm Password
**Label:** "Confirm Password"  
**Field Name:** `confirmPassword`  
**Type:** TextField (password with show/hide toggle)  
**Required:** Yes  
**Placeholder:** None  
**AutoComplete:** `new-password`  
**Validation:** 
- Must match password field
- Required

**Buttons:**
- **Back:** Disabled if activeStep === 0
- **Skip:** Only shown if step is optional
- **Continue:** Submit button

---

## Step 2: Verify Email

**Component:** `VerifyEmail`  
**File:** `components/home/personal-information-new.js`

### Email Verification
User receives email verification link and must verify before proceeding.

---

## Step 3: Personal Information

**Component:** `PersonalInformation`  
**File:** `components/home/personal-information-main.tsx`

### Main Title
**"Personal Information"**

### Section 1: Basic Information

**Section Title:** "Basic Information"

#### First Name
**Label:** "First Name"  
**Field Name:** `firstName`  
**Type:** Input  
**Required:** Yes  
**Placeholder:** "Enter your first name"  
**Tooltip:** "Enter your legal first name as it appears on your official documents"

#### Middle Name
**Label:** "Middle Name"  
**Field Name:** `middleName`  
**Type:** Input  
**Required:** No  
**Placeholder:** "Enter your middle name"  
**Tooltip:** "Enter your legal middle name as it appears on your official documents"

#### Last Name
**Label:** "Last Name"  
**Field Name:** `lastName`  
**Type:** Input  
**Required:** Yes  
**Placeholder:** "Enter your last name"  
**Tooltip:** "Enter your legal last name as it appears on your official documents"

#### Email Address
**Label:** "Email Address"  
**Field Name:** `email`  
**Type:** Input (email)  
**Required:** Yes  
**Placeholder:** "Enter your email address"  
**Tooltip:** "This email will be used for all communications and cannot be changed"  
**Disabled:** Yes (unless type === 'admin')

#### Phone Number
**Label:** "Phone Number"  
**Field Name:** `phoneNumber`  
**Type:** Input  
**Required:** No  
**Placeholder:** "Enter your phone number"  
**Tooltip:** "Enter a valid phone number that can be used to contact you"

#### Gender
**Label:** "Gender"  
**Field Name:** `gender`  
**Type:** Select  
**Required:** No  
**Placeholder:** "Select gender"  
**Tooltip:** "Select the gender you identify with"  
**Options:**
- MALE
- FEMALE

#### Date of Birth
**Label:** "Date of Birth"  
**Field Name:** `dob`  
**Type:** DatePicker  
**Required:** No  
**Placeholder:** "Select your date of birth"  
**Tooltip:** "Select your date of birth. You must be at least 15 years old."  
**Min Year:** 1940  
**Max Year:** Current year - 15  
**Post-Condition:** Automatically calculates and sets `ageRange` based on selected date

#### Age Range
**Label:** "Age Range"  
**Field Name:** `ageRange`  
**Type:** Select (disabled - auto-populated)  
**Required:** No  
**Placeholder:** "Select age range"  
**Tooltip:** "Select the age range that includes your current age"  
**Options:**
- 15 - 19
- 20 - 24
- 25 - 29
- 30 - 34
- 35 - 39
- 40 - 44
- 45 - 49
- 50 - 54
- 55 - 59
- 60 - 64

---

### Section 2: Location Information

**Section Title:** "Location Information"

#### Home Address
**Label:** "Home Address"  
**Field Name:** `homeAddress`  
**Type:** Textarea  
**Required:** No  
**Placeholder:** "Enter your home address"  
**Tooltip:** "Enter your current residential address where you can receive mail"

#### State of Residence
**Label:** "State of Residence"  
**Field Name:** `stateOfResidence`  
**Type:** Select  
**Required:** No  
**Placeholder:** "Select state"  
**Tooltip:** "Select the Nigerian state where you currently reside"  
**Options:**
- Kano
- Lagos
- Ogun

**Post-Condition:** When state is selected, populates `LGADetails` dropdown with available LGAs for that state

#### LGA Details
**Label:** "LGA Details"  
**Field Name:** `LGADetails`  
**Type:** Select  
**Required:** No  
**Placeholder:** "Select LGA"  
**Tooltip:** "Select your Local Government Area within your state of residence"  
**Disabled:** Yes (until state is selected)  
**Options:** Dynamic based on selected state

**LGA Options by State:**

**Lagos:**
- Group1: Lagos Island, Lagos Mainland
- Group2: Agege, Alimosho, Ifako-Ijaiye, Ikeja, Mushin, Oshodi-Isolo
- Group3: Ajeromi-Ifelodun, Apapa, Badagry, Ojo
- Group4: Amuwo-Odofin, Ikorodu, Kosofe, Surulere
- Group5: Epe, Eti-Osa, Ibeju-Lekki

**Ogun:**
- Group1: Abeokuta North, Abeokuta South, Odeda, Obafemi Owode
- Group2: Ado-Odo/Ota, Ifo
- Group3: Ijebu East, Ijebu North, Ijebu North East, Ijebu Ode
- Group4: Egbado North, Egbado South, Imeko Afon
- Group5: Ewekoro, Ikenne, Ipokia, Ogun Waterside, Remo North, Shagamu

**Kano:**
- Group1: Dala, Fagge, Gwale, Kano Municipal, Nasarawa, Tarauni, Ungogo
- Group2: Dawakin Tofa, Gwarzo, Madobi, Makoda, Rogo, Tsanyawa
- Group3: Bunkure, Dambatta, Garun Mallam, Kibiya, Maimako, Rano, Sumaila, Wudil
- Group4: Kabo, Kibiya, Kiru, Rimin Gado, Shanono
- Group5: Ajingi, Bebeji, Bichi, Doguwa, Gezawa, Karaye, Kunchi
- Group6: Kumbotso, Gaya, Albasu, Gabasawa, Dawakin kudu, Minjibir, Tofa, Kura, Warawa, Tudun wada, Takai, Doguwa, Garko, Bagwai

#### Community Area
**Label:** "Community Area"  
**Field Name:** `communityArea`  
**Type:** Radio Group  
**Required:** No  
**Placeholder:** None  
**Tooltip:** "Indicate whether you live in an urban, peri-urban, or rural area"  
**Radio Options:**
- **Value:** `URBAN` | **Label:** "Urban"
- **Value:** `RURAL` | **Label:** "Rural"
- **Value:** `PERI_URBANS` | **Label:** "Peri-Urban"

---

### Section 3: Education & Disability

**Section Title:** "Education & Disability"

#### Education Level
**Label:** "Education Level"  
**Field Name:** `educationLevel`  
**Type:** Radio Group  
**Required:** Yes  
**Placeholder:** None  
**Tooltip:** "Select your highest level of education"  
**Radio Options:**
- **Value:** `ELEMENTRY_SCHOOL` | **Label:** "Elementary School"
- **Value:** `SECONDARY_SCHOOL` | **Label:** "Secondary School"
- **Value:** `COLLEGE_OF_EDUCATION` | **Label:** "College of Education"
- **Value:** `ND_HND` | **Label:** "ND/HND"
- **Value:** `BSC` | **Label:** "BSc"
- **Value:** `MSC` | **Label:** "MSc"
- **Value:** `vocational` | **Label:** "Vocational"
- **Value:** `PHD` | **Label:** "PhD"

#### Do you have any disabilities?
**Label:** "Do you have any disabilities?"  
**Field Name:** `_disability`  
**Type:** Radio Group  
**Required:** Yes  
**Placeholder:** None  
**Tooltip:** "Please indicate if you have any disabilities"  
**Radio Options:**
- **Value:** `true` | **Label:** "Yes"
  - **Post-Condition:** When "Yes" is selected, shows "Type of Disability" field below
- **Value:** `false` | **Label:** "No"
  - **Post-Condition:** When "No" is selected, clears `disability` field

#### Type of Disability (Conditional)
**Condition:** Only shown when `_disability === true`

**Label:** "Type of Disability"  
**Field Name:** `disability`  
**Type:** Radio Group  
**Required:** Yes (when _disability is true)  
**Placeholder:** None  
**Tooltip:** "Please specify your type of disability"  
**Disabled:** Yes (if `_disability` is false)  
**Radio Options:**
- **Value:** `visual` | **Label:** "Visual"
- **Value:** `hearing` | **Label:** "Hearing"
- **Value:** `physical` | **Label:** "Physical"
- **Value:** `intellectual` | **Label:** "Intellectual"
- **Value:** `other` | **Label:** "Other"

---

### Section 4: Employment & Residency

**Section Title:** "Employment & Residency"

#### Employment Status
**Label:** "Employment Status"  
**Field Name:** `employmentStatus`  
**Type:** Radio Group  
**Required:** No  
**Placeholder:** None  
**Tooltip:** None  
**Radio Options:**
- **Value:** `employed` | **Label:** "Employed"
  - **Post-Condition:** When selected, shows "Salary Range" and "Employment Sector" fields below
- **Value:** `employed-nysc` | **Label:** "NYSC Employed"
- **Value:** `unemployed` | **Label:** "Unemployed"
- **Value:** `self-employed` | **Label:** "Self-Employed"
  - **Post-Condition:** When selected, shows "Self-Employed Type" field below
- **Value:** `student` | **Label:** "Student"
- **Value:** `entrepreneur` | **Label:** "Entrepreneur"
  - **Post-Condition:** When selected, shows "Entrepreneur Business Information" section below

#### Self-Employed Type (Conditional)
**Condition:** Only shown when `employmentStatus === 'self-employed'`

**Label:** "Self-Employed Type"  
**Field Name:** `selfEmployedType`  
**Type:** Radio Group  
**Required:** No  
**Placeholder:** None  
**Tooltip:** None  
**Radio Options:**
- **Value:** `business_owner` | **Label:** "Business Owner"
  - **Post-Condition:** When selected, shows "Entrepreneur Business Information" section
- **Value:** `freelancer` | **Label:** "Freelancer"
- **Value:** `contractor` | **Label:** "Contractor"
- **Value:** `consultant` | **Label:** "Consultant"

#### Salary Range (Conditional)
**Condition:** Only shown when `employmentStatus === 'employed'`

**Label:** "Salary Range"  
**Field Name:** `salaryRange`  
**Type:** Select  
**Required:** No  
**Placeholder:** "Select a salary range"  
**Tooltip:** None  
**Options:**
- **Value:** `under_100000` | **Label:** "Under 100,000"
- **Value:** `100000_500000` | **Label:** "100,000 - 500,000"
- **Value:** `500000_1000000` | **Label:** "500,000 - 1,000,000"
- **Value:** `1000000_2000000` | **Label:** "1,000,000 - 2,000,000"
- **Value:** `2000000_5000000` | **Label:** "2,000,000 - 5,000,000"
- **Value:** `5000000_10000000` | **Label:** "5,000,000 - 10,000,000"
- **Value:** `10000000_20000000` | **Label:** "10,000,000 - 20,000,000"
- **Value:** `20000000_50000000` | **Label:** "20,000,000 - 50,000,000"
- **Value:** `50000000_100000000` | **Label:** "50,000,000 - 100,000,000"
- **Value:** `100000000_200000000` | **Label:** "100,000,000 - 200,000,000"
- **Value:** `200000000_500000000` | **Label:** "200,000,000 - 500,000,000"

#### Employment Sector (Conditional)
**Condition:** Only shown when `employmentStatus === 'employed'`

**Label:** "Employment Sector"  
**Field Name:** `employmentSector`  
**Type:** Select  
**Required:** No  
**Placeholder:** "Select an employment sector"  
**Tooltip:** None  
**Options:**
- **Value:** `agriculture` | **Label:** "Agriculture"
- **Value:** `creatives` | **Label:** "Creatives"
- **Value:** `manufacturing` | **Label:** "Manufacturing"
- **Value:** `services` | **Label:** "Services"
- **Value:** `technology` | **Label:** "Technology"
- **Value:** `finance` | **Label:** "Finance"
- **Value:** `education` | **Label:** "Education"
- **Value:** `healthcare` | **Label:** "Healthcare"
- **Value:** `tourism` | **Label:** "Tourism"
- **Value:** `construction` | **Label:** "Construction"
- **Value:** `retail` | **Label:** "Retail"
- **Value:** `other` | **Label:** "Other"

#### Residency Status
**Label:** "Residency Status"  
**Field Name:** `residencyStatus`  
**Type:** Radio Group  
**Required:** No  
**Placeholder:** None  
**Tooltip:** None  
**Radio Options:**
- **Value:** `resident` | **Label:** "Resident"
- **Value:** `non-resident` | **Label:** "Non-Resident"
- **Value:** `temporary` | **Label:** "Temporary"

---

### Section 5: Entrepreneur Business Information (Conditional)

**Condition:** Only shown when:
- `employmentStatus === 'entrepreneur'` OR
- `selfEmployedType === 'business_owner'`

**Section Title:** "Business Information"

#### Business Name
**Label:** "Business Name"  
**Field Name:** `entrepreneurBusinessName`  
**Type:** Input  
**Required:** Yes  
**Placeholder:** "Enter your business name"  
**Tooltip:** None

#### Business Type
**Label:** "Business Type"  
**Field Name:** `entrepreneurBusinessType`  
**Type:** Select  
**Required:** Yes  
**Placeholder:** "Select business type"  
**Tooltip:** None  
**Options:**
- **Value:** `INFORMAL` | **Label:** "Informal"
- **Value:** `STARTUP` | **Label:** "Startup"
- **Value:** `FORMAL_EXISTING` | **Label:** "Formal (Existing)"

#### Business Size
**Label:** "Business Size"  
**Field Name:** `entrepreneurBusinessSize`  
**Type:** Select  
**Required:** Yes  
**Placeholder:** "Select business size"  
**Tooltip:** None  
**Options:**
- **Value:** `MICRO` | **Label:** "Micro"
- **Value:** `SMALL` | **Label:** "Small"
- **Value:** `MEDIUM` | **Label:** "Medium"
- **Value:** `LARGE` | **Label:** "Large"

#### Business Sector
**Label:** "Business Sector"  
**Field Name:** `entrepreneurBusinessSector`  
**Type:** Select  
**Required:** Yes  
**Placeholder:** "Select business sector"  
**Tooltip:** None  
**Options:** Same as Employment Sector options above

#### Company Phone Number
**Label:** "Company Phone Number"  
**Field Name:** `entrepreneurCompanyPhoneNumber`  
**Type:** Input  
**Required:** No  
**Placeholder:** "Enter company phone number"  
**Tooltip:** None

#### Additional Phone Number
**Label:** "Additional Phone Number"  
**Field Name:** `entrepreneurAdditionalPhoneNumber`  
**Type:** Input  
**Required:** No  
**Placeholder:** "Enter additional phone number"  
**Tooltip:** None

#### Company Email
**Label:** "Company Email"  
**Field Name:** `entrepreneurCompanyEmail`  
**Type:** Input (email)  
**Required:** No  
**Placeholder:** "Enter company email"  
**Tooltip:** None

#### Business Partners
**Label:** "Business Partners"  
**Field Name:** `entrepreneurBusinessPartners`  
**Type:** Input  
**Required:** No  
**Placeholder:** "Enter business partners"  
**Tooltip:** None

#### Revenue Range
**Label:** "Revenue Range"  
**Field Name:** `entrepreneurRevenueRange`  
**Type:** Select  
**Required:** Yes  
**Placeholder:** "Select revenue range"  
**Tooltip:** None  
**Options:** Same as Salary Range options above

#### Registration Type
**Label:** "Registration Type"  
**Field Name:** `entrepreneurRegistrationType`  
**Type:** Checkbox Group (multiple selection allowed)  
**Required:** Yes  
**Placeholder:** None  
**Tooltip:** None  
**Checkbox Options:**
- **Value:** `CAC` | **Label:** "CAC"
- **Value:** `SMEDAN` | **Label:** "SMEDAN"

---

### Section 6: Referral Information

**Section Title:** "Referral Information"

#### How did you hear about Tafta
**Label:** "How did you hear about Tafta"  
**Field Name:** `source`  
**Type:** Radio Group  
**Required:** No  
**Placeholder:** None  
**Tooltip:** "Please let us know how you discovered our program"  
**Radio Options:**
- **Value:** `by_referral` | **Label:** "By Mobilizer"
  - **Post-Condition:** When selected, shows "Mobilizer" dropdown field below

#### Mobilizer (Conditional)
**Condition:** Only shown when `source === 'by_referral'`

**Label:** "Mobilizer"  
**Field Name:** `referrer_fullName`  
**Type:** Select  
**Required:** No  
**Placeholder:** "Select mobilizer" (or "Loading mobilizers..." while loading)  
**Tooltip:** "Select the name of the person who referred you to our program"  
**Disabled:** Yes (while loading)  
**Options:** Dynamic list fetched from `/api/mobilizers/all-codes` endpoint

**Error States:**
- "Loading mobilizers..." while fetching
- "No available mobilizers" if empty

---

### Section 7: Registration & TALP

**Section Title:** "Registration & TALP"

#### TALP Participation
**Label:** "TALP Participation"  
**Field Name:** `talpParticipation`  
**Type:** Radio Group  
**Required:** No  
**Placeholder:** None  
**Tooltip:** None  
**Radio Options:**
- **Value:** `true` | **Label:** "Yes"
  - **Post-Condition:** When "Yes" is selected, shows "TALP Type" field below
- **Value:** `false` | **Label:** "No"
  - **Post-Condition:** When "No" is selected, clears `talpType` and `talpOther` fields

#### TALP Type (Conditional)
**Condition:** Only shown when `talpParticipation === true`

**Label:** "TALP Type"  
**Field Name:** `talpType`  
**Type:** Radio Group  
**Required:** No  
**Placeholder:** None  
**Tooltip:** None  
**Radio Options:**
- **Value:** `film` | **Label:** "Film"
- **Value:** `theater` | **Label:** "Theater"
- **Value:** `content` | **Label:** "Content"
- **Value:** `other` | **Label:** "Other"
  - **Post-Condition:** When "Other" is selected, shows "Please specify" input field below

#### Please specify (Conditional)
**Condition:** Only shown when `talpParticipation === true` AND `talpType === 'other'`

**Label:** "Please specify"  
**Field Name:** `talpOther`  
**Type:** Input  
**Required:** No  
**Placeholder:** None  
**Tooltip:** None

---

### Section 8: Job Readiness

**Section Title:** "Job Readiness"

#### Job Readiness Indicators
**Label:** "Job Readiness Indicators"  
**Field Name:** `jobReadiness`  
**Type:** Checkbox Group (multiple selection allowed)  
**Required:** Yes  
**Placeholder:** None  
**Tooltip:** "Select all job readiness indicators that apply to you"  
**Checkbox Options:**
- **Value:** `cv_reviewed` | **Label:** "CV Reviewed"
- **Value:** `coaching_attended` | **Label:** "Coaching Attended"
- **Value:** `internship_placed` | **Label:** "Internship Placed"

---

### Section 9: Business Information (Enterprise Only - Conditional)

**Condition:** Only shown when `isEnterpriseType === true` (applicant.profile.type === 'ENTERPRISE')

**Section Title:** "Business Information"

#### Business Support
**Label:** "Business Support"  
**Field Name:** `businessSupport`  
**Type:** Checkbox Group (multiple selection allowed)  
**Required:** No  
**Placeholder:** None  
**Tooltip:** "Select all business support services you have already received"  
**Checkbox Options:**
- **Value:** `business_registered` | **Label:** "Business Registered"
- **Value:** `clinic_attended` | **Label:** "Business Clinic Attended"
- **Value:** `coaching_attended` | **Label:** "Business Coaching Attended"

#### Business Support Needs
**Label:** "Business Support Needs"  
**Field Name:** `businessSupportNeeds`  
**Type:** Checkbox Group (multiple selection allowed)  
**Required:** No  
**Placeholder:** None  
**Tooltip:** "Select the business support services you need"  
**Checkbox Options:**
- **Value:** `business_registered` | **Label:** "Business Registration"

#### Business Type
**Label:** "Business Type"  
**Field Name:** `businessType`  
**Type:** Select  
**Required:** No  
**Placeholder:** "Select business type"  
**Tooltip:** "Select the category that best describes your business"  
**Options:**
- **Value:** `INFORMAL` | **Label:** "Informal (unregistered business)"
- **Value:** `STARTUP` | **Label:** "Startup (registered business  1 - 50 staffs)"
- **Value:** `FORMAL_EXISTING` | **Label:** "Formal Existing (registered business  50+ staffs)"

#### Business Sector
**Label:** "Business Sector"  
**Field Name:** `businessSector`  
**Type:** Select  
**Required:** No  
**Placeholder:** "Select a business sector"  
**Tooltip:** "Select the industry sector your business operates in"  
**Options:** Same as Employment Sector options above

#### Business Size
**Label:** "Business Size"  
**Field Name:** `businessSize`  
**Type:** Select  
**Required:** No  
**Placeholder:** "Select a business size"  
**Tooltip:** "Indicate the size of your business based on number of employees"  
**Options:**
- **Value:** `MICRO` | **Label:** "Micro (1 - 5 staffs)"
- **Value:** `SMALL` | **Label:** "Small (6 - 50 staffs)"
- **Value:** `MEDIUM` | **Label:** "Medium (51 - 200 staffs)"
- **Value:** `LARGE` | **Label:** "Large (200+ staffs)"

#### Revenue Range
**Label:** "Revenue Range"  
**Field Name:** `revenueRange`  
**Type:** Select  
**Required:** No  
**Placeholder:** "Select a revenue range"  
**Tooltip:** "Select your business revenue range"  
**Options:** Same as Salary Range options above

#### Business Partners
**Label:** "Business Partners"  
**Field Name:** `businessPartners`  
**Type:** Input  
**Required:** No  
**Placeholder:** None  
**Tooltip:** "List the names of your business partners, if any"

#### Company Phone Number
**Label:** "Company Phone Number"  
**Field Name:** `companyPhoneNumber`  
**Type:** Input  
**Required:** No  
**Placeholder:** None  
**Tooltip:** "Enter the official phone number for your business"

#### Additional Phone Number
**Label:** "Additional Phone Number"  
**Field Name:** `additionalPhoneNumber`  
**Type:** Input  
**Required:** No  
**Placeholder:** None  
**Tooltip:** "Provide an alternative phone number for your business"

#### Company Email
**Label:** "Company Email"  
**Field Name:** `companyEmail`  
**Type:** Input (email)  
**Required:** No  
**Placeholder:** None  
**Tooltip:** "Enter the official email address for your business"

---

## Step 4: End of Application

**Component:** `EndOfApplicationNew`  
**File:** `components/home/personal-information-new.js`

### Title
**"Dear User, you have successfully completed your application. Click Finish to proceed to your dashboard."**

### Finish Button
**Label:** "Finish"  
**Action:** Triggers `handleFinishAndEnroll` function  
**Post-Action:**
1. Fetches user data from `/api/users/me`
2. Fetches enrollment data from `/api/enrollments/cached?user_email=${user.email}`
3. Activates enrollment via `/api/enrollments/retry`
4. Shows success toast: "Registration completed! You are now enrolled in your course."
5. Redirects to `/dashboard`

---

## Registration Type Post-Conditions Summary

### When "Individual" is Selected:
- `registrationType` = `'INDIVIDUAL'`
- Form title: "Register for TAFTA Cohort (Individual)"
- Business Name field is NOT shown in Step 1
- Business Name is NOT required in Step 1
- Business Information section (Section 9) is NOT shown in Step 3

### When "Enterprise" is Selected:
- `registrationType` = `'ENTERPRISE'`
- Form title: "Register for TAFTA Cohort (Enterprise)"
- Business Name field IS shown in Step 1
- Business Name IS required in Step 1
- Business Information section (Section 9) IS shown in Step 3
- All business-related fields become available

---

## Field Name Mapping

### Step 0 (Course Selection)
- `registrationType` → Registration Type radio selection
- `enrollmentId` → Course selection radio

### Step 1 (Register)
- `businessName` → Business Name (Enterprise only)
- `firstName` → First Name
- `middleName` → Middle Name
- `lastName` → Last Name
- `email` → Email Address
- `password` → Password
- `confirmPassword` → Confirm Password

### Step 3 (Personal Information)
- `firstName` → First Name
- `middleName` → Middle Name
- `lastName` → Last Name
- `email` → Email Address
- `phoneNumber` → Phone Number
- `gender` → Gender
- `dob` → Date of Birth
- `ageRange` → Age Range
- `homeAddress` → Home Address
- `stateOfResidence` → State of Residence
- `LGADetails` → LGA Details
- `communityArea` → Community Area
- `educationLevel` → Education Level
- `_disability` → Do you have any disabilities? (boolean)
- `disability` → Type of Disability
- `employmentStatus` → Employment Status
- `selfEmployedType` → Self-Employed Type
- `salaryRange` → Salary Range
- `employmentSector` → Employment Sector
- `residencyStatus` → Residency Status
- `entrepreneurBusinessName` → Business Name (Entrepreneur)
- `entrepreneurBusinessType` → Business Type (Entrepreneur)
- `entrepreneurBusinessSize` → Business Size (Entrepreneur)
- `entrepreneurBusinessSector` → Business Sector (Entrepreneur)
- `entrepreneurCompanyPhoneNumber` → Company Phone Number (Entrepreneur)
- `entrepreneurAdditionalPhoneNumber` → Additional Phone Number (Entrepreneur)
- `entrepreneurCompanyEmail` → Company Email (Entrepreneur)
- `entrepreneurBusinessPartners` → Business Partners (Entrepreneur)
- `entrepreneurRevenueRange` → Revenue Range (Entrepreneur)
- `entrepreneurRegistrationType` → Registration Type (Entrepreneur)
- `source` → How did you hear about Tafta
- `referrer_fullName` → Mobilizer
- `talpParticipation` → TALP Participation (boolean)
- `talpType` → TALP Type
- `talpOther` → Please specify (TALP)
- `jobReadiness` → Job Readiness Indicators (array)
- `businessSupport` → Business Support (Enterprise, array)
- `businessSupportNeeds` → Business Support Needs (Enterprise, array)
- `businessType` → Business Type (Enterprise)
- `businessSector` → Business Sector (Enterprise)
- `businessSize` → Business Size (Enterprise)
- `revenueRange` → Revenue Range (Enterprise)
- `businessPartners` → Business Partners (Enterprise)
- `companyPhoneNumber` → Company Phone Number (Enterprise)
- `additionalPhoneNumber` → Additional Phone Number (Enterprise)
- `companyEmail` → Company Email (Enterprise)

---

## Validation Rules

### Step 1 Validation:
- Email: Required, valid email format, max 100 characters
- Password: Required, min 6 characters, max 50 characters
- Confirm Password: Required, must match password
- First Name: Required, max 255 characters
- Middle Name: Required, max 255 characters
- Last Name: Required, max 50 characters
- Business Name: Required only if `registrationType === 'ENTERPRISE'`, max 255 characters

### Step 3 Validation:
- Education Level: Required
- Disability: Required (Yes/No question)
- Disability Type: Required if `_disability === true`
- Job Readiness: Required (at least one checkbox must be selected)
- Entrepreneur Business Name: Required if entrepreneur section is shown
- Entrepreneur Business Type: Required if entrepreneur section is shown
- Entrepreneur Business Size: Required if entrepreneur section is shown
- Entrepreneur Business Sector: Required if entrepreneur section is shown
- Entrepreneur Revenue Range: Required if entrepreneur section is shown
- Entrepreneur Registration Type: Required if entrepreneur section is shown (at least one checkbox)

---

## End of Document





