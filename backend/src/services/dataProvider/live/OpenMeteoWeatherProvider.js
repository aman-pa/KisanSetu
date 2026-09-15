/**
 * OpenMeteoWeatherProvider.js
 * Live Agricultural Weather Provider using Open-Meteo non-commercial public API.
 * Provides real-time and 7-day forecast data mapped to key Indian agricultural districts and mandis.
 */

const axios = require('axios');
const SimpleTtlCache = require('../cache/simpleTtlCache');
const WeatherDataValidator = require('../validation/weatherDataValidator');
const WeatherDataNormalizer = require('../normalization/weatherDataNormalizer');

// Geo-coordinate lookup for primary agricultural production and APMC clusters across India
const DISTRICT_COORDINATES = {
  // Delhi NCR
  'delhi': { lat: 28.6139, lon: 77.2090, district: 'Delhi', state: 'Delhi' },
  'north delhi': { lat: 28.7112, lon: 77.1788, district: 'North Delhi', state: 'Delhi' },
  'east delhi': { lat: 28.6258, lon: 77.3274, district: 'East Delhi', state: 'Delhi' },
  'azadpur': { lat: 28.7112, lon: 77.1788, district: 'North Delhi', state: 'Delhi' },
  'azadpur apmc mandi': { lat: 28.7112, lon: 77.1788, district: 'North Delhi', state: 'Delhi' },
  'ghazipur': { lat: 28.6258, lon: 77.3274, district: 'East Delhi', state: 'Delhi' },
  'ghazipur mandi': { lat: 28.6258, lon: 77.3274, district: 'East Delhi', state: 'Delhi' },

  // Haryana
  'karnal': { lat: 29.6857, lon: 76.9905, district: 'Karnal', state: 'Haryana' },
  'karnal mandi': { lat: 29.6857, lon: 76.9905, district: 'Karnal', state: 'Haryana' },
  'ambala': { lat: 30.3782, lon: 76.7767, district: 'Ambala', state: 'Haryana' },
  'ambala city mandi': { lat: 30.3782, lon: 76.7767, district: 'Ambala', state: 'Haryana' },
  'panipat': { lat: 29.3909, lon: 76.9635, district: 'Panipat', state: 'Haryana' },
  'panipat mandi': { lat: 29.3909, lon: 76.9635, district: 'Panipat', state: 'Haryana' },
  'kurukshetra': { lat: 29.9695, lon: 76.8783, district: 'Kurukshetra', state: 'Haryana' },
  'kurukshetra mandi': { lat: 29.9695, lon: 76.8783, district: 'Kurukshetra', state: 'Haryana' },
  'sonipat': { lat: 28.9931, lon: 77.0151, district: 'Sonipat', state: 'Haryana' },
  'sonipat mandi': { lat: 28.9931, lon: 77.0151, district: 'Sonipat', state: 'Haryana' },
  'rohtak': { lat: 28.8955, lon: 76.6066, district: 'Rohtak', state: 'Haryana' },
  'rohtak mandi': { lat: 28.8955, lon: 76.6066, district: 'Rohtak', state: 'Haryana' },
  'gurugram': { lat: 28.4595, lon: 77.0266, district: 'Gurugram', state: 'Haryana' },
  'gurugram mandi': { lat: 28.4595, lon: 77.0266, district: 'Gurugram', state: 'Haryana' },
  'hisar': { lat: 29.1492, lon: 75.7217, district: 'Hisar', state: 'Haryana' },
  'sirsa': { lat: 29.5349, lon: 75.0296, district: 'Sirsa', state: 'Haryana' },

  // Uttar Pradesh
  'agra': { lat: 27.1767, lon: 78.0081, district: 'Agra', state: 'Uttar Pradesh' },
  'agra mandi': { lat: 27.1767, lon: 78.0081, district: 'Agra', state: 'Uttar Pradesh' },
  'mathura': { lat: 27.4924, lon: 77.6737, district: 'Mathura', state: 'Uttar Pradesh' },
  'mathura mandi': { lat: 27.4924, lon: 77.6737, district: 'Mathura', state: 'Uttar Pradesh' },
  'aligarh': { lat: 27.8974, lon: 78.0880, district: 'Aligarh', state: 'Uttar Pradesh' },
  'aligarh mandi': { lat: 27.8974, lon: 78.0880, district: 'Aligarh', state: 'Uttar Pradesh' },
  'meerut': { lat: 28.9845, lon: 77.7064, district: 'Meerut', state: 'Uttar Pradesh' },
  'meerut mandi': { lat: 28.9845, lon: 77.7064, district: 'Meerut', state: 'Uttar Pradesh' },
  'bareilly': { lat: 28.3670, lon: 79.4304, district: 'Bareilly', state: 'Uttar Pradesh' },
  'bareilly mandi': { lat: 28.3670, lon: 79.4304, district: 'Bareilly', state: 'Uttar Pradesh' },
  'lucknow': { lat: 26.8467, lon: 80.9462, district: 'Lucknow', state: 'Uttar Pradesh' },
  'lucknow mandi': { lat: 26.8467, lon: 80.9462, district: 'Lucknow', state: 'Uttar Pradesh' },
  'kanpur': { lat: 26.4499, lon: 80.3319, district: 'Kanpur', state: 'Uttar Pradesh' },
  'kanpur mandi': { lat: 26.4499, lon: 80.3319, district: 'Kanpur', state: 'Uttar Pradesh' },
  'varanasi': { lat: 25.3176, lon: 82.9739, district: 'Varanasi', state: 'Uttar Pradesh' },
  'varanasi mandi': { lat: 25.3176, lon: 82.9739, district: 'Varanasi', state: 'Uttar Pradesh' },
  'prayagraj': { lat: 25.4358, lon: 81.8463, district: 'Prayagraj', state: 'Uttar Pradesh' },
  'gorakhpur': { lat: 26.7606, lon: 83.3732, district: 'Gorakhpur', state: 'Uttar Pradesh' },

  // Punjab & Chandigarh
  'jalandhar': { lat: 31.3260, lon: 75.5762, district: 'Jalandhar', state: 'Punjab' },
  'jalandhar cantt mandi': { lat: 31.3260, lon: 75.5762, district: 'Jalandhar', state: 'Punjab' },
  'ludhiana': { lat: 30.9010, lon: 75.8573, district: 'Ludhiana', state: 'Punjab' },
  'ludhiana mandi': { lat: 30.9010, lon: 75.8573, district: 'Ludhiana', state: 'Punjab' },
  'amritsar': { lat: 31.6340, lon: 74.8723, district: 'Amritsar', state: 'Punjab' },
  'amritsar mandi': { lat: 31.6340, lon: 74.8723, district: 'Amritsar', state: 'Punjab' },
  'patiala': { lat: 30.3398, lon: 76.3869, district: 'Patiala', state: 'Punjab' },
  'bathinda': { lat: 30.2110, lon: 74.9455, district: 'Bathinda', state: 'Punjab' },
  'khanna': { lat: 30.7071, lon: 76.2167, district: 'Ludhiana', state: 'Punjab' },
  'chandigarh': { lat: 30.7333, lon: 76.7794, district: 'Chandigarh', state: 'Chandigarh' },

  // Maharashtra
  'nashik': { lat: 19.9975, lon: 73.7898, district: 'Nashik', state: 'Maharashtra' },
  'nashik mandi': { lat: 19.9975, lon: 73.7898, district: 'Nashik', state: 'Maharashtra' },
  'lasalgaon': { lat: 20.1444, lon: 74.2281, district: 'Nashik', state: 'Maharashtra' },
  'lasalgaon mandi': { lat: 20.1444, lon: 74.2281, district: 'Nashik', state: 'Maharashtra' },
  'pune': { lat: 18.5204, lon: 73.8567, district: 'Pune', state: 'Maharashtra' },
  'pune mandi': { lat: 18.5204, lon: 73.8567, district: 'Pune', state: 'Maharashtra' },
  'mumbai': { lat: 19.0760, lon: 72.8777, district: 'Mumbai', state: 'Maharashtra' },
  'vashi': { lat: 19.0760, lon: 72.9984, district: 'Thane', state: 'Maharashtra' },
  'nagpur': { lat: 21.1458, lon: 79.0882, district: 'Nagpur', state: 'Maharashtra' },
  'kolhapur': { lat: 16.7050, lon: 74.2433, district: 'Kolhapur', state: 'Maharashtra' },
  'solapur': { lat: 17.6599, lon: 75.9064, district: 'Solapur', state: 'Maharashtra' },

  // Rajasthan
  'jaipur': { lat: 26.9124, lon: 75.7873, district: 'Jaipur', state: 'Rajasthan' },
  'jaipur mandi': { lat: 26.9124, lon: 75.7873, district: 'Jaipur', state: 'Rajasthan' },
  'jodhpur': { lat: 26.2389, lon: 73.0243, district: 'Jodhpur', state: 'Rajasthan' },
  'kota': { lat: 25.2138, lon: 75.8648, district: 'Kota', state: 'Rajasthan' },
  'bikaner': { lat: 28.0229, lon: 73.3119, district: 'Bikaner', state: 'Rajasthan' },
  'udaipur': { lat: 24.5854, lon: 73.7125, district: 'Udaipur', state: 'Rajasthan' },

  // Madhya Pradesh
  'indore': { lat: 22.7196, lon: 75.8577, district: 'Indore', state: 'Madhya Pradesh' },
  'indore mandi': { lat: 22.7196, lon: 75.8577, district: 'Indore', state: 'Madhya Pradesh' },
  'bhopal': { lat: 23.2599, lon: 77.4126, district: 'Bhopal', state: 'Madhya Pradesh' },
  'ujjain': { lat: 23.1765, lon: 75.7885, district: 'Ujjain', state: 'Madhya Pradesh' },
  'jabalpur': { lat: 23.1815, lon: 79.9864, district: 'Jabalpur', state: 'Madhya Pradesh' },

  // Gujarat
  'ahmedabad': { lat: 23.0225, lon: 72.5714, district: 'Ahmedabad', state: 'Gujarat' },
  'surat': { lat: 21.1702, lon: 72.8311, district: 'Surat', state: 'Gujarat' },
  'rajkot': { lat: 22.3039, lon: 70.8022, district: 'Rajkot', state: 'Gujarat' },
  'vadodara': { lat: 22.3072, lon: 73.1812, district: 'Vadodara', state: 'Gujarat' },

  // Bihar & Eastern India
  'patna': { lat: 25.5941, lon: 85.1376, district: 'Patna', state: 'Bihar' },
  'muzaffarpur': { lat: 26.1209, lon: 85.3647, district: 'Muzaffarpur', state: 'Bihar' },
  'kolkata': { lat: 22.5726, lon: 88.3639, district: 'Kolkata', state: 'West Bengal' },
  'ranchi': { lat: 23.3441, lon: 85.3096, district: 'Ranchi', state: 'Jharkhand' },
  'bhubaneswar': { lat: 20.2961, lon: 85.8245, district: 'Khordha', state: 'Odisha' },
  'raipur': { lat: 21.2514, lon: 81.6296, district: 'Raipur', state: 'Chhattisgarh' },

  // South India
  'hyderabad': { lat: 17.3850, lon: 78.4867, district: 'Hyderabad', state: 'Telangana' },
  'warangal': { lat: 17.9689, lon: 79.5941, district: 'Warangal', state: 'Telangana' },
  'guntur': { lat: 16.3067, lon: 80.4365, district: 'Guntur', state: 'Andhra Pradesh' },
  'vijayawada': { lat: 16.5062, lon: 80.6480, district: 'NTR', state: 'Andhra Pradesh' },
  'bengaluru': { lat: 12.9716, lon: 77.5946, district: 'Bengaluru Urban', state: 'Karnataka' },
  'chennai': { lat: 13.0827, lon: 80.2707, district: 'Chennai', state: 'Tamil Nadu' },

  // Himachal & Uttarakhand
  'shimla': { lat: 31.1048, lon: 77.1734, district: 'Shimla', state: 'Himachal Pradesh' },
  'dehradun': { lat: 30.3165, lon: 78.0322, district: 'Dehradun', state: 'Uttarakhand' },
};

