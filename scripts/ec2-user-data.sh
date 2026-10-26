#!/bin/bash
# ==============================================================================
# AWS EC2 User Data Bootstrap Script for ShipIt48
# Paste this directly into the "Advanced details > User data" field when launching
# an Amazon Linux 2023 or Ubuntu EC2 instance.
# ==============================================================================

set -e
exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1

echo "🚀 Starting EC2 User Data automation for ShipIt48..."

# 1. Update OS and Install git & node
if command -v dnf >/dev/null 2>&1; then
  dnf update -y
  dnf install -y git nodejs npm
elif command -v apt-get >/dev/null 2>&1; then
  apt-get update -y
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y git nodejs
fi

# 2. Setup project in /opt/shipit48
mkdir -p /opt/shipit48
cd /opt/shipit48

# If cloned from Git repository, replace the clone URL below:
# git clone <YOUR_REPO_URL> /opt/shipit48

# Alternatively, run deploy-ec2.sh if repository exists
if [ -f "/opt/shipit48/scripts/deploy-ec2.sh" ]; then
  bash /opt/shipit48/scripts/deploy-ec2.sh
else
  echo "ℹ️ Note: If bootstrapping without a remote Git URL, transfer project files into /opt/shipit48 and run: sudo bash scripts/deploy-ec2.sh"
fi

echo "✅ User Data script completed."
