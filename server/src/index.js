import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initDb, all, getOne, execute } from "./db.js";
import { generateReply } from "./ai.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, mode: process.env.OPENAI_API_KEY ? "openai" : "mock" });
});

app.get("/api/tenants", (_req, res) => {
  res.json(all(`SELECT * FROM tenants ORDER BY id`));
});

app.get("/api/tickets", (req, res) => {
  const tenantId = Number(req.query.tenantId);
  const rows = all(
    `SELECT * FROM tickets WHERE tenant_id = ? ORDER BY created_at DESC`,
    [tenantId]
  );
  res.json(rows);
});

app.get("/api/tickets/:id/history", (req, res) => {
  const rows = all(
    `SELECT * FROM chat_messages WHERE ticket_id = ? ORDER BY created_at ASC`,
    [Number(req.params.id)]
  );
  res.json(rows);
});

app.get("/api/docs", (req, res) => {
  const tenantId = Number(req.query.tenantId);
  const rows = all(
    `SELECT * FROM kb_articles WHERE tenant_id = ? ORDER BY id`,
    [tenantId]
  );
  res.json(rows);
});

app.patch("/api/tickets/:id/status", (req, res) => {
  const { status } = req.body;
  execute(`UPDATE tickets SET status = ? WHERE id = ?`, [status, Number(req.params.id)]);
  res.json(getOne(`SELECT * FROM tickets WHERE id = ?`, [Number(req.params.id)]));
});

app.post("/api/chat", async (req, res) => {
  try {
    const { tenantId, ticketId, message } = req.body;
    const content = await generateReply({
      tenantId: Number(tenantId),
      ticketId: Number(ticketId),
      userMessage: message,
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || "gpt-5.4-mini"
    });

    res.json({ content });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

await initDb();

app.listen(port, () => {
  console.log(`AI Copilot API listening on http://localhost:${port}`);
});
