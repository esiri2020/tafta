// Nigerian states
export const nigeria_states = ['Kano', 'Lagos', 'Ogun'];

// LGAs by state (simplified example)
export const LGAs = {
  Lagos: {
    Group1: ['Lagos Island', 'Lagos Mainland'],
    Group2: [
      'Agege',
      'Alimosho',
      'Ifako-Ijaiye',
      'Ikeja',
      'Mushin',
      'Oshodi-Isolo',
    ],
    Group3: ['Ajeromi-Ifelodun', 'Apapa', 'Badagry', 'Ojo'],
    Group4: ['Amuwo-Odofin', 'Ikorodu', 'Kosofe', 'Surulere'],
    Group5: ['Epe', 'Eti-Osa', 'Ibeju-Lekki'],
  },
  Ogun: {
    Group1: ['Abeokuta North', 'Abeokuta South', 'Odeda', 'Obafemi Owode'],
    Group2: ['Ado-Odo/Ota', 'Ifo'],
    Group3: ['Ijebu East', 'Ijebu North', 'Ijebu North East', 'Ijebu Ode'],
    Group4: ['Egbado North', 'Egbado South', 'Imeko Afon'],
    Group5: [
      'Ewekoro',
      'Ikenne',
      'Ipokia',
      'Ogun Waterside',
      'Remo North',
      'Shagamu',
    ],
  },
  Kano: {
    Group1: [
      'Dala',
      'Fagge',
      'Gwale',
      'Kano Municipal',
      'Nasarawa',
      'Tarauni',
      'Ungogo',
    ],
    Group2: ['Dawakin Tofa', 'Gwarzo', 'Madobi', 'Makoda', 'Rogo', 'Tsanyawa'],
    Group3: [
      'Bunkure',
      'Dambatta',
      'Garun Mallam',
      'Kibiya',
      'Maimako',
      'Rano',
      'Sumaila',
      'Wudil',
    ],
    Group4: ['Kabo', 'Kibiya', 'Kiru', 'Rimin Gado', 'Shanono'],
    Group5: [
      'Ajingi',
      'Bebeji',
      'Bichi',
      'Doguwa',
      'Gezawa',
      'Karaye',
      'Kunchi',
    ],
    Group6: [
      'Kumbotso',
      'Gaya',
      'Albasu',
      'Gabasawa',
      'Dawakin kudu',
      'Minjibir',
      'Tofa',
      'Kura',
      'Warawa',
      'Tudun wada',
      'Takai',
      'Doguwa',
      'Garko',
      'Bagwai',
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
export const genderList = ['MALE', 'FEMALE'];

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
  {value: 'intellectual', label: 'Intellectual'},
  {value: 'other', label: 'Other'},
];

// Employment status options
export const employment_status = [
  {value: 'employed', label: 'Employed'},
  {value: 'employed-nysc', label: 'NYSC Employed'},
  {value: 'unemployed', label: 'Unemployed'},
  {value: 'self-employed', label: 'Self-Employed'},
  {value: 'student', label: 'Student'},
  {value: 'entrepreneur', label: 'Entrepreneur'},
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
'GENDEI', 'MUB', 'ARO', 'NYSC', 'Dasia23', 'RCCGDD', 'KEN01', 'WOMDEV', 'LANMO', 'AKIN T', 'GOKE19', 'OLUFEMISAMSON',
    'Pearl', 'OGJLE05', 'ADEOLU', 'NAFOGUN', 'KENNYWISE', 'TK001', 'TK002', 'TK003', 'TK004', 'TK005', 'TK006',
    'TK007', 'TK008', 'TK009', 'TK010', 'TK011', 'TK012', 'TK013', 'TK014', 'TK015', 'TK016', 'TK017', 'TK018',
    'TK019', 'TK020', 'TK021', 'TK022', 'TK023', 'TK024', 'TK025', 'TK026', 'TK027', 'TK028', 'TK029', 'TK030',
    'TK031', 'TK032', 'TK033', 'TK034', 'TK035', 'E-SRCOE', 'H-SRCOE', 'UPSKILL', 'LG/LO/003', 'LG/VA/007',
    'LG/EC/011', 'AZMUSIK', 'LASU', 'JAM', 'NATH', 'EMM', 'MATT', 'MAPOLY', 'FCOC', 'DPRINCE', 'ITL', 'PJF',
    'GENDI', 'ACO', 'COMMONWEALTH', 'SPRING', 'N-NYSC', 'Bright- TKC', 'Ige', 'ELS', 'TIM', 'EDU', 'FAS',
    'KLICK', 'FSS', 'AAA', 'JON', 'CENTS', 'DREAMCODE', 'R-L', 'CHO', 'RERE', 'ELPIS', 'O-NYSC', 'TFN',
    'LASUED-TA', 'LASUED-FA', 'LASUED-M', 'emmygrace', 'ADCN', 'ZEAL', 'Uchenna', 'LAG-01', 'ABIM', 'TPLP',
    'Lexxie01', 'YASUG', 'FASA', 'Lola Tafta', 'Coach Ayanfe', 'ARA', 'E-NYSC', 'OD-NYSC', 'SARCO',
    'YERKS KANO', 'YERKS LAGOS', 'YERKS OGUN', 'JULIET', 'BESTM25', 'LOWAN', 'GOD1', 'AAALA', 'NYCN Ibeju'
];

export const business_types = [
  {value: 'INFORMAL', label: 'Informal (unregistered business)'},
  {value: 'STARTUP', label: 'Startup (registered business  1 - 50 staffs)'},
  {
    value: 'FORMAL_EXISTING',
    label: 'Formal Existing (registered business  50+ staffs)',
  },
];

export const business_size = [
  {value: 'MICRO', label: 'Micro (1 - 5 staffs)'},
  {value: 'SMALL', label: 'Small (6 - 50 staffs)'},
  {value: 'MEDIUM', label: 'Medium (51 - 200 staffs)'},
  {value: 'LARGE', label: 'Large (200+ staffs)'},
];

export const business_sectors = [
  {value: 'agriculture', label: 'Agriculture'},
  {value: 'creatives', label: 'Creatives'},
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
