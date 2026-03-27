import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  clearError,
  fetchDocs,
  fetchHistory,
  fetchTenants,
  fetchTickets,
  sendCopilotMessage,
  setSelectedTenant,
  setSelectedTicket,
  updateTicketStatus
} from "./store";

function StatusBadge({ status }) {
  const map = {
    Open: "danger",
    Pending: "warning",
    Resolved: "success"
  };
  return <span className={`badge text-bg-${map[status] || "secondary"}`}>{status}</span>;
}

export default function App() {
  const dispatch = useDispatch();
  const {
    tenants,
    selectedTenantId,
    tickets,
    docs,
    selectedTicketId,
    history,
    aiDraft,
    loadingDraft,
    error
  } = useSelector((state) => state.app);

  const [message, setMessage] = useState("Draft a reply that acknowledges the issue and gives the next best troubleshooting step.");

  useEffect(() => {
    dispatch(fetchTenants());
  }, [dispatch]);

  useEffect(() => {
    if (selectedTenantId) {
      dispatch(fetchTickets(selectedTenantId));
      dispatch(fetchDocs(selectedTenantId));
    }
  }, [dispatch, selectedTenantId]);

  useEffect(() => {
    if (selectedTicketId) {
      dispatch(fetchHistory(selectedTicketId));
    }
  }, [dispatch, selectedTicketId, aiDraft]);

  const selectedTicket = useMemo(
    () => tickets.find((ticket) => ticket.id === selectedTicketId),
    [tickets, selectedTicketId]
  );

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">
      <div className="row g-4">
        <div className="col-12">
          <div className="d-flex flex-wrap align-items-center justify-content-between bg-white rounded shadow-sm p-3">
            <div>
              <h1 className="h3 mb-1">AI Customer Support Copilot SaaS</h1>
              <p className="text-muted mb-0">React + Redux + Node + SQL + AI draft generation</p>
            </div>
            <div className="d-flex align-items-center gap-2">
              <label className="form-label mb-0">Tenant</label>
              <select
                className="form-select"
                style={{ width: 240 }}
                value={selectedTenantId}
                onChange={(e) => dispatch(setSelectedTenant(e.target.value))}
              >
                {tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name} · {tenant.plan}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="col-lg-3">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white">
              <strong>Ticket Inbox</strong>
            </div>
            <div className="list-group list-group-flush">
              {tickets.map((ticket) => (
                <button
                  key={ticket.id}
                  className={`list-group-item list-group-item-action ${selectedTicketId === ticket.id ? "active" : ""}`}
                  onClick={() => dispatch(setSelectedTicket(ticket.id))}
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="text-start">
                      <div className="fw-semibold">#{ticket.id} {ticket.subject}</div>
                      <small>{ticket.customer_name}</small>
                    </div>
                    <StatusBadge status={ticket.status} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <strong>Selected Ticket</strong>
              {selectedTicket && <StatusBadge status={selectedTicket.status} />}
            </div>
            <div className="card-body">
              {selectedTicket ? (
                <>
                  <h2 className="h5">{selectedTicket.subject}</h2>
                  <p className="mb-2"><strong>Customer:</strong> {selectedTicket.customer_name}</p>
                  <p className="mb-2"><strong>Priority:</strong> {selectedTicket.priority}</p>
                  <p className="mb-3">{selectedTicket.details}</p>
                  <div className="d-flex gap-2">
                    {["Open", "Pending", "Resolved"].map((status) => (
                      <button
                        key={status}
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => dispatch(updateTicketStatus({ ticketId: selectedTicket.id, status }))}
                      >
                        Mark {status}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-muted mb-0">Select a ticket.</p>
              )}
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <strong>Knowledge Base</strong>
            </div>
            <div className="card-body">
              <div className="row g-3">
                {docs.map((doc) => (
                  <div key={doc.id} className="col-12">
                    <div className="border rounded p-3">
                      <div className="fw-semibold">{doc.title}</div>
                      <div className="small text-muted mb-2">{doc.tags}</div>
                      <div>{doc.body}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white">
              <strong>Copilot Prompt</strong>
            </div>
            <div className="card-body">
              <textarea
                className="form-control mb-3"
                rows="5"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button
                className="btn btn-primary"
                disabled={!selectedTicketId || loadingDraft}
                onClick={() =>
                  dispatch(
                    sendCopilotMessage({
                      tenantId: selectedTenantId,
                      ticketId: selectedTicketId,
                      message
                    })
                  )
                }
              >
                {loadingDraft ? "Generating..." : "Generate Support Draft"}
              </button>
              {error && (
                <div className="alert alert-danger mt-3 d-flex justify-content-between align-items-center">
                  <span>{error}</span>
                  <button className="btn btn-sm btn-light" onClick={() => dispatch(clearError())}>
                    Clear
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white">
              <strong>AI Draft</strong>
            </div>
            <div className="card-body">
              <pre className="mb-0" style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
                {aiDraft || "Generate a reply draft to see AI output."}
              </pre>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <strong>Chat History</strong>
            </div>
            <div className="card-body">
              {history.length ? (
                history.map((entry) => (
                  <div key={`${entry.id}-${entry.created_at}`} className="border rounded p-2 mb-2">
                    <div className="small text-uppercase text-muted">{entry.role}</div>
                    <div>{entry.content}</div>
                  </div>
                ))
              ) : (
                <p className="text-muted mb-0">No history yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
