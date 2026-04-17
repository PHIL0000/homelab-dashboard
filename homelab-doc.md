# HomeLab Setup Plan

## Ideen für Frontend
### Einstellungen
* Eine Settings page für jede Seite mit folgenden Funktionen.
  - Aktivieren/Deaktivieren
  - Switch zwischen externem Dienst und Buildin Lösung (z.B. vei Einkaufsliste, AI Chat)
  - Link zum Dienst
  - Switch zwischen iFrame und komplett eigener UI (eventull mit Backend) (Für AI könnte man z.B. zwischen Open-WebUI und eigener UI mit backend, wo man nurnoch API Key angiebt wechseln)
* Themes
  - Akzent farbe bei OLED Theme anpassbar machen (RGB)

### Dokumentation
* Button pro Hardware zur installation von einem Status Tracker
* Button pro Hardware für SSH Terminal
* Kleiner Performance Overview (Auf Hardware Page und eventuell auf Overview)
### Weitere Seiten
* Einkaufsliste (könnte man auch eigenes Backend erstellen)
* Paperless (Rechnungs Suchfeld etc)


## Überblick und Design-Philosophie

Dieses HomeLab trennt **Frontend/UI** (RPi 5 8GB), **Productivity** (RPi 5 16GB), **Dev/CI** (CM3588), **AI/Storage** (UGREEN NAS) und **Network** (RPi 4s). Lokale Storage pro Host, UGREEN mit intelligentem Bay-Split.

**Ziele:**
- Frontend butterweich und zentral (für entkoppelte UIs wie OpenWebUI & zentrale Dashboards)
- Monolithische UIs (Nextcloud, Paperless) verbleiben direkt beim jeweiligen Dienst
- Pi-Hole nur über VPN
- SSO für alle Dienste
- AI-Workloads vom Frontend getrennt
- Jeder Host eigenständig (kein NFS-Chaos)

## Hardware-Inventar

| Gerät | RAM | Storage | Primäre Rolle | Gehostete Dienste |
|-------|-----|---------|---------------|-------------------|
| **RPi 4 2GB** | 2 GB | **~128 GB USB SSD** | **Proxy/Edge** | Traefik, Fail2Ban/CrowdSec, ggf. Cloudflare Tunnel |
| **RPi 4 4GB** | 4 GB | **~128 GB USB SSD** | **Pi-Hole VPN** | Pi-Hole, Unbound, WireGuard Server |
| **RPi 5 8GB** | 8 GB | **512 GB NVMe** | **Frontend/UI** | Homer/Dashboards, OpenWebUI, Netdata, Uptime Kuma, Grafana |
| **RPi 5 16GB** | 16 GB | **1-2 TB NVMe** | **Productivity** | Nextcloud, n8n, authentik, SearXNG |
| **CM3588 Plus (oder Alternative)** | 16 GB | **4x 2 TB NVMe** | **Dev/CI** | GitLab CE, GitLab Runner |
| **UGREEN iDX6011 Pro** | 64GB ECC | **6x 8TB HDD + 2x 2TB NVMe + eGPU** | **AI + Split-Storage** | SMB/NFS, Paperless, Grocy, Ollama, Stable Diffusion, DBs |

### UGREEN NAS Storage

6x SATA HDD Bays (Z.B. 6x 8TB WD Red Plus):
├── Bays 1-4: NAS-Pool (3x Speicher + 1x Parity) → RAID5 (ca. 24 TB nutzbar)
│ └── NVMe Slot 1: 2TB Read/Write Cache (~2-5x Speedup)
└── Bays 5-6: App-Pool (1x Speicher + 1x Spiegel) → RAID1 (ca. 8 TB nutzbar)

2x NVMe PCIe 4.0:
├── NVMe 1 (2TB): NAS Cache
└── NVMe 2 (2TB): AI-Modelle + Docker Volumes (Ollama/SD)

eGPU über OCuLink-Port:
└── voraussichtlich RTX 4060 (oder ähnlich) für AI-Beschleunigung (Ollama & SD)

### CM3588 Plus (GitLab Storage)
4x NVME PCIe 4.0 x1
├── NVMe 1-3: GitLab Speicher
└── NVMe 4: Backup

## Komplette Diensteverteilung

### 1. UGREEN iDX6011 Pro (AI + Storage Core)
NAS-Pool (Bays 1-4 + NVMe1 Cache):
├── SMB/NFS Shares (Filme, Backups, Rsync-Ziele)

