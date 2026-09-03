# Agricultural Market Data Layer Documentation (Phase 1)

## 1. Overview & Architecture

The KisanSetu AI Agricultural Data Layer provides a normalized, high-integrity foundation for historical market prices, daily arrivals, and regional supply indicators. It is architected to power downstream capabilities:
- **Phase 2**: Demand Forecasting (time-series ML models)
- **Phase 3**: Dynamic Price Recommendations (farm-gate pricing)
- **Phase 11**: Regional Surplus / Shortage Intelligence

```
                        ┌─────────────────────────────────────────┐
                        │        Express Route Layer             │
                        │       /api/market-data/*                │
                        └────────────────────┬────────────────────┘
                                             │
                        ┌────────────────────▼────────────────────┐
                        │      marketDataController.js            │
                        │  (Input validation & query normalization)│
                        └────────────────────┬────────────────────┘
                                             │
                        ┌────────────────────▼────────────────────┐
                        │     MarketDataProvider Interface        │
                        └──────────┬───────────────────┬──────────┘
                                   │                   │
               ┌───────────────────▼──────┐     ┌──────▼────────────────────┐
               │   SeededDataProvider     │     │    AgmarknetProvider      │
               │ (MongoDB High-Perf Agg)  │     │ (Live Gov API Standby)    │
               └───────────┬──────────────┘     └───────────────────────────┘
                           │
       ┌───────────────────┴───────────────────┐
       │                                       │
┌──────▼───────────────────────┐ ┌──────────────▼──────────────────────┐
│       MarketPrice            │ │      CommodityArrival               │
│  (Mongoose 90-Day Series)    │ │   (Mongoose Volume Series)          │
└──────────────────────────────┘ └─────────────────────────────────────┘
```

---

## 2. Database Schemas

### A. `MarketPrice` Schema (`backend/src/models/MarketPrice.js`)

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `commodity` | `String` | Yes | - | Crop name (e.g., Tomato, Potato, Onion, Wheat, Rice, Apple) |
| `variety` | `String` | No | `'Standard'` | Agricultural variety (e.g. Hybrid, Pukhraj, HD-2967) |
| `grade` | `String` | No | `'GRADE_A'` | Enum: `['GRADE_A', 'GRADE_B', 'GRADE_C', 'FAQ', 'STANDARD']` |
| `state` | `String` | Yes | - | State name (e.g., Haryana, Punjab, Delhi, Maharashtra, UP) |
| `district` | `String` | Yes | - | District name (e.g., Karnal, Panipat, Nashik, Agra) |
| `market` | `String` | Yes | - | APMC Mandi / Trading Hub (e.g. Azadpur APMC Mandi, Lasalgaon Mandi) |
| `arrivalDate` | `Date` | Yes | - | Date and time of arrival auction record |
| `minPrice` | `Number` | Yes | - | Daily lower trading band in Rs/Quintal (min: 0) |
| `maxPrice` | `Number` | Yes | - | Daily upper trading band in Rs/Quintal (min: 0) |
| `modalPrice` | `Number` | Yes | - | Daily weighted modal auction price in Rs/Quintal (min: 0) |
| `unit` | `String` | No | `'Rs/Quintal'` | Pricing unit (`Rs/Quintal`, `Rs/Kg`, `Rs/Tonne`) |
| `source` | `String` | No | `'SEEDED_DEMO'` | Enum: `['LIVE_EXTERNAL', 'SEEDED_DEMO', 'SYNTHETIC_FALLBACK']` |
| `sourceTimestamp` | `Date` | No | `Date.now` | Ingestion timestamp |
| `isSynthetic` | `Boolean`| No | `true` | Explicit synthetic/seed data marker |

**Compound Indexes**:
- `{ commodity: 1, market: 1, arrivalDate: -1 }`
- `{ commodity: 1, district: 1, arrivalDate: -1 }`
- `{ commodity: 1, arrivalDate: -1 }`

---

### B. `CommodityArrival` Schema (`backend/src/models/CommodityArrival.js`)

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `commodity` | `String` | Yes | - | Crop name |
| `variety` | `String` | No | `'Standard'` | Agricultural variety |
| `state` | `String` | Yes | - | State |
| `district` | `String` | Yes | - | District |
| `market` | `String` | Yes | - | Mandi name |
| `arrivalDate` | `Date` | Yes | - | Date of arrival |
| `arrivalQuantity`| `Number` | Yes | - | Measured volume in Metric Tonnes (min: 0) |
| `unit` | `String` | No | `'Tonnes'` | Measurement unit (`Tonnes`, `Quintals`, `Kg`) |
| `source` | `String` | No | `'SEEDED_DEMO'` | Enum: `['LIVE_EXTERNAL', 'SEEDED_DEMO', 'SYNTHETIC_FALLBACK']` |
| `sourceTimestamp` | `Date` | No | `Date.now` | Ingestion timestamp |
| `isSynthetic` | `Boolean`| No | `true` | Explicit synthetic/seed data marker |

