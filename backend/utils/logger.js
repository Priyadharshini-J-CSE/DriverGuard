const winston = require('winston');
const path    = require('path');
const fs      = require('fs');

const isProduction = process.env.NODE_ENV === 'production';

const transports = [new winston.transports.Console()];

// Only write log files locally — Render's filesystem is ephemeral
if (!isProduction) {
  const logsDir = path.join(__dirname, '../logs');
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
  transports.push(new winston.transports.File({ filename: path.join(logsDir, 'error.log'),    level: 'error' }));
  transports.push(new winston.transports.File({ filename: path.join(logsDir, 'combined.log') }));
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`)
  ),
  transports,
});

module.exports = logger;
