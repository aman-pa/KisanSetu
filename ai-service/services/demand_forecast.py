"""
KisanSetu AI - Production Demand Forecasting Service
Phase 2: Hybrid Adaptive Time-Series Engine (Damped Holt Trend + Fourier Harmonics)
"""

from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge
from sklearn.preprocessing import StandardScaler


class HybridDampedFourierModel:
    """
    Hybrid Adaptive Agricultural Demand Forecasting Engine
    Combines Damped Holt-Winters Adaptive Trend Tracking with Fourier Weekly Seasonality
    and Empirical Residual Prediction Intervals (80% & 95% Confidence Bounds).
    """

    def __init__(self, alpha: float = 0.35, beta: float = 0.05, phi: float = 0.92, ridge_alpha: float = 1.0):
        self.alpha = alpha
        self.beta = beta
        self.phi = phi
        self.ridge_alpha = ridge_alpha
        self.scaler = StandardScaler()
        self.model = Ridge(alpha=ridge_alpha)
        self.train_len = 0
        self.level = 0.0
        self.trend = 0.0
        self.residual_std = 1.0
        self.in_sample_mae = 0.0
        self.in_sample_rmse = 0.0
        self.in_sample_wape = 0.0

    def _features(self, t_indices: np.ndarray) -> np.ndarray:
        t = np.array(t_indices, dtype=float)
        sin7 = np.sin(2 * np.pi * t / 7.0)
        cos7 = np.cos(2 * np.pi * t / 7.0)
        sin14 = np.sin(2 * np.pi * t / 14.0)
        cos14 = np.cos(2 * np.pi * t / 14.0)
        return np.column_stack([sin7, cos7, sin14, cos14])

    def fit(self, y: np.ndarray):
        n = len(y)
        self.train_len = n
        if n < 7:
            raise ValueError("Insufficient historical observations to fit time-series forecasting model (minimum 7 required).")

        # 1. Damped Holt Linear Trend Fitting
        level = y[0]
        trend = (y[min(7, n - 1)] - y[0]) / 7.0
        levels = [level]

        for t in range(1, n):
            prev_level = level
            level = self.alpha * y[t] + (1 - self.alpha) * (level + self.phi * trend)
            trend = self.beta * (level - prev_level) + (1 - self.beta) * self.phi * trend
            levels.append(level)

        self.level = level
        self.trend = trend

        # 2. Fourier Harmonics Seasonal Decomposition on Detrended Residuals
        t_train = np.arange(n)
        X_train = self._features(t_train)
        X_scaled = self.scaler.fit_transform(X_train)

        in_sample_base = np.array(levels)
        detrended_y = y - in_sample_base
        self.model.fit(X_scaled, detrended_y)

        # 3. Residual Variance & Error Calibration
        fitted = in_sample_base + self.model.predict(X_scaled)
        residuals = y - fitted
        self.residual_std = max(1.0, float(np.std(residuals)))
        
        self.in_sample_mae = float(np.mean(np.abs(residuals)))
        self.in_sample_rmse = float(np.sqrt(np.mean(residuals ** 2)))
        self.in_sample_wape = float((np.sum(np.abs(residuals)) / (np.sum(y) + 1e-6)) * 100)

    def predict(self, horizon: int) -> Dict[str, np.ndarray]:
        base_preds = []
        for i in range(1, horizon + 1):
            pred = self.level + sum(self.phi ** j for j in range(1, i + 1)) * self.trend
            base_preds.append(max(1.0, pred))

        t_future = np.arange(self.train_len, self.train_len + horizon)
        X_future = self._features(t_future)
        X_scaled = self.scaler.transform(X_future)
        seasonal_adj = self.model.predict(X_scaled)

        point_preds = np.clip(np.array(base_preds) + seasonal_adj, a_min=1.0, a_max=None)

        # Prediction Intervals (Uncertainty scales with sqrt(step))
        lower_80, upper_80 = [], []
        lower_95, upper_95 = [], []

        for step, val in enumerate(point_preds, start=1):
            h_scale = np.sqrt(step)
            margin_80 = 1.28 * self.residual_std * h_scale
            margin_95 = 1.96 * self.residual_std * h_scale

            lower_80.append(max(0.0, float(val - margin_80)))
            upper_80.append(float(val + margin_80))
            lower_95.append(max(0.0, float(val - margin_95)))
            upper_95.append(float(val + margin_95))

        return {
            "point": point_preds,
            "lower80": np.array(lower_80),
            "upper80": np.array(upper_80),
            "lower95": np.array(lower_95),
            "upper95": np.array(upper_95),
        }


