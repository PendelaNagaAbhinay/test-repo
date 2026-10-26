const path = require('path');
if (process.env.NODE_ENV !== 'test') {
  require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
}

const ALLOWED_STATES = ['RUNNING', 'PANIC_MODE', 'MAINTENANCE'];

const rawState = (process.env.HACKATHON_STATE || 'RUNNING').trim().toUpperCase();
const appDeploymentKey = (process.env.APP_DEPLOYMENT_KEY || '').trim();
const enableSubmissions = process.env.ENABLE_SUBMISSIONS !== 'false';

const errors = [];
if (!appDeploymentKey || appDeploymentKey === 'CHANGE_ME_OR_DEPLOYMENT_CRASHES') {
  errors.push('CRITICAL: APP_DEPLOYMENT_KEY is missing or set to placeholder CHANGE_ME_OR_DEPLOYMENT_CRASHES in .env');
}

if (!ALLOWED_STATES.includes(rawState)) {
  errors.push(`INVALID_STATE: HACKATHON_STATE='${process.env.HACKATHON_STATE}' is invalid. Allowed: RUNNING, PANIC_MODE, MAINTENANCE`);
}

const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  awsRegion: process.env.AWS_REGION || 'us-east-1',
  appTitle: process.env.APP_TITLE || 'ShipIt48 - 48h Hackathon Survival Hub',
  hackathonName: process.env.HACKATHON_NAME || 'Hack48: Sleep is Optional',
  hackathonHours: parseInt(process.env.HACKATHON_HOURS, 10) || 48,
  adminPasscode: process.env.ADMIN_PASSCODE || 'hackathon-secret-key',
  appDeploymentKey,
  hackathonState: rawState,
  enableSubmissions,
  isConfigValid: errors.length === 0,
  configError: errors.join('; ')
};

module.exports = config;
