import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CreditCard, ChevronLeft, ChevronRight, Receipt } from 'lucide-react';

/* ── Dummy Data ─────────────────────────────────────────── */

const PAYMENTS = [
  { id: 'PAY001', platform: 'Zomato', week: 'Mar 1 – Mar 7',   income: 7200, plan: 'Basic', premium: 360, date: 'Mar 2, 2025',  status: 'Active'  },
  { id: 'PAY002', platform: 'Zomato', week: 'Mar 8 – Mar 14',  income: 6800, plan: 'Basic', premium: 340, date: 'Mar 9, 2025',  status: 'Active'  },
  { id: 'PAY003', platform: 'Zomato', week: 'Mar 15 – Mar 21', income: 7500, plan: 'Basic', premium: 375, date: 'Mar 16, 2025', status: 'Active'  },
  { id: 'PAY004', platform: 'Zomato', week: 'Mar 22 – Mar 28', income: 6000, plan: 'Basic', premium: 300, date: 'Mar 23, 2025', status: 'Active'  },
  { id: 'PAY005', platform: 'Zomato', week: 'Mar 29 – Apr 4',  income: 8000, plan: 'Basic', premium: 400, date: 'Mar 30, 2025', status: 'Active'  },
  { id: 'PAY006', platform: 'Zomato', week: 'Feb 22 – Feb 28', income: 5500, plan: 'Basic', premium: 275, date: 'Feb 23, 2025', status: 'Expired' },
  { id: 'PAY007', platform: 'Zomato', week: 'Feb 15 – Feb 21', income: 6200, plan: 'Basic', premium: 310, date: 'Feb 16, 2025', status: 'Expired' },
  { id: 'PAY008', platform: 'Zomato', week: 'Apr 5 – Apr 11',  income: 7100, plan: 'Basic', premium: 355, date: 'Apr 6, 2025',  status: 'Pending' },
];

const PAGE_SIZE = 5;
const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

const STATUS_STYLES = {
  Active:  'bg-green-50 text-green-700 border border-green-200',
  Pending: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  Expired: 'bg-red-50 text-red-600 border border-red-200',
};

const PLAN_STYLES = {
  Basic:    'bg-gray-100 text-gray-600',
  Standard: 'bg-blue-50 text-blue-700',
  Premium:  'bg-purple-50 text-purple-700',
};

const COLUMNS = ['Payment ID', 'Week', 'Platform', 'Weekly Income', 'Plan', 'Premium Paid', 'Payment Date', 'Status'];

/* ── Sub-components ─────────────────────────────────────── */

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[status] ?? STATUS_STYLES.Pending}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'Active' ? 'bg-green-500' : status === 'Pending' ? 'bg-yellow-500' : 'bg-red-500'}`} />
      {status}
    </span>
  );
}

function PlanBadge({ plan }) {
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${PLAN_STYLES[plan] ?? 'bg-gray-100 text-gray-600'}`}>
      {plan}
    </span>
  );
}

function SummaryBar({ data }) {
  const total   = data.reduce((s, p) => s + p.premium, 0);
  const active  = data.filter((p) => p.status === 'Active').length;
  const pending = data.filter((p) => p.status === 'Pending').length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[
        { label: 'Total Payments',   value: data.length,   color: 'text-gray-800' },
        { label: 'Total Premium',    value: fmt(total),    color: 'text-blue-600' },
        { label: 'Active Coverage',  value: active,        color: 'text-green-600' },
        { label: 'Pending',          value: pending,       color: 'text-yellow-600' },
      ].map(({ label, value, color }) => (
        <div key={label} className="bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm">
          <p className="text-xs text-gray-400 mb-0.5">{label}</p>
          <p className={`text-xl font-bold ${color}`}>{value}</p>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ onAction }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
        <CreditCard size={26} className="text-blue-500" />
      </div>
      <div className="text-center">
        <p className="font-semibold text-gray-700 text-base">No payments yet</p>
        <p className="text-sm text-gray-400 mt-1">Upload your salary proof to pay your first weekly premium.</p>
      </div>
      <button
        onClick={onAction}
        className="mt-1 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
      >
        Upload Salary Screenshot
      </button>
    </div>
  );
}