def _derive_demand_proxy(df: pd.DataFrame) -> pd.DataFrame:
    """
    Computes Heuristic Market Absorption & Pressure Proxy from physical arrivals and clearing prices.
    Formula: M_t = Arrival_t * (1 + lambda_heuristic * (P_t - P_30d) / P_30d)
    where lambda_heuristic = 0.5 is an explicit heuristic price-adjustment weight (NOT empirical elasticity).
    """
    df = df.sort_values("date").reset_index(drop=True)
    df["rolling_price_30"] = df["modalPrice"].rolling(30, min_periods=1).mean()
    df["price_ratio"] = (df["modalPrice"] - df["rolling_price_30"]) / df["rolling_price_30"]
    
    # lambda_heuristic = 0.5 (Heuristic sensitivity parameter buffering physical supply against clearing price premiums)
    df["demand_proxy"] = (df["arrivalQuantity"] * (1.0 + 0.5 * df["price_ratio"])).clip(lower=1.0)
    
    # 0-100 Demand Pressure Index
    rolling_arr_30 = df["arrivalQuantity"].rolling(30, min_periods=1).mean()
    arr_ratio = (df["arrivalQuantity"] - rolling_arr_30) / rolling_arr_30
    df["demand_index"] = (50.0 + 25.0 * df["price_ratio"] + 25.0 * arr_ratio).clip(0.0, 100.0)
    return df


def _get_seeded_historical_series(crop_name: str, district: str, days: int = 91) -> pd.DataFrame:
    """
    Generates historical daily series consistent with Phase 1 DB seeded data.
    """
    np.random.seed(abs(hash(crop_name + district)) % (2**31))
    start_date = datetime(2026, 6, 5)
    dates = [start_date + timedelta(days=i) for i in range(days)]

    base_prices = {"Tomato": 2600, "Potato": 1600, "Onion": 2800, "Wheat": 2400, "Rice": 3400, "Apple": 9000}
    base_arrivals = {"Tomato": 130, "Potato": 210, "Onion": 360, "Wheat": 430, "Rice": 270, "Apple": 75}

    crop_clean = crop_name.capitalize()
    base_p = base_prices.get(crop_clean, 2500)
    base_a = base_arrivals.get(crop_clean, 150)

    records = []
    for i, d in enumerate(dates):
        dow = d.weekday()
        dow_factor = 1.0 + 0.06 * np.sin(2 * np.pi * dow / 7.0)
        trend_factor = 1.0 + 0.12 * np.sin(2 * np.pi * i / 45.0) + (0.001 * i)

        p_noise = np.random.normal(0, 0.03)
        a_noise = np.random.normal(0, 0.05)

        price = base_p * trend_factor * (1.0 + p_noise)
        arrival = base_a * dow_factor * (1.0 / (trend_factor ** 0.5)) * (1.0 + a_noise)

        records.append({
            "date": d,
            "modalPrice": float(round(price, 2)),
            "arrivalQuantity": float(round(arrival, 2)),
            "unit": "Tonnes"
        })

    df = pd.DataFrame(records)
    return _derive_demand_proxy(df)


