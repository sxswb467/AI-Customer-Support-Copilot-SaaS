import { StatusBadge } from "./StatusBadge";
import { getTicketSignal } from "../demoPresentation";

function formatAge(createdAt) {
  const created = new Date(createdAt);
  const now = new Date();
  const hours = Math.max(1, Math.round((now - created) / (1000 * 60 * 60)));

  if (hours >= 48) {
    return `${Math.round(hours / 24)}d in queue`;
  }

  return `${hours}h in queue`;
}

export function TicketInbox({ tickets, selectedTicketId, onSelectTicket }) {
  const summary = [
    { label: "Open", value: tickets.filter((ticket) => ticket.status === "Open").length },
    { label: "Pending", value: tickets.filter((ticket) => ticket.status === "Pending").length },
    { label: "Resolved", value: tickets.filter((ticket) => ticket.status === "Resolved").length }
  ];

  return (
    <aside className="ticket-rail panel-surface">
      <div className="section-heading">
        <div>
          <span className="section-kicker">Inbox</span>
          <h2>Ticket queue</h2>
        </div>
        <p>Prioritize active issues and keep the next step visible.</p>
      </div>

      <div className="rail-summary">
        {summary.map((item) => (
          <div key={item.label} className="summary-pill">
            <span>{item.label}</span>
            <strong>{String(item.value).padStart(2, "0")}</strong>
          </div>
        ))}
      </div>

      <div className="ticket-list">
        {tickets.length ? (
          tickets.map((ticket, index) => {
            const isSelected = selectedTicketId === ticket.id;
            const signal = getTicketSignal(ticket, index);

            return (
              <button
                key={ticket.id}
                className={`ticket-row ${isSelected ? "is-selected" : ""}`}
                onClick={() => onSelectTicket(ticket.id)}
                type="button"
              >
                <div className="ticket-row-top">
                  <div className="ticket-row-identity">
                    <span className="ticket-avatar">{signal.initials}</span>
                    <span className="ticket-id">#{ticket.id}</span>
                  </div>
                  <StatusBadge status={ticket.status} />
                </div>
                <strong>{ticket.subject}</strong>
                <div className="ticket-row-meta">
                  <span>{ticket.customer_name}</span>
                  <span>{signal.channel}</span>
                </div>
                <div className="ticket-chip-row">
                  <span className="signal-chip">{signal.aiAssist}</span>
                  <span className="signal-chip">{signal.escalationRisk}</span>
                  <span className="signal-chip">{signal.urgency} priority</span>
                </div>
                <div className="ticket-row-age">{formatAge(ticket.created_at)}</div>
                {signal.unreadCount ? (
                  <div className="ticket-unread">{signal.unreadCount} unread customer updates</div>
                ) : null}
              </button>
            );
          })
        ) : (
          <div className="empty-state">
            <strong>No tickets available</strong>
            <p>The inbox will populate as soon as this tenant has active support work.</p>
          </div>
        )}
      </div>
    </aside>
  );
}
