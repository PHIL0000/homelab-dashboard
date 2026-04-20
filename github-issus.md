# Homelab Dashboard — GitHub Issues

---

## 🔧 Technical Debt & Refactoring

---

### Issue 1

**Title:** Centralize frontend API client with environment-based base URL

**Label:** `enhancement`

**Description:**

The frontend currently calls the backend using a hardcoded URL (`http://localhost:3001`) spread across individual components. This breaks any deployment that is not local dev — including Docker Compose with custom ports, reverse proxy setups, and any production-like environment.

Create a single API client module (e.g. `src/api/client.ts`) that reads the base URL from a Vite environment variable (`VITE_API_BASE_URL`). All components should import and use this client instead of constructing URLs manually. A fallback default of `http://localhost:3001` can remain for local development convenience.

**Affected area:** `frontend/src` — all components that currently call `http://localhost:3001` directly.

---

### Issue 2

**Title:** Add request/response validation and typed error responses across all backend routes

**Label:** `enhancement`

**Description:**

Backend routes currently lack consistent input validation. There is no shared error response format between frontend and backend, which makes error handling unpredictable and forces the frontend to guess at error shapes.

Introduce schema validation for all route inputs — Zod is a natural fit given the TypeScript stack. Define a consistent error response shape (e.g. `{ error: string, code?: string }`) and apply it across all endpoints. Update the frontend to handle typed error responses rather than relying on status codes alone.

**Affected area:** `backend-node/src/routes/` — all route handlers.

---

### Issue 3

**Title:** Replace hardcoded German UI labels with i18n translation keys

**Label:** `bug`

**Description:**

Several components and tabs still contain hardcoded German strings instead of using the existing `i18n` translation system. This causes the English language mode to display German text, which is a functional regression.

Audit all components under `frontend/src/` for hardcoded German strings and replace them with the appropriate keys from `translations.ts`. Add any missing keys to both the `de` and `en` translation objects to ensure complete coverage in both languages.

**Affected area:** `frontend/src/` — components and tabs with known German hardcoded labels.

---

### Issue 4

**Title:** Document Prisma migration and database seed workflow for developers

**Label:** `documentation`

**Description:**

There is currently no documented process for creating or applying Prisma migrations, nor for seeding the database with initial data. Developers starting from a clean environment have no clear path from an empty database to a running application state.

Add documentation that covers:
- How to create a new migration after modifying a schema file under `backend-node/prisma/schema/`
- How to apply existing migrations to a fresh database
- How to seed initial data for local development and testing

This documentation should live in `doc/developerdoc/developer-guide.md` and be kept up to date alongside schema changes.

**Affected area:** `doc/developerdoc/developer-guide.md`, `backend-node/prisma/`

---

### Issue 5

**Title:** Add automated tests for frontend components and backend routes

**Label:** `enhancement`

**Description:**

The project currently has no automated test coverage. This makes refactoring risky and regressions difficult to detect before they reach a running environment.

Add tests in two areas:

**Frontend (Vitest + React Testing Library):**
- Auth flow: `Login.tsx`, `Setup.tsx`, `AuthContext.tsx`
- Documentation module: key CRUD flows and modal interactions

**Backend (Jest + Supertest):**
- Auth routes: `POST /api/auth/login`, `GET /api/auth/setup-status`, `POST /api/auth/setup`
- Infrastructure routes: hardware, services, storage CRUD endpoints

Start with the highest-risk paths and grow coverage incrementally. A passing test suite should be a requirement before merging changes to core flows.

**Affected area:** `frontend/src/`, `backend-node/src/routes/`

---

### Issue 6

**Title:** Implement feature flags for placeholder routes to enable safe incremental rollout

**Label:** `enhancement`

**Description:**

Several pages — Dashboard, Calendar, AI, Performance, and Storage — currently render placeholder content. There is no mechanism to enable or disable them per environment or user role without modifying the router directly.

Introduce a simple feature flag system: a configuration object or environment variable map that gates which routes render real content versus a placeholder. This allows new pages to be developed and merged without being visible to users, and enables gradual rollout per environment.

**Affected area:** `frontend/src/App.tsx`, `frontend/src/components/dev/Placeholder.tsx`

---

## ⚡ Performance & SSH Watcher

---

### Issue 7

**Title:** Implement SSH hardware watcher — remote install, metrics collection, and Performance page

**Label:** `enhancement`

**Description:**

Implement the full end-to-end SSH watcher feature. Every hardware device in the dashboard should have a button to remotely install a lightweight monitoring agent via SSH. Once installed, the agent collects hardware load and service status data displayed on the Performance page and as a compact inline summary on the Hardware and Overview pages.

