# KisanSetu AI — Phase 4: Farmer Action Intelligence & Personalized Decision Support

## 1. Executive Summary & Problem Formulation

In agricultural marketing, individual farmers face a critical operational question at harvest:
> **"Given my crop, location/mandi, quantity, and current market signals, what is the most reasonable action right now?"**

Traditional market reports provide isolated price numbers without context or personalization. Smallholder farmers with varying lot sizes (e.g., 50 quintals of Wheat vs 20 tonnes of Tomato) require actionable decision support that computes:
1. **Action Directive**: `SELL_NOW`, `WAIT`, `CONSIDER_WAITING`, `COMPARE_MANDIS`, or `INSUFFICIENT_DATA`.
2. **Estimated Gross Market Realization**: Exact lot valuation based on spot modal prices ($P_{\text{modal}} \times Q_{\text{quintals}}$).
3. **Signal Strength & Market Risk**: Heuristic confidence score ($0\text{--}100$) and explicit risk categorization (`LOW`, `MODERATE`, `HIGH`) derived from empirical price volatility and arrival shocks.
4. **Regional Mandi Arbitrage Delta**: Transparent potential gross realization differences ($+\Delta ₹$) across regional APMCs.
5. **Data-Driven Explainability**: Human-readable bullet points referencing exact numerical signals from the underlying dataset.
6. **Action Horizon Timeline**: Spot (Today) $\to$ 7-day $\to$ 15–30 day outlook.

**Phase 4** operates strictly as a **decision-support layer** consuming:
- **Phase 1**: Historical agricultural market data layer (`MarketPrice`, `CommodityArrival`, Agmarknet/Seeded providers).
- **Phase 2**: Demand forecasting & market absorption proxy (`generateDemandForecast`).
- **Phase 3**: Price intelligence scoring, selling recommendation, and multi-mandi ranking (`getSellingRecommendation`, `getBestMandiComparison`).

---

## 2. Architectural Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FARMER CONTEXT INPUTS                           │
│  • Commodity (e.g. Wheat)        • Location/Mandi (e.g. Karnal)        │
│  • Quantity (e.g. 50)            • Unit (Quintals / Tonnes / Kg)       │
│  • Expected Selling Date (opt)                                         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               PHASE 4: FARMER CONTEXT VALIDATION LAYER                 │
│  • Normalizes input units (1 Tonne = 10 Q, 100 kg = 1 Q)               │
│  • Validates supported commodity catalog                               │
│  • Positive lot quantity verification (Q > 0)                          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                 ┌──────────────────┼──────────────────┐
                 ▼                  ▼                  ▼
┌─────────────────────────┐┌─────────────────┐┌─────────────────────────┐
│  PHASE 1: MARKET DATA   ││ PHASE 2: DEMAND ││  PHASE 3: PRICE INTEL   │
│  • Spot Modal Price     ││ • 7d/15d/30d    ││ • Price Momentum (7d)   │
│  • 30d Baseline Average ││   Demand Proxy  ││ • Volatility (CV %)     │
│  • Arrival Tonnes (7d)  ││ • Absorption %  ││ • Arrival Pressure      │
│  • Min / Max Spread     ││ • Balance State ││ • Multi-Mandi Ranking   │
└─────────────────────────┘└─────────────────┘└─────────────────────────┘
                 │                  │                  │
                 └──────────────────┼──────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│            ACTION RECOMMENDATION & GROSS VALUATION ENGINE              │
│  1. Gross Realization: P_modal × Q_quintals                            │
│  2. Arbitrage Check: Top Mandi vs Local Mandi (ΔP ≥ 8%, ΔP ≥ ₹50/q)    │
│  3. Primary Action Mapping (WAIT / SELL NOW / COMPARE MANDIS)          │
│  4. Heuristic Signal Strength (0–100)                                  │
│  5. Risk Evaluation: LOW / MODERATE / HIGH (CV % + Arrival Surges)     │
│  6. Reason Builder: Data-driven metric citations                       │
│  7. Action Timeline: Spot → 7-Day → 15–30 Day Horizon                  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         FARMER DELIVERY APIS                           │
│  • GET /api/farmer-action/recommendation                               │
│  • GET /api/farmer-action/mandi-options                                │
│  • GET /api/farmer-action/summary                                      │
│  • GET /api/farmer-action/signals                                      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Mathematical Formulations & Rules

### 3.1 Unit Normalization & Gross Market Realization

Prices in Indian agricultural APMC mandis are quoted in **₹ per Quintal** ($100\text{ kg}$). Inputs are normalized as:

$$\text{Quantity (Quintals)} = \begin{cases} Q & \text{if unit is quintals} \\ Q \times 10 & \text{if unit is tonnes} \\ \frac{Q}{100} & \text{if unit is kg} \end{cases}$$

