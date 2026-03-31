const Claim = require('../models/Claim');
const Policy = require('../models/Policy');
const InsurancePayment = require('../models/InsurancePayment');
const { checkFraud } = require('../services/fraudService');
const { calcIncomeLoss, getSeverityFactor, getPayoutBreakdown } = require('../utils/helpers');

const getClaims = async (req, res, next) => {
  try {
    const claims = await Claim.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(claims);
  } catch (err) { next(err); }
};

const getClaimById = async (req, res, next) => {
  try {
    const claim = await Claim.findOne({ _id: req.params.id, userId: req.user._id });
    if (!claim) return res.status(404).json({ message: 'Claim not found' });
    res.json(claim);
  } catch (err) { next(err); }
};

const createClaim = async (req, res, next) => {
  try {
    const { disruptionType, location, disruptionValue } = req.body;
    const policy = await Policy.findOne({ userId: req.user._id, status: 'active' });
    if (!policy) return res.status(400).json({ message: 'No active policy' });

    // Coverage validation — must have paid weekly premium
    const now = new Date();
    const latestPayment = await InsurancePayment.findOne({ userId: req.user._id, paymentStatus: 'success' })
      .sort({ coverageStart: -1 });
    const coverageActive = latestPayment && now <= latestPayment.graceDeadline;
    if (!coverageActive)
      return res.status(403).json({
        message: 'Your insurance coverage is inactive. Please pay the weekly premium to continue protection.',
        code: 'COVERAGE_INACTIVE',
      });

    if (!req.user.avgDailyIncome || req.user.avgDailyIncome <= 0)
      return res.status(400).json({ message: 'Income data not available. Please update your profile with your average daily income.' });

    const breakdown = getPayoutBreakdown(req.user.avgDailyIncome, req.user.workingHours);
    const incomeLoss  = breakdown.totalPayout;
    const claimAmount = Math.min(incomeLoss, policy.maxWeeklyPayout || policy.coverageAmount || incomeLoss);

    const claim = await Claim.create({
      userId: req.user._id,
      policyId: policy._id,
      disruptionType,
      location,
      incomeLoss,
      claimAmount,
      payoutBreakdown: breakdown,
      status: 'pending',
    });

    const { isSuspicious } = await checkFraud(req.user._id, claim);
    claim.status = 'approved'; // always approve — fraud is logged separately
    await claim.save();

    res.status(201).json(claim);
  } catch (err) { next(err); }
};

module.exports = { getClaims, getClaimById, createClaim };
