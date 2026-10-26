const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');

const TEST_DB_PATH = path.resolve(__dirname, '../data/test-api-db.json');

describe('Express REST API', () => {
  let server;
  let baseUrl;

  before(async () => {
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
    const db = require('../src/db');
    db.init(TEST_DB_PATH);

    const app = require('../src/app');
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
  });

  test('GET /health returns status ok and aws region info', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.status, 'ok');
    assert.strictEqual(typeof body.uptime, 'number');
    assert.strictEqual(typeof body.region, 'string');
    assert.strictEqual(typeof body.env, 'string');
  });

  test('GET /api/info returns hackathon details and milestones', async () => {
    const res = await fetch(`${baseUrl}/api/info`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.ok(body.hackathonName);
    assert.ok(body.durationHours);
    assert.ok(Array.isArray(body.milestones));
    assert.ok(body.milestones.length > 0);
  });

  test('GET /api/projects returns list of projects', async () => {
    const res = await fetch(`${baseUrl}/api/projects`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body));
    assert.ok(body.length >= 1);
  });

  test('POST /api/projects creates a new project', async () => {
    const payload = {
      title: 'CloudFixer',
      teamName: 'EC2 Ninjas',
      tag: 'Works On My Machine',
      description: 'Automatically reboots when things get weird',
      knownBugs: 'Needs 5 reboots per hour'
    };

    const res = await fetch(`${baseUrl}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    assert.strictEqual(res.status, 201);
    const created = await res.json();
    assert.ok(created.id);
    assert.strictEqual(created.title, 'CloudFixer');
  });

  test('POST /api/projects returns 400 when required fields are missing', async () => {
    const res = await fetch(`${baseUrl}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '' })
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.ok(body.error);
  });

  test('GET /api/stats returns survival stats', async () => {
    const res = await fetch(`${baseUrl}/api/stats`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(typeof body.coffeesDrank, 'number');
    assert.strictEqual(typeof body.prayersOffered, 'number');
    assert.strictEqual(typeof body.bugsPromotedToFeatures, 'number');
  });

  test('POST /api/stats/:metric/increment updates metric', async () => {
    const res = await fetch(`${baseUrl}/api/stats/coffees/increment`, {
      method: 'POST'
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.ok(body.stats);
    assert.strictEqual(typeof body.stats.coffeesDrank, 'number');
  });

  test('POST /api/stats/:metric/increment returns 400 for invalid metric', async () => {
    const res = await fetch(`${baseUrl}/api/stats/sleep/increment`, {
      method: 'POST'
    });
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.ok(body.error);
  });
});
