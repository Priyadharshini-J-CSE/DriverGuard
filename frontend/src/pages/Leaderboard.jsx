import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getBadge, BADGE_META, BADGE_RANK } from '../utils/badgeUtils';
import { Trophy, Search, SlidersHorizontal, ShieldCheck, Users } from 'lucide-react';

/* ── Random leaderboard data ────────────────────────────── */

const NAMES = [
  'Arjun Sharma',   'User',           'Karthik Rajan',  'Divya Menon',
  'Suresh Kumar',   'Anitha Raj',     'Vijay Mohan',    'Lakshmi Devi',
  'Ramesh Babu',    'Meena Sundaram', 'Arun Prakash',   'Kavitha Selvan',
  'Senthil Kumar',  'Deepa Krishnan', 'Murugan Pillai', 'Saranya Bose',
  'Ganesh Iyer',    'Pooja Reddy',    'Balaji Natarajan','Nithya Chandran',
  'Rajesh Pandey',  'Sunita Verma',   'Manoj Tiwari',   'Rekha Gupta',
  'Dinesh Patil',   'Swathi Rao',     'Harish Nambiar', 'Usha Pillai',
];

const PLATFORMS  = ['Zomato', 'Swiggy', 'Blinkit', 'Zepto', 'Uber Eats'];
const CITIES     = ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Trichy', 'Mumbai', 'Bangalore', 'Hyderabad'];

// Seeded pseudo-random so list is stable across renders
const seededRand = (seed) => {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
};

const LEADERBOARD_DATA = NAMES.map((name, i) => {
  const rand       = seededRand(i * 7919 + 31337);
  const riskScore  = Math.floor(rand() * 85) + 5;          // 5–89
  const fraudCount = Math.floor(rand() * 6);               // 0–5
  const badge      = getBadge(riskScore, fraudCount);
  const claims     = Math.floor(rand() * 20) + 1;
  const payouts    = Math.floor(rand() * 15000) + 1000;
  const weeks      = Math.floor(rand() * 52) + 4;

  return {
    id:          i + 1,
    name,
    platform:    PLATFORMS[Math.floor(rand() * PLATFORMS.length)],
    city:        CITIES[Math.floor(rand() * CITIES.length)],
    riskScore,
    fraudCount,
    badge,
    claims,
    payouts,
    weeks,
  };
});

// Sort: badge tier first (Diamond > Gold > Silver), then riskScore ascending
const SORTED_DATA = [...LEADERBOARD_DATA].sort((a, b) => {
  const tierDiff = BADGE_RANK[a.badge] - BADGE_RANK[b.badge];
  return tierDiff !== 0 ? tierDiff : a.riskScore - b.riskScore;
}).map((u, i) => ({ ...u, rank: i + 1 }));

/* ── Sub-components ─────────────────────────────────────── */

function BadgePill({ badge, size = 'sm' }) {
  const meta = BADGE_META[badge];
  const pad  = size === 'lg' ? 'px-4 py-1.5 text-sm' : 'px-2.5 py-0.5 text-xs';
  return (
    <span className={`inline-flex items-center gap-1.5 font-bold rounded-full border ${pad} ${meta.lightBg} ${meta.border} ${meta.text}`}>
      <span>{meta.icon}</span>
      {badge}
    </span>
  );
}

function RankMedal({ rank }) {
  if (rank === 1) return <span className="text-xl">🥇</span>;
  if (rank === 2) return <span className="text-xl">🥈</span>;
  if (rank === 3) return <span className="text-xl">🥉</span>;
  return <span className="text-sm font-bold text-gray-400">#{rank}</span>;
}

function PodiumCard({ entry, position }) {
  const meta   = BADGE_META[entry.badge];
  const heights = { 1: 'h-28', 2: 'h-20', 3: 'h-16' };
  const orders  = { 1: 'order-2', 2: 'order-1', 3: 'order-3' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: position * 0.1 }}
      className={`flex flex-col items-center gap-2 ${orders[position]}`}
    >
      {/* Avatar */}
      <div className={`relative w-14 h-14 rounded-full bg-gradient-to-br ${meta.gradient} flex items-center justify-center text-white font-bold text-xl ring-4 ${meta.ringColor}`}>
        {entry.name[0]}
        <span className="absolute -bottom-1 -right-1 text-base">{meta.icon}</span>
      </div>
      <p className="text-xs font-semibold text-gray-700 text-center leading-tight max-w-[80px]">{entry.name}</p>
      <BadgePill badge={entry.badge} />
      <p className="text-xs text-gray-400">Score: {entry.riskScore}</p>
      {/* Podium block */}
      <div className={`w-20 ${heights[position]} bg-gradient-to-t ${meta.gradient} rounded-t-xl flex items-center justify-center`}>
        <RankMedal rank={position} />
      </div>
    </motion.div>
  );
}

