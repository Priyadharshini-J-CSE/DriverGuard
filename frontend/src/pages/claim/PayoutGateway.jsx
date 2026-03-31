import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, ChevronRight, Lock, X } from 'lucide-react';
import api from '../../services/api';

function PasswordModal({ amount, onClose, onSuccess }) {
  const { user }    = useAuth();
  const inputRef    = useRef(null);
  const [pwd, setPwd]       = useState('');
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleVerify = async () => {
    if (!pwd) { setError('Please enter your password.'); return; }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/verify-password', { email: user.email, password: pwd });
      onSuccess();
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Incorrect password. Please try again.');
        setPwd('');
      } else {
        onSuccess(); // network error — allow through
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-full max-w-sm bg-[#141929] border border-white/10 rounded-3xl p-6 space-y-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center">
              <Lock size={14} className="text-blue-400" />
            </div>
            <p className="text-white font-semibold">Enter Account Password</p>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
            <X size={13} className="text-gray-400" />
          </button>
        </div>

        {/* Amount reminder */}
        <div className="bg-white/5 rounded-2xl py-3 text-center">
          <p className="text-gray-400 text-xs">Paying Premium</p>
          <p className="text-white text-2xl font-bold">₹{amount?.toLocaleString('en-IN')}</p>
        </div>

        {/* Password input */}
        <div className="space-y-2">
          <input
            ref={inputRef}
            type="password"
            value={pwd}
            onChange={(e) => { setPwd(e.target.value); setError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
            placeholder="Enter your login password"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3
                       text-white placeholder:text-gray-600 placeholder:text-sm
                       focus:outline-none focus:border-blue-500 transition-colors"
          />
          {error && (
            <motion.p initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              className="text-red-400 text-xs text-center">
              {error}
            </motion.p>
          )}
        </div>

        {/* Verify button */}
        <button
          onClick={handleVerify}
          disabled={loading || !pwd}
          className="w-full py-3.5 rounded-2xl font-bold text-white
                     bg-gradient-to-r from-blue-600 to-indigo-600
                     hover:from-blue-700 hover:to-indigo-700
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all shadow-lg shadow-blue-900/30"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Verifying…
            </span>
          ) : 'Verify & Pay'}
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function PayoutGateway() {
  const navigate  = useNavigate();
  const { state } = useLocation();
  const { user }  = useAuth();
  const [showModal, setShowModal] = useState(false);

  const amount       = state?.amount       ?? 0;
  const mode         = state?.mode         ?? 'premium';
  const weeklyIncome = state?.weeklyIncome ?? 0;
  const ocrImageUrl  = state?.ocrImageUrl  ?? '';
  const bank         = user?.bankAccount   ?? {};
  const masked       = bank.accountNumber ? `****${bank.accountNumber.slice(-4)}` : '****0000';

  if (!amount) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
        No payout data found.{' '}
        <button onClick={() => navigate('/claims')} className="text-blue-500 ml-1 underline">
          Go to Claims
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex flex-col items-center justify-between py-10 px-4">

      {/* Top */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-3 mt-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600
                        flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-900/40">
          {user?.name?.[0]?.toUpperCase() ?? 'D'}
        </div>
        <div className="text-center">
          <p className="text-white font-semibold text-lg">Paying Weekly Premium</p>
          <p className="text-gray-400 text-xs mt-0.5">Insurance Premium Payment</p>
        </div>
      </motion.div>

      {/* Amount */}
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15 }} className="text-center">
        <p className="text-gray-400 text-sm mb-1">Premium Amount</p>
        <p className="text-6xl font-extrabold text-white tracking-tight">
          ₹{amount.toLocaleString('en-IN')}
        </p>
        <div className="flex items-center justify-center gap-1.5 mt-3">
          <ShieldCheck size={14} className="text-green-400" />
          <span className="text-green-400 text-xs font-medium">Secured by DeliverGuard AI</span>
        </div>
      </motion.div>

      {/* Bottom card */}
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }} className="w-full max-w-sm space-y-3">

        <div className="bg-[#141929] border border-white/10 rounded-2xl p-4">
          <p className="text-gray-400 text-xs mb-3 uppercase tracking-widest">Pay with</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center">
                <span className="text-blue-400 font-bold text-sm">{bank.bankName?.[0] ?? 'B'}</span>
              </div>
              <div>
                <p className="text-white font-medium text-sm">{bank.bankName || 'Bank Account'}</p>
                <p className="text-gray-400 text-xs">{masked} · IMPS</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-gray-500" />
          </div>
        </div>

        <div className="flex items-center justify-center gap-1.5">
          <Lock size={11} className="text-gray-500" />
          <p className="text-gray-500 text-xs">256-bit encrypted · Password protected</p>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowModal(true)}
          className="w-full py-4 rounded-2xl font-bold text-white text-base
                     bg-gradient-to-r from-blue-600 to-indigo-600
                     hover:from-blue-700 hover:to-indigo-700
                     shadow-lg shadow-blue-900/40 transition-all"
        >
          Proceed to Pay →
        </motion.button>

        <p className="text-center text-gray-600 text-xs pb-2">
          This is a simulated payout for demo purposes only
        </p>
      </motion.div>

      {/* Password modal — premium only */}
      <AnimatePresence>
        {showModal && (
          <PasswordModal
            amount={amount}
            onClose={() => setShowModal(false)}
            onSuccess={() => {
              setShowModal(false);
              navigate('/payout-processing', { state: { amount, mode, weeklyIncome, ocrImageUrl } });
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
