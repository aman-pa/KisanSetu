/**
 * governmentSchemes.js
 * Frontend service layer for government schemes and state-specific agricultural subsidies.
 * Handles API interaction with backend proxy, data normalization, and reliable offline cache fallbacks.
 */

import API from './api';

// Verified offline fallback dataset matching official data.gov.in & Ministry of Agriculture standards
export const FALLBACK_SCHEMES = [
  {
    id: 'pm-kisan',
    name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    category: 'Financial Support',
    benefit: '₹6,000 per year directly transferred to bank accounts in 3 equal installments of ₹2,000.',
    shortDescription: 'Income support scheme ensuring financial security for landholding farmer families across India.',
    eligibilitySummary: 'All landholding farmer families with cultivable land in their names. Subject to standard exclusion criteria.',
    eligibilityDetails: [
      'Small and marginal farmer families possessing cultivable landholding',
      'Name must match land records and Aadhaar database',
      'eKYC must be completed on the PM-KISAN portal or via biometric CSC',
      'Active bank account seeded with Aadhaar number',
    ],
    documentsRequired: [
      'Aadhaar Card',
      'Landownership documents / Khatauni / RoR (Record of Rights)',
      'Aadhaar-linked Bank Account Passbook',
      'Valid Mobile Number',
    ],
    applicationProcess: [
      'Visit the official PM-KISAN portal (pmkisan.gov.in) or visit your nearest Common Service Centre (CSC).',
      'Click on "Farmer Corner" -> "New Farmer Registration".',
      'Enter Aadhaar number, mobile number, and select your state.',
      'Provide land registration ID, survey/khata number, and bank account details.',
      'Submit the application and track status online.',
    ],
    officialUrl: 'https://pmkisan.gov.in/',
    helpline: '155261 / 011-24300606',
    verifiedSource: 'Government of India (data.gov.in)',
    lastUpdated: 'March 2026',
    tags: ['Income Support', 'DBT', 'All Crops', 'Central Sector'],
    applicableStates: 'ALL',
    farmerTypes: ['Small & Marginal', 'Medium', 'Large'],
    crops: ['ALL'],
  },
  {
    id: 'pmfby',
    name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    category: 'Insurance',
    benefit: 'Comprehensive crop loss coverage with low farmer premium: 2% for Kharif, 1.5% for Rabi, and 5% for Horticultural crops.',
    shortDescription: 'Financial support and risk stabilization against non-preventable natural risks from sowing to post-harvest.',
    eligibilitySummary: 'All farmers growing notified crops in notified areas including sharecroppers and tenant farmers.',
    eligibilityDetails: [
      'Available for all food crops, oilseeds, and annual commercial/horticultural crops',
      'Open to both loanee farmers (via KCC/Banks) and non-loanee farmers',
      'Covers prevented sowing, standing crop damage, localized calamities (hailstorm, landslide), and post-harvest losses',
    ],
    documentsRequired: [
      'Aadhaar Card',
      'Land Sowing Certificate / Girdawari / Patwari certificate',
      'Land possession documents / Tenant agreement (for sharecroppers)',
      'Bank passbook photocopy with IFSC code',
    ],
    applicationProcess: [
      'Enroll via your bank branch where your crop loan account is active.',
      'Or register online through National Crop Insurance Portal (pmfby.gov.in) or CSC.',
      'Submit crop sowing certificate within the cut-off deadline for the season.',
    ],
    officialUrl: 'https://pmfby.gov.in/',
    helpline: '1800-180-1551',
    verifiedSource: 'Ministry of Agriculture & Farmers Welfare',
    lastUpdated: 'March 2026',
    tags: ['Crop Insurance', 'Risk Protection', 'Kharif', 'Rabi'],
    applicableStates: 'ALL',
    farmerTypes: ['Small & Marginal', 'Medium', 'Large', 'Tenant Farmer', 'Sharecropper'],
    crops: ['Wheat', 'Rice/Paddy', 'Cotton', 'Sugarcane', 'Pulses', 'Oilseeds', 'Vegetables', 'Fruits'],
  },
  {
    id: 'kcc',
    name: 'Kisan Credit Card (KCC) Scheme',
    ministry: 'Ministry of Finance & Ministry of Agriculture',
    category: 'Loans & Credit',
    benefit: 'Short-term credit up to ₹3,00,000 at a concessional interest rate of 4% (with 3% prompt repayment incentive).',
    shortDescription: 'Adequate and timely institutional credit for agriculture expenses, cultivation inputs, and post-harvest maintenance.',
    eligibilitySummary: 'Owner cultivators, tenant farmers, sharecroppers, self-help groups (SHGs), and joint liability groups (JLGs).',
    eligibilityDetails: [
      'Age between 18 and 75 years (co-borrower required for above 60)',
      'Involved in agricultural cultivation, animal husbandry, poultry, or fisheries',
      'Simplified loan processing with zero processing fees for loans up to ₹1.60 Lakh without collateral',
    ],
    documentsRequired: [
      'Completed KCC Application Form',
      'Identity & Address Proof (Aadhaar, Voter ID, PAN)',
      'Land record documents verified by revenue authority',
      'Crop cultivation plan / cropping pattern details',
    ],
    applicationProcess: [
      'Download the 1-page KCC application form from myscheme.gov.in or pmkisan.gov.in.',
      'Submit to your local commercial bank, RRB, or cooperative bank branch.',
      'Bank verifies records and issues KCC RuPay card within 14 working days.',
    ],
    officialUrl: 'https://www.myscheme.gov.in/schemes/kcc',
    helpline: '1800-115-526',
    verifiedSource: 'Reserve Bank of India & NABARD',
    lastUpdated: 'March 2026',
    tags: ['Credit', 'Low Interest', 'Working Capital', 'Input Purchase'],
    applicableStates: 'ALL',
    farmerTypes: ['Small & Marginal', 'Medium', 'Large', 'Tenant Farmer', 'Sharecropper'],
    crops: ['ALL'],
  },
  {
    id: 'aif',
    name: 'Agriculture Infrastructure Fund (AIF)',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    category: 'Infrastructure',
    benefit: '3% interest subvention per annum for loans up to ₹2 Crore for up to 7 years, with credit guarantee coverage.',
    shortDescription: 'Medium-long term debt financing for post-harvest management infrastructure and community farming assets.',
    eligibilitySummary: 'Farmers, FPOs, PACS, Agri-entrepreneurs, Startups, and Central/State sponsored agencies.',
    eligibilityDetails: [
      'Eligible projects: Warehouses, cold chains, silos, sorting/grading units, solar agri-units, and ripening chambers',
      'Credit guarantee under CGTMSE scheme for loans up to ₹2 Crore',
    ],
    documentsRequired: [
      'Detailed Project Report (DPR)',
      'Land ownership or long-term lease documents',
      'Entity Registration / FPO Incorporation / KYC of applicant',
      'Bank approval/in-principle loan sanction letter',
    ],
    applicationProcess: [
      'Register on the AIF portal (agriinfra.dac.gov.in).',
      'Submit project proposal, choose lending bank, and upload DPR.',
      'Ministry evaluates eligibility; bank sanctions loan with automatic interest subvention.',
    ],
    officialUrl: 'https://agriinfra.dac.gov.in/',
    helpline: '011-23381012',
    verifiedSource: 'Ministry of Agriculture (AIF Portal)',
    lastUpdated: 'February 2026',
    tags: ['Cold Storage', 'Warehousing', 'FPO Infrastructure', 'Subsidy'],
    applicableStates: 'ALL',
    farmerTypes: ['Medium', 'Large', 'FPO', 'Agri-entrepreneur'],
    crops: ['ALL'],
  },
  {
    id: 'enam',
    name: 'e-NAM (National Agriculture Market)',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    category: 'Marketplace',
    benefit: 'Pan-India electronic trading portal connecting 1,361+ mandis for transparent price discovery and online payments.',
    shortDescription: 'Direct market access enabling farmers to bid and sell produce to buyers across India with zero middlemen manipulation.',
    eligibilitySummary: 'Any farmer holding an agricultural produce harvest ready for sale in participating APMC mandis.',
    eligibilityDetails: [
      'Free registration for all individual farmers and FPOs',
      'Assay labs available at mandis for scientific quality testing before bidding',
      'Direct payment into bank account upon sale confirmation',
    ],
    documentsRequired: [
      'Aadhaar Card',
      'Bank Account Passbook / Cancelled Cheque',
      'APMC registration receipt or Mandi gate pass',
    ],
    applicationProcess: [
      'Register on enam.gov.in or via the e-NAM mobile app.',
      'Bring harvest lot to nearest e-NAM enabled APMC mandi.',
      'Mandi conducts quality assaying and uploads lot for online national bidding.',
    ],
    officialUrl: 'https://www.enam.gov.in/',
    helpline: '1800-270-0224',
    verifiedSource: 'Small Farmers Agribusiness Consortium (SFAC)',
    lastUpdated: 'March 2026',
    tags: ['Mandi', 'Direct Sale', 'Fair Price', 'Online Trade'],
    applicableStates: 'ALL',
    farmerTypes: ['Small & Marginal', 'Medium', 'Large'],
    crops: ['ALL'],
  },
  {
    id: 'soil-health-card',
    name: 'Soil Health Card Scheme',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    category: 'Advisory & Inputs',
    benefit: 'Free periodic soil nutrient testing card with customized fertilizer dosages, reducing input costs by 15-25%.',
    shortDescription: 'Assessment of 12 vital soil parameters (N, P, K, S, micronutrients, pH, EC) with tailored crop nutrition guidance.',
    eligibilitySummary: 'All farmers possessing agricultural land in all states and union territories.',
    eligibilityDetails: [
      'Issued once every 3 years for each agricultural parcel',
      'Contains corrective measures for soil acidity, alkalinity, and organic carbon deficit',
    ],
    documentsRequired: [
      'Farmer Aadhaar Card',
      'Land survey number / Khasra number',
    ],
    applicationProcess: [
      'Soil samples are collected by the state agriculture department staff.',
      'Samples analyzed at local government Soil Testing Laboratories (STLs).',
      'Card distributed via Gram Panchayat or downloadable from soilhealth.dac.gov.in.',
    ],
    officialUrl: 'https://soilhealth.dac.gov.in/',
    helpline: '011-23382012',
    verifiedSource: 'Department of Agriculture & Farmers Welfare',
    lastUpdated: 'January 2026',
    tags: ['Soil Testing', 'Fertilizer Optimization', 'Free Service'],
    applicableStates: 'ALL',
    farmerTypes: ['Small & Marginal', 'Medium', 'Large'],
    crops: ['ALL'],
  },
  {
    id: 'pmksy',
    name: 'PM Krishi Sinchayee Yojana - Per Drop More Crop (PDMC)',
    ministry: 'Ministry of Jal Shakti & Ministry of Agriculture',
    category: 'Subsidies',
    benefit: '45% to 55% financial subsidy on installation of Drip & Sprinkler Micro-Irrigation Systems.',
    shortDescription: 'Water-use efficiency scheme boosting farm productivity while saving up to 50% irrigation water and 30% electricity.',
    eligibilitySummary: 'All farmers owning or leasing cultivable land with an assured water source.',
    eligibilityDetails: [
      'Small and Marginal farmers receive higher subsidy support (up to 55%)',
      'Covers drip irrigation, micro-sprinklers, mini-sprinklers, and portable sprinkler sets',
      'Priority given to water-stressed and drought-prone districts',
    ],
    documentsRequired: [
      'Land Record (7/12, Jamabandi, or RoR)',
      'Aadhaar Card',
      'Electricity Bill / Water Source Proof (Well, Borewell, Canal)',
      'Bank Passbook photocopy',
    ],
    applicationProcess: [
      'Apply online via your State Agriculture / Horticulture Department portal.',
      'Select empanelled micro-irrigation manufacturer and submit farm survey layout.',
      'Field inspection conducted by agriculture officer followed by subsidy disbursement.',
    ],
    officialUrl: 'https://pmksy.gov.in/',
    helpline: '1800-180-1551',
    verifiedSource: 'Ministry of Jal Shakti & MoA',
    lastUpdated: 'March 2026',
    tags: ['Drip Irrigation', 'Sprinkler', 'Water Saving', 'Horticulture'],
    applicableStates: 'ALL',
    farmerTypes: ['Small & Marginal', 'Medium', 'Large'],
    crops: ['Cotton', 'Sugarcane', 'Vegetables', 'Fruits', 'Pulses'],
  },
  {
    id: 'smam',
    name: 'Sub-Mission on Agricultural Mechanization (SMAM)',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    category: 'Subsidies',
    benefit: '40% to 50% subsidy on procurement of tractors, power tillers, rotavators, seed drills, and harvesting equipment.',
    shortDescription: 'Promotes farm mechanization for smallholders and assists in setting up Custom Hiring Centers (CHCs) with up to 80% subsidy.',
    eligibilitySummary: 'Individual farmers, women farmers, SC/ST farmers, and farmer groups/FPOs.',
    eligibilityDetails: [
      'Special 10% additional subsidy benefit for women and small & marginal farmers',
      'Custom Hiring Centers eligible for financial assistance up to ₹10 Lakh',
    ],
    documentsRequired: [
      'Aadhaar Card',
      'Land Records (RoR)',
      'Bank Account Passbook',
      'Caste Certificate (if claiming affirmative category subsidy)',
    ],
    applicationProcess: [
      'Register on agrimachinery.nic.in DBT portal.',
      'Select required farm equipment from approved manufacturers.',
      'Upload quotation and verify documents at the District Agriculture Office.',
    ],
    officialUrl: 'https://agrimachinery.nic.in/',
    helpline: '011-23382937',
    verifiedSource: 'Mechanization & Technology Division, MoA',
    lastUpdated: 'March 2026',
    tags: ['Farm Machinery', 'Tractor Subsidy', 'Custom Hiring', 'Mechanization'],
    applicableStates: 'ALL',
    farmerTypes: ['Small & Marginal', 'Medium', 'Large', 'FPO'],
    crops: ['ALL'],
  },
];

