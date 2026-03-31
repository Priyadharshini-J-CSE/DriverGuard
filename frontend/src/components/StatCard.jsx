import { motion } from 'framer-motion';

export default function StatCard({ title, value, icon: Icon, color = 'blue', subtitle, risk = false }) {
  const colors = {
    blue:   'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
    green:  'bg-green-50 dark:bg-green-900/20 text-green-600',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600',
    red:    'bg-red-50 dark:bg-red-900/20 text-red-600',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card flex items-center gap-4 transition-all duration-300 relative overflow-hidden ${
        risk
          ? 'border-2 border-red-500 bg-red-50 dark:bg-red-900/10 shadow-lg shadow-red-500/20'
          : 'border border-transparent'
      }`}
    >
      {/* Pulse ring on risk */}
      {risk && (
        <span className="absolute top-2 right-2 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
        </span>
      )}

      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
        risk ? 'bg-red-100 dark:bg-red-900/30 text-red-600' : colors[color]
      }`}>
        {Icon && <Icon size={22} />}
      </div>

      <div className="min-w-0">
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className={`text-2xl font-bold truncate ${risk ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-100'}`}>
          {value}
        </p>
        {subtitle && (
          <p className={`text-xs mt-0.5 ${risk ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>
            {risk ? `⚠ ${subtitle}` : subtitle}
          </p>
        )}
      </div>
    </motion.div>
  );
}
