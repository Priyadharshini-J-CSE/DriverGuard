import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import MapComponent from '../components/MapComponent';
import StatCard from '../components/StatCard';
import { motion } from 'framer-motion';
import {
  CloudRain, Thermometer, Wind, TrafficCone,
  MapPin, RefreshCw, AlertTriangle, Zap, ScrollText,
  CheckCircle, AlertCircle, Info,
} from 'lucide-react';

/* ── Coimbatore fixed data ──────────────────────────────── */
const CBE_CENTER = [11.0168, 76.9558];

const CBE_DATA = {
  weather:     { rain: 62, temp: 38, humidity: 78 },
  aqi:         { aqi: 187 },
  traffic:     { trafficRatio: 0.34 },
  disruptions: [
    { type: 'heavy_rain',  value: 62,   severity: 'high',   location: { lat: 11.0168, lon: 76.9558 } },
    { type: 'traffic_jam', value: 0.34, severity: 'high',   location: { lat: 11.0300, lon: 76.9700 } },
  ],
};

const INIT_LOGS = [
  { time: '10:45 AM', msg: 'Weather API synced — Coimbatore: 62 mm/hr', type: 'alert'   },
  { time: '10:40 AM', msg: 'AQI data fetched — Coimbatore: 187 (Moderate)', type: 'info' },
  { time: '10:35 AM', msg: 'Traffic ratio: 0.34 — Severe congestion on NH-544', type: 'alert' },
  { time: '10:30 AM', msg: 'Risk monitor cycle completed', type: 'success' },
  { time: '10:25 AM', msg: 'Heavy rain threshold exceeded — claim trigger ready', type: 'alert' },
];

export default function LiveMonitoring() {
  const navigate = useNavigate();
  const [data,        setData]        = useState(CBE_DATA);
  const [loading,     setLoading]     = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());
  const [logs,        setLogs]        = useState(INIT_LOGS);

  const addLog = (msg, type = 'info') => {
    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    setLogs((prev) => [{ time, msg, type }, ...prev].slice(0, 20));
  };

  const fetchData = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setData(CBE_DATA);
      setLastUpdated(new Date().toLocaleTimeString());
      addLog('Live data refreshed — Coimbatore', 'success');
      addLog('Heavy Rain: 62 mm/hr — above threshold (>50)', 'alert');
      setLoading(false);
    }, 600);
  }, []);

  useEffect(() => {
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const weather    = data.weather;
  const aqi        = data.aqi;
  const traffic    = data.traffic;
  const disruptions = data.disruptions;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Live Environmental Monitoring</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Last updated: {lastUpdated} · Auto-refreshes every 5 min · Coimbatore, Tamil Nadu
          </p>
        </div>
        <button onClick={fetchData} className="btn-secondary text-sm flex items-center gap-2">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Rainfall"
          value={`${weather.rain} mm/hr`}
          icon={CloudRain}
          color="red"
          subtitle="Above threshold (>50)"
        />
        <StatCard
          title="Temperature"
          value={`${weather.temp}°C`}
          icon={Thermometer}
          color="orange"
          subtitle={`Humidity: ${weather.humidity}%`}
        />
        <StatCard
          title="AQI Level"
          value={aqi.aqi}
          icon={Wind}
          color="orange"
          subtitle="Moderate — Unhealthy for sensitive"
        />
        <StatCard
          title="Traffic Ratio"
          value={traffic.trafficRatio.toFixed(2)}
          icon={TrafficCone}
          color="red"
          subtitle="Severe jam (<0.4)"
        />
      </div>

      {/* Rain risk alert */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3"
      >
        <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
          <CloudRain size={16} className="text-red-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-red-700">⚠ Heavy Rain Risk — Claim Trigger Active</p>
          <p className="text-xs text-red-500 mt-0.5">Rainfall 62 mm/hr exceeds threshold (&gt;50 mm/hr) · Coimbatore zone affected</p>
        </div>
        <span className="text-xs font-bold bg-red-600 text-white px-2.5 py-1 rounded-full shrink-0">HIGH</span>
      </motion.div>

      {/* Simulate Disruption Claim */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate('/claim/detected')}
        className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold rounded-2xl px-6 py-4 flex items-center justify-between transition-all shadow-sm"
      >
        <div className="flex items-center gap-3">
          <Zap size={22} />
          <div className="text-left">
            <p className="text-base font-bold">Simulate Disruption Claim (Demo)</p>
            <p className="text-xs text-red-100 mt-0.5">Trigger automated insurance payout workflow</p>
          </div>
        </div>
        <span className="text-xs bg-white/20 px-3 py-1 rounded-full shrink-0">Demo Mode</span>
      </motion.button>

      {/* Map + Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4 flex items-center gap-2">
            <MapPin size={14} /> Live Disruption Map — Coimbatore
          </h3>
          <MapComponent center={CBE_CENTER} disruptions={disruptions} />
        </div>

        {/* System logs */}
        <div className="card overflow-hidden flex flex-col">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2">
            <ScrollText size={14} /> System Logs
          </h3>
          <div className="flex-1 overflow-y-auto space-y-2 max-h-72">
            {logs.map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2 text-xs"
              >
                <span className="text-gray-400 shrink-0 w-16">{log.time}</span>
                <span className={
                  log.type === 'success' ? 'text-green-600' :
                  log.type === 'alert'   ? 'text-red-500 font-medium' :
                  log.type === 'warning' ? 'text-yellow-600' :
                  'text-gray-600 dark:text-gray-400'
                }>
                  {log.type === 'success' ? <CheckCircle  size={11} className="inline mr-1" /> :
                   log.type === 'alert'   ? <AlertTriangle size={11} className="inline mr-1" /> :
                   log.type === 'warning' ? <AlertCircle  size={11} className="inline mr-1" /> :
                   <Info size={11} className="inline mr-1" />}
                  {log.msg}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
