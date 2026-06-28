# AI Calendar Assistant

A portfolio demo showcasing how an LLM can control a calendar through natural language — with structured intent parsing, validation, user confirmation, and deterministic CRUD execution.

## Architecture

```
User Message → Intent Detection → Structured Tool Output → Validation → Confirmation → CRUD Execution → Calendar Updated
```

The LLM never directly edits data. It returns structured JSON intents that are validated server-side, confirmed by the user, and only then executed through the REST API.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React, TypeScript, Vite, TailwindCSS, FullCalendar, Zustand |
| Backend | Node.js, Express, TypeScript, Zod |
| AI | OpenAI GPT-4o-mini (structured JSON output) |
| Storage | JSON file (MVP) |

## Quick Start

### Prerequisites

- Node.js 18+
- OpenAI API key

### Backend

```bash
cd backend
cp .env.example .env
# Add your OPENAI_API_KEY to .env
npm install
npm run dev
```

Server runs at `http://localhost:3001`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173` (API proxied to backend via `/api`).

## Demo Script

1. **"Schedule gym tomorrow at 7pm"** → confirmation card appears → click Confirm → event on calendar
2. **"Move it to Friday"** → confirm → calendar updates
3. **"What do I have this week?"** → AI summarizes events (no confirmation needed)
4. **"Delete gym"** → confirm delete → calendar updates

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/events` | List all events |
| POST | `/events` | Create event |
| PUT | `/events/:id` | Update event |
| DELETE | `/events/:id` | Delete event |
| POST | `/chat` | Send natural language message, get intent |

## Supported Intents

- `create_event` — requires confirmation
- `update_event` — requires confirmation
- `delete_event` — requires confirmation
- `list_events` — read-only, no confirmation
- `unknown` — validation failure

## Deployment

Deploy **backend first**, then frontend, then update CORS on backend.

### 1. Render (Backend)

| Setting | Value |
|---------|-------|
| Root Directory | `backend` |
| Build Command | `npm install && npm run build` |
| Start Command | `npm start` |

**Environment variables:**

| Key | Value |
|-----|-------|
| `OPENAI_API_KEY` | Your OpenAI API key |
| `FRONTEND_URL` | `https://your-app.vercel.app` (set after Vercel deploy) |

After deploy, copy your Render URL (e.g. `https://your-app.onrender.com`).

### 2. Vercel (Frontend)

| Setting | Value |
|---------|-------|
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

**Environment variables:**

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://your-app.onrender.com` |

Redeploy after setting env vars.

### 3. Update Render CORS

Go back to Render and set `FRONTEND_URL` to your Vercel URL, then redeploy the backend.

### Checklist

- [ ] Push code to GitHub
- [ ] Deploy Render backend → copy URL
- [ ] Deploy Vercel frontend with `VITE_API_URL`
- [ ] Set `FRONTEND_URL` on Render → redeploy
- [ ] Test live demo with the demo script above

## Roadmap

- PostgreSQL persistence (Render DB)
- Google Calendar integration
- Recurring events
- Time zone support
- Rate limiting for public demo
