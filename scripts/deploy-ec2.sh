#!/bin/bash
set -e

# ==============================================================================
# ShipIt48 - Automated AWS EC2 Deployment Script
# Supports: Amazon Linux 2023, Amazon Linux 2, Ubuntu 20.04/22.04/24.04
# ==============================================================================

echo "🚀 Starting ShipIt48 EC2 Deployment..."

# Check sudo / root
if [ "$EUID" -ne 0 ]; then
  echo "⚠️ Please run with sudo: sudo bash scripts/deploy-ec2.sh"
  exit 1
fi

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
echo "📂 Project Directory: ${APP_DIR}"

# 1. Detect OS and Install Node.js if missing
if ! command -v node >/dev/null 2>&1; then
  echo "📦 Node.js not detected. Installing Node.js LTS..."
  if command -v dnf >/dev/null 2>&1; then
    dnf install -y nodejs npm
  elif command -v yum >/dev/null 2>&1; then
    curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
    yum install -y nodejs
  elif command -v apt-get >/dev/null 2>&1; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
  else
    echo "❌ Unsupported package manager. Please install Node.js 18+ manually."
    exit 1
  fi
fi

NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)
echo "✅ Node.js: ${NODE_VERSION} | npm: ${NPM_VERSION}"

# 2. Install Project Dependencies
echo "📦 Installing production dependencies..."
cd "${APP_DIR}"
npm install --omit=dev

# 3. Detect AWS EC2 Region via IMDSv2
AWS_REGION="us-east-1"
echo "☁️ Querying AWS Instance Metadata Service..."
IMDS_TOKEN=$(curl -s -m 2 -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 60" 2>/dev/null || true)
if [ -n "$IMDS_TOKEN" ]; then
  DETECTED_REGION=$(curl -s -m 2 -H "X-aws-ec2-metadata-token: $IMDS_TOKEN" http://169.254.169.254/latest/meta-data/placement/region 2>/dev/null || true)
  if [ -n "$DETECTED_REGION" ]; then
    AWS_REGION="$DETECTED_REGION"
    echo "✅ Detected EC2 Region: ${AWS_REGION}"
  fi
fi

# 4. Generate .env if missing
if [ ! -f "${APP_DIR}/.env" ]; then
  echo "⚙️ Creating .env configuration..."
  cat > "${APP_DIR}/.env" <<EOF
PORT=3000
NODE_ENV=production
AWS_REGION=${AWS_REGION}
APP_TITLE=ShipIt48 - 48h Hackathon Survival Hub
HACKATHON_NAME=Hack48: Sleep is Optional
HACKATHON_HOURS=48
ADMIN_PASSCODE=hackathon-secret-key
EOF
fi

# 5. Determine Non-Root Service User and Node Binary
NODE_BIN="$(command -v node)"
SERVICE_USER="${SUDO_USER:-ec2-user}"
if ! id "$SERVICE_USER" >/dev/null 2>&1; then
  if id "ubuntu" >/dev/null 2>&1; then
    SERVICE_USER="ubuntu"
  else
    SERVICE_USER="nobody"
  fi
fi

echo "👤 Service will run as unprivileged user: ${SERVICE_USER}"
echo "📍 Node binary: ${NODE_BIN}"

# Ensure data directory and env file are owned by service user
mkdir -p "${APP_DIR}/data"
chown -R "${SERVICE_USER}" "${APP_DIR}/data" "${APP_DIR}/.env" 2>/dev/null || true

# 6. Create systemd Service Unit
echo "🔧 Configuring systemd service (shipit48.service)..."
cat > /etc/systemd/system/shipit48.service <<EOF
[Unit]
Description=ShipIt48 Hackathon Survival Dashboard
After=network.target

[Service]
Type=simple
User=${SERVICE_USER}
WorkingDirectory=${APP_DIR}
ExecStart=${NODE_BIN} ${APP_DIR}/src/server.js
Restart=always
RestartSec=5
EnvironmentFile=${APP_DIR}/.env

[Install]
WantedBy=multi-user.target
EOF

# 7. Enable and Start Service
echo "🔄 Reloading systemd and starting ShipIt48..."
systemctl daemon-reload
systemctl enable shipit48.service
systemctl start shipit48.service
systemctl restart shipit48.service

# 8. Optional Port 80 -> 3000 forwarding via iptables
if command -v iptables >/dev/null 2>&1; then
  echo "🌐 Setting up Port 80 -> 3000 redirect (allows direct HTTP access)..."
  iptables -t nat -C PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 3000 2>/dev/null || \
  iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 3000 || true
fi

# 9. Check health
sleep 2
echo "🩺 Verifying service health..."
if curl -s http://127.0.0.1:3000/health | grep -q '"status":"ok"'; then
  echo "=========================================================="
  echo "🎉 SUCCESS: ShipIt48 is running and healthy!"
  echo "📡 Local endpoint: http://localhost:3000"
  echo "🌍 Public endpoint: http://<EC2-PUBLIC-IP>:3000 (or http://<EC2-PUBLIC-IP>)"
  echo "❤️ Health Check:   http://<EC2-PUBLIC-IP>:3000/health"
  echo "=========================================================="
else
  echo "⚠️ Service started, but health check did not respond immediately. Check logs with: journalctl -u shipit48.service -n 50"
fi
