import React, { useState, useEffect } from 'react';
import API from '../services/api';
import {
  CloudSun,
  Sun,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  CloudFog,
  Droplets,
  Wind,
  Thermometer,
  Umbrella,
  Sparkles,
  MapPin,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Search,
  Sprout,
  ChevronDown,
  ShieldCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

const COMMODITY_OPTIONS = ['Tomato', 'Potato', 'Onion', 'Wheat', 'Rice', 'Apple'];
const MANDI_OPTIONS = [
  { label: 'Karnal Mandi (Haryana)', value: 'Karnal Mandi' },
  { label: 'Azadpur APMC (Delhi)', value: 'Azadpur APMC Mandi' },
  { label: 'Ghazipur Mandi (Delhi)', value: 'Ghazipur Mandi' },
  { label: 'Agra Mandi (Uttar Pradesh)', value: 'Agra Mandi' },
  { label: 'Lasalgaon Mandi (Nashik)', value: 'Lasalgaon Mandi' },
  { label: 'Jalandhar Cantt Mandi (Punjab)', value: 'Jalandhar Cantt Mandi' },
  { label: 'Ambala City Mandi (Haryana)', value: 'Ambala City Mandi' },
  { label: 'Panipat Mandi (Haryana)', value: 'Panipat Mandi' },
];

const WeatherIcon = ({ iconName, className = 'w-6 h-6' }) => {
  switch (iconName) {
    case 'Sun':
      return <Sun className={`${className} text-amber-500`} />;
    case 'CloudSun':
      return <CloudSun className={`${className} text-amber-400`} />;
    case 'Cloud':
      return <Cloud className={`${className} text-slate-400`} />;
    case 'CloudDrizzle':
      return <CloudDrizzle className={`${className} text-blue-400`} />;
    case 'CloudRain':
      return <CloudRain className={`${className} text-blue-600`} />;
    case 'CloudLightning':
      return <CloudLightning className={`${className} text-purple-600`} />;
    case 'CloudFog':
      return <CloudFog className={`${className} text-slate-400`} />;
    default:
      return <Sun className={`${className} text-amber-500`} />;
  }
};

const WeatherForecastCard = ({ defaultCommodity = 'Tomato', defaultMarket = 'Karnal Mandi' }) => {
  const [commodity, setCommodity] = useState(defaultCommodity);
  const [market, setMarket] = useState(defaultMarket);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchWeather = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get('/market-data/weather', {
        params: { market: market || 'Karnal Mandi', commodity },
      });

      if (res.data?.success && res.data.weather) {
        setWeatherData(res.data.weather);
      } else {
        setError('Unable to load meteorological forecast.');
      }
    } catch (err) {
      console.error('[WeatherForecastCard Error]', err);
      setError(err.response?.data?.message || 'Error connecting to weather service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [market, commodity]);

  // Format weather forecast chart data safely
  const weatherChartData = React.useMemo(() => {
    if (!weatherData?.forecast || !Array.isArray(weatherData.forecast)) return [];
    return weatherData.forecast.map((f) => {
      let dateLabel = f.date;
      try {
        const d = new Date(f.date);
        if (!isNaN(d.getTime())) {
          dateLabel = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
        }
      } catch (e) {
        dateLabel = f.date;
      }

      return {
        date: dateLabel,
        tempMax: f.tempMax,
        tempMin: f.tempMin,
        precipitationSum: f.precipitationSum,
        rainProb: f.precipitationProbabilityMax || 0,
      };
    });
  }, [weatherData]);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-7">
      {/* 1. Header (Matching User Mock) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold shadow-2xs flex-shrink-0">
            <CloudSun className="w-6 h-6 text-teal-800" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Weather Forecast
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-normal">
              Check upcoming weather conditions that may affect your crop and selling plans.
            </p>
          </div>
        </div>

        <div className="self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Active Tool
          </span>
        </div>
      </div>

      {/* 2. Form Inputs */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Produce Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Sprout className="w-4 h-4 text-emerald-700" />
              Select Your Produce
            </label>
            <div className="relative">
              <select
                value={commodity}
                onChange={(e) => setCommodity(e.target.value)}
                className="w-full bg-slate-50/70 hover:bg-slate-100/70 border border-slate-200 rounded-2xl px-4 py-3 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-colors cursor-pointer appearance-none"
              >
                {COMMODITY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Mandi / Location Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rose-500" />
              Target Mandi / Route Location
            </label>
            <div className="relative">
              <select
                value={market}
                onChange={(e) => setMarket(e.target.value)}
                className="w-full bg-slate-50/70 hover:bg-slate-100/70 border border-slate-200 rounded-2xl px-4 py-3 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-colors cursor-pointer appearance-none"
              >
                {MANDI_OPTIONS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Action Button (Full-width Deep Green) */}
        <button
          type="button"
          onClick={fetchWeather}
          disabled={loading}
          className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white font-black text-sm rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Fetching Live Weather Feeds...</span>
            </>
          ) : (
            <>
              <CloudSun className="w-4 h-4" />
              <span>Check Weather & Route Transit</span>
            </>
          )}
        </button>
      </div>

      {/* 3. "How It Works?" Guide Banner */}
      <div className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-emerald-950 font-extrabold text-sm">
          <TrendingUp className="w-4 h-4 text-emerald-700" />
          <span>How It Works?</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {/* Step 1 */}
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-emerald-200 text-emerald-900 font-black text-xs flex items-center justify-center flex-shrink-0">
              1
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-black text-slate-900">Select produce & route</h4>
              <p className="text-[11px] text-slate-500 leading-snug">
                Choose crop and transport destination
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-emerald-200 text-emerald-900 font-black text-xs flex items-center justify-center flex-shrink-0">
              2
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-black text-slate-900">Check rain & temperature</h4>
              <p className="text-[11px] text-slate-500 leading-snug">
                Live Open-Meteo 7-day temperature and rain
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-emerald-200 text-emerald-900 font-black text-xs flex items-center justify-center flex-shrink-0">
              3
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-black text-slate-900">Protect crop in transit</h4>
              <p className="text-[11px] text-slate-500 leading-snug">
                Prevent spoilage and plan harvest timing
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 4. Results Section */}
      {!loading && weatherData && (
        <div className="space-y-6 pt-2 border-t border-slate-100">
          {/* Current Weather Highlights Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-100 flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-600 flex-shrink-0">
                <Thermometer className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Temperature</span>
                <span className="text-xl font-black text-slate-900">
                  {weatherData.current?.temperature} {weatherData.current?.temperatureUnit || '°C'}
                </span>
                <span className="text-[10px] text-amber-700 font-bold block">{weatherData.current?.weatherLabel || 'Clear Sky'}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50/50 border border-blue-100 flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-600 flex-shrink-0">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Humidity</span>
                <span className="text-xl font-black text-slate-900">
                  {weatherData.current?.relativeHumidity} {weatherData.current?.humidityUnit || '%'}
                </span>
                <span className="text-[10px] text-blue-700 font-medium block">
                  {weatherData.current?.relativeHumidity > 80 ? 'High Moisture' : 'Optimal Transit'}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50/50 border border-indigo-100 flex items-center gap-3">
              <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-600 flex-shrink-0">
                <Umbrella className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Current Rain</span>
                <span className="text-xl font-black text-slate-900">
                  {weatherData.current?.precipitation || 0} {weatherData.current?.precipitationUnit || 'mm'}
                </span>
                <span className="text-[10px] text-indigo-700 font-medium block">
                  7d Rain: {weatherData.advisories?.totalForecastRainMm || 0}mm
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50/50 border border-teal-100 flex items-center gap-3">
              <div className="p-2.5 bg-teal-500/10 rounded-xl text-teal-600 flex-shrink-0">
                <Wind className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Wind Speed</span>
                <span className="text-xl font-black text-slate-900">
                  {weatherData.current?.windSpeed || 0} {weatherData.current?.windSpeedUnit || 'km/h'}
                </span>
                <span className="text-[10px] text-teal-700 font-medium block">Surface Velocity</span>
              </div>
            </div>
          </div>

          {/* Actionable Agricultural Advisories Banner */}
          <div
            className={`p-5 rounded-3xl border space-y-3 ${
              weatherData.advisories?.riskLevel === 'HIGH'
                ? 'bg-rose-50/80 border-rose-200 text-rose-900'
                : weatherData.advisories?.riskLevel === 'MODERATE'
                ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Agronomic Decision & Transit Advisory</span>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  weatherData.advisories?.riskLevel === 'HIGH'
                    ? 'bg-rose-200 text-rose-900'
                    : weatherData.advisories?.riskLevel === 'MODERATE'
                    ? 'bg-amber-200 text-amber-900'
                    : 'bg-emerald-200 text-emerald-900'
                }`}
              >
                Climate Risk: {weatherData.advisories?.riskLevel || 'LOW'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs">
              <div className="p-3 bg-white/80 rounded-2xl border border-white/60 space-y-1">
                <span className="font-extrabold block text-[11px] text-slate-900">🚚 Mandi Transit & Route:</span>
                <p className="text-slate-700 text-[11px] leading-relaxed">
                  {weatherData.advisories?.mandiTransportImpact || 'Clear road conditions expected. Safe for transport.'}
                </p>
              </div>

              <div className="p-3 bg-white/80 rounded-2xl border border-white/60 space-y-1">
                <span className="font-extrabold block text-[11px] text-slate-900">🌾 Harvesting Operations:</span>
                <p className="text-slate-700 text-[11px] leading-relaxed">
                  {weatherData.advisories?.harvestAdvisory || 'Favorable dry weather for crop harvesting.'}
                </p>
              </div>

              <div className="p-3 bg-white/80 rounded-2xl border border-white/60 space-y-1">
                <span className="font-extrabold block text-[11px] text-slate-900">📦 Storage & Aeration:</span>
                <p className="text-slate-700 text-[11px] leading-relaxed">
                  {weatherData.advisories?.storageAdvisory || 'Standard ventilation recommended.'}
                </p>
              </div>
            </div>
          </div>

          {/* 7-Day Forecast Cards */}
          <div className="space-y-3">
            <span className="text-xs font-black text-slate-900 block">7-Day Meteorological Outlook</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {(weatherData.forecast || []).map((day, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center space-y-2 hover:bg-emerald-50/40 hover:border-emerald-200 transition-all"
                >
                  <span className="text-[11px] font-bold text-slate-700">
                    {idx === 0
                      ? 'Today'
                      : new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' })}
                  </span>
                  <WeatherIcon iconName={day.weatherIcon} className="w-7 h-7" />
                  <span className="text-[10px] text-slate-500 font-medium leading-tight line-clamp-1">
                    {day.weatherLabel}
                  </span>
                  <div className="pt-1 border-t border-slate-200 w-full flex justify-around text-[10px] font-black">
                    <span className="text-slate-900">{Math.round(day.tempMax)}°</span>
                    <span className="text-slate-400">{Math.round(day.tempMin)}°</span>
                  </div>
                  <div className="text-[9px] text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded-md w-full">
                    {day.precipitationSum > 0 ? `${day.precipitationSum}mm rain` : '0mm rain'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weather Forecast Trend Chart */}
          <div className="bg-slate-50/80 p-5 rounded-3xl border border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">7-Day Temperature & Rain Probability Trend</span>
              <span className="text-[10px] text-slate-400">Location: {weatherData.location?.district || market}</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={weatherChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
                  <YAxis yAxisId="temp" stroke="#f59e0b" fontSize={11} unit="°C" domain={['auto', 'auto']} />
                  <YAxis yAxisId="rain" orientation="right" stroke="#3b82f6" fontSize={11} unit="%" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '12px',
                      color: '#0f172a',
                      fontSize: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar yAxisId="rain" dataKey="rainProb" fill="#93c5fd" radius={[4, 4, 0, 0]} name="Rain Probability (%)" />
                  <Line yAxisId="temp" type="monotone" dataKey="tempMax" stroke="#f59e0b" strokeWidth={2.5} name="Max Temp (°C)" />
                  <Line yAxisId="temp" type="monotone" dataKey="tempMin" stroke="#64748b" strokeWidth={2} strokeDasharray="3 3" name="Min Temp (°C)" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherForecastCard;