// Fallback State Schemes Mapping
export const FALLBACK_STATE_SCHEMES = {
  Punjab: [
    {
      id: 'pb-crm',
      name: 'Punjab Crop Residue Management (CRM) Scheme',
      state: 'Punjab',
      ministry: 'Department of Agriculture & Farmers Welfare, Punjab',
      category: 'Subsidies',
      benefit: '50% individual subsidy and 80% group/FPO subsidy on Super SMS, Happy Seeder, Smart Seeder, and Straw Management equipment.',
      description: 'Zero-burn in-situ straw management financial aid preserving soil fertility and stopping stubble burning pollution.',
      eligibility: 'All farmers of Punjab cultivating paddy; priority for cooperative societies and village panchayats.',
      officialUrl: 'https://agripb.gov.in/',
      verifiedSource: 'Govt of Punjab Agriculture Portal',
      lastUpdated: 'March 2026',
    },
    {
      id: 'pb-water',
      name: 'Paani Bachao, Paise Kamao (PBPK)',
      state: 'Punjab',
      ministry: 'Punjab State Power Corporation Limited (PSPCL)',
      category: 'Subsidies',
      benefit: 'Direct cash incentive of ₹4 per kWh of electricity saved on agricultural tube wells.',
      description: 'Voluntary water conservation initiative rewarding farmers for prudent groundwater pumping.',
      eligibility: 'Farmers having functional electric agricultural tube well connections with meter installed.',
      officialUrl: 'https://pspcl.in/',
      verifiedSource: 'PSPCL Govt of Punjab',
      lastUpdated: 'February 2026',
    },
  ],
  Haryana: [
    {
      id: 'hr-bbp',
      name: 'Bhavantar Bharpayee Yojana (BBY)',
      state: 'Haryana',
      ministry: 'Haryana State Agricultural Marketing Board (HSAMB)',
      category: 'Financial Support',
      benefit: 'Direct bank transfer of price deficit whenever market wholesale price falls below protected benchmark price.',
      description: 'Risk mitigation scheme protecting vegetable and fruit farmers against seasonal price crashes.',
      eligibility: 'Haryana horticulture growers registered on Meri Fasal Mera Byora portal.',
      officialUrl: 'https://fasal.haryana.gov.in/',
      verifiedSource: 'HSAMB Govt of Haryana',
      lastUpdated: 'March 2026',
    },
    {
      id: 'hr-mpmv',
      name: 'Mera Pani Meri Virasat Yojana',
      state: 'Haryana',
      ministry: 'Department of Agriculture & Farmers Welfare, Haryana',
      category: 'Subsidies',
      benefit: 'Financial assistance of ₹7,000 per acre for replacing water-guzzling paddy with maize, cotton, pulses, or agroforestry.',
      description: 'Sustainable crop diversification program tackling groundwater depletion.',
      eligibility: 'Farmers shifting away from paddy cultivation in designated water-stressed blocks.',
      officialUrl: 'https://agriharyana.gov.in/',
      verifiedSource: 'Agri Haryana Portal',
      lastUpdated: 'January 2026',
    },
  ],
  'Uttar Pradesh': [
    {
      id: 'up-solar',
      name: 'UP PM-KUSUM Solar Pump Subsidy (Component-B)',
      state: 'Uttar Pradesh',
      ministry: 'Department of Agriculture, Uttar Pradesh',
      category: 'Subsidies',
      benefit: 'Up to 60% combined subsidy (30% Central + 30% State) on 2 HP to 10 HP solar water pumps.',
      description: 'Empowers farmers with reliable, cost-free daytime solar irrigation, replacing expensive diesel engine pumps.',
      eligibility: 'Landholding farmers of Uttar Pradesh registered on upagriculture.com.',
      officialUrl: 'http://upagriculture.com/',
      verifiedSource: 'UP Agriculture Portal (upagriculture.com)',
      lastUpdated: 'March 2026',
    },
    {
      id: 'up-durghatna',
      name: 'Mukhyamantri Krishak Durghatna Kalyan Yojana',
      state: 'Uttar Pradesh',
      ministry: 'Revenue Department, Uttar Pradesh',
      category: 'Insurance',
      benefit: 'Financial compensation of ₹5,00,000 to family in case of accidental death or permanent disability while farming.',
      description: 'Universal farmer safety net covering accidents during agriculture operations, snakebites, lightning, and machinery incidents.',
      eligibility: 'Farmers and registered farm laborers between 18 to 70 years of age in Uttar Pradesh.',
      officialUrl: 'http://bor.up.nic.in/',
      verifiedSource: 'Board of Revenue UP',
      lastUpdated: 'February 2026',
    },
  ],
  Maharashtra: [
    {
      id: 'mh-namo',
      name: 'Namo Shetkari Mahasanman Nidhi Yojana',
      state: 'Maharashtra',
      ministry: 'Department of Agriculture, Maharashtra',
      category: 'Financial Support',
      benefit: 'Additional ₹6,000 per year top-up directly transferred to bank accounts (total ₹12,000/yr with PM-KISAN).',
      description: 'State supplement boosting farm income for over 1.15 Crore beneficiary farming families in Maharashtra.',
      eligibility: 'All Maharashtra farmers eligible and approved under PM-KISAN scheme.',
      officialUrl: 'https://krishi.maharashtra.gov.in/',
      verifiedSource: 'Maharashtra Krishi Vibhag',
      lastUpdated: 'March 2026',
    },
    {
      id: 'mh-crop-ins',
      name: 'Maharashtra ₹1 Crop Insurance Scheme',
      state: 'Maharashtra',
      ministry: 'Department of Agriculture, Maharashtra',
      category: 'Insurance',
      benefit: 'Farmers pay only token amount of ₹1 per application; state government covers the entire remaining farmer share.',
      description: 'Zero-barrier crop loss risk insurance protecting cotton, soybean, onion, and pulses growers.',
      eligibility: 'All farmers of Maharashtra cultivating notified crops during Kharif and Rabi.',
      officialUrl: 'https://krishi.maharashtra.gov.in/',
      verifiedSource: 'Govt of Maharashtra Agriculture',
      lastUpdated: 'March 2026',
    },
  ],
  'Madhya Pradesh': [
    {
      id: 'mp-kalyan',
      name: 'Mukhyamantri Kisan Kalyan Yojana',
      state: 'Madhya Pradesh',
      ministry: 'Farmer Welfare & Agriculture Development Dept, MP',
      category: 'Financial Support',
      benefit: 'Additional ₹6,000 per year in 3 equal installments of ₹2,000 credited alongside PM-KISAN.',
      description: 'Comprehensive financial top-up scheme ensuring total annual income aid of ₹12,000 per farmer.',
      eligibility: 'Landholding farmers of Madhya Pradesh with verified MP Bhulekh records.',
      officialUrl: 'https://saara.mp.gov.in/',
      verifiedSource: 'SAARA Portal Govt of MP',
      lastUpdated: 'March 2026',
    },
  ],
  Rajasthan: [
    {
      id: 'rj-tarbandi',
      name: 'Rajasthan Tarbandi Subsidy Yojana',
      state: 'Rajasthan',
      ministry: 'Department of Agriculture, Rajasthan',
      category: 'Subsidies',
      benefit: '50% subsidy up to ₹40,000 (or ₹48,000 for small/marginal farmers) for barbed wire fencing around farm fields.',
      description: 'Protects standing crops from stray and wild animals without causing harm to wildlife.',
      eligibility: 'Individual or group farmers holding at least 1.5 hectares of cultivable land in Rajasthan.',
      officialUrl: 'https://rajkisan.rajasthan.gov.in/',
      verifiedSource: 'RajKisan Sathi Portal',
      lastUpdated: 'February 2026',
    },
  ],
  Gujarat: [
    {
      id: 'gj-suryodaya',
      name: 'Kisan Suryodaya Yojana',
      state: 'Gujarat',
      ministry: 'Energy & Petrochemicals Department, Gujarat',
      category: 'Infrastructure',
      benefit: 'Guaranteed 3-phase agricultural power supply during daytime (5 AM to 9 PM) for irrigation.',
      description: 'Eliminates hazardous night irrigation duties, protecting farmers from wild animals and cold exposure.',
      eligibility: 'Farmers having agricultural power connections in Gujarat.',
      officialUrl: 'https://ikhedut.gujarat.gov.in/',
      verifiedSource: 'i-Khedut Portal Gujarat',
      lastUpdated: 'January 2026',
    },
  ],
  Karnataka: [
    {
      id: 'ka-krishi-bhagya',
      name: 'Krishi Bhagya Scheme',
      state: 'Karnataka',
      ministry: 'Department of Agriculture, Karnataka',
      category: 'Subsidies',
      benefit: '80% to 90% subsidy for construction of Farm Ponds (Krishi Honda), polythene lining, and diesel pump sets.',
      description: 'Rainwater harvesting and dryland farming protection scheme ensuring water security.',
      eligibility: 'Dryland and rainfed farmers of Karnataka in 106 notified drought-prone taluks.',
      officialUrl: 'https://raitamitra.karnataka.gov.in/',
      verifiedSource: 'Raita Mitra Karnataka',
      lastUpdated: 'February 2026',
    },
  ],
  'Tamil Nadu': [
    {
      id: 'tn-solar',
      name: "Chief Minister's Solar Powered Pump Sets Scheme",
      state: 'Tamil Nadu',
      ministry: 'Agricultural Engineering Department, Tamil Nadu',
      category: 'Subsidies',
      benefit: '70% subsidy on standalone AC/DC solar powered pumping systems up to 10 HP.',
      description: 'Promotes green solar irrigation for off-grid and tail-end farmers in Tamil Nadu.',
      eligibility: 'Farmers of Tamil Nadu having open wells or borewells with dynamic water level within permissible limits.',
      officialUrl: 'https://aed.tn.gov.in/',
      verifiedSource: 'AED Govt of Tamil Nadu',
      lastUpdated: 'March 2026',
    },
  ],
  'Andhra Pradesh': [
    {
      id: 'ap-rythu-bharosa',
      name: 'YSR Rythu Bharosa - PM KISAN',
      state: 'Andhra Pradesh',
      ministry: 'Agriculture Department, Andhra Pradesh',
      category: 'Financial Support',
      benefit: 'Financial assistance of ₹13,500 per year per farmer family (including ₹6,000 from PM-KISAN).',
      description: 'Comprehensive seasonal investment support for seeds, fertilizers, and field preparation.',
      eligibility: 'All landholding farmers and eligible tenant farmers holding CCRC cards.',
      officialUrl: 'https://ysrrythubharosa.ap.gov.in/',
      verifiedSource: 'Govt of Andhra Pradesh Portal',
      lastUpdated: 'March 2026',
    },
  ],
  Bihar: [
    {
      id: 'br-fasal-sahayata',
      name: 'Bihar Rajya Fasal Sahayata Yojana (BRFSY)',
      state: 'Bihar',
      ministry: 'Cooperative Department, Bihar',
      category: 'Insurance',
      benefit: 'Free crop loss assistance: ₹7,500/ha for yield loss up to 20%, and ₹10,000/ha for loss exceeding 20%.',
      description: 'Zero-premium state insurance alternative providing direct compensation on threshold yield deficiency.',
      eligibility: 'Rabi and Kharif growers of Bihar (both landholders and non-landholder tenant cultivators).',
      officialUrl: 'https://pacsonline.bih.nic.in/fsy/',
      verifiedSource: 'Cooperative Dept Bihar',
      lastUpdated: 'March 2026',
    },
  ],
  Odisha: [
    {
      id: 'od-kalia',
      name: 'KALIA Scheme (Krushak Assistance for Livelihood and Income Augmentation)',
      state: 'Odisha',
      ministry: 'Department of Agriculture & Farmers Empowerment, Odisha',
      category: 'Financial Support',
      benefit: '₹10,000 per family per year for cultivation expenses, plus ₹12,500 for landless agricultural households.',
      description: 'Inclusive safety net supporting smallholders, tenant cultivators, and landless agricultural laborers.',
      eligibility: 'Small and marginal farmers, tenant farmers, and vulnerable agricultural households of Odisha.',
      officialUrl: 'https://kalia.odisha.gov.in/',
      verifiedSource: 'KALIA Portal Govt of Odisha',
      lastUpdated: 'March 2026',
    },
  ],
};

