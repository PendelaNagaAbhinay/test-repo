const fs = require('fs');
const path = require('path');

const DEFAULT_DB_PATH = path.resolve(__dirname, '../data/db.json');

const INITIAL_PROJECTS = [
  {
    id: 'proj-1',
    title: 'GitPushAndPray',
    teamName: '3 AM Panic',
    tag: 'Held Together By Duct Tape',
    description: 'A revolutionary cloud service that we came up with 4 hours ago and definitely didn’t test.',
    knownBugs: 'Crashes if more than 1 judge looks at it simultaneously.',
    demoUrl: 'https://example.com/demo1',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'proj-2',
    title: 'ToasterChain 3.0',
    teamName: 'Buzzword Bandits',
    tag: 'Works On My Machine',
    description: 'Decentralized breakfast toast verification using zero-knowledge bread proofs.',
    knownBugs: 'Only browns toast on localhost:3000.',
    demoUrl: 'https://example.com/demo2',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    id: 'proj-3',
    title: 'DebugMeMaybe',
    teamName: 'Stack Overflowers',
    tag: '99% ChatGPT Prompts',
    description: 'An AI assistant that replaces compiler errors with reassuring cat photos.',
    knownBugs: 'Generates recursive memes until server runs out of RAM.',
    demoUrl: 'https://example.com/demo3',
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString()
  }
];

const INITIAL_STATS = {
  coffeesDrank: 48,
  prayersOffered: 124,
  bugsPromotedToFeatures: 23
};

function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : '';
}

class DB {
  constructor() {
    this.dbPath = DEFAULT_DB_PATH;
    this.projects = [];
    this.stats = { ...INITIAL_STATS };
    this.init(DEFAULT_DB_PATH);
  }

  init(filePath) {
    this.dbPath = filePath || DEFAULT_DB_PATH;
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(this.dbPath)) {
      try {
        const raw = fs.readFileSync(this.dbPath, 'utf8');
        const parsed = JSON.parse(raw);
        this.projects = Array.isArray(parsed.projects) ? parsed.projects : [...INITIAL_PROJECTS];
        this.stats = parsed.stats || { ...INITIAL_STATS };
        return;
      } catch (err) {
        // Fall back to seed if corrupt
      }
    }

    this.projects = [...INITIAL_PROJECTS];
    this.stats = { ...INITIAL_STATS };
    this.save();
  }

  save() {
    try {
      const data = {
        projects: this.projects,
        stats: this.stats,
        lastUpdated: new Date().toISOString()
      };
      fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
      console.error('Failed to save db.json:', err.message);
    }
  }

  getProjects() {
    return [...this.projects];
  }

  addProject(data) {
    if (!data || !data.title || !data.title.trim() || !data.teamName || !data.teamName.trim()) {
      throw new Error('Title and team name are required');
    }

    const newProject = {
      id: 'proj-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      title: data.title.trim(),
      teamName: data.teamName.trim(),
      tag: data.tag ? data.tag.trim() : 'Works On My Machine',
      description: data.description ? data.description.trim() : 'No description provided (probably coding).',
      knownBugs: data.knownBugs ? data.knownBugs.trim() : 'None admitted (yet).',
      demoUrl: sanitizeUrl(data.demoUrl),
      createdAt: new Date().toISOString()
    };

    this.projects.unshift(newProject);
    this.save();
    return newProject;
  }

  getStats() {
    return { ...this.stats };
  }

  incrementStat(metric) {
    if (metric === 'coffees') {
      this.stats.coffeesDrank += 1;
    } else if (metric === 'prayers') {
      this.stats.prayersOffered += 1;
    } else if (metric === 'bugs') {
      this.stats.bugsPromotedToFeatures += 1;
    } else {
      throw new Error('Invalid metric. Allowed: coffees, prayers, bugs');
    }

    this.save();
    return { ...this.stats };
  }

  resetData() {
    this.projects = [...INITIAL_PROJECTS];
    this.stats = { ...INITIAL_STATS };
    this.save();
  }
}

const instance = new DB();
module.exports = instance;
