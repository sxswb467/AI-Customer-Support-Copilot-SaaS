import { all, getOne, saveMessage } from "./db.js";

async function callOpenAI({ prompt, apiKey, model }) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      input: prompt
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${text}`);
  }

  const json = await response.json();
  return json.output_text?.trim() || "No response text returned.";
}

function mockReply({ ticket, articles, userMessage, history }) {
  const contextList = articles.map((a) => `- ${a.title}: ${a.body}`).join("\n");
  const previous = history.map((h) => `${h.role}: ${h.content}`).join("\n");

  return [
    `Summary for ticket #${ticket.id}: ${ticket.subject}.`,
    "",
    "Recommended response draft:",
    `Hi ${ticket.customer_name},`,
    "",
    `Thanks for contacting support about "${ticket.subject}". Based on our guidance, the best next step is to ${articles[0] ? articles[0].body.split(".")[0].toLowerCase() : "confirm the issue details and retry the last action"}.`,
    "",
    `We have reviewed the current ticket notes: ${ticket.details}`,
    "",
    `Additional customer note: ${userMessage}`,
    "",
    "Internal context used:",
    contextList || "- No KB article found.",
    previous ? `\nConversation history:\n${previous}` : "",
    "",
    "Escalate only if the issue still reproduces after the recommended troubleshooting steps."
  ].filter(Boolean).join("\n");
}

export async function generateReply({ tenantId, ticketId, userMessage, apiKey, model }) {
  const ticket = getOne(`SELECT * FROM tickets WHERE id = ? AND tenant_id = ?`, [ticketId, tenantId]);
  if (!ticket) {
    throw new Error("Ticket not found.");
  }

  const articles = all(
    `SELECT * FROM kb_articles WHERE tenant_id = ? AND (
      lower(title) LIKE lower(?) OR lower(body) LIKE lower(?) OR lower(tags) LIKE lower(?)
    ) LIMIT 3`,
    [tenantId, `%${ticket.subject.split(" ")[0]}%`, `%${ticket.subject.split(" ")[0]}%`, `%${ticket.subject.split(" ")[0]}%`]
  );

  const history = all(`SELECT * FROM chat_messages WHERE ticket_id = ? ORDER BY created_at ASC`, [ticketId]);

  let content;
  if (apiKey) {
    const prompt = `
You are a senior customer support copilot.
Write a concise, professional support reply draft.

Tenant: ${tenantId}
Ticket subject: ${ticket.subject}
Priority: ${ticket.priority}
Status: ${ticket.status}
Customer: ${ticket.customer_name}
Ticket details: ${ticket.details}

Relevant KB articles:
${articles.map((a) => `${a.title}: ${a.body}`).join("\n")}

History:
${history.map((h) => `${h.role}: ${h.content}`).join("\n")}

User request to copilot:
${userMessage}

Return:
1. A short customer-facing reply
2. 2 bullet internal next steps
3. Whether escalation is needed
    `.trim();

    content = await callOpenAI({ prompt, apiKey, model });
  } else {
    content = mockReply({ ticket, articles, userMessage, history });
  }

  saveMessage(ticketId, "user", userMessage);
  saveMessage(ticketId, "assistant", content);

  return content;
}
