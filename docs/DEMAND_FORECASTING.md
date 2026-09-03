# KisanSetu AI — Phase 2: Agricultural Demand & Market Pressure Forecasting Pipeline

## 1. Executive Summary & Objective

In agricultural supply chains, forecasting future regional commodity demand empowers farmers, FPOs, and institutional buyers to:
1. Prevent seasonal price crashes and distress selling during supply surges.
2. Route surplus produce proactively to deficit consuming urban clusters.
3. Establish fair forward pricing contracts for direct farm-gate procurement.
4. Support government and policy makers with regional surplus/shortage intelligence.

This document details the **Phase 2 Market Pressure & Demand Forecasting Engine** (`v2.0.0-phase2`), built upon the Phase 1 Agricultural Market Data Layer.

---

## 2. Dataset & Target Definition: Honest Econometric Framing

### 2.1 The Direct Demand Ground-Truth Limitation
Direct point-of-sale retail consumer checkout volume is not recorded or accessible across Indian APMC mandis. Equating physical mandi arrivals directly to consumer demand is economically flawed, because a surge in arrivals may reflect distress harvesting during bad weather rather than strong consumer demand.

### 2.2 Explicit Separation of Data Tiers

To ensure complete scientific integrity, the pipeline explicitly separates three distinct tiers:

1. **Observed Physical Market Data**:
   - **Daily Mandi Arrival Quantity ($A_t$)**: In Tonnes.
   - **Daily Modal Clearing Price ($P_t$)**: In ₹/Quintal.
2. **Derived Market Indicator**:
   - **Market Absorption & Pressure Proxy ($M_t$)**: Price-adjusted arrival volume representing realized market turnover and buying absorption pressure.
3. **Forecast Target**:
   - **Projected Market Pressure Proxy ($\hat{M}_{t+h}$)**: Forward projection across 7-day, 15-day, and 30-day horizons with calibrated statistical confidence intervals.

### 2.3 The Heuristic Market Pressure Proxy Formula
We derive the realized market absorption proxy ($M_t$) by adjusting arrival volume ($A_t$) against market-clearing equilibrium price deviations relative to a 30-day rolling baseline ($\bar{P}_{30d}$):

$$M_t = A_t \times \left(1 + \lambda_{\text{heuristic}} \cdot \frac{P_t - \bar{P}_{30d}}{\bar{P}_{30d}}\right)$$

Where:
- $A_t$: Daily observed physical arrival volume (in Tonnes).
- $P_t$: Daily observed modal market price (₹/Quintal).
- $\bar{P}_{30d}$: Rolling 30-day backward-looking moving average modal price.
- $\lambda_{\text{heuristic}} = 0.5$: **Explicit Heuristic Sensitivity Weight**. This is an intentional modeling assumption designed to buffer physical supply volatility against clearing price premiums (e.g. a 10% price premium increases the proxy absorbed volume by +5%). **It is explicitly not presented as an econometrically estimated price elasticity coefficient.**

### 2.4 Normalized Demand Pressure Index (0–100)
$$\text{DemandIndex}_t = \text{clip}\left(50 + 25 \cdot \frac{P_t - \bar{P}_{30d}}{\bar{P}_{30d}} + 25 \cdot \frac{A_t - \bar{A}_{30d}}{\bar{A}_{30d}}, 0, 100\right)$$

---

## 3. Candidate Models & Out-of-Sample Chronological Backtest

### 3.1 Validation Methodology
- **Chronological Train/Test Partition**: First 61 days ($t_0 \dots t_{60}$) strictly used for training; remaining 30 days ($t_{61} \dots t_{90}$) withheld as out-of-sample test set.
- **Zero Future-Data Leakage**: All rolling price baselines, trend levels, and Fourier harmonics are computed strictly from historical observations up to $t$.
- **Evaluation Metrics**:
  - **MAE**: Mean Absolute Error (Tonnes)
  - **RMSE**: Root Mean Squared Error (Tonnes)
  - **WAPE**: Weighted Absolute Percentage Error ($\frac{\sum |y - \hat{y}|}{\sum y} \times 100$)
  - **MAPE**: Mean Absolute Percentage Error (%)
  - **Prediction Interval Coverage**: Empirical percentage of test observations falling within calculated 80% and 95% uncertainty bounds.

### 3.2 Out-of-Sample Benchmark Comparison (Across 6 Commodities & 3 Horizons)