$$\text{Estimated Gross Realization (₹)} = P_{\text{modal}} \times \text{Quantity (Quintals)}$$

> [!NOTE]
> **Explicit Transport & Storage Cost Notice:**
> The estimated gross market realization reflects spot mandi auction prices. Individual farm-to-mandi transport, labor, packaging, and cold-storage expenses are **not deducted** unless specific farmer logistics parameters are configured.

### 3.2 Regional Mandi Arbitrage Delta

For a given commodity, the top-ranked regional mandi ($M_{\text{top}}$) is compared against the farmer's local mandi ($M_{\text{local}}$):

$$\Delta P = P_{\text{modal}}(M_{\text{top}}) - P_{\text{modal}}(M_{\text{local}})$$

$$\Delta P_{\%} = \left( \frac{\Delta P}{P_{\text{modal}}(M_{\text{local}})} \right) \times 100$$

$$\text{Potential Gross Realization Delta (₹)} = \Delta P \times \text{Quantity (Quintals)}$$

**Arbitrage Trigger Rule:**
If $M_{\text{top}} \neq M_{\text{local}}$, $\Delta P_{\%} \ge 8.0\%$, and $\Delta P \ge ₹50/\text{q}$, the engine elevates the primary action to `COMPARE_MANDIS`.

### 3.3 Action Category Mapping

Using the Composite Price Intelligence Score $S \in [-100, +100]$ synthesized in Phase 3:

| Score Range | Action Category | Action Label | Recommendation Logic |
| :--- | :--- | :--- | :--- |
| $S \ge +20.0$ | `WAIT` | Hold Produce (Wait for Upside) | Spot price below 30d baseline + arrivals declining + bullish momentum |
| $+8.0 \le S < +20.0$ | `CONSIDER_WAITING` | Consider Staggered Holding | Mild positive momentum; hold if perishability & storage permit |
| $S \le -20.0$ | `SELL_NOW` | Sell Produce Now | Spot price high above 30d baseline + heavy arrival surge expected |
| $-20.0 < S \le -8.0$ | `CONSIDER_SELLING` | Consider Staggered Selling | Mild supply saturation; liquidate in tranches |
| $-8.0 < S < +8.0$ | `STABLE_EQUILIBRIUM` | Market in Equilibrium | Spot price within normal bands; standard routine marketing |
| Regional Arbitrage $\ge 8\%$ | `COMPARE_MANDIS` | Compare Regional Mandis | Substantial price premium available in nearby terminal market |
| Observations $< 3$ | `INSUFFICIENT_DATA` | Insufficient Historical Data | Observation depth inadequate for statistical recommendation |

### 3.4 Heuristic Signal Strength ($0\text{--}100$)

Signal strength indicates the magnitude and alignment of the underlying quantitative indicators:

$$\text{SignalStrength} = \min\left(100, \max\left(15, \text{round}\left(|S| \times 2.2 + 15\right)\right)\right)$$

- **High Confidence**: $\text{SignalStrength} \ge 75$
- **Moderate Confidence**: $45 \le \text{SignalStrength} < 75$
- **Low Confidence**: $\text{SignalStrength} < 45$

### 3.5 Heuristic Risk Evaluation Model

Market risk is evaluated through a transparent multi-factor heuristic scoring model (Baseline Score = 30, bounded in $[10, 95]$).

> [!NOTE]
> **Heuristic Calibration Note:**
> All risk thresholds below are explicit sensitivity parameters designed for agricultural market risk transparency. They are **not** claimed as learned neural parameters or empirically estimated econometric coefficients.

1. **Price Volatility Factor (Coefficient of Variation $CV_{\%}$)**:
   - **Low Volatility** ($CV_{\%} \le 7.0\%$): Score adjustment $-10$ (steady price stability).
   - **Moderate Volatility** ($7.0\% < CV_{\%} \le 12.0\%$): Score adjustment $+15$.
   - **High Volatility** ($CV_{\%} > 12.0\%$): Score adjustment $+35$ (sharp price swing vulnerability).

2. **Supply / Arrival Velocity Factor ($\Delta A_{\%}$ vs 30d Baseline)**:
   - **Arrival Surge / Glut Risk** ($\Delta A_{\%} > +15.0\%$): Score adjustment $+25$.
   - **Falling Supply** ($\Delta A_{\%} < -15.0\%$): Score adjustment $-10$.
   - **Balanced Supply** ($-15.0\% \le \Delta A_{\%} \le +15.0\%$): Score adjustment $0$.

3. **Signal Divergence Factor**:
   - Short-term price momentum diverging from forward demand forecast: Score adjustment $+15$.

