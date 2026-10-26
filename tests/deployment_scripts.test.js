const { test, describe } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

describe('Deployment Scripts and Config', () => {
  const deployScriptPath = path.resolve(__dirname, '../scripts/deploy-ec2.sh');
  const userDataPath = path.resolve(__dirname, '../scripts/ec2-user-data.sh');
  const readmePath = path.resolve(__dirname, '../README.md');

  test('deploy-ec2.sh exists and contains essential setup steps', () => {
    assert.ok(fs.existsSync(deployScriptPath), 'deploy-ec2.sh should exist');
    const content = fs.readFileSync(deployScriptPath, 'utf8');
    assert.ok(content.startsWith('#!/bin/bash'), 'Should be a bash script');
    assert.ok(content.includes('npm install'), 'Should install npm dependencies');
    assert.ok(content.includes('shipit48.service'), 'Should configure systemd service');
    assert.ok(content.includes('systemctl enable'), 'Should enable systemd service');
    assert.ok(content.includes('systemctl start'), 'Should start systemd service');
    assert.ok(!content.includes('User=root'), 'Should not run service as root');
    assert.ok(content.includes('command -v node'), 'Should dynamically detect node binary path');
  });

  test('ec2-user-data.sh exists and contains bootstrap instructions', () => {
    assert.ok(fs.existsSync(userDataPath), 'ec2-user-data.sh should exist');
    const content = fs.readFileSync(userDataPath, 'utf8');
    assert.ok(content.startsWith('#!/bin/bash'), 'Should start with shebang');
    assert.ok(content.includes('node'), 'Should set up Node.js');
    assert.ok(content.includes('git'), 'Should install or use git');
  });

  test('README.md exists and documents EC2 deployment steps', () => {
    assert.ok(fs.existsSync(readmePath), 'README.md should exist');
    const content = fs.readFileSync(readmePath, 'utf8');
    assert.ok(content.includes('AWS EC2'), 'Should document AWS EC2');
    assert.ok(content.includes('Security Group'), 'Should document Security Group ports (80/3000)');
    assert.ok(content.includes('.env'), 'Should document environment variables');
    assert.ok(content.includes('/health'), 'Should document health verification');
  });
});
