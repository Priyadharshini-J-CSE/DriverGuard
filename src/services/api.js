// Mock API — no backend required

const MOCK_CLAIMS = [
  { _id: 'CLM001TN', disruptionType: 'heavy_rain',   disruptionValue: 62,  location: { city: 'Coimbatore' }, incomeLoss: 1200, claimAmount: 1000, status: 'paid',          createdAt: '2025-04-01T08:30:00Z' },
  { _id: 'CLM002TN', disruptionType: 'traffic_jam',  disruptionValue: 0.34, location: { city: 'Coimbatore' }, incomeLoss: 800,  claimAmount: 650,  status: 'paid',          createdAt: '2025-04-05T10:15:00Z' },
  { _id: 'CLM003TN', disruptionType: 'aqi_hazard',   disruptionValue: 342, location: { city: 'Coimbatore' }, incomeLoss: 1000, claimAmount: 800,  status: 'approved',      createdAt: '2025-04-10T09:00:00Z' },
  { _id: 'CLM004TN', disruptionType: 'heavy_rain',   disruptionValue: 58,  location: { city: 'Coimbatore' }, incomeLoss: 950,  claimAmount: 750,  status: 'paid',          createdAt: '2025-04-14T07:45:00Z' },
  { _id: 'CLM005TN', disruptionType: 'extreme_heat', disruptionValue: 43,  location: { city: 'Coimbatore' }, incomeLoss: 700,  claimAmount: 500,  status: 'pending',       createdAt: '2025-04-18T11:20:00Z' },
  { _id: 'CLM006TN', disruptionType: 'traffic_jam',  disruptionValue: 0.31, location: { city: 'Coimbatore' }, incomeLoss: 600,  claimAmount: 480,  status: 'investigating', createdAt: '2025-04-22T14:00:00Z' },
  { _id: 'CLM007TN', disruptionType: 'heavy_rain',   disruptionValue: 65,  location: { city: 'Coimbatore' }, incomeLoss: 1100, claimAmount: 900,  status: 'paid',          createdAt: '2025-05-02T08:00:00Z' },
  { _id: 'CLM008TN', disruptionType: 'aqi_hazard',   disruptionValue: 318, location: { city: 'Coimbatore' }, incomeLoss: 850,  claimAmount: 700,  status: 'rejected',      createdAt: '2025-05-07T09:30:00Z' },
  { _id: 'CLM009TN', disruptionType: 'extreme_heat', disruptionValue: 44,  location: { city: 'Coimbatore' }, incomeLoss: 750,  claimAmount: 600,  status: 'approved',      createdAt: '2025-05-12T10:45:00Z' },
  { _id: 'CLM010TN', disruptionType: 'heavy_rain',   disruptionValue: 80,  location: { city: 'Coimbatore' }, incomeLoss: 1300, claimAmount: 1000, status: 'pending',       createdAt: '2025-05-18T07:15:00Z' },
];
const USERS_KEY = 'dg_users';
const TOKEN_KEY = 'token';

const getCurrentUser = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  return users.find((u) => u.token === token) || null;
};

const updateCurrentUser = (patch) => {
  const token = localStorage.getItem(TOKEN_KEY);
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  const idx = users.findIndex((u) => u.token === token);
  if (idx !== -1) {
    users[idx] = { ...users[idx], ...patch };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return users[idx];
  }
  return null;
};

const ok = (data) => Promise.resolve({ data });
const notFound = () => Promise.reject({ response: { status: 404, data: { message: 'Not found' } } });

const MOCK_ROUTES = {
  GET: {
    '/auth/me': () => {
      const u = getCurrentUser();
      if (!u) return Promise.reject({ response: { status: 401 } });
      const { password: _, ...user } = u;
      return ok(user);
    },
    '/plans': () => ok({
      basic:    { planType: 'basic',    weeklyPremium: 15, coverageAmount: 500,  maxWeeklyPayout: 500  },
      standard: { planType: 'standard', weeklyPremium: 25, coverageAmount: 1000, maxWeeklyPayout: 1000 },
      premium:  { planType: 'premium',  weeklyPremium: 40, coverageAmount: 2000, maxWeeklyPayout: 2000 },
    }),
    '/policy/active': () => {
      const u = getCurrentUser();
      return ok(u?.activePolicy || null);
    },
    '/claims': () => ok(MOCK_CLAIMS),
    '/payments/history': () => ok([]),
    '/payments/status': () => ok({ active: true, inGrace: false }),
  },
  POST: {
    '/auth/login':    () => notFound(),
    '/auth/register': () => notFound(),
    '/user/onboarding': (data) => {
      const updated = updateCurrentUser({ ...data, onboardingComplete: true });
      if (!updated) return Promise.reject({ response: { status: 401 } });
      const { password: _, ...user } = updated;
      return ok(user);
    },
    '/policy/select': ({ planType }) => {
      const plans = {
        basic:    { planType: 'basic',    weeklyPremium: 15, coverageAmount: 500,  maxWeeklyPayout: 500  },
        standard: { planType: 'standard', weeklyPremium: 25, coverageAmount: 1000, maxWeeklyPayout: 1000 },
        premium:  { planType: 'premium',  weeklyPremium: 40, coverageAmount: 2000, maxWeeklyPayout: 2000 },
      };
      const policy = { ...plans[planType], _id: `policy_${Date.now()}`, active: true };
      updateCurrentUser({ activePolicy: policy });
      return ok(policy);
    },
    '/payments/weekly-premium': () => {
      const now = new Date();
      const start = new Date(now);
      const until = new Date(now); until.setDate(until.getDate() + 7);
      const grace = new Date(now); grace.setDate(grace.getDate() + 8);
      return ok({
        transactionId:  `TXN${Date.now()}`,
        planName:       'basic',
        premiumAmount:  251,
        coverageStart:  start.toISOString(),
        coverageEnd:    until.toISOString(),
        graceDeadline:  grace.toISOString(),
      });
    },
    '/claims/create': (data) => ok({ _id: `claim_${Date.now()}`, ...data, status: 'pending', createdAt: new Date().toISOString() }),
    '/payout/initiate': () => ok({
      _id: 'PAY20250601TN001',
      razorpayId: 'rzp_live_TN20250601001',
      amount: 1000,
      paymentStatus: 'success',
      timestamp: new Date().toISOString(),
      bankName: 'State Bank of India',
      accountLast4: '4821',
      method: 'IMPS Transfer',
    }),
  },
};

const mockRequest = (method, url, data) => {
  const path = url.split('?')[0];
  const handler = MOCK_ROUTES[method]?.[path];
  if (handler) return handler(data);
  // Dynamic routes
  if (method === 'GET' && path.startsWith('/claims/')) return ok({ _id: path.split('/')[2], status: 'pending', claimAmount: 0 });
  if (method === 'GET' && path.startsWith('/monitoring/live')) return ok({ weather: null, aqi: null, traffic: null });
  return ok({});
};

const api = {
  get:    (url)        => mockRequest('GET',    url, null),
  post:   (url, data)  => mockRequest('POST',   url, data),
  put:    (url, data)  => mockRequest('PUT',    url, data),
  patch:  (url, data)  => mockRequest('PATCH',  url, data),
  delete: (url)        => mockRequest('DELETE', url, null),
  interceptors: { request: { use: () => {} }, response: { use: () => {} } },
};

export default api;
