# 🚀 IEEE RAIT Production Deployment Guide

This guide explains how to deploy the entire full-stack application (**Next.js Frontend + Express TypeScript Backend + Nginx Reverse Proxy**) to any Linux VPS (DigitalOcean, AWS EC2, Hetzner, Linode, GCP, Azure, etc.) using Docker and Docker Compose.

---

## 📋 Architecture Overview

```
                   Internet (HTTP: 80 / HTTPS: 443)
                                  │
                                  ▼
                   ┌─────────────────────────────┐
                   │        Nginx Container      │
                   └──────────────┬──────────────┘
                                  │
                 ┌────────────────┴────────────────┐
                 │                                 │
                 ▼                                 ▼
      ┌─────────────────────┐           ┌─────────────────────┐
      │ Frontend Container  │           │  Backend Container  │
      │  Next.js (Port 3000)│           │ Express (Port 4000) │
      └─────────────────────┘           └─────────────────────┘
```

- **Nginx**: Handles SSL termination, gzip compression, client request routing, and static caching.
- **Frontend**: Next.js 16 containerized in standalone mode.
- **Backend**: Express + TypeScript API handling `/health` and `/api/contact`.

---

## 🛠️ Step 1: VPS Prerequisites

Connect to your VPS via SSH:
```bash
ssh root@your_server_ip
```

### 1.1 Install Docker & Docker Compose
If Docker is not installed on your server (Ubuntu/Debian):
```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Verify Docker installation
docker --version
docker compose version
```

### 1.2 Open Firewall Ports
Ensure ports `80` (HTTP), `443` (HTTPS), and `22` (SSH) are allowed:
```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## 📦 Step 2: Clone Repository & Configure

### 2.1 Clone your repo
```bash
git clone <YOUR_GIT_REPOSITORY_URL> /var/www/ieee-rait
cd /var/www/ieee-rait
```

### 2.2 Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
nano .env
```
Set your domain and SMTP details (if using contact form email dispatch):
```env
FRONTEND_URL=https://yourdomain.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
NOTIFY_EMAIL=ieee@rait.ac.in
```

---

## 🚀 Step 3: Launch Containers

Make the deployment script executable and run:
```bash
chmod +x deploy.sh
./deploy.sh
```
*Alternatively, you can manually run:*
```bash
docker compose up -d --build
```

---

## 🔒 Step 4: Setup Free SSL (Let's Encrypt / Certbot)

### Option A: Cloudflare (Easiest)
1. Point your domain's DNS `A record` to your VPS IP in Cloudflare.
2. In Cloudflare SSL/TLS settings, set SSL mode to **Full** or **Flexible**.
3. SSL is automatically enabled instantly with zero server-side certificate management!

### Option B: Certbot on VPS
If not using Cloudflare proxy, generate a certificate using Certbot:
```bash
sudo apt install certbot -y
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
```
Then update `nginx/default.conf` to enable the SSL certificate paths:
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ...
}
```

---

## 📊 Useful Management Commands

| Action | Command |
| :--- | :--- |
| **Check container status** | `docker compose ps` |
| **View live logs** | `docker compose logs -f` |
| **View frontend logs** | `docker compose logs -f frontend` |
| **View backend logs** | `docker compose logs -f backend` |
| **Restart services** | `docker compose restart` |
| **Stop application** | `docker compose down` |
| **Update & Redeploy** | `./deploy.sh` |
