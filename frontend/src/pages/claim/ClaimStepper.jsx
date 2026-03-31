import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const STEPS = [
  { path: '/claim/detected',        label: 'Alert'      },
  { path: '/claim/verify-process',  label: 'Verify'     },
  { path: '/payout-processing',     label: 'Processing' },
  { path: '/payout-success',        label: 'Paid'       },
];

export default function ClaimStepper() {
  const { pathname } = useLocation();
  const current = STEPS.findIndex((s) => pathname.startsWith(s.path));
  const active  = current === -1 ? 0 : current;

  return (
    <div className="flex items-center justify-center gap-0 mb-6">
      {STEPS.map((step, i) => {
        const done   = i < active;
        const isActive = i === active;
        return (
          <div key={step.path} className="flex items-center">
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: isActive ? 1.1 : 1 }}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  done      ? 'bg-blue-600 border-blue-600 text-white' :
                  isActive  ? 'bg-white dark:bg-gray-900 border-blue-600 text-blue-600' :
                              'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400'
                }`}
              >
                {done ? '✓' : i + 1}
              </motion.div>
              <span className={`text-xs mt-1 font-medium ${
                isActive ? 'text-blue-600' : done ? 'text-gray-500' : 'text-gray-300 dark:text-gray-600'
              }`}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-8 h-0.5 mb-4 mx-1 rounded ${done ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
