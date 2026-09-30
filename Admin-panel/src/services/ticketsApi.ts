import api from "./axiosInstance";

export interface SupportTicketItem {
  id: string;
  ticketNumber: string;
  requesterId?: string;
  requesterType: string;
  subject: string;
  description: string;
  departmentId?: string;
  department?: { id: string; name: string; code: string };
  category: string;
  priority: string;
  status: string;
  assignedAdminId?: string;
  assignedAdminName?: string;
  assignedAdminEmail?: string;
  confidenceScore?: number;
  aiSummary?: string;
  slaDueDate?: string;
  createdAt: string;
  assignments?: Array<{
    id: string;
    candidateScore: number;
    workloadScore: number;
    skillScore: number;
    availabilityScore: number;
    assignedReason: string;
    createdAt: string;
  }>;
}

export const ticketsApi = {
  createAndAutoAssignTicket: async (data: {
    subject: string;
    description: string;
    requesterId?: string;
    requesterType?: string;
    departmentId?: string;
    manualAdminId?: string;
  }) => {
    const res = await api.post("/tickets", data);
    return res.data;
  },

  getTickets: async (params?: { status?: string; priority?: string }) => {
    const res = await api.get("/tickets", { params });
    return res.data;
  },

  sendAiChatQuery: async (query: string) => {
    const res = await api.post("/ai/chat", { query });
    return res.data;
  },

  listStaffAdmins: async () => {
    const res = await api.get("/tickets/staff");
    return res.data;
  },
};
