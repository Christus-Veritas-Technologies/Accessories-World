# Production Deployment Guide - Accessories World

## Overview

This guide covers the complete setup for deploying Accessories World on a production VPS using PM2 (process management), Nginx (reverse proxy), and Let's Encrypt SSL.

**Key Information:**
- Repository path: `/var/www/accessories-world`
- Blog serves on Astro static (port 4321)
- All other apps run as Node.js services
- All domains route through Nginx with SSL

## Architecture

```
┌─────────────────────────────────────────────┐
│         Let's Encrypt SSL (HTTPS)           │
└────────────────────┬────────────────────────┘
                     │
┌────────────────────▼────────────────────────┐
│           Nginx (Reverse Proxy)             │
│          Listening on 80 & 443              │
└──────────────────────────────────────────────┘
     │         │         │        │       │
     │         │         │        │       │
  3000      3001      3002     3003    3004  4321
  web      admin   wholesale  server  agent  blog
  (Next)   (Next)   (Next)    (Hono)  (Bun) (Astro)
  │         │        │        │       │     │
  └─────────┴────────┴────────┴───────┴─────┴─→ PM2 Managed
```

## Prerequisites

- Ubuntu 20.04+ or similar Linux
- Bun runtime installed
- Node.js and npm (for PM2 global)
- `git` for version control
- PostgreSQL database running
- DNS already configured for all domains

## 1. Initial Setup

### Clone Repository

```bash
cd /var/www
sudo git clone <your-repo-url> accessories-world
cd accessories-world
sudo chown -R $USER:$USER /var/www/accessories-world
```

### Install Dependencies

```bash
bun install
```

### Build All Apps

```bash
bun run build
```

**Expected Output:**
```
Tasks:    6 successful, 6 total
```

## 2. Environment Configuration

### Server App (.env)

Edit `/var/www/accessories-world/apps/server/.env`:

```env
# Server port
PORT=3003

# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/accessories-world"

# App URLs (for CORS) - Production domains
WEB_URL=https://accessoriesworldmutare.co.zw
ADMIN_URL=https://admin.accessoriesworldmutare.co.zw
WHOLESALER_URL=https://wholesale.accessoriesworldmutare.co.zw
AGENT_URL=https://agent.accessoriesworldmutare.co.zw

# Email (SMTP Configuration)
SMTP_HOST=smtp.gmail.com
SMTP_SECURE=false
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD="your-app-password"
SMTP_FROM=your-email@gmail.com
BUSINESS_EMAIL=your-email@gmail.com
```

### Web App (.env)

Edit `/var/www/accessories-world/apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=https://api.accessoriesworldmutare.co.zw
```

### Admin App (.env)

Edit `/var/www/accessories-world/apps/admin/.env`:

```env
NEXT_PUBLIC_API_URL=https://api.accessoriesworldmutare.co.zw
```

### Wholesalers App (.env)

Edit `/var/www/accessories-world/apps/wholesalers/.env`:

```env
NEXT_PUBLIC_API_URL=https://api.accessoriesworldmutare.co.zw
```

### Agent App (.env)

Edit `/var/www/accessories-world/apps/agent/.env`:

```env
# Agent configuration
PORT=3004
```

### Blog App (.env)

Edit `/var/www/accessories-world/apps/blog/.env`:

```env
# Blog configuration
PORT=4321
```

## 3. PM2 Process Management

### Install PM2 Globally

```bash
sudo npm install -g pm2
```

### Start All Applications

Run from `/var/www/accessories-world`:

```bash
# Web App (port 3000)
pm2 start "bun run start" --name aw-web --cwd /var/www/accessories-world/apps/web

# Admin App (port 3001)
pm2 start "bun run start" --name aw-admin --cwd /var/www/accessories-world/apps/admin

# Wholesalers App (port 3002)
pm2 start "bun run start" --name aw-wholesalers --cwd /var/www/accessories-world/apps/wholesalers

# Server App (port 3003)
pm2 start "bun run start" --name aw-server --cwd /var/www/accessories-world/apps/server

# Agent App (port 3004)
pm2 start "bun run start" --name aw-agent --cwd /var/www/accessories-world/apps/agent

# Blog App (port 4321)
pm2 start "bunx astro preview --host 0.0.0.0" --name aw-blog --cwd /var/www/accessories-world/apps/blog
```

### Verify All Apps Are Running

```bash
pm2 list
pm2 logs
```

Expected output shows all 6 apps running.

### Save PM2 Configuration

```bash
pm2 save
```

### Enable PM2 Startup on Reboot

```bash
pm2 startup
# Run the output command that PM2 provides
```

### View Logs

```bash
# All logs
pm2 logs

# Specific app
pm2 logs aw-web

# Real-time monitoring
pm2 monit
```

## 4. Nginx Configuration

### Install Nginx

```bash
sudo apt update
sudo apt install nginx -y
```

### Create Nginx Configuration

Create `/etc/nginx/sites-available/accessoriesworldmutare`:

```nginx
# ─── WEB ───────────────────────────────────────────────────────────
server {
  listen 80;
  server_name accessoriesworldmutare.co.zw www.accessoriesworldmutare.co.zw;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}

# ─── ADMIN ──────────────────────────────────────────────────────────
server {
  listen 80;
  server_name admin.accessoriesworldmutare.co.zw;

  location / {
    proxy_pass http://127.0.0.1:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}

# ─── WHOLESALE ──────────────────────────────────────────────────────
server {
  listen 80;
  server_name wholesale.accessoriesworldmutare.co.zw;

  location / {
    proxy_pass http://127.0.0.1:3002;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}

# ─── API (SERVER) ───────────────────────────────────────────────────
server {
  listen 80;
  server_name api.accessoriesworldmutare.co.zw;

  location / {
    proxy_pass http://127.0.0.1:3003;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}

# ─── AGENT ──────────────────────────────────────────────────────────
server {
  listen 80;
  server_name agent.accessoriesworldmutare.co.zw;

  location / {
    proxy_pass http://127.0.0.1:3004;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}

# ─── BLOG (ASTRO) ───────────────────────────────────────────────────
server {
  listen 80;
  server_name blog.accessoriesworldmutare.co.zw;

  location / {
    proxy_pass http://127.0.0.1:4321;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

### Enable the Configuration

```bash
sudo ln -s /etc/nginx/sites-available/accessoriesworldmutare /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

