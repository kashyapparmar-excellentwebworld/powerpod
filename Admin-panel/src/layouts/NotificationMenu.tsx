import { useState, useRef, useEffect } from "react";
import { Bell, Trash2, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "info" | "success" | "warning";
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "New Order Received",
    message: "Order #ORD-001 has been placed by Ali Express.",
    time: "5m ago",
    read: false,
    type: "info",
  },
  {
    id: "2",
    title: "KYC Approved",
    message: "Supplier 'Tech Corp' KYC documents approved.",
    time: "1h ago",
    read: false,
    type: "success",
  },
  {
    id: "3",
    title: "Payment Pending",
    message: "Invoice #INV-204 is awaiting payment.",
    time: "2h ago",
    read: true,
    type: "warning",
  },
];

export const NotificationMenu = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isAr = i18n.language === "ar";

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClearAll = () => {
    setNotifications([]);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((p) => !p)}
        className={`relative p-2.5 rounded-xl transition-all duration-300 cursor-pointer ${
          open
            ? "bg-primary/10 text-primary"
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
        }`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        )}
      </button>

      {open && (
        <div className="fixed sm:absolute top-14 sm:top-full inset-x-4 sm:inset-x-auto sm:inset-e-0 mt-2 sm:mt-3 sm:w-[320px] bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden z-100 animate-in fade-in slide-in-from-top-2 duration-200 origin-top">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-50 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800 text-sm">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                Clear All
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[340px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <Bell className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-sm font-semibold">No notifications</p>
                <p className="text-xs">You're all caught up!</p>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-slate-50">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className={`p-3 flex gap-2.5 cursor-pointer transition-colors ${
                      n.read
                        ? "bg-white hover:bg-slate-50/50"
                        : "bg-blue-50/30 hover:bg-blue-50/50"
                    }`}
                  >
                    <div className="mt-0.5">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          !n.read ? "bg-primary" : "bg-slate-200"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <h4
                        className={`text-sm ${!n.read ? "font-bold text-slate-800" : "font-semibold text-slate-600"}`}
                      >
                        {n.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                        {n.message}
                      </p>
                      <span className="text-[10px] font-medium text-slate-400 mt-1.5 block">
                        {n.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-slate-50 bg-white">
            <button
              onClick={() => {
                setOpen(false);
                navigate("/notifications");
              }}
              className="w-full py-2 flex items-center justify-center gap-1.5 text-xs font-bold text-primary hover:bg-primary/5 rounded-xl transition-colors cursor-pointer"
            >
              View All Notifications
              <ArrowRight
                className={`w-3.5 h-3.5 ${isAr ? "rotate-180" : ""}`}
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
