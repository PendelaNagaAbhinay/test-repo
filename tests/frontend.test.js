const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');

describe('Static Frontend Delivery', () => {
  let server;
  let baseUrl;

  before(async () => {
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
  });

  test('GET / returns HTML page with app root, meme container, and scripts', async () => {
    const res = await fetch(`${baseUrl}/`);
    assert.strictEqual(res.status, 200);
    const text = await res.text();
    assert.ok(text.includes('ShipIt48'), 'Page contains app title');
    assert.ok(text.includes('countdown-timer'), 'Page contains countdown element');
    assert.ok(text.includes('survival-counters'), 'Page contains survival counters container');
    assert.ok(text.includes('projects-grid'), 'Page contains projects grid');
    assert.ok(text.includes('meme-card'), 'Page contains meme card container');
    assert.ok(text.includes('config-alert-banner'), 'Page contains config alert banner');
    assert.ok(text.includes('/app.js'), 'Page loads app.js');
  });

  test('GET /styles.css returns CSS stylesheet', async () => {
    const res = await fetch(`${baseUrl}/styles.css`);
    assert.strictEqual(res.status, 200);
    const css = await res.text();
    assert.ok(css.length > 20);
  });

  test('GET /app.js returns client JS', async () => {
    const res = await fetch(`${baseUrl}/app.js`);
    assert.strictEqual(res.status, 200);
    const js = await res.text();
    assert.ok(js.includes('fetchProjects'), 'Client script defines fetchProjects');
  });
});
