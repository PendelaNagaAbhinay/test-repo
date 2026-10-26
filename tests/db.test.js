const { test, describe, beforeEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const TEST_DB_PATH = path.resolve(__dirname, '../data/test-db.json');

describe('Database / Storage Module', () => {
  let db;

  beforeEach(() => {
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
    delete require.cache[require.resolve('../src/db')];
    db = require('../src/db');
    db.init(TEST_DB_PATH);
  });

  test('returns seed projects on initial load', () => {
    const projects = db.getProjects();
    assert.ok(Array.isArray(projects));
    assert.ok(projects.length >= 2);
    assert.ok(projects[0].title);
    assert.ok(projects[0].tag);
  });

  test('adds a valid project with generated id and timestamp', () => {
    const newProj = db.addProject({
      title: 'Coffee2Code AI',
      teamName: 'Caffeine Overload',
      tag: 'Works On My Machine',
      description: 'Converts espresso into questionable JavaScript',
      knownBugs: 'Crashes whenever someone mentions Docker',
      demoUrl: 'https://example.com'
    });

    assert.ok(newProj.id);
    assert.strictEqual(newProj.title, 'Coffee2Code AI');
    assert.strictEqual(newProj.teamName, 'Caffeine Overload');
    assert.ok(newProj.createdAt);

    const allProjects = db.getProjects();
    const found = allProjects.find(p => p.id === newProj.id);
    assert.ok(found);
  });

  test('throws an error if required project fields are missing', () => {
    assert.throws(() => {
      db.addProject({ title: '' });
    }, /Title and team name are required/);

    assert.throws(() => {
      db.addProject({ title: 'Valid Title', teamName: '' });
    }, /Title and team name are required/);
  });

  test('returns initial survival stats', () => {
    const stats = db.getStats();
    assert.strictEqual(typeof stats.coffeesDrank, 'number');
    assert.strictEqual(typeof stats.prayersOffered, 'number');
    assert.strictEqual(typeof stats.bugsPromotedToFeatures, 'number');
  });

  test('increments survival metrics correctly', () => {
    const initialStats = db.getStats();
    const updatedCoffees = db.incrementStat('coffees');
    assert.strictEqual(updatedCoffees.coffeesDrank, initialStats.coffeesDrank + 1);

    const updatedPrayers = db.incrementStat('prayers');
    assert.strictEqual(updatedPrayers.prayersOffered, initialStats.prayersOffered + 1);

    const updatedBugs = db.incrementStat('bugs');
    assert.strictEqual(updatedBugs.bugsPromotedToFeatures, initialStats.bugsPromotedToFeatures + 1);
  });

  test('throws on unknown metric increment', () => {
    assert.throws(() => {
      db.incrementStat('sleep');
    }, /Invalid metric/);
  });
});
