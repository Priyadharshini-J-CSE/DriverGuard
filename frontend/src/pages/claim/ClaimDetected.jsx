import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ClaimStepper from './ClaimStepper';
import { getCoverageStatus } from '../../services/premiumService';
import { createClaim } from '../../services/claimService';
import { useDisruption, DEMO_MODE } from '../../context/DisruptionContext';
import { useAuth } from '../../context/AuthContext';
import { isCitySupported } from '../../utils/cityCoords';
import { CloudRain, Thermometer, Wind, TrafficCone, Lock, ShieldCheck, Clock, MapPin, AlertTriangle, Zap } from 'lucide-react';

const DISRUPTION_META = {
  heavy_rain:   { label: 'Heavy Rain',   Icon: CloudRain,   color: 'blue',   emoji: '🌧' },
  extreme_heat: { label: 'Extreme Heat', Icon: Thermometer, color: 'orange', emoji: '🌡' },
  aqi_hazard:   { label: 'High AQI',     Icon: Wind,        color: 'purple', emoji: '🌫' },
  traffic_jam:  { label: 'Traffic Jam',  Icon: TrafficCone, color: 'red',    emoji: '🚦' },
};

export default function ClaimDetected() {
  const navigate = useNavigate();
  const { user }  = useAuth();
  const { disruptions, loading: loadingLive, city } = useDisruption();

  const detected       = disruptions;
  const citySupported  = isCitySupported(user?.city || '');

  const [coverage,   setCoverage]   = useState(null);
  const [checking,   setChecking]   = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');
  const [selected,   setSelected]   = useState(null);

  // Auto-select first disruption when context loads
  useEffect(() => {
    if (disruptions.length > 0 && !selected) {
      setSelected(disruptions[0].type);
    }
  }, [disruptions, selected]);

  useEffect(() => {
    getCoverageStatus()
      .then((r) => setCoverage(r.data))
      .catch(() => setCoverage({ active: false, reason: 'error' }))
      .finally(() => setChecking(false));
  }, []);

  const handleSubmit = async () => {
    if (!selected) return;
    setSubmitting(true);
    setError('');
    try {
      const d = detected.find((x) => x.type === selected) ?? { value: 65 };
      const { data: claim } = await createClaim({
        disruptionType:  selected,
        disruptionValue: d.value,
        location:        { city: city || 'Unknown' },
      });
      navigate('/claim/verify-process', { state: { claimId: claim._id } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit claim. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) return (
    <div className="flex justify-center py-24">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // Coverage inactive
  if (!coverage?.active) return (
    <div className="max-w-lg mx-auto space-y-5">
      <ClaimStepper />
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="card border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-900/20 space-y-4">
        <div className="flex items-center gap-3">
          <Lock size={36} className="text-amber-500" />
          <div>
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Coverage Inactive</p>
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Premium Payment Required</h2>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Your insurance coverage is inactive. Please pay the weekly premium to continue protection.
        </p>
        <AnimatePresence>
          {coverage?.reason === 'expired' && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-xs text-red-500 font-medium">
              Coverage expired due to unpaid premium.
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
      <button onClick={() => navigate('/upload-salary-proof')}
        className="w-full py-3 rounded-2xl font-semibold text-white bg-amber-500 hover:bg-amber-600 transition-colors">
        Upload Salary Screenshot →
      </button>
      <button onClick={() => navigate('/dashboard')} className="btn-secondary w-full py-3">
        Back to Dashboard
      </button>
    </div>
  );

  const hasDisruption = detected.length > 0;

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <ClaimStepper />

      {/* City badge */}
      <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200
                      dark:border-blue-800 rounded-xl px-4 py-2.5 text-sm text-blue-700 dark:text-blue-300">
        <MapPin size={14} className="shrink-0" />
        <span>📍 Location verified: <strong>{city || '...'}</strong></span>
        {DEMO_MODE && (
          <span className="ml-auto text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">
            Demo Mode
          </span>
        )}
      </div>

      {/* Unsupported city warning */}
      {user?.city && !citySupported && (
        <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200
                        dark:border-amber-800 rounded-xl px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
          <span>⚠️</span>
          <span>
            <strong>{user.city}</strong> is not in our supported city list.
            Showing data for <strong>{city}</strong> (default). Please update your profile city.
          </span>
        </div>
      )}

      {/* Disruption detection results */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-500" /> Detected Disruptions
          </h2>
          {loadingLive && (
            <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        {!loadingLive && hasDisruption ? (
          <div className="space-y-2">
            {detected.map((d) => {
              const meta = DISRUPTION_META[d.type];
              const isSelected = selected === d.type;
              return (
                <motion.button key={d.type} onClick={() => setSelected(d.type)}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all
                    ${isSelected
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-red-300'}`}>
                  <span className="text-xl">{meta?.emoji}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-gray-800 dark:text-gray-100">
                      ✔ {meta?.label || d.type.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Value: {d.value} · Threshold exceeded
                    </p>
                  </div>
                  {isSelected && (
                    <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">Selected</span>
                  )}
                </motion.button>
              );
            })}
          </div>
        ) : !loadingLive ? (
          <div className="flex items-center gap-2 text-gray-500 text-sm py-2">
            <span>❌</span> No disruptions currently detected in {city}.
          </div>
        ) : (
          <p className="text-sm text-gray-400">Scanning live conditions...</p>
        )}
      </motion.div>

      {/* Coverage active badge */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="card bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center gap-3">
        <ShieldCheck size={22} className="text-green-600 shrink-0" />
        <div>
          <p className="font-semibold text-green-700 dark:text-green-400">Your income protection is active.</p>
          {coverage?.inGrace && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5 flex items-center gap-1">
              <Clock size={11} /> Grace period — pay premium soon.
            </p>
          )}
        </div>
      </motion.div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <button
          onClick={handleSubmit}
          disabled={submitting || !hasDisruption || !selected || loadingLive}
          className="btn-primary w-full py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Submitting Claim…
            </span>
          ) : hasDisruption ? (
            <span className="flex items-center justify-center gap-2">
              <Zap size={16} /> Submit Claim →
            </span>
          ) : 'No Disruption Detected'}
        </button>
        <button onClick={() => navigate('/dashboard')} className="btn-secondary w-full py-3 text-base">
          Cancel
        </button>
      </div>
    </div>
  );
}
