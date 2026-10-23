/* ==========================================================================
   NAGPUR ROAD NETWORK & MASTER LOCATIONS DATASET
   Smart Traffic Management System for Uneven Traffic Distribution
   Nagpur City, Maharashtra, India
   ========================================================================== */

window.NAGPUR_LOCATIONS = [
  // 1. South Corridor & Wardha Road
  { 
    id: 'ajni_sq', 
    name: 'Ajni Square, Nagpur', 
    zone: 'South', 
    lat: 21.1218, 
    lng: 79.0805, 
    desc: 'Wardha Road Major Flyover Junction & South Arterial Entrance',
    aliases: ['ajni square', 'ajni sq', 'ajni chowk', 'ajni flyover']
  },
  { 
    id: 'ajni', 
    name: 'Ajni Railway Station, Nagpur', 
    zone: 'South', 
    lat: 21.1180, 
    lng: 79.0840, 
    desc: 'South Railway Terminal, Medical College link & Loco Shed',
    aliases: ['ajni', 'ajni station', 'ajni railway station', 'ajni loco']
  },
  { 
    id: 'rahate_sq', 
    name: 'Rahate Square, Nagpur', 
    zone: 'South-Central', 
    lat: 21.1305, 
    lng: 79.0825, 
    desc: 'Wardha Road / NEERI / Medical College Confluence Bottleneck',
    aliases: ['rahate square', 'rahate sq', 'rahate chowk', 'neeri']
  },
  { 
    id: 'rahate_colony', 
    name: 'Rahate Colony, Nagpur', 
    zone: 'South-Central', 
    lat: 21.1280, 
    lng: 79.0810, 
    desc: 'Wardha Road Residential Corridor between Ajni and Rahate Sq',
    aliases: ['rahate colony', 'rahate', 'wardha road rahate']
  },
  { 
    id: 'wardha_road', 
    name: 'Wardha Road (NH-44), Nagpur', 
    zone: 'South', 
    lat: 21.1050, 
    lng: 79.0750, 
    desc: 'Primary South Arterial Spine connecting Sitabuldi to Airport & MIHAN',
    aliases: ['wardha road', 'wardha rd', 'nh44 south', 'nh 44', 'somulwada']
  },
  { 
    id: 'chhatrapati_sq', 
    name: 'Chhatrapati Square, Nagpur', 
    zone: 'South', 
    lat: 21.1080, 
    lng: 79.0760, 
    desc: 'Wardha Road & Ring Road Junction to Khamla & Pratap Nagar',
    aliases: ['chhatrapati square', 'chhatrapati sq', 'chhatrapati chowk']
  },
  { 
    id: 'manish_nagar', 
    name: 'Manish Nagar, Nagpur', 
    zone: 'South', 
    lat: 21.0950, 
    lng: 79.0880, 
    desc: 'South Residential Corridor, Besa Road link & Railway Flyover',
    aliases: ['manish nagar', 'manish nagar crossing', 'manish nagar t-point']
  },
  { 
    id: 'airport_area', 
    name: 'Nagpur Airport (Dr. Babasaheb Ambedkar Intl), Nagpur', 
    zone: 'South', 
    lat: 21.0920, 
    lng: 79.0600, 
    desc: 'International Airport Terminal, Aerocity & Sonegaon Lake belt',
    aliases: ['nagpur airport', 'airport', 'airport area', 'sonegaon']
  },
  { 
    id: 'mihan', 
    name: 'MIHAN / AIIMS Nagpur', 
    zone: 'South', 
    lat: 21.0450, 
    lng: 79.0500, 
    desc: 'Multi-modal International Cargo Hub, SEZ, IIM & AIIMS Hospital',
    aliases: ['mihan', 'aiims', 'aiims nagpur', 'mihan sez', 'iim nagpur']
  },

  // 2. Central Core & Landmarks
  { 
    id: 'sitabuldi', 
    name: 'Sitabuldi (Zero Mile / Bardi), Nagpur', 
    zone: 'Central', 
    lat: 21.1458, 
    lng: 79.0882, 
    desc: 'Nagpur Central Transit Hub, Main Metro Interchange & Market',
    aliases: ['sitabuldi', 'bardi', 'sitabuldi metro', 'sitabuldi market', 'munje square']
  },
  { 
    id: 'zero_mile', 
    name: 'Zero Mile Stone, Nagpur', 
    zone: 'Central', 
    lat: 21.1485, 
    lng: 79.0805, 
    desc: 'Geographical Center of India Monument & Zero Mile Metro Station',
    aliases: ['zero mile', 'zero mile stone', 'zero mile nagpur']
  },
  { 
    id: 'jhansi_rani_sq', 
    name: 'Jhansi Rani Square, Nagpur', 
    zone: 'Central', 
    lat: 21.1420, 
    lng: 79.0790, 
    desc: 'Sitabuldi West Arterial Confluence & Panchsheel link',
    aliases: ['jhansi rani square', 'jhansi rani sq', 'jhansi rani chowk', 'rani jhansi']
  },
  { 
    id: 'dhantholi', 
    name: 'Dhantholi, Nagpur', 
    zone: 'Central', 
    lat: 21.1350, 
    lng: 79.0820, 
    desc: 'Premier Healthcare, Hospital Corridor & Commercial Hub near Nag River',
    aliases: ['dhantholi', 'dhantoli', 'dhantoli bridge', 'dhantoli hospital']
  },
  { 
    id: 'ramdaspeth', 
    name: 'Ramdaspeth / VIP Road, Nagpur', 
    zone: 'Central', 
    lat: 21.1360, 
    lng: 79.0710, 
    desc: 'VIP Road Commercial Avenue & Parallel Traffic Redistribution Corridor',
    aliases: ['ramdaspeth', 'vip road', 'vip rd', 'central bazaar road']
  },
  { 
    id: 'civil_lines', 
    name: 'Civil Lines, Nagpur', 
    zone: 'North-West', 
    lat: 21.1550, 
    lng: 79.0720, 
    desc: 'High Court of Bombay at Nagpur, Vidhan Bhavan & Palm Road',
    aliases: ['civil lines', 'high court', 'vidhan bhavan', 'rbi chowk', 'palm road']
  },

  // 3. North & North-West Nagpur
  { 
    id: 'sadar', 
    name: 'Sadar Bazar / Residency Rd, Nagpur', 
    zone: 'North', 
    lat: 21.1620, 
    lng: 79.0840, 
    desc: 'Commercial, Dining & Retail Center (Liberty Cinema & Chhaoni)',
    aliases: ['sadar', 'sadar bazar', 'residency road', 'liberty cinema', 'chhaoni']
  },
  { 
    id: 'seminary_hills', 
    name: 'Seminary Hills / Walkers St, Nagpur', 
    zone: 'North-West', 
    lat: 21.1660, 
    lng: 79.0520, 
    desc: 'Scenic Paved Avenue Corridor bypassing Katol Road arterial congestion',
    aliases: ['seminary hills', 'walkers street', 'seminary hill', 'air force station']
  },
  { 
    id: 'katol_road', 
    name: 'Katol Road (Katol Naka), Nagpur', 
    zone: 'North-West', 
    lat: 21.1700, 
    lng: 79.0600, 
    desc: 'North-West Arterial Corridor & High Density Katol Naka Choke Point',
    aliases: ['katol road', 'katol rd', 'katol naka', 'chhaoni square']
  },
  { 
    id: 'gittikhadan', 
    name: 'Gittikhadan, Nagpur', 
    zone: 'North-West', 
    lat: 21.1730, 
    lng: 79.0560, 
    desc: 'Katol Road Junction, Friends Colony & Seminary Hills western foot',
    aliases: ['gittikhadan', 'gitikhadan', 'friends colony', 'borgaon']
  },
  { 
    id: 'kamptee_road', 
    name: 'Kamptee Road, Nagpur', 
    zone: 'North-East', 
    lat: 21.1850, 
    lng: 79.1150, 
    desc: 'Automotive Square & NH-44 North Corridor leading to Kamptee / Jabalpur',
    aliases: ['kamptee road', 'kamptee rd', 'automotive square', 'kadbi chowk']
  },
  { 
    id: 'mankapur', 
    name: 'Mankapur Sports Complex, Nagpur', 
    zone: 'North', 
    lat: 21.1810, 
    lng: 79.0730, 
    desc: 'Ring Road Northern Arc, Divisional Sports Complex & Bypass',
    aliases: ['mankapur', 'mankapur ring road', 'mankapur stadium']
  },

  // 4. West Nagpur
  { 
    id: 'dharampeth', 
    name: 'Dharampeth, Nagpur', 
    zone: 'West', 
    lat: 21.1410, 
    lng: 79.0620, 
    desc: 'West Commercial Center, WHC Road & Coffee House Square',
    aliases: ['dharampeth', 'coffee house square', 'whc road', 'west high court road']
  },
  { 
    id: 'shankar_nagar', 
    name: 'Shankar Nagar Square, Nagpur', 
    zone: 'West', 
    lat: 21.1330, 
    lng: 79.0590, 
    desc: 'Major West Confluence linking Dharampeth, Bajaj Nagar and Ring Road',
    aliases: ['shankar nagar', 'shankar nagar square', 'shankar nagar sq', 'wcl']
  },
  { 
    id: 'pratap_nagar', 
    name: 'Pratap Nagar, Nagpur', 
    zone: 'South-West', 
    lat: 21.1180, 
    lng: 79.0550, 
    desc: 'Ring Road Commercial Junction, Khamla link & IT Companies',
    aliases: ['pratap nagar', 'pratap nagar square', 'pratap nagar ring road']
  },
  { 
    id: 'trimurti_nagar', 
    name: 'Trimurti Nagar, Nagpur', 
    zone: 'South-West', 
    lat: 21.1120, 
    lng: 79.0480, 
    desc: 'Ring Road Residential Hub, Bhamti link & Orange City Hospital belt',
    aliases: ['trimurti nagar', 'trimurti nagar square', 'bhamti']
  },
  { 
    id: 'hingna_road', 
    name: 'Hingna Road (MIDC), Nagpur', 
    zone: 'South-West', 
    lat: 21.1000, 
    lng: 79.0150, 
    desc: 'MIDC Industrial Sector, Hingna T-Point & Engineering College Campus',
    aliases: ['hingna road', 'hingna rd', 'hingna midc', 'hingna t-point', 'hingna']
  },
  { 
    id: 'amravati_road', 
    name: 'Amravati Road (NH-53), Nagpur', 
    zone: 'West', 
    lat: 21.1480, 
    lng: 79.0200, 
    desc: 'RTMNU University Western Campus, Ravi Nagar & Gateway to Amravati',
    aliases: ['amravati road', 'amravati rd', 'nh53', 'ravi nagar', 'rtmnu']
  },
  { 
    id: 'wadi', 
    name: 'Wadi, Nagpur', 
    zone: 'West', 
    lat: 21.1500, 
    lng: 78.9900, 
    desc: 'Western Logistics, Truck Terminal & Industrial Warehousing Gateway',
    aliases: ['wadi', 'wadi naka', 'wadi t-point']
  },

  // 5. East & South-East Nagpur
  { 
    id: 'nandanvan', 
    name: 'Nandanvan, Nagpur', 
    zone: 'East', 
    lat: 21.1320, 
    lng: 79.1300, 
    desc: 'East Nagpur Educational Belt, Hasanbagh & KDK College corridor',
    aliases: ['nandanvan', 'nandanvan colony', 'hasanbagh']
  },
  { 
    id: 'itwari', 
    name: 'Itwari Wholesale Market, Nagpur', 
    zone: 'East', 
    lat: 21.1560, 
    lng: 79.1120, 
    desc: 'High-Density Traditional Trade, Sarafa Bazar, Kirana Ol & Shahid Chowk',
    aliases: ['itwari', 'itwari market', 'sarafa bazar', 'itwari station']
  },
  { 
    id: 'mahal', 
    name: 'Mahal (Historic Core), Nagpur', 
    zone: 'East', 
    lat: 21.1460, 
    lng: 79.1020, 
    desc: 'Historic Core, Bhonsle Wada, Shivaji Putla & Dense Retail Alleys',
    aliases: ['mahal', 'shivaji putla mahal', 'kotwali', 'bhonsle wada']
  },
  { 
    id: 'ganeshpeth', 
    name: 'Ganeshpeth Bus Terminus, Nagpur', 
    zone: 'Central-East', 
    lat: 21.1440, 
    lng: 79.0980, 
    desc: 'MSRTC Central Intercity Bus Terminal & Model Mill Compound',
    aliases: ['ganeshpeth', 'ganeshpeth bus stand', 'msrtc stand', 'model mill']
  },
  { 
    id: 'cotton_market', 
    name: 'Cotton Market, Nagpur', 
    zone: 'East', 
    lat: 21.1430, 
    lng: 79.0920, 
    desc: 'Historic Produce Wholesale Market near Nagpur Main Railway Station',
    aliases: ['cotton market', 'ruikar road', 'vegetable market']
  },
  { 
    id: 'medical_sq', 
    name: 'Medical Square (GMC), Nagpur', 
    zone: 'South-East', 
    lat: 21.1270, 
    lng: 79.0990, 
    desc: 'Government Medical College Hospital (GMC) & Great Nag Road Junction',
    aliases: ['medical square', 'medical sq', 'gmc nagpur', 'medical chowk']
  },
  { 
    id: 'sakkardara', 
    name: 'Sakkardara Square, Nagpur', 
    zone: 'South-East', 
    lat: 21.1210, 
    lng: 79.1150, 
    desc: 'South-East Commercial Hub, Lake Garden & Umred Road link',
    aliases: ['sakkardara', 'sakkardara square', 'sakkardara lake', 'umred road']
  },
  { 
    id: 'khamla', 
    name: 'Khamla Square, Nagpur', 
    zone: 'South-West', 
    lat: 21.1150, 
    lng: 79.0680, 
    desc: 'Commercial market linking Wardha Road to Pratap Nagar and Ring Road',
    aliases: ['khamla', 'khamla square', 'khamla chowk']
  }
];

