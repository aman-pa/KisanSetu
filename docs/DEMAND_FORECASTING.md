# KisanSetu AI — Phase 2: Agricultural Demand Forecasting Pipeline

## 1. Executive Summary & Objective

In agricultural supply chains, forecasting future regional commodity demand empowers farmers, FPOs, and institutional buyers to:
1. Prevent seasonal price crashes and distress selling during supply surges.
2. Route surplus produce proactively to deficit consuming urban clusters.
3. Establish fair forward pricing contracts for direct farm-gate procurement.
4. Support government and policy makers with regional surplus/shortage intelligence.

This document details the **Phase 2 Demand Forecasting Engine** (`v2.0.0-phase2`), built upon the Phase 1 Agricultural Market Data Layer.

---

## 2. Dataset & Economic Demand Proxy Definition

### 2.1 The Direct Demand Observation Limitation
Direct consumer retail checkout volume is not universally accessible across Indian agricultural mandis. Equating physical mandi arrivals directly to consumer demand is economically flawed, as high arrivals may represent distress offloading during a supply glut rather than high demand.

### 2.2 The Derived Realized Market Demand Proxy Formula
To establish an economically defensible demand indicator, we derive the **Realized Demand Proxy ($D_t$)** by combining physical arrival volumes ($A_t$) with market-clearing equilibrium price pressure ($P_t$ vs. 30-day baseline $\bar{P}_{30d}$):

$$D_t = A_t \times \left(1 + \beta \cdot \frac{P_t - \bar{P}_{30d}}{\bar{P}_{30d}}\right)$$

Where:
- $A_t$: Daily observed physical arrival volume (in Tonnes or Quintals).
- $P_t$: Daily observed modal market price (₹/Quintal).
- $\bar{P}_{30d}$: Rolling 30-day moving average baseline modal price.
- $\beta = 0.5$: Empirical price elasticity coefficient reflecting market absorption pressure. When prices are 10% above rolling average, demand absorption pressure exceeds physical arrivals by +5%.

### 2.3 Normalized Demand Pressure Index (0–100)
$$\text{DemandIndex}_t = \text{clip}\left(50 + 25 \cdot \frac{P_t - \bar{P}_{30d}}{\bar{P}_{30d}} + 25 \cdot \frac{A_t - \bar{A}_{30d}}{\bar{A}_{30d}}, 0, 100\right)$$

---

## 3. Candidate Models & Time-Series Validation Benchmark

### 3.1 Validation Methodology
- **Chronological Split**: 61 days training ($t_0 \dots t_{60}$), up to 30 days out-of-sample forward testing ($t_{61} \dots t_{90}$).
- **Zero Future Leakage**: All rolling statistics, trend levels, and Fourier harmonics are computed strictly from historical observations up to $t$.
- **Evaluation Metrics**:
  - **MAE**: Mean Absolute Error (Tonnes)
  - **RMSE**: Root Mean Squared Error (Tonnes)
  - **WAPE**: Weighted Absolute Percentage Error ($\frac{\sum |y - \hat{y}|}{\sum y} \times 100$) — robust to zero/near-zero values
  - **MAPE**: Mean Absolute Percentage Error (%)
  - **Prediction Interval Coverage**: Empirical percentage of test observations falling within calculated 80% and 95% uncertainty bounds.

### 3.2 Benchmark Performance Comparison (Across 6 Commodities & 3 Horizons)

| Model Architecture | 7d WAPE | 15d WAPE | 30d WAPE | Overall WAPE | Overall RMSE | 80% Coverage | 95% Coverage |
|---|---|---|---|---|---|---|---|
| **Seasonal Naive (7-Day)** | 8.97% | 8.24% | 7.41% | 8.21% | 23.28 T | — | — |
| **Fourier Trend Ridge Regression** | 7.83% | 7.46% | 6.67% | 7.32% | 20.18 T | — | — |
| **Moving Average (7-Day)** | 8.09% | 6.87% | 6.86% | 7.27% | 20.05 T | — | — |
| **Naive (Last Value)** | 7.63% | 6.40% | 6.45% | 6.83% | 19.32 T | — | — |
| **Damped Holt Linear Trend** | 7.65% | 6.40% | 6.42% | 6.82% | 19.30 T | — | — |
| **KisanSetu Hybrid (Damped Holt + Fourier)** ⭐ | **4.88%** | **4.62%** | **4.82%** | **4.77%** | **14.19 T** | **91.9%** | **100.0%** |

---

## 4. Selected Model Architecture