## 5. SSL Certificate (Let's Encrypt)

### Install Certbot

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
```

### Issue SSL Certificate for All Domains

```bash
sudo certbot --nginx \
  -d accessoriesworldmutare.co.zw \
  -d www.accessoriesworldmutare.co.zw \
  -d admin.accessoriesworldmutare.co.zw \
  -d api.accessoriesworldmutare.co.zw \
  -d agent.accessoriesworldmutare.co.zw \
  -d wholesale.accessoriesworldmutare.co.zw \
  -d blog.accessoriesworldmutare.co.zw
```

**When prompted:**
- Enter your email
- Accept Let's Encrypt terms (A)
- Choose to redirect HTTP → HTTPS (2)

### Verify SSL Auto-Renewal

```bash
sudo certbot renew --dry-run
```

### Certificate Auto-Renewal

Let's Encrypt certificates auto-renew via `certbot` timer:

```bash
sudo systemctl status certbot.timer
```

## 6. Post-Deployment Verification

### Health Checks

```bash
# Web
curl -I https://accessoriesworldmutare.co.zw

# Admin
curl -I https://admin.accessoriesworldmutare.co.zw

# Wholesale
curl -I https://wholesale.accessoriesworldmutare.co.zw

# API
curl -I https://api.accessoriesworldmutare.co.zw

# Agent
curl -I https://agent.accessoriesworldmutare.co.zw

# Blog
curl -I https://blog.accessoriesworldmutare.co.zw
```

All should return `200 OK` or redirect to HTTPS.

### Check API Connectivity

```bash
curl -s https://api.accessoriesworldmutare.co.zw | jq .
```

Expected response:
```json
{
  "name": "Accessories World API",
  "version": "1.0.0",
  "status": "ok",
  "timestamp": "2025-03-01T10:00:00.000Z"
}
```

### Check PM2 Status

```bash
pm2 status
pm2 logs
```

## 7. Maintenance & Updates

### Rebuild After Code Changes

```bash
cd /var/www/accessories-world
git pull origin main
bun install
bun run build
```

### Restart Applications

```bash
# Restart specific app
pm2 restart aw-web

# Restart all apps
pm2 restart all

# Reload (zero-downtime)
pm2 reload all
```

### Database Migrations (if needed)

```bash
cd /var/www/accessories-world/packages/db
bun run prisma migrate deploy
```

### Monitor Logs

```bash
# Real-time
pm2 logs

# Specific app
pm2 logs aw-server

# View recent (last 100 lines)
pm2 logs aw-web --lines 100
```

## 8. Important Notes

### CORS Configuration

The API (`apps/server`) has CORS configured in `src/index.ts` using environment variables:

```typescript
cors({
  origin: [
    process.env.WEB_URL,        // https://accessoriesworldmutare.co.zw
    process.env.ADMIN_URL,      // https://admin.accessoriesworldmutare.co.zw
    process.env.WHOLESALER_URL, // https://wholesale.accessoriesworldmutare.co.zw
    process.env.AGENT_URL,      // https://agent.accessoriesworldmutare.co.zw
  ],
  credentials: true,
})
```

**Do not commit production `.env` files to Git!**

### Database Backups

Set up regular PostgreSQL backups:

```bash
# Create backup
pg_dump accessories-world > backup-$(date +%Y%m%d).sql

# Schedule with crontab (daily at 2 AM)
0 2 * * * pg_dump accessories-world > /backups/accessories-world-$(date +\%Y\%m\%d).sql
```

### Monitoring & Alerts

Consider adding:
- Sentry for error tracking
- LogRocket for session replay
- Uptime monitoring (Pingdom, UptimeRobot)
- Email alerts for PM2 crashes

### Security Best Practices

1. ✅ Use HTTPS everywhere (Let's Encrypt)
2. ✅ Keep dependencies updated (`bun update`)
3. ✅ Use strong database passwords
4. ✅ Configure firewall rules
5. ✅ Enable basic auth on `/admin` if needed
6. ✅ Use environment variables for secrets

### Rollback Plan

```bash
# If something breaks, revert to previous commit
git revert HEAD
bun install
bun run build
pm2 restart all
```

## Troubleshooting

### Port Already in Use

```bash
# Find process on port 3000
lsof -i :3000
# Kill it
kill -9 <PID>
```

### Nginx Not Working

```bash
# Test config
sudo nginx -t
# Check status
sudo systemctl status nginx
# View error logs
sudo tail -f /var/log/nginx/error.log
```

### PM2 App Not Starting

```bash
# View logs
pm2 logs <app-name>
# Check app config
pm2 show <app-name>
# Delete and restart
pm2 delete <app-name>
pm2 start "bun run start" --name <app-name> --cwd /path/to/app
```

### Database Connection Issues

```bash
# Test connection
psql -h localhost -U postgres -d accessories-world
# Check DATABASE_URL in .env
echo $DATABASE_URL
```

## Support

For issues or questions, check:
- PM2 logs: `pm2 logs`
- Nginx logs: `/var/log/nginx/`
- Database logs: PostgreSQL logs
- Application errors: View in browser console or PM2 logs
