# Production Quick Reference

## Deployment Command (One-liner)

```bash
cd /var/www/accessories-world && \
git pull origin main && \
bun install && \
bun run build && \
pm2 restart all && \
pm2 save
```

## Port & Domain Map

| App | Port | Domain | PM2 Name |
|-----|------|--------|----------|
| Web | 3000 | accessoriesworldmutare.co.zw | aw-web |
| Admin | 3001 | admin.accessoriesworldmutare.co.zw | aw-admin |
| Wholesale | 3002 | wholesale.accessoriesworldmutare.co.zw | aw-wholesalers |
| API Server | 3003 | api.accessoriesworldmutare.co.zw | aw-server |
| Agent | 3004 | agent.accessoriesworldmutare.co.zw | aw-agent |
| Blog | 4321 | blog.accessoriesworldmutare.co.zw | aw-blog |

## Key Commands

### PM2 Management
```bash
# Start all apps
pm2 start ecosystem.config.js

# Reload (zero-downtime)
pm2 reload all

# Restart specific app
pm2 restart aw-web

# View logs
pm2 logs

# Monitor
pm2 monit

# List apps
pm2 list

# Save config
pm2 save

# Auto-start on reboot
pm2 startup
```

### Deployment
```bash
# Automated deploy
bash scripts/deploy.sh main

# Manual build
bun run build

# Check build status
echo "Build Status:"
ls -la apps/*/dist apps/*/.next 2>/dev/null | wc -l
```

### Nginx
```bash
# Test config
sudo nginx -t

# Reload config
sudo systemctl reload nginx

# Restart
sudo systemctl restart nginx

# View logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### SSL/Certbot
```bash
# Renew certificates
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run

# View certificates
sudo certbot certificates
```

### Database
```bash
# Connect
psql -h localhost -U postgres -d accessories-world

# Backup
pg_dump accessories-world > backup-$(date +%Y%m%d).sql

# Restore
psql accessories-world < backup-20260228.sql
```

## Health Checks

```bash
# All domains
for domain in accessoriesworldmutare.co.zw admin.accessoriesworldmutare.co.zw wholesale.accessoriesworldmutare.co.zw api.accessoriesworldmutare.co.zw agent.accessoriesworldmutare.co.zw blog.accessoriesworldmutare.co.zw; do
  echo "Testing $domain..."
  curl -I https://$domain
done

# API specifically
curl -s https://api.accessoriesworldmutare.co.zw | jq .

# PM2 Apps
pm2 list
```

## Troubleshooting

### App won't start
```bash
# Check logs
pm2 logs <app-name>

# Check environment
pm2 show <app-name>

# Restart
pm2 restart <app-name>

# Delete and restart
pm2 delete <app-name>
pm2 start ecosystem.config.js
```

### Port already in use
```bash
lsof -i :<port>
kill -9 <PID>
```

### Nginx not responding
```bash
sudo nginx -t
sudo systemctl restart nginx
sudo tail -f /var/log/nginx/error.log
```

### API CORS errors
```bash
# Check current CORS config
grep -A 10 "cors({" apps/server/src/index.ts

# Update environment variables
nano apps/server/.env  # Check WEB_URL, ADMIN_URL, etc.
pm2 restart aw-server
```

## File Locations

```
/var/www/accessories-world/              # Root repo
├── PRODUCTION_SETUP.md                  # Full deployment guide
├── BUILD_STATUS.md                      # Build report
├── ecosystem.config.js                  # PM2 config
├── scripts/deploy.sh                    # Deploy script
├── apps/
│   ├── web/                             # Port 3000
│   ├── admin/                           # Port 3001
│   ├── wholesalers/                     # Port 3002
│   ├── server/                          # Port 3003
│   │   └── .env                         # CORS config
│   ├── agent/                           # Port 3004
│   └── blog/                            # Port 4321
└── packages/
    └── db/
        └── prisma/                      # Database schema
```

## Environment Variables Needed

### Server (.env)
```env
PORT=3003
DATABASE_URL=postgresql://user:pass@localhost:5432/accessories-world
WEB_URL=https://accessoriesworldmutare.co.zw
ADMIN_URL=https://admin.accessoriesworldmutare.co.zw
WHOLESALER_URL=https://wholesale.accessoriesworldmutare.co.zw
AGENT_URL=https://agent.accessoriesworldmutare.co.zw
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=email@gmail.com
SMTP_PASSWORD=app-password
SMTP_FROM=email@gmail.com
BUSINESS_EMAIL=email@gmail.com
```

## Monitoring

### Real-time
```bash
pm2 monit          # CPU/Memory per app
pm2 logs           # Live logs
pm2 logs aw-web    # Specific app
```

### Logs Archive
```bash
/var/log/pm2/                          # Log files
/var/log/nginx/                        # Nginx logs
/var/log/postgresql/                   # Database logs
```

## Rollback

```bash
# Quick rollback
git revert HEAD
bun install
bun run build
pm2 restart all

# Or use git reflog
git reflog
git reset --hard <commit>
bun run build
pm2 restart all
```

## Status Checks

```bash
# Full system status
echo "=== PM2 Status ===" && pm2 list && \
echo "" && echo "=== Nginx Status ===" && sudo systemctl status nginx && \
echo "" && echo "=== Database ===" && psql -h localhost -c "SELECT version();"
```

---

**Need Help?**
- See `PRODUCTION_SETUP.md` for detailed guide
- Check `BUILD_STATUS.md` for configuration details
- Run `pm2 logs` to debug issues
