# Homelab Dashboard — Repository Structure Reference

This document contains the current repository folder/file path structure as a dedicated technical reference.

> Snapshot date: 2026-04-14  
> Scope: full project structure relevant to development; generated/runtime folders such as `node_modules/`, `dist/`, `.git/`, and `__pycache__/` are intentionally excluded.

## Full path tree

```text
homelab-dashboard/
├── .DS_Store
├── .github/
├── .gitignore
├── README.md
├── homelab-doc.md
├── docker-compose.yml
│
├── doc/
│   ├── documentation-index.md
│   ├── user_doc/
│   │   └── user-guide.md
│   └── developer_doc/
│       ├── api-reference.md
│       ├── developer-guide.md
│       └── repository-structure.md
│
├── backend-python/
│
├── backend-node/
│   ├── .dockerignore
│   ├── .env
│   ├── .gitignore
│   ├── Dockerfile
│   ├── package-lock.json
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   └── schema/
│   │       ├── base.prisma
│   │       ├── dashboard.prisma
│   │       ├── documentation.prisma
│   │       ├── infrastructure.prisma
│   │       ├── network.prisma
│   │       └── user.prisma
│   └── src/
│       ├── index.ts
│       ├── controllers/
│       └── routes/
│           ├── auth.ts
│           ├── infrastructure.ts
│           └── users.ts
│
└── frontend/
    ├── .dockerignore
    ├── .gitignore
    ├── Dockerfile
    ├── README.md
    ├── eslint.config.js
    ├── index.html
    ├── nginx.conf
    ├── package-lock.json
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.js
    ├── test-exports.mjs
    ├── tsconfig.app.json
    ├── tsconfig.json
    ├── tsconfig.node.json
    ├── vite.config.ts
    ├── public/
    │   ├── favicon.svg
    │   └── icons.svg
    └── src/
        ├── App.tsx
        ├── index.css
        ├── main.tsx
        ├── assets/
        │   ├── hero.png
        │   ├── react.svg
        │   └── vite.svg
        ├── context/
        │   ├── AuthContext.tsx
        │   ├── LanguageContext.tsx
        │   └── ThemeContext.tsx
        ├── i18n/
        │   └── translations.ts
        └── components/
            ├── auth/
            │   ├── Login.tsx
            │   └── Setup.tsx
            ├── dev/
            │   └── Placeholder.tsx
            ├── error/
            ├── nav/
            │   └── Sidebar.tsx
            └── pages/
                ├── account/
                │   ├── Account.tsx
                │   └── tabs/
                │       ├── ConnectionsTab.tsx
                │       ├── ProfileTab.tsx
                │       └── SecurityTab.tsx
                ├── ai/
                ├── calendar/
                │   └── Calendar.tsx
                ├── components/
                ├── dashboard/
                │   └── Dashboard.tsx
                ├── documentation/
                │   ├── Hardware.tsx
                │   ├── Map.tsx
                │   ├── MarkdownDocs.tsx
                │   ├── Overview.tsx
                │   ├── Services.tsx
                │   ├── StorageItems.tsx
                │   └── components/
                │       ├── AddHardware.tsx
                │       ├── AddMarkdown.tsx
                │       ├── AddService.tsx
                │       ├── AddStorage.tsx
                │       ├── DeleteWarning.tsx
                │       ├── DocPreviewModal.tsx
                │       ├── EditHardware.tsx
                │       ├── EditMarkdown.tsx
                │       ├── EditService.tsx
                │       ├── EditStorage.tsx
                │       ├── OverviewLeftPane.tsx
                │       ├── OverviewModals.tsx
                │       ├── OverviewOverlays.tsx
                │       └── OverviewRightPane.tsx
                ├── home-assistant/
                │   └── HomeAssistant.tsx
                ├── performance/
                │   └── Performance.tsx
                ├── settings/
                │   ├── Settings.tsx
                │   └── tabs/
                │       ├── AdvancedTab.tsx
                │       ├── AppearanceTab.tsx
                │       ├── GeneralTab.tsx
                │       ├── NotificationsTab.tsx
                │       └── UsersTab.tsx
                └── storage/
                    └── Storage.tsx
```

## Maintenance note

If the structure changes significantly, update this file together with:

- `README.md` (high-level structure)
- `doc/developer_doc/developer-guide.md` (developer navigation)
