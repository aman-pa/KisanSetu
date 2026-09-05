# KisanSetu AI — Phase 3: Price Intelligence & Farmer Selling Recommendations

## 1. Executive Summary & Objective

In agricultural supply chains, timing produce sales is one of the most critical determinants of farmer profitability. Smallholder farmers often sell immediately upon harvest due to lack of market visibility, falling victim to localized supply gluts and distress pricing.

The **Phase 3 Price Intelligence & Selling Recommendation Engine** (`v3.0.0-phase3`) synthesizes:
1. Ground-truth APMC mandi modal prices and price ranges.
2. Historical 7-day and 30-day price trends.
3. Physical mandi arrival momentum and supply pressure.
4. Historical price volatility (standard deviation and coefficient of variation).
5. Phase 2 forward market absorption and demand forecasts.
6. Cross-mandi price arbitrage and supply saturation rankings.

It outputs transparent, data-driven recommendations (**SELL NOW**, **WAIT**, **CONSIDER WAITING**, **CONSIDER SELLING**, **STABLE / NEUTRAL**) with complete natural-language explainability and zero financial guarantees.

---

## 2. Explicit 4-Tier Data & Signal Architecture

To ensure scientific integrity and eliminate black-box claims, the pipeline explicitly distinguishes between four data tiers:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. OBSERVED PHYSICAL DATA (Ground-Truth APMC Market Records)│
│    • Modal Price (₹/Q)       • Price Spread (Min/Max ₹/Q)   │
│    • Mandi Arrival (Tonnes)  • Market, District, State     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. DERIVED PRICE & SUPPLY SIGNALS (Empirical Calculations)  │
│    • 7d & 30d Rolling Averages (₹/Q)                        │
│    • Price Deviation from 30d Baseline (ΔP_30d %)           │
│    • Short-Term 7d Price Momentum (ΔP_7d %)                 │
│    • Price Volatility: Std Dev & Coeff of Variation (CV %)  │
│    • Supply Pressure: 7d vs 30d Arrival Velocity (ΔA %)     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. PHASE 2 FORECAST INPUTS (Forward Econometric Signals)    │
│    • Market Pressure Proxy Forward Trajectory (7d/15d/30d)  │
│    • Projected Demand Growth % vs Baseline                  │
│    • Market Balance Status (HIGH / BALANCED / SURPLUS)      │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. ACTIONABLE RECOMMENDATION & BEST MANDI RANKING           │
│    • Recommendation: SELL NOW / WAIT / CONSIDER WAITING     │
│    • Composite Price Intelligence Score (-100 to +100)      │
│    • Explainable Reason Codes & Dynamic Metric Citations    │
│    • Cross-Mandi Multi-Factor Arbitration Ranking           │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Mathematical Signal Formulations

### 3.1 Price Deviation from 30-Day Moving Average
$$\text{PriceDev}_{30d} = \frac{P_{\text{current}} - \bar{P}_{30d}}{\bar{P}_{30d}} \times 100$$
- Where $\bar{P}_{30d} = \frac{1}{30}\sum_{i=0}^{29} P_{t-i}$ (backward-looking strictly, zero future leakage).

### 3.2 Short-Term 7-Day Price Momentum
$$\text{PriceDev}_{7d} = \frac{P_{\text{current}} - \bar{P}_{7d}}{\bar{P}_{7d}} \times 100$$
- $\text{PriceDev}_{7d} \ge +1.5\% \implies \text{PRICE\_TREND\_UP}$ (Bullish momentum).
- $\text{PriceDev}_{7d} \le -1.5\% \implies \text{PRICE\_TREND\_DOWN}$ (Bearish softening).

### 3.3 Historical Price Volatility & Coefficient of Variation
$$\sigma_{\text{price}} = \sqrt{\frac{1}{30}\sum_{i=0}^{29} (P_{t-i} - \bar{P}_{30d})^2}$$
$$\text{CV}_{\text{price}} = \frac{\sigma_{\text{price}}}{\bar{P}_{30d}} \times 100$$
- $\text{CV} < 5.0\% \implies \text{LOW Volatility}$ (Stable pricing).
- $5.0\% \le \text{CV} \le 12.0\% \implies \text{MODERATE Volatility}$.
- $\text{CV} > 12.0\% \implies \text{HIGH Volatility}$ (Elevated risk of sharp swings).

