/* ==========================================================================
   TRAFFIC DATA, HOTSPOTS & TIME-BASED PROFILES
   Smart Traffic Management System for Uneven Traffic Distribution
   Nagpur City, Maharashtra, India
   ========================================================================== */

window.TIME_PERIODS = {
  current: {
    id: 'current',
    label: 'Current Time',
    timeRange: 'Real-time telemetry',
    congestionMultiplier: 1.0,
    activeVehicles: 1240,
    avgCitySpeed: 31,
    congestedCount: 12,
    freeFlowCount: 28,
    distributionIndex: 68,
    desc: 'Simulating live weekday traffic conditions across Nagpur corridors.'
  },
  early15: {
    id: 'early15',
    label: '⚡ 15-Min Early Prediction',
    timeRange: '+15 Min ML Lookahead',
    congestionMultiplier: 1.42,
    activeVehicles: 2380,
    avgCitySpeed: 18,
    congestedCount: 23,
    freeFlowCount: 10,
    distributionIndex: 44,
    desc: '🔮 Machine Learning 15-Minute Early Forecast: Predicts impending congestion peaks before choke points form, proactively diverting vehicles to free-flowing bypasses.',
    isEarlyPrediction: true
  },
  morning: {
    id: 'morning',
    label: 'Morning Peak',
    timeRange: '9:00 AM – 12:00 PM',
    congestionMultiplier: 1.25,
    activeVehicles: 1890,
    avgCitySpeed: 23,
    congestedCount: 19,
    freeFlowCount: 14,
    distributionIndex: 51,
    desc: 'Heavy inbound office/student rush towards Civil Lines, Sitabuldi, and High Court.'
  },
  afternoon: {
    id: 'afternoon',
    label: 'Afternoon',
    timeRange: '12:00 PM – 4:00 PM',
    congestionMultiplier: 0.75,
    activeVehicles: 890,
    avgCitySpeed: 38,
    congestedCount: 6,
    freeFlowCount: 36,
    distributionIndex: 82,
    desc: 'Normal midday flow with minimal congestion across main Nagpur arterials.'
  },
  evening: {
    id: 'evening',
    label: 'Evening Peak',
    timeRange: '4:00 PM – 7:00 PM',
    congestionMultiplier: 1.35,
    activeVehicles: 2140,
    avgCitySpeed: 20,
    congestedCount: 22,
    freeFlowCount: 11,
    distributionIndex: 46,
    desc: 'Severe outbound commute & commercial market rush along Wardha Rd, Itwari, and Dharampeth.'
  },
  night: {
    id: 'night',
    label: 'Night',
    timeRange: '8:00 PM – 6:00 AM',
    congestionMultiplier: 0.45,
    activeVehicles: 420,
    avgCitySpeed: 45,
    congestedCount: 2,
    freeFlowCount: 42,
    distributionIndex: 94,
    desc: 'Light nocturnal traffic. Logistics freight active on Outer Ring Road.'
  }
};

window.NAGPUR_HOTSPOTS = [
  {
    id: 'hotspot-wardha',
    name: 'Wardha Road Corridor',
    landmark: 'Between Ajni Flyover & Rahate Colony',
    baseCongestion: 84,
    status: 'High',
    level: 'red',
    delayMin: '+9 min',
    cause: 'Dense multi-lane confluence & Metro pillar bottleneck',
    alternateAdvice: 'Divert via Ramdaspeth / VIP Road corridor',
    lat: 21.1150,
    lng: 79.0780
  },
  {
    id: 'hotspot-ajni',
    name: 'Ajni Square',
    landmark: 'Wardha Road / Medical College Overbridge',
    baseCongestion: 78,
    status: 'High',
    level: 'red',
    delayMin: '+7 min',
    cause: 'Heavy signal queuing and railway station access traffic',
    alternateAdvice: 'Use Chhatrapati Square to Khamla bypass',
    lat: 21.1218,
    lng: 79.0805
  },
  {
    id: 'hotspot-dhantholi',
    name: 'Dhantholi',
    landmark: 'Nag River Bridge & Hospital Belt',
    baseCongestion: 60,
    status: 'Medium',
    level: 'yellow',
    delayMin: '+4 min',
    cause: 'Ambulance movements & curbside commercial parking',
    alternateAdvice: 'Use Panchsheel Square link',
    lat: 21.1350,
    lng: 79.0820
  },
  {
    id: 'hotspot-rahate',
    name: 'Rahate Square',
    landmark: 'Wardha Road / NEERI Confluence',
    baseCongestion: 52,
    status: 'Medium',
    level: 'yellow',
    delayMin: '+3 min',
    cause: 'Signal transition cycle between Sitabuldi & Ajni',
    alternateAdvice: 'Underpass flow recommended for two-wheelers',
    lat: 21.1305,
    lng: 79.0825
  },
  {
    id: 'hotspot-sitabuldi',
    name: 'Sitabuldi (Zero Mile)',
    landmark: 'Munje Square & Metro Interchange',
    baseCongestion: 82,
    status: 'Severe',
    level: 'red',
    delayMin: '+8 min',
    cause: 'Pedestrian volume & city bus convergence at Bardi',
    alternateAdvice: 'Bypass via Tekdi Road or RBI Square',
    lat: 21.1458,
    lng: 79.0882
  },
  {
    id: 'hotspot-katol',
    name: 'Katol Naka Junction',
    landmark: 'Katol Road near Chhaoni',
    baseCongestion: 76,
    status: 'Heavy',
    level: 'orange',
    delayMin: '+6 min',
    cause: 'Goods transport & narrow junction geometry',
    alternateAdvice: 'Divert via Walkers Street & Seminary Hills',
    lat: 21.1695,
    lng: 79.0690
  },
  {
    id: 'hotspot-dharampeth',
    name: 'Dharampeth Traffic Island',
    landmark: 'Coffee House Square & WHC Road',
    baseCongestion: 56,
    status: 'Medium',
    level: 'yellow',
    delayMin: '+4 min',
    cause: 'Retail shopping traffic & cafe visitors',
    alternateAdvice: 'Use West High Court Road back alleys',
    lat: 21.1410,
    lng: 79.0620
  },
  {
    id: 'hotspot-itwari',
    name: 'Itwari Wholesale Market',
    landmark: 'Sarafa Bazar & Shahid Chowk',
    baseCongestion: 88,
    status: 'Severe',
    level: 'red',
    delayMin: '+12 min',
    cause: 'Unloading freight trucks and handcarts in narrow streets',
    alternateAdvice: 'Use Eastern Ring Road outer corridor',
    lat: 21.1560,
    lng: 79.1120
  }
];
