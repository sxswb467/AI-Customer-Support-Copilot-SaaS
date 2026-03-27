import { StatusBadge } from "./StatusBadge";

const STATUS_ACTIONS = ["Open", "Pending", "Resolved"];

function formatOpenedAt(createdAt) {
  const created = new Date(createdAt);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(created);
}

export function TicketDetail({ ticket, historyCount, suggestedPlaybook, onUpdateStatus }) {
  if (!ticket) {
    return (
      <section className="detail-panel panel-surface">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Ticket detail</span>
            <h2>Select a ticket</h2>
          </div>
        </div>
        <div className="empty-state">
          <strong>No active ticket selected</strong>
          <p>Choose a case from the queue to review context and prepare a response.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="detail-panel panel-surface">
      <div className="detail-header">
        <div>
          <span className="section-kicker">Ticket detail</span>
          <h2>{ticket.subject}</h2>
        </div>
        <StatusBadge status={ticket.status} />
      </div>

      <div className="detail-metrics">
        <div>
          <span>Customer</span>
          <strong>{ticket.customer_name}</strong>
        </div>
        <div>
          <span>Priority</span>
          <strong>{ticket.priority}</strong>
        </div>
        <div>
          <span>History</span>
          <strong>{historyCount} events</strong>
        </div>
        <div>
          <span>Opened</span>
          <strong>{formatOpenedAt(ticket.created_at)}</strong>
        </div>
      </div>

      <p className="detail-summary">{ticket.details}</p>

      <div className="detail-note">
        <span className="detail-note-label">Operator brief</span>
        <p>{suggestedPlaybook}</p>
      </div>

      <div className="action-strip">
        {STATUS_ACTIONS.map((status) => (
          <button
            key={status}
            className={`action-chip ${ticket.status === status ? "is-active" : ""}`}
            onClick={() => onUpdateStatus(status)}
            type="button"
          >
            Mark {status}
          </button>
        ))}
      </div>
    </section>
  );
}
