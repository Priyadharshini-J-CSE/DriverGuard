import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line, CartesianGrid, AreaChart, Area,
} from 'recharts';
import {
  BarChart2, PieChart as PieIcon, TrendingUp, ShieldCheck,
  AlertTriangle, ShieldAlert, Zap, Clock, ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { simulateFraud } from '../services/authService';

/* ── Static chart data ──────────────────────────────────── */

const DISRUPTION_FREQ = [
  { type: 'Heavy Rain',           count: 84 },
  { type: 'Traffic Congestion',   count: 61 },
  { type: 'Environmental Issues', count: 37 },
  { type: 'Govt. Restrictions',   count: 22 },
  { type: 'Strikes / Bandh',      count: 18 },
];

const PAYOUT_DIST = [
  { name: 'Weather-related', value: 42 },
  { name: 'Traffic-related', value: 28 },
  { name: 'Environmental',   value: 18 },
  { name: 'Other',           value: 12 },
];

const MONTHLY_TREND = [
  { month: 'Jan', disruptions: 18 }, { month: 'Feb', disruptions: 24 },
  { month: 'Mar', disruptions: 31 }, { month: 'Apr', disruptions: 27 },
  { month: 'May', disruptions: 42 }, { month: 'Jun', disruptions: 38 },
  { month: 'Jul', disruptions: 55 }, { month: 'Aug', disruptions: 49 },
  { month: 'Sep', disruptions: 33 }, { month: 'Oct', disruptions: 28 },
  { month: 'Nov', disruptions: 21 }, { month: 'Dec', disruptions: 16 },
];

const INCOME_VS_PAYOUT = [
  { month: 'Jul', protected: 182000, payouts: 34000 },
  { month: 'Aug', protected: 196000, payouts: 41000 },
  { month: 'Sep', protected: 174000, payouts: 28000 },
  { month: 'Oct', protected: 210000, payouts: 37000 },
  { month: 'Nov', protected: 188000, payouts: 31000 },
  { month: 'Dec', protected: 224000, payouts: 44000 },
];

const PIE_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#94a3b8'];

/* ── Risk score helpers ─────────────────────────────────── */

const getRiskMeta = (score) => {
  if (score >= 75) return { label: 'Critical', color: '#ef4444', bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-600',    ring: '#ef4444' };
  if (score >= 50) return { label: 'High',     color: '#f97316', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600', ring: '#f97316' };
  if (score >= 25) return { label: 'Medium',   color: '#f59e0b', bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-600', ring: '#f59e0b' };
  return             { label: 'Low',      color: '#10b981', bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-600',  ring: '#10b981' };
};

const SEVERITY_STYLES = {
  Critical: 'bg-red-100 text-red-700 border-red-200',
  High:     'bg-orange-100 text-orange-700 border-orange-200',
  Medium:   'bg-yellow-100 text-yellow-700 border-yellow-200',
  Low:      'bg-blue-100 text-blue-700 border-blue-200',
};

const fmtTime = (iso) => new Date(iso).toLocaleString('en-IN', {
  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
});

/* ── Gauge SVG ──────────────────────────────────────────── */

function ScoreGauge({ score }) {
  const meta   = getRiskMeta(score);
  const radius = 70;
  const cx     = 90;
  const cy     = 90;
  // Half-circle arc: from 180° to 0° (left to right)
  const pct    = score / 100;
  const angle  = Math.PI * pct;           // 0 → π
  const startX = cx - radius;             // leftmost point
  const startY = cy;
  const endX   = cx + Math.cos(Math.PI - angle) * radius;
  const endY   = cy - Math.sin(angle) * radius;
  const largeArc = pct > 0.5 ? 1 : 0;

  // Background arc (full half-circle)
  const bgPath = `M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`;
  // Score arc
  const scorePath = score === 0
    ? ''
    : `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}`;

  return (
    <svg viewBox="0 0 180 100" className="w-full max-w-[220px] mx-auto">
      {/* Track */}
      <path d={bgPath} fill="none" stroke="#f1f5f9" strokeWidth="14" strokeLinecap="round" />
      {/* Score arc */}
      {score > 0 && (
        <motion.path
          d={scorePath}
          fill="none"
          stroke={meta.color}
          strokeWidth="14"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      )}
      {/* Score text */}
      <text x={cx} y={cy - 8} textAnchor="middle" fontSize="26" fontWeight="800" fill={meta.color}>
        {score}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="10" fill="#94a3b8">
        out of 100
      </text>
      {/* Labels */}
      <text x={cx - radius + 2} y={cy + 18} fontSize="9" fill="#94a3b8">0</text>
      <text x={cx + radius - 10} y={cy + 18} fontSize="9" fill="#94a3b8">100</text>
    </svg>
  );
}

/* ── Shared chart helpers ───────────────────────────────── */

const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 shadow-lg rounded-xl px-3 py-2 text-xs">
      {label && <p className="font-semibold text-gray-600 mb-1">{label}</p>}
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.name}: {formatter ? formatter(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

const tickStyle  = { fontSize: 11, fill: '#94a3b8' };
const gridProps  = { strokeDasharray: '3 3', stroke: '#f1f5f9', vertical: false };

function SummaryCard({ title, value, desc, icon: Icon, accent, bg, border }, i) {
  return (
    <motion.div
      key={title}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.07 }}
      className={`bg-white rounded-2xl border ${border} shadow-sm p-5 flex items-start gap-4`}
    >
      <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
        <Icon size={20} className={accent} />
      </div>
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">{title}</p>
        <p className={`text-2xl font-bold ${accent}`}>{value}</p>
        <p className="text-xs text-gray-400 mt-0.5 leading-snug">{desc}</p>
      </div>
    </motion.div>
  );
}

function Section({ title, description, insight, icon: Icon, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
          <Icon size={17} className="text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">{title}</p>
          <p className="text-xs text-gray-400 mt-0.5 leading-snug">{description}</p>
        </div>
      </div>
      <div>{children}</div>
      <div className="flex items-start gap-2 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
        <p className="text-xs text-gray-500 leading-relaxed">{insight}</p>
      </div>
    </motion.div>
  );
}

/* ── Page ───────────────────────────────────────────────── */

export default function Analytics() {
  const { user, updateUser } = useAuth();

  const score       = user?.riskScore    ?? 10;
  const fraudEvents = user?.fraudEvents  ?? [];
  const meta        = getRiskMeta(score);

  // Derive personal stats from mock claims
  const totalClaims    = 10;
  const paidClaims     = 5; // CLM001,002,004,007 paid + using fixed counts
  const totalReceived  = 4300; // sum of paid claimAmounts: 1000+650+750+900+1000
  const pendingClaims  = 2;

  // Build score history from fraud events (most recent last for chart)
  const scoreHistory = [
    { label: 'Start', score: user?.riskScore
        ? fraudEvents.length
          ? fraudEvents[fraudEvents.length - 1]?.scoreBefore ?? score
          : score
        : score },
    ...([...fraudEvents].reverse().map((e, i) => ({
      label: `Event ${i + 1}`,
      score: e.scoreAfter,
    }))),
  ];

  const [simulating, setSimulating] = useState(false);
  const [lastEvent,  setLastEvent]  = useState(null);

  const handleSimulate = useCallback(() => {
    setSimulating(true);
    setTimeout(() => {
      const updated = simulateFraud();
      if (updated) {
        updateUser({ riskScore: updated.riskScore, fraudEvents: updated.fraudEvents });
        setLastEvent(updated.fraudEvents[0]);
      }
      setSimulating(false);
    }, 900);
  }, [updateUser]);

  // Auto-dismiss last event toast
  useEffect(() => {
    if (!lastEvent) return;
    const t = setTimeout(() => setLastEvent(null), 4000);
    return () => clearTimeout(t);
  }, [lastEvent]);

  const SUMMARY_CARDS = [
    {
      title: 'My Total Claims', value: totalClaims,
      desc: `${paidClaims} paid · ${pendingClaims} pending`,
      icon: AlertTriangle, accent: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100',
    },
    {
      title: 'Total Received', value: `₹${totalReceived.toLocaleString('en-IN')}`,
      desc: 'Payouts credited to your account',
      icon: TrendingUp, accent: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100',
    },
    {
      title: 'Active Plan', value: 'Basic',
      desc: 'Coverage: ₹500/day · ₹15/week',
      icon: ShieldCheck, accent: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100',
    },

  ];

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-gray-800">Risk Analytics</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Real-time insights into disruptions, payouts, and your personal fraud risk score.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {SUMMARY_CARDS.map((card, i) => SummaryCard(card, i))}
      </div>

      {/* ── Personal Risk Score Panel ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${meta.border}`}
      >
        {/* Header bar */}
        <div className={`px-6 py-3 flex items-center justify-between ${meta.bg} border-b ${meta.border}`}>
          <div className="flex items-center gap-2">
            <ShieldAlert size={16} className={meta.text} />
            <p className={`text-sm font-bold ${meta.text}`}>Personal Fraud Risk Score</p>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${SEVERITY_STYLES[meta.label] ?? SEVERITY_STYLES.Low}`}>
            {meta.label} Risk
          </span>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Gauge + score */}
          <div className="flex flex-col items-center justify-center gap-3">
            <ScoreGauge score={score} />

            {/* Risk band legend */}
            <div className="flex gap-2 flex-wrap justify-center">
              {[
                { label: 'Low',      range: '0–24',  color: 'bg-green-400'  },
                { label: 'Medium',   range: '25–49', color: 'bg-yellow-400' },
                { label: 'High',     range: '50–74', color: 'bg-orange-400' },
                { label: 'Critical', range: '75+',   color: 'bg-red-500'    },
              ].map((b) => (
                <div key={b.label} className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${b.color}`} />
                  <span className="text-xs text-gray-400">{b.label} ({b.range})</span>
                </div>
              ))}
            </div>

            {/* Simulate button */}
            <button
              onClick={handleSimulate}
              disabled={simulating || score >= 100}
              className="mt-1 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {simulating ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Simulating…
                </>
              ) : (
                <>
                  <Zap size={14} />
                  Simulate Fraud Event
                </>
              )}
            </button>
            <p className="text-xs text-gray-400 text-center leading-snug">
              Each fraud event raises your score.<br />Different users start at different base scores.
            </p>
          </div>

          {/* Score history chart */}
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-gray-700">Score History</p>
            {scoreHistory.length < 2 ? (
              <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-xl h-40">
                <p className="text-xs text-gray-400">Simulate a fraud event to see score changes</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={scoreHistory} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={meta.color} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={meta.color} stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="label" tick={{ ...tickStyle, fontSize: 9 }} />
                  <YAxis domain={[0, 100]} tick={tickStyle} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="score"
                    name="Risk Score"
                    stroke={meta.color}
                    strokeWidth={2.5}
                    fill="url(#riskGrad)"
                    dot={{ r: 4, fill: meta.color, strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Fraud event log */}
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-gray-700">
              Fraud Event Log
              {fraudEvents.length > 0 && (
                <span className="ml-2 text-xs font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                  {fraudEvents.length}
                </span>
              )}
            </p>

            {fraudEvents.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 rounded-xl h-40 gap-2">
                <ShieldCheck size={22} className="text-green-400" />
                <p className="text-xs text-gray-400 text-center">No fraud events recorded.<br />Your account is clean.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                <AnimatePresence>
                  {fraudEvents.map((e, i) => (
                    <motion.div
                      key={e.date}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-start gap-2.5 bg-gray-50 border border-gray-100 rounded-xl p-3"
                    >
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                        e.severity === 'Critical' ? 'bg-red-500'
                        : e.severity === 'High'   ? 'bg-orange-500'
                        : e.severity === 'Medium' ? 'bg-yellow-500'
                        : 'bg-blue-400'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-semibold text-gray-700 truncate">{e.type}</p>
                          <span className={`text-xs font-bold px-1.5 py-0.5 rounded border shrink-0 ${SEVERITY_STYLES[e.severity]}`}>
                            +{e.impact}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Clock size={10} className="text-gray-300" />
                          <p className="text-xs text-gray-400">{fmtTime(e.date)}</p>
                          <ChevronRight size={10} className="text-gray-300" />
                          <p className="text-xs text-gray-500 font-medium">{e.scoreBefore} → {e.scoreAfter}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Fraud event toast */}
      <AnimatePresence>
        {lastEvent && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{    opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 bg-white border border-red-200 shadow-xl rounded-2xl px-5 py-4 flex items-start gap-3 max-w-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
              <ShieldAlert size={18} className="text-red-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">Fraud Event Detected</p>
              <p className="text-xs text-gray-500 mt-0.5">{lastEvent.type}</p>
              <p className="text-xs font-semibold text-red-600 mt-1">
                Risk score: {lastEvent.scoreBefore} → {lastEvent.scoreAfter} (+{lastEvent.impact})
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Charts 2×2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        <Section
          title="Disruption Frequency by Type"
          description="How often each disruption type occurs across monitored zones."
          insight="Frequent disruptions indicate higher risk zones and help adjust pricing dynamically."
          icon={BarChart2}
          delay={0.15}
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={DISRUPTION_FREQ} barSize={28} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="type" tick={{ ...tickStyle, fontSize: 10 }} interval={0} />
              <YAxis tick={tickStyle} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Disruptions" radius={[5, 5, 0, 0]}>
                {DISRUPTION_FREQ.map((_, i) => (
                  <Cell key={i} fill={['#3b82f6','#f59e0b','#10b981','#8b5cf6','#ef4444'][i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Section>

        <Section
          title="Payout Distribution by Cause"
          description="How payouts are distributed based on disruption causes."
          insight="Helps identify which factors contribute most to compensation costs."
          icon={PieIcon}
          delay={0.2}
        >
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={PAYOUT_DIST} dataKey="value" nameKey="name"
                cx="50%" cy="46%" outerRadius={78} innerRadius={38} paddingAngle={3}>
                {PAYOUT_DIST.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0];
                return (
                  <div className="bg-white border border-gray-100 shadow-lg rounded-xl px-3 py-2 text-xs">
                    <p className="font-semibold text-gray-700">{d.name}</p>
                    <p style={{ color: d.payload.fill }} className="font-medium">{d.value}%</p>
                  </div>
                );
              }} />
              <Legend iconType="circle" iconSize={8}
                formatter={(v) => <span className="text-xs text-gray-500">{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </Section>

        <Section
          title="Monthly Disruption Trend"
          description="Tracks disruption patterns across all 12 months."
          insight="Useful for predicting high-risk periods and improving system preparedness."
          icon={TrendingUp}
          delay={0.25}
        >
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={MONTHLY_TREND} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="month" tick={tickStyle} />
              <YAxis tick={tickStyle} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="disruptions" name="Disruptions"
                stroke="#3b82f6" strokeWidth={2.5}
                dot={{ r: 3.5, fill: '#3b82f6', strokeWidth: 0 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </Section>

        <Section
          title="Income Protection vs Payouts"
          description="Compares total insured income against payouts made each month."
          insight="Ensures the system remains financially balanced and sustainable."
          icon={ShieldCheck}
          delay={0.3}
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={INCOME_VS_PAYOUT} barSize={18} barGap={4} margin={{ top: 4, right: 8, left: -4, bottom: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="month" tick={tickStyle} />
              <YAxis tick={tickStyle} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip formatter={(v) => `₹${Number(v).toLocaleString('en-IN')}`} />} />
              <Legend iconType="circle" iconSize={8}
                formatter={(v) => <span className="text-xs text-gray-500">{v}</span>} />
              <Bar dataKey="protected" name="Protected Income" fill="#3b82f6" radius={[4,4,0,0]} />
              <Bar dataKey="payouts"   name="Payouts"          fill="#10b981" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Section>

      </div>
    </div>
  );
}
