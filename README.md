# Homelab Dashboard

Welcome to the Homelab Dashboard project! This is the centralized, standalone frontend UI for managing and monitoring a comprehensive multi-node homelab environment.

## Overview
This repository contains a full-stack application (React frontend, Node/DB backend planned) designed to run as the primary entry point for a homelab setup. Rather than monolithically bundling applications, this dashboard serves as an overarching portal (running on a dedicated Raspberry Pi 5 8GB). It seamlessly aggregates decoupled services like Home Assistant, Nextcloud, Ollama (AI), Gitlab, and Storage into one seamless, buttery-smooth React interface.

### Project Structure
- `frontend/`: A modern web interface built with React, Vite, Tailwind CSS, and HeroUI.
  - Supports i18n (English/German).
  - Built-in customizable themes.
  - Direct integrations for services like Home Assistant via iframes.
- `backend/`: (WIP) Future backend for persisting user settings, configuration state, and aggregated metrics.

---

## 🏛️ Homelab Architecture Context

The Dashboard sits within a sophisticated 6-node distributed homelab architecture:
1. **Frontend / UI Node (Raspberry Pi 5 8GB) → This Project**
   Host for Homer, OpenWebUI, Grafana, and this Dashboard.
2. **AI & Storage Core (UGREEN iDX6011 Pro NAS)**
   Heavy lifting machine with an eGPU. Hosts Ollama, Stable Diffusion, NAS Storage, Nextcloud/Paperless Databases.
3. **Dev / CI Node (CM3588 Plus)**
   Dedicated hardware for GitLab CE and Runners.
4. **Productivity Hub (Raspberry Pi 5 16GB)**
   Hosts Nextcloud, n8n, SearXNG, and Authentik for centralized SSO (OIDC/SAML).
5. **Network Edge (Raspberry Pi 4 2GB)**
   Runs Traefik reverse proxy and Fail2Ban / CrowdSec.
6. **VPN Island (Raspberry Pi 4 4GB)**
   Runs Pi-Hole + WireGuard for completely isolated remote DNS and network access.

---

## 🚀 Key Features of the Dashboard
- **Modular Pages**: Navigate easily to Storage, Home Assistant, Performance, Calendar, and AI specific integrations.
- **Home Assistant Viewer**: Interactive iframe module that pulls dynamic domains defined in settings.
- **Customization Settings**: Change display language and UI themes directly from the browser (currently stored in `localStorage`, switching to database later).
- **Smooth Navigation**: Side-nav driven layout built with scalable Tailwind UI principles.

## 🛠️ Tech Stack
- React 18, Vite.
- Tailwind CSS & PostCSS for styling.
- HeroUI and Lucide React (Icons).
- TypeScript.