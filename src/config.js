const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  awsRegion: process.env.AWS_REGION || 'us-east-1',
  appTitle: process.env.APP_TITLE || 'ShipIt48 - 48h Hackathon Survival Hub',
  hackathonName: process.env.HACKATHON_NAME || 'Hack48: Sleep is Optional',
  hackathonHours: parseInt(process.env.HACKATHON_HOURS, 10) || 48,
  adminPasscode: process.env.ADMIN_PASSCODE || 'hackathon-secret-key'
};

module.exports = config;
