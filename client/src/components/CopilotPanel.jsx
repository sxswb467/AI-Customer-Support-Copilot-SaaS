import { StatusBadge } from "./StatusBadge";

const QUICK_PROMPTS = [
  "Write a calm reply that acknowledges the issue and gives one immediate next step.",
  "Draft a short response with two internal follow-up actions for the support agent.",
  "Prepare a reply that explains whether this case should be escalated and why."
];

export function CopilotPanel({
  message,
  setMessage,
  selectedTicket,
  selectedTenant,
  selectedTenantId,
  loadingDraft,
  aiDraft,
  history,
  error,
  onGenerate,
  onClearError
}) {
  return (
    <aside className="copilot-rail">
      <section className="copilot-composer panel-surface panel-emphasis">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Copilot</span>
            <h2>Draft response</h2>
          </div>
          {selectedTicket ? <StatusBadge status={selectedTicket.status} /> : null}
        </div>

        <p className="composer-copy">
          Build the next reply with ticket context, customer history, and tenant-specific
          guidance.
        </p>

        <div className="context-line">
          <span>{selectedTenant?.name || `Tenant ${selectedTenantId}`}</span>
          <span>{selectedTicket ? `Ticket #${selectedTicket.id}` : "Choose a ticket first"}</span>
        </div>

        <div className="quick-prompt-list">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              className="quick-prompt"
              onClick={() => setMessage(prompt)}
              type="button"
            >
              {prompt}
            </button>
          ))}
        </div>

        <textarea
          className="prompt-input"
          rows="7"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />

        <button
          className="primary-button"
          disabled={!selectedTicket || loadingDraft}
          onClick={onGenerate}
          type="button"
        >
          {loadingDraft ? "Generating draft..." : "Generate support draft"}
        </button>

        {error ? (
          <div className="inline-alert" role="alert">
            <span>{error}</span>
            <button onClick={onClearError} type="button">
              Clear
            </button>
          </div>
        ) : null}
      </section>

      <section className="draft-panel panel-surface">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Output</span>
            <h2>AI draft</h2>
          </div>
        </div>

        <div className="draft-meta">
          <span>{selectedTicket ? selectedTicket.subject : "No ticket selected"}</span>
          <span>{history.length} conversation items</span>
        </div>

        <pre className="draft-output">
          {aiDraft || "Generate a reply to see the support draft and internal next steps."}
        </pre>
      </section>

      <section className="history-panel panel-surface">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Conversation</span>
            <h2>Chat history</h2>
          </div>
        </div>

        <div className="history-list">
          {history.length ? (
            history.map((entry) => (
              <article key={`${entry.id}-${entry.created_at}`} className="history-entry">
                <div className="history-role">{entry.role}</div>
                <p>{entry.content}</p>
              </article>
            ))
          ) : (
            <div className="empty-state compact">
              <strong>No history yet</strong>
              <p>Generated drafts and operator prompts will appear here.</p>
            </div>
          )}
        </div>
      </section>
    </aside>
  );
}