window.NAGPUR_CORRIDORS = [
  { id: 'wardha_corridor', name: 'Wardha Road (Ajni Sq - Rahate Sq - Sitabuldi)', congestion: 84, status: 'Severe', level: 'red', capacity: 2600, volume: 2280, peakHourFactor: 0.94 },
  { id: 'katol_corridor', name: 'Katol Road (Sadar - Katol Naka - Gittikhadan)', congestion: 78, status: 'Heavy', level: 'orange', capacity: 1600, volume: 1340, peakHourFactor: 0.88 },
  { id: 'vip_road', name: 'VIP Road (Ramdaspeth - Civil Lines Parallel)', congestion: 24, status: 'Low', level: 'green', capacity: 1800, volume: 432, peakHourFactor: 0.28 },
  { id: 'walkers_st', name: 'Walkers St & Seminary Hills Paved Corridor', congestion: 20, status: 'Low', level: 'green', capacity: 1200, volume: 240, peakHourFactor: 0.22 },
  { id: 'central_ave', name: 'Central Avenue (Sitabuldi - Itwari - Gandhi Putla)', congestion: 82, status: 'Severe', level: 'red', capacity: 2000, volume: 1720, peakHourFactor: 0.90 },
  { id: 'ring_road', name: 'Nagpur Ring Road (Pratap Nagar - Trimurti Nagar)', congestion: 40, status: 'Moderate', level: 'yellow', capacity: 3200, volume: 1280, peakHourFactor: 0.42 },
  { id: 'amravati_corridor', name: 'Amravati Road (Dharampeth - RTMNU Campus)', congestion: 50, status: 'Moderate', level: 'yellow', capacity: 2400, volume: 1200, peakHourFactor: 0.52 },
  { id: 'kamptee_corridor', name: 'Kamptee Road (Kadbi Sq - Automotive Sq)', congestion: 76, status: 'Heavy', level: 'orange', capacity: 2100, volume: 1610, peakHourFactor: 0.82 }
];
