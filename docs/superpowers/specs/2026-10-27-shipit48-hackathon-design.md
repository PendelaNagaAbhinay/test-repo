# ShipIt48 - 48-Hour Hackathon Survival Dashboard Design

## 1. Intent and The Why
The goal is to build a lightweight, self-contained, and entertaining full-stack application centered on a 48-hour hackathon theme with subtle, relatable humor (e.g., caffeine meters, panic phases, "works on my machine" confessions). It serves as a practical, easy-to-demonstrate project specifically tailored for deployment on an AWS EC2 instance (including free-tier `t2.micro`/`t3.micro`), requiring minimal resources, zero complex build chains, and clean environment variable management.

## 2. Goals, Non-Goals, and Anti-Goals

### Goals
- **Self-Contained & Lightweight**: Monolithic Node.js/Express service serving a rich, responsive frontend without needing a bundler (Webpack/Vite) or external database.
- **Satirical / Fun Theme**: Incorporates lighthearted hackathon tropes (48h countdown, stages of hackathon panic, coffee counters, project confessions like "Demo gods please spare us").
- **AWS EC2 Ready**: Complete with `.env` handling, health checks for AWS target groups/monitoring, an EC2 deployment script (`deploy-ec2.sh`), and an EC2 User Data bootstrap script.
- **Interactive**: Allows real-time project submissions, live stats incrementing (coffee counter, prayer counts), and countdown rendering.

### Non-Goals
- Multi-region database synchronization or enterprise auth (OAuth, IAM STS tokens).
- Heavyweight microservices or container orchestration (Kubernetes/ECS), though a basic Dockerfile may optionally be provided for completeness.
- Real-time WebSockets (polling or simple fetch requests suffice for simplicity and robustness).

### Anti-Goals
- Over-engineering: No complex ORM, external managed databases (RDS), or memory-hungry multi-stage build processes that crash `t2.micro` instances.
- Bland, generic template: Avoiding dull lorem-ipsum templates in favor of tailored hackathon humor and personality.

## 3. Constraints
- **Resource Limits**: Must run comfortably on AWS EC2 `t2.micro` (1 vCPU, 1 GB RAM) without memory pressure.
- **Portability**: Must support both local development (`npm start`) and Linux EC2 environments (systemd or PM2) with standard environment variable configuration.
- **OS Support**: EC2 deployment scripts targeting Amazon Linux 2023 and Ubuntu 22.04/24.04 LTS.

## 4. Approaches Considered

### Approach 1: Node.js (Express) Single-Service with Modern Vanilla/Tailwind CDN Frontend (Chosen)
- **Description**: Express serves both REST API endpoints and static assets (HTML/CSS/JS). Frontend is built with modern ES6 and Tailwind CSS loaded via CDN.
- **Pros**: Zero build step, sub-second boot time, under 40MB memory footprint, instant deployment, clean `.env` consumption via standard Node `process.env`.
- **Cons**: Does not use a component-based SPA framework (React/Vue), but is far more maintainable and resilient for basic demos.
- **Decision**: Selected by the user for its lightweight nature, simplicity, and ease of demonstration on EC2.

### Approach 2: Decoupled React (Vite) + Express API with Docker Compose
- **Description**: Separate `client` and `server` folders managed by Docker Compose and reverse-proxied by Nginx.
- **Trade-offs**: Better SPA structure, but requires 500MB+ RAM during build, slower CI/CD, and more operational complexity on EC2. Dropped.

### Approach 3: Python (FastAPI) Monolith
- **Description**: Python FastAPI backend with Jinja2 templates.
- **Trade-offs**: Clean, but Node.js has broader plug-and-play familiarity for full-stack JavaScript demos with zero virtual environment setup hurdles. Dropped.

## 5. System Specification

### 5.1 Architecture & Tech Stack
- **Runtime**: Node.js (v18+ or v20 LTS)
- **Framework**: Express.js
- **Frontend**: Single Page Application served from `public/` (semantic HTML5, modern vanilla JavaScript, Tailwind CSS via CDN, Lucide icons via CDN)
- **Data Persistence**: In-memory store initialized with seed mock data, with automatic persistence to a local JSON file (`data/db.json`) so submissions survive restarts.
- **Config**: `dotenv` reading from `.env`.

### 5.2 Environment Variables (`.env`)
- `PORT`: Server port (default: `3000`)
- `NODE_ENV`: Runtime environment (`development` | `production`)
- `AWS_REGION`: Displayed in UI header to prove AWS deployment (e.g., `us-east-1` or `eu-west-1`)
- `APP_TITLE`: Application header title
- `HACKATHON_NAME`: Name of the event (e.g., "Hack48: Sleep is Optional")
- `HACKATHON_HOURS`: Duration in hours (default: `48`)
- `ADMIN_PASSCODE`: Secret code for resetting or clearing stats

### 5.3 Backend REST API
- `GET /health`
  - Returns `{ status: "ok", uptime: number, env: string, region: string, timestamp: string }`
- `GET /api/info`
  - Returns hackathon details, start time, target duration, and humorous milestone guide (e.g., Hour 0-12: The Grand Architecture; Hour 13-24: Reality Sets In; Hour 25-36: Deleting Features; Hour 37-48: Praying to the Demo Gods).
- `GET /api/projects`
  - Returns list of submitted projects.
- `POST /api/projects`
  - Body: `{ title, teamName, tag, description, knownBugs, demoUrl }`
  - Validates inputs, saves to JSON store, returns the created project.
- `GET /api/stats`
  - Returns current counter: `{ coffeesDrank, prayersOffered, bugsPromotedToFeatures }`
- `POST /api/stats/:metric/increment`
  - Increments one of the counters (`coffees`, `prayers`, `bugs`) and returns updated counts.

### 5.4 Frontend Interface Features
1. **Header & AWS Deployment Badge**:
   - Displays live AWS Region & EC2 instance status fetched from `/health`.
2. **The 48-Hour Survival Countdown**:
   - Live visual countdown clock with progress bar.
   - Dynamic humorous status message updating based on elapsed time (e.g., "Current Phase: Deleting unit tests to save time").
3. **Hackathon Survival Meter (Interactive Counters)**:
   - "Caffeine Units Ingested" (Click to add +1)
   - "Prayers to Demo Gods" (Click to send a prayer)
   - "Bugs Promoted to 'Features'" (Click to certify a bug)
4. **Project Showcase & "Confession" Board**:
   - Grid of projects with funny badges (e.g., `Works On My Machine`, `Held by Duct Tape`, `99% ChatGPT`, `Don't Touch That Button`).
   - Modal/form to submit a new project with title, team name, badge selector, and "Known Bugs / Confession".

### 5.5 EC2 Deployment Package
- `scripts/deploy-ec2.sh`: Shell script to clone repo, install Node, generate `.env`, configure a `systemd` service (`shipit48.service`), and start/restart the server.
- `scripts/ec2-user-data.sh`: Ready-to-use user-data script for AWS EC2 instance launch template.
- `README.md`: Clear step-by-step instructions for:
  1. Launching an EC2 instance (Amazon Linux 2023 or Ubuntu).
  2. Configuring EC2 Security Group (Ports 22, 80, 3000).
  3. Deploying via User Data or Git clone + `deploy-ec2.sh`.
  4. Verifying via Public IPv4 DNS and `/health`.

## 6. What's Left to the Builder
- Fine-tuning seed projects and satirical quote lists.
- Exact CSS layout styling and color palette (dark tech aesthetic with neon accents).
- Error handling details and input sanitization on API routes.