### 3.4 Supply Arrival Pressure Velocity
$$\Delta A = \frac{\bar{A}_{7d} - \bar{A}_{30d}}{\bar{A}_{30d}} \times 100$$
- $\Delta A > +15.0\% \implies \text{SUPPLY\_GLUT}$ (Glut risk; supply overhang).
- $\Delta A < -15.0\% \implies \text{SUPPLY\_SHORTAGE}$ (Tight supply; falling arrivals push buyer competition).
- $-15.0\% \le \Delta A \le +15.0\% \implies \text{NORMAL\_SUPPLY}$ (Equilibrium).

---

## 4. Price Intelligence Scoring & Recommendation Engine

### 4.1 Heuristic Composite Score Formulation
The composite score $S \in [-100, +100]$ aggregates price deviations, momentum, supply scarcity, forecast demand, and downside risk:

$$S = \text{clip}\left(w_1 \cdot \text{PriceDev}_{30d} + w_2 \cdot \text{PriceDev}_{7d} + w_3 \cdot \Delta A + w_4 \cdot \Delta D_{\text{forecast}} - w_5 \cdot \max(0, \text{CV} - 8.0), -100, 100\right)$$

### 4.2 Explicit Heuristic Weights & Rationale

| Parameter | Value | Economic Rationale |
|---|---|---|
| $w_1$ (Price Deviation vs 30d Baseline) | **-1.2** | When prices trade below long-term baseline, mean-reversion upside favors holding (**WAIT**). When trading at peak premiums, locking in profits favors **SELL NOW**. |
| $w_2$ (7d Short-Term Price Momentum) | **+1.5** | Upward price momentum indicates strong immediate buying pressure; holding captures continued price appreciation. |
| $w_3$ (Supply Arrival Velocity) | **-0.8** | Falling arrivals create local scarcity (**WAIT**); surging arrivals risk auction gluts (**SELL NOW**). |
| $w_4$ (Phase 2 Forecast Demand Growth) | **+1.2** | Positive market absorption forecast indicates rising forward buyer capacity. |
| $w_5$ (Excess Volatility Penalty) | **-0.5** | High price volatility ($\text{CV} > 8\%$) penalizes speculative holding to mitigate downside risk. |

> **Transparency Note**: These weights are explicitly modeled heuristic sensitivity parameters, not learned neural weights. They are exposed directly in the API response metadata under `heuristicWeightsUsed` and `scoreBreakdown`.

### 4.3 Actionable Recommendation Categories

| Composite Score ($S$) | Recommendation | Actionable Strategy |
|---|---|---|
| $S \ge +20.0$ | **WAIT** | Strong upside momentum; tight supply and below-average price suggest holding for higher realization over 7–15 days. |
| $+8.0 \le S < +20.0$ | **CONSIDER WAITING** | Moderate upside signals; stagger releases while monitoring incoming arrivals. |
| $-8.0 < S < +8.0$ | **STABLE / NEUTRAL** | Market in equilibrium; normal scheduled marketing recommended. |
| $-20.0 < S \le -8.0$ | **CONSIDER SELLING** | Mild softening signals; liquidate lots before supply accumulation. |
| $S \le -20.0$ | **SELL NOW** | Produce is capturing peak prices or incoming glut risks sharp price drops. |

---

## 5. Best Mandi Comparison & Multi-Factor Ranking Engine

The best-mandi engine evaluates all available APMC markets for a commodity and ranks them using a multi-factor score rather than raw price alone:

$$M_{\text{score}} = 50.0 + S_{\text{price\_premium}} (40\%) + S_{\text{momentum}} (25\%) + S_{\text{supply\_glut\_risk}} (20\%) + S_{\text{stability}} (15\%)$$

1. **Price Realization Premium ($40\%$)**: Price difference relative to the cross-mandi regional average.
2. **Upward Momentum ($25\%$)**: Short-term price appreciation vs 30d baseline.
3. **Supply Saturation ($20\%$)**: Penalizes mandis with massive arrival spikes where prices are vulnerable to collapse.
4. **Volatility Stability ($15\%$)**: Rewards markets with low price coefficient of variation.

---

## 6. Historical Backtesting Simulation & Statistical Audit

