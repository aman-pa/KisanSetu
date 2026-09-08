/**
 * distanceProvider.js
 * Distance and routing abstraction for KisanSetu Mandi Optimizer.
 * Computes road-adjusted distances between farmer locations and APMC market terminals.
 */

// Comprehensive APMC Mandi Coordinate Directory across primary agricultural belts
const MANDI_COORDINATES = {
  // Delhi NCR
  'azadpur apmc mandi': { lat: 28.7112, lng: 77.1788, district: 'North Delhi', state: 'Delhi' },
  'ghazipur mandi': { lat: 28.6258, lng: 77.3274, district: 'East Delhi', state: 'Delhi' },
  'okhla mandi': { lat: 28.5355, lng: 77.2728, district: 'South Delhi', state: 'Delhi' },

  // Haryana
  'karnal mandi': { lat: 29.6857, lng: 76.9905, district: 'Karnal', state: 'Haryana' },
  'panipat mandi': { lat: 29.3909, lng: 76.9635, district: 'Panipat', state: 'Haryana' },
  'ambala city mandi': { lat: 30.3782, lng: 76.7767, district: 'Ambala', state: 'Haryana' },
  'kurukshetra mandi': { lat: 29.9695, lng: 76.8783, district: 'Kurukshetra', state: 'Haryana' },
  'rohtak mandi': { lat: 28.8955, lng: 76.6066, district: 'Rohtak', state: 'Haryana' },
  'sonipat mandi': { lat: 28.9931, lng: 77.0151, district: 'Sonipat', state: 'Haryana' },
  'gurugram mandi': { lat: 28.4595, lng: 77.0266, district: 'Gurugram', state: 'Haryana' },

  // Uttar Pradesh
  'agra mandi': { lat: 27.1767, lng: 78.0081, district: 'Agra', state: 'Uttar Pradesh' },
  'mathura mandi': { lat: 27.4924, lng: 77.6737, district: 'Mathura', state: 'Uttar Pradesh' },
  'aligarh mandi': { lat: 27.8974, lng: 78.0880, district: 'Aligarh', state: 'Uttar Pradesh' },
  'meerut mandi': { lat: 28.9845, lng: 77.7064, district: 'Meerut', state: 'Uttar Pradesh' },
  'bareilly mandi': { lat: 28.3670, lng: 79.4304, district: 'Bareilly', state: 'Uttar Pradesh' },
  'lucknow mandi': { lat: 26.8467, lng: 80.9462, district: 'Lucknow', state: 'Uttar Pradesh' },
  'kanpur mandi': { lat: 26.4499, lng: 80.3319, district: 'Kanpur', state: 'Uttar Pradesh' },
  'varanasi mandi': { lat: 25.3176, lng: 82.9739, district: 'Varanasi', state: 'Uttar Pradesh' },
  'balliah apmc': { lat: 25.7610, lng: 84.1497, district: 'Ballia', state: 'Uttar Pradesh' },

  // Punjab
  'jalandhar cantt mandi': { lat: 31.3260, lng: 75.5762, district: 'Jalandhar', state: 'Punjab' },
  'ludhiana mandi': { lat: 30.9010, lng: 75.8573, district: 'Ludhiana', state: 'Punjab' },
  'amritsar mandi': { lat: 31.6340, lng: 74.8723, district: 'Amritsar', state: 'Punjab' },
  'patiala mandi': { lat: 30.3398, lng: 76.3869, district: 'Patiala', state: 'Punjab' },

  // Maharashtra
  'lasalgaon mandi': { lat: 20.1444, lng: 74.2281, district: 'Nashik', state: 'Maharashtra' },
  'nashik mandi': { lat: 19.9975, lng: 73.7898, district: 'Nashik', state: 'Maharashtra' },
  'pune apmc mandi': { lat: 18.5204, lng: 73.8567, district: 'Pune', state: 'Maharashtra' },
  'vashi navi mumbai mandi': { lat: 19.0771, lng: 72.9986, district: 'Thane', state: 'Maharashtra' },

  // South India
  'thrippunithura market': { lat: 9.9489, lng: 76.3470, district: 'Ernakulam', state: 'Kerala' },
  'kolar mandi': { lat: 13.1378, lng: 78.1293, district: 'Kolar', state: 'Karnataka' },
  'yeshwanthpur mandi': { lat: 13.0238, lng: 77.5529, district: 'Bengaluru', state: 'Karnataka' },
};

