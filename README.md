# IEEE RAIT Student Branch

> Full-stack interactive web application for IEEE RAIT Student Branch at Ramrao Adik Institute of Technology.

---

## 🏛️ Project Structure

```
.
├── frontend/               # Next.js 16 + React 19 + Tailwind + Three.js & Phaser UI
├── backend/                # Express + TypeScript Contact & Health Check API
├── nginx/                  # Production Nginx reverse proxy configuration
├── docs/                   # Architecture, Design PRD & Tech Stack Specifications
├── docker-compose.yml      # Multi-container orchestration (Frontend, Backend, Nginx)
├── deploy.sh               # Automated deployment script
└── .github/workflows/      # Automated GitHub Actions CI/CD workflows
```

---

## 🚀 Local Development

### 1. Frontend
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### 2. Backend
```bash
cd backend
npm install
npm run dev
```
API endpoint: [http://localhost:4000/health](http://localhost:4000/health)

---

## 🌐 Deploy to GitHub & Cloud

### 1. Push to GitHub
```bash
git add .
git commit -m "feat: complete IEEE RAIT fullstack application with docker & ci"
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPO_NAME>.git
git push -u origin main
```

### 2. Deployment Options

#### Option A: Docker + VPS (Recommended for Full-Stack)
Follow [`DEPLOYMENT.md`](DEPLOYMENT.md) to deploy Frontend, Backend, and Nginx in 3 minutes on any cloud server.

#### Option B: Vercel (Frontend)
1. Go to [vercel.com](https://vercel.com) and import your GitHub repository.
2. Set **Root Directory** to `frontend`.
3. Click **Deploy**.