App-Pool (Bays 5-6):
├── Paperless-ngx (Scans, OCR, Suche)
└── Grocy (Einkaufsliste + Kochbuch)

NVMe2 Docker Volumes:
├── Ollama (Modelle + API) → nutzt eGPU (OCuLink)
├── Stable Diffusion + ComfyUI Backend → nutzt eGPU (OCuLink)
└── PostgreSQL/MariaDB (für Paperless/Grocy)


### 2. CM3588 Plus oder Alternative (Development Pipeline)
Lokale SSD RAID:
└── GitLab CE (Repos, LFS, CI/CD Runner)


### 3. RPi 5 16GB (Productivity Hub)
Lokale NVMe SSD:
├── Nextcloud (Dateifreigaben, Sync, Kalender, Kontakte CalDAV/CardDAV)
├── n8n (Workflows: Paperless↔Grocy↔Nextcloud)
├── authentik (SSO/OIDC für ALLE Dienste)
└── SearXNG (Metasuche)


### 4. RPi 5 8GB (Frontend/Central Dashboard)
Lokale NVMe SSD:
├── Homer/Organizr/Heimdall (Quicklinks, Uptime, Stats)
├── OpenWebUI (Frontend → Ollama Backend)
├── Netdata + Uptime Kuma (Monitoring)
├── SSH Terminal + Restart Buttons (Portainer)
└── Grafana Dashboards (Performance Overview)


### 5. RPi 4 4GB (Pi-Hole VPN Island)
Lokale USB SSD:
├── Pi-Hole + Unbound (DNS/Adblock)
└── WireGuard Server (10.99.0.0/24)

**Routing:** Heimnetz → Router-DNS | VPN-Clients → Pi-Hole

### 6. RPi 4 2GB (Network Edge)
Lokale USB SSD:
├── Traefik/NGINX Proxy Manager (Reverse Proxy + TLS)
├── Fail2Ban/CrowdSec
└── Optional: Cloudflare Tunnel

## Mögliche Weiter Dienste
* **Dozzle** (WebUI for Logs)
* **Watchtower** (Auto Update von Docker Images)
* **Pulse** (Monitoring von Proxmox and Docker)
* **Komodo** (Docker management mit Logs [wie Portainer])
* **Uptime** Kuma (Check if Services Up or Down [also Website etc.])
* **MailRise** (SMTP To Discord Notification)
* **Netbox** (Documentation)
* **Duplicata** (Docker backup)


## Netzwerk-Architektur
INTERN: 192.168.178.0/24
├── Proxy (RPi4 2GB): 192.168.178.10 → ALLE Dienste
├── VPN: WireGuard wg0 (10.99.0.0/24) → Pi-Hole + Dienste
└── SSO-Flow: Proxy → authentik → Dienst (OIDC/SAML)

Externer Zugriff:
dienste.deinedomain.de → Proxy (443) → SSO → intern


## Sicherheit & Backup-Strategie
Firewall (UFW auf allen Hosts):

SSH: 22 (Key-only)

Proxy: 80/443

WireGuard: 51820/UDP

Docker: intern

OS-Hardening (Edge/Frontend Pis):
- Log2RAM installieren (schont USB-SSDs vor ständigen Schreibzugriffen durch Traffic-Logs).

Backups (cron rsync):
Datenbanken (PostgreSQL/MariaDB) → Vor dem Rsync automatischer SQL-Dump!
Nextcloud Daten → UGREEN NAS-Pool (täglich)
GitLab NVMe 1-3 → GitLab NVMe 4 Backupspeicher (stundenweise)
UGREEN App-Pool → NAS-Pool (RAID1 + rsync)
Dashboard → GitLab (wöchentlich)

Offsite-Backup:
Verschlüsselter Sync aller unternehmenskritischer Daten (NAS-Pool, Paperless, Nextcloud-Dumps, GitLab-Dumps) → Externes Ziel (z.B. Hetzner Storage Box, Backblaze B2 oder Remote-Festplatte)


## Deployment & Orchestrierung

| Host | OS | Orchestrierung | Monitoring |
|------|----|---------------|------------|
| RPi 4/5 | Raspberry Pi OS | Docker Compose + Portainer | Netdata |
| CM3588 | Armbian/Debian | Docker Compose | Prometheus |
| UGREEN | UGOS Pro | Docker + App Store | Integriertes Dashboard |

