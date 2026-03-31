const RISK_THRESHOLDS = {
  RAIN_THRESHOLD:          10,   // mm — lowered for real-world detection
  AQI_THRESHOLD:          150,   // AQI index — unhealthy for sensitive groups
  HEAT_THRESHOLD:          40,   // °C
  TRAFFIC_RATIO_THRESHOLD: 0.5,  // currentSpeed / freeFlowSpeed
};

const DISRUPTION_TYPES = {
  HEAVY_RAIN: 'heavy_rain',
  EXTREME_HEAT: 'extreme_heat',
  AQI_HAZARD: 'aqi_hazard',
  TRAFFIC_JAM: 'traffic_jam',
};

const SEVERITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

module.exports = { RISK_THRESHOLDS, DISRUPTION_TYPES, SEVERITY_LEVELS };
