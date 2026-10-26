const { test, describe, beforeEach } = require('node:test');
const assert = require('node:assert');

describe('Configuration module', () => {
  beforeEach(() => {
    delete require.cache[require.resolve('../src/config')];
  });

  test('provides sensible defaults when env variables are unset', () => {
    delete process.env.PORT;
    delete process.env.AWS_REGION;
    delete process.env.APP_TITLE;
    delete process.env.HACKATHON_NAME;
    delete process.env.HACKATHON_HOURS;
    delete process.env.ADMIN_PASSCODE;

    const config = require('../src/config');
    assert.strictEqual(config.port, 3000);
    assert.strictEqual(config.awsRegion, 'us-east-1');
    assert.strictEqual(config.appTitle, 'ShipIt48 - 48h Hackathon Survival Hub');
    assert.strictEqual(config.hackathonName, 'Hack48: Sleep is Optional');
    assert.strictEqual(config.hackathonHours, 48);
    assert.strictEqual(config.adminPasscode, 'hackathon-secret-key');
  });

  test('respects environment variable overrides', () => {
    process.env.PORT = '8080';
    process.env.AWS_REGION = 'eu-central-1';
    process.env.APP_TITLE = 'Custom Hackathon Title';
    process.env.HACKATHON_NAME = 'Code or Die 48';
    process.env.HACKATHON_HOURS = '24';
    process.env.ADMIN_PASSCODE = 'super-secret';

    const config = require('../src/config');
    assert.strictEqual(config.port, 8080);
    assert.strictEqual(config.awsRegion, 'eu-central-1');
    assert.strictEqual(config.appTitle, 'Custom Hackathon Title');
    assert.strictEqual(config.hackathonName, 'Code or Die 48');
    assert.strictEqual(config.hackathonHours, 24);
    assert.strictEqual(config.adminPasscode, 'super-secret');
  });
});