### 6.1 Simulation Design & Zero-Leakage Guarantee
The recommendation engine was evaluated using rolling-window chronological backtesting across the 91-day historical dataset:
- **Simulation Windows**: For each day $t \in [30, 83]$ ($54$ daily windows per crop $\times$ $6$ crops = **324 total simulation windows**):
  1. **Information Available at Prediction Time**: Daily modal prices, arrivals, 7d/30d rolling baselines, and coefficient of variation strictly up to day $t$.
  2. **Information Hidden**: All future market prices and arrivals from day $t+1$ to $t+7$.
  3. **Recommendation Generation**: Computed score $S_t$ and assigned action (`WAIT`, `SELL NOW`, or `STABLE / NEUTRAL`).
  4. **Ground-Truth Evaluation**: Observed actual market modal price at day $t+7$ ($P_{t+7}$) to measure the 7-day price percentage delta:
     $$\Delta P_{t+7} = \frac{P_{t+7} - P_t}{P_t} \times 100$$

### 6.2 Rolling Window Overlap & Serial Correlation
- Consecutive daily rolling windows ($t, t+1, \dots$) evaluate overlapping 7-day future intervals (sharing 6 days of market data).
- Because overlapping windows are **serially correlated** rather than independent i.i.d. draws, standard binomial confidence intervals do not apply directly. Therefore, metrics are reported as **Empirical Signal Precision** across historical cohorts rather than an unconstrained global accuracy claim.

### 6.3 3x3 Recommendation Confusion Matrix

| Recommendation Category | Actual Price UP ($>+1.5\%$) | Actual Price STABLE ($\pm 1.5\%$) | Actual Price DOWN ($<-1.5\%$) | Total Cohort | Empirical Precision |
|---|---|---|---|---|---|
| **BULLISH (`WAIT` / `CONSIDER WAITING`)** | **18** (Success) | 0 | 6 (False Wait) | **24** | **75.0%** |
| **BEARISH (`SELL NOW` / `CONSIDER SELLING`)** | 12 (False Sell) | 0 | **54** (Success) | **66** | **81.8%** |
| **`STABLE / NEUTRAL`** | 162 (Market Drift) | 12 (Stable) | 60 (Market Drift) | **234** | *Neutral Regime* |
| **Total Evaluated Windows** | **192** | **12** | **120** | **324** | **80.0%** *(Active Signals)* |

### 6.4 Mathematical Metric Definitions

1. **Active Directional Signal Precision ($80.0\%$)**:
   $$\text{Active Precision} = \frac{N_{\text{wait\_correct}} + N_{\text{sell\_correct}}}{N_{\text{wait}} + N_{\text{sell}}} = \frac{18 + 54}{24 + 66} = \frac{72}{90} = \mathbf{80.0\%}$$
2. **Average Realization Delta on `WAIT`**:
   - **Across ALL WAIT Recommendations**: $+2.61\%$ average price appreciation over 7 days.
   - **Conditional on Profitable Holds**: $+4.51\%$ average price gain.
   - **Downside on Suboptimal Holds (False Waits)**: $-3.09\%$ average decline.
3. **Average Realization Delta on `SELL NOW`**:
   - **Across ALL SELL Recommendations**: $-6.26\%$ average price decline over 7 days.
   - **Conditional on Successful Sales (Protected Realization)**: $+8.51\%$ avoided price drop.
   - **Missed Upside on Suboptimal Sales (False Sells)**: $+3.86\%$.
4. **False Wait Rate**: $25.0\%$ ($6 / 24$).
5. **False Sell Rate**: $18.2\%$ ($12 / 66$).
6. **Neutral Regime**: $72.2\%$ ($234 / 324$) of historical windows exhibited balanced signals where no directional trade was forced.

### 6.5 Benchmark Comparison against Naive Strategies

| Strategy | Metric Definition | Benchmark Result |
|---|---|---|
| **Always HOLD (Passive)** | % of days where price rose 7 days forward (Market drift) | $61.1\%$ |
| **Always SELL (Passive)** | % of days where price dropped/flat 7 days forward | $38.9\%$ |
| **KisanSetu Active Directional Signals** | Precision on actionable non-neutral calls (`WAIT` & `SELL NOW`) | **80.0%** ($75.0\%$ on WAIT, $81.8\%$ on SELL) |

---

## 7. REST API Reference

### 7.1 Endpoints

| Method | Endpoint | Query Parameters | Description |
|---|---|---|---|
| `GET` | `/api/price-intelligence/recommendation` | `commodity`, `mandi`/`district`, `days`/`horizon` | Primary selling recommendation with score breakdown and explainable reasons. |
| `GET` | `/api/price-intelligence/best-mandi` | `commodity`, `state` | Cross-mandi comparison and multi-factor ranking. |
| `GET` | `/api/price-intelligence/signals` | `commodity`, `mandi`/`district` | Observable and derived price/arrival signals for auditing and charting. |
| `GET` | `/api/price-intelligence/summary` | `mandi`/`district`, `state` | Multi-commodity intelligence summary for farmer and admin dashboards. |

