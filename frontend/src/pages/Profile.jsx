import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion } from 'framer-motion';
import { UserCircle, Bike, Landmark, Lock, ShieldCheck, CheckCircle, Trophy } from 'lucide-react';
import { getBadge, BADGE_META } from '../utils/badgeUtils';

const PLATFORMS = ['Zomato', 'Swiggy', 'Uber Eats', 'Zepto', 'Blinkit', 'Other'];

/* ── Badge Card ─────────────────────────────────────────── */
function LoyaltyBadgeCard({ user }) {
  const riskScore  = user?.riskScore    ?? 10;
  const fraudCount = user?.fraudEvents?.length ?? 0;
  const tier       = getBadge(riskScore, fraudCount);
  const meta       = BADGE_META[tier];

  // Progress toward next tier
  const nextTier = tier === 'Silver' ? 'Gold' : tier === 'Gold' ? 'Diamond' : null;
  const nextMeta = nextTier ? BADGE_META[nextTier] : null;

  // Progress %: how close to next tier thresholds
  let progress = 100;
  if (tier === 'Silver') {
    // Need riskScore < 40 and fraudCount <= 2
    const scoreProgress = Math.max(0, Math.min(100, ((40 - riskScore) / 40) * 100));
    const fraudProgress = fraudCount <= 2 ? 100 : Math.max(0, ((2 - fraudCount) / 2) * 100);
    progress = Math.round((scoreProgress + fraudProgress) / 2);
  } else if (tier === 'Gold') {
    // Need riskScore < 20 and fraudCount === 0
    const scoreProgress = Math.max(0, Math.min(100, ((20 - riskScore) / 20) * 100));
    const fraudProgress = fraudCount === 0 ? 100 : 0;
    progress = Math.round((scoreProgress + fraudProgress) / 2);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl border ${meta.border} shadow-sm overflow-hidden`}
    >
      {/* Gradient header */}
      <div className={`bg-gradient-to-r ${meta.gradient} px-6 py-5 flex items-center justify-between`}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 ring-4 ring-white/30 flex items-center justify-center text-3xl select-none">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-tight">{user?.name}</p>
            <p className="text-white/80 text-xs mt-0.5">{user?.email}</p>
            <p className="text-white/70 text-xs">{user?.deliveryPlatform} · {user?.city}</p>
          </div>
        </div>
        {/* Badge pill */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-14 h-14 rounded-full bg-white/20 ring-4 ring-white/30 flex items-center justify-center text-2xl select-none">
            {meta.icon}
          </div>
          <span className="text-white text-xs font-bold tracking-wide">{meta.label}</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Risk Score',    value: riskScore,   color: riskScore < 20 ? 'text-green-600' : riskScore < 50 ? 'text-yellow-600' : 'text-red-600' },
            { label: 'Fraud Events',  value: fraudCount,  color: fraudCount === 0 ? 'text-green-600' : 'text-orange-600' },
            { label: 'Loyalty Tier',  value: tier,        color: meta.text },
          ].map(({ label, value, color }) => (
            <div key={label} className={`${meta.lightBg} rounded-xl px-3 py-2.5 text-center`}>
              <p className="text-xs text-gray-400 mb-0.5">{label}</p>
              <p className={`text-base font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Description */}
        <p className="text-xs text-gray-500 leading-relaxed">{meta.description}</p>

        {/* Perks */}
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-2">Your Perks</p>
          <div className="grid grid-cols-2 gap-1.5">
            {meta.perks.map((perk) => (
              <div key={perk} className="flex items-center gap-1.5">
                <CheckCircle size={12} className={meta.text} />
                <span className="text-xs text-gray-600">{perk}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Progress to next tier */}
        {nextTier && (
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1.5">
              <span>Progress to {nextMeta.icon} {nextTier}</span>
              <span className={`font-semibold ${progress >= 70 ? 'text-green-600' : 'text-gray-500'}`}>{progress}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`h-2 rounded-full bg-gradient-to-r ${meta.gradient}`}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              {tier === 'Silver'
                ? `Keep risk score below 40 and fraud events ≤ 2 to reach Gold.`
                : `Keep risk score below 20 with zero fraud events to reach Diamond.`}
            </p>
          </div>
        )}

        {tier === 'Diamond' && (
          <div className={`flex items-center gap-2 ${meta.lightBg} border ${meta.border} rounded-xl px-4 py-2.5`}>
            <Trophy size={15} className={meta.text} />
            <p className={`text-xs font-semibold ${meta.text}`}>You have reached the highest loyalty tier!</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ── Page ───────────────────────────────────────────────── */
export default function Profile() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('personal');
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    city: user?.city || '',
    avgDailyIncome: user?.avgDailyIncome || '',
    workingHours: user?.workingHours || 8,
    deliveryPlatform: user?.deliveryPlatform || 'Zomato',
    deliveryZones: user?.deliveryZones?.join(', ') || '',
    bankName: user?.bankAccount?.bankName || '',
    accountNumber: user?.bankAccount?.accountNumber || '',
    ifscCode: user?.bankAccount?.ifscCode || '',
    holderName: user?.bankAccount?.holderName || '',
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saved, setSaved]   = useState('');
  const [error, setError]   = useState('');

  const set   = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const setPw = (k) => (e) => setPwForm({ ...pwForm, [k]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.put('/user/profile', {
        name: form.name, phone: form.phone, city: form.city,
        avgDailyIncome: Number(form.avgDailyIncome),
        workingHours: Number(form.workingHours),
        deliveryPlatform: form.deliveryPlatform,
        deliveryZones: form.deliveryZones.split(',').map((z) => z.trim()).filter(Boolean),
        bankAccount: { bankName: form.bankName, accountNumber: form.accountNumber, ifscCode: form.ifscCode, holderName: form.holderName },
      });
      updateUser({ name: form.name, phone: form.phone, city: form.city, avgDailyIncome: Number(form.avgDailyIncome), workingHours: Number(form.workingHours), deliveryPlatform: form.deliveryPlatform });
      setSaved('Profile saved successfully!');
      setTimeout(() => setSaved(''), 3000);
    } catch { setError('Failed to save profile.'); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    if (pwForm.newPassword !== pwForm.confirmPassword) { setError('Passwords do not match.'); return; }
    try {
      await api.put('/user/password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setSaved('Password updated successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSaved(''), 3000);
    } catch (err) { setError(err.response?.data?.message || 'Failed to update password.'); }
  };

  const TABS = [
    { key: 'personal', label: 'Personal Info', Icon: UserCircle },
    { key: 'work',     label: 'Work Details',  Icon: Bike       },
    { key: 'bank',     label: 'Bank Account',  Icon: Landmark   },
    { key: 'security', label: 'Security',      Icon: Lock       },
  ];

  return (
    <div className="max-w-2xl space-y-5">

      {/* Loyalty Badge Card */}
      <LoyaltyBadgeCard user={user} />

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-lg transition-colors ${
              tab === t.key ? 'bg-white dark:bg-gray-900 text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            <t.Icon size={13} /> {t.label}
          </button>
        ))}
      </div>

      {saved && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-green-50 text-green-600 rounded-xl p-3 text-sm">{saved}</motion.div>}
      {error && <div className="bg-red-50 text-red-600 rounded-xl p-3 text-sm">{error}</div>}

      <form onSubmit={handleSave}>
        {tab === 'personal' && (
          <div className="card space-y-4">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300">Personal Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-gray-500 mb-1 block">Full Name</label><input className="input" value={form.name} onChange={set('name')} /></div>
              <div><label className="text-xs text-gray-500 mb-1 block">Phone</label><input className="input" value={form.phone} onChange={set('phone')} /></div>
              <div className="col-span-2"><label className="text-xs text-gray-500 mb-1 block">City</label><input className="input" value={form.city} onChange={set('city')} /></div>
            </div>
            <button type="submit" className="btn-primary">Save Changes</button>
          </div>
        )}
        {tab === 'work' && (
          <div className="card space-y-4">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300">Work Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Delivery Platform</label>
                <select className="input" value={form.deliveryPlatform} onChange={set('deliveryPlatform')}>
                  {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div><label className="text-xs text-gray-500 mb-1 block">Working Hours/Day</label><input className="input" type="number" value={form.workingHours} onChange={set('workingHours')} /></div>
              <div><label className="text-xs text-gray-500 mb-1 block">Avg Daily Income (₹)</label><input className="input" type="number" value={form.avgDailyIncome} onChange={set('avgDailyIncome')} /></div>
              <div><label className="text-xs text-gray-500 mb-1 block">Delivery Zones</label><input className="input" placeholder="Andheri, Bandra..." value={form.deliveryZones} onChange={set('deliveryZones')} /></div>
            </div>
            <button type="submit" className="btn-primary">Save Changes</button>
          </div>
        )}
        {tab === 'bank' && (
          <div className="card space-y-4">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300">Bank Account</h3>
            <div className="space-y-3">
              <div><label className="text-xs text-gray-500 mb-1 block">Account Holder Name</label><input className="input" value={form.holderName} onChange={set('holderName')} /></div>
              <div><label className="text-xs text-gray-500 mb-1 block">Bank Name</label><input className="input" value={form.bankName} onChange={set('bankName')} /></div>
              <div><label className="text-xs text-gray-500 mb-1 block">Account Number</label><input className="input" value={form.accountNumber} onChange={set('accountNumber')} /></div>
              <div><label className="text-xs text-gray-500 mb-1 block">IFSC Code</label><input className="input" value={form.ifscCode} onChange={set('ifscCode')} /></div>
            </div>
            <button type="submit" className="btn-primary">Save Changes</button>
          </div>
        )}
      </form>

      {tab === 'security' && (
        <form onSubmit={handlePasswordChange} className="card space-y-4">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300">Change Password</h3>
          <div><label className="text-xs text-gray-500 mb-1 block">Current Password</label><input className="input" type="password" value={pwForm.currentPassword} onChange={setPw('currentPassword')} required /></div>
          <div><label className="text-xs text-gray-500 mb-1 block">New Password</label><input className="input" type="password" value={pwForm.newPassword} onChange={setPw('newPassword')} required /></div>
          <div><label className="text-xs text-gray-500 mb-1 block">Confirm New Password</label><input className="input" type="password" value={pwForm.confirmPassword} onChange={setPw('confirmPassword')} required /></div>
          <button type="submit" className="btn-primary">Update Password</button>
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            <h4 className="font-medium text-gray-700 dark:text-gray-300 text-sm mb-2">Two-Factor Authentication</h4>
            <p className="text-xs text-gray-500 mb-3">Add an extra layer of security to your account.</p>
            <button type="button" className="btn-secondary text-sm">Enable 2FA (Coming Soon)</button>
          </div>
        </form>
      )}
    </div>
  );
}
