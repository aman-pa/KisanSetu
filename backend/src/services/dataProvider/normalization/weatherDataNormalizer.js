/**
 * weatherDataNormalizer.js
 * Normalizes live meteorological data into farmer-centric agricultural weather metrics.
 * Interprets WMO weather codes, rainfall risk, humidity impact, and harvesting advisories.
 */

class WeatherDataNormalizer {
  /**
   * Map WMO Weather Interpretation Codes (WW) to human-readable agricultural descriptions.
   */
  static interpretWmoCode(code) {
    const table = {
      0: { label: 'Clear Sky', category: 'FAVORABLE', icon: 'Sun' },
      1: { label: 'Mainly Clear', category: 'FAVORABLE', icon: 'Sun' },
      2: { label: 'Partly Cloudy', category: 'FAVORABLE', icon: 'CloudSun' },
      3: { label: 'Overcast', category: 'NEUTRAL', icon: 'Cloud' },
      45: { label: 'Foggy / Low Visibility', category: 'CAUTION', icon: 'CloudFog' },
      48: { label: 'Depositing Rime Fog', category: 'CAUTION', icon: 'CloudFog' },
      51: { label: 'Light Drizzle', category: 'MODERATE_RAIN', icon: 'CloudDrizzle' },
      53: { label: 'Moderate Drizzle', category: 'MODERATE_RAIN', icon: 'CloudDrizzle' },
      55: { label: 'Dense Drizzle', category: 'MODERATE_RAIN', icon: 'CloudDrizzle' },
      61: { label: 'Slight Rain', category: 'RAIN', icon: 'CloudRain' },
      63: { label: 'Moderate Rain', category: 'HEAVY_RAIN', icon: 'CloudRain' },
      65: { label: 'Heavy Rain', category: 'HEAVY_RAIN', icon: 'CloudRain' },
      71: { label: 'Slight Snowfall', category: 'COLD_RISK', icon: 'CloudSnow' },
      73: { label: 'Moderate Snowfall', category: 'COLD_RISK', icon: 'CloudSnow' },
      75: { label: 'Heavy Snowfall', category: 'COLD_RISK', icon: 'CloudSnow' },
      80: { label: 'Slight Rain Showers', category: 'RAIN', icon: 'CloudRain' },
      81: { label: 'Moderate Rain Showers', category: 'HEAVY_RAIN', icon: 'CloudRain' },
      82: { label: 'Violent Rain Showers', category: 'ALERT', icon: 'CloudLightning' },
      95: { label: 'Thunderstorm', category: 'ALERT', icon: 'CloudLightning' },
      96: { label: 'Thunderstorm with Slight Hail', category: 'HAIL_ALERT', icon: 'CloudHail' },
      99: { label: 'Thunderstorm with Heavy Hail', category: 'HAIL_ALERT', icon: 'CloudHail' },
    };

    return table[code] || { label: 'Variable Weather', category: 'NEUTRAL', icon: 'Cloud' };
  }