def predict_demand(
    crop_name: str = "Tomato",
    district: str = "Delhi NCR",
    state: str = "Delhi",
    horizon: int = 30,
    historical_data: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    """
    Generates data-driven demand forecast for agricultural commodities.
    Supported horizons: 7, 15, 30 days.
    """
    horizon = int(horizon)
    if horizon not in [7, 15, 30]:
        horizon = 30

    crop_clean = crop_name.strip().capitalize()
    supported_crops = ["Tomato", "Potato", "Onion", "Wheat", "Rice", "Apple"]
    if crop_clean not in supported_crops:
        crop_clean = "Tomato"

    # 1. Prepare Historical Dataset
    if historical_data and len(historical_data) >= 7:
        df = pd.DataFrame(historical_data)
        if "date" in df.columns:
            df["date"] = pd.to_datetime(df["date"])
        df = _derive_demand_proxy(df)
        is_synthetic = False
    else:
        df = _get_seeded_historical_series(crop_clean, district, days=91)
        is_synthetic = True

    # 2. Train Time-Series Forecasting Model
    y_history = df["demand_proxy"].values
    model = HybridDampedFourierModel(alpha=0.35, beta=0.05, phi=0.92, ridge_alpha=1.0)
    model.fit(y_history)

    # 3. Generate Predictions & Uncertainty Bounds
    pred_results = model.predict(horizon)
    point_preds = pred_results["point"]
    lower80 = pred_results["lower80"]
    upper80 = pred_results["upper80"]
    lower95 = pred_results["lower95"]
    upper95 = pred_results["upper95"]

    # 4. Construct Daily Forecast Trajectory
    last_date = df["date"].max()
    forecast_series = []
    for step in range(horizon):
        f_date = last_date + timedelta(days=step + 1)
        forecast_series.append({
            "step": step + 1,
            "date": f_date.strftime("%Y-%m-%d"),
            "predictedDemandTonnes": float(round(point_preds[step], 2)),
            "lower80Tonnes": float(round(lower80[step], 2)),
            "upper80Tonnes": float(round(upper80[step], 2)),
            "lower95Tonnes": float(round(lower95[step], 2)),
            "upper95Tonnes": float(round(upper95[step], 2)),
        })

    # 5. Construct Historical Recent Window (Last 14 days)
    recent_history = df.iloc[-14:].copy()
    historical_series = []
    for _, row in recent_history.iterrows():
        historical_series.append({
            "date": row["date"].strftime("%Y-%m-%d"),
            "arrivalQuantityTonnes": float(round(row["arrivalQuantity"], 2)),
            "modalPricePerQuintal": float(round(row["modalPrice"], 2)),
            "demandProxyTonnes": float(round(row["demand_proxy"], 2)),
            "demandIndex": float(round(row.get("demand_index", 50.0), 1))
        })

    # 6. Aggregate KPIs
    hist_daily_avg = float(np.mean(df["demand_proxy"].values[-14:]))
    pred_daily_avg = float(np.mean(point_preds))
    total_pred_demand = float(np.sum(point_preds))
    current_supply_daily = float(np.mean(df["arrivalQuantity"].values[-7:]))
    total_supply_expected = float(current_supply_daily * horizon)
    
    demand_gap = float(round(total_pred_demand - total_supply_expected, 2))
    pct_change = float(round(((pred_daily_avg - hist_daily_avg) / (hist_daily_avg + 1e-6)) * 100, 2))

    if demand_gap > (0.1 * total_supply_expected):
        status = "HIGH"
        recommendation = (
            f"High demand pressure (+{pct_change}%) projected in {district} for {crop_clean} over next {horizon} days. "
            f"FPOs and farmers should aggregate farm-gate lots to capitalize on peak pricing."
        )
    elif demand_gap < (-0.1 * total_supply_expected):
        status = "SURPLUS"
        recommendation = (
            f"Surplus supply inventory (-{abs(pct_change)}%) projected in {district} for {crop_clean} over next {horizon} days. "
            f"Producers advised to route surplus produce to deficit neighboring consuming mandis."
        )
    else:
        status = "BALANCED"
        recommendation = (
            f"Balanced market equilibrium projected in {district} for {crop_clean} over next {horizon} days. "
            f"Standard procurement and scheduled dispatch recommended."
        )

    return {
        "success": True,
        "commodity": crop_clean,
        "district": district,
        "state": state,
        "horizonDays": horizon,
        "timePeriod": f"Next {horizon} Days",
        "historicalDailyAvgTonnes": round(hist_daily_avg, 2),
        "predictedDailyAvgTonnes": round(pred_daily_avg, 2),
        "totalPredictedDemandTonnes": round(total_pred_demand, 2),
        "currentSupplyDailyAvgTonnes": round(current_supply_daily, 2),
        "demandGapTonnes": demand_gap,
        "demandStatus": status,
        "demandTrendPercentage": pct_change,
        "recommendation": recommendation,
        "historicalSeries": historical_series,
        "forecastSeries": forecast_series,
        "modelMetadata": {
            "modelName": "KisanSetu Hybrid Adaptive Time-Series Engine (Damped Holt Trend + Fourier Harmonics)",
            "modelVersion": "2.0.0-phase2",
            "trainingObservations": len(df),
            "trainingDateRange": {
                "start": df["date"].min().strftime("%Y-%m-%d"),
                "end": df["date"].max().strftime("%Y-%m-%d")
            },
            "validationMetrics": {
                "inSampleMAE": round(model.in_sample_mae, 2),
                "inSampleRMSE": round(model.in_sample_rmse, 2),
                "inSampleWAPE": round(model.in_sample_wape, 2),
                "unit": "Tonnes"
            },
            "confidenceIntervals": {
                "supported": True,
                "levels": ["80%", "95%"],
                "method": "Empirical In-Sample Residual Variance with sqrt(h) Horizon Scaling"
            },
            "targetVariable": "Heuristic Market Absorption & Pressure Proxy (Price-Adjusted Arrival Volume in Tonnes)",
            "isSynthetic": is_synthetic,
            "dataProvenance": "SEEDED_DEMO_AGMARKNET" if is_synthetic else "OBSERVED_APMC_FEED",
            "disclaimer": "Forecast is an algorithmic projection of mandi market absorption and buying pressure proxy. It does not represent direct retail consumer checkout ground truth."
        },
        "generatedAt": datetime.utcnow().isoformat() + "Z"
    }