class OpenMeteoWeatherProvider {
  constructor(options = {}) {
    this.apiUrl = options.apiUrl || 'https://api.open-meteo.com/v1/forecast';
    this.timeoutMs = options.timeoutMs || 2500;
    this.cache = new SimpleTtlCache(options.cacheTtlSeconds || 1800); // 30 min cache
    this.lastSuccessfulFetch = null;
    this.lastFailure = null;
  }

  /**
   * Resolve latitude and longitude from location query.
   */
  resolveCoordinates(query = {}) {
    const lat = query.lat !== undefined && query.lat !== null && query.lat !== '' ? Number(query.lat) : null;
    const lon = query.lon !== undefined && query.lon !== null && query.lon !== ''
      ? Number(query.lon)
      : (query.lng !== undefined && query.lng !== null && query.lng !== '' ? Number(query.lng) : null);

    if (lat !== null && lon !== null && !isNaN(lat) && !isNaN(lon)) {
      return {
        lat,
        lon,
        district: query.district || query.market || 'Custom Location',
        state: query.state || 'India',
        market: query.market || null,
      };
    }

    const key = (query.market || query.district || query.state || 'karnal').trim().toLowerCase();

    // Direct match
    if (DISTRICT_COORDINATES[key]) {
      const resolved = DISTRICT_COORDINATES[key];
      return {
        lat: resolved.lat,
        lon: resolved.lon,
        district: query.district || resolved.district,
        state: query.state || resolved.state,
        market: query.market || null,
      };
    }

    // Substring match
    for (const [name, data] of Object.entries(DISTRICT_COORDINATES)) {
      if (key.includes(name) || name.includes(key)) {
        return {
          lat: data.lat,
          lon: data.lon,
          district: query.district || data.district,
          state: query.state || data.state,
          market: query.market || null,
        };
      }
    }

    const fallback = DISTRICT_COORDINATES['karnal'];
    return {
      lat: fallback.lat,
      lon: fallback.lon,
      district: query.district || fallback.district,
      state: query.state || fallback.state,
      market: query.market || null,
    };
  }

