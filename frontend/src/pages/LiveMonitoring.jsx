import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useDisruption, DEMO_MODE } from '../context/DisruptionContext';
import MapComponent from '../components/MapComponent';
import StatCard from '../components/StatCard';
import {
  CloudRain, Thermometer, Wind, TrafficCone,
  MapPin, RefreshCw, AlertTriangle, Zap, ScrollText,
  CheckCircle, AlertCircle, Info,
} from 'lucide-react';

const DISRUPTION_LABELS = {
  heavy_rain:   'Heavy Rain Detected',
  extreme_heat: 'Extreme Heat Detected',
  aqi_hazard:   'AQI Hazard Detected',
  traffic_jam:  'Traffic Jam Detected',
};

const SEVERITY_COLORS = {
  low:      'text-green-500',
  medium:   'text-yellow-500',
  high:     'text-orange-500',
  critical: 'text-red-500',
};

export default function LiveMonitoring() {
  const navigate = useNavigate();
  const { user }  = useAuth();
  const { liveData, disruptions, loading, lastUpdated, refresh, city, coords } = useDisruption();
  const [logs, setLogs] = useState([]);

  const latLon = [coords.lat, coords.lon];

  const addLog = (msg, type = 'info') => {
    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    setLogs((prev) => [{ time, msg, type }, ...prev].slice(0, 20));
  };

  // Build logs whenever liveData changes
  useEffect(() => {
    if (!liveData) return;
    const w = liveData.weather;
    const a = liveData.aqi;
    const t = liveData.traffic;

    addLog('Live data refreshed successfully', 'success');
    if (DEMO_MODE) addLog('Demo Mode active — disruption data overridden', 'warning');
    if (w?.rain  != null) addLog(`🌧 Rain — ${w.rain > 0 ? `${w.rain} mm` : 'No rainfall'}`, 'info');
    if (w?.temp  != null) addLog(`🌡 Temperature — ${w.temp}°C, Humidity: ${w.humidity}%`, 'info');
    if (a?.aqi   != null) addLog(`🌫 AQI — ${city}: ${a.aqi}`, 'info');
    if (t?.trafficRatio != null)
      addLog(`🚦 Traffic — ratio: ${t.trafficRatio?.toFixed(2)} (${t.trafficRatio < 0.5 ? 'Congested' : 'Normal'})`, 'info');

    if (disruptions.length > 0) {
      disruptions.forEach((d) =>
        addLog(`⚠️ Alert: ${d.type.replace(/_/g, ' ')} — value: ${d.value}`, 'alert')
      );
    } else {
      addLog('No disruptions in monitored zones', 'success');
    }
  }, [liveData]); // eslint-disable-line react-hooks/exhaustive-deps

  const weather = liveData?.weather;
  const aqi     = liveData?.aqi;
  const traffic = liveData?.traffic;

  // Risk flags — same thresholds as DisruptionContext
  const riskRain    = (weather?.rain  ?? 0)  > 10;
  const riskHeat    = (weather?.temp  ?? 0)  > 40;
  const riskAqi     = (aqi?.aqi       ?? 0)  > 150;
  const riskTraffic = (traffic?.trafficRatio ?? 1) < 0.5;
  const anyRisk     = riskRain || riskHeat || riskAqi || riskTraffic;

  const activeLabels = [
    riskRain    && 'Heavy Rain',
    riskHeat    && 'Extreme Heat',
    riskAqi     && 'High AQI',
    riskTraffic && 'Traffic Congestion',
  ].filter(Boolean);

  return (
    <div className="space-y-6">

      {/* City badge */}
      <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200
                      dark:border-blue-800 rounded-xl px-4 py-2.5 text-sm text-blue-700 dark:text-blue-300">
        <MapPin size={15} className="shrink-0" />
        <span>📍 Location verified: <strong>{city}</strong> — showing live data for your registered city</span>
        {DEMO_MODE && (
          <span className="ml-auto text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium shrink-0">
            Demo Mode
          </span>
        )}
      </div>

      {/* Active disruption banner */}
      <AnimatePresence>
        {anyRisk && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-300
                       dark:border-red-700 rounded-xl px-4 py-3">
            <AlertTriangle size={18} className="text-red-500 shrink-0 animate-pulse" />
            <div>
              <p className="text-sm font-bold text-red-700 dark:text-red-400">
                ⚠ Active Disruption{activeLabels.length > 1 ? 's' : ''} Detected:
                {' '}{activeLabels.join(', ')}
              </p>
              <p className="text-xs text-red-500 mt-0.5">
                ✅ You are eligible for compensation
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Live Environmental Monitoring</h2>
          {lastUpdated && <p className="text-xs text-gray-400 mt-0.5">Last updated: {lastUpdated} · Auto-refreshes every 5 min</p>}
        </div>
        <button onClick={refresh} className="btn-secondary text-sm flex items-center gap-2">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Metric cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card animate-pulse h-24 bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Rainfall"
            value={weather ? (weather.rain > 0 ? `${weather.rain} mm` : 'No active rainfall') : 'N/A'}
            icon={CloudRain}
            color={riskRain ? 'red' : 'blue'}
            subtitle={riskRain ? 'Heavy Rain Detected' : weather?.condition || 'Normal'}
            risk={riskRain}
          />
          <StatCard
            title="Temperature"
            value={weather ? `${weather.temp}°C` : 'N/A'}
            icon={Thermometer}
            color={riskHeat ? 'red' : 'orange'}
            subtitle={riskHeat ? 'Extreme Heat Alert' : weather?.humidity ? `Humidity: ${weather.humidity}%` : '—'}
            risk={riskHeat}
          />
          <StatCard
            title="AQI Level"
            value={aqi ? aqi.aqi : 'N/A'}
            icon={Wind}
            color={riskAqi ? 'red' : aqi?.aqi > 100 ? 'orange' : 'green'}
            subtitle={riskAqi ? 'Poor Air Quality' : aqi?.aqi > 100 ? 'Moderate' : 'Good'}
            risk={riskAqi}
          />
          <StatCard
            title="Traffic Ratio"
            value={traffic ? traffic.trafficRatio?.toFixed(2) : 'N/A'}
            icon={TrafficCone}
            color={riskTraffic ? 'red' : 'green'}
            subtitle={riskTraffic ? 'High Traffic Congestion' : 'Normal flow'}
            risk={riskTraffic}
          />
        </div>
      )}

      {/* Disruption alerts */}
      <AnimatePresence>
        {disruptions.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-red-600 flex items-center gap-1.5">
              <AlertTriangle size={15} /> Active Disruption Alerts
            </p>
            {disruptions.map((d, i) => (
              <motion.div key={d.type}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }} transition={{ delay: i * 0.1 }}
                className="card border-l-4 border-red-500 flex items-center justify-between bg-red-50 dark:bg-red-900/10">
                <div>
                  <p className="font-semibold text-red-700 dark:text-red-400">
                    {DISRUPTION_LABELS[d.type] || d.type.replace(/_/g, ' ')}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Value: {d.value}
                  </p>
                </div>
                <span className="text-xs bg-red-100 text-red-700 font-bold px-3 py-1 rounded-full">
                  HIGH RISK
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Claim trigger button */}
      <motion.button
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
        onClick={() => navigate('/claim/detected')}
        className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600
                   text-white font-semibold rounded-2xl px-6 py-4 flex items-center justify-between transition-all shadow-sm"
      >
        <div className="flex items-center gap-3">
          <Zap size={22} />
          <div className="text-left">
            <p className="text-base font-bold">
              {anyRisk ? 'File Disruption Claim' : 'Simulate Disruption Claim (Demo)'}
            </p>
            <p className="text-xs text-red-100 mt-0.5">
              {anyRisk ? '✅ Disruption confirmed — instant payout eligible' : 'Trigger automated insurance payout workflow'}
            </p>
          </div>
        </div>
        <span className="text-xs bg-white/20 px-3 py-1 rounded-full shrink-0">
          {anyRisk ? 'Eligible' : 'Demo Mode'}
        </span>
      </motion.button>

      {/* Map + Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4 flex items-center gap-2">
            <MapPin size={14} /> Live Disruption Map
          </h3>
          <MapComponent center={latLon} disruptions={disruptions} />
        </div>

        <div className="card overflow-hidden flex flex-col">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2">
            <ScrollText size={14} /> System Logs
          </h3>
          <div className="flex-1 overflow-y-auto space-y-2 max-h-72">
            {logs.length === 0 && (
              <p className="text-xs text-gray-400">Waiting for data...</p>
            )}
            {logs.map((log, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                className="flex gap-2 text-xs">
                <span className="text-gray-400 shrink-0 w-16">{log.time}</span>
                <span className={
                  log.type === 'success' ? 'text-green-600' :
                  log.type === 'alert'   ? 'text-red-500 font-medium' :
                  log.type === 'warning' ? 'text-yellow-600' :
                  'text-gray-600 dark:text-gray-400'
                }>
                  {log.type === 'success' ? <CheckCircle size={11} className="inline mr-1" /> :
                   log.type === 'alert'   ? <AlertTriangle size={11} className="inline mr-1" /> :
                   log.type === 'warning' ? <AlertCircle size={11} className="inline mr-1" /> :
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
