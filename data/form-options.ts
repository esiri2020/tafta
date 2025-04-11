// Nigerian states
export const nigeria_states = ['Kaduna', 'Lagos', 'Ogun'];

// LGAs by state (simplified example)
export const LGAs: Record<string, Record<string, string[]>> = {
  Lagos: {
    group1: [
      'Alimosho',
      'Ajeromi-Ifelodun',
      'Kosofe',
      'Mushin',
      'Oshodi-Isolo',
    ],
    group2: ['Ojo', 'Ikorodu', 'Surulere', 'Agege', 'Ifako-Ijaiye', 'Shomolu'],
    group3: [
      'Amuwo-Odofin',
      'Lagos Mainland',
      'Ikeja',
      'Eti-Osa',
      'Badagry',
      'Apapa',
      'Lagos Island',
      'Epe',
      'Ibeju-Lekki',
    ],
  },
  FCT: {
    group1: [
      'Abaji',
      'Bwari',
      'Gwagwalada',
      'Kuje',
      'Kwali',
      'Municipal Area Council',
    ],
  },
  Kaduna: {
    group1: ['Birnin Gwari', 'Chikun', 'Giwa', 'Igabi', 'Ikara', 'Jaba'],
    group2: [
      "Jema'a",
      'Kachia',
      'Kaduna North',
      'Kaduna South',
      'Kagarko',
      'Kajuru',
    ],
  },
};

// Community areas
export const community_areas = [
  {value: 'URBAN', label: 'Urban'},
  {value: 'RURAL', label: 'Rural'},
  {value: 'PERI_URBANS', label: 'Peri-Urban'},
];

// Age ranges
export const ranges = [
  [15, 19],
  [20, 24],
  [25, 29],
  [30, 34],
  [35, 39],
  [40, 44],
  [45, 49],
  [50, 54],
  [55, 59],
  [60, 64],
];

// Gender options
export const genderList = ['MALE', 'FEMALE', 'OTHER'];

// Education levels
export const levels_of_education = [
  {value: 'ELEMENTRY_SCHOOL', label: 'Elementary School'},
  {value: 'SECONDARY_SCHOOL', label: 'Secondary School'},
  {value: 'COLLEGE_OF_EDUCATION', label: 'College of Education'},
  {value: 'ND_HND', label: 'ND/HND'},
  {value: 'BSC', label: 'BSc'},
  {value: 'MSC', label: 'MSc'},
  {value: 'vocational', label: 'Vocational'},
  {value: 'PHD', label: 'PhD'},
];

// Disability types
export const user_disabilies = [
  {value: 'visual', label: 'Visual'},
  {value: 'hearing', label: 'Hearing'},
  {value: 'physical', label: 'Physical'},
  {value: 'cognitive', label: 'Cognitive'},
  {value: 'other', label: 'Other'},
];

// Employment status options
export const employment_status = [
  {value: 'employed', label: 'Employed'},
  {value: 'unemployed', label: 'Unemployed'},
  {value: 'self-employed', label: 'Self-Employed'},
  {value: 'student', label: 'Student'},
];

// Self-employed types
export const self_employed_types = [
  {value: 'business_owner', label: 'Business Owner'},
  {value: 'freelancer', label: 'Freelancer'},
  {value: 'contractor', label: 'Contractor'},
  {value: 'consultant', label: 'Consultant'},
];

// Residency status options
export const residency_status = [
  {value: 'resident', label: 'Resident'},
  {value: 'non-resident', label: 'Non-Resident'},
  {value: 'temporary', label: 'Temporary'},
];

