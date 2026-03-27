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
import { CopilotPanel } from "./components/CopilotPanel";
import { KnowledgeBase } from "./components/KnowledgeBase";
import { TicketDetail } from "./components/TicketDetail";
import { TicketInbox } from "./components/TicketInbox";
import { WorkspaceHeader } from "./components/WorkspaceHeader";
import {
  buildDraftPresentation,
  getTenantShowcase
} from "./demoPresentation";

function getSuggestedPlaybook(ticket) {
  if (!ticket) return "Select a ticket to see the recommended handling path.";
  if (ticket.status === "Resolved") return "Confirm closure and log the customer-facing resolution.";
  if (ticket.status === "Pending") return "Keep the response concise and ask for the exact confirmation needed.";
  if (ticket.priority === "High") return "Reply in the current shift and lead with the fastest recovery step.";
  return "Acknowledge the issue, give the next action, and set the follow-up expectation.";
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

  const [message, setMessage] = useState(
    "Draft a reply that acknowledges the issue, gives the best next troubleshooting step, and sets expectations clearly."
  );
  const searchParams = useMemo(
    () => new URLSearchParams(window.location.search),
    []
  );
  const urlTenantId = Number(searchParams.get("tenant")) || null;
  const urlTicketId = Number(searchParams.get("ticket")) || null;
  const demoMode = searchParams.get("demo") || "";

  useEffect(() => {
    dispatch(fetchTenants());
  }, [dispatch]);

  useEffect(() => {
    if (urlTenantId && urlTenantId !== selectedTenantId) {
      dispatch(setSelectedTenant(urlTenantId));
    }
  }, [dispatch, selectedTenantId, urlTenantId]);

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

  useEffect(() => {
    if (!urlTicketId || !tickets.some((ticket) => ticket.id === urlTicketId)) {
      return;
    }

    if (selectedTicketId !== urlTicketId) {
      dispatch(setSelectedTicket(urlTicketId));
    }
  }, [dispatch, selectedTicketId, tickets, urlTicketId]);

  const selectedTenant = useMemo(
    () => tenants.find((tenant) => tenant.id === selectedTenantId) ?? null,
    [tenants, selectedTenantId]
  );

  const workspaceStats = useMemo(() => {
    const openCount = tickets.filter((ticket) => ticket.status === "Open").length;
    const pendingCount = tickets.filter((ticket) => ticket.status === "Pending").length;
    const resolvedCount = tickets.filter((ticket) => ticket.status === "Resolved").length;

    return [
      {
        label: "Queue",
        value: String(tickets.length).padStart(2, "0"),
        note: "live tickets"
      },
      {
        label: "Attention",
        value: String(openCount).padStart(2, "0"),
        note: "still open"
      },
      {
        label: "Waiting",
        value: String(pendingCount).padStart(2, "0"),
        note: "customer follow-up"
      },
      {
        label: "Resolved",
        value: String(resolvedCount).padStart(2, "0"),
        note: "cleared"
      }
    ];
  }, [tickets]);

  const tenantShowcase = useMemo(
    () => getTenantShowcase(selectedTenant),
    [selectedTenant]
  );

  const draftPresentation = useMemo(
    () =>
      buildDraftPresentation({
        aiDraft: demoMode === "showcase" && !aiDraft ? "" : aiDraft,
        ticket: selectedTicket,
        history,
        kbDocs: docs
      }),
    [aiDraft, demoMode, docs, history, selectedTicket]
  );

  const displayedDraft =
    demoMode === "showcase" && !aiDraft ? draftPresentation.source : aiDraft;

  return (
    <div className="app-shell">
      <div className="app-backdrop" />

      <main className="workspace-shell">
        <WorkspaceHeader
          selectedTenant={selectedTenant}
          selectedTenantId={selectedTenantId}
          tenants={tenants}
          stats={workspaceStats}
          showcase={tenantShowcase}
          onTenantChange={(tenantId) => dispatch(setSelectedTenant(tenantId))}
        />

        <div className="workspace-grid">
          <TicketInbox
            tickets={tickets}
            selectedTicketId={selectedTicketId}
            onSelectTicket={(ticketId) => dispatch(setSelectedTicket(ticketId))}
          />

          <div className="workspace-main">
            <TicketDetail
              ticket={selectedTicket}
              historyCount={history.length}
              suggestedPlaybook={getSuggestedPlaybook(selectedTicket)}
              draftSummary={draftPresentation.summary}
              onUpdateStatus={(status) =>
                dispatch(updateTicketStatus({ ticketId: selectedTicket.id, status }))
              }
            />
            <KnowledgeBase docs={docs} selectedTicket={selectedTicket} />
          </div>

          <CopilotPanel
            message={message}
            setMessage={setMessage}
            selectedTicket={selectedTicket}
            selectedTenant={selectedTenant}
            selectedTenantId={selectedTenantId}
            loadingDraft={loadingDraft}
            aiDraft={displayedDraft}
            draftPresentation={draftPresentation}
            history={history}
            error={error}
            onGenerate={() =>
              dispatch(
                sendCopilotMessage({
                  tenantId: selectedTenantId,
                  ticketId: selectedTicketId,
                  message
                })
              )
            }
            onClearError={() => dispatch(clearError())}
          />
        </div>
      </main>
    </div>
  );
}
