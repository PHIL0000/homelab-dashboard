# Homelab Dashboard — Developer Guide

## 1) Repository structure

For the full and continuously maintainable path/file tree, see:

- `doc/developer_doc/repository-structure.md`

```text
homelab-dashboard/
├── docker-compose.yml
├── README.md
├── homelab-doc.md
├── doc/
│   ├── documentation-index.md
│   ├── user_doc/
│   │   └── user-guide.md
│   └── developer_doc/
│       ├── developer-guide.md
│       └── api-reference.md
├── frontend/
│   ├── package.json
│   └── src/
│       ├── App.tsx
│       ├── context/
│       ├── components/
│       └── i18n/
├── backend-node/
│   ├── package.json
│   ├── prisma/schema/
│   └── src/
│       ├── index.ts
│       └── routes/
└── backend-python/   (currently empty)
```

---

## 2) Runtime architecture

### Frontend

- React 19
- TypeScript
- Vite 8
- HeroUI 3
- TailwindCSS 4 + PostCSS
- React Router

### Backend

- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT auth
- bcrypt password hashing

### Containers (default compose)

- `frontend` on `http://localhost:3000`
- `backend` on `http://localhost:3001`
- `postgres` exposed via `localhost:5433`

---

## 3) Local development

### Option A: Docker Compose (recommended for full-stack)

Use root `docker-compose.yml` to run frontend, backend, and database together.

### Option B: Run services separately

Frontend (`frontend/package.json`):

- `npm run dev`
- `npm run build`
- `npm run preview`

Backend (`backend-node/package.json`):

- `npm run dev`
- `npm run build`
- `npm start`

> Ensure `DATABASE_URL` is configured for Prisma when running backend outside Docker.

---

## 4) Authentication and authorization flow

Implemented in:

- `frontend/src/context/AuthContext.tsx`
- `backend-node/src/routes/auth.ts`
- `backend-node/src/routes/users.ts`

Flow:

1. Frontend checks `/api/auth/setup-status`
2. If no users exist -> navigate to `/setup`
3. Setup creates first admin user
4. Login returns JWT + user payload
5. Token is stored in `localStorage`
6. Protected backend routes verify JWT via middleware

Role control:

- `ADMIN` role required for user listing/creation/deletion
- Self-update allowed for own profile

---

## 5) Frontend route status

Defined in `frontend/src/App.tsx`.

### Implemented pages

- `/home-assistant`
- `/documentation/overview`
- `/documentation/hardware`
- `/documentation/services`
- `/documentation/storage`
- `/documentation/docs`
- `/documentation/map`

### Modal pages

- Account modal
- Settings modal

### Placeholder routes

- Dashboard, Calendar, AI routes, Performance, and several storage routes currently render placeholder content.

---

## 6) Theme system

Primary implementation:

- `frontend/src/context/ThemeContext.tsx`
- `frontend/src/index.css`

Key points:

- Theme values are exposed as CSS custom properties (`--color-*`)
- Theme selection is persisted in `localStorage`
- Multiple predefined themes are available
- Shared CSS utilities provide theme-aware surfaces, gradients, controls, and list states

---

## 7) Data model overview (Prisma)

Split schema files under `backend-node/prisma/schema/` include:

- `base.prisma` (datasource, enums, global settings)
- `user.prisma`
- `infrastructure.prisma`
- `documentation.prisma`
- `dashboard.prisma`
- `network.prisma` (network-related models)

Core entities currently used by UI:

- `User`
- `HardwareAsset`
- `SoftwareUnit`
- `Deployment`
- `Storage`
- `Doc`
- `InstanceSettings`

See `api-reference.md` for route-level behavior.

---

## 8) Notes on current implementation quality

- API base URLs are currently hardcoded to `http://localhost:3001` in frontend components
- Several UI labels are still German in specific tabs/components
- `backend-python` is reserved for future orchestration work

These are valid candidates for future hardening/refactoring.

---

## 9) Recommended next engineering steps

1. Introduce a centralized frontend API client with environment-based base URL.
2. Add request/response validation and stronger error typing.
3. Add automated tests (frontend component tests + backend route tests).
4. Add migration/seed docs for Prisma schema evolution.
5. Extend placeholder pages incrementally behind feature flags.
