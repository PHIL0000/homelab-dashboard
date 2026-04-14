# Backend API Reference

Base URL (default): `http://localhost:3001`

All protected endpoints require:

- Header: `Authorization: Bearer <jwt>`

---

## Authentication (`/api/auth`)

### `GET /api/auth/setup-status`

Returns whether first-time setup is required.

Response:

```json
{ "needsSetup": true }
```

### `POST /api/auth/setup`

Creates the initial admin user if no users exist.

Body:

```json
{
  "username": "admin",
  "firstName": "Admin",
  "lastName": "User",
  "email": "admin@example.com",
  "password": "secret"
}
```

Response:

```json
{
  "user": { "id": "...", "username": "admin", "role": "ADMIN" },
  "token": "..."
}
```

### `POST /api/auth/login`

Login by username or email (`identifier`) plus password.

### `GET /api/auth/me`

Returns current authenticated user.

### `POST /api/auth/change-password`

Body:

```json
{
  "currentPassword": "old",
  "newPassword": "new"
}
```

---

## Users (`/api/users`)

> Role restrictions are enforced in backend.

### `GET /api/users`

List users. Admin only.

### `POST /api/users`

Create user. Admin only.

### `PUT /api/users/:id`

Update user.

- Allowed for self
- Allowed for admin on any user

### `DELETE /api/users/:id`

Delete user. Admin only.

- Self-deletion is blocked.

---

## Infrastructure (`/api/infrastructure`)

### Hardware

- `GET /hardware`
- `POST /hardware`
- `PUT /hardware/:id`
- `DELETE /hardware/:id`

Delete behavior:

- Cascades through related docs and service relationships in a transaction

### Services

- `GET /services`
- `POST /services`
- `PUT /services/:id`
- `DELETE /services/:id`

Delete behavior:

- Removes service-linked doc trees
- Removes related storage and deployments

### Deployments

- `GET /deployments`
- `POST /deployments`
- `PUT /deployments/:id`
- `DELETE /deployments/:id`

### Storage

- `GET /storage`
- `POST /storage`
- `PUT /storage/:id`
- `DELETE /storage/:id`

`hardwareAssetId` and `softwareUnitId` are normalized to `null` when empty.

### Docs

- `GET /docs`
- `POST /docs`
- `PUT /docs/:id`
- `DELETE /docs/:id`

Doc behavior:

- Parent/child hierarchy supported
- Title is normalized to ensure `.md` extension on create/update
- Delete removes entire subtree

---

## Settings (`/api/settings`)

### `GET /api/settings`

Returns singleton instance settings (`id=1`). Creates defaults if missing.

### `PUT /api/settings`

Updates instance settings (currently `haDomain` is used by frontend).

Body example:

```json
{
  "haDomain": "https://homeassistant.local:8123"
}
```

---

## Error conventions

Most endpoints return:

```json
{ "error": "Message" }
```

with appropriate HTTP status code (400/401/403/404/500 depending on route context).

---

## Notes for integration work

- Frontend currently calls backend using fixed host `http://localhost:3001`.
- For production-grade setups, move this to environment-driven config.
- Keep JWT secret out of source control and set through environment variables.