/* ── Summary stats ──────────────────────────────────────── */
const DIAMOND_COUNT = SORTED_DATA.filter((u) => u.badge === 'Diamond').length;
const GOLD_COUNT    = SORTED_DATA.filter((u) => u.badge === 'Gold').length;
const SILVER_COUNT  = SORTED_DATA.filter((u) => u.badge === 'Silver').length;

/* ── Page ───────────────────────────────────────────────── */

export default function Leaderboard() {
  const { user }          = useAuth();
  const [search, setSearch]       = useState('');
  const [filterBadge, setFilterBadge] = useState('All');

  const currentUserRank = useMemo(() => {
    if (!user) return null;
    const riskScore  = user.riskScore    ?? 10;
    const fraudCount = user.fraudEvents?.length ?? 0;
    const badge      = getBadge(riskScore, fraudCount);
    // Find position in sorted list by matching badge + approximate score
    const idx = SORTED_DATA.findIndex((u) => u.badge === badge && u.riskScore >= riskScore - 5);
    return idx !== -1 ? idx + 1 : SORTED_DATA.length;
  }, [user]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return SORTED_DATA.filter((u) => {
      const matchSearch = !q || u.name.toLowerCase().includes(q) || u.city.toLowerCase().includes(q) || u.platform.toLowerCase().includes(q);
      const matchBadge  = filterBadge === 'All' || u.badge === filterBadge;
      return matchSearch && matchBadge;
    });
  }, [search, filterBadge]);

  const userRiskScore  = user?.riskScore    ?? 10;
  const userFraudCount = user?.fraudEvents?.length ?? 0;
  const userBadge      = getBadge(userRiskScore, userFraudCount);
  const userMeta       = BADGE_META[userBadge];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Loyalty Leaderboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Workers ranked by loyalty badge and fraud risk score.
          </p>
        </div>
        <div className={`flex items-center gap-2 ${userMeta.lightBg} border ${userMeta.border} rounded-2xl px-4 py-2.5`}>
          <span className="text-lg">{userMeta.icon}</span>
          <div>
            <p className={`text-xs font-bold ${userMeta.text}`}>Your Rank</p>
            <p className="text-lg font-extrabold text-gray-800">#{currentUserRank}</p>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Workers',   value: SORTED_DATA.length, icon: Users,       color: 'text-blue-600',   bg: 'bg-blue-50'   },
          { label: 'Diamond Members', value: DIAMOND_COUNT,      icon: Trophy,      color: 'text-blue-700',   bg: 'bg-blue-50'   },
          { label: 'Gold Members',    value: GOLD_COUNT,         icon: Trophy,      color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Silver Members',  value: SILVER_COUNT,       icon: ShieldCheck, color: 'text-slate-600',  bg: 'bg-slate-50'  },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
              <Icon size={16} className={color} />
            </div>
            <div>
              <p className="text-xs text-gray-400">{label}</p>
              <p className={`text-xl font-bold ${color}`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Podium — top 3 */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
        <p className="text-sm font-bold text-gray-700 mb-6 text-center">Top 3 Members</p>
        <div className="flex items-end justify-center gap-4">
          {[SORTED_DATA[1], SORTED_DATA[0], SORTED_DATA[2]].map((entry, i) => (
            <PodiumCard key={entry.id} entry={entry} position={[2, 1, 3][i]} />
          ))}
        </div>
      </div>

      {/* Your position card */}
      {user && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-gradient-to-r ${userMeta.gradient} rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm`}
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-white/20 ring-2 ring-white/40 flex items-center justify-center text-white font-bold text-lg">
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-white font-bold text-sm">{user.name} (You)</p>
              <p className="text-white/70 text-xs">{user.deliveryPlatform} · {user.city}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-white/70 text-xs">Risk Score</p>
              <p className="text-white font-bold">{userRiskScore}</p>
            </div>
            <div className="text-center">
              <p className="text-white/70 text-xs">Badge</p>
              <p className="text-white font-bold">{userBadge}</p>
            </div>
            <div className="text-center">
              <p className="text-white/70 text-xs">Rank</p>
              <p className="text-white font-extrabold text-lg">#{currentUserRank}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">

        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-gray-100">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, city, or platform..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <SlidersHorizontal size={14} className="text-gray-400" />
            {['All', 'Diamond', 'Gold', 'Silver'].map((b) => (
              <button
                key={b}
                onClick={() => setFilterBadge(b)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                  filterBadge === b
                    ? b === 'All'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : `${BADGE_META[b]?.lightBg} ${BADGE_META[b]?.border} ${BADGE_META[b]?.text}`
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                {b === 'All' ? 'All' : `${BADGE_META[b].icon} ${b}`}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Rank', 'Worker', 'Platform', 'City', 'Badge', 'Risk Score', 'Fraud Events', 'Claims', 'Total Payouts'].map((h) => (
                  <th key={h} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap ${
                    ['Risk Score', 'Fraud Events', 'Claims', 'Total Payouts'].includes(h) ? 'text-right' : 'text-left'
                  }`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-10 text-sm text-gray-400">No results found.</td></tr>
              ) : (
                filtered.map((entry, i) => {
                  const meta    = BADGE_META[entry.badge];
                  const isMe    = user && entry.rank === currentUserRank;
                  return (
                    <motion.tr
                      key={entry.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className={`border-b border-gray-50 transition-colors ${
                        isMe
                          ? `${meta.lightBg} border-l-4 border-l-current`
                          : i % 2 === 1 ? 'bg-gray-50/40 hover:bg-blue-50/30' : 'bg-white hover:bg-blue-50/30'
                      }`}
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-center w-8">
                          <RankMedal rank={entry.rank} />
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${meta.gradient} flex items-center justify-center text-white font-bold text-xs shrink-0`}>
                            {entry.name[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">
                              {entry.name}{isMe && <span className="ml-1.5 text-xs font-bold text-blue-600">(You)</span>}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">{entry.platform}</span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-500">{entry.city}</td>
                      <td className="px-4 py-3.5"><BadgePill badge={entry.badge} /></td>
                      <td className="px-4 py-3.5 text-right">
                        <span className={`font-bold text-sm ${
                          entry.riskScore < 20 ? 'text-green-600'
                          : entry.riskScore < 40 ? 'text-yellow-600'
                          : entry.riskScore < 60 ? 'text-orange-500'
                          : 'text-red-600'
                        }`}>{entry.riskScore}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className={`font-semibold text-sm ${entry.fraudCount === 0 ? 'text-green-600' : entry.fraudCount <= 2 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {entry.fraudCount}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right text-gray-600 font-medium">{entry.claims}</td>
                      <td className="px-4 py-3.5 text-right font-semibold text-blue-600">
                        ₹{entry.payouts.toLocaleString('en-IN')}
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="sm:hidden divide-y divide-gray-100">
          {filtered.map((entry, i) => {
            const meta = BADGE_META[entry.badge];
            const isMe = user && entry.rank === currentUserRank;
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`p-4 ${isMe ? meta.lightBg : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <RankMedal rank={entry.rank} />
                    <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${meta.gradient} flex items-center justify-center text-white font-bold`}>
                      {entry.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{entry.name}{isMe && <span className="ml-1 text-xs text-blue-600">(You)</span>}</p>
                      <p className="text-xs text-gray-400">{entry.platform} · {entry.city}</p>
                    </div>
                  </div>
                  <BadgePill badge={entry.badge} />
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div className="bg-gray-50 rounded-lg py-1.5 text-center">
                    <p className="text-xs text-gray-400">Risk</p>
                    <p className="text-sm font-bold text-gray-700">{entry.riskScore}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg py-1.5 text-center">
                    <p className="text-xs text-gray-400">Fraud</p>
                    <p className="text-sm font-bold text-gray-700">{entry.fraudCount}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg py-1.5 text-center">
                    <p className="text-xs text-gray-400">Payouts</p>
                    <p className="text-sm font-bold text-blue-600">₹{(entry.payouts / 1000).toFixed(1)}k</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer count */}
        <div className="px-4 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">Showing {filtered.length} of {SORTED_DATA.length} workers</p>
        </div>
      </div>
    </div>
  );
}
