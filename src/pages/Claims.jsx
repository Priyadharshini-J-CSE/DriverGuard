import { useEffect, useState, useMemo } from 'react';
import { getClaims } from '../services/claimService';
import { formatCurrency, formatDate, getStatusBadge } from '../utils/helpers';
import { motion } from 'framer-motion';
import { Download, Inbox, CloudRain, Thermometer, Wind, TrafficCone, Wallet, CheckCircle, Clock, XCircle, Search } from 'lucide-react';

const DISRUPTION_ICONS = {
  heavy_rain:   { Icon: CloudRain,    label: 'Heavy Rain',    color: 'text-blue-500',   bg: 'bg-blue-50'   },
  extreme_heat: { Icon: Thermometer,  label: 'Extreme Heat',  color: 'text-orange-500', bg: 'bg-orange-50' },
  aqi_hazard:   { Icon: Wind,         label: 'AQI Hazard',    color: 'text-purple-500', bg: 'bg-purple-50' },
  traffic_jam:  { Icon: TrafficCone,  label: 'Traffic Jam',   color: 'text-yellow-600', bg: 'bg-yellow-50' },
};

const STATUS_META = {
  paid:          { label: 'Paid',          cls: 'bg-blue-50 text-blue-700 border-blue-200',     dot: 'bg-blue-500'   },
  approved:      { label: 'Approved',      cls: 'bg-green-50 text-green-700 border-green-200',   dot: 'bg-green-500'  },
  pending:       { label: 'Pending',       cls: 'bg-yellow-50 text-yellow-700 border-yellow-200',dot: 'bg-yellow-500' },
  investigating: { label: 'Investigating', cls: 'bg-purple-50 text-purple-700 border-purple-200',dot: 'bg-purple-500' },
  rejected:      { label: 'Rejected',      cls: 'bg-red-50 text-red-600 border-red-200',         dot: 'bg-red-500'    },
};