**Final Categorization (Composite Risk Score)**:
- **LOW RISK** ($\text{RiskScore} \le 35$): Stable price trends and balanced arrival volumes.
- **MODERATE RISK** ($35 < \text{RiskScore} < 65$): Typical agricultural seasonal variability.
- **HIGH RISK** ($\text{RiskScore} \ge 65$): High market uncertainty from rapid volatility swings or supply glut influx.

---

## 4. API Endpoints Reference

### 1. `GET /api/farmer-action/recommendation`
Returns personalized farmer action recommendation, gross lot valuation, signal strength, risk tier, reasons, and timeline.

**Query Parameters:**
- `commodity` (string, required): e.g. "Wheat"
- `mandi` (string, required): e.g. "Karnal"
- `quantity` (number, required): e.g. 50
- `unit` (string, optional, default "quintals"): "quintals" | "tonnes" | "kg"
- `expectedSellingDate` (string, optional): ISO date string

**Sample Response:**
```json
{
  "success": true,
  "action": "STABLE_EQUILIBRIUM",
  "actionLabel": "Market in Equilibrium",
  "badgeColor": "emerald",
  "signalStrength": 24,
  "signalStrengthLabel": "LOW_CONFIDENCE",
  "riskLevel": "LOW",
  "commodity": "Wheat",
  "mandi": "Karnal",
  "quantity": 50,
  "unit": "quintals",
  "quantityInQuintals": 50,
  "currentPrice": 2499,
  "estimatedGrossValue": 124950,
  "estimatedGrossValueFormatted": "₹1,24,950",
  "reasons": [
    "Current modal price (₹2499/q) is aligned near the 30-day historical average (₹2443/q).",
    "Price volatility is Low (CV = 2.2%), indicating steady baseline market stability.",
    "Alternative mandi (Ghazipur Mandi) is trading at ₹2693/q (+₹194/q higher), representing a potential gross price difference of ₹9,700 for your 50 quintals lot."
  ],
  "bestMandi": {
    "market": "Ghazipur Mandi",
    "district": "Delhi NCR",
    "modalPricePerQuintal": 2693,
    "priceDifferencePerQuintal": 194,
    "priceDifferencePercent": 7.8,
    "potentialGrossDifference": 9700,
    "isAlternativeToCurrent": true,
    "note": "Price comparison reflects mandi auction spreads. Does not deduct individual transport or logistics costs."
  },
  "timeline": [
    { "period": "Today (Spot)", "expectedStatus": "Current Market Snapshot", "modalPricePerQuintal": 2499, "estimatedGrossValue": 124950, "signal": "Bullish (Rising)" },
    { "period": "In 7 Days", "expectedStatus": "Stable Market Realization", "projectedTrendPercent": 1.3, "signal": "Equilibrium" },
    { "period": "In 15–30 Days", "expectedStatus": "Medium-Term Agricultural Cycle Horizon", "signal": "Monitor Regional Crop Arrivals & Weather Alerts" }
  ],
  "disclaimer": "Farmer Action Intelligence is an algorithmic decision-support tool. It does not provide guaranteed financial returns or legally binding price assurances."
}
```

### 2. `GET /api/farmer-action/mandi-options`
Returns all regional mandi options and price rankings for a commodity.

### 3. `GET /api/farmer-action/summary`
Returns multi-commodity summary across all 6 core crops for dashboard overview.

### 4. `GET /api/farmer-action/signals`
Returns full underlying observable and derived econometric time-series signals for research and debugging.

---

## 5. Frontend Integration & User Interface

The Phase 4 frontend component (`FarmerActionCard.jsx`) is mounted prominently on both `FarmerDashboard.jsx` and `AdminDashboard.jsx`.

Features:
- **Interactive Controls**: Crop selector, Mandi selector, lot quantity, and unit converter.
- **Action Hero Banner**: Dynamic color gradient corresponding to the recommended action with signal strength progress bar.
- **Gross Realization Callout**: Prominent $P \times Q$ valuation formatted in Indian numbering ($₹\text{XX,XXX}$).
- **Explainable Decision Drivers**: Bullet points citing exact dataset metrics.
- **Alternative Mandi Callout**: Visual alert when a neighboring mandi offers higher realization.
- **3-Horizon Action Timeline**: Today $\to$ 7-day $\to$ 15–30 day outlook.
- **Multi-Commodity Matrix Tab**: Quick-action cards for all 6 crops.
- **Provenance & Disclaimer Footer**: Zero financial guarantee and dataset attribution.

---

## 6. Regulatory & Decision-Support Disclaimers

> [!CAUTION]
> **Non-Financial Guarantee Notice:**
> Farmer Action Intelligence is an algorithmic decision-support framework intended to enhance transparency in agricultural commodity marketing. It **does not** constitute guaranteed financial advice, futures trading signals, or legally binding price assurances. Actual realized market prices at the farm gate depend on physical produce grade, moisture content, buyer negotiation, mandi auction clearing dynamics, and logistics costs.
