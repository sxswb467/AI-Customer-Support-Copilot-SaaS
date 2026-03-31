# AI Customer Support Copilot SaaS

I built this project as a portfolio-ready demo of an AI-assisted customer support workspace. The goal was to make it feel less like a toy chatbot and more like a real internal product: multi-tenant, operationally clear, and grounded in the daily flow of handling tickets, reviewing knowledge base context, and drafting thoughtful replies.

At a technical level, it brings together:
- React + Redux Toolkit on the frontend
- A custom support operations workspace UI
- Node.js + Express on the backend
- SQL.js for lightweight relational data modeling
- AI-assisted reply generation with optional OpenAI support

## Screenshots

### Operations overview

![Operations overview](docs/screenshots/hero-overview.png)

### Copilot draft workflow

![Copilot draft workflow](docs/screenshots/draft-tall.png)

### Tenant variation

![Tenant variation](docs/screenshots/learning-overview.png)

## Features

- Multi-tenant demo accounts with distinct support contexts
- Ticket inbox with status management
- Knowledge base context tied to the active tenant
- AI copilot panel for drafting customer replies
- Per-ticket conversation history
- Mock AI mode by default for local testing
- Real OpenAI mode when `OPENAI_API_KEY` is provided

## Run locally

### Backend
```bash
cd server
cp .env.example .env
npm install
npm run dev
```

Backend runs at `http://localhost:4000`.

### Frontend
Open a new terminal:

```bash
cd client
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

If you are opening the app from a host browser outside WSL, use:

```bash
cd client
npm run dev:host
```

If port `4000` is already in use, point the frontend at a different backend:

```bash
cd server
PORT=4400 npm run dev
```

```bash
cd client
VITE_API_BASE_URL=http://172.31.221.39:4400/api npm run dev:host
```

## Optional real AI mode

Edit `server/.env`:

```env
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-5.4-mini
```

If no key is present, the app stays in mock mode and still works fully.

This makes it easy to use the project in two ways:
- as a fully local portfolio demo with deterministic mock responses
- as a lightweight real-AI prototype backed by OpenAI

## Demo flow

1. Select a tenant
2. Click any ticket
3. Review the ticket details and knowledge base context
4. Ask the copilot for a reply draft
5. Update ticket status

## Showcase mode

For static portfolio screenshots or demo states, the frontend also supports query
parameters:

- `?tenant=1&ticket=102`
- `?tenant=1&ticket=101&demo=showcase`
- `?tenant=2&ticket=201&demo=showcase`

The Windows capture helper used for README screenshots lives at
`scripts/capture_demo_screenshot.ps1`.