// Mobilizer list (example data)
export const mobilizer = [
  'MUB',
  'MYD',
  'ARO',
  'NYSC',
  'RCCGDD',
  'KEN01',
  'WOMDEV',
  'LANMO',
  'AKIN T',
  'GOKE19',
  'OLUFEMISAMSON',
  'OLASAM',
  'Pearl',
  'OGJLE05',
  'ADEOLU',
  'NAFOGUN',
  'KENNYWISE',
  'TK001',
  'TK002',
  'TK003',
  'TK004',
  'TK005',
  'TK006',
  'TK007',
  'TK008',
  'TK009',
  'TK010',
  'TK011',
  'TK012',
  'TK013',
  'TK014',
  'TK015',
  'TK016',
  'UPSKILL',
  'TCA',
  'LG/LO/003',
  'LG/VA/007',
  'LG/PA/010',
  'LG/EC/011',
  'VYN',
  'DEBBIE/ FEMI OMOLERE',
  'WISCAR',
  'CYON',
  'ILEADAFRICA',
  'AZMUSIK',
  'NEW MOBILIZER',
  'LASU',
  'JAM',
  'NATH',
  'EMM',
  'MATT',
  'MAPOLY',
  'FCOC',
  'DPRINCE',
];

export const business_types = [
  {value: 'INFORMAL', label: 'Informal (unregistered business)'},
  {value: 'STARTUP', label: 'Startup (registered business  1 - 50 staffs)'},
  {value: 'FORMAL_EXISTING', label: 'Formal Existing (registered business  50+ staffs)'},
];

export const business_size = [
  {value: 'MICRO', label: 'Micro (1 - 5 staffs)'},
  {value: 'SMALL', label: 'Small (6 - 50 staffs)'},
  {value: 'MEDIUM', label: 'Medium (51 - 200 staffs)'},
  {value: 'LARGE', label: 'Large (200+ staffs)'},
];

export const business_sectors = [
  {value: 'agriculture', label: 'Agriculture'},
  {value: 'manufacturing', label: 'Manufacturing'},
  {value: 'services', label: 'Services'},
  {value: 'technology', label: 'Technology'},
  {value: 'finance', label: 'Finance'},
  {value: 'education', label: 'Education'},
  {value: 'healthcare', label: 'Healthcare'},
  {value: 'tourism', label: 'Tourism'},
  {value: 'construction', label: 'Construction'},
  {value: 'retail', label: 'Retail'},
  {value: 'other', label: 'Other'},
];

export const salary_ranges = [
  {value: 'under_100000', label: 'Under 100,000'},
  {value: '100000_500000', label: '100,000 - 500,000'},
  {value: '500000_1000000', label: '500,000 - 1,000,000'},
  {value: '1000000_2000000', label: '1,000,000 - 2,000,000'},
  {value: '2000000_5000000', label: '2,000,000 - 5,000,000'},
  {value: '5000000_10000000', label: '5,000,000 - 10,000,000'},
  {value: '10000000_20000000', label: '10,000,000 - 20,000,000'},
  {value: '20000000_50000000', label: '20,000,000 - 50,000,000'},
  {value: '50000000_100000000', label: '50,000,000 - 100,000,000'},
  {value: '100000000_200000000', label: '100,000,000 - 200,000,000'},
  {value: '200000000_500000000', label: '200,000,000 - 500,000,000'},
];

export const revenue_ranges = [
  {value: 'under_100000', label: 'Under 100,000'},
  {value: '100000_500000', label: '100,000 - 500,000'},
  {value: '500000_1000000', label: '500,000 - 1,000,000'},
  {value: '1000000_2000000', label: '1,000,000 - 2,000,000'},
  {value: '2000000_5000000', label: '2,000,000 - 5,000,000'},
  {value: '5000000_10000000', label: '5,000,000 - 10,000,000'},
  {value: '10000000_20000000', label: '10,000,000 - 20,000,000'},
  {value: '20000000_50000000', label: '20,000,000 - 50,000,000'},
  {value: '50000000_100000000', label: '50,000,000 - 100,000,000'},
  {value: '100000000_200000000', label: '100,000,000 - 200,000,000'},
  {value: '200000000_500000000', label: '200,000,000 - 500,000,000'},
];
