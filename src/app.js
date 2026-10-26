const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const db = require('./db');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.resolve(__dirname, '../public')));

// Health check for EC2 / Load Balancer
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    env: config.nodeEnv,
    region: config.awsRegion,
    timestamp: new Date().toISOString()
  });
});

// Event metadata & satirical milestones
app.get('/api/info', (req, res) => {
  res.status(200).json({
    hackathonName: config.hackathonName,
    durationHours: config.hackathonHours,
    appTitle: config.appTitle,
    region: config.awsRegion,
    milestones: [
      { hour: 0, title: 'Kickoff & Delusional Ambition', desc: 'Everyone plans a distributed multi-agent blockchain drone system in 48 hours.' },
      { hour: 12, title: 'Security Group Hell', desc: 'Spending 3 hours realizing AWS inbound port 3000 was never opened.' },
      { hour: 24, title: 'Mass Scope Deletion', desc: 'Cutting 85% of proposed features to save the project from certain doom.' },
      { hour: 36, title: 'Peak Caffeine Velocity', desc: 'Coffee intake peaks; centering a div becomes an existential crisis.' },
      { hour: 44, title: 'The Unit Test Purge', desc: 'git commit -m "delete unit tests that do not appreciate my demo code".' },
      { hour: 48, title: 'Ship It & Pray', desc: 'Praying to demo gods that the live EC2 IP address resolves during presentations.' }
    ]
  });
});

// List all submitted hackathon projects
app.get('/api/projects', (req, res) => {
  res.status(200).json(db.getProjects());
});

// Submit a new project
app.post('/api/projects', (req, res) => {
  try {
    const { title, teamName, tag, description, knownBugs, demoUrl } = req.body;
    const project = db.addProject({ title, teamName, tag, description, knownBugs, demoUrl });
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get current survival statistics
app.get('/api/stats', (req, res) => {
  res.status(200).json(db.getStats());
});

// Increment survival metric (coffees, prayers, bugs)
app.post('/api/stats/:metric/increment', (req, res) => {
  try {
    const updated = db.incrementStat(req.params.metric);
    res.status(200).json({ message: 'Survival stat incremented', stats: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Catch-all for undefined API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

module.exports = app;
