# KisanSetu — Phase 5: Live / External Agricultural Data Integration

## 1. Executive Summary

Phase 5 establishes a **production-grade external data integration layer** for KisanSetu without compromising system stability or replacing verified APMC historical records. It connects real-time agro-meteorological intelligence from **Open-Meteo** and enables government mandi price streams from **data.gov.in / Agmarknet** via a standardized provider adapter pattern.

### Key Architectural Principles
1. **Zero-Downtime Resilient Fallback**: If external endpoints experience downtime, rate limits, or unconfigured credentials, the system seamlessly serves high-fidelity APMC historical records through `SeededDataProvider` without throwing unhandled exceptions.
2. **Strict Runtime Validation & Normalization**: All external inputs pass through dedicated validation layers (`MarketDataValidator`, `WeatherDataValidator`) and normalization engines (`MarketDataNormalizer`, `WeatherDataNormalizer`) before entering the application pipeline.
3. **In-Memory TTL Caching**: High-efficiency in-memory TTL caching (`SimpleTtlCache`) prevents redundant network overhead, protects third-party rate limits, and provides sub-millisecond response times.
4. **Transparent Multi-Source Provenance**: Every record explicitly labels its source provenance (`LIVE_EXTERNAL`, `LIVE_EXTERNAL_METEO`, `SEEDED_DEMO`, `SYNTHETIC_FALLBACK`).

---

## 2. System Architecture

```
                  ┌────────────────────────────────────────────────────────┐
                  │              EXTERNAL LIVE DATA STREAMS               │
                  │  ┌───────────────────────┐  ┌──────────────────────┐  │
                  │  │ Open-Meteo Weather API│  │ data.gov.in / Agmarknet│  │
                  │  │  (Real-Time Climate)  │  │   (Mandi Spot/Arrival)│  │
                  │  └───────────┬───────────┘  └──────────┬───────────┘  │
                  └──────────────┼─────────────────────────┼──────────────┘
                                 │                         │
                                 ▼                         ▼
                  ┌──────────────────────────┐  ┌──────────────────────────┐
                  │ OpenMeteoWeatherProvider │  │  AgmarknetLiveProvider   │
                  └──────────────┬───────────┘  └──────────┬───────────────┘
                                 │                         │
                                 ▼                         ▼
                  ┌──────────────────────────┐  ┌──────────────────────────┐
                  │  WeatherDataValidator   │  │   MarketDataValidator    │
                  │  WeatherDataNormalizer  │  │   MarketDataNormalizer   │
                  └──────────────┬───────────┘  └──────────┬───────────────┘
                                 │                         │
                                 ▼                         ▼
                  ┌──────────────────────────┐  ┌──────────────────────────┐
                  │   30-Min In-Memory TTL   │  │   15-Min In-Memory TTL   │
                  │      Response Cache      │  │      Response Cache      │
                  └──────────────┬───────────┘  └──────────┬───────────────┘
                                 │                         │ (Failover / Standby)
                                 │                         ▼
                                 │              ┌──────────────────────────┐
                                 │              │    SeededDataProvider    │
                                 │              │ (High-Fidelity APMC DB)  │
                                 │              └──────────┬───────────────┘
                                 │                         │
                                 ▼                         ▼
                  ┌────────────────────────────────────────────────────────┐
                  │            UNIFIED MARKET DATA PROVIDER LAYER          │
                  │                 (dataProvider/index.js)                │
                  └──────────────────────────┬─────────────────────────────┘
                                             │
               ┌─────────────────────────────┼─────────────────────────────┐
               ▼                             ▼                             ▼
   ┌───────────────────────┐   ┌───────────────────────────┐   ┌───────────────────────┐
   │  Demand Forecasting   │   │     Price Intelligence    │   │ Farmer Action Engine  │
   │       (Phase 2)       │   │         (Phase 3)         │   │       (Phase 4)       │
   └───────────────────────┘   └───────────────────────────┘   └───────────────────────┘
               │                             │                             │
               └─────────────────────────────┼─────────────────────────────┘
                                             ▼
                               ┌───────────────────────────┐
                               │ Farmer Intelligence & UI  │
                               │  (MarketDataCard / Views) │
                               └───────────────────────────┘
```

---

## 3. Data Providers & Modules

### 3.1 `OpenMeteoWeatherProvider`
- **Source**: `https://api.open-meteo.com/v1/forecast` (Public, non-commercial, zero-key requirement).
- **Coordinate Resolution**: Pre-configured mapping for key agricultural districts (Delhi, Karnal, Agra, Nashik, Jalandhar, Ambala, Panipat) plus arbitrary GPS coordinates.
- **Metrics Delivered**:
  - Current Temperature (°C), Relative Humidity (%), Precipitation (mm), Wind Speed (km/h), WMO Weather Code.
  - 7-Day Daily Forecast: Max/Min Temperature, Cumulative Rainfall (mm), Rain Probability (%).
  - **Agronomic Impact Advisories**:
    - Mandi Road Connectivity & Waterlogging Transit Risk.
    - Field Harvesting Window (Optimal vs Moisture Danger).
    - Post-Harvest Storage, Aeration & Fungal Spore Prevention.
- **Cache Strategy**: 30-Minute In-Memory TTL.

