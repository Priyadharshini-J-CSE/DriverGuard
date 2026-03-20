const USERS_KEY = 'dg_users';
const TOKEN_KEY = 'token';

const getUsers = () => JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
const saveUsers = (users) => localStorage.setItem(USERS_KEY, JSON.stringify(users));
const makeToken = () => btoa(`mock_token_${Date.now()}_${Math.random()}`);

// Deterministic base score from email so every user gets a different starting score
const emailToBaseScore = (email) => {
  let hash = 0;
  for (let i = 0; i < email.length; i++) hash = (hash * 31 + email.charCodeAt(i)) & 0xffff;
  return 8 + (hash % 28); // range 8–35 — starts low, fraud pushes it up
};

const makeUser = (data) => ({
  _id: `user_${Date.now()}`,
  name: data.name || 'User',
  email: data.email,
  phone: data.phone || '',
  city: data.city || '',
  deliveryPlatform: data.deliveryPlatform || 'Zomato',
  role: 'worker',
  onboardingComplete: false,
  createdAt: new Date().toISOString(),
  riskScore: emailToBaseScore(data.email),
  fraudEvents: [],
});

export const register = (data) => {
  const users = getUsers();
  const existing = users.find((u) => u.email === data.email);
  if (existing) {
    // Email exists — just log them in directly
    const token = makeToken();
    const updated = { ...existing, token };
    saveUsers(users.map((u) => (u.email === data.email ? updated : u)));
    const { password: _, ...user } = updated;
    return Promise.resolve({ data: { token, user } });
  }
  const user = makeUser(data);
  const token = makeToken();
  saveUsers([...users, { ...user, password: data.password, token }]);
  return Promise.resolve({ data: { token, user } });
};

export const login = ({ email, password }) => {
  const users = getUsers();
  let found = users.find((u) => u.email === email);

  if (!found) {
    const user = makeUser({ email });
    const token = makeToken();
    saveUsers([...users, { ...user, password, token }]);
    return Promise.resolve({ data: { token, user } });
  }

  const token = makeToken();
  found = { ...found, password, token, name: found.name === found.email.split('@')[0] ? 'User' : found.name };
  saveUsers(users.map((u) => (u.email === email ? found : u)));

  const { password: _, ...user } = found;
  return Promise.resolve({ data: { token, user } });
};

export const getMe = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  const users = getUsers();
  const found = users.find((u) => u.token === token);
  if (!found) return Promise.reject({ response: { status: 401 } });
  const { password: _, ...user } = found;
  return Promise.resolve({ data: user });
};

// Fraud event types with their score impact
const FRAUD_EVENTS = [
  { type: 'Duplicate Claim Attempt',      impact: 18, severity: 'Critical' },
  { type: 'Location Mismatch Detected',   impact: 12, severity: 'High'     },
  { type: 'Suspicious Claim Frequency',   impact: 9,  severity: 'High'     },
  { type: 'Income Proof Inconsistency',   impact: 7,  severity: 'Medium'   },
  { type: 'Off-Hours Claim Submission',   impact: 5,  severity: 'Low'      },
];

export const simulateFraud = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  const users = getUsers();
  const idx   = users.findIndex((u) => u.token === token);
  if (idx === -1) return null;

  const event  = FRAUD_EVENTS[Math.floor(Math.random() * FRAUD_EVENTS.length)];
  const current = users[idx].riskScore ?? 10;
  const newScore = Math.min(100, current + event.impact);

  const fraudEntry = {
    ...event,
    date: new Date().toISOString(),
    scoreBefore: current,
    scoreAfter: newScore,
  };

  users[idx] = {
    ...users[idx],
    riskScore: newScore,
    fraudEvents: [fraudEntry, ...(users[idx].fraudEvents || [])].slice(0, 10),
  };
  saveUsers(users);

  const { password: _, ...user } = users[idx];
  return user;
};
