const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');

describe('Configuration module', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.NODE_ENV = 'test';
    delete require.cache[require.resolve('../src/config')];
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  test('provides sensible defaults when env variables are unset', () => {
    delete process.env.PORT;
    delete process.env.AWS_REGION;
    delete process.env.APP_TITLE;
    delete process.env.HACKATHON_NAME;
    delete process.env.HACKATHON_HOURS;
    delete process.env.ADMIN_PASSCODE;
    delete process.env.APP_DEPLOYMENT_KEY;
    delete process.env.HACKATHON_STATE;
    delete process.env.ENABLE_SUBMISSIONS;

    const config = require('../src/config');
    assert.strictEqual(config.port, 3000);
    assert.strictEqual(config.awsRegion, 'us-east-1');
    assert.strictEqual(config.appTitle, 'ShipIt48 - 48h Hackathon Survival Hub');
    assert.strictEqual(config.hackathonName, 'Hack48: Sleep is Optional');
    assert.strictEqual(config.hackathonHours, 48);
    assert.strictEqual(config.adminPasscode, 'hackathon-secret-key');
    assert.strictEqual(config.enableSubmissions, true);
    // Unset APP_DEPLOYMENT_KEY flags critical config error
    assert.strictEqual(config.isConfigValid, false);
    assert.ok(config.configError.includes('APP_DEPLOYMENT_KEY'));
  });

  test('respects environment variable overrides', () => {
    process.env.PORT = '8080';
    process.env.AWS_REGION = 'eu-central-1';
    process.env.APP_TITLE = 'Custom Hackathon Title';
    process.env.HACKATHON_NAME = 'Code or Die 48';
    process.env.HACKATHON_HOURS = '24';
    process.env.ADMIN_PASSCODE = 'super-secret';
    process.env.APP_DEPLOYMENT_KEY = 'valid-ec2-deployment-key-2026';
    process.env.HACKATHON_STATE = 'PANIC_MODE';
    process.env.ENABLE_SUBMISSIONS = 'false';

    const config = require('../src/config');
    assert.strictEqual(config.port, 8080);
    assert.strictEqual(config.awsRegion, 'eu-central-1');
    assert.strictEqual(config.appTitle, 'Custom Hackathon Title');
    assert.strictEqual(config.hackathonName, 'Code or Die 48');
    assert.strictEqual(config.hackathonHours, 24);
    assert.strictEqual(config.adminPasscode, 'super-secret');
    assert.strictEqual(config.appDeploymentKey, 'valid-ec2-deployment-key-2026');
    assert.strictEqual(config.hackathonState, 'PANIC_MODE');
    assert.strictEqual(config.enableSubmissions, false);
    assert.strictEqual(config.isConfigValid, true);
  });

  test('detects invalid or placeholder APP_DEPLOYMENT_KEY and invalid HACKATHON_STATE', () => {
    process.env.APP_DEPLOYMENT_KEY = 'CHANGE_ME_OR_DEPLOYMENT_CRASHES';
    process.env.HACKATHON_STATE = 'NOT_A_VALID_STATE';

    const config = require('../src/config');
    assert.strictEqual(config.isConfigValid, false);
    assert.ok(config.configError.includes('APP_DEPLOYMENT_KEY'));
    assert.ok(config.configError.includes('HACKATHON_STATE'));
  });
});
