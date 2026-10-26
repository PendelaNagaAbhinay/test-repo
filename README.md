# ShipIt48 🚀 - 48-Hour Hackathon Survival Dashboard

A lightweight, satirical full-stack dashboard designed for seamless demonstration and rapid deployment on **AWS EC2** (including free-tier `t2.micro` / `t3.micro`).

Poking fun at the chaos of 48-hour hackathons, ShipIt48 features an active countdown timer with dynamic panic milestones, community survival counters (Espressos downed, prayers to demo gods, bugs certified as features), and an interactive project submission and confession board.

---

## 🏗️ Architecture & Tech Stack

- **Backend**: Node.js + Express.js single-process REST API and static asset server.
- **Frontend**: Clean semantic HTML5, modern vanilla JavaScript, Tailwind CSS via CDN, and Lucide icons via CDN (zero build step, instant load).
- **Data Persistence**: In-memory store with automated local JSON synchronization (`data/db.json`), requiring zero external databases.
- **Footprint**: < 35MB RAM, boots in under 1 second, runs smoothly on any AWS EC2 instance.

---

## ⚙️ Environment Variables (`.env`)

Configure the application by creating or editing `.env` (a template is provided in `.env.example`):

| Variable | Default | Description |
| :--- | :--- | :--- |
| `PORT` | `3000` | Port on which the Express server listens. |
| `NODE_ENV` | `production` | Runtime mode (`development` or `production`). |
| `AWS_REGION` | `us-east-1` | AWS Region displayed on the live status badge. Automatically detected on EC2. |
| `APP_TITLE` | `ShipIt48 - 48h Hackathon Survival Hub` | Application header and title. |
| `HACKATHON_NAME` | `Hack48: Sleep is Optional` | Event name displayed in the countdown hero. |
| `HACKATHON_HOURS`| `48` | Hackathon duration in hours. |
| `ADMIN_PASSCODE` | `hackathon-secret-key` | Passcode for administrative overrides. |

---

## 💻 Local Quickstart

### Prerequisites
- Node.js v18.0.0 or higher
- npm

### Run Locally
```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env

# 3. Start development server
npm start

# 4. Open in browser
# http://localhost:3000
```

### Run Tests
```bash
npm test
```

---

## ☁️ Deploying to AWS EC2

### Step 1: Launch an EC2 Instance
1. Open the [AWS EC2 Console](https://console.aws.amazon.com/ec2/).
2. Click **Launch Instance**.
3. Choose an AMI:
   - **Amazon Linux 2023** (Recommended) or **Ubuntu 22.04/24.04 LTS**.
4. Instance Type:
   - Select **`t2.micro`** or **`t3.micro`** (Free Tier eligible).
5. Key Pair:
   - Select your existing key pair or create a new one to enable SSH access.

### Step 2: Configure EC2 Security Group
Ensure the instance's Security Group allows inbound traffic on:
- **SSH (Port 22)**: From your IP.
- **HTTP (Port 80)**: From `0.0.0.0/0` (Anywhere).
- **Custom TCP (Port 3000)**: From `0.0.0.0/0` (Anywhere).

### Step 3: Run Automated Deployment Script
Connect to your EC2 instance via SSH:
```bash
ssh -i your-key.pem ec2-user@<YOUR-EC2-PUBLIC-IP>
# (Or 'ubuntu@<YOUR-EC2-PUBLIC-IP>' if using Ubuntu)
```

Clone or copy the project into the instance, and run the automated deployment script:
```bash
cd test-repo # or your project directory
sudo bash scripts/deploy-ec2.sh
```

**What `deploy-ec2.sh` does automatically:**
1. Installs Node.js LTS and npm if not already present.
2. Installs production dependencies (`npm install --omit=dev`).
3. Queries AWS Instance Metadata Service (IMDSv2) to automatically set your EC2 region in `.env`.
4. Creates a `systemd` service (`/etc/systemd/system/shipit48.service`) with auto-restart on crashes.
5. Enables and starts the `shipit48` service.
6. Sets up an optional iptables port forward (Port 80 -> Port 3000).

### Step 4: Verify Deployment
1. Open your browser and navigate to:
   ```text
   http://<YOUR-EC2-PUBLIC-IP>:3000
   ```
   *(Or simply `http://<YOUR-EC2-PUBLIC-IP>` if port 80 redirect was applied)*
2. Check the live health check endpoint:
   ```text
   http://<YOUR-EC2-PUBLIC-IP>:3000/health
   ```
   Expected response:
   ```json
   {
     "status": "ok",
     "uptime": 42,
     "env": "production",
     "region": "us-east-1",
     "timestamp": "2026-10-27T12:00:00.000Z"
   }
   ```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Health check for AWS Target Groups, uptime & region status. |
| `GET` | `/api/info` | Hackathon details and humorous milestones. |
| `GET` | `/api/projects` | List all submitted projects and confessions. |
| `POST`| `/api/projects` | Submit a project (`title`, `teamName`, `tag`, `description`, `knownBugs`, `demoUrl`). |
| `GET` | `/api/stats` | Retrieve live survival counters (`coffees`, `prayers`, `bugs`). |
| `POST`| `/api/stats/:metric/increment` | Increment metric (`coffees`, `prayers`, `bugs`). |

---

## 🛠️ Management & Service Control

When deployed via `systemd` on EC2, manage the service with standard systemctl commands:
```bash
# Check service status
sudo systemctl status shipit48

# View live application logs
sudo journalctl -u shipit48 -f

# Restart application
sudo systemctl restart shipit48

# Stop application
sudo systemctl stop shipit48
```
