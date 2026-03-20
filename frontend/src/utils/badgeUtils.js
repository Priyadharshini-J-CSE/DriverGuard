// Badge tier logic — shared across Profile and Leaderboard
// Diamond: riskScore < 20 and 0 fraud events
// Gold:    riskScore < 40 and <= 2 fraud events
// Silver:  everything else

export const BADGE_META = {
  Diamond: {
    label:       'Diamond',
    color:       '#2563eb',
    gradient:    'from-blue-600 to-indigo-500',
    lightBg:     'bg-blue-50',
    border:      'border-blue-200',
    text:        'text-blue-700',
    ringColor:   'ring-blue-300',
    description: 'Elite member — lowest risk, zero fraud history.',
    perks:       ['Instant payouts', '5x fuel cashback', 'Zero fraud holds', 'Priority support'],
    icon:        '💎',
  },
  Gold: {
    label:       'Gold',
    color:       '#d97706',
    gradient:    'from-yellow-500 to-amber-400',
    lightBg:     'bg-yellow-50',
    border:      'border-yellow-200',
    text:        'text-yellow-700',
    ringColor:   'ring-yellow-300',
    description: 'Trusted member — low risk with minimal fraud flags.',
    perks:       ['Priority claim queue', '2x fuel cashback', 'Dedicated support'],
    icon:        '🥇',
  },
  Silver: {
    label:       'Silver',
    color:       '#64748b',
    gradient:    'from-slate-400 to-slate-500',
    lightBg:     'bg-slate-50',
    border:      'border-slate-200',
    text:        'text-slate-600',
    ringColor:   'ring-slate-300',
    description: 'Standard member — building trust over time.',
    perks:       ['Basic claim processing', 'Weekly reports'],
    icon:        '🥈',
  },
};

export const getBadge = (riskScore = 0, fraudCount = 0) => {
  if (riskScore < 20 && fraudCount === 0)  return 'Diamond';
  if (riskScore < 40 && fraudCount <= 2)   return 'Gold';
  return 'Silver';
};

// Numeric rank weight for sorting (lower = better)
export const BADGE_RANK = { Diamond: 0, Gold: 1, Silver: 2 };
