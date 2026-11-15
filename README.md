> [!IMPORTANT]
> Ридми писал клодик анализирую сурсы, я хз что он накалякал. Код писал я так что хз наскольео хорошо оно работает

# Vebvy

A lightweight wiki engine whose **content stays readable even when the backend is down**.

Vebvy (formerly *UniT*) keeps every page as a plain Markdown/HTML file in a Git repository.
The browser reads pages straight from the Git host; a small Go backend is only needed for
signing in and editing, and it publishes every change as a Git commit.

> This is the development repository. APIs and configuration may still change.

## Features

- **Resilient by design** – reading never touches the backend, only the Git host.
- **Markdown + raw HTML** – GitHub-flavored Markdown, alerts, KaTeX math, syntax highlighting.
- **Automatic table of contents** with scroll tracking, plus a page index tree.
- **In-browser editor** (Monaco) with live preview, find & replace, create / rename / delete.
- **Git as storage** – full history, easy backups, edit with any Git tool.
- **Single-admin model** – the admin account is created once, confirmed by a code sent through a Telegram bot.
- Light / dark theme, responsive layout, image lightbox.

## How it works

```
 Browser ── reads pages ─────────────────►  Git host (raw files)      works without the backend
    │
    └─── sign in / edit (admin) ──►  Vebvy backend (Go) ── commit & push ──►  Git host
                                        ├─ SQLite (.main.db): the admin account
                                        └─ Telegram bot: delivers one-time codes
```

- A page `guide/install` is the file `guide/install` in the repository (no extension).
  The site root is the file `index`.
- `index.json` lists all pages. The backend maintains it; if you add files to the repository by
  hand, register them there too (`{"guide/install": true}`).
- URLs starting with `/-/` are reserved for built-in pages (page index, editor, authentication,
  settings, docs).

## Repository layout

```
src/
├── core/                 Go backend
│   ├── cmd/vebvy/        entry point
│   ├── internal/         config, database, services (auth, git, files), HTTP transport
│   └── pkg/tgbot/        Telegram bot
├── frontend/             React + Vite single-page app
│   ├── src/config.ts     frontend configuration
│   └── public/pages/     built-in docs pages (about, Markdown syntax)
└── .env                  backend configuration (not committed)
```

## Quick start

### Prerequisites

- **Go** (version from `src/core/go.mod`) and a **C compiler** – the SQLite driver needs CGO.
- **Node.js** (recent LTS) and npm.
- A **Git repository** for the content, reachable without authentication for cloning
  (e.g. a public repository on Codeberg or GitHub), and an **access token with write access** to it.
