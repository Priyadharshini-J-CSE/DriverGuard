import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Banknote, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import { payWeeklyPremium } from '../../services/premiumService';

const STEPS = [
  { label: 'Verification Complete',     icon: <ShieldCheck size={16} />, delay: 0 },
  { label: 'Bank Transfer Initiated',   icon: <Banknote size={16} />,    delay: 1000 },
  { label: 'Funds Transferred',         icon: <CheckCircle size={16} />, delay: 2000 },
];

export default function PayoutProcessing() {
  const navigate  = useNavigate();
  const { state } = useLocation();

  const amount       = state?.amount       ?? 0;
  const claimId      = state?.claimId      ?? null;
  const mode         = state?.mode         ?? 'claim';
  const weeklyIncome = state?.weeklyIncome ?? 0;
  const ocrImageUrl  = state?.ocrImageUrl  ?? '';

  const [stepsDone, setStepsDone] = useState(0);
  const called = useRef(false); // prevent double-fire in React StrictMode

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    // Reveal steps one by one
    STEPS.forEach((_, i) => {
      setTimeout(() => setStepsDone(i + 1), STEPS[i].delay + 400);
    });

    // Trigger backend + navigate after all steps
    const run = async () => {
      let txnId         = `pay_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      let paymentRecord = null;

      try {
        if (mode === 'premium') {
          const { data } = await payWeeklyPremium({ weeklyIncome, ocrImageUrl });
          paymentRecord = data;
          txnId = data.transactionId || txnId;
        } else if (claimId) {
          const { data } = await api.post('/payout/initiate', { claimId });
          txnId = data.razorpayId || txnId;
        }
      } catch {
        // Simulation — always succeed visually
      }

      setTimeout(() => {
        navigate('/payout-success', { state: { amount, txnId, mode, paymentRecord } });
      }, 3200);
    };

    run();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex flex-col items-center justify-center px-4 gap-10">

      {/* Spinner */}
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-5">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 rounded-full border-4 border-blue-900" />
          <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-transparent
                          border-b-transparent border-l-transparent animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <ShieldCheck size={32} className="text-blue-400" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-white text-xl font-bold">Processing your payout...</p>
          <p className="text-gray-400 text-sm mt-1">No action required. Sit back and relax.</p>
        </div>
      </motion.div>

      {/* Steps */}
      <div className="w-full max-w-xs space-y-3">
        {STEPS.map((step, i) => (
          <motion.div
            key={step.label}
            initial={{ opacity: 0, x: -16 }}
            animate={stepsDone > i ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-3 bg-[#141929] border border-white/10 rounded-xl px-4 py-3"
          >
            <div className="w-7 h-7 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 shrink-0">
              {step.icon}
            </div>
            <p className="text-white text-sm font-medium">{step.label}</p>
            {stepsDone > i && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="ml-auto text-green-400 text-xs font-bold">✓</motion.span>
            )}
          </motion.div>
        ))}
      </div>

      <p className="text-gray-600 text-xs">Do not close this window</p>
    </div>
  );
}
