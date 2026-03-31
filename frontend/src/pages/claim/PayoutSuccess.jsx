import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Download, ClipboardList, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function PayoutSuccess() {
  const { state }  = useLocation();
  const navigate   = useNavigate();
  const { user }   = useAuth();

  const amount        = state?.amount        ?? 0;
  const txnId         = state?.txnId         ?? `pay_${Date.now()}_DEMO`;
  const mode          = state?.mode          ?? 'claim';
  const paymentRecord = state?.paymentRecord ?? null;
  const bank    = user?.bankAccount ?? {};
  const masked  = bank.accountNumber ? `****${bank.accountNumber.slice(-4)}` : '****0000';
  const now     = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const isPremium = mode === 'premium';

  const rows = isPremium && paymentRecord ? [
    { label: 'Transaction ID',  value: paymentRecord.transactionId || txnId },
    { label: 'Date',            value: dateStr },
    { label: 'Time',            value: timeStr },
    { label: 'Premium Paid',    value: `₹${amount.toLocaleString('en-IN')}` },
    { label: 'Plan',            value: paymentRecord.planName ?? '—' },
    { label: 'Coverage Start',  value: fmtDate(paymentRecord.coverageStart) },
    { label: 'Coverage Until',  value: fmtDate(paymentRecord.coverageEnd) },
    { label: 'Payment Method',  value: 'IMPS Transfer' },
    { label: 'Status',          value: 'SUCCESS' },
  ] : [
    { label: 'Transaction ID',  value: txnId },
    { label: 'Date',            value: dateStr },
    { label: 'Time',            value: timeStr },
    { label: 'Amount',          value: `₹${amount.toLocaleString('en-IN')}` },
    { label: 'Bank',            value: bank.bankName || 'Bank Account' },
    { label: 'Account',         value: masked },
    { label: 'Payment Method',  value: 'IMPS Transfer' },
    { label: 'Status',          value: 'SUCCESS' },
  ];

  const successTitle = isPremium
    ? `₹${amount.toLocaleString('en-IN')} Premium Paid`
    : `₹${amount.toLocaleString('en-IN')} Credited`;

  const successSub = isPremium
    ? 'Your insurance coverage is now active for 7 days'
    : 'Automatically transferred to your bank account';

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex flex-col items-center justify-center py-10 px-4">
      <div className="w-full max-w-sm space-y-6">

        {/* Success icon */}
        <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
          className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center
                          ring-4 ring-green-500/30">
            <CheckCircle size={44} className="text-green-400" />
          </div>
          <div className="text-center">
            <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-extrabold text-white">
              {successTitle}
            </motion.p>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
              className="text-gray-400 text-sm mt-1">
              {successSub}
            </motion.p>
          </div>
        </motion.div>

        {/* Receipt card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#141929] border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5">
            <p className="text-gray-400 text-xs uppercase tracking-widest">Transaction Receipt</p>
          </div>
          <div className="divide-y divide-white/5">
            {rows.map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between px-4 py-3">
                <span className="text-gray-500 text-xs">{label}</span>
                <span className={`text-xs font-medium max-w-[55%] text-right break-all ${
                  label === 'Status' ? 'text-green-400 font-bold' : 'text-white'
                }`}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
          className="space-y-3">
          <button
            onClick={() => {
              const text = rows.map((r) => `${r.label}: ${r.value}`).join('\n');
              const blob = new Blob([`DeliverGuard AI — Payout Receipt\n\n${text}`], { type: 'text/plain' });
              const url  = URL.createObjectURL(blob);
              const a    = document.createElement('a');
              a.href = url; a.download = `receipt_${txnId}.txt`; a.click();
              URL.revokeObjectURL(url);
            }}
            className="w-full py-3 rounded-2xl font-semibold text-white border border-white/10
                       bg-white/5 hover:bg-white/10 flex items-center justify-center gap-2 transition-colors"
          >
            <Download size={16} /> Download Receipt
          </button>

          <button onClick={() => navigate(isPremium ? '/insurance-payment-history' : '/claims')}
            className="w-full py-3 rounded-2xl font-semibold text-white border border-white/10
                       bg-white/5 hover:bg-white/10 flex items-center justify-center gap-2 transition-colors">
            <ClipboardList size={16} /> {isPremium ? 'View Payment History' : 'View All Claims'}
          </button>

          <button onClick={() => navigate('/dashboard')}
            className="w-full py-3.5 rounded-2xl font-bold text-white
                       bg-gradient-to-r from-blue-600 to-indigo-600
                       hover:from-blue-700 hover:to-indigo-700
                       flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/30">
            <LayoutDashboard size={16} /> Return to Dashboard
          </button>
        </motion.div>
      </div>
    </div>
  );
}
