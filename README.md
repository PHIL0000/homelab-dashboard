# Homelab-Dashboard
This is a custom HomeLab Dashboard to hold track of all your services. It also includes features for documentation and managing.

## 📁 Folder Structure

The project is organized as follows:

```
homelab-dashboard/
├── frontend/                          # React TypeScript Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── nav/                  # Navigation components
│   │   │   │   └── Sidebar.tsx       # Main sidebar navigation
│   │   │   └── pages/                # Page components
│   │   │       ├── dashboard/        # Dashboard page
│   │   │       ├── calendar/         # Calendar management
│   │   │       ├── storage/          # Storage monitoring
│   │   │       │   ├── NAS/          # UGREEN NAS Web Interface (Embedding) 
│   │   │       │   ├── Nextcloud/    # Nextcloud Webinterface (Embedding)
│   │   │       │   └── GitLa/        # GitLab Web Interface (Embedding)
│   │   │       ├── ai/               # AI features
│   │   │       │   ├── Chat/         # Open Web UI for GPT like Chatinterface
│   │   │       │   └── Image Gen/    # ComfyUI for Image generatrion
│   │   │       ├── homeassistant/    # Home Assistant Web Interface (Embedding)
│   │   │       ├── performance/      # Performance monitoring
│   │   │       ├── account/          # Account management
│   │   │       └── settings/         # Settings page
│   │   ├── App.tsx                   # Main app component with routing
│   │   ├── main.tsx                  # Entry point
│   │   ├── App.css                   # App styles
│   │   └── index.css                 # Global styles
│
└── backend/                           # Backend services (TBD)
    └── src/
```
### Frontend Dependencies

- **React 19.2.4** - UI library for building the interface
- **React Router DOM 7.13.2** - Client-side routing
- **TypeScript ~5.9.3** - Type-safe JavaScript
- **Tailwind CSS 4.2.2** - Utility-first CSS framework
- **HeroUI 3.0.1** - React component library with pre-built UI components
- **Framer Motion 12.38.0** - Animation library for smooth transitions
- **Vite 8.0.1** - Fast build tool and dev server



## AI Requests:
Ich habe mich dazu entschlossen, mir das alles Selber zu bauen, dass es genau für meine Anforderungen passt. Ich habe dazu diese Ordner struktur erstellt und will dies Bibiotheken dafür nutzen:

- **React 19.2.4** - UI library for building the interface
- **React Router DOM 7.13.2** - Client-side routing
- **TypeScript ~5.9.3** - Type-safe JavaScript
- **Tailwind CSS 4.2.2** - Utility-first CSS framework
- **HeroUI 3.0.1** - React component library with pre-built UI components
- **Framer Motion 12.38.0** - Animation library for smooth transitions
- **Vite 8.0.1** - Fast build tool and dev server

homelab-dashboard/
├── frontend/                          # React TypeScript Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── nav/                  # Navigation components
│   │   │   │   └── Sidebar.tsx       # Main sidebar navigation
│   │   │   └── pages/                # Page components
│   │   │       ├── dashboard/        # Dashboard page
│   │   │       ├── calendar/         # Calendar management
│   │   │       ├── storage/          # Storage monitoring
│   │   │       │   ├── NAS/          # UGREEN NAS Web Interface (Embedding) 
│   │   │       │   ├── Nextcloud/    # Nextcloud Webinterface (Embedding)
│   │   │       │   └── GitLa/        # GitLab Web Interface (Embedding)
│   │   │       ├── ai/               # AI features
│   │   │       │   ├── Chat/         # Open Web UI for GPT like Chatinterface
│   │   │       │   └── Image Gen/    # ComfyUI for Image generatrion
│   │   │       ├── homeassistant/    # Home Assistant Web Interface (Embedding)
│   │   │       ├── performance/      # Performance monitoring
│   │   │       ├── account/          # Account management
│   │   │       └── settings/         # Settings page
│   │   ├── App.tsx                   # Main app component with routing
│   │   ├── main.tsx                  # Entry point
│   │   ├── App.css                   # App styles
│   │   └── index.css                 # Global styles

Ich habe ansich ein Funktionierendes grund setup, aber das sieht nicht wirklich schön aus. Kannst du mir für die main.tsx, App.tsx und Sidebar.tsx Code für eine Schöne Webseite erstellen? Ich will am Linken rand ein Sidebar für die ganzen pages. Für die pages in dem /ai folder sollte man in der Sidebar einen Punkt Ai haben, den man dann aufklappen kann um an Chat und Image gen zu kommen.
Ich will aktuell noch nicht die ganzen einzelnenn Seiten erstellen. Gebe mir also zudem Code für eine Placeholder Seite die ich erstaml überall rein machen kann.
Nutze für alle UI Elemente HeroUI