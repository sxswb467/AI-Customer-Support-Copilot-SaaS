const TENANT_SHOWCASE = {
  1: {
    headline: "Finance support cockpit",
    subhead: "High-volume login and billing issues are routed into one AI-assisted lane.",
    syncStatus: "Last synced 2 min ago",
    stats: [
      { label: "First response", value: "4m", note: "31% faster this week" },
      { label: "AI adoption", value: "82%", note: "drafts accepted with edits" },
      { label: "CSAT pulse", value: "4.7", note: "based on the last 200 cases" }
    ]
  },
  2: {
    headline: "Learning support command center",
    subhead: "Course progress issues are triaged with product signals before escalation.",
    syncStatus: "Last synced 5 min ago",
    stats: [
      { label: "Learner wait", value: "6m", note: "down from 11m yesterday" },
      { label: "Auto-suggest", value: "76%", note: "recommended plays used by agents" },
      { label: "Escalation rate", value: "9%", note: "kept low with richer diagnostics" }
    ]
  }
};

/**
 * Return mock-oriented tenant showcase details for the hero area.
 *
 * @param {{ id?: number } | null} tenant The selected tenant, if any.
 * @returns {{headline: string, subhead: string, syncStatus: string, stats: Array<{label: string, value: string, note: string}>}}
 */
export function getTenantShowcase(tenant) {
  if (!tenant?.id) {
    return {
      headline: "Support operations workspace",
      subhead: "Live inbox, guided playbooks, and AI-assisted replies in one surface.",
      syncStatus: "Waiting for tenant selection",
      stats: []
    };
  }

  return TENANT_SHOWCASE[tenant.id] || TENANT_SHOWCASE[1];
}

/**
 * Derive mock signals that make tickets easier to scan in a demo setting.
 *
 * @param {{ id: number, customer_name: string, priority: string, status: string, created_at: string }} ticket The ticket row.
 * @param {number} index The item position in the current queue.
 * @returns {{ initials: string, channel: string, unreadCount: number, escalationRisk: string, urgency: string, aiAssist: string }}
 */
export function getTicketSignal(ticket, index) {
  const channels = ["Email", "Web", "Chat"];
  const names = ticket.customer_name.split(" ").filter(Boolean);
  const initials = names.map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  if (ticket.status === "Resolved") {
    return {
      initials,
      channel: channels[index % channels.length],
      unreadCount: 0,
      escalationRisk: "Closed cleanly",
      urgency: "Low",
      aiAssist: "Resolved"
    };
  }

  const unreadCount = ticket.priority === "High" ? 2 : 1;
  const escalationRisk = ticket.status === "Pending" ? "Waiting on customer" : "SLA risk";

  return {
    initials,
    channel: channels[index % channels.length],
    unreadCount,
    escalationRisk,
    urgency: ticket.priority === "High" ? "High" : "Standard",
    aiAssist: ticket.priority === "High" ? "AI recommends fast path" : "AI ready"
  };
}

/**
 * Convert a knowledge base article into a ranked demo card.
 *
 * @param {{ body: string }} doc The article.
 * @param {number} index The position in the current list.
 * @returns {{ relevance: number, action: string }}
 */
export function getKbInsight(doc, index) {
  const action = `${doc.body.split(".")[0]}.`;

  return {
    relevance: Math.max(97 - index * 9, 74),
    action
  };
}

/**
 * Build a staged draft presentation from the generated content and the current ticket.
 *
 * @param {{ aiDraft: string, ticket: any, history: Array<any>, kbDocs?: Array<any> }} input Presentation input.
 * @returns {{ customerReply: string, internalSteps: string[], escalation: string, confidence: number, summary: string, source: string }}
 */
export function buildDraftPresentation({ aiDraft, ticket, history, kbDocs = [] }) {
  if (!ticket) {
    return {
      customerReply: "",
      internalSteps: [],
      escalation: "Select a ticket to generate a staged support draft.",
      confidence: 0,
      summary: "No ticket selected",
      source: ""
    };
  }

  const source = aiDraft?.trim() || buildShowcaseDraft(ticket, kbDocs);
  const lines = source
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const replyStartIndex = lines.findIndex((line) => line.startsWith("Hi "));
  const replyEndIndex = lines.findIndex((line) => line.startsWith("Internal context used:"));
  const replyLines = replyStartIndex >= 0
    ? lines.slice(replyStartIndex, replyEndIndex > replyStartIndex ? replyEndIndex : replyStartIndex + 4)
    : lines.slice(0, 4);

  const firstKbAction = kbDocs[0]?.body?.split(".")[0] || "confirm the issue on the latest customer action";
  const internalSteps = [
    `Verify that the customer completes the recommended step: ${firstKbAction}.`,
    ticket.priority === "High"
      ? "If the issue reproduces, capture reproduction details and escalate in the same shift."
      : "If the issue reproduces, capture device and timestamp details before escalation."
  ];

  return {
    customerReply: replyLines.join(" "),
    internalSteps,
    escalation:
      ticket.priority === "High" && ticket.status !== "Resolved"
        ? "Escalate only if the customer still reproduces the issue after the next guided step."
        : "No immediate escalation. Keep the case in-agent unless the next action fails.",
    confidence: Math.min(98, 78 + kbDocs.length * 6 + Math.min(history.length, 3) * 4),
    summary:
      ticket.status === "Pending"
        ? "Send a tight confirmation request and keep the case warm."
        : "Lead with the fastest recovery action and make the next checkpoint explicit.",
    source
  };
}

/**
 * Build a deterministic showcase draft when no AI response has been generated yet.
 *
 * @param {{ customer_name: string, subject: string, details: string, priority: string }} ticket The selected ticket.
 * @param {Array<{ body: string }>} kbDocs Context articles.
 * @returns {string}
 */
export function buildShowcaseDraft(ticket, kbDocs = []) {
  const firstStep =
    kbDocs[0]?.body?.split(".")[0] ||
    "confirm the latest customer action and retry the guided recovery path";

  return [
    `Hi ${ticket.customer_name},`,
    "",
    `Thanks for reaching out about "${ticket.subject}". The fastest next step is to ${firstStep.toLowerCase()}.`,
    `We reviewed the current ticket notes and will stay with you through the next check: ${ticket.details}`,
    "",
    "Internal context used:",
    firstStep,
    "",
    ticket.priority === "High"
      ? "Escalate only if the issue still reproduces immediately after the guided step."
      : "Escalation is not needed unless the guided step fails."
  ].join("\n");
}
