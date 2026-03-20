import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import ClaimStepper from './ClaimStepper';
import { ShieldCheck, CheckCircle } from 'lucide-react';

const CHECKS = [
  {
    label: 'Weather API Verification',
    detail: 'IMD Coimbatore confirmed 62 mm/hr rainfall — threshold exceeded (>50 mm/hr)',
    icon: '🌧️',
  },
  {
    label: 'GPS Location Validation',
    detail: 'Worker logged active in Coimbatore delivery zone (RS Puram) during event window',
    icon: '📍',
  },
  {
    label: 'Delivery Platform Sync',
    detail: 'Zomato API: No active deliveries during disruption period — income loss confirmed',
    icon: '🔗',
  },
  {
    label: 'Duplicate Claim Check',
    detail: 'No prior claims found for this disruption window (Jun 1, 2025 06:00–14:00 IST)',
    icon: '🔍',
  },
  {
    label: 'Fraud Risk Score',
    detail: 'AI fraud score: 4/100 — Low risk · Claim cleared for approval',
    icon: '🤖',
  },
];

export default function ClaimVerification() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const claim = state?.claim;

  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    if (revealed >= CHECKS.length) return;
    const t = setTimeout(() => setRevealed((p) => p + 1), 650);
    return () => clearTimeout(t);
  }, [revealed]);

  const allDone = revealed >= CHECKS.length;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <ClaimStepper />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <ShieldCheck size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">Security Scan Protocol</p>
              <p className="text-xs text-gray-400 mt-0.5">Running {CHECKS.length} verification checks</p>
            </div>
          </div>
          {allDone && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 220 }}
              className="flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full"
            >
              <CheckCircle size={13} />
              100% Verified
            </motion.div>
          )}
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>Verification progress</span>
            <span>{Math.round((revealed / CHECKS.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <motion.div
              animate={{ width: `${(revealed / CHECKS.length) * 100}%` }}
              transition={{ duration: 0.5 }}
              className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
            />
          </div>
        </div>
      </motion.div>

      {/* Checks */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 space-y-3">
        {CHECKS.map((check, i) => (
          <motion.div
            key={check.label}
            initial={{ opacity: 0, x: -16 }}
            animate={i < revealed ? { opacity: 1, x: 0 } : { opacity: 0, x: -16 }}
            transition={{ duration: 0.35 }}
            className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
              i < revealed
                ? 'bg-green-50 border-green-200'
                : 'bg-gray-50 border-gray-100'
            }`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0 mt-0.5 ${
              i < revealed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
            }`}>
              {i < revealed ? '✓' : <span className="text-xs">{i + 1}</span>}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">{check.label}</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{check.detail}</p>
            </div>
            {i < revealed && (
              <CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" />
            )}
          </motion.div>
        ))}
      </div>

      {/* All clear summary */}
      {allDone && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3"
        >
          <CheckCircle size={20} className="text-green-600 shrink-0" />
          <div>
            <p className="text-sm font-bold text-green-700">All checks passed — Claim is legitimate</p>
            <p className="text-xs text-green-600 mt-0.5">
              Fraud score: 4/100 · Proceeding to payout approval
            </p>
          </div>
        </motion.div>
      )}

      <motion.button
        animate={{ opacity: allDone ? 1 : 0.4 }}
        disabled={!allDone}
        onClick={() => navigate('/claim/approval', { state: { claim } })}
        className="w-full py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:cursor-not-allowed transition-colors shadow-sm"
      >
        Proceed to Payout →
      </motion.button>
    </div>
  );
}