**Standard docker-compose.yml Struktur:**
```yaml
version: '3.8'
services:
  app:
    image: ${APP_IMAGE}
    volumes:
      - /mnt/local-storage/${APP}:/var/lib/${APP}
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.${APP}.rule=Host(`app.local`)"
networks:
  proxy:
    external: true
```
## SSO-Integration
authentik (RPi 5 16GB):
├── Nextcloud (OIDC)
├── GitLab (OIDC)
├── OpenWebUI (Proxy)
├── Dashboard (Proxy)
└── SearXNG (Proxy)

**Wichtig:** Unbedingt "Break-Glass"-Admin Accounts für kritische Dienste (Traefik, UGREEN Admin, Portainer) einrichten, falls Authentik/der RPi 5 mal ausfällt.

"dumme" Dienste → oauth2-proxy hinter Traefik

---

## Checklisten & Status

### 🛒 Hardware & Komponenten
Nutze diese Liste für den Einkauf und Aufbau. Hake ab, was bereits vorhanden oder beschafft ist.

**Server & Hosts:**
- [ ] **UGREEN iDX6011 Pro** (inkl. 64GB ECC-RAM Upgrade)
- [ ] **CM3588 Plus** (oder Alternative)
- [ ] **RPi 5 16GB** + Gehäuse/Netzteil
- [X] **RPi 5 8GB** + Gehäuse/Netzteil
- [x] **RPi 4 4GB** + Gehäuse/Netzteil
- [x] **RPi 4 2GB** + Gehäuse/Netzteil

**Speicher & Erweiterungen:**
- [ ] 6x 8TB WD Red Plus (für UGREEN NAS-Pool & App-Pool)
- [ ] 2x 2TB NVMe PCIe 4.0 (für UGREEN Cache & Docker)
- [ ] eGPU (z.B. RTX 4060) + passendes OCuLink Kabel
- [ ] 4x 2TB NVMe (für CM3588 Dev/CI)
- [ ] 1x 1-2 TB NVMe (für RPi 5 16GB Productivity)
- [X] 1x 512 GB NVMe (für RPi 5 8GB Frontend)
- [ ] 2x ~128 GB USB SSD (für RPi 4 Proxy & VPN)

**Sonstiges:**
- [ ] Netzwerkkabel, Switche & Verteiler

### 🚀 Dienste & Netzwerk-Setup
*Tipp: Trage hier nach der Installation die tatsächlichen IPs und Ports ein, damit du sie nie vergisst.*

| Setup | Dienst | Host-Gerät | Interne IP : Port | Domain (Lokal / Extern) |
| :---: | :--- | :--- | :--- | :--- |
| [ ] | **NGINX Proxy** | RPi 4 2GB | `10.42.42.3:81` | `proxy.hlphil.de` |
| [ ] | **Fail2Ban / CrowdSec** | RPi 4 2GB | `` | - |
| [ ] | **Pi-Hole + Unbound** | RPi 4 4GB | `` | `pihole.local (nur aus VPN)` |
| [ ] | **WireGuard Server** | RPi 4 4GB | `` | `pihole.hlphil.de` |
| [ ] | **Dashboard** | RPi 5 8GB | `` | `hlphil.de` |
| [ ] | **OpenWebUI** | RPi 5 8GB | `` | `chat.hlphil.de` |
| [ ] | **Authentik (SSO)** | RPi 5 16GB | `` | `sso.hlphil.de` |
| [ ] | **Nextcloud** | RPi 5 16GB | `` | `cloud.hlphil.de` |
| [ ] | **n8n** | RPi 5 16GB | `` | `n8n.hlphil.de` |
| [ ] | **SearXNG** | RPi 5 16GB | `` | - |
| [ ] | **GitLab CE + Runner** | CM3588 | `` | `git.hlphil.de` |
| [ ] | **NAS SMB / NFS** | UGREEN | `` | `nas.hlphil.de` |
| [ ] | **Ollama** (via eGPU) | UGREEN | `` | - |
| [ ] | **Stable Diffusion / Comfy** | UGREEN | `` | `image-gen.hlphil.de` |
| [ ] | **Paperless-ngx** | UGREEN | `` | `paperless.hlphil.de` |
| [ ] | **Grocy** | UGREEN | `` | `grocy.hlphil.de` |


