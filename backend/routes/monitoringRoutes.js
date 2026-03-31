const router = require('express').Router();
const { getLiveData } = require('../controllers/monitoringController');

// Public route — weather/AQI/traffic data requires no authentication
router.get('/live', getLiveData);

module.exports = router;
