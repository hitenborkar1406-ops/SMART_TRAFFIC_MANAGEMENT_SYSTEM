/* ==========================================================================
   VEHICLE / TRANSPORTATION CONFIGURATION MODULE
   Smart Traffic Management System for Uneven Traffic Distribution
   Nagpur City, Maharashtra, India
   ========================================================================== */

window.VEHICLE_CONFIGS = {
  bike: {
    id: 'bike',
    name: 'Bike',
    icon: 'fa-motorcycle',
    baseSpeed: 40,
    minSpeed: 35,
    maxSpeed: 45,
    trafficResilience: 0.85, // 2-wheelers can filter through mild traffic
    fuelEfficiencyKmPerL: 45,
    label: 'Bike (35–45 km/h)',
    desc: 'Ideal for rapid transit across narrow roads & filtering through minor queues.'
  },
  car: {
    id: 'car',
    name: 'Car',
    icon: 'fa-car',
    baseSpeed: 32,
    minSpeed: 25,
    maxSpeed: 40,
    trafficResilience: 0.55, // 4-wheelers directly affected by intersection bottle necks
    fuelEfficiencyKmPerL: 15,
    label: 'Car (25–40 km/h)',
    desc: 'Private 4-wheelers. Highly sensitive to arterial gridlocks and signal delay.'
  },
  auto: {
    id: 'auto',
    name: 'Auto / Other',
    icon: 'fa-truck-pickup',
    baseSpeed: 28,
    minSpeed: 25,
    maxSpeed: 35,
    trafficResilience: 0.65, // Autos have medium maneuverability
    fuelEfficiencyKmPerL: 22,
    label: 'Auto/Other (25–35 km/h)',
    desc: 'Three-wheelers, delivery vans & shared commercial vehicles.'
  }
};
