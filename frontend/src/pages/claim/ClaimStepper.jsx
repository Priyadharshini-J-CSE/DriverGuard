import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, Activity, ShieldCheck, BadgeCheck, Banknote } from 'lucide-react';

const STEPS = [
  { path: '/claim/detected',     label: 'Alert',    Icon: Bell        },
  { path: '/claim/status',       label: 'Status',   Icon: Activity    },
  { path: '/claim/verification', label: 'Verify',   Icon: ShieldCheck },
  { path: '/claim/approval',     label: 'Approval', Icon: BadgeCheck  },
  { path: '/claim/success',      label: 'Paid',     Icon: Banknote    },
];

export default function ClaimStepper() {
  const { pathname } = useLocation();
  const current = STEPS.findIndex((s) => s.path === pathname);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-6 py-4 mb-2">
      <div className="flex items-center justify-between">
        {STEPS.map((step, i) => {
          const done   = i < current;
          const active = i === current;
          return (
            <div key={step.path} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <motion.div
                  initial={{ scale: 0.85 }}
                  animate={{ scale: active ? 1.1 : 1 }}
                  className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                    done
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : active
                      ? 'bg-white border-blue-600 text-blue-600 ring-4 ring-blue-50'
                      : 'bg-gray-50 border-gray-200 text-gray-300'
                  }`}
                >
                  {done
                    ? <span className="text-xs font-bold">✓</span>
                    : <step.Icon size={15} />
                  }
                </motion.div>
                <span className={`text-xs font-semibold hidden sm:block ${
                  active ? 'text-blue-600' : done ? 'text-gray-500' : 'text-gray-300'
                }`}>
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mb-4 rounded-full transition-all ${
                  done ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
