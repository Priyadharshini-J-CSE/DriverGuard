const InsurancePayment = require('../models/InsurancePayment');
const Policy = require('../models/Policy');
const User   = require('../models/User');

const PLAN_RATES = { basic: 5, standard: 8, premium: 10 };

const calcTier = (points) => points >= 100 ? 'Diamond' : points >= 50 ? 'Gold' : 'Silver';

// POST /api/payments/weekly-premium
const payWeeklyPremium = async (req, res, next) => {
  try {
    const { weeklyIncome, transactionId, ocrImageUrl } = req.body;

    if (!weeklyIncome || weeklyIncome <= 0)
      return res.status(400).json({ message: 'Invalid weekly income' });

    const policy = await Policy.findOne({ userId: req.user._id, status: 'active' });
    if (!policy)
      return res.status(400).json({ message: 'No active policy found. Please select a plan first.' });

    const premiumPercentage = PLAN_RATES[policy.planType] ?? policy.premiumPct;
    const premiumAmount = Math.round((weeklyIncome * premiumPercentage) / 100);

    const coverageStart = new Date();
    const coverageEnd = new Date(coverageStart);
    coverageEnd.setDate(coverageEnd.getDate() + 7);
    const graceDeadline = new Date(coverageEnd);
    graceDeadline.setDate(graceDeadline.getDate() + 1);

    const txnId = transactionId || `TXN-${Date.now()}-${req.user._id}`;

    // Duplicate check — reject if same txnId already exists
    const existing = await InsurancePayment.findOne({ transactionId: txnId });
    if (existing) return res.status(409).json({ message: 'Payment already recorded for this transaction.' });

    const payment = await InsurancePayment.create({
      userId: req.user._id,
      planName: policy.planType,
      weeklyIncome,
      premiumPercentage,
      premiumAmount,
      paymentDate: coverageStart,
      coverageStart,
      coverageEnd,
      graceDeadline,
      paymentStatus: 'success',
      transactionId: txnId,
      ocrImageUrl: ocrImageUrl || '',
    });

    // --- Loyalty points ---
    const u = await User.findById(req.user._id);
    u.consecutivePayments = (u.consecutivePayments || 0) + 1;
    u.loyaltyPoints = (u.loyaltyPoints || 0) + 10;
    if (u.consecutivePayments % 4 === 0) u.loyaltyPoints += 5; // bonus every 4 payments
    u.tier = calcTier(u.loyaltyPoints);
    await u.save();

    res.status(201).json(payment);
  } catch (err) { next(err); }
};

// GET /api/payments/history
const getPaymentHistory = async (req, res, next) => {
  try {
    const payments = await InsurancePayment.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) { next(err); }
};

// GET /api/payments/status
const getCoverageStatus = async (req, res, next) => {
  try {
    const now = new Date();
    const latest = await InsurancePayment.findOne({ userId: req.user._id, paymentStatus: 'success' })
      .sort({ coverageStart: -1 });

    if (!latest) return res.json({ active: false, reason: 'no_payment' });

    if (now <= latest.coverageEnd) return res.json({ active: true, payment: latest });

    if (now <= latest.graceDeadline)
      return res.json({ active: true, inGrace: true, payment: latest });

    return res.json({ active: false, reason: 'expired', payment: latest });
  } catch (err) { next(err); }
};

module.exports = { payWeeklyPremium, getPaymentHistory, getCoverageStatus };
