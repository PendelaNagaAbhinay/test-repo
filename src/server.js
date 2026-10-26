const app = require('./app');
const config = require('./config');

const server = app.listen(config.port, '0.0.0.0', () => {
  console.log(`=========================================`);
  console.log(`🚀 ${config.appTitle}`);
  console.log(`📡 Listening on: http://0.0.0.0:${config.port}`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  console.log(`☁️  AWS Region:  ${config.awsRegion}`);
  console.log(`❤️  Health Check: http://localhost:${config.port}/health`);
  console.log(`=========================================`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed. Goodbye!');
    process.exit(0);
  });
});
