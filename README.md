# KPort

Cross-platform SSH & SFTP client for developers.

See [docs/IDEA.md](./docs/IDEA.md) for product vision and [docs/PLAN.md](./docs/PLAN.md) for the UI-first development roadmap.

## Stack

- Electron + electron-vite
- React + TypeScript
- Mantine + Tabler Icons
- Zustand (state)

## Getting started

```bash
yarn install
yarn dev
```

## Project structure

```
src/
├── main/                 # Electron main process
├── preload/              # contextBridge IPC
├── shared/               # Shared types between main/preload/renderer
└── renderer/
    └── src/
        ├── components/   # UI components (Phase 0)
        ├── mocks/        # Mock data for UI demo
        ├── stores/       # Zustand stores
        └── types/        # Renderer types
```

## Scripts

| Command | Description |
|---------|-------------|
| `yarn dev` | Start dev server + Electron |
| `yarn build` | Production build |
| `yarn preview` | Preview production build |
| `yarn typecheck` | TypeScript check |

## Note on scaffolding

`yarn create electron-vite` may fail on macOS with `env: node\r: No such file or directory` (CRLF in CLI shebang). This project was scaffolded manually following the official electron-vite layout.
