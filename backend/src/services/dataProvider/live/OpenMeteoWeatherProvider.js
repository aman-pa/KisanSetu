/**
 * OpenMeteoWeatherProvider.js
 * Live Agricultural Weather Provider using Open-Meteo non-commercial public API.
 * Provides real-time and 7-day forecast data mapped to key Indian agricultural districts and mandis.
 */

const axios = require('axios');
const SimpleTtlCache = require('../cache/simpleTtlCache');
const WeatherDataValidator = require('../validation/weatherDataValidator');
const WeatherDataNormalizer = require('../normalization/weatherDataNormalizer');

// Geo-coordinate lookup for primary agricultural production and APMC clusters
const DISTRICT_COORDINATES = {
  // Delhi NCR
  'delhi': { lat: 28.6139, lon: 77.2090, district: 'Delhi', state: 'Delhi' },
  'azadpur apmc mandi': { lat: 28.7112, lon: 77.1788, district: 'North Delhi', state: 'Delhi' },
  'ghazipur mandi': { lat: 28.6258, lon: 77.3274, district: 'East Delhi', state: 'Delhi' },

  // Haryana
  'karnal': { lat: 29.6857, lon: 76.9905, district: 'Karnal', state: 'Haryana' },
  'karnal mandi': { lat: 29.6857, lon: 76.9905, district: 'Karnal', state: 'Haryana' },
  'ambala': { lat: 30.3782, lon: 76.7767, district: 'Ambala', state: 'Haryana' },
  'ambala city mandi': { lat: 30.3782, lon: 76.7767, district: 'Ambala', state: 'Haryana' },
  'panipat': { lat: 29.3909, lon: 76.9635, district: 'Panipat', state: 'Haryana' },
  'panipat mandi': { lat: 29.3909, lon: 76.9635, district: 'Panipat', state: 'Haryana' },

  // Uttar Pradesh
  'agra': { lat: 27.1767, lon: 78.0081, district: 'Agra', state: 'Uttar Pradesh' },
  'agra mandi': { lat: 27.1767, lon: 78.0081, district: 'Agra', state: 'Uttar Pradesh' },

  // Maharashtra
  'nashik': { lat: 19.9975, lon: 73.7898, district: 'Nashik', state: 'Maharashtra' },
  'lasalgaon mandi': { lat: 20.1444, lon: 74.2281, district: 'Nashik', state: 'Maharashtra' },

  // Punjab
  'jalandhar': { lat: 31.3260, lon: 75.5762, district: 'Jalandhar', state: 'Punjab' },
  'jalandhar cantt mandi': { lat: 31.3260, lon: 75.5762, district: 'Jalandhar', state: 'Punjab' },
};

class OpenMeteoWeatherProvider {
  constructor(options = {}) {
    this.apiUrl = options.apiUrl || 'https://api.open-meteo.com/v1/forecast';
    this.timeoutMs = options.timeoutMs || 8000;
    this.cache = new SimpleTtlCache(options.cacheTtlSeconds || 1800); // 30 min cache
    this.lastSuccessfulFetch = null;
    this.lastFailure = null;
  }

  /**
   * Resolve latitude and longitude from location query.
   */
  resolveCoordinates(query = {}) {
    if (query.lat && query.lon && !isNaN(Number(query.lat)) && !isNaN(Number(query.lon))) {
      return {
        lat: Number(query.lat),
        lon: Number(query.lon),
        district: query.district || 'Custom Location',
        state: query.state || 'India',
        market: query.market || null,
      };
    }

    const key = (query.market || query.district || query.state || 'karnal').trim().toLowerCase();
    const resolved = DISTRICT_COORDINATES[key] || DISTRICT_COORDINATES['karnal'];

    return {
      lat: resolved.lat,
      lon: resolved.lon,
      district: query.district || resolved.district,
      state: query.state || resolved.state,
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