function StatusBadge({ status }) {
  const m = STATUS_META[status] ?? { label: status, cls: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${m.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

export default function Claims() {
  const [claims,   setClaims]   = useState([]);
  const [filter,   setFilter]   = useState('all');
  const [search,   setSearch]   = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo,   setDateTo]   = useState('');
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    getClaims().then((r) => setClaims(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => claims.filter((c) => {
    const q = search.toLowerCase();
    const matchStatus = filter === 'all' || c.status === filter;
    const matchSearch = !q ||
      c.disruptionType?.replace(/_/g, ' ').includes(q) ||
      c._id?.toLowerCase().includes(q) ||
      c.location?.city?.toLowerCase().includes(q);
    const matchFrom = !dateFrom || new Date(c.createdAt) >= new Date(dateFrom);
    const matchTo   = !dateTo   || new Date(c.createdAt) <= new Date(dateTo + 'T23:59:59');
    return matchStatus && matchSearch && matchFrom && matchTo;
  }), [claims, filter, search, dateFrom, dateTo]);

  const totalAmount = filtered.reduce((s, c) => s + c.claimAmount, 0);
  const paidCount   = claims.filter((c) => c.status === 'paid').length;
  const pendingCount= claims.filter((c) => c.status === 'pending').length;
  const totalPaid   = claims.filter((c) => c.status === 'paid').reduce((s, c) => s + c.claimAmount, 0);

  const exportCSV = () => {
    const header = 'Claim ID,Date,Disruption Type,Location,Income Loss,Claim Amount,Status';
    const rows   = filtered.map((c) =>
      `${c._id},${formatDate(c.createdAt)},${c.disruptionType},${c.location?.city || ''},${c.incomeLoss},${c.claimAmount},${c.status}`
    );
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
    const a    = document.createElement('a');
    a.href     = URL.createObjectURL(blob);
    a.download = 'claims-report.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="space-y-5">

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Claims',   value: claims.length,          icon: Wallet,       color: 'text-blue-600',   bg: 'bg-blue-50'   },
          { label: 'Total Paid Out', value: formatCurrency(totalPaid), icon: CheckCircle,color: 'text-green-600',  bg: 'bg-green-50'  },
          { label: 'Paid Claims',    value: paidCount,              icon: CheckCircle,  color: 'text-green-600',  bg: 'bg-green-50'  },
          { label: 'Pending',        value: pendingCount,           icon: Clock,        color: 'text-yellow-600', bg: 'bg-yellow-50' },
        ].map(({ label, value, icon: Icon, color, bg }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm flex items-center gap-3"
          >
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
              <Icon size={16} className={color} />
            </div>
            <div>
              <p className="text-xs text-gray-400">{label}</p>
              <p className={`text-lg font-bold ${color}`}>{value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-48">
            <label className="text-xs text-gray-400 font-medium mb-1 block">Search</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="input pl-9"
                placeholder="Search by type, ID, city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 font-medium mb-1 block">Status</label>
            <select className="input" value={filter} onChange={(e) => setFilter(e.target.value)}>
              {['all', 'pending', 'approved', 'paid', 'rejected', 'investigating'].map((s) => (
                <option key={s} value={s}>{s === 'all' ? 'All' : STATUS_META[s]?.label ?? s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 font-medium mb-1 block">From</label>
            <input className="input" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-400 font-medium mb-1 block">To</label>
            <input className="input" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Count + total */}
      <div className="flex items-center gap-2 text-sm text-gray-500 px-1">
        <span className="font-semibold text-gray-700">{filtered.length} claims</span>
        <span className="text-gray-300">·</span>
        <span>Total: <span className="font-semibold text-gray-800">{formatCurrency(totalAmount)}</span></span>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Inbox size={36} className="text-gray-300" />
            <p className="text-sm text-gray-400 font-medium">No claims found</p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Claim ID', 'Date', 'Disruption', 'Location', 'Income Loss', 'Claim Amount', 'Status'].map((h) => (
                      <th key={h} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap ${
                        ['Income Loss', 'Claim Amount'].includes(h) ? 'text-right' : 'text-left'
                      }`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, i) => {
                    const d = DISRUPTION_ICONS[c.disruptionType] ?? { Icon: Wind, label: c.disruptionType, color: 'text-gray-500', bg: 'bg-gray-50' };
                    return (
                      <motion.tr
                        key={c._id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className={`border-b border-gray-50 transition-colors ${i % 2 === 1 ? 'bg-gray-50/40' : 'bg-white'}`}
                      >
                        <td className="px-4 py-3.5 font-mono text-xs font-semibold text-gray-400">{c._id}</td>
                        <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">{formatDate(c.createdAt)}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-lg ${d.bg} flex items-center justify-center shrink-0`}>
                              <d.Icon size={13} className={d.color} />
                            </div>
                            <span className="text-gray-700 font-medium capitalize">{d.label}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-gray-600">{c.location?.city || '—'}</td>
                        <td className="px-4 py-3.5 text-right text-gray-600">{formatCurrency(c.incomeLoss)}</td>
                        <td className="px-4 py-3.5 text-right font-bold text-blue-600">{formatCurrency(c.claimAmount)}</td>
                        <td className="px-4 py-3.5"><StatusBadge status={c.status} /></td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-gray-100">
              {filtered.map((c, i) => {
                const d = DISRUPTION_ICONS[c.disruptionType] ?? { Icon: Wind, label: c.disruptionType, color: 'text-gray-500', bg: 'bg-gray-50' };
                return (
                  <motion.div
                    key={c._id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => navigate(`/claims/${c._id}`)}
                    className="p-4 space-y-2.5 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg ${d.bg} flex items-center justify-center`}>
                          <d.Icon size={14} className={d.color} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{d.label}</p>
                          <p className="text-xs text-gray-400">{c.location?.city} · {formatDate(c.createdAt)}</p>
                        </div>
                      </div>
                      <StatusBadge status={c.status} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-gray-50 rounded-xl px-3 py-2">
                        <p className="text-xs text-gray-400">Income Loss</p>
                        <p className="text-sm font-semibold text-gray-700">{formatCurrency(c.incomeLoss)}</p>
                      </div>
                      <div className="bg-blue-50 rounded-xl px-3 py-2">
                        <p className="text-xs text-gray-400">Claim Amount</p>
                        <p className="text-sm font-bold text-blue-600">{formatCurrency(c.claimAmount)}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
