import { configureStore, createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const browserHost =
  typeof window !== "undefined" ? window.location.hostname || "localhost" : "localhost";
const API =
  import.meta.env.VITE_API_BASE_URL || `http://${browserHost}:4000/api`;

export const fetchTenants = createAsyncThunk("app/fetchTenants", async () => {
  const res = await fetch(`${API}/tenants`);
  return res.json();
});

export const fetchTickets = createAsyncThunk("app/fetchTickets", async (tenantId) => {
  const res = await fetch(`${API}/tickets?tenantId=${tenantId}`);
  return res.json();
});

export const fetchDocs = createAsyncThunk("app/fetchDocs", async (tenantId) => {
  const res = await fetch(`${API}/docs?tenantId=${tenantId}`);
  return res.json();
});

export const fetchHistory = createAsyncThunk("app/fetchHistory", async (ticketId) => {
  const res = await fetch(`${API}/tickets/${ticketId}/history`);
  return res.json();
});

export const sendCopilotMessage = createAsyncThunk(
  "app/sendCopilotMessage",
  async ({ tenantId, ticketId, message }) => {
    const res = await fetch(`${API}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ tenantId, ticketId, message })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to generate reply.");
    return { content: json.content, ticketId };
  }
);

export const updateTicketStatus = createAsyncThunk(
  "app/updateTicketStatus",
  async ({ ticketId, status }) => {
    const res = await fetch(`${API}/tickets/${ticketId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status })
    });
    return res.json();
  }
);

const slice = createSlice({
  name: "app",
  initialState: {
    tenants: [],
    selectedTenantId: 1,
    tickets: [],
    docs: [],
    selectedTicketId: null,
    history: [],
    aiDraft: "",
    loadingDraft: false,
    error: ""
  },
  reducers: {
    setSelectedTenant(state, action) {
      state.selectedTenantId = Number(action.payload);
      state.selectedTicketId = null;
      state.history = [];
      state.aiDraft = "";
    },
    setSelectedTicket(state, action) {
      state.selectedTicketId = Number(action.payload);
      state.aiDraft = "";
    },
    clearError(state) {
      state.error = "";
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTenants.fulfilled, (state, action) => {
        state.tenants = action.payload;
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.tickets = action.payload;
        if (!state.selectedTicketId && action.payload.length) {
          state.selectedTicketId = action.payload[0].id;
        }
      })
      .addCase(fetchDocs.fulfilled, (state, action) => {
        state.docs = action.payload;
      })
      .addCase(fetchHistory.fulfilled, (state, action) => {
        state.history = action.payload;
      })
      .addCase(sendCopilotMessage.pending, (state) => {
        state.loadingDraft = true;
        state.error = "";
      })
      .addCase(sendCopilotMessage.fulfilled, (state, action) => {
        state.loadingDraft = false;
        state.aiDraft = action.payload.content;
      })
      .addCase(sendCopilotMessage.rejected, (state, action) => {
        state.loadingDraft = false;
        state.error = action.error.message || "Unable to generate reply.";
      })
      .addCase(updateTicketStatus.fulfilled, (state, action) => {
        state.tickets = state.tickets.map((ticket) =>
          ticket.id === action.payload.id ? action.payload : ticket
        );
      });
  }
});

export const { setSelectedTenant, setSelectedTicket, clearError } = slice.actions;

export const store = configureStore({
  reducer: {
    app: slice.reducer
  }
});
