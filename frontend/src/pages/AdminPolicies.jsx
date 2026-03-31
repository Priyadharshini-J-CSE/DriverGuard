import { useEffect, useState } from 'react';
import api from '../services/api';
import { formatCurrency, formatDate, getStatusBadge } from '../utils/helpers';

const PREMIUM_FILTERS = [
  { label: 'All',                   value: 'all' },
  { label: 'Basic (5% of income)',  value: '5'   },
  { label: 'Standard (8% of income)', value: '8' },
  { label: 'Premium (10% of income)', value: '10' },
];

function StatusBadge({ status }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusBadge(status)}`}>
      {status}
    </span>
  );
}

export default function AdminPolicies() {
  const [policies, setPolicies]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [premiumFilter, setPremiumFilter] = useState('all');

  useEffect(() => {
    api.get('/admin/policies')
      .then((r) => setPolicies(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const blockPolicy = async (id) => {
    try {
      await api.patch(`/admin/policies/${id}`);
      setPolicies((prev) => prev.map((p) => (p._id === id ? { ...p, status: 'blocked' } : p)));
    } catch {
      alert('Failed to block policy');
    }
  };

  const unblockPolicy = async (id) => {
    try {
      await api.patch(`/admin/policies/${id}/unblock`);
      setPolicies((prev) => prev.map((p) => (p._id === id ? { ...p, status: 'active' } : p)));
    } catch {
      alert('Failed to unblock policy');
    }
  };

  const filtered = policies
    .filter((p) => p.status === 'active' || p.status === 'blocked')
    .filter((p) => premiumFilter === 'all' || String(p.premiumPct ?? p.weeklyPremium) === premiumFilter);

  return (
    <div className="card overflow-x-auto">
      {/* Filter bar */}
      <div className="flex justify-end mb-4">
        <select
          value={premiumFilter}
          onChange={(e) => setPremiumFilter(e.target.value)}
          className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5 text-sm
                     bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300
                     focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          {PREMIUM_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-center text-gray-400 py-8">Loading...</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100 dark:border-gray-800">
              <th className="pb-3 pr-4">Worker</th>
              <th className="pb-3 pr-4">Plan</th>
              <th className="pb-3 pr-4">Premium</th>
              <th className="pb-3 pr-4">Coverage</th>
              <th className="pb-3 pr-4">Start Date</th>
              <th className="pb-3 pr-4">Status</th>
              <th className="pb-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p._id} className="border-b border-gray-50 dark:border-gray-800 last:border-0">
                <td className="py-3 pr-4">
                  {p.userId?.name || '—'}
                  <br />
                  <span className="text-xs text-gray-400">{p.userId?.city}</span>
                </td>
                <td className="py-3 pr-4 capitalize font-medium">{p.planType}</td>
                <td className="py-3 pr-4">{p.premiumPct ?? p.weeklyPremium}% of income</td>
                <td className="py-3 pr-4">{formatCurrency(p.maxWeeklyPayout ?? p.coverageAmount)}</td>
                <td className="py-3 pr-4">{formatDate(p.startDate)}</td>
                <td className="py-3 pr-4">
                  <StatusBadge status={p.status} />
                </td>
                <td className="py-3">
                  {p.status === 'active' && (
                    <button
                      onClick={() => blockPolicy(p._id)}
                      className="text-xs text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded-lg transition-colors"
                    >
                      Block
                    </button>
                  )}
                  {p.status === 'blocked' && (
                    <button
                      onClick={() => unblockPolicy(p._id)}
                      className="text-xs text-white bg-green-500 hover:bg-green-600 px-3 py-1 rounded-lg transition-colors"
                    >
                      Unblock
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-gray-400 py-8">No policies found.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