  /**
   * Fetch live agricultural weather metrics.
   * @param {Object} query
   * @returns {Promise<Object>}
   */
  async getAgriWeather(query = {}) {
    const coords = this.resolveCoordinates(query);
    const cacheKey = SimpleTtlCache.makeKey('openmeteo_weather', {
      lat: coords.lat.toFixed(4),
      lon: coords.lon.toFixed(4),
    });

    const cached = this.cache.get(cacheKey);
    if (cached) {
      return {
        ...cached,
        provenance: {
          ...cached.provenance,
          cached: true,
          cacheHit: true,
        },
      };
    }

    try {
      const params = {
        latitude: coords.lat,
        longitude: coords.lon,
        current: 'temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m',
        daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weather_code',
        timezone: 'Asia/Kolkata',
      };

      const response = await axios.get(this.apiUrl, {
        params,
        timeout: this.timeoutMs,
      });

      const validation = WeatherDataValidator.validateOpenMeteoResponse(response.data);
      if (!validation.isValid) {
        throw new Error(`Open-Meteo validation failed: ${validation.errors.join(', ')}`);
      }

      const normalized = WeatherDataNormalizer.normalizeOpenMeteo(response.data, coords);
      this.cache.set(cacheKey, normalized);
      this.lastSuccessfulFetch = new Date().toISOString();
      this.lastFailure = null;

      return normalized;
    } catch (err) {
      this.lastFailure = err.message;
      console.warn(`[OpenMeteoWeatherProvider Warning] ${err.message}. Generating resilient fallback weather.`);
      return this.getFallbackWeather(coords);
    }
  }

