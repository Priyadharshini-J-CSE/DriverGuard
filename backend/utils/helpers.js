const jwt = require('jsonwebtoken');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const calcIncomeLoss = (avgDailyIncome, workingHours) => {
  const hours = workingHours || 8;
  const hourlyIncome = avgDailyIncome / hours;
  return Math.round(hourlyIncome * 6); // 6 hours loss compensation
};

const getSeverityFactor = (disruptionType, value) => {
  const factors = {
    heavy_rain:   value > 100 ? 1.0 : value > 75 ? 0.75 : 0.5,
    extreme_heat: value > 48  ? 1.0 : value > 45 ? 0.75 : 0.5,
    aqi_hazard:   value > 400 ? 1.0 : value > 350 ? 0.75 : 0.5,
    traffic_jam:  value < 0.2 ? 1.0 : value < 0.3 ? 0.75 : 0.5,
  };
  return factors[disruptionType] || 0.5;
};

// Returns breakdown for display
const getPayoutBreakdown = (avgDailyIncome, workingHours) => {
  const hours = workingHours || 8;
  const hourlyIncome = Math.round(avgDailyIncome / hours);
  const lossHours = 6;
  const totalPayout = Math.round(hourlyIncome * lossHours);
  return { hourlyIncome, lossHours, totalPayout };
};

module.exports = { generateToken, calcIncomeLoss, getSeverityFactor, getPayoutBreakdown };