- A **Telegram bot** – create one with [@BotFather](https://t.me/BotFather) and copy its token.

### 1. Configure the backend

Create `src/.env` (see [Backend configuration](#backend-configuration)):

```dotenv
HOST=:6060
FRONTEND=http://localhost:5173
UPLOAD_LIMIT=1048576
GIT_REPO_URL=https://codeberg.org/<owner>/<repo>.git
GIT_REPO_TOKEN=<token with write access>
TELEGRAM_BOT_TOKEN=<bot token>
```

### 2. Run the backend

The `.env` file is loaded from `../.env` relative to the **working directory**, so start the
backend from `src/core`:

```bash
cd src/core
go run ./cmd/vebvy
```

### 3. Configure and run the frontend

Edit `src/frontend/src/config.ts` (see [Frontend configuration](#frontend-configuration)), then:

```bash
cd src/frontend
npm ci
npm run dev        # development server
npm run build      # production build → dist/
```

### 4. Create the admin account

1. Open your bot in Telegram and send it any message. The **first** chat that writes to the bot
   becomes the admin chat (it needs a Telegram username). Do this right after the first start.
2. Open the site and go to `/-/auth/sign-up`.
3. Request a code (it arrives in the Telegram chat; the bot's **Get code** button resends it while it is valid),
   then register with your email, password and the code.

Registration is only possible until the first account exists. Afterwards, sign in at `/-/auth/sign-in`;
the editor is available at `/-/edit`.

## Configuration

### Backend configuration

Variables are read from `src/.env` (or from the process environment).

| Variable | Required | Description |
|---|---|---|
| `HOST` | yes | Listen address, e.g. `:6060` or `127.0.0.1:6060`. |
| `FRONTEND` | yes | Exact origin of the frontend (`scheme://host[:port]`, no trailing slash). Used for CORS, for the `/auth/me` origin check, and as the redirect target for `/`. |
| `GIT_REPO_URL` | yes | Clone URL of the content repository. Cloned and pulled **without** credentials, so it must be readable anonymously. |
| `GIT_REPO_TOKEN` | yes | Access token used to push commits to that repository. |
| `TELEGRAM_BOT_TOKEN` | yes | Token of the bot that delivers one-time codes to the admin. |
| `UPLOAD_LIMIT` | yes | Integer; returned as-is by `GET /info/upload-limit`. The backend refuses to start if it is missing or not a number. |
| `GIT_REPO_PATH` | no | Where the local clone lives. Default: `./data` (relative to the working directory). |
| `CERT`, `KEY` | no | Paths to a TLS certificate and key. If both are set the backend serves HTTPS, otherwise plain HTTP. |

The backend also creates these files in its working directory (`src/core`). They are git-ignored; back them up:

| File | Purpose |
|---|---|
| `.main.db` | SQLite database with the admin account. |
| `.SECRET_KEY` | 64 random bytes used to sign session cookies. Deleting it signs everyone out. |
| `.TG_CHAT_ID` | The Telegram chat registered as admin. |

The local clone (`./data` by default) is not git-ignored – keep it out of version control or point
`GIT_REPO_PATH` somewhere else.

### Frontend configuration

Settings live in [`src/frontend/src/config.ts`](src/frontend/src/config.ts) and are compiled into the
bundle, so **rebuild after changing them**.

| Constant | Description |
|---|---|
| `BACKEND_BASE_URL` | Base URL of the backend, no trailing slash, e.g. `https://api.example.com`. |
| `REPO_BASE_URL` | URL prefix under which the content repository's raw files are served. A page `a/b` is fetched from `${REPO_BASE_URL}/a/b`, the page list from `${REPO_BASE_URL}/index.json`. It must be reachable from the browser without authentication. Example (Codeberg): `https://codeberg.org/api/v1/repos/<owner>/<repo>/raw`. |
| `PAGE_TITLE` | Site name shown in the browser tab. |
| `SIDEBAR_ICON_PATH` | Icon shown in the sidebar (a path under `public/`). |
| `HEADER_ICON_PATH` | Icon shown in the header (a path under `public/`). |

## Deployment notes

- **Backend:** `cd src/core && go build -o vebvy ./cmd/vebvy`, then run the binary from a directory
  whose parent contains `.env`.
- **Frontend:** upload `src/frontend/dist/` to any static host. Routing is client-side, so unknown
  paths must fall back to `index.html`.
- **HTTPS:** the session cookie is set with `Secure; HttpOnly; SameSite=None; Partitioned`, so serve the
  backend over HTTPS (set `CERT`/`KEY` or terminate TLS in a reverse proxy).
- **Secrets:** never commit `.env`, `.SECRET_KEY` or the Git token. Give the token write access to the
  content repository only.

## Tech stack

- **Backend:** Go (`net/http`), GORM + SQLite, go-git, gorilla/securecookie, go-telegram/bot.
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS 4, shadcn/ui, React Router, react-markdown
  (remark/rehype, KaTeX, highlight.js), Monaco Editor.

## License

Released under the BSD 3-Clause License, © 2025–2026 Kerimniy. The logo is licensed under
[Creative Commons CC BY 3.0](https://creativecommons.org/licenses/by/3.0/us/legalcode).
