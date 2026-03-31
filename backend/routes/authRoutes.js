const router = require('express').Router();
const { register, login, getMe, verifyPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register',        register);
router.post('/login',           login);
router.post('/verify-password', verifyPassword);
router.get('/me',               protect, getMe);

module.exports = router;