This feature spans three layers of the stack:

**backend-python (new service)**
Scaffold the Python service (FastAPI recommended) and integrate it into `docker-compose.yml`. Implement three endpoints:
- `POST /ssh/install` — connects via SSH, uploads the watcher script, sets up a systemd service
- `GET /ssh/status/:host` — checks whether the watcher is installed and running
- `GET /metrics/:host` — retrieves current metrics and returns normalized JSON

The watcher collects: CPU usage, RAM, disk per mount, uptime, temperatures, systemd service status, Docker container status. SSH credentials use key-based auth — private keys are referenced by file path, never stored as plaintext.

**backend-node**
Extend `HardwareAsset` with a related `SshConfig` Prisma model (host, port, user, auth type, key path). Add authenticated performance routes proxying to backend-python:
- `POST /api/performance/install/:hardwareId`
- `GET /api/performance/status/:hardwareId`
- `GET /api/performance/metrics/:hardwareId`

**frontend**
- Implement the Performance page (currently placeholder) as a hardware list with per-device watcher status badges
- Add "Install Watcher" button per device with connection config modal and loading/success/error states
- Display live metrics with auto-refresh for active watchers
- Add compact inline metric summary to Hardware and Overview pages

**Decision required: custom watcher vs. existing tool**

Should we build a custom watcher script, or use an existing monitoring tool?

*Option A — Custom lightweight watcher (recommended):* A small `psutil`-based Python script running as a systemd service. Pros: installable via SCP without Docker on the target, zero extra dependencies (Python is already on every RPi/Debian host), output schema fully under our control, versioned alongside the codebase. Tools like Watchtower, Dozzle, and Uptime Kuma solve different problems — container updates, log streaming, and external uptime checks respectively — none provide structured hardware metrics via API.

*Option B — Existing agent (e.g. Prometheus Node Exporter, Netdata):* Production-grade but heavier, adds external infrastructure dependencies, and ties the Performance page to a separate observability stack. Makes more sense if Prometheus + Grafana is introduced later anyway.

**Recommendation:** Start with the custom watcher. It is the fastest path to a working feature and fits the self-contained nature of the dashboard. It can be swapped for Node Exporter later without changing the frontend interface.

---

## 🏠 Dashboard Page

---

### Issue 8

**Title:** Implement Dashboard home page with system health overview and quick-access widgets

**Label:** `enhancement`

**Description:**

The `/dashboard` route currently renders placeholder content. Implement it as the real landing page after login with an at-a-glance homelab overview. Suggested initial widgets: service health summary, quick-access links to key services (configurable), hardware node count with watcher status, and recent documentation activity. Layout should be widget/card based — not a table.

**Affected area:** `frontend/src/pages/dashboard/Dashboard.tsx`, `backend-node` (new summary endpoints as needed)

---

## 📅 Calendar Page

---

### Issue 9

**Title:** Implement Calendar page for homelab event and maintenance scheduling

**Label:** `enhancement`

**Description:**

The `/calendar` route is currently a placeholder. Implement a calendar view for homelab-relevant events such as maintenance windows, planned reboots, and backup schedules. Scope decision needed before implementation: (A) internal DB-backed events, (B) CalDAV integration with Nextcloud (already planned as a core homelab service), or (C) both with a toggle matching the per-module settings concept. At minimum deliver a monthly view with add/edit/delete for events.

**Affected area:** `frontend/src/pages/calendar/Calendar.tsx`, `backend-node` (calendar endpoints), Settings modal if CalDAV

---

## 🤖 AI Section

---

### Issue 10

**Title:** Implement AI section with configurable iframe or built-in chat UI

**Label:** `enhancement`

**Description:**

The AI section routes are currently placeholders. Implement the module with a switchable mode: iframe (embeds an external service like Open-WebUI, similar to the Home Assistant page) or built-in (a functional chat UI talking directly to an Ollama or OpenAI-compatible API endpoint). The mode toggle, API URL, and API key should be configurable via the Settings modal and persisted through the backend settings API.

**Affected area:** `frontend/src/pages/ai/`, `backend-node/src/routes/` (settings extension), Settings modal

---

## 💾 Storage Page

---

### Issue 11

**Title:** Complete the standalone Storage page as a cross-device storage overview

**Label:** `enhancement`

**Description:**