**Compound Indexes**:
- `{ commodity: 1, market: 1, arrivalDate: -1 }`
- `{ commodity: 1, district: 1, arrivalDate: -1 }`
- `{ commodity: 1, arrivalDate: -1 }`

---

## 3. Data Source Classification

Every data point returned by the API or stored in MongoDB carries a strict source classification tag:

1. `LIVE_EXTERNAL`: Real verified API data pulled from live government portals (e.g. Agmarknet / e-NAM / data.gov.in) with active authentication.
2. `SEEDED_DEMO`: High-fidelity, multi-market historical agricultural dataset seeded for evaluation, demonstration, and ML training during prototyping.
3. `SYNTHETIC_FALLBACK`: Mathematically modeled backup data generated when network feeds or providers are unreachable.

> **Integrity Guarantee**: KisanSetu AI never labels demo or synthetic records as live data. The `isSynthetic` boolean is always explicitly returned.

---

## 4. REST API Reference

### 1. `GET /api/market-data/prices`
Fetches historical mandi price observations with filters, pagination, and statistical rollups.

**Query Parameters**:
- `commodity` *(string, optional)*: Filter by crop (e.g., `Tomato`, `Potato`, `Wheat`).
- `state` *(string, optional)*: Filter by state (e.g., `Haryana`, `Delhi`).
- `district` *(string, optional)*: Filter by district (e.g., `Karnal`, `Nashik`).
- `market` *(string, optional)*: Filter by mandi name.
- `from` *(date string, optional)*: Start date in ISO format (`YYYY-MM-DD`).
- `to` *(date string, optional)*: End date in ISO format (`YYYY-MM-DD`).
- `page` *(number, default: 1)*: Page number.
- `limit` *(number, default: 50, max: 500)*: Records per page.

**Example Response**:
```json
{
  "success": true,
  "count": 50,
  "records": [
    {
      "_id": "66d6fe4b1234567890abcdef",
      "commodity": "Tomato",
      "variety": "Hybrid / Desi",
      "grade": "GRADE_A",
      "state": "Haryana",
      "district": "Karnal",
      "market": "Karnal Mandi",
      "arrivalDate": "2026-09-03T05:00:00.000Z",
      "minPrice": 2480,
      "maxPrice": 2840,
      "modalPrice": 2650,
      "unit": "Rs/Quintal",
      "modalPricePerKg": 26.5,
      "minPricePerKg": 24.8,
      "maxPricePerKg": 28.4,
      "source": "SEEDED_DEMO",
      "sourceTimestamp": "2026-09-03T05:00:00.000Z",
      "isSynthetic": true
    }
  ],
  "statistics": {
    "totalRecords": 2457,
    "avgModalPrice": 2618,
    "avgModalPricePerKg": 26.18,
    "minObservedPrice": 1820,
    "maxObservedPrice": 3490,
    "earliestDate": "2026-06-05T05:00:00.000Z",
    "latestDate": "2026-09-03T05:00:00.000Z"
  },
  "metadata": {
    "page": 1,
    "limit": 50,
    "totalPages": 50,
    "source": "SEEDED_DEMO",
    "isSynthetic": true,
    "disclaimer": "Curated agricultural demo market dataset for SIH 2026 prototyping and ML model validation.",
    "retrievedAt": "2026-09-03T10:15:00.000Z"
  }
}
```

---

### 2. `GET /api/market-data/prices/current`
Returns latest modal price snapshots per commodity and market with 7-day trend indicators.

**Query Parameters**:
- `commodity`, `state`, `district`, `market` *(optional)*

