const router = require('express').Router();
const { getProfile, updateProfile, completeOnboarding, getUserPolicies, changePassword, getLeaderboard } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/profile',     protect, getProfile);
router.put('/profile',     protect, updateProfile);
router.post('/onboarding', protect, completeOnboarding);
router.put('/password',    protect, changePassword);
router.get('/policies',    protect, getUserPolicies);
router.get('/leaderboard', protect, getLeaderboard);

module.exports = router;
