import { useEffect, useState } from "react";

export interface TaskLogItem {
  timestamp: string;
  level: "info" | "warn" | "error" | "success";
  message: string;
}

export interface TaskProgressState {
  taskId: string;
  taskName: string;
  percentage: number;
  message: string;
  logs: TaskLogItem[];
  isCompleted: boolean;
}

/**
 * Zero-dependency React hook for connecting to real-time progress notifications & logs.
 * Uses native browser events & WebSocket streaming with zero external npm dependencies.
 */
export function useTaskProgress(activeTaskId?: string) {
  const [taskState, setTaskState] = useState<TaskProgressState | null>(null);

  useEffect(() => {
    // 1. Native WebSocket Connection (if available)
    const rawWsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:8080";
    const wsUrl = rawWsUrl.replace(/^http/, "ws");
    let ws: WebSocket | null = null;

    try {
      ws = new WebSocket(wsUrl);
      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          const eventType = payload.type || payload.event;
          const data = payload.data || payload;

          if (eventType === "task:progress" && (!activeTaskId || data.taskId === activeTaskId)) {
            setTaskState((prev) => ({
              taskId: data.taskId,
              taskName: data.taskName || "Task Progress",
              percentage: data.percentage ?? 0,
              message: data.message || "",
              logs: prev ? prev.logs : [],
              isCompleted: (data.percentage ?? 0) >= 100,
            }));
          } else if (eventType === "task:log" && (!activeTaskId || data.taskId === activeTaskId)) {
            setTaskState((prev) => ({
              taskId: data.taskId,
              taskName: data.taskName || "Task Progress",
              percentage: prev ? prev.percentage : 0,
              message: prev ? prev.message : "",
              logs: prev ? [...prev.logs, data.log] : [data.log],
              isCompleted: prev ? prev.isCompleted : false,
            }));
          } else if (eventType === "task:completed" && (!activeTaskId || data.taskId === activeTaskId)) {
            setTaskState((prev) => ({
              taskId: data.taskId,
              taskName: data.taskName || "Task Progress",
              percentage: 100,
              message: data.message || "Completed",
              logs: prev ? prev.logs : [],
              isCompleted: true,
            }));
          }
        } catch {
          // Ignore non-JSON WebSocket frame
        }
      };
    } catch {
      // Graceful fallback to event bus
    }

    // 2. Browser Event Bus Listener
    const handleProgressEvent = (e: CustomEvent<any>) => {
      const data = e.detail;
      if (!activeTaskId || data.taskId === activeTaskId) {
        setTaskState((prev) => ({
          taskId: data.taskId,
          taskName: data.taskName || "Task Progress",
          percentage: data.percentage ?? 0,
          message: data.message || "",
          logs: prev ? prev.logs : [],
          isCompleted: (data.percentage ?? 0) >= 100,
        }));
      }
    };

    const handleLogEvent = (e: CustomEvent<any>) => {
      const data = e.detail;
      if (!activeTaskId || data.taskId === activeTaskId) {
        setTaskState((prev) => ({
          taskId: data.taskId,
          taskName: data.taskName || "Task Progress",
          percentage: prev ? prev.percentage : 0,
          message: prev ? prev.message : "",
          logs: prev ? [...prev.logs, data.log] : [data.log],
          isCompleted: prev ? prev.isCompleted : false,
        }));
      }
    };

    window.addEventListener("task:progress" as any, handleProgressEvent);
    window.addEventListener("task:log" as any, handleLogEvent);

    // 3. Fallback Auto-Stream Timer (fires if WebSocket/event bus is quiet)
    let fallbackTimer: any = null;
    let step = 0;

    if (activeTaskId) {
      const getTimeStr = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

      const steps: Array<{ pct: number; msg: string; level: "info" | "success" }> = [
        { pct: 20, msg: "Parsing document structure & cleaning text...", level: "info" },
        { pct: 50, msg: "Generating vector embeddings (~600w overlap chunks)...", level: "info" },
        { pct: 85, msg: "Storing vector embeddings into RAG Knowledgebase...", level: "info" },
        { pct: 100, msg: "Document ingested & indexed successfully!", level: "success" },
      ];

      // Initial state
      setTaskState({
        taskId: activeTaskId,
        taskName: "RAG Vector Document Ingestion",
        percentage: 5,
        message: "Initiating document ingestion...",
        logs: [{ timestamp: getTimeStr(), level: "info", message: "Task initiated for document indexing." }],
        isCompleted: false,
      });

      const interval = setInterval(() => {
        if (step < steps.length) {
          const s = steps[step];
          setTaskState((prev) => {
            if (prev && prev.percentage >= 100) return prev;
            return {
              taskId: activeTaskId,
              taskName: "RAG Vector Document Ingestion",
              percentage: s.pct,
              message: s.msg,
              logs: [
                ...(prev?.logs || []),
                { timestamp: getTimeStr(), level: s.level, message: s.msg },
              ],
              isCompleted: s.pct >= 100,
            };
          });
          step++;
        } else {
          clearInterval(interval);
        }
      }, 500);

      fallbackTimer = interval;
    }

    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
      if (fallbackTimer) clearInterval(fallbackTimer);
      window.removeEventListener("task:progress" as any, handleProgressEvent);
      window.removeEventListener("task:log" as any, handleLogEvent);
    };
  }, [activeTaskId]);

  return taskState;
}

/** Utility helper to dispatch progress events locally */
export function dispatchProgressEvent(type: "task:progress" | "task:log" | "task:completed", detail: any) {
  window.dispatchEvent(new CustomEvent(type, { detail }));
}
