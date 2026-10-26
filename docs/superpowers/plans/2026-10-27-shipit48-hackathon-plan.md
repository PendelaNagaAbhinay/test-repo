# ShipIt48 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a lightweight, humorous 48-hour hackathon survival dashboard (Node.js/Express + vanilla/Tailwind frontend) with relevant `.env` configuration, health checks, and automated AWS EC2 deployment scripts.

**Architecture:** Monolithic Express.js service serving a REST API and static frontend assets without bundler overhead. Persistent JSON data layer storing projects and survival counters. Clean environment variable configuration with full AWS EC2 deployment automation (systemd + User Data script).

**Tech Stack:** Node.js (v18+ / v20 LTS), Express.js, dotenv, Node.js native test runner (`node --test`), Tailwind CSS (CDN), Lucide Icons (CDN), Bash (EC2 deployment).

**Spec:** `docs/superpowers/specs/2026-10-27-shipit48-hackathon-design.md`

## Global Constraints
- **Runtime:** Node.js v18.0.0 or higher with zero build step (no Webpack, Vite, or Babel required).
- **Lightweight:** Entire app memory usage under 50MB, running smoothly on AWS EC2 `t2.micro` or `t3.micro`.
- **Environment Variables:** All environment configurations loaded via `dotenv` and surfaced through `src/config.js`.
- **Testing:** Node.js native test runner (`node --test`) to avoid bulky testing framework dependencies.

## Review Focus
1. **Invalid project submission payload:** Missing title or team name returns 400 Bad Request with a clear error message.
2. **Missing `.env` file:** System falls back safely to sensible defaults (port 3000, region "us-east-1", default hackathon name).
3. **Invalid survival metric:** `POST /api/stats/unknown/increment` returns 400 Bad Request rather than crashing or corrupting memory.
4. **Data directory persistence:** Missing `data/` directory or missing `data/db.json` is automatically created on boot.
5. **Non-root port binding on EC2:** Deployment script safely runs service as non-root user and maps or serves cleanly.

---

### Task 1: Scaffolding, Package Setup, and Configuration Module

**Files:**
- Create: `package.json`
- Create: `.env.example`
- Create: `.env`
- Create: `src/config.js`
- Test: `tests/config.test.js`

**Interfaces:**
- Produces: `src/config.js` exporting `{ port, nodeEnv, awsRegion, appTitle, hackathonName, hackathonHours, adminPasscode }`

- [ ] **Step 1: Write failing config test in `tests/config.test.js`**
Test that `src/config.js` correctly reads defaults and environment overrides.

- [ ] **Step 2: Run test to verify it fails**
Run: `node --test tests/config.test.js`
Expected: FAIL (module `src/config.js` not found).

- [ ] **Step 3: Implement `package.json`, `.env.example`, `.env`, and `src/config.js`**
Configure dependencies (`express`, `dotenv`), type module or CommonJS (CommonJS for simplicity across standard EC2 LTS), and export configuration with fallbacks.

- [ ] **Step 4: Run test to verify it passes**
Run: `node --test tests/config.test.js`
Expected: PASS.

---

### Task 2: Data Store and Persistence (`src/db.js`)

**Files:**
- Create: `src/db.js`
- Test: `tests/db.test.js`

**Interfaces:**
- Consumes: none
- Produces: `src/db.js` exporting:
  - `getProjects(): Array<Project>`
  - `addProject(projectData: Object): Project`
  - `getStats(): { coffeesDrank: number, prayersOffered: number, bugsPromotedToFeatures: number }`
  - `incrementStat(metric: 'coffees' | 'prayers' | 'bugs'): Object`
  - `resetData(): void`

- [ ] **Step 1: Write failing test in `tests/db.test.js`**
Test project listing, project addition with seed validation, stat incrementing, and handling of invalid stat keys.

- [ ] **Step 2: Run test to verify it fails**
Run: `node --test tests/db.test.js`
Expected: FAIL (`src/db.js` not found).