The `/storage` route renders placeholder content. The Documentation module already handles per-device storage item management, so this page should not duplicate that — instead it should provide a global storage overview: total and used disk space per hardware node, disk breakdown by mount point, and quick-navigation into per-device storage items. Data is already available via the existing infrastructure API.

**Affected area:** `frontend/src/pages/storage/Storage.tsx`, existing infrastructure API endpoints

---

## 🗺️ Documentation Module — Improvements

---

### Issue 12

**Title:** Improve the Map/Topology page with an interactive network graph

**Label:** `enhancement`

**Description:**

The Map page exists but is limited in interactivity. Integrate a graph library (React Flow or vis.js) to render hardware assets as nodes and network/service relationships as edges, dynamically from existing infrastructure data. Nodes should be clickable and navigate to the relevant hardware or service entry. The existing `network.prisma` schema can be extended to store explicit topology edges.

**Affected area:** `frontend/src/pages/documentation/Map.tsx`, `backend-node/prisma/schema/network.prisma`

---

### Issue 13

**Title:** Add per-hardware in-browser SSH terminal to the Hardware detail view

**Label:** `enhancement`

**Description:**

Add an in-browser terminal per hardware device that opens a live SSH session directly from the dashboard. Use `xterm.js` on the frontend inside a modal or slide-over panel, and a WebSocket SSH relay endpoint in `backend-python` using Paramiko. SSH credentials should reuse the `SshConfig` model introduced by the watcher feature (Issue 7) so connection details are not entered twice.

**Affected area:** `frontend/src/pages/documentation/`, `backend-python` (WebSocket SSH relay)

---

## ⚙️ Settings & Configuration

---

### Issue 14

**Title:** Add per-module settings — enable/disable toggle and iframe vs. built-in UI mode switch

**Label:** `enhancement`

**Description:**

Implement a module configuration system in the Settings modal (new "Modules" tab or dedicated admin area). Each configurable module (AI, Calendar, Home Assistant, and others) should have: an enable/disable toggle that shows/hides the sidebar entry and route, a mode switch (iframe / built-in) where applicable, a URL input for the external service, and persistence via the backend settings API. Extend `InstanceSettings` or add a new `ModuleConfig` Prisma model.

**Affected area:** `frontend/src/pages/settings/`, `backend-node/prisma/`, settings API

---

### Issue 15

**Title:** Make OLED theme accent color customizable with a color picker

**Label:** `enhancement`

**Description:**

The project notes specifically call for an adjustable RGB accent color for the OLED theme. Add a color picker input to the Appearance tab in Settings that overrides the main accent CSS variable when the OLED theme is active. Persist the chosen color alongside the existing theme preference.

**Affected area:** `frontend/src/pages/settings/tabs/AppearanceTab.tsx`, `frontend/src/context/ThemeContext.tsx`

---

## 🔒 Security & Deployment

---

### Issue 16

**Title:** Add rate limiting to authentication endpoints

**Label:** `enhancement`

**Description:**

The login and setup endpoints have no rate limiting, leaving them open to brute-force and credential stuffing attacks. Add `express-rate-limit` middleware to at minimum `POST /api/auth/login` and `POST /api/auth/setup` with sensible defaults (e.g. max 10 requests per 15 minutes per IP) and a `429 Too Many Requests` response with a `Retry-After` header.

**Affected area:** `backend-node/src/index.ts`, `backend-node/src/routes/auth.ts`

---

### Issue 17

**Title:** Add reverse proxy and TLS setup guide for production deployment

**Label:** `documentation`

**Description:**

The user guide warns against public exposure without a reverse proxy, but no setup guide exists. Add a deployment guide covering Traefik (already used in the homelab) and NGINX Proxy Manager as an alternative, environment variable configuration for production, and a note on not exposing port `3001` directly. Place in `doc/developerdoc/developer-guide.md` or a new `doc/deploymentdoc/deployment-guide.md`.

**Affected area:** `doc/developerdoc/` or new `doc/deploymentdoc/`

---

### Issue 18

**Title:** Implement SSO/OIDC login via Authentik

**Label:** `enhancement`

**Description:**

The homelab architecture plans Authentik as the central SSO/OIDC provider for all services. Add OIDC login as an optional second authentication path alongside the existing local login: an "Sign in with SSO" button on the login page, an OIDC callback handler in the backend, and settings inputs for the Authentik issuer URL, client ID, and client secret. The existing local admin login must remain available as a break-glass fallback.

**Affected area:** `backend-node/src/routes/auth.ts`, `frontend/src/components/auth/Login.tsx`, `backend-node/prisma/schema/user.prisma`, Settings modal
