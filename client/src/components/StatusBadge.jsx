const TONE_CLASS_MAP = {
  Open: "status-badge status-open",
  Pending: "status-badge status-pending",
  Resolved: "status-badge status-resolved"
};

export function StatusBadge({ status }) {
  return <span className={TONE_CLASS_MAP[status] || "status-badge"}>{status}</span>;
}
