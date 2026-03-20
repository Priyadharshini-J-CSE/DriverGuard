import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import ClaimStepper from './ClaimStepper';
import { Zap, MapPin, Calculator, CheckCircle, Banknote, Check, CloudRain } from 'lucide-react';

/* ── Mock claim data ────────────────────────────────────── */
const MOCK_CLAIM = {
  _id: 'CLM20250601TN001',
  disruptionType: 'heavy_rain',
  disruptionValue: 62,
  location: { city: 'Coimbatore, Tamil Nadu' },
  incomeLoss: 1200,
  claimAmount: 1000,
  status: 'pending',
  createdAt: new Date().toISOString(),
  weeklyIncome: 7200,
  plan: 'Standard',
  platform: 'Zomato',
};

const PIPELINE_STEPS = [
  {
    label: 'Disruption Detected',
    Icon: Zap,
    detail: 'Heavy Rain — 62 mm/hr recorded via OpenWeather API',
    badge: 'Threshold exceeded',
    badgeColor: 'bg-red-100 text-red-600',
  },
  {
    label: 'Location Verified',
    Icon: MapPin,
    detail: 'Worker active in Coimbatore delivery zone during event window',
    badge: 'GPS confirmed',
    badgeColor: 'bg-blue-100 text-blue-600',
  },
  {
    label: 'Income Loss Calculated',
    Icon: Calculator,
    detail: 'Estimated loss ₹1,200 · Eligible payout ₹1,000 (Standard Plan)',
    badge: '₹1,000 approved',
    badgeColor: 'bg-green-100 text-green-600',
  },
  {
    label: 'Claim Approval',
    Icon: CheckCircle,
    detail: 'AI fraud check passed · No duplicate claims found',
    badge: 'Approved',
    badgeColor: 'bg-green-100 text-green-600',
  },
  {
    label: 'Payout Initiation',
    Icon: Banknote,
    detail: 'Transfer queued to registered bank account via IMPS',
    badge: 'Pending transfer',
    badgeColor: 'bg-yellow-100 text-yellow-700',
  },
];

export default function ClaimAutoStatus() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const claim = state?.claim || MOCK_CLAIM;

  // Animate pipeline steps revealing one by one
  const [revealed, setRevealed] = useState(0);
  const TARGET = 3; // stop at "Claim Approval" step (index 3)

  useEffect(() => {
    if (revealed >= TARGET) return;
    const t = setTimeout(() => setRevealed((p) => p + 1), 700);
    return () => clearTimeout(t);
  }, [revealed]);

  const allRevealed = revealed >= TARGET;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <ClaimStepper />

      {/* Claim header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
              <CloudRain size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Claim ID</p>
              <p className="font-bold text-gray-800 font-mono text-sm">{claim._id}</p>
              <p className="text-xs text-gray-500 mt-0.5">{claim.location?.city} · {claim.platform}</p>
            </div>
          </div>
          <span className="text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200 px-3 py-1 rounded-full shrink-0">
            Processing
          </span>
        </div>
      </motion.div>

      {/* Pipeline */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
        <p className="text-sm font-bold text-gray-800 mb-5">Auto-Claim Pipeline</p>
        <div className="space-y-0">
          {PIPELINE_STEPS.map((step, i) => {
            const done   = i < revealed;
            const active = i === revealed && i < TARGET;
            const locked = i > revealed;
            return (
              <div key={step.label} className="flex gap-4">
                {/* Icon + connector */}
                <div className="flex flex-col items-center">
                  <motion.div
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={done || active ? { scale: 1, opacity: 1 } : { scale: 0.85, opacity: 0.4 }}
                    transition={{ duration: 0.35 }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      done
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : active
                        ? 'bg-white border-blue-500 text-blue-600 ring-4 ring-blue-50'
                        : 'bg-gray-50 border-gray-200 text-gray-300'
                    }`}
                  >
                    {done ? <Check size={16} /> : <step.Icon size={16} />}
                  </motion.div>
                  {i < PIPELINE_STEPS.length - 1 && (
                    <motion.div
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: done ? 1 : 0.3 }}
                      className={`w-0.5 h-10 mt-1 origin-top rounded-full ${done ? 'bg-blue-600' : 'bg-gray-200'}`}
                    />
                  )}
                </div>

                {/* Content */}
                <motion.div
                  initial={{ opacity: 0, x: 12 }}
                  animate={done || active ? { opacity: 1, x: 0 } : { opacity: 0.35, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="pb-8 pt-1.5 flex-1"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`text-sm font-semibold ${locked ? 'text-gray-300' : 'text-gray-800'}`}>
                      {step.label}
                    </p>
                    {(done || active) && (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${step.badgeColor}`}>
                        {step.badge}
                      </span>
                    )}
                    {active && (
                      <span className="flex items-center gap-1 text-xs text-blue-500">
                        <span className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                        Processing…
                      </span>
                    )}
                  </div>
                  {(done || active) && (
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{step.detail}</p>
                  )}
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Claim summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: allRevealed ? 1 : 0.5, y: 0 }}
        className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5"
      >
        <p className="text-sm font-bold text-gray-800 mb-4">Claim Summary</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Disruption',    value: 'Heavy Rain (62 mm/hr)',  color: 'text-red-600' },
            { label: 'Location',      value: claim.location?.city,     color: 'text-gray-800' },
            { label: 'Weekly Income', value: '₹7,200',                 color: 'text-gray-800' },
            { label: 'Plan',          value: 'Standard',               color: 'text-blue-600' },
            { label: 'Income Loss',   value: '₹1,200',                 color: 'text-orange-600' },
            { label: 'Claim Amount',  value: '₹1,000',                 color: 'text-green-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-gray-50 rounded-xl px-3 py-2.5">
              <p className="text-xs text-gray-400">{label}</p>
              <p className={`text-sm font-bold mt-0.5 ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: allRevealed ? 1 : 0.4 }}
        disabled={!allRevealed}
        onClick={() => navigate('/claim/verification', { state: { claim } })}
        className="w-full py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:cursor-not-allowed transition-colors shadow-sm"
      >
        Continue to Verification →
      </motion.button>
    </div>
  );
}
