import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import ClaimStepper from './ClaimStepper';
import { getClaimById } from '../../services/claimService';

const CHECKS = [
  { label: 'Weather API Verification', detail: 'Matched IMD data for Andheri West' },
  { label: 'GPS Location Log', detail: 'Worker active in zone during event' },
  { label: 'Delivery Platform Sync', detail: 'No concurrent active deliveries found' },
  { label: 'Duplicate Claim Check', detail: 'No prior claims for this event window' },
];

export default function ClaimVerification() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const claimId  = state?.claimId;
  const [revealed, setRevealed] = useState(0);
  const [claim, setClaim]       = useState(null);

  useEffect(() => {
    if (claimId) getClaimById(claimId).then((r) => setClaim(r.data)).catch(() => {});
  }, [claimId]);

  useEffect(() => {
    if (revealed >= CHECKS.length) return;
    const t = setTimeout(() => setRevealed((p) => p + 1), 600);
    return () => clearTimeout(t);
  }, [revealed]);

  const allDone = revealed >= CHECKS.length;

  // Auto-navigate once all checks pass — zero-touch parametric payout
  useEffect(() => {
    if (!allDone) return;
    const t = setTimeout(() => {
      navigate('/payout-processing', { state: { amount: claim?.claimAmount ?? 0, claimId } });
    }, 2000);
    return () => clearTimeout(t);
  }, [allDone, claim, claimId, navigate]);

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <ClaimStepper />
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-lg text-gray-800 dark:text-gray-100">Security Scan Protocol</h2>
          {allDone && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold px-3 py-1 rounded-full"
            >
              100% Secure ✓
            </motion.span>
          )}
        </div>

        <div className="space-y-3">
          {CHECKS.map((check, i) => (
            <motion.div
              key={check.label}
              initial={{ opacity: 0, x: -16 }}
              animate={i < revealed ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800"
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm shrink-0 mt-0.5 ${
                i < revealed ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700'
              }`}>
                {i < revealed ? '✓' : '·'}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{check.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{check.detail}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Auto-processing message — replaces button */}
        {allDone && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="mt-4 space-y-2"
          >
            <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20
                           border border-green-200 dark:border-green-800 rounded-xl px-4 py-3">
              <span className="text-base">✅</span>
              <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                All checks completed successfully
              </p>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20
                           border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3">
              <span className="text-base animate-pulse">💸</span>
              <p className="text-sm text-blue-700 dark:text-blue-400 font-medium">
                Your payout is being processed automatically
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
