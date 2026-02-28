#!/bin/bash

# Accessories World - Production Deployment Script
# This script automates the core deployment steps on the VPS

set -e

echo "🚀 Accessories World - Production Deployment Script"
echo "=================================================="

# Configuration
REPO_PATH="/var/www/accessories-world"
BRANCH=${1:-main}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
    exit 1
}

# Step 1: Update Repository
echo ""
echo "Step 1: Updating repository..."
cd "$REPO_PATH"
git fetch origin
git checkout "$BRANCH"
git pull origin "$BRANCH"
log_info "Repository updated"

# Step 2: Install/Update Dependencies
echo ""
echo "Step 2: Installing dependencies..."
bun install
log_info "Dependencies installed"

# Step 3: Build All Apps
echo ""
echo "Step 3: Building applications..."
bun run build
log_info "Build completed"

# Step 4: Stop Current Apps (gracefully)
echo ""
echo "Step 4: Restarting PM2 apps..."
if command -v pm2 &> /dev/null; then
    pm2 reload all
    log_info "PM2 apps reloaded"
else
    log_warn "PM2 not installed or not in PATH"
fi

# Step 5: Verify
echo ""
echo "Step 5: Verifying deployment..."
echo ""
echo "PM2 Status:"
pm2 list
echo ""
echo "Testing API health..."
HEALTH_CHECK=$(curl -s http://127.0.0.1:3003/health | grep -q "ok" && echo "✓" || echo "✗")
echo "API Health: $HEALTH_CHECK"

echo ""
log_info "Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Check logs: pm2 logs"
echo "2. Monitor: pm2 monit"
echo "3. Full logs: pm2 logs <app-name>"
echo ""
echo "Deployed apps:"
echo "  - Web:         https://accessoriesworldmutare.co.zw"
echo "  - Admin:       https://admin.accessoriesworldmutare.co.zw"
echo "  - Wholesale:   https://wholesale.accessoriesworldmutare.co.zw"
echo "  - API:         https://api.accessoriesworldmutare.co.zw"
echo "  - Agent:       https://agent.accessoriesworldmutare.co.zw"
echo "  - Blog:        https://blog.accessoriesworldmutare.co.zw"
