import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Brain, AlertTriangle, UserCheck, ArrowLeft } from 'lucide-react';

const PRIVACY_SECTIONS = [
  {
    icon: <UserCheck size={18} className="text-blue-600" />,
    title: 'Smart Data Collection',
    text: 'We collect essential user information such as <strong>identity, location, and activity data</strong> to enable AI-driven risk assessment and parametric insurance services.',
  },
  {
    icon: <Brain size={18} className="text-violet-600" />,
    title: 'AI-Based Data Usage',
    text: 'User data is processed using <strong>machine learning models</strong> to predict disruptions, calculate micro-premiums, and trigger automated payouts.',
  },
  {
    icon: <Lock size={18} className="text-green-600" />,
    title: 'Secure Data Infrastructure',
    text: 'All data is protected using <strong>advanced encryption and secure cloud infrastructure</strong> to ensure confidentiality and integrity.',
  },
  {
    icon: <ShieldCheck size={18} className="text-amber-600" />,
    title: 'Limited & Purpose-Based Sharing',
    text: 'Data is shared only with <strong>trusted services</strong> (e.g., weather providers) required for parametric triggers, and <strong>never for resale</strong>.',
  },
  {
    icon: <UserCheck size={18} className="text-indigo-600" />,
    title: 'User Transparency & Control',
    text: 'Users can <strong>access, update, or delete</strong> their data at any time through their profile settings.',
  },
];

const TERMS_SECTIONS = [
  {
    icon: <UserCheck size={18} className="text-blue-600" />,
    title: 'Eligibility & Accurate Information',
    text: 'Users must provide <strong>accurate and verifiable information</strong>. Providing false data may result in claim rejection or account suspension.',
  },
  {
    icon: <ShieldCheck size={18} className="text-green-600" />,
    title: 'Policy Activation',
    text: 'Coverage becomes <strong>active only after successful premium payment</strong>. No claims will be processed for periods without active coverage.',
  },
  {
    icon: <Brain size={18} className="text-violet-600" />,
    title: 'Parametric Insurance Mechanism',
    text: 'Payouts are <strong>automatically triggered based on real-time environmental conditions</strong> (rain, AQI, traffic) — no manual claim filing required.',
  },
  {
    icon: <AlertTriangle size={18} className="text-amber-600" />,
    title: 'AI-Based Monitoring & Fraud Prevention',
    text: '<strong>AI systems continuously monitor activity</strong> to detect fraud, ensure fairness, and maintain the integrity of the insurance ecosystem.',
  },
  {
    icon: <Lock size={18} className="text-red-600" />,
    title: 'Account Blocking & Access Control',
    text: 'Accounts may be <strong>blocked for misuse, fraud, or policy violations</strong>. Blocked users will be notified and may contact support for review.',
  },
];

function PolicyCard({ icon, title, text, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="flex gap-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800
                 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm mb-1">{title}</p>
        <p
          className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: text }}
        />
      </div>
    </motion.div>
  );
}

export default function Policies() {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      window.close();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Back button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="flex justify-center mb-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <ShieldCheck size={28} className="text-blue-600" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            Privacy Policy & Terms and Conditions
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            DeliverGuard AI Insurance · Last updated January 2025
          </p>
        </motion.div>

        {/* Privacy Policy */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Lock size={16} className="text-blue-600" />
            <h2 className="text-base font-extrabold text-gray-900 dark:text-white">Privacy Policy</h2>
          </div>
          {PRIVACY_SECTIONS.map((s, i) => (
            <PolicyCard key={s.title} {...s} delay={0.1 + i * 0.05} />
          ))}
        </motion.div>

        {/* Terms & Conditions */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck size={16} className="text-green-600" />
            <h2 className="text-base font-extrabold text-gray-900 dark:text-white">Terms & Conditions</h2>
          </div>
          {TERMS_SECTIONS.map((s, i) => (
            <PolicyCard key={s.title} {...s} delay={0.3 + i * 0.05} />
          ))}
        </motion.div>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-400 pb-6">
          By activating a plan, you confirm that you have read and agreed to the above terms.
          For queries, contact <span className="text-blue-500">support@deliverguard.ai</span>
        </p>
      </div>
    </div>
  );
}