| Model Architecture | 7d WAPE | 15d WAPE | 30d WAPE | Overall WAPE | Overall RMSE | 80% CI Coverage | 95% CI Coverage |
|---|---|---|---|---|---|---|---|
| **Seasonal Naive (7-Day)** | 8.97% | 8.24% | 7.41% | 8.21% | 23.28 T | — | — |
| **Moving Average (7-Day)** | 8.09% | 6.87% | 6.86% | 7.27% | 20.05 T | — | — |
| **Naive Baseline (Last Value)** | 7.63% | 6.40% | 6.45% | 6.82% | 19.32 T | — | — |
| **Damped Holt Linear Trend** | 7.59% | 6.35% | 6.39% | 6.77% | 19.23 T | — | — |
| **KisanSetu Hybrid Engine** ⭐ | **6.88%** | **5.74%** | **5.28%** | **5.97%** | **16.71 T** | **83.8%** | **91.9%** |

---

## 4. Selected Model Architecture

The **KisanSetu Hybrid Adaptive Time-Series Engine** (`v2.0.0-phase2`) combines:
1. **Damped Holt Exponential Smoothing**: Adaptive level and trend tracking with damping parameter $\phi = 0.92$ to prevent linear extrapolation divergence over 15d and 30d horizons.
2. **Fourier Weekly Harmonics Decomposition**: Captures 7-day and 14-day cyclical weekly mandi restocking patterns.
3. **Statistical Prediction Intervals**:
   - In-sample residual standard deviation ($\hat{\sigma}$) is computed on detrended residuals.
   - Forward uncertainty expands with horizon step $h$:
     $$\text{Margin}_{80} = 1.28 \cdot \hat{\sigma} \cdot \sqrt{h}$$
     $$\text{Margin}_{95} = 1.96 \cdot \hat{\sigma} \cdot \sqrt{h}$$
   - Yields **83.8% empirical coverage for 80% CI** and **91.9% empirical coverage for 95% CI**.

---

## 5. REST API Specifications

### 5.1 Endpoints
- `GET /api/forecast/demand`
- `GET /api/forecast/price`
- `GET /api/forecast/summary`
- `GET /api/market-data/forecast` (Alias)
- `GET /api/demand/forecast` (Alias)

### 5.2 Query Parameters
- `commodity` (default: `Tomato`): `Tomato`, `Potato`, `Onion`, `Wheat`, `Rice`, `Apple`
- `district` / `mandi` (default: `Delhi NCR`)
- `state` (default: `Delhi`)
- `horizon` / `days` (default: `30`): supported values `7`, `15`, `30`

### 5.3 Example Request
```http
GET /api/forecast/demand?commodity=Tomato&district=Delhi+NCR&days=7
```

### 5.4 Example Response
```json
{
  "success": true,
  "commodity": "Tomato",
  "district": "Delhi NCR",
  "mandi": "Delhi NCR",
  "state": "Delhi",
  "horizonDays": 7,
  "forecastHorizon": "7 days",
  "timePeriod": "Next 7 Days",
  "historicalDailyAvgTonnes": 374.1,
  "predictedDailyAvgTonnes": 360.7,
  "totalPredictedDemandTonnes": 2525.0,
  "currentSupplyDailyAvgTonnes": 371.4,
  "demandGapTonnes": -74.8,
  "demandStatus": "BALANCED",
  "trend": "stable",
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
    "dataPointsUsed": 91,
    "validationMetrics": {
      "inSampleMAE": 10.26,
      "inSampleRMSE": 13.34,
      "inSampleWAPE": 2.76,
      "outOfSampleWAPE": 4.29,
      "unit": "Tonnes"
    },
    "confidenceIntervals": {
      "supported": true,
      "levels": ["80%", "95%"],
      "method": "Empirical In-Sample Residual Variance with sqrt(h) Horizon Scaling"
    },
    "targetVariable": "Heuristic Market Absorption & Pressure Proxy (Price-Adjusted Arrival Volume in Tonnes)",
    "targetFormula": "M_t = Arrival_t * (1 + 0.5 * (Price_t - RollingPrice30d) / RollingPrice30d)",
    "isSynthetic": true,
    "dataProvenance": "SEEDED_DEMO_AGMARKNET",
    "disclaimer": "Forecast is an algorithmic projection of mandi market absorption and buying pressure proxy. It does not represent direct retail consumer checkout ground truth."
  },
  "generatedAt": "2026-09-03T18:00:00.000Z"
}
```

---

## 6. Performance & Scalability
- **10-Minute Caching Layer**: In-process memory caching (`demand_commodity_district_horizon`) guarantees $<5\text{ms}$ latency for high-traffic dashboards.
- **Dual Engine High Availability**: If the Python FastAPI microservice is starting up or unreachable, the backend executes the embedded JavaScript forecasting engine with identical mathematics, ensuring zero downtime.
- **Snapshot Persistence**: Forecast snapshots are saved to MongoDB `DemandForecast` collection for auditability and policy reporting.

---

## 7. Data Provenance & Future Roadmap
- The Phase 2 dataset is marked transparently as `SEEDED_DEMO_AGMARKNET`.
- The Phase 1 `MarketDataProvider` architecture allows live Agmarknet / e-NAM feeds to replace seeded data in the future without modifying the forecasting model code.