  /**
   * Resilient fallback weather if external API is unreachable.
   */
  getFallbackWeather(coords) {
    const fallbackCurrent = {
      time: new Date().toISOString(),
      temperature: 28.0,
      temperatureUnit: '°C',
      relativeHumidity: 65,
      humidityUnit: '%',
      precipitation: 0.0,
      precipitationUnit: 'mm',
      windSpeed: 8.5,
      windSpeedUnit: 'km/h',
      weatherCode: 1,
      weatherLabel: 'Mainly Clear (Estimated Baseline)',
      weatherCategory: 'FAVORABLE',
      weatherIcon: 'Sun',
    };

    const today = new Date();
    const dailyForecast = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      return {
        date: d.toISOString().split('T')[0],
        tempMax: 32 - i * 0.5,
        tempMin: 22 - i * 0.3,
        precipitationSum: 0.0,
        precipitationProbabilityMax: 10,
        weatherCode: 1,
        weatherLabel: 'Mainly Clear',
        weatherCategory: 'FAVORABLE',
        weatherIcon: 'Sun',
      };
    });

    const advisories = WeatherDataNormalizer.deriveAgriculturalAdvisories(fallbackCurrent, dailyForecast);

    return {
      location: {
        district: coords.district || 'Karnal',
        state: coords.state || 'Haryana',
        market: coords.market || null,
        latitude: coords.lat,
        longitude: coords.lon,
        elevation: 250,
        timezone: 'Asia/Kolkata',
      },
      current: fallbackCurrent,
      forecast: dailyForecast,
      advisories,
      provenance: {
        source: 'SYNTHETIC_FALLBACK',
        provider: 'OpenMeteoWeatherProvider (Standby)',
        retrievedAt: new Date().toISOString(),
        isLive: false,
        fallbackActive: true,
      },
    };
  }

  getProviderStatus() {
    return {
      provider: 'OpenMeteoWeatherProvider',
      isLive: true,
      status: this.lastFailure ? 'STANDBY_DEGRADED' : 'ACTIVE_LIVE',
      apiUrl: this.apiUrl,
      lastSuccessfulFetch: this.lastSuccessfulFetch,
      lastFailure: this.lastFailure,
      cacheStats: this.cache.getStats(),
    };
  }
}

module.exports = OpenMeteoWeatherProvider;
