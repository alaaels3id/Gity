# Gity — Laravel & Git Workspace Manager

A fast, sleek desktop application built with **Electron.js** to manage your Laravel repositories and Git projects located in `/Users/alaaelsaid/code` (or any custom folder).

---

## Features

- 📁 **Configurable Projects Directory**: Defaults to `/Users/alaaelsaid/code` with an interactive Settings modal and native macOS folder picker (`Browse...`).
- ⚡ **Auto-Detection**: Automatically detects Laravel frameworks (`artisan`, `composer.json`), framework version, PHP constraints, and Git repository status.
- 🎯 **Three Primary Actions per Project**:
  1. **Location**: Instantly open the project folder in macOS Finder.
  2. **Fetch**: Execute `git fetch --all --prune` from remotes with real-time feedback and duration.
  3. **Status**: Deep inspection modal showing current branch, upstream tracking, ahead/behind counts, changed/untracked files with colored diff badges, diff stats, and raw `git status` output.
- 🚀 **Bulk "Fetch All"**: One-click action to fetch remote changes for all Git repositories.
- 🔍 **Instant Search & Filter**: Real-time filtering by name and status pills (`All`, `Laravel`, `Modified`, `Behind Remote`, `Clean`).
- 🎨 **Modern macOS Aesthetic**: Native draggable titlebar, dark mode interface, glassmorphism header, responsive animations, and toast notifications.

---

## Tech Stack & Architecture

Structured identically to [`cputy`](file:///Users/alaaelsaid/work/electron/cputy):

- **Electron 41 & TypeScript**: Main process and secure IPC bridge located under `electron/`, compiled via `tsconfig.electron.json` to `dist-electron/`.
- **React 19 & Vite 8**: Renderer interface located under `src/`, compiled via `vite build` to `dist/`.
- **Tailwind CSS v4**: Theme variables and modern utility styling.
- **Lucide React**: Clean icons for macOS desktop experience.
- **Electron Builder**: Production packaging into `release/`.

---

## Folder Structure

```
Gity/
├── electron/                  # Electron Main Process & IPC (TypeScript)
│   ├── main.ts                # App lifecycle & BrowserWindow
│   ├── preload.ts             # IPC contextBridge (gityAPI)
│   ├── types.ts               # Shared TypeScript interfaces
│   ├── gitService.ts          # Git fetch, status, diff, branch
│   ├── projectScanner.ts      # Directory & Laravel scanner
│   └── settingsStore.ts       # Settings persistence in userData
├── src/                       # React 19 + Vite Renderer (TypeScript)
│   ├── components/            # Header, ProjectCard, StatusModal, SettingsModal
│   ├── types/                 # Frontend interfaces
│   ├── App.tsx                # Main App layout & state
│   ├── main.tsx               # React mount entry
│   └── index.css              # Tailwind v4 theme & global styles
├── index.html                 # Vite HTML entry point
├── package.json               # Scripts & electron-builder config
├── tsconfig.json              # React / Vite TypeScript config
├── tsconfig.electron.json     # Electron TypeScript config
└── vite.config.ts             # Vite configuration
```

---

## Available Scripts

```bash
# Start Vite and Electron concurrently in development mode
npm run dev

# Build both Vite renderer and Electron main process
npm run build

# Run production build directly in Electron
npm start

# Package for macOS (unpacked directory in release/)
npm run dist:dir

# Build distribution DMG and ZIP for macOS
npm run dist:mac
```

## Keyboard Shortcuts

- `⌘ R`: Refresh projects list
- `⌘ ,`: Open Settings modal
- `⌘ F` or `/`: Focus search bar
- `Escape`: Close open modal
