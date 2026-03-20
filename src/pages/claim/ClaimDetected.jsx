import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ClaimStepper from './ClaimStepper';
import MapComponent from '../../components/MapComponent';
import {
  CloudRain, Thermometer, Wind, TrafficCone,
  ShieldCheck, AlertTriangle, MapPin, TrendingUp,
} from 'lucide-react';

/* ── Mock Data ──────────────────────────────────────────── */

const DISRUPTION_OPTIONS = [
  {
    value: 'heavy_rain',
    label: 'Heavy Rain',
    Icon: CloudRain,
    value_reading: '62 mm/hr',
    threshold: '> 50 mm/hr',
    risk: 'High',
    riskColor: 'text-red-600',
    riskBg: 'bg-red-50 border-red-200',
    description: 'Severe rainfall detected across Coimbatore and surrounding districts.',
  },
  {
    value: 'extreme_heat',
    label: 'Extreme Heat',
    Icon: Thermometer,
    value_reading: '43°C',
    threshold: '> 42°C',
    risk: 'High',
    riskColor: 'text-red-600',
    riskBg: 'bg-red-50 border-red-200',
    description: 'Heat wave conditions affecting delivery operations in Coimbatore.',
  },
  {
    value: 'aqi_hazard',
    label: 'AQI Hazard',
    Icon: Wind,
    value_reading: '342 AQI',
    threshold: '> 300 AQI',
    risk: 'High',
    riskColor: 'text-red-600',
    riskBg: 'bg-red-50 border-red-200',
    description: 'Hazardous air quality index recorded in Coimbatore industrial zones.',
  },
  {
    value: 'traffic_jam',
    label: 'Traffic Jam',
    Icon: TrafficCone,
    value_reading: '0.34 ratio',
    threshold: '< 0.4 speed ratio',
    risk: 'High',
    riskColor: 'text-red-600',
    riskBg: 'bg-red-50 border-red-200',
    description: 'Severe congestion on NH-544 and Avinashi Road corridor in Coimbatore.',
  },
];

// Tamil Nadu disruption zones on the map
const TN_DISRUPTION_ZONES = [
  { type: 'heavy_rain',   location: { lat: 13.0827, lon: 80.2707 } }, // Chennai
  { type: 'heavy_rain',   location: { lat: 12.9165, lon: 79.1325 } }, // Vellore
  { type: 'aqi_hazard',   location: { lat: 11.0168, lon: 76.9558 } }, // Coimbatore
  { type: 'extreme_heat', location: { lat: 9.9252,  lon: 78.1198 } }, // Madurai
  { type: 'traffic_jam',  location: { lat: 13.0827, lon: 80.2707 } }, // Chennai ECR
];

const MOCK_CLAIM = {
  _id: 'CLM20250601TN001',
  disruptionType: 'heavy_rain',
  disruptionValue: 62,
  location: { city: 'Coimbatore', lat: 11.0168, lon: 76.9558 },
  incomeLoss: 1200,
  claimAmount: 1000,
  status: 'pending',
  createdAt: new Date().toISOString(),
};

/* ── Risk Badge ─────────────────────────────────────────── */
function RiskBadge({ risk }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${
      risk === 'High'
        ? 'bg-red-50 border-red-200 text-red-600'
        : 'bg-orange-50 border-orange-200 text-orange-600'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${risk === 'High' ? 'bg-red-500' : 'bg-orange-500'}`} />
      {risk} Risk
    </span>
  );
}

/* ── Page ───────────────────────────────────────────────── */
export default function ClaimDetected() {
  const navigate = useNavigate();
  const [submitting,  setSubmitting]  = useState(false);

  const selectedCity = { name: 'Coimbatore', lat: 11.0168, lon: 76.9558 };
  const disruption = DISRUPTION_OPTIONS.find((d) => d.value === 'heavy_rain');

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      navigate('/claim/status', { state: { claim: MOCK_CLAIM } });
    }, 1200);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <ClaimStepper />

      {/* Coverage active banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-4 py-3"
      >
        <ShieldCheck size={18} className="text-green-600 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-green-700">Coverage Active — Standard Plan</p>
          <p className="text-xs text-green-600 mt-0.5">Weekly premium paid · Valid until Jun 7, 2025</p>
        </div>
        <span className="text-xs font-bold bg-green-600 text-white px-2.5 py-1 rounded-full">Active</span>
      </motion.div>

      {/* Disruption selector */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 space-y-4"
      >
        <div className="flex items-center gap-2">
          <AlertTriangle size={17} className="text-red-500" />
          <p className="text-sm font-bold text-gray-800">Detected Disruption Type</p>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {DISRUPTION_OPTIONS.map((d) => (
            <div
              key={d.value}
              className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl border-2 text-sm font-medium ${
                d.value === 'heavy_rain'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-100 bg-gray-50 text-gray-400 opacity-50'
              }`}
            >
              <d.Icon size={16} className={d.value === 'heavy_rain' ? 'text-blue-600' : 'text-gray-300'} />
              {d.label}
              {d.value === 'heavy_rain' && (
                <span className="ml-auto text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded-full">Active</span>
              )}
            </div>
          ))}
        </div>

        {/* Risk analysis card */}
        <motion.div
          key="heavy_rain"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl border p-4 space-y-3 ${disruption.riskBg}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <disruption.Icon size={18} className={disruption.riskColor} />
              <p className="text-sm font-bold text-gray-800">{disruption.label} Analysis</p>
            </div>
            <RiskBadge risk={disruption.risk} />
          </div>

          <p className="text-xs text-gray-600 leading-relaxed">{disruption.description}</p>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/70 rounded-lg px-3 py-2">
              <p className="text-xs text-gray-400">Live Reading</p>
              <p className={`text-base font-bold ${disruption.riskColor}`}>{disruption.value_reading}</p>
            </div>
            <div className="bg-white/70 rounded-lg px-3 py-2">
              <p className="text-xs text-gray-400">Trigger Threshold</p>
              <p className="text-base font-bold text-gray-700">{disruption.threshold}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/70 rounded-lg px-3 py-2">
            <TrendingUp size={14} className={disruption.riskColor} />
            <p className="text-xs text-gray-600">
              Estimated income loss: <span className="font-bold text-gray-800">₹1,200</span> ·
              Eligible payout: <span className="font-bold text-blue-700">₹1,000</span>
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Map */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 space-y-3"
      >
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-blue-500" />
          <p className="text-sm font-bold text-gray-800">Disruption Zone — Coimbatore, Tamil Nadu</p>
        </div>
        <div className="rounded-xl overflow-hidden border border-gray-200">
          <MapComponent
            center={[selectedCity.lat, selectedCity.lon]}
            disruptions={TN_DISRUPTION_ZONES}
          />
        </div>
        <p className="text-xs text-gray-400 text-center">
          Red zones indicate active disruption areas across Tamil Nadu
        </p>
      </motion.div>

      {/* Actions */}
      <div className="flex flex-col gap-3 pb-4">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Submitting Claim…
            </>
          ) : 'Submit Claim →'}
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full py-3 rounded-xl font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