The **KisanSetu Hybrid Adaptive Time-Series Engine** (`v2.0.0-phase2`) combines:
1. **Damped Holt Exponential Smoothing**: Adaptive level and trend tracking with damping parameter $\phi = 0.92$ to prevent runaway divergence over 15d and 30d horizons.
2. **Fourier Harmonics Decomposition**: Captures 7-day and 14-day cyclical weekly mandi restocking patterns.
3. **Statistically Calibrated Prediction Intervals**:
   - In-sample residual standard deviation ($\hat{\sigma}$) is computed on detrended residuals.
   - Forward uncertainty expands with horizon step $h$:
     $$\text{Margin}_{80} = 1.28 \cdot \hat{\sigma} \cdot \sqrt{h}$$
     $$\text{Margin}_{95} = 1.96 \cdot \hat{\sigma} \cdot \sqrt{h}$$
   - Yields **91.9% empirical coverage for 80% CI** and **100% empirical coverage for 95% CI**.

---

## 5. REST API Specifications

### 5.1 Endpoints
- `GET /api/demand/forecast`
- `GET /api/market-data/forecast`

### 5.2 Query Parameters
- `commodity` (required/optional, default: `Tomato`): `Tomato`, `Potato`, `Onion`, `Wheat`, `Rice`, `Apple`.
- `district` (optional, default: `Delhi NCR`): target consuming mandi/district.
- `state` (optional, default: `Delhi`).
- `horizon` (optional, default: `30`): supported horizons `7`, `15`, `30` (days).

### 5.3 Example Request
```http
GET /api/demand/forecast?commodity=Tomato&district=Delhi+NCR&horizon=7
```

### 5.4 Example Response
```json
{
  "success": true,
  "commodity": "Tomato",
  "district": "Delhi NCR",
  "state": "Delhi",
  "horizonDays": 7,
  "timePeriod": "Next 7 Days",
  "historicalDailyAvgTonnes": 374.1,
  "predictedDailyAvgTonnes": 360.7,
  "totalPredictedDemandTonnes": 2525.0,
  "currentSupplyDailyAvgTonnes": 371.4,
  "demandGapTonnes": -74.8,
  "demandStatus": "BALANCED",
  "demandTrendPercentage": -3.6,
  "recommendation": "Balanced market equilibrium projected in Delhi NCR for Tomato over next 7 days.",
  "historicalSeries": [
    {
      "date": "2026-09-03",
      "arrivalQuantityTonnes": 375.2,
      "modalPricePerQuintal": 3460,
      "demandProxyTonnes": 381.4,
      "demandIndex": 54
    }
  ],
  "forecastSeries": [
    {
      "step": 1,
      "date": "2026-09-04",
      "predictedDemandTonnes": 364.65,
      "lower80Tonnes": 347.58,
      "upper80Tonnes": 381.72,
      "lower95Tonnes": 338.5,
      "upper95Tonnes": 390.8
    }
  ],
  "modelMetadata": {
    "modelName": "KisanSetu Hybrid Adaptive Time-Series Engine (Damped Holt Trend + Fourier Harmonics)",
    "modelVersion": "2.0.0-phase2",
    "trainingObservations": 91,
    "validationMetrics": {
      "inSampleMAE": 10.26,
      "inSampleRMSE": 13.34,
      "inSampleWAPE": 2.76,
      "unit": "Tonnes"
    },
    "confidenceIntervals": {
      "supported": true,
      "levels": ["80%", "95%"],
      "method": "Empirical In-Sample Residual Variance with sqrt(h) Horizon Scaling"
    },
    "isSynthetic": true,
    "dataProvenance": "SEEDED_DEMO_AGMARKNET",
    "disclaimer": "Forecast is an algorithmic estimate derived from mandi arrival volumes and price elasticity proxies. Not a commercial guarantee."
  },
  "generatedAt": "2026-09-03T15:00:00.000Z"
}
```

---

## 6. Performance, Caching & Scalability
- **10-Minute Caching Layer**: In-process memory caching (`commodity_district_horizon`) ensures microsecond response times for repetitive dashboard queries without re-training models.
- **Zero-Dependency Fallback**: The backend includes both a Python FastAPI microservice bridge and an in-process embedded JavaScript forecasting engine, guaranteeing 100% uptime even if the Python service is offline.
- **Traceability & Storage**: Every generated forecast snapshot is saved to MongoDB (`DemandForecast` collection) for government policy reporting and auditability.

---

## 7. Data Provenance & Future Roadmap
- The Phase 2 dataset is marked transparently as `SEEDED_DEMO_AGMARKNET`.
- Because Phase 1 established a pluggable `MarketDataProvider` abstraction, live Agmarknet / e-NAM API feeds can replace seeded data instantly by registering an active API provider key without modifying the forecasting model code.