function Pagination({ page, total, pageSize, onChange }) {
  const pages = Math.ceil(total / pageSize);
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-2">
      <p className="text-xs text-gray-400">
        Showing {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} of {total} records
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={14} />
        </button>
        {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
              p === page
                ? 'bg-blue-600 text-white'
                : 'border border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onChange(page + 1)}
          disabled={page === pages}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────── */

export default function InsurancePaymentHistory() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page,   setPage]   = useState(1);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return PAYMENTS.filter((p) =>
      !q || p.id.toLowerCase().includes(q) || p.week.toLowerCase().includes(q)
    );
  }, [search]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Payment History</h1>
          <p className="text-sm text-gray-400 mt-0.5">All weekly premium payments and coverage periods</p>
        </div>
        <button
          onClick={() => navigate('/upload-salary-proof')}
          className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Receipt size={15} />
          Pay Premium
        </button>
      </div>

      {/* Summary bar */}
      <SummaryBar data={PAYMENTS} />

      {PAYMENTS.length === 0 ? (
        <EmptyState onAction={() => navigate('/upload-salary-proof')} />
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">

          {/* Search */}
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by ID or week..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {COLUMNS.map((col) => (
                    <th
                      key={col}
                      className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap ${
                        ['Weekly Income', 'Premium Paid'].includes(col) ? 'text-right' : 'text-left'
                      }`}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="wait">
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-sm text-gray-400">
                        No records match your search or filters.
                      </td>
                    </tr>
                  ) : (
                    paginated.map((p, i) => (
                      <motion.tr
                        key={p.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className={`border-b border-gray-50 hover:bg-blue-50/40 transition-colors ${
                          i % 2 === 1 ? 'bg-gray-50/50' : 'bg-white'
                        }`}
                      >
                        <td className="px-4 py-3.5 font-mono text-xs font-semibold text-gray-500">{p.id}</td>
                        <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{p.week}</td>
                        <td className="px-4 py-3.5">
                          <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                            {p.platform}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right font-semibold text-gray-800">{fmt(p.income)}</td>
                        <td className="px-4 py-3.5"><PlanBadge plan={p.plan} /></td>
                        <td className="px-4 py-3.5 text-right font-bold text-blue-600">{fmt(p.premium)}</td>
                        <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">{p.date}</td>
                        <td className="px-4 py-3.5"><StatusBadge status={p.status} /></td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="sm:hidden divide-y divide-gray-100">
            {paginated.length === 0 ? (
              <p className="text-center py-10 text-sm text-gray-400">No records found.</p>
            ) : (
              paginated.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-mono text-xs font-semibold text-gray-400">{p.id}</p>
                      <p className="text-sm font-semibold text-gray-800 mt-0.5">{p.week}</p>
                      <p className="text-xs text-gray-400">{p.platform} · {p.date}</p>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-gray-50 rounded-xl py-2">
                      <p className="text-xs text-gray-400">Income</p>
                      <p className="text-sm font-semibold text-gray-700">{fmt(p.income)}</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl py-2">
                      <p className="text-xs text-gray-400">Premium</p>
                      <p className="text-sm font-bold text-blue-600">{fmt(p.premium)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl py-2">
                      <p className="text-xs text-gray-400">Plan</p>
                      <p className="text-sm font-semibold text-gray-700">{p.plan}</p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Pagination */}
          <div className="px-4 pb-4 pt-2">
            <Pagination
              page={page}
              total={filtered.length}
              pageSize={PAGE_SIZE}
              onChange={setPage}
            />
          </div>
        </div>
      )}
    </div>
  );
}