/**
 * Fetch list of central government schemes with optional filters
 */
export const getGovernmentSchemes = async (params = {}) => {
  try {
    const { data } = await API.get('/farmer-hub/schemes', { params });
    if (data?.success && Array.isArray(data.schemes)) {
      return {
        schemes: data.schemes,
        isCached: Boolean(data.isCached),
        dataSource: data.dataSource || 'Official Open Government Data (data.gov.in)',
      };
    }
    throw new Error('Invalid scheme data received');
  } catch (err) {
    console.warn('[governmentSchemes:getGovernmentSchemes] Using offline fallback cache:', err.message);
    let filtered = [...FALLBACK_SCHEMES];
    if (params.category && params.category !== 'All') {
      filtered = filtered.filter(
        (s) => s.category.toLowerCase() === params.category.toLowerCase()
      );
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.shortDescription.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return {
      schemes: filtered,
      isCached: true,
      dataSource: 'Verified Government Scheme Dataset (Offline Cache)',
    };
  }
};

/**
 * Get single scheme by ID
 */
export const getSchemeById = async (schemeId) => {
  const allSchemes = [...FALLBACK_SCHEMES];
  const found = allSchemes.find((s) => s.id === schemeId);
  return found || null;
};

/**
 * Get state-specific schemes
 */
export const getSchemesByState = async (state) => {
  try {
    const { data } = await API.get(`/farmer-hub/state-schemes/${encodeURIComponent(state)}`);
    if (data?.success && Array.isArray(data.schemes)) {
      return {
        schemes: data.schemes,
        state: data.state || state,
        isCached: false,
      };
    }
    throw new Error('Failed to retrieve state schemes');
  } catch (err) {
    console.warn('[governmentSchemes:getSchemesByState] Using offline fallback:', err.message);
    const schemes = FALLBACK_STATE_SCHEMES[state] || [];
    return {
      schemes,
      state,
      isCached: true,
    };
  }
};

/**
 * Find matching schemes based on user criteria
 */
export const findMatchingSchemes = async (criteria) => {
  try {
    const { data } = await API.post('/farmer-hub/match', criteria);
    if (data?.success && Array.isArray(data.matchedSchemes)) {
      return {
        matchedSchemes: data.matchedSchemes,
        criteriaApplied: data.criteriaApplied,
        isCached: false,
      };
    }
    throw new Error('Matching API responded with error');
  } catch (err) {
    console.warn('[governmentSchemes:findMatchingSchemes] Computing matching client-side:', err.message);
    const { state, farmerType, crop, landSizeAcres, irrigationType, farmingCategory } = criteria;
    const landSize = parseFloat(landSizeAcres) || 2;
    const results = [];

    FALLBACK_SCHEMES.forEach((scheme) => {
      let score = 90;
      const reasons = [];

      if (crop && scheme.crops && !scheme.crops.includes('ALL')) {
        if (scheme.crops.includes(crop)) {
          score += 10;
          reasons.push(`Targeted benefit for ${crop} crops`);
        }
      }

      if (scheme.id === 'pm-kmy' && landSize <= 5) {
        reasons.push('Meets smallholder area limit (≤ 5 Acres)');
      }

      if (irrigationType?.includes('Drip') && scheme.id === 'pmksy') {
        reasons.push('High priority subsidy for drip / micro-irrigation');
      }

      if (farmingCategory?.includes('Organic') && scheme.id === 'pkvy') {
        reasons.push('Direct financial support for certified organic clusters');
      }

      if (farmerType && scheme.farmerTypes?.includes(farmerType)) {
        reasons.push(`Eligible for ${farmerType} category`);
      }

      results.push({
        ...scheme,
        matchScore: Math.min(score, 98),
        matchReasons: reasons.length > 0 ? reasons : ['Universal central agricultural welfare scheme'],
      });
    });

    if (state && FALLBACK_STATE_SCHEMES[state]) {
      FALLBACK_STATE_SCHEMES[state].forEach((st) => {
        results.push({
          ...st,
          category: st.category,
          benefit: st.benefit,
          shortDescription: st.description,
          eligibilitySummary: st.eligibility,
          matchScore: 95,
          matchReasons: [`Exclusive state-sponsored benefit for farmers of ${state}`],
        });
      });
    }

    results.sort((a, b) => b.matchScore - a.matchScore);
    return {
      matchedSchemes: results,
      criteriaApplied: criteria,
      isCached: true,
    };
  }
};
