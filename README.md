<div align="center">

# 🚀 TaskFlow (Nexus)

> **A production-grade full-stack task management platform with real-time collaboration, built with the MERN stack, Docker, and CI/CD.**

[![GitHub Stars](https://img.shields.io/github/stars/ragnarstark79/taskflow?style=for-the-badge&logo=github&color=FFD700)](https://github.com/ragnarstark79/taskflow)
[![Docker Hub](https://img.shields.io/badge/Docker_Hub-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://hub.docker.com/u/ragnarstark79)
[![CI/CD Status](https://img.shields.io/github/actions/workflow/status/ragnarstark79/taskflow/ci.yml?branch=main&style=for-the-badge&logo=github-actions)](https://github.com/ragnarstark79/taskflow/actions)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-blue?style=for-the-badge)](https://github.com/ragnarstark79/taskflow/graphs/commit-activity)

[Features](#-core-features) • [Tech Stack](#-tech-stack) • [Architecture](#-system-architecture) • [Quick Start](#-quick-start) • [Roadmap](#-roadmap)

---

### 🌟 Experience the Future of Productivity
TaskFlow combines power-user features with a breathtaking interface inspired by the best of Apple's design language.

</div>

---

## 🎨 UI/UX Philosophy: Glassmorphism & Neumorphism
TaskFlow is not just a tool; it's a visual statement. We've blended two of the most modern design trends to create a "Living UI".

- **✨ Glassmorphism**: High-fidelity translucent layers with `backdrop-filter: blur(20px)`, giving the app depth and a premium feel.
- **☁️ Neumorphism**: Soft, tactile interactive elements that feel organic and responsive to every click.
- **🎬 Fluid Motion**: Micro-interactions and page transitions powered by **Framer Motion** and **GSAP** for a 60fps experience.
- **🌗 Universal Dark Mode**: A sophisticated dark theme that's easy on the eyes, featuring custom-tuned slate and indigo palettes.

---

## 🚀 Core Features

| Feature | Description | Status |
| :--- | :--- | :--- |
| 🔄 **Real-time Sync** | Multi-user collaboration with **Socket.io**. Changes propagate instantly. | ✅ |
| 📋 **Smart Kanban** | Drag-and-drop board with column management powered by **dnd-kit**. | ✅ |
| 🛡️ **Enterprise Auth** | Secure JWT-based auth with auto-refresh tokens and HTTP-only cookies. | ✅ |
| 🏢 **Workspace RBAC** | Manage multiple teams with Role-Based Access Control (Admin/Member). | ✅ |
| 📊 **Insight Analytics** | Beautiful data visualization using **Recharts** on your personal dashboard. | ✅ |
| 📁 **Rich Attachments** | Drag & drop file uploads (Images, PDFs) directly into task cards. | ✅ |
| 🔔 **Smart Notifications** | In-app alerts for assignments, deadlines, and team comments. | ✅ |

---

## 🏗 System Architecture

```mermaid
graph TD
    User([🌐 User Browser]) -->|HTTPS/WSS| Nginx[Nginx Reverse Proxy]
    
    subgraph "🐳 Docker Containerized Environment"
        Nginx -->|Static Assets| Frontend[⚛️ React 18 Frontend]
        Nginx -->|API Requests| Backend[🟢 Node.js 20 Backend]
        Backend -->|Mongoose| MongoDB[(🍃 MongoDB 7)]
        Backend <-->|Real-time Events| Frontend
    end

    subgraph "⚙️ CI/CD Pipeline"
        Code(GitHub Repository) -->|Push| GHA[GitHub Actions]
        GHA -->|Build & Push| DockerHub[Docker Hub]
        GHA -->|Build & Push| GHCR[GitHub Container Registry]
    end
```

---

## 🛠 Tech Stack

### Frontend & UI
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS_4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-443E38?style=for-the-badge&logo=react&logoColor=white)

### Backend & Real-time
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)

### DevOps & Deployment
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)

---

## ⚡ Quick Start

### 1. Clone & Prep
```bash
git clone https://github.com/ragnarstark79/taskflow.git
cd taskflow
cp .env.example .env
```

### 2. Ignition
```bash
# Launch the entire stack in production mode
docker compose up --build
```
> The application will be live at **http://localhost**.

---

## 🛠 Development Workflow
For contributors who need hot-reloading and development tools:

```bash
docker compose -f docker-compose.dev.yml up --build
```
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **Real-time Gateway**: ws://localhost:5001

---

## 📂 Project Structure
```text
├── frontend/         # React 18 + Tailwind 4 + Framer Motion
├── backend/          # Express API + Socket.io + Mongoose
├── nginx/            # Reverse proxy & static serving config
├── .github/          # Automated CI/CD workflows (GHA)
├── docker-compose.yml# Production stack orchestration
└── .env.example      # Template for environment variables
```

---

## 🗺 Roadmap
- [x] **Phase 1**: Core Kanban & JWT Auth
- [x] **Phase 2**: Real-time collaboration & Workspaces
- [x] **Phase 3**: Analytics Dashboard & Dark Mode
- [ ] **Phase 4**: OAuth2 (Google/GitHub) Integration
- [ ] **Phase 5**: Mobile App (React Native)
- [ ] **Phase 6**: AI Task Prioritization

---

<div align="center">

### Built by **Ragnar Stark**
**Roll No. 34** · **Reg No. 12314129** · **INT332 (S30M59)**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/ragnarstark)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/ragnarstark79)

---
© 2024 TaskFlow Project. All rights reserved.
</div>
