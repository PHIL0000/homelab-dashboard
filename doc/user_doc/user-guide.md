# Homelab Dashboard — User Guide

## 1) What this app does

Homelab Dashboard is a central web UI for managing your homelab services, documentation, users, and settings.

At the current implementation stage, the strongest functional area is the **Documentation** section:

- Infrastructure Overview
- Hardware inventory
- Services inventory
- Storage inventory
- Markdown documents (including parent/child hierarchy)
- Topology/Map page

Other sections (for example Dashboard, Calendar, AI, Performance, some Storage entries) are currently placeholders.

---

## 2) Access and first-time setup

### First launch behavior

On first startup, the system checks whether an admin user exists.

- If no user exists, you are redirected to `/setup`
- After setup, you can sign in and use the app

### Sign in

Use your username or email and password on `/login`.

If your token is valid, the dashboard loads automatically.

---

## 3) Main navigation

The sidebar includes:

- Dashboard *(placeholder)*
- Calendar *(placeholder)*
- Home Assistant
- AI section *(placeholder entries)*
- Storage section *(placeholder entries)*
- Documentation section *(fully active)*
- Performance *(placeholder)*

You can collapse/expand the sidebar. The collapsed state is saved locally.

---

## 4) Account and Settings modals

From the sidebar footer:

- **Account** opens an account modal
- **Settings** opens a settings modal

### Account

- Profile update (username, name, email)
- Password change
- Connection tab (depending on current UI content)
- Logout

### Settings

- General settings (language and basic defaults)
- Appearance (theme selection)
- Notifications tab
- Advanced tab (Home Assistant domain)
- Users tab (admin-only)

---

## 5) Theme and language

### Themes

Multiple themes are available (for example Midnight, OLED, Cyberpunk, GitHub, Japan, Forest, Aurora, Sunset, Ocean, Nebula).

The selected theme updates global colors and gradients and is stored in local browser storage.

### Language

Language support currently includes English and German.

---

## 6) Home Assistant page

The Home Assistant page embeds your HA UI via iframe.

- HA URL is loaded from backend settings (`haDomain`)
- If URL is missing/invalid or blocked by iframe headers, an error card is shown
- You can open HA in a new tab

> Note: If Home Assistant sends restrictive `X-Frame-Options`/CSP headers, embedding can fail even with a correct URL.

---

## 7) Documentation module usage

### Overview

Combined operational overview for:

- Hardware nodes (left pane)
- Hardware details
- Services on selected hardware
- Storage for selected hardware
- Linked markdown documents (hardware + service context)

You can add/edit entities directly from this page using modal dialogs.

### Hardware / Services / Storage pages

Each page provides list/table views and add/edit flows.

### Markdown Docs page

- Top-level markdown list
- Child document hierarchy
- Markdown content viewer
- Add/Edit/Delete support

---

## 8) User management (Admin)

In `Settings -> Users` (admin role required):

- List users
- Create users
- Edit user profile fields
- Delete users *(cannot delete yourself)*

---

## 9) Troubleshooting

### I cannot log in

- Ensure backend is reachable on port `3001`
- Check whether initial setup has been completed
- Confirm your credentials

### Pages show placeholders

This is expected for currently unimplemented sections.

### Home Assistant embed fails

- Verify HA URL in settings
- Ensure URL starts with `http://` or `https://`
- Check HA iframe/CSP restrictions

### I changed theme but UI looks stale

- Refresh browser once
- Clear local storage if needed and reselect theme

---

## 10) Security notes for users

- Keep your admin credentials safe
- Use strong passwords
- Avoid exposing the app publicly without reverse proxy/TLS/access protection