  /**
   * Formulate actionable agricultural impact advisory based on weather parameters.
   * @param {Object} current
   * @param {Array} dailyForecast
   * @returns {{ riskLevel: string, mandiTransportImpact: string, harvestAdvisory: string, storageAdvisory: string }}
   */
  static deriveAgriculturalAdvisories(current, dailyForecast = []) {
    const currentRain = current.precipitation || 0;
    const temp = current.temperature || 25;
    const humidity = current.relativeHumidity || 60;

    // 7-day cumulative precipitation
    const totalForecastRain = dailyForecast.reduce((sum, d) => sum + (d.precipitationSum || 0), 0);
    const maxDayRain = dailyForecast.reduce((max, d) => Math.max(max, d.precipitationSum || 0), 0);
    const rainDaysCount = dailyForecast.filter((d) => (d.precipitationSum || 0) > 2.5).length;

    let riskLevel = 'LOW';
    let mandiTransportImpact = 'Clear road connectivity; standard mandi transit times expected.';
    let harvestAdvisory = 'Optimal harvesting window; dry atmospheric conditions suitable for field operations.';
    let storageAdvisory = 'Normal ambient storage acceptable. Standard aeration recommended.';

    if (maxDayRain >= 35 || totalForecastRain >= 70) {
      riskLevel = 'HIGH';
      mandiTransportImpact = 'Heavy waterlogging potential on rural mandi access roads. Expect logistical transit delays.';
      harvestAdvisory = 'Postpone harvesting perishable crops (Tomato, Vegetables). High risk of moisture damage in fields.';
      storageAdvisory = 'Critical: Move produce to waterproof raised covered storage immediately. Prevent moisture contact.';
    } else if (maxDayRain >= 12 || totalForecastRain >= 25 || rainDaysCount >= 3) {
      riskLevel = 'MODERATE';
      mandiTransportImpact = 'Moderate showers may cause slight transit delays. Ensure tarpaulin coverings on transport vehicles.';
      harvestAdvisory = 'Harvest mature crops promptly before upcoming precipitation. Avoid leaving harvested heaps in open fields.';
      storageAdvisory = 'Keep produce protected under waterproof shed. Inspect humidity levels to prevent fungal mold.';
    } else if (temp >= 40) {
      riskLevel = 'MODERATE';
      mandiTransportImpact = 'High heat index; transport perishable crops during night or early morning hours.';
      harvestAdvisory = 'Irrigate standing crops during early hours to avoid thermal stress.';
      storageAdvisory = 'Ensure well-ventilated shade storage to avoid produce desiccation and quality loss.';
    } else if (humidity >= 85) {
      storageAdvisory = 'Elevated humidity: High risk of fungal spores. Ensure active ventilation in storage sheds.';
    }

    return {
      riskLevel,
      totalForecastRainMm: Number(totalForecastRain.toFixed(1)),
      maxDayRainMm: Number(maxDayRain.toFixed(1)),
      rainDaysCount,
      mandiTransportImpact,
      harvestAdvisory,
      storageAdvisory,
    };
  }

  /**
   * Normalize full Open-Meteo payload into structured agricultural weather report.
   * @param {Object} raw
   * @param {Object} locationInfo
   * @returns {Object}
   */
  static normalizeOpenMeteo(raw, locationInfo = {}) {
    const currentCode = raw.current?.weather_code ?? 0;
    const currentCodeInfo = this.interpretWmoCode(currentCode);

    const current = {
      time: raw.current?.time || new Date().toISOString(),
      temperature: raw.current?.temperature_2m ?? 0,
      temperatureUnit: raw.current_units?.temperature_2m || '°C',
      relativeHumidity: raw.current?.relative_humidity_2m ?? 0,
      humidityUnit: raw.current_units?.relative_humidity_2m || '%',
      precipitation: raw.current?.precipitation ?? 0,
      precipitationUnit: raw.current_units?.precipitation || 'mm',
      windSpeed: raw.current?.wind_speed_10m ?? 0,
      windSpeedUnit: raw.current_units?.wind_speed_10m || 'km/h',
      weatherCode: currentCode,
      weatherLabel: currentCodeInfo.label,
      weatherCategory: currentCodeInfo.category,
      weatherIcon: currentCodeInfo.icon,
    };

    const dailyTimes = raw.daily?.time || [];
    const dailyForecast = dailyTimes.map((dateStr, idx) => {
      const code = raw.daily?.weather_code?.[idx] ?? 0;
      const codeInfo = this.interpretWmoCode(code);
      return {
        date: dateStr,
        tempMax: raw.daily?.temperature_2m_max?.[idx] ?? 0,
        tempMin: raw.daily?.temperature_2m_min?.[idx] ?? 0,
        precipitationSum: raw.daily?.precipitation_sum?.[idx] ?? 0,
        precipitationProbabilityMax: raw.daily?.precipitation_probability_max?.[idx] ?? 0,
        weatherCode: code,
        weatherLabel: codeInfo.label,
        weatherCategory: codeInfo.category,
        weatherIcon: codeInfo.icon,
      };
    });

    const advisories = this.deriveAgriculturalAdvisories(current, dailyForecast);

    return {
      location: {
        district: locationInfo.district || 'Regional Mandi Cluster',
        state: locationInfo.state || 'National',
        market: locationInfo.market || null,
        latitude: raw.latitude,
        longitude: raw.longitude,
        elevation: raw.elevation,
        timezone: raw.timezone || 'Asia/Kolkata',
      },
      current,
      forecast: dailyForecast,
      advisories,
      provenance: {
        source: 'LIVE_EXTERNAL_METEO',
        provider: 'OpenMeteoWeatherProvider',
        retrievedAt: new Date().toISOString(),
        isLive: true,
      },
    };
  }
}

module.exports = WeatherDataNormalizer;
