# KPort: SSH & SFTP Client

A cross-platform desktop client for developers who manage remote servers daily. KPort combines SSH connectivity, SFTP file browsing, and in-app editing in a single workspace—so you spend less time switching between WinSCP, terminals, and editors.

> **Status:** Early development (`v0.1.0`). Core SSH/SFTP flows are wired; packaging and several productivity features are still in progress.

## Features

| Area | Status |
|------|--------|
| Server profiles (add, edit, delete) | Done |
| SSH connect & connection test | Done |
| Dual file explorer (local + remote SFTP) | Done |
| Path bar with autocomplete & `cd ..` navigation | Done |
| Monaco editor — open & save local/remote files | Done |
| Server metrics in header (CPU, RAM, disk, load) | Done |
| SSH terminal (xterm) | UI shell — backend in progress |
| File transfer queue | UI shell — backend in progress |
| Favorites & quick commands | UI shell — backend in progress |
| Installer (`.dmg` / `.exe`) | Not yet — see [Building](#building) |

## Tech stack

| Layer | Technologies |
|-------|----------------|
| Desktop | Electron 33, electron-vite |
| UI | React 18, TypeScript, Mantine 7, Tabler Icons |
| Editor | Monaco Editor |
| State | Zustand |
| Main process | `ssh2`, `better-sqlite3`, Node `fs` |
| IPC | `contextBridge` preload bridge (no Node in renderer) |

## Prerequisites

- **Node.js** 20+ (LTS recommended)
- **Yarn** 1.x

Native modules (`better-sqlite3`) are rebuilt automatically on `yarn install` via `electron-rebuild`.

## Getting started

```bash
# Clone and install
yarn install

# Start development (Vite HMR + Electron)
yarn dev
```

On macOS, `yarn dev` prepares a custom Electron app shell so the Dock shows **KPort: SSH & SFTP Client** and the project icon during development.

## Scripts

| Command | Description |
|---------|-------------|
| `yarn dev` | Dev server + Electron (macOS Dock branding) |
| `yarn build` | Production compile → `out/` |
| `yarn preview` | Run the production build locally |
| `yarn typecheck` | TypeScript check (renderer + main/preload) |
| `yarn prepare:electron-shell` | Rebuild macOS dev app shell (Dock name & icon) |

## Building

### Production compile

```bash
yarn typecheck   # optional
yarn build
yarn preview     # smoke-test the build
```

Artifacts are written to `out/`:

```
out/
├── main/           # Electron main process
├── preload/        # IPC preload script
├── renderer/       # Bundled React app
└── resources/      # App icons (copied at build time)
```

### Distributable installers

Installer packaging (`electron-builder` → `.dmg`, `.app`, `.exe`) is **not configured yet**. See [docs/PLAN.md](./docs/PLAN.md) for the packaging milestone.

## Project structure

```
kport/
├── resources/              # App icons & static assets
├── scripts/
│   ├── dev.js              # Dev entry (Electron shell on macOS)
│   └── prepare-electron-shell.js
├── src/
│   ├── main/               # Electron main: SSH, SFTP, SQLite, fs
│   ├── preload/            # contextBridge IPC API
│   ├── shared/             # Types & constants shared across processes
│   └── renderer/
│       └── src/
│           ├── components/ # UI panels & layout
│           ├── hooks/      # Feature hooks
│           ├── services/   # IPC clients (ssh, sftp, fs, …)
│           ├── stores/     # Zustand stores
│           └── mocks/      # Demo data for unfinished UI areas
├── docs/
│   ├── IDEA.md             # Product vision & MVP scope
│   └── PLAN.md             # UI-first development roadmap
└── electron.vite.config.ts
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Renderer (React)                                       │
│  Mantine UI · Zustand · Monaco · services → window.kport│
└───────────────────────────┬─────────────────────────────┘
                            │ contextBridge
┌───────────────────────────▼─────────────────────────────┐
│  Preload                                                │
│  Typed IPC facade (no direct Node exposure)               │
└───────────────────────────┬─────────────────────────────┘
                            │ ipcMain / ipcRenderer
┌───────────────────────────▼─────────────────────────────┐
│  Main process                                           │
│  ConnectionManager · SQLite · ssh2 · SFTP · local fs    │
└─────────────────────────────────────────────────────────┘
```

Security model: the renderer never receives Node integration; all privileged work goes through the preload API.

## Documentation

- [docs/IDEA.md](./docs/IDEA.md) — product vision, target users, MVP feature list
- [docs/PLAN.md](./docs/PLAN.md) — phased roadmap (UI-first → backend wiring)

## Development notes

- **Scaffolding:** This repo follows the [electron-vite](https://electron-vite.org/) layout. It was scaffolded manually because `yarn create electron-vite` can fail on macOS with a CRLF shebang error (`env: node\r: No such file or directory`).
- **Native modules:** After upgrading Electron, run `yarn install` again to trigger `electron-rebuild` for `better-sqlite3`.
- **Gitignored paths:** `out/`, `dist/`, `.electron/`, `*.db` (runtime SQLite).
