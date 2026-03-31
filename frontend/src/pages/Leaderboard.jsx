import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Trophy, Medal, Star, Crown } from 'lucide-react';

const TIER_STYLES = {
  Diamond: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600', border: 'border-blue-300', icon: '💎' },
  Gold:    { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-600', border: 'border-yellow-300', icon: '🥇' },
  Silver:  { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-500', border: 'border-gray-300', icon: '🥈' },
};

const MEDAL_CONFIG = [
  { rank: 1, color: 'from-yellow-400 to-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-300', size: 'scale-110', icon: <Crown size={20} className="text-yellow-600" /> },
  { rank: 2, color: 'from-gray-300 to-gray-500',     bg: 'bg-gray-50 dark:bg-gray-800',         border: 'border-gray-300',   size: '',          icon: <Medal size={20} className="text-gray-500" /> },
  { rank: 3, color: 'from-orange-400 to-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-300', size: '',          icon: <Medal size={20} className="text-orange-500" /> },
];

function TierBadge({ tier }) {
  const s = TIER_STYLES[tier] || TIER_STYLES.Silver;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      {s.icon} {tier}
    </span>
  );
}

export default function Leaderboard() {
  const { user } = useAuth();
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/user/leaderboard')
      .then((r) => setBoard(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const myRank = board.findIndex((u) => u.name === user?.name) + 1;
  const myEntry = board.find((u) => u.name === user?.name);
  const top3 = board.slice(0, 3);
  const rest = board.slice(3);

  if (loading) return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => <div key={i} className="card h-36 animate-pulse bg-gray-100 dark:bg-gray-800" />)}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Your Rank card */}
      {myEntry && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="card bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm text-blue-100">Your Ranking</p>
              <p className="text-xl font-bold">{user?.name}</p>
              <TierBadge tier={myEntry.tier || 'Silver'} />
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">#{myRank || '—'}</p>
            <p className="text-sm text-blue-100">{myEntry.loyaltyPoints || 0} pts</p>
          </div>
        </motion.div>
      )}

      {/* Top 3 podium */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {top3.map((u, i) => {
          const cfg = MEDAL_CONFIG[i];
          const tier = TIER_STYLES[u.tier] || TIER_STYLES.Silver;
          return (
            <motion.div key={u._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`card border-2 ${cfg.border} ${cfg.bg} ${cfg.size} flex flex-col items-center gap-3 py-6 transition-transform`}>
              <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${cfg.color} flex items-center justify-center text-white text-xl font-bold shadow-md`}>
                {u.name?.[0]?.toUpperCase()}
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-800 dark:text-gray-100">{u.name}</p>
                <p className="text-xs text-gray-500">{u.city || '—'}</p>
              </div>
              <TierBadge tier={u.tier || 'Silver'} />
              <div className="flex items-center gap-1.5">
                {cfg.icon}
                <span className="font-bold text-lg text-gray-800 dark:text-gray-100">{u.loyaltyPoints || 0}</span>
                <span className="text-xs text-gray-500">pts</span>
              </div>
              <span className={`text-2xl font-black bg-gradient-to-br ${cfg.color} bg-clip-text text-transparent`}>
                #{cfg.rank}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Ranked list */}
      {rest.length > 0 && (
        <div className="card overflow-x-auto">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4 flex items-center gap-2">
            <Trophy size={14} /> Full Rankings
          </h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100 dark:border-gray-800">
                <th className="pb-3 pr-4">Rank</th>
                <th className="pb-3 pr-4">Worker</th>
                <th className="pb-3 pr-4">Tier</th>
                <th className="pb-3 pr-4">Points</th>
                <th className="pb-3">Risk Score</th>
              </tr>
            </thead>
            <tbody>
              {rest.map((u, i) => (
                <motion.tr key={u._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className={`border-b border-gray-50 dark:border-gray-800 last:border-0 ${u.name === user?.name ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}>
                  <td className="py-3 pr-4 font-bold text-gray-400">#{i + 4}</td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-600">
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.city || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4"><TierBadge tier={u.tier || 'Silver'} /></td>
                  <td className="py-3 pr-4 font-semibold">{u.loyaltyPoints || 0}</td>
                  <td className="py-3 text-gray-500">{u.riskScore ?? 0}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {board.length === 0 && (
        <div className="card text-center py-12 text-gray-400">
          <Star size={32} className="mx-auto mb-2 opacity-30" />
          <p>No leaderboard data yet. Pay your first premium to earn points!</p>
        </div>
      )}
    </div>
  );
}
