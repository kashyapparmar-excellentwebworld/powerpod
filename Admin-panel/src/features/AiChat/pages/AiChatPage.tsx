import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Bot,
  Plus,
  Send,
  MessageSquare,
  Sparkles,
  Clock,
  Trash2,
  Loader2,
  ShieldCheck,
  LifeBuoy,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import api from "../../../services/axiosInstance";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useTaskProgress } from "../../../hooks/useTaskProgress";
import { useThemeCustomizer } from "../../../context/ThemeCustomizerContext";

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  confidenceScore?: number;
  sources?: string[];
  canAutoAssignTicket?: boolean;
  requiresTicketCreation?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  messages: ChatMessage[];
}

export const AiChatPage: React.FC = () => {
  const { t } = useTranslation();
  const { primaryColor } = useThemeCustomizer();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sessions History State
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem("ai_chat_sessions");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | undefined>(undefined);

  // WebSocket Live Progress Stream Hook
  const liveProgress = useTaskProgress(activeTaskId);

  // Persist sessions to LocalStorage
  useEffect(() => {
    localStorage.setItem("ai_chat_sessions", JSON.stringify(sessions));
  }, [sessions]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, liveProgress]);

  // Session Pagination State (3 sessions per page)
  const [sessionPage, setSessionPage] = useState(1);
  const SESSIONS_PER_PAGE = 3;

  const totalSessions = sessions.length;
  const totalSessionPages = Math.max(1, Math.ceil(totalSessions / SESSIONS_PER_PAGE));

  const paginatedSessions = useMemo(() => {
    const start = (sessionPage - 1) * SESSIONS_PER_PAGE;
    return sessions.slice(start, start + SESSIONS_PER_PAGE);
  }, [sessions, sessionPage]);

  // Create new chat session
  const handleNewSession = () => {
    const newId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: "New Chat Conversation",
      createdAt: new Date().toLocaleDateString(),
      messages: [],
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
    setMessages([]);
    setSessionPage(1);
  };

  // Select existing chat session
  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    const session = sessions.find((s) => s.id === sessionId);
    setMessages(session ? session.messages : []);
  };

  // Delete chat session
  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions((prev) => {
      const next = prev.filter((s) => s.id !== sessionId);
      const maxPages = Math.max(1, Math.ceil(next.length / SESSIONS_PER_PAGE));
      if (sessionPage > maxPages) setSessionPage(maxPages);
      return next;
    });
    if (activeSessionId === sessionId) {
      setActiveSessionId("");
      setMessages([]);
    }
    toast.success("Chat session deleted");
  };

  // Send Chat Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || loading) return;

    const userText = inputQuery.trim();
    setInputQuery("");

    // Create session if none active
    let currSessionId = activeSessionId;
    if (!currSessionId) {
      currSessionId = `session-${Date.now()}`;
      setActiveSessionId(currSessionId);
    }

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    // Update Session Title if first message
    setSessions((prev) => {
      const existing = prev.find((s) => s.id === currSessionId);
      if (existing) {
        return prev.map((s) =>
          s.id === currSessionId
            ? { ...s, title: s.messages.length === 0 ? userText.slice(0, 32) : s.title, messages: updatedMessages }
            : s
        );
      } else {
        return [
          {
            id: currSessionId,
            title: userText.slice(0, 32),
            createdAt: new Date().toLocaleDateString(),
            messages: updatedMessages,
          },
          ...prev,
        ];
      }
    });

    setLoading(true);
    setActiveTaskId(undefined);

    try {
      const recentHistory = messages.slice(-6).map((m) => ({ sender: m.sender, text: m.text }));
      const res = await api.post("/ai/chat", { query: userText, history: recentHistory });
      if (res.data?.taskId) {
        setActiveTaskId(res.data.taskId);
      }

      const aiData = res.data?.data || {};
      const aiMessage: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: "ai",
        text: aiData.answer || res.data?.message || "No response received.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        confidenceScore: res.data?.confidenceScore,
        sources: aiData.sources || [],
        canAutoAssignTicket: aiData.canAutoAssignTicket || res.data?.canAutoAssignTicket || false,
        requiresTicketCreation: aiData.requiresTicketCreation || res.data?.requiresTicketCreation || false,
      };

      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);

      // Save to sessions history
      setSessions((prev) =>
        prev.map((s) => (s.id === currSessionId ? { ...s, messages: finalMessages } : s))
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to reach AI Assistant");
    } finally {
      setLoading(false);
    }
  };

  // Auto Create & Assign Ticket from Low-Confidence Chat Inquiry
  const handleAutoCreateTicket = async (userQuestion: string) => {
    try {
      toast.loading("Invoking AI Smart Auto-Assignment Engine...", { id: "ticket-create" });
      const res = await api.post("/tickets", {
        subject: `Unresolved Query: ${userQuestion}`,
        description: `Unresolved Chat Inquiry from User: "${userQuestion}"`,
        requesterType: "passenger",
      });

      const ticketNumber = res.data?.data?.ticket?.ticketNumber || "TCK-NEW";
      const assignedName = res.data?.data?.assignment?.assignedAdminName || "Specialist Agent";

      toast.success(`Ticket ${ticketNumber} created and assigned to ${assignedName}!`, { id: "ticket-create" });

      const confirmationMsg: ChatMessage = {
        id: `msg-ticket-${Date.now()}`,
        sender: "ai",
        text: `✅ Support Ticket Created & Auto-Assigned!\n\nTicket Number: ${ticketNumber}\nAssigned Specialist: ${assignedName}\nInitial Status: ASSIGNED\n\nA specialist has been assigned to investigate your request. You can view & manage this ticket on the Support Tickets dashboard.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        confidenceScore: 100,
      };

      const updated = [...messages, confirmationMsg];
      setMessages(updated);
      setSessions((prev) =>
        prev.map((s) => (s.id === activeSessionId ? { ...s, messages: updated } : s))
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create support ticket", { id: "ticket-create" });
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-[calc(100vh-6rem)] gap-4 text-slate-900 dark:text-slate-100 overflow-x-hidden pb-8">
      {/* ── LEFT PANEL: Stored Chat Sessions Sidebar ── */}
      <div className="w-full lg:w-80 shrink-0 bg-surface-light border border-gray-light rounded-2xl p-4 flex flex-col gap-4 shadow-xs">
        <button
          type="button"
          onClick={handleNewSession}
          style={{ backgroundColor: primaryColor }}
          className="w-full py-3.5 px-4 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg text-xs transition-all cursor-pointer hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          <span>{t("chat.new_session", "New Chat Session")}</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-400 px-1 uppercase tracking-wider">
          <Clock className="w-3.5 h-3.5" style={{ color: primaryColor }} />
          <span>{t("chat.stored_sessions", "Stored Chat Sessions")}</span>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {sessions.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400 italic">
              No previous chat history found. Start a new chat!
            </div>
          ) : (
            paginatedSessions.map((sess) => {
              const isActive = sess.id === activeSessionId;
              return (
                <div
                  key={sess.id}
                  onClick={() => handleSelectSession(sess.id)}
                  style={
                    isActive
                      ? {
                          backgroundColor: `${primaryColor}15`,
                          borderColor: `${primaryColor}40`,
                          color: primaryColor,
                        }
                      : {}
                  }
                  className={`p-3.5 rounded-2xl cursor-pointer transition-all border group relative ${
                    isActive
                      ? "font-bold"
                      : "bg-slate-50 dark:bg-[#1E2235]/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 truncate">
                      <MessageSquare className="w-3.5 h-3.5 shrink-0" style={{ color: primaryColor }} />
                      <span className="text-xs truncate">{sess.title}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteSession(sess.id, e)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition-opacity p-0.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{sess.createdAt}</span>
                    <span className="ml-auto font-bold" style={{ color: primaryColor }}>{sess.messages.length} msgs</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Session Pagination Footer Bar */}
        {totalSessions > SESSIONS_PER_PAGE && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 text-[11px] shrink-0">
            <span className="text-slate-400 font-semibold">
              Page {sessionPage} of {totalSessionPages} ({totalSessions} chats)
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={sessionPage <= 1}
                onClick={() => setSessionPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-gray-6 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                title="Previous Page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <span className="px-2.5 py-0.5 font-extrabold rounded-md text-white shadow-xs" style={{ backgroundColor: primaryColor }}>
                {sessionPage}
              </span>

              <button
                type="button"
                disabled={sessionPage >= totalSessionPages}
                onClick={() => setSessionPage((p) => Math.min(totalSessionPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-gray-6 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                title="Next Page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── RIGHT PANEL: Main Chat Window & Progress Feed ── */}
      <div className="flex-1 bg-surface-light border border-gray-light rounded-2xl p-5 flex flex-col shadow-xs">
        {/* Header */}
        <div className="pb-4 mb-4 border-b border-gray-light flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: primaryColor }}>
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {t("chat.assistant_title", "Multilingual AI Support Assistant")}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black border" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor, borderColor: `${primaryColor}30` }}>
                  Multi-Lang RAG
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Strictly answers from company policy guidance. Supports English, Arabic.
              </p>
            </div>
          </div>
        </div>

        {/* Live Progress Bar Indicator (WS Stream) */}
        {loading && (
          <div className="mb-4 p-3.5 border rounded-2xl space-y-2" style={{ backgroundColor: `${primaryColor}10`, borderColor: `${primaryColor}30` }}>
            <div className="flex items-center justify-between text-xs font-bold" style={{ color: primaryColor }}>
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" style={{ color: primaryColor }} />
                {liveProgress?.message || "AI Multi-Lang RAG Processing..."}
              </span>
              <span className="font-mono font-black">{liveProgress?.percentage || 30}%</span>
            </div>
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-300 rounded-full"
                style={{ width: `${liveProgress?.percentage || 30}%`, backgroundColor: primaryColor }}
              />
            </div>
          </div>
        )}

        {/* Chat Messages Scroll Container */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-3xl flex items-center justify-center border" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor, borderColor: `${primaryColor}30` }}>
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Welcome to AI Support Chat
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  Ask any question regarding driver policies, refund procedures, verification steps, or app navigation in any supported language.
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs leading-relaxed ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.sender === "ai" && (
                  <div className="w-8 h-8 rounded-xl text-white flex items-center justify-center font-bold shrink-0 shadow-md" style={{ backgroundColor: primaryColor }}>
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  style={msg.sender === "user" ? { backgroundColor: primaryColor, color: "#ffffff" } : {}}
                  className={`max-w-xl p-4 rounded-2xl space-y-2 shadow-sm ${
                    msg.sender === "user"
                      ? "rounded-br-none"
                      : "bg-slate-100 dark:bg-[#1E2235] text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-bl-none"
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>

                  {/* Sources & AI Confidence */}
                  {msg.sender === "ai" && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-2 text-[10.5px]">
                      {msg.confidenceScore !== undefined && (
                        <span
                          className={`px-2 py-0.5 rounded-full font-mono font-bold border ${
                            msg.confidenceScore >= 75
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                          }`}
                        >
                          {msg.confidenceScore}% AI Match
                        </span>
                      )}

                      {msg.sources && msg.sources.length > 0 && (
                        <div className="flex items-center gap-1 text-slate-400">
                          <ShieldCheck className="w-3 h-3" style={{ color: primaryColor }} />
                          <span>Sources: {msg.sources.join(", ")}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Create & Auto-Assign Support Ticket Action Button */}
                  {msg.sender === "ai" && (msg.canAutoAssignTicket || msg.requiresTicketCreation || (msg.confidenceScore !== undefined && msg.confidenceScore < 75) || msg.text.includes("click below")) && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          const idx = messages.indexOf(msg);
                          const prevUserMsg = idx > 0 ? messages[idx - 1]?.text : "Inquiry";
                          handleAutoCreateTicket(prevUserMsg);
                        }}
                        style={{ backgroundColor: primaryColor }}
                        className="w-full py-2.5 px-4 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer hover:opacity-90"
                      >
                        <LifeBuoy className="w-4 h-4" />
                        <span>Create & Auto-Assign Support Ticket</span>
                      </button>
                    </div>
                  )}

                  <div className={`text-[10px] font-mono ${msg.sender === "user" ? "text-white/80 text-right" : "text-slate-400"}`}>
                    {msg.timestamp}
                  </div>
                </div>

                {msg.sender === "user" && (
                  <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold shrink-0">
                    U
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="mt-4 flex items-center gap-3">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={t("chat.input_placeholder", "Ask a question in English, Arabic...")}
            className="flex-1 px-4 py-3.5 bg-slate-50 dark:bg-[#1E2235] border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-slate-100 font-semibold focus:outline-none transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={loading || !inputQuery.trim()}
            style={{ backgroundColor: primaryColor }}
            className="px-6 py-3.5 disabled:opacity-50 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer shrink-0 hover:opacity-90"
          >
            <span>{t("common.send", "Send")}</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AiChatPage;