// Standard road circuity winding factor for Indian rural-to-highway road networks (1.25x haversine)
const ROAD_CIRCUITY_FACTOR = 1.25;

/**
 * Great-circle distance calculation via Haversine formula (km)
 */
function calculateHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Resolve geo-coordinates for a given mandi or district name
 */
function resolveMandiCoordinates(mandiName, districtName = '', stateName = '') {
  const cleanMandi = (mandiName || '').trim().toLowerCase();
  if (MANDI_COORDINATES[cleanMandi]) {
    return { ...MANDI_COORDINATES[cleanMandi], found: true };
  }

  // Try partial matching
  for (const [key, coords] of Object.entries(MANDI_COORDINATES)) {
    if (cleanMandi.includes(key) || key.includes(cleanMandi)) {
      return { ...coords, found: true };
    }
  }

  // Fallback match on district name
  const cleanDistrict = (districtName || '').trim().toLowerCase();
  if (cleanDistrict) {
    for (const coords of Object.values(MANDI_COORDINATES)) {
      if (coords.district.toLowerCase() === cleanDistrict) {
        return { ...coords, found: true };
      }
    }
  }

  // Fallback coordinates (default regional center)
  return {
    lat: 28.6139,
    lng: 77.2090,
    district: districtName || 'Regional APMC',
    state: stateName || 'India',
    found: false,
  };
}

/**
 * DistanceProvider class offering an extensible routing interface.
 */
class DistanceProvider {
  constructor(options = {}) {
    this.circuityFactor = options.circuityFactor || ROAD_CIRCUITY_FACTOR;
    this.sourceType = options.sourceType || 'ESTIMATED_HAVERSINE_CIRCUITY';
  }

  /**
   * Computes estimated road distance (in km) from farmer origin to destination mandi.
   * 
   * @param {Object} origin - { lat, lng }
   * @param {Object|string} destination - { lat, lng } or Mandi Name string
   * @returns {Object} { distanceKm, distanceSource, isEstimated }
   */
  calculateDistance(origin, destination) {
    if (!origin || typeof origin.lat !== 'number' || typeof origin.lng !== 'number') {
      throw new Error('Invalid origin coordinates provided to DistanceProvider.');
    }

    let destCoords;
    if (typeof destination === 'string') {
      destCoords = resolveMandiCoordinates(destination);
    } else if (destination && typeof destination.lat === 'number' && typeof destination.lng === 'number') {
      destCoords = destination;
    } else if (destination && destination.market) {
      destCoords = resolveMandiCoordinates(destination.market, destination.district, destination.state);
    } else {
      throw new Error('Invalid destination provided to DistanceProvider.');
    }

    const haversineKm = calculateHaversineDistanceKm(
      origin.lat,
      origin.lng,
      destCoords.lat,
      destCoords.lng
    );

    const estimatedRoadKm = Math.max(1, Math.round(haversineKm * this.circuityFactor * 10) / 10);

    return {
      distanceKm: estimatedRoadKm,
      haversineKm: Math.round(haversineKm * 10) / 10,
      destinationCoords: { lat: destCoords.lat, lng: destCoords.lng },
      distanceSource: 'ESTIMATED',
      isEstimated: true,
    };
  }

  /**
   * Returns all known mandi coordinate locations.
   */
  getAllMandiCoordinates() {
    return MANDI_COORDINATES;
  }
}

module.exports = {
  DistanceProvider,
  MANDI_COORDINATES,
  calculateHaversineDistanceKm,
  resolveMandiCoordinates,
  ROAD_CIRCUITY_FACTOR,
};
