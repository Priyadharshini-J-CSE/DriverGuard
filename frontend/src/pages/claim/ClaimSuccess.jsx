import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import ClaimStepper from './ClaimStepper';
import { CheckCircle, Download, LayoutDashboard, ClipboardList } from 'lucide-react';

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

export default function ClaimSuccess() {
  const navigate  = useNavigate();
  const { state } = useLocation();
  const payout    = state?.payout  || MOCK_PAYOUT;
  const claim     = state?.claim;

  const txDate = new Date(payout.timestamp || Date.now()).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const handleDownload = () => {
    const lines = [
      'DELIVERGUARD AI — PAYOUT RECEIPT',
      '='.repeat(38),
      `Transaction ID  : ${payout.razorpayId || payout._id}`,
      `Date & Time     : ${txDate}`,
      `Amount Credited : ₹${payout.amount.toLocaleString('en-IN')}`,
      `Bank            : ${payout.bankName} ···· ${payout.accountLast4}`,
      `Payment Method  : ${payout.method}`,
      `Claim ID        : ${claim?._id || 'CLM20250601TN001'}`,
      `Disruption      : Heavy Rain (62 mm/hr)`,
      `Location        : Coimbatore, Tamil Nadu`,
      `Status          : ${payout.paymentStatus?.toUpperCase()}`,
      '='.repeat(38),
      'Thank you for using DeliverGuard AI.',
    ].join('\n');

    const blob = new Blob([lines], { type: 'text/plain' });
    const a    = document.createElement('a');
    a.href     = URL.createObjectURL(blob);
    a.download = `receipt-${(claim?._id || 'CLM001').slice(-8)}.txt`;
    a.click();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <ClaimStepper />

      {/* Success hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 text-center space-y-4"
      >
        {/* Animated check */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.15 }}
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto"
        >
          <CheckCircle size={42} className="text-green-600" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <p className="text-sm text-gray-400 font-medium">Amount Credited</p>
          <p className="text-5xl font-extrabold text-green-600 mt-1">
            ₹{payout.amount.toLocaleString('en-IN')}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Successfully transferred to your bank account
          </p>
        </motion.div>

        {/* Confetti dots */}
        <div className="flex justify-center gap-1.5">
          {['bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-purple-400', 'bg-red-400'].map((c, i) => (
            <motion.span
              key={i}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 + i * 0.07 }}
              className={`w-2 h-2 rounded-full ${c}`}
            />
          ))}
        </div>
      </motion.div>

      {/* Transaction details */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5"
      >
        <p className="text-sm font-bold text-gray-800 mb-4">Transaction Details</p>
        <div className="space-y-0 divide-y divide-gray-50">
          {[
            { label: 'Transaction ID',  value: payout.razorpayId || payout._id, mono: true },
            { label: 'Date & Time',     value: txDate },
            { label: 'Amount',          value: `₹${payout.amount.toLocaleString('en-IN')}`, green: true },
            { label: 'Bank',            value: `${payout.bankName} ···· ${payout.accountLast4}` },
            { label: 'Payment Method',  value: payout.method },
            { label: 'Disruption',      value: 'Heavy Rain — Coimbatore, Tamil Nadu' },
            { label: 'Status',          value: payout.paymentStatus?.toUpperCase(), green: true },
          ].map(({ label, value, mono, green }) => (
            <div key={label} className="flex justify-between items-center py-2.5">
              <span className="text-sm text-gray-500">{label}</span>
              <span className={`text-sm font-semibold ${
                green ? 'text-green-600' : mono ? 'font-mono text-xs text-gray-600' : 'text-gray-800'
              }`}>
                {value}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="grid grid-cols-2 gap-3"
      >
        <button
          onClick={handleDownload}
          className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors text-sm"
        >
          <Download size={15} />
          Download Receipt
        </button>
        <button
          onClick={() => navigate('/claims')}
          className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors text-sm"
        >
          <ClipboardList size={15} />
          View All Claims
        </button>
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        onClick={() => navigate('/dashboard')}
        className="w-full py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2"
      >
        <LayoutDashboard size={16} />
        Return to Dashboard
      </motion.button>
    </div>
  );
}
