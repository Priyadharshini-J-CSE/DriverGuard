import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import ClaimStepper from './ClaimStepper';
import { BadgeCheck, Building2, ArrowRight } from 'lucide-react';

const MOCK_PAYOUT = {
  _id: 'PAY20250601TN001',
  razorpayId: 'rzp_live_TN20250601001',
  amount: 1000,
  paymentStatus: 'success',
  timestamp: new Date().toISOString(),
  bankName: 'State Bank of India',
  accountLast4: '4821',
  method: 'IMPS Transfer',
};

export default function ClaimApproval() {
  const navigate  = useNavigate();
  const { state } = useLocation();
  const claim     = state?.claim;

  const [paying,   setPaying]   = useState(false);
  const [progress, setProgress] = useState(40);

  const handlePayout = () => {
    setPaying(true);
    // Animate progress bar to 100%
    let p = 40;
    const interval = setInterval(() => {
      p += 12;
      setProgress(Math.min(p, 100));
      if (p >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          navigate('/claim/success', { state: { claim, payout: MOCK_PAYOUT } });
        }, 500);
      }
    }, 200);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <ClaimStepper />

      {/* Approved amount hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 text-white text-center shadow-lg"
      >
        <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
          <BadgeCheck size={28} className="text-white" />
        </div>
        <p className="text-sm font-medium text-blue-100 mb-1">Approved Payout Amount</p>
        <p className="text-5xl font-extrabold tracking-tight">₹1,000</p>
        <p className="text-xs text-blue-200 mt-2">
          Claim ID: {claim?._id || 'CLM20250601TN001'} · Heavy Rain · Coimbatore
        </p>
        <div className="mt-3 inline-flex items-center gap-1.5 bg-white/20 border border-white/30 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
          Fraud Check Passed · AI Score: 4/100
        </div>
      </motion.div>

      {/* Claim breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5"
      >
        <p className="text-sm font-bold text-gray-800 mb-4">Claim Breakdown</p>
        <div className="space-y-2.5">
          {[
            { label: 'Disruption Type',  value: 'Heavy Rain (62 mm/hr)',       highlight: false },
            { label: 'Location',         value: 'Coimbatore, Tamil Nadu',      highlight: false },
            { label: 'Platform',         value: 'Zomato',                 highlight: false },
            { label: 'Plan',             value: 'Standard',               highlight: false },
            { label: 'Weekly Income',    value: '₹7,200',                 highlight: false },
            { label: 'Estimated Loss',   value: '₹1,200',                 highlight: false },
            { label: 'Approved Payout',  value: '₹1,000',                 highlight: true  },
          ].map(({ label, value, highlight }) => (
            <div key={label} className={`flex justify-between items-center py-2 border-b border-gray-50 last:border-0 ${highlight ? 'bg-blue-50 -mx-2 px-2 rounded-lg' : ''}`}>
              <span className="text-sm text-gray-500">{label}</span>
              <span className={`text-sm font-semibold ${highlight ? 'text-blue-700 text-base' : 'text-gray-800'}`}>{value}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Transfer progress */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 space-y-3"
      >
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-bold text-xs">DG</span>
            </div>
            DeliverGuard Escrow
          </div>
          <ArrowRight size={14} className="text-gray-300" />
          <div className="flex items-center gap-1.5">
            <Building2 size={14} className="text-gray-400" />
            SBI ···· 4821
          </div>
        </div>

        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
            className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
          />
        </div>

        <p className="text-xs text-center text-gray-500">
          {paying
            ? `Transferring… ${progress}% complete`
            : 'Transfer ready — awaiting your confirmation'}
        </p>
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        onClick={handlePayout}
        disabled={paying}
        className="w-full py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-colors shadow-sm flex items-center justify-center gap-2"
      >
        {paying ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing Transfer…
          </>
        ) : 'Transfer to Bank Now →'}
      </motion.button>
    </div>
  );
}
