// In-memory store — no localStorage

const makeToken = (seed) => btoa(`mock_token_${seed}`);

const DEFAULT_USERS = [
  {
    _id: 'user_admin',
    name: 'Admin',
    email: 'admin@driverguard.com',
    password: 'admin123',
    phone: '9000000000',
    city: 'Coimbatore',
    deliveryPlatform: 'Zomato',
    role: 'admin',
    onboardingComplete: true,
    createdAt: '2025-01-01T00:00:00Z',
    riskScore: 5,
    fraudEvents: [],
    token: makeToken('admin'),
  },
  {
    _id: 'user_001',
    name: 'Ravi Kumar',
    email: 'ravi@example.com',
    password: 'password123',
    phone: '9876543210',
    city: 'Coimbatore',
    deliveryPlatform: 'Zomato',
    role: 'worker',
    onboardingComplete: true,
    createdAt: '2025-03-01T00:00:00Z',
    riskScore: 14,
    fraudEvents: [],
    token: makeToken('ravi'),
    activePolicy: { planType: 'standard', weeklyPremium: 25, coverageAmount: 1000, maxWeeklyPayout: 1000, _id: 'policy_001', active: true },
  },
  {
    _id: 'user_002',
    name: 'Priya Devi',
    email: 'priya@example.com',
    password: 'password123',
    phone: '9123456780',
    city: 'Coimbatore',
    deliveryPlatform: 'Swiggy',
    role: 'worker',
    onboardingComplete: true,
    createdAt: '2025-03-15T00:00:00Z',
    riskScore: 22,
    fraudEvents: [],
    token: makeToken('priya'),
    activePolicy: { planType: 'basic', weeklyPremium: 15, coverageAmount: 500, maxWeeklyPayout: 500, _id: 'policy_002', active: true },
  },
];

let users = DEFAULT_USERS.map((u) => ({ ...u }));
let currentToken = null;

export const getCurrentToken = () => currentToken;
export const setCurrentToken = (t) => { currentToken = t; };

export const getCurrentUser = () => users.find((u) => u.token === currentToken) || null;

const updateCurrentUser = (patch) => {
  const idx = users.findIndex((u) => u.token === currentToken);
  if (idx !== -1) {
    users[idx] = { ...users[idx], ...patch };
    return users[idx];
  }
  return null;
};

const emailToBaseScore = (email) => {
  let hash = 0;
  for (let i = 0; i < email.length; i++) hash = (hash * 31 + email.charCodeAt(i)) & 0xffff;
  return 8 + (hash % 28);
};

const makeUser = (data) => ({
  _id: `user_${Date.now()}`,
  name: data.name || 'User',
  email: data.email,
  phone: data.phone || '',
  city: data.city || 'Coimbatore',
  deliveryPlatform: data.deliveryPlatform || 'Zomato',
  role: 'worker',
  onboardingComplete: false,
  createdAt: new Date().toISOString(),
  riskScore: emailToBaseScore(data.email),
  fraudEvents: [],
});

export const register = (data) => {
  const existing = users.find((u) => u.email === data.email);
  if (existing) {
    const token = makeToken(`${data.email}_${Date.now()}`);
    existing.token = token;
    currentToken = token;
    const { password: _, ...user } = existing;
    return Promise.resolve({ data: { token, user } });
  }
  const user = makeUser(data);
  const token = makeToken(`${data.email}_${Date.now()}`);
  users.push({ ...user, password: data.password, token });
  currentToken = token;
  return Promise.resolve({ data: { token, user } });
};

export const login = ({ email, password }) => {
  let found = users.find((u) => u.email === email);
  if (!found) {
    const user = makeUser({ email });
    const token = makeToken(`${email}_${Date.now()}`);
    users.push({ ...user, password, token });
    found = users[users.length - 1];
  }
  const token = makeToken(`${email}_${Date.now()}`);
  found.token = token;
  currentToken = token;
  const { password: _, ...user } = found;
  return Promise.resolve({ data: { token, user } });
};

export const getMe = () => {
  const found = getCurrentUser();
  if (!found) return Promise.reject({ response: { status: 401 } });
  const { password: _, ...user } = found;
  return Promise.resolve({ data: user });
};

const FRAUD_EVENTS = [
  { type: 'Duplicate Claim Attempt',    impact: 18, severity: 'Critical' },
  { type: 'Location Mismatch Detected', impact: 12, severity: 'High'     },
  { type: 'Suspicious Claim Frequency', impact: 9,  severity: 'High'     },
  { type: 'Income Proof Inconsistency', impact: 7,  severity: 'Medium'   },
  { type: 'Off-Hours Claim Submission', impact: 5,  severity: 'Low'      },
];

export const simulateFraud = () => {
  const u = getCurrentUser();
  if (!u) return null;
  const event = FRAUD_EVENTS[Math.floor(Math.random() * FRAUD_EVENTS.length)];
  const current = u.riskScore ?? 10;
  const newScore = Math.min(100, current + event.impact);
  const fraudEntry = { ...event, date: new Date().toISOString(), scoreBefore: current, scoreAfter: newScore };
  updateCurrentUser({
    riskScore: newScore,
    fraudEvents: [fraudEntry, ...(u.fraudEvents || [])].slice(0, 10),
  });
  const updated = getCurrentUser();
  const { password: _, ...user } = updated;
  return user;
};

export { updateCurrentUser };
