# KPort

A lightweight cross-platform SSH & SFTP client for developers.

KPort is designed to replace the daily workflow of switching between WinSCP, Terminal, VS Code, and multiple server tools.

The goal is simple:

Connect. Edit. Deploy. Fix.

---

# Vision

KPort provides a unified workspace for managing remote servers.

Instead of opening multiple applications, developers can:

- Browse remote files
- Edit files directly on servers
- Open SSH terminals
- Monitor server resources
- Upload deployments
- Troubleshoot production issues

All in one application.

---

# Target Users

- Backend Developers
- Fullstack Developers
- DevOps Engineers
- System Administrators
- Freelancers managing VPS servers

---

# Tech Stack

## Desktop

- Electron
- React
- TypeScript

## UI

- Mantine
- Tabler Icons
- Monaco Editor
- xterm.js

## Main Process

- ssh2
- node-pty
- better-sqlite3

## Architecture

- Main process: SSH, SFTP, terminal sessions, SQLite, file I/O
- Preload: `contextBridge` IPC bridge
- Renderer: React UI (no direct Node integration)

---

# MVP Features

## Server Management

Manage server connections.

Fields:

- Name
- Host
- Port
- Username
- Password
- Private Key

Features:

- Add Server
- Edit Server
- Delete Server
- Test Connection
- Favorite Server

Example:

Production

Staging

Development

Personal VPS

---

## Remote File Explorer

Browse remote files through SFTP.

Features:

- Open Directory
- Create Folder
- Rename
- Delete
- Upload File
- Upload Folder
- Download File
- Download Folder

Layout:

Local Explorer | Remote Explorer

---

## Code Editor

Built-in remote file editor.

Supported:

- JavaScript
- TypeScript
- JSON
- YAML
- ENV
- PHP
- Java
- HTML
- CSS
- XML

Workflow:

Open File

→ Download Content

→ Edit

→ Save

→ Upload Back

Features:

- Syntax Highlighting
- Search
- Replace
- Multiple Tabs

---

## SSH Terminal

Integrated SSH terminal.

Features:

- Multiple Tabs
- Copy / Paste
- Resize Support
- Command History

Common Use Cases:

- docker ps
- docker logs -f
- pm2 restart
- nginx -t
- systemctl restart

---

## Open Terminal Here

Open terminal directly inside the selected folder.

Example:

Selected Folder:

/var/www/api

Action:

Open Terminal Here

Result:

cd /var/www/api

executed automatically.

---

## File Transfer Queue

Track all uploads and downloads.

Sections:

- Uploading
- Downloading
- Completed
- Failed

Features:

- Retry
- Cancel
- Progress Indicator

---

# Monitoring

## Server Status

Display lightweight server metrics.

Example:

CPU: 23%

RAM: 4.2 GB / 8 GB

Disk: 42 GB / 100 GB

Load: 0.72

Refresh Interval:

5 seconds

---

## Health Warnings

Show warning badges when thresholds are exceeded.

Examples:

⚠ CPU Usage > 90%

⚠ RAM Usage > 85%

⚠ Disk Usage > 90%

⚠ High Load Average

---

# Productivity Features

## Favorite Directories

Bookmark common folders.

Examples:

- /var/www
- /etc/nginx
- /home/ubuntu
- /var/log

---

## Quick Commands

Save reusable commands.

Examples:

Docker

- docker ps
- docker logs -f

PM2

- pm2 status
- pm2 restart all

Nginx

- nginx -t
- systemctl reload nginx

---

## Copy Path

Copy full path of selected file.

Example:

/var/www/api/src/main.ts

---

## Search Remote Files

Search files by filename.

Examples:

- nginx.conf
- .env
- docker-compose.yml

---

# User Interface Layout

Left Sidebar

- Servers
- Favorites
- Quick Commands

Main Area

- File Explorer
- Editor Tabs

Bottom Panel

- Terminal
- Transfer Queue

Top Header

- Server Status
- CPU
- RAM
- Disk
- Load

---

# Future Features

## Docker Integration

Features:

- Container List
- Logs
- Restart
- Stop
- Execute Shell

---

## Log Viewer

Quick access to:

- Nginx Logs
- PM2 Logs
- Docker Logs

---

## File Comparison

Compare local and remote files before upload.

Features:

- Modified Date
- File Size
- Content Diff

---

## Permission Manager

Context Menu Actions:

- chmod
- chown

---

# Non Goals

Not planned in early versions:

- FTP
- Telnet
- Team Collaboration
- Cloud Sync
- Git Client
- Kubernetes Dashboard
- Database Editor

---

# Development Roadmap

> **Implementation detail:** This roadmap groups features by capability. For UI-first phased delivery (mock UI first, wire backend later), see [PLAN.md](./PLAN.md).

## Phase 1

- Electron Project Setup (main / preload / renderer)
- SSH Connection
- SFTP Browser
- Upload
- Download

## Phase 2

- Monaco Editor
- Terminal
- Multiple Tabs
- Open Terminal Here

## Phase 3

- Transfer Queue
- Favorite Directories
- Quick Commands

## Phase 4

- Monitoring
- Health Warnings
- Docker Integration

---

# Success Criteria

KPort should allow a developer to:

- Connect to a server within seconds
- Edit remote files
- Upload deployments
- View logs
- Restart services
- Troubleshoot production issues

without leaving the application.
