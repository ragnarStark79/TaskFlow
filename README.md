# TaskFlow (Nexus)

> A production-grade full-stack task management application with real-time collaboration, built with the MERN stack, Docker, and CI/CD.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS 4 |
| Backend | Node.js, Express 4 |
| Database | MongoDB + Mongoose |
| Auth | JWT (Access + Refresh tokens) |
| Real-Time | Socket.io |
| Proxy | Nginx |
| Containers | Docker + Docker Compose |
| CI/CD | GitHub Actions |

## Quick Start

```bash
# Clone
git clone https://github.com/ragnarstark79/taskflow.git
cd taskflow

# Copy environment
cp .env.example .env

# Run with Docker
docker compose up --build

# Open http://localhost
```

## Development Mode

```bash
docker compose -f docker-compose.dev.yml up --build
# Frontend: http://localhost:3000
# Backend:  http://localhost:5001
```

## Project Structure

```
├── frontend/     # React + Vite + Tailwind
├── backend/      # Node.js + Express API
├── nginx/        # Reverse proxy config
├── docker-compose.yml
└── .github/workflows/ci.yml
```

## CI/CD Pipeline

GitHub Actions builds and pushes Docker images for backend and frontend to Docker Hub and GHCR on every push to main.

Required GitHub Secrets:

- DOCKERHUB_USERNAME
- DOCKERHUB_TOKEN

Images published:

- Docker Hub: DOCKERHUB_USERNAME/taskflow-backend, DOCKERHUB_USERNAME/taskflow-frontend
- GHCR: ghcr.io/GITHUB_REPOSITORY_OWNER/taskflow-backend, ghcr.io/GITHUB_REPOSITORY_OWNER/taskflow-frontend

Example pull commands:

```bash
docker pull <dockerhub-user>/taskflow-backend:latest
docker pull <dockerhub-user>/taskflow-frontend:latest
docker pull ghcr.io/<org-or-user>/taskflow-backend:latest
docker pull ghcr.io/<org-or-user>/taskflow-frontend:latest
```

---
**Built by Ragnar Stark** · Roll No. 34 · Reg No. 12314129
