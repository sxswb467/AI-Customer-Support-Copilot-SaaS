# AI Customer Support Copilot SaaS

A locally testable demo SaaS app that shows:
- React + Redux Toolkit state management
- Bootstrap dashboard UI
- Node.js / Express API design
- SQL-based data modeling with SQL.js
- AI-assisted reply generation with optional OpenAI support

## Features

- Multi-tenant demo accounts
- Ticket inbox with status updates
- Knowledge base articles
- AI support copilot panel
- Chat history per ticket
- Mock AI mode by default
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

## Optional real AI mode

Edit `server/.env`:

```env
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-5.4-mini
```

If no key is present, the app stays in mock mode and still works fully.

## Demo flow

1. Select a tenant
2. Click any ticket
3. Review knowledge base context
4. Ask the copilot for a draft reply
5. Update ticket status