- [ ] **Step 3: Implement `src/db.js`**
In-memory store preloaded with humorous hackathon seeds, auto-persisting to `data/db.json` safely.

- [ ] **Step 4: Run test to verify it passes**
Run: `node --test tests/db.test.js`
Expected: PASS.

---

### Task 3: Express API and Health Check Routes

**Files:**
- Create: `src/app.js`
- Create: `src/server.js`
- Test: `tests/api.test.js`

**Interfaces:**
- Consumes: `src/config.js`, `src/db.js`
- Produces: Express application handling:
  - `GET /health`
  - `GET /api/info`
  - `GET /api/projects`
  - `POST /api/projects`
  - `GET /api/stats`
  - `POST /api/stats/:metric/increment`

- [ ] **Step 1: Write failing integration tests in `tests/api.test.js`**
Test `/health`, `/api/info`, `/api/projects` (GET & POST with validation), and `/api/stats` (GET & increment).

- [ ] **Step 2: Run test to verify it fails**
Run: `node --test tests/api.test.js`
Expected: FAIL (`src/app.js` not found).

- [ ] **Step 3: Implement `src/app.js` and `src/server.js`**
Implement Express middleware (json, static serving of `public/`, cors, logging) and REST routes matching the design spec.

- [ ] **Step 4: Run test to verify it passes**
Run: `node --test tests/api.test.js`
Expected: PASS.

---

### Task 4: Frontend Hackathon Survival Dashboard UI

**Files:**
- Create: `public/index.html`
- Create: `public/app.js`
- Create: `public/styles.css`

**Interfaces:**
- Consumes: REST API endpoints (`/health`, `/api/info`, `/api/projects`, `/api/stats`, `/api/stats/:metric/increment`)
- Produces: Interactive web UI with live countdown, satirical milestones, survival counters, and project submission board.

- [ ] **Step 1: Create `public/index.html`**
HTML5 structure with Tailwind CSS CDN, Lucide icon CDN, AWS status banner, 48h countdown card, survival counter buttons, submission modal, and project grid.

- [ ] **Step 2: Create `public/styles.css`**
Custom styles for dark hackathon theme, neon glow badges, countdown pulse, and clean modal transitions.

- [ ] **Step 3: Create `public/app.js`**
Client-side script handling:
- Fetching `/health` to display live AWS Region and status badge.
- Calculating dynamic 48-hour countdown and hilarious milestone phase text.
- Interactive survival counter clicks with optimistic UI updates.
- Project submission form handler with validation and humorous tag selection.

- [ ] **Step 4: Verify static frontend served by Express**
Start server, test endpoint `GET /` returns HTML containing app title and container elements.

---

### Task 5: AWS EC2 Deployment Automation and Documentation

**Files:**
- Create: `scripts/deploy-ec2.sh`
- Create: `scripts/ec2-user-data.sh`
- Create: `README.md`

**Interfaces:**
- Consumes: complete repository setup
- Produces: turnkey deployment on AWS EC2 Amazon Linux 2023 / Ubuntu instances.

- [ ] **Step 1: Create `scripts/deploy-ec2.sh`**
Bash script to install Node.js LTS, install production dependencies, configure `systemd` service (`/etc/systemd/system/shipit48.service`), open firewall/port 3000, and start the service.

- [ ] **Step 2: Create `scripts/ec2-user-data.sh`**
Cloud-init user-data script suitable for pasting directly into the AWS EC2 "Launch Instance" Advanced Details box to spin up and run the app automatically on boot.

- [ ] **Step 3: Create comprehensive `README.md`**
Clear instructions for local testing, EC2 manual deployment, EC2 user-data deployment, security group requirements (port 80/3000/22), and `.env` guide.

- [ ] **Step 4: Verify complete end-to-end test suite**
Run: `npm test`
Verify all tests pass and verify all files exist and are executable where needed.