**Example Response**:
```json
{
  "success": true,
  "count": 6,
  "snapshots": [
    {
      "commodity": "Tomato",
      "variety": "Hybrid / Desi",
      "grade": "GRADE_A",
      "state": "Delhi",
      "district": "Delhi NCR",
      "market": "Azadpur APMC Mandi",
      "arrivalDate": "2026-09-03T05:00:00.000Z",
      "currentModalPrice": 2980,
      "currentModalPricePerKg": 29.8,
      "minPrice": 2780,
      "maxPrice": 3210,
      "unit": "Rs/Quintal",
      "trend": "RISING",
      "change7d": 180,
      "changePercent": 6.4,
      "source": "SEEDED_DEMO",
      "isSynthetic": true
    }
  ],
  "metadata": {
    "totalSnapshots": 6,
    "source": "SEEDED_DEMO",
    "isSynthetic": true,
    "retrievedAt": "2026-09-03T10:15:00.000Z"
  }
}
```

---

### 3. `GET /api/market-data/arrivals`
Fetches commodity arrival volumes across markets.

**Query Parameters**:
- `commodity`, `state`, `district`, `market`, `from`, `to`, `page`, `limit`

**Example Response**:
```json
{
  "success": true,
  "count": 50,
  "arrivals": [
    {
      "commodity": "Tomato",
      "variety": "Hybrid / Desi",
      "state": "Delhi",
      "district": "Delhi NCR",
      "market": "Azadpur APMC Mandi",
      "arrivalDate": "2026-09-03T05:00:00.000Z",
      "arrivalQuantity": 228.5,
      "unit": "Tonnes",
      "source": "SEEDED_DEMO",
      "isSynthetic": true
    }
  ],
  "statistics": {
    "totalRecords": 2457,
    "totalArrivalTonnes": 312450.5,
    "avgDailyArrivalTonnes": 127.2
  },
  "metadata": {
    "page": 1,
    "limit": 50,
    "totalPages": 50,
    "source": "SEEDED_DEMO",
    "isSynthetic": true
  }
}
```

---

### 4. `GET /api/market-data/supply`
Calculates regional supply velocity, surplus/deficit indicators, and 7-day vs 30-day baseline ratios.

**Query Parameters**:
- `commodity`, `district`, `state` *(optional)*

**Example Response**:
```json
{
  "success": true,
  "count": 8,
  "indicators": [
    {
      "commodity": "Tomato",
      "district": "Karnal",
      "state": "Haryana",
      "supplyStatus": "SURPLUS",
      "supplyIndexScore": 68,
      "weeklyArrivalTonnes": 520.4,
      "baselineWeeklyTonnes": 410.0,
      "ratioToBaseline": 1.27,
      "activeMarketsCount": 1,
      "markets": ["Karnal Mandi"],
      "latestArrivalDate": "2026-09-03T05:00:00.000Z",
      "source": "SEEDED_DEMO",
      "isSynthetic": true
    }
  ],
  "metadata": {
    "totalRegionsAnalyzed": 8,
    "source": "SEEDED_DEMO",
    "isSynthetic": true,
    "computedAt": "2026-09-03T10:15:00.000Z"
  }
}
```

---

### 5. `GET /api/market-data/providers/status`
Returns data provider configuration, connectivity readiness, and available source classifications.

---

## 5. Seeded Dataset Scope

- **Commodities**: Tomato, Potato, Onion, Wheat, Rice, Apple
- **Target Markets**:
  1. Karnal Mandi (Karnal, Haryana)
  2. Panipat Mandi (Panipat, Haryana)
  3. Ambala City Mandi (Ambala, Haryana)
  4. Jalandhar Cantt Mandi (Jalandhar, Punjab)
  5. Azadpur APMC Mandi (Delhi NCR, Delhi)
  6. Ghazipur Mandi (Delhi NCR, Delhi)
  7. Lasalgaon Mandi (Nashik, Maharashtra - Onion Hub)
  8. Agra Mandi (Agra, Uttar Pradesh - Potato Hub)
- **Time Horizon**: 90 continuous days of daily historical records (~2,400+ MarketPrice records & ~2,400+ CommodityArrival records) with realistic seasonal wave functions, commodity-specific volatility, and intra-day price spreads.

---

## 6. How Future Live Government APIs will be Integrated

The `AgmarknetProvider` class is already designed to support live Agmarknet / e-NAM data feeds:
1. Supply `AGMARKNET_API_KEY`, `AGMARKNET_API_URL`, and `AGMARKNET_RESOURCE_ID` in `.env`.
2. When configured, `getActiveProvider()` automatically routes live requests through `AgmarknetProvider`.
3. Live records will be tagged with `source: 'LIVE_EXTERNAL'` and `isSynthetic: false`.
4. If the live feed fails or times out, the system will fall back to `SeededDataProvider` / `SYNTHETIC_FALLBACK` with explicit transparency.
