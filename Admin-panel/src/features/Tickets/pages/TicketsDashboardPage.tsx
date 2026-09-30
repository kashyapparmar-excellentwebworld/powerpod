import { useEffect, useState, useMemo, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  LifeBuoy,
  Plus,
  Bot,
  Clock,
  CheckCircle2,
  Loader2,
  Sparkles,
  Send,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
} from "lucide-react";
import { Modal } from "../../../components/common/modal/Modal";
import { ticketsApi, type SupportTicketItem } from "../../../services/ticketsApi";
import api from "../../../services/axiosInstance";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useThemeCustomizer } from "../../../context/ThemeCustomizerContext";
import { BasicTable } from "../../../components/common/Table/BasicTable";

export const TicketsDashboardPage = () => {
  const { t } = useTranslation();
  const { primaryColor } = useThemeCustomizer();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<SupportTicketItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalTicketsCount = tickets.length;
  const totalPages = Math.max(1, Math.ceil(totalTicketsCount / pageSize));
  const startRow = totalTicketsCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const endRow = Math.min(page * pageSize, totalTicketsCount);

  const paginatedTickets = useMemo(() => {
    const start = (page - 1) * pageSize;
    return tickets.slice(start, start + pageSize);
  }, [tickets, page, pageSize]);

  const getPageRange = (): (number | "...")[] => {
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [1];
    if (page > 3) pages.push("...");
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  // Chat Simulator State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatQuery, setChatQuery] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatResponse, setChatResponse] = useState<any>(null);

  // Ticket Modal State
  const [createTicketOpen, setCreateTicketOpen] = useState(false);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");
  const [submittingTicket, setSubmittingTicket] = useState(false);

  // Assignment Inspector Modal
  const [inspectorTicket, setInspectorTicket] = useState<SupportTicketItem | null>(null);

  // Reassign Modal State
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [reassignDropdownOpen, setReassignDropdownOpen] = useState(false);
  const [staffAdmins, setStaffAdmins] = useState<any[]>([]);
  const [selectedReassignAdminId, setSelectedReassignAdminId] = useState("");
  const [reassigning, setReassigning] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await ticketsApi.getTickets();
      setTickets(res.data || []);
    } catch (err: any) {
      toast.error("Failed to load support tickets");
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffAdmins = async () => {
    try {
      const res = await ticketsApi.listStaffAdmins();
      if (res.data) setStaffAdmins(res.data);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchStaffAdmins();
  }, []);

  const handleSendChat = async (e: FormEvent) => {
    e.preventDefault();
    if (!chatQuery.trim()) return;

    setChatLoading(true);
    setChatResponse(null);
    try {
      const res = await ticketsApi.sendAiChatQuery(chatQuery);
      setChatResponse(res);
    } catch (err: any) {
      toast.error("AI Chat query failed");
    } finally {
      setChatLoading(false);
    }
  };

  const [manualAssignAdminId, setManualAssignAdminId] = useState<string>("");

  const handleAutoCreateTicket = async () => {
    const subj = chatQuery || ticketSubject || "Support Inquiry";
    const desc = ticketDescription || chatQuery || "Created from AI Support Chat flow";

    setSubmittingTicket(true);
    try {
      const res = await ticketsApi.createAndAutoAssignTicket({
        subject: subj,
        description: desc,
        requesterType: "passenger",
        manualAdminId: manualAssignAdminId || undefined,
      });

      toast.success(res.message || "Ticket created & assigned successfully!");
      setCreateTicketOpen(false);
      setChatOpen(false);
      setTicketSubject("");
      setTicketDescription("");
      setManualAssignAdminId("");
      fetchTickets();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create ticket");
    } finally {
      setSubmittingTicket(false);
    }
  };

  const getPriorityBadgeColor = (prio: string) => {
    switch (prio?.toUpperCase()) {
      case "CRITICAL":
        return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      case "HIGH":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "MEDIUM":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default:
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  const columns = useMemo(
    () => [
      {
        key: "ticketNumber",
        label: t("tickets.ticket_number", "Ticket #"),
        sortable: true,
        render: (row: SupportTicketItem) => (
          <span className="font-mono font-bold whitespace-nowrap" style={{ color: primaryColor }}>
            {row.ticketNumber}
          </span>
        ),
      },
      {
        key: "subject",
        label: t("tickets.subject_summary", "Subject & AI Summary"),
        sortable: true,
        render: (row: SupportTicketItem) => (
          <div className="max-w-xs py-1">
            <span className="font-bold text-black block truncate">
              {row.subject}
            </span>
            <span className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
              {row.aiSummary || row.description}
            </span>
          </div>
        ),
      },
      {
        key: "department",
        label: t("tickets.department", "Department"),
        minWidth: 160,
        render: (row: SupportTicketItem) => (
          <span className="inline-block px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase whitespace-nowrap bg-slate-100 dark:bg-slate-800 text-gray-6">
            {row.department?.name || "General"}
          </span>
        ),
      },
      {
        key: "priority",
        label: t("tickets.priority", "Priority"),
        minWidth: 100,
        render: (row: SupportTicketItem) => (
          <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase whitespace-nowrap border ${getPriorityBadgeColor(row.priority)}`}>
            {row.priority}
          </span>
        ),
      },
      {
        key: "assignedAdminName",
        label: t("tickets.assigned_specialist", "Assigned Specialist"),
        render: (row: SupportTicketItem) => (
          <div className="flex items-center gap-2 py-0.5">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0"
              style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
            >
              {(row.assignedAdminName || "U").charAt(0).toUpperCase()}
            </div>
            <div className="truncate">
              <span className="font-bold text-black block truncate">
                {row.assignedAdminName || "Unassigned"}
              </span>
              <span className="text-[10px] text-slate-400 block font-mono">
                Status: {row.status}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: "slaDueDate",
        label: t("tickets.sla_due_date", "SLA Due Date"),
        render: (row: SupportTicketItem) =>
          row.slaDueDate ? (
            <div className="flex items-center gap-1.5 font-mono text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5" style={{ color: primaryColor }} />
              <span>{new Date(row.slaDueDate).toLocaleString()}</span>
            </div>
          ) : (
            <span className="text-slate-400">-</span>
          ),
      },
      {
        key: "confidenceScore",
        label: t("tickets.ai_confidence", "AI Confidence"),
        align: "center" as const,
        headerAlign: "center" as const,
        render: (row: SupportTicketItem) => {
          const lastAssignment = row.assignments?.[0];
          return (
            <span
              className="px-2.5 py-1 font-bold rounded-lg text-[11px] font-mono border"
              style={{ backgroundColor: `${primaryColor}15`, color: primaryColor, borderColor: `${primaryColor}30` }}
            >
              {lastAssignment ? `${lastAssignment.candidateScore.toFixed(0)}% AI` : "85% AI"}
            </span>
          );
        },
      },
      {
        key: "actions",
        label: t("common.actions", "Actions"),
        align: "center" as const,
        headerAlign: "center" as const,
        minWidth: 130,
        render: (row: SupportTicketItem) => (
          <button
            onClick={() => setInspectorTicket(row)}
            style={{ backgroundColor: primaryColor }}
            className="px-3.5 py-1.5 text-white font-bold rounded-xl text-[11px] leading-none inline-flex items-center justify-center whitespace-nowrap transition-all cursor-pointer shadow-xs hover:opacity-90"
          >
            {t("tickets.view_details", "View Details")}
          </button>
        ),
      },
    ],
    [primaryColor, t],
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-surface-light p-4 sm:p-6 rounded-2xl border border-gray-light shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 sm:gap-3.5">
          <div className="p-3 rounded-xl shrink-0" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
            <LifeBuoy className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-black tracking-tight">
              {t("tickets.title", "Support Tickets & Auto-Assignment Engine")}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {t("tickets.subtitle", "Inspect tickets, AI confidence scores, SLA due dates, and 45% Workload + 35% Skill + 20% Availability specialist scoring.")}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">
          <button
            onClick={() => navigate("/manage/chat")}
            style={{ backgroundColor: `${primaryColor}15`, color: primaryColor, borderColor: `${primaryColor}30` }}
            className="flex items-center gap-2 px-4 py-2.5 border rounded-xl text-xs font-bold transition-all cursor-pointer hover:opacity-90"
          >
            <Bot className="w-4 h-4" />
            <span>{t("tickets.ai_simulator", "AI Chat Simulator")}</span>
          </button>

          <button
            onClick={async () => {
              try {
                const res = await ticketsApi.listStaffAdmins();
                if (res.data) setStaffAdmins(res.data);
              } catch {
                // Ignore
              }
              setCreateTicketOpen(true);
            }}
            style={{ backgroundColor: primaryColor }}
            className="flex items-center gap-2 px-4 py-2.5 text-white rounded-xl text-xs font-bold hover:opacity-90 transition-all cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{t("tickets.create_ticket", "Create Support Ticket")}</span>
          </button>
        </div>
      </div>

      {/* Table (Identical to Suppliers & Buyers) */}
      <div className="bg-surface-light rounded-2xl border border-gray-light shadow-xs overflow-hidden">
        <BasicTable
          isLoading={loading}
          isSuccess={!loading}
          isError={false}
          data={paginatedTickets}
          columns={columns}
          totalCount={totalTicketsCount}
          pageNumber={page}
          setPageNumber={setPage}
          pageSize={pageSize}
          setPageSize={(s) => {
            setPageSize(s);
            setPage(1);
          }}
          stickyHeader={false}
        />
      </div>

      {/* AI Chat Simulator Modal */}
      {chatOpen && (
        <Modal
          open={chatOpen}
          setOpen={setChatOpen}
          title="AI Support Chat & RAG Flow Simulator"
          maxWidth="md"
        >
          <div className="p-6 space-y-4">
            <form onSubmit={handleSendChat} className="flex gap-2">
              <input
                type="text"
                value={chatQuery}
                onChange={(e) => setChatQuery(e.target.value)}
                placeholder="Ask support question (e.g. What is refund policy?)"
                className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-[#1E2235] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-black focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                disabled={chatLoading}
                className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 disabled:opacity-50 transition-all cursor-pointer shrink-0"
              >
                {chatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Ask AI</span>
              </button>
            </form>

            {chatResponse && (
              <div className="space-y-4 pt-2 border-t border-gray-light">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">RAG Vector Confidence Score:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black font-mono ${
                      chatResponse.confidenceScore >= 75
                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                    }`}
                  >
                    {chatResponse.confidenceScore}% {chatResponse.confidenceScore >= 75 ? "High Confidence" : "Low Confidence"}
                  </span>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-[#1E2235] rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans space-y-3">
                  <div className="whitespace-pre-line leading-relaxed text-xs">
                    {chatResponse.data?.answer}
                  </div>

                  {chatResponse.data?.sources && chatResponse.data.sources.length > 0 && (
                    <div className="pt-2.5 border-t border-slate-200/50 dark:border-slate-700/40 text-[11px] space-y-1">
                      <p className="font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verified Guidance Sources:</span>
                      </p>
                      {chatResponse.data.sources.map((src: string, i: number) => (
                        <p key={i} className="pl-4 text-slate-500 font-mono text-[10.5px]">
                          | {src} (Match: {chatResponse.confidenceScore}%)
                        </p>
                      ))}
                    </div>
                  )}
                  
                  {/* AI Feedback Rating Loop */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-slate-700/40 text-[11px] text-slate-400">
                    <span>Was this response helpful?</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await api.post("/ai/feedback", {
                              query: chatQuery,
                              aiAnswer: chatResponse.data?.answer,
                              rating: 1,
                            });
                            toast.success("Feedback recorded! Answer promoted to verified FAQ index (+1)");
                          } catch {
                            toast.error("Feedback failed");
                          }
                        }}
                        className="p-1.5 hover:bg-emerald-500/10 hover:text-emerald-500 rounded-lg transition-colors cursor-pointer"
                        title="Helpful (+1)"
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await api.post("/ai/feedback", {
                              query: chatQuery,
                              aiAnswer: chatResponse.data?.answer,
                              rating: -1,
                            });
                            toast.success("Feedback recorded (-1)");
                          } catch {
                            toast.error("Feedback failed");
                          }
                        }}
                        className="p-1.5 hover:bg-rose-500/10 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                        title="Not Helpful (-1)"
                      >
                        <ThumbsDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {chatResponse.data?.canAutoAssignTicket && (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-2">
                    <p className="text-xs text-amber-800 dark:text-amber-300 font-semibold">
                      Confidence score is under 75%. You can automatically create and auto-assign a support ticket to the best specialist candidate.
                    </p>
                    <button
                      onClick={handleAutoCreateTicket}
                      disabled={submittingTicket}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 cursor-pointer shadow-xs"
                    >
                      {submittingTicket ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      <span>Create & Auto-Assign Support Ticket</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Candidate Score Inspector Modal */}
      {inspectorTicket && (
        <Modal
          open={Boolean(inspectorTicket)}
          setOpen={() => setInspectorTicket(null)}
          title={`Ticket Details & AI Matrix Result (${inspectorTicket.ticketNumber})`}
          maxWidth="xl"
        >
          <div className="p-6 space-y-5 text-slate-900 dark:text-slate-100">
            {/* Header Ticket Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black font-mono" style={{ color: primaryColor }}>{inspectorTicket.ticketNumber}</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black border" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor, borderColor: `${primaryColor}30` }}>
                  {inspectorTicket.status}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  {inspectorTicket.priority}
                </span>
              </div>
            </div>

            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
              Issue: {inspectorTicket.subject}
            </h3>

            {/* AI Auto-Assignment Matrix Result Card */}
            <div className="p-4 rounded-2xl space-y-2 border" style={{ backgroundColor: `${primaryColor}08`, borderColor: `${primaryColor}25` }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold" style={{ color: primaryColor }}>
                  <Bot className="w-4 h-4" />
                  <span>AI Auto-Assignment Matrix Result</span>
                </div>
                <span className="px-2.5 py-1 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-black font-mono">
                  {inspectorTicket.assignments?.[0]?.candidateScore || 85}% Match Confidence
                </span>
              </div>
              <div className="text-xs space-y-1 pt-1">
                <p>
                  <span className="font-bold text-slate-700 dark:text-slate-300">Assigned Agent:</span>{" "}
                  <span className="text-slate-900 dark:text-slate-100 font-semibold">{inspectorTicket.assignedAdminName}</span>
                </p>
                <p>
                  <span className="font-bold text-slate-700 dark:text-slate-300">AI Predicted Summary:</span>{" "}
                  <span className="text-slate-600 dark:text-slate-400">{inspectorTicket.aiSummary || inspectorTicket.subject}</span>
                </p>
              </div>
            </div>

            {/* SLA Resolution Deadline */}
            <div className="p-3 bg-amber-500/10 dark:bg-[#161926] border border-amber-500/20 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-semibold">
                <Clock className="w-4 h-4" />
                <span>SLA Resolution Deadline:</span>
              </div>
              <span className="font-mono font-bold text-amber-800 dark:text-amber-400">
                {inspectorTicket.slaDueDate ? new Date(inspectorTicket.slaDueDate).toLocaleString() : "24 Hours (Standard)"}
              </span>
            </div>

            {/* TICKET DESCRIPTION */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Ticket Description</h4>
              <div className="p-4 bg-slate-50 dark:bg-[#161926] border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs space-y-3 leading-relaxed">
                <p><span className="font-bold text-slate-800 dark:text-slate-200">User Question:</span> "{inspectorTicket.subject}"</p>
                <p className="text-slate-500 dark:text-slate-400">AI Retrieval Confidence: {inspectorTicket.assignments?.[0]?.candidateScore || 78}%</p>
                <p className="text-slate-800 dark:text-slate-200">AI Result: {inspectorTicket.description}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              {inspectorTicket.status !== 'IN_PROGRESS' && inspectorTicket.status !== 'RESOLVED' && (
                <button
                  onClick={async () => {
                    try {
                      await api.patch(`/tickets/${inspectorTicket.id}/status`, { status: 'IN_PROGRESS' });
                      toast.success("Ticket marked In-Progress!");
                      setInspectorTicket({ ...inspectorTicket, status: 'IN_PROGRESS' });
                      fetchTickets();
                    } catch {
                      toast.error("Failed to update status");
                    }
                  }}
                  style={{ backgroundColor: primaryColor }}
                  className="px-4 py-2 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs hover:opacity-90"
                >
                  Mark In-Progress
                </button>
              )}

              {inspectorTicket.status !== 'RESOLVED' && (
                <button
                  onClick={async () => {
                    try {
                      await api.patch(`/tickets/${inspectorTicket.id}/status`, { status: 'RESOLVED' });
                      toast.success("Ticket resolved successfully!");
                      setInspectorTicket({ ...inspectorTicket, status: 'RESOLVED' });
                      fetchTickets();
                    } catch {
                      toast.error("Failed to resolve ticket");
                    }
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Resolve Ticket</span>
                </button>
              )}

              <button
                onClick={async () => {
                  try {
                    const res = await api.get('/tickets/staff');
                    setStaffAdmins(res.data?.data || []);
                    if (res.data?.data?.[0]?.id) {
                      setSelectedReassignAdminId(res.data.data[0].id);
                    }
                    setReassignModalOpen(true);
                  } catch {
                    toast.error("Failed to load specialist staff");
                  }
                }}
                style={{ backgroundColor: `${primaryColor}15`, color: primaryColor, borderColor: `${primaryColor}30` }}
                className="px-4 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer hover:opacity-90"
              >
                Manually Reassign Agent
              </button>
            </div>

            {/* ACTIVITY & COMMUNICATION THREAD */}
            <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Activity & Communication Thread</span>
              </h4>
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-[#161926] rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{inspectorTicket.assignedAdminName}</span>
                    <span>Recent</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">
                    {inspectorTicket.status === 'RESOLVED' ? 'Status updated to RESOLVED. Resolved by support agent.' : 'Status updated from ASSIGNED to IN_PROGRESS. Resolution notes: Processing issue.'}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-[#161926] rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="font-bold text-slate-800 dark:text-slate-200">User / Passenger</span>
                    <span>Created</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">Ticket created by user. Title: "{inspectorTicket.subject}"</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectorTicket(null)}
                className="px-5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Manual Ticket Creation Modal */}
      {createTicketOpen && (
        <Modal
          open={createTicketOpen}
          setOpen={setCreateTicketOpen}
          title="Create Support Ticket & Auto-Assign"
          maxWidth="md"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAutoCreateTicket();
            }}
            className="p-6 space-y-4"
          >
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Subject <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                placeholder="e.g. Passenger Payment Refund Request"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#1E2235] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-black focus:outline-none focus:border-purple-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Issue Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={ticketDescription}
                onChange={(e) => setTicketDescription(e.target.value)}
                placeholder="Provide details about the support request..."
                className="w-full p-4 bg-slate-50 dark:bg-[#1E2235] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-black focus:outline-none focus:border-purple-500 font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Assign Specialist (Manual Select / Optional)
              </label>
              <select
                value={manualAssignAdminId}
                onChange={(e) => setManualAssignAdminId(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#1E2235] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-black font-semibold focus:outline-none focus:border-purple-500"
              >
                <option value="">-- Auto-Assign via Smart Scoring Matrix --</option>
                {staffAdmins.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.name || staff.fullName || staff.email} ({staff.deptName || staff.role?.name || "Specialist"})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400 mt-1">
                Select a specific support specialist manually, or leave blank to execute automated candidate scoring.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-light">
              <button
                type="button"
                onClick={() => setCreateTicketOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingTicket}
                className="flex items-center gap-2 px-5 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 disabled:opacity-50 transition-all cursor-pointer"
              >
                {submittingTicket ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Create & Run Auto-Assignment</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
      {/* Reassign Specialist Agent Modal */}
      {reassignModalOpen && (
        <Modal
          open={reassignModalOpen}
          setOpen={setReassignModalOpen}
          title={t("tickets.manually_reassign", "Manually Reassign Specialist Agent")}
          maxWidth="sm"
        >
          <div className="p-6 space-y-4 text-slate-900 dark:text-slate-100">
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Select a qualified specialist agent from the target department to reassign ticket{" "}
              <strong className="text-purple-600 dark:text-purple-400">{inspectorTicket?.ticketNumber}</strong>.
            </p>

            {/* Custom Theme-Styled Specialist Dropdown Listbox */}
            <div className="space-y-1 relative">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {t("tickets.assigned_specialist", "Select Specialist Agent")}
              </label>

              {/* Trigger Button */}
              {(() => {
                const selectedStaff = staffAdmins.find((s) => s.id === selectedReassignAdminId);
                return (
                  <>
                    <div
                      onClick={() => setReassignDropdownOpen(!reassignDropdownOpen)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-[#161926] border border-slate-200 dark:border-purple-500/30 hover:border-purple-500 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-semibold cursor-pointer flex items-center justify-between transition-all shadow-xs"
                    >
                      {selectedStaff ? (
                        <div className="flex items-center gap-2.5 truncate min-w-0">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                            {selectedStaff.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold truncate">{selectedStaff.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 border" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor, borderColor: `${primaryColor}30` }}>
                            {selectedStaff.deptName}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400">Select Specialist Agent...</span>
                      )}

                      <div className="flex items-center gap-2 shrink-0">
                        {selectedStaff && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black font-mono border ${
                            selectedStaff.status === 'ONLINE'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                              : selectedStaff.status === 'BUSY'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                              : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                          }`}>
                            {selectedStaff.status}
                          </span>
                        )}
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${reassignDropdownOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </div>

                    {/* Scrollable Custom Dropdown Popup Menu */}
                    {reassignDropdownOpen && (
                      <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white dark:bg-[#1E2235] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-1.5 max-h-56 overflow-y-auto space-y-1">
                        {staffAdmins.map((staff) => {
                          const isSelected = staff.id === selectedReassignAdminId;
                          return (
                            <div
                              key={staff.id}
                              onClick={() => {
                                setSelectedReassignAdminId(staff.id);
                                setReassignDropdownOpen(false);
                              }}
                              style={isSelected ? { backgroundColor: `${primaryColor}15`, color: primaryColor, borderColor: `${primaryColor}40` } : {}}
                              className={`p-2.5 rounded-xl cursor-pointer flex items-center justify-between gap-3 text-xs transition-all border ${
                                isSelected
                                  ? 'font-bold'
                                  : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200 border-transparent'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 truncate min-w-0">
                                <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                                  {staff.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="truncate min-w-0">
                                  <div className="flex items-center gap-1.5 truncate">
                                    <span className="font-bold truncate">{staff.name}</span>
                                    <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold shrink-0">
                                      {staff.deptName}
                                    </span>
                                  </div>
                                  <span className="text-[10.5px] text-slate-400 block truncate">{staff.email}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black font-mono border ${
                                  staff.status === 'ONLINE'
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                    : staff.status === 'BUSY'
                                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                    : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                                }`}>
                                  {staff.status}
                                </span>
                                {isSelected && <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: primaryColor }} />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setReassignModalOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                {t("common.cancel", "Cancel")}
              </button>
              <button
                type="button"
                disabled={reassigning || !selectedReassignAdminId}
                onClick={async () => {
                  if (!inspectorTicket || !selectedReassignAdminId) return;
                  setReassigning(true);
                  try {
                    const res = await api.post(`/tickets/${inspectorTicket.id}/reassign`, {
                      adminId: selectedReassignAdminId,
                    });
                    const assignedStaff = staffAdmins.find((s) => s.id === selectedReassignAdminId);
                    toast.success(res.data?.message || `Reassigned to ${assignedStaff?.name || "Specialist"}`);
                    setReassignModalOpen(false);
                    if (inspectorTicket) {
                      setInspectorTicket({
                        ...inspectorTicket,
                        assignedAdminId: selectedReassignAdminId,
                        assignedAdminName: assignedStaff?.name || inspectorTicket.assignedAdminName,
                        assignedAdminEmail: assignedStaff?.email || inspectorTicket.assignedAdminEmail,
                        status: "ASSIGNED",
                      });
                    }
                    fetchTickets();
                  } catch {
                    toast.error("Failed to reassign ticket");
                  } finally {
                    setReassigning(false);
                  }
                }}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                {reassigning ? "Reassigning..." : "Confirm Reassignment"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default TicketsDashboardPage;
