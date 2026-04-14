# Homelab Dashboard

## Project goal

The goal of this project is to provide a single, reliable entry point for operating a distributed homelab: one dashboard to centralize visibility, configuration, and day-to-day workflows across multiple services and nodes.

Central control plane for a multi-node homelab, with a modern React frontend and a Node.js backend API.

This project is designed as the main portal to aggregate and operate decoupled services (e.g., Home Assistant, documentation, infrastructure inventory, and user settings) from one place.

## Key features

- Centralized homelab entry point with one consistent UI
- Modular page structure for documentation, account/settings, storage, performance, calendar, and service integrations
- Home Assistant integration view (iframe-based)
- Authentication flow with setup/login and role-aware user management
- Infrastructure and documentation management backed by API + database
- Internationalization support (English/German)
- Theme system with persisted user preference
- Docker-based full-stack startup for reproducible local environments

## Website architecture

### Pages and what you can do there

- **Authentication (`/login`, `/setup`)**
  - Create the initial admin account (first-run setup)
  - Log in and start an authenticated session

- **Dashboard (placeholder route)**
  - Planned central overview for system health and quick access widgets

- **Home Assistant (`/home-assistant`)**
  - Open and use Home Assistant directly inside the dashboard (embedded view)

- **Documentation module (`/documentation/*`)**
  - **Overview**: central entry for infrastructure/documentation content
  - **Hardware**: view and manage hardware assets
  - **Services**: view and manage software/services
  - **Storage**: view and manage storage items
  - **Docs/Markdown**: view and maintain markdown-based documentation entries
  - **Map**: topology/relationship-focused infrastructure view

- **Account (`/account`)**
  - Manage your profile information
  - Review and update account-related settings/tabs

- **Settings (`/settings`)**
  - Configure appearance/theme
  - Configure language and general preferences
  - Manage notifications and advanced options
  - Admin-focused user management (role dependent)

- **Calendar / Performance / AI / Storage main routes**
  - Present as current or partial placeholder areas and are intended for incremental feature expansion

### Page architecture concept

- Sidebar-based navigation with route-driven content pages
- Shared app state via auth, language, and theme contexts
- API-backed data pages for users, infrastructure, and docs
- Consistent UI design system across all modules

## What this repository contains

- `frontend/` — React + TypeScript + Vite UI
  - Routing-driven app layout
  - i18n (EN/DE)
  - Theme customization and persisted client settings
  - Service views (e.g., Home Assistant iframe)
- `backend-node/` — Express + Prisma + PostgreSQL API
  - Authentication and user/account endpoints
  - Infrastructure and documentation endpoints
  - Data persistence via Prisma schema modules
- `backend-python/` — planned automation/orchestration area

## Quick start (Docker)

From repository root:

```bash
docker compose up -d --build
```

Default mapped services (from current compose setup):

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3001`
- PostgreSQL: `localhost:5433`

## Local development

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend (Node)

```bash
cd backend-node
npm install
npm run dev
```

> Note: exact script names depend on each package's `package.json` and may evolve.

## Documentation

Project docs are maintained in `doc/` with content-based filenames:

- `doc/documentation-index.md`
- `doc/user_doc/user-guide.md`
- `doc/developer_doc/developer-guide.md`
- `doc/developer_doc/api-reference.md`
- `doc/developer_doc/repository-structure.md`

Architecture context is additionally tracked in:

- `homelab-doc.md`

## High-level repository structure

```text
homelab-dashboard/
├── README.md
├── homelab-doc.md
├── docker-compose.yml
├── doc/
│   ├── documentation-index.md
│   ├── user_doc/
│   │   └── user-guide.md
│   └── developer_doc/
│       ├── developer-guide.md
│       └── api-reference.md
├── backend-node/
├── backend-python/
└── frontend/
```

## Tech stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, HeroUI, React Router
- Backend: Node.js, Express, Prisma, PostgreSQL
- Deployment/runtime: Docker Compose

## Current status

- Frontend: active development
- Node backend: active development
- Python backend area: planned/iterative