### 7.2 Example Recommendation Request & Response

```http
GET /api/price-intelligence/recommendation?commodity=Tomato&mandi=Karnal&days=7
```

```json
{
  "success": true,
  "commodity": "Tomato",
  "market": "Karnal",
  "district": "Karnal",
  "state": "Haryana",
  "evaluationHorizon": "7 days",
  "recommendation": "WAIT",
  "recommendationCategory": "HOLD_FOR_UPSIDE",
  "badgeColor": "blue",
  "signalStrength": "STRONG",
  "score": 28.4,
  "scoreBreakdown": {
    "priceDeviationComponent": 14.4,
    "priceMomentumComponent": 4.5,
    "supplyPressureComponent": 8.0,
    "forecastDemandComponent": 2.5,
    "volatilityPenaltyComponent": -1.0,
    "methodology": "Heuristic Multi-Signal Composite Index (Exposed Weights)"
  },
  "heuristicWeightsUsed": {
    "priceDeviation30dWeight": -1.2,
    "priceMomentum7dWeight": 1.5,
    "supplyPressureWeight": -0.8,
    "forecastDemandWeight": 1.2,
    "volatilityRiskPenaltyWeight": 0.5
  },
  "reasonCodes": [
    "PRICE_BELOW_30D_BASELINE",
    "SUPPLY_SCARCITY_FALLING_ARRIVALS",
    "BULLISH_FORECAST_DEMAND",
    "LOW_PRICE_VOLATILITY"
  ],
  "explanation": [
    "Current modal price (₹2,420/Q) is 12% below the 30-day baseline (₹2,750/Q), creating mean-reversion upside potential.",
    "Recent 7-day mandi arrivals (65.8 T/day) have dropped by 10% compared to 30-day average (73.1 T/day), indicating tightening supply.",
    "Phase 2 Demand Forecasting pipeline projects a +2.1% increase in market absorption pressure over the next 7 days.",
    "Historical price volatility is Low (CV = 4.8%), indicating stable pricing conditions."
  ],
  "summaryText": "Favorable conditions to WAIT. Current prices are below baseline while tightening arrivals and positive forecast momentum suggest potential price gains over next 7 days.",
  "currentPrice": 2420,
  "currentPricePerKg": 24.2,
  "priceRange": {
    "min": 2226,
    "max": 2614,
    "unit": "₹/Quintal"
  },
  "historicalAverage7d": 2390,
  "historicalAverage30d": 2750,
  "priceTrend": "PRICE_TREND_UP",
  "priceTrendLabel": "Bullish (Rising)",
  "volatility": {
    "level": "LOW",
    "stdDev": 132,
    "coeffVariationPercent": 4.8
  },
  "arrivalPressure": {
    "status": "SUPPLY_SHORTAGE",
    "label": "Tight Supply (Arrivals Falling)",
    "changePercent": -10.0,
    "currentArrivalTonnes": 65.8,
    "historicalAvg7dTonnes": 65.8,
    "historicalAvg30dTonnes": 73.1
  },
  "dataProvenance": "SEEDED_DEMO_AGMARKNET",
  "disclaimer": "Market recommendation is an algorithmic decision-support tool based on historical mandi signals and forecast indicators. Actual prices may fluctuate due to weather events, logistics, and government policies. Not a financial guarantee.",
  "generatedAt": "2026-09-05T12:35:00.000Z"
}
```

---

## 8. Data Source Transparency & Fallback Behavior

- **Live External Agmarknet Adapter**: Configured via `AgmarknetProvider.js`. If `AGMARKNET_API_KEY` is not present, the system operates seamlessly in demo/testing mode using `SeededDataProvider`.
- **Transparent Provenance**: Every response includes `dataProvenance: "SEEDED_DEMO_AGMARKNET"` or `"OBSERVED_APMC_FEED"`.
- **10-Minute Caching Layer**: In-process memory caching prevents duplicate DB aggregations while serving sub-5ms responses.

---

## 9. Limitations & Non-Guarantee Disclaimers

1. **Decision-Support Only**: Recommendations are statistical signals intended to inform farmers and FPOs, not guaranteed futures contracts.
2. **Unforeseen Exogenous Shocks**: Extreme weather events, highway blockades, or export bans cannot be anticipated purely through historical mandi time-series.