### 3.2 `AgmarknetLiveProvider`
- **Source**: `https://api.data.gov.in/resource` with resource ID `9ef84268-d588-465a-a308-a864a43d0070`.
- **Authentication**: Configurable via `AGMARKNET_API_KEY` / `DATA_GOV_IN_API_KEY`.
- **Failover Logic**: If API credentials are not supplied or network requests fail, automatically routes requests to `SeededDataProvider`.
- **Cache Strategy**: 15-Minute In-Memory TTL.

### 3.3 `SimpleTtlCache`
- Zero-dependency in-memory cache supporting:
  - Configurable TTL per key.
  - Automatic expiration on access.
  - Telemetry counters (Hits, Misses, Hit Rate %, Size).

---

## 4. API Reference

### 4.1 Live Agricultural Weather
`GET /api/market-data/weather`

#### Parameters:
| Parameter | Type | Required | Description |
|---|---|---|---|
| `market` | string | Optional | Mandi name (e.g. `Karnal Mandi`, `Azadpur APMC Mandi`) |
| `district`| string | Optional | District name (e.g. `Karnal`, `Nashik`) |
| `state` | string | Optional | State name (e.g. `Haryana`, `Maharashtra`) |
| `lat` | number | Optional | Latitude coordinate |
| `lon` | number | Optional | Longitude coordinate |

#### Sample Response:
```json
{
  "success": true,
  "weather": {
    "location": {
      "district": "Karnal",
      "state": "Haryana",
      "market": "Karnal Mandi",
      "latitude": 29.70,
      "longitude": 76.95,
      "timezone": "Asia/Kolkata"
    },
    "current": {
      "temperature": 27.1,
      "temperatureUnit": "°C",
      "relativeHumidity": 78,
      "precipitation": 0.0,
      "windSpeed": 6.2,
      "weatherLabel": "Clear Sky",
      "weatherCategory": "FAVORABLE",
      "weatherIcon": "Sun"
    },
    "forecast": [
      {
        "date": "2026-09-05",
        "tempMax": 33.2,
        "tempMin": 24.1,
        "precipitationSum": 0.0,
        "precipitationProbabilityMax": 10,
        "weatherLabel": "Clear Sky",
        "weatherIcon": "Sun"
      }
    ],
    "advisories": {
      "riskLevel": "LOW",
      "totalForecastRainMm": 4.5,
      "maxDayRainMm": 3.0,
      "rainDaysCount": 1,
      "mandiTransportImpact": "Clear road connectivity; standard mandi transit times expected.",
      "harvestAdvisory": "Optimal harvesting window; dry atmospheric conditions suitable for field operations.",
      "storageAdvisory": "Normal ambient storage acceptable. Standard aeration recommended."
    },
    "provenance": {
      "source": "LIVE_EXTERNAL_METEO",
      "provider": "OpenMeteoWeatherProvider",
      "retrievedAt": "2026-09-05T14:04:48.677Z",
      "isLive": true
    }
  }
}
```

---

### 4.2 Multi-Provider Telemetry & Health
`GET /api/market-data/providers/status`

#### Sample Response:
```json
{
  "success": true,
  "activeMarketProvider": "SeededDatabaseProvider",
  "market": {
    "provider": "SeededDatabaseProvider",
    "isLive": false,
    "sourceType": "SEEDED_DEMO",
    "status": "READY",
    "details": "Provider abstraction initialized"
  },
  "weather": {
    "provider": "OpenMeteoWeatherProvider",
    "isLive": true,
    "status": "ACTIVE_LIVE",
    "apiUrl": "https://api.open-meteo.com/v1/forecast",
    "lastSuccessfulFetch": "2026-09-05T14:04:48.677Z",
    "lastFailure": null,
    "cacheStats": {
      "size": 1,
      "hits": 3,
      "misses": 1,
      "hitRatePercent": 75.0,
      "defaultTtlSeconds": 1800
    }
  },
  "availableSources": {
    "LIVE_EXTERNAL": "LIVE_EXTERNAL",
    "SEEDED_DEMO": "SEEDED_DEMO",
    "SYNTHETIC_FALLBACK": "SYNTHETIC_FALLBACK"
  },
  "timestamp": "2026-09-05T14:04:48.678Z"
}
```

---

## 5. Environment Configuration

In `backend/.env` (sample provided in `backend/.env.example`):

```bash
# Weather Integration (Open-Meteo)
WEATHER_CACHE_MINUTES=30

# Live Government Agmarknet Integration (data.gov.in)
# In demo/testing mode, SeededDataProvider is active.
# To connect live government APMC feeds, set:
AGMARKNET_API_KEY=your_datagov_api_key_here
AGMARKNET_RESOURCE_ID=9ef84268-d588-465a-a308-a864a43d0070
AGMARKNET_API_URL=https://api.data.gov.in/resource
MARKET_DATA_CACHE_MINUTES=15
```

---

## 6. Verification Suite

Run the full Phase 5 backend verification suite:
```bash
node scratch/test_phase5_backend.js
```

### Verified Criteria:
1. `SimpleTtlCache`: Correct eviction, TTL expiration, and telemetry counting.
2. `MarketDataValidator` & `WeatherDataValidator`: Strict schema rejection and sanitized outputs.
3. `OpenMeteoWeatherProvider`: Live HTTP fetch, WMO parsing, and agronomic advisory calculations.
4. `AgmarknetLiveProvider`: Graceful standby and failover to Seeded database.
5. `MarketDataCard.jsx`: Multi-tab navigation with live weather, interactive charts, and transparent provenance badges.
