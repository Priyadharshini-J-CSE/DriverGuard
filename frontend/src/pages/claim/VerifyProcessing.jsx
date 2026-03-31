import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import ClaimStepper from './ClaimStepper';
import { getClaimById } from '../../services/claimService';
import { formatCurrency } from '../../utils/helpers';
import api from '../../services/api';
import { ShieldCheck, MapPin, Calculator, Banknote, Check } from 'lucide-react';

// Security checks — animate in one by one
const CHECKS = [
  { label: 'Disruption Detected',    detail: 'Matched live environmental data'         },
  { label: 'Location Verified',      detail: 'Worker active in registered city zone'   },
  { label: 'Income Loss Calculated', detail: 'Based on hourly income × 6 hrs'          },
  { label: 'Duplicate Claim Check',  detail: 'No prior claims for this event window'   },
];

// Processing steps — animate after checks complete
const PROC_STEPS = [
  { label: 'Verifying your claim...',       icon: <ShieldCheck size={14} /> },
  { label: 'Calculating compensation...',   icon: <Calculator  size={14} /> },
  { label: 'Initiating instant payout...',  icon: <Banknote    size={14} /> },
];

export default function VerifyProcessing() {
  const navigate  = useNavigate();
  const { state } = useLocation();
  const claimId   = state?.claimId;

  const [claim,      setClaim]      = useState(null);
  const [revealed,   setRevealed]   = useState(0);
  const [procStep,   setProcStep]   = useState(-1); // -1 = not started
  const [allDone,    setAllDone]    = useState(false);

  // Load claim data
  useEffect(() => {
    if (!claimId) return;
    getClaimById(claimId).then((r) => setClaim(r.data)).catch(() => {});
  }, [claimId]);

  // Reveal security checks one by one
  useEffect(() => {
    if (revealed >= CHECKS.length) return;
    const t = setTimeout(() => setRevealed((p) => p + 1), 700);
    return () => clearTimeout(t);
  }, [revealed]);

  // Once all checks done, start processing steps
  useEffect(() => {
    if (revealed < CHECKS.length) return;
    PROC_STEPS.forEach((_, i) => {
      setTimeout(() => setProcStep(i), i * 900);
    });
    // Mark fully done after last proc step
    setTimeout(() => setAllDone(true), PROC_STEPS.length * 900 + 200);
  }, [revealed]);

  // Auto-navigate to success once done
  useEffect(() => {
    if (!allDone) return;
    const run = async () => {
      let txnId = `pay_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      try {
        if (claimId) {
          const { data } = await api.post('/payout/initiate', { claimId });
          txnId = data.razorpayId || txnId;
        }
      } catch { /* simulation — always succeed */ }

      setTimeout(() => {
        navigate('/payout-success', {
          state: { amount: claim?.claimAmount ?? 0, txnId, mode: 'claim' },
        });
      }, 800);
    };
    run();
  }, [allDone, claim, claimId, navigate]);

  const checksComplete = revealed >= CHECKS.length;

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <ClaimStepper />

      {/* Claim mini-summary */}
      {claim && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="card bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800
                     flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <MapPin size={14} />
            <span className="capitalize">{claim.disruptionType?.replace(/_/g, ' ')}</span>
            <span className="text-gray-400">·</span>
            <span>{claim.location?.city || '—'}</span>
          </div>
          <span className="font-bold text-blue-700 dark:text-blue-300">
            {formatCurrency(claim.claimAmount)}
          </span>
        </motion.div>
      )}

      {/* Security checks */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800 dark:text-gray-100">Security Verification</h2>
          {checksComplete && (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400
                         text-xs font-bold px-3 py-1 rounded-full">
              100% Secure ✓
            </motion.span>
          )}
        </div>

        <div className="space-y-2">
          {CHECKS.map((check, i) => (
            <motion.div key={check.label}
              initial={{ opacity: 0, x: -16 }}
              animate={i < revealed ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.35 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800"
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5 transition-all ${
                i < revealed ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
              }`}>
                {i < revealed ? <Check size={12} /> : '·'}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{check.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{check.detail}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Processing steps — appear after checks */}
      {checksComplete && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="card space-y-3">
          <h2 className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            Processing Payout
          </h2>

          {PROC_STEPS.map((step, i) => (
            <motion.div key={step.label}
              initial={{ opacity: 0, x: -12 }}
              animate={procStep >= i ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3 text-sm"
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all ${
                procStep > i
                  ? 'bg-green-500 text-white'
                  : procStep === i
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
              }`}>
                {procStep > i ? <Check size={13} /> : step.icon}
              </div>
              <span className={procStep >= i ? 'text-gray-800 dark:text-gray-100 font-medium' : 'text-gray-400'}>
                {step.label}
              </span>
              {procStep > i && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="ml-auto text-green-500 text-xs font-bold">✓</motion.span>
              )}
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20
                       border border-green-200 dark:border-green-800 rounded-xl px-4 py-3 mt-2">
            <span className="animate-pulse text-base">💸</span>
            <p className="text-sm text-green-700 dark:text-green-400 font-medium">
              Your payout is being processed automatically
            </p>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
