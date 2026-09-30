import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  Search,
  Filter,
  User,
  Clock,
  Loader2,
  ShieldAlert,
  Code2,
  RefreshCw,
  ChevronDown,
  Check,
  Layers,
} from "lucide-react";
import { Modal } from "../../../components/common/modal/Modal";
import { auditLogApi, type AuditLogItem, type AuditLogAdminItem } from "../../../services/auditLogApi";
import toast from "react-hot-toast";
import { useThemeCustomizer } from "../../../context/ThemeCustomizerContext";
import { BasicTable } from "../../../components/common/Table/BasicTable";

const MODULE_OPTIONS = [
  { value: "", label: "All Modules" },
  { value: "AUTH", label: "Authentication" },
  { value: "RBAC_MODULES", label: "RBAC Modules" },
  { value: "RBAC_PERMISSIONS", label: "RBAC Permissions" },
  { value: "RBAC_ROLES", label: "RBAC Roles" },
  { value: "CMS", label: "CMS Pages" },
  { value: "VERSIONS", label: "App Versions" },
];

interface CustomDropdownProps {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  icon?: React.ReactNode;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  value,
  onChange,
  options,
  placeholder,
  icon,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between gap-2 px-3.5 py-2 bg-slate-50 dark:bg-[#1E2235] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-black hover:border-primary/50 transition-colors cursor-pointer text-start shadow-2xs"
      >
        <div className="flex items-center gap-2 truncate">
          {icon}
          <span className="truncate font-semibold">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${
            isOpen ? "rotate-180 text-primary" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-surface-light border border-slate-200 dark:border-slate-700/80 rounded-xl shadow-xl p-1 max-h-60 overflow-y-auto animate-in fade-in duration-150">
          {options.filter((opt) => opt && opt.label).map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-lg transition-colors text-start cursor-pointer ${
                  isSelected
                    ? "bg-primary/10 text-primary font-bold"
                    : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70"
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0 ms-2" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const AuditLogsPage: React.FC = () => {
  const { primaryColor } = useThemeCustomizer();
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [admins, setAdmins] = useState<AuditLogAdminItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedAdminId, setSelectedAdminId] = useState("");
  const [selectedModule, setSelectedModule] = useState("");
  const [selectedAction] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Details Inspection Modal
  const [inspectItem, setInspectItem] = useState<AuditLogItem | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await auditLogApi.getAuditLogs({
        page,
        limit,
        adminId: selectedAdminId,
        module: selectedModule,
        action: selectedAction,
        search,
      });

      setLogs(res.data || []);
      if (res.meta) {
        setTotal(res.meta.total);
        setTotalPages(res.meta.totalPages);
      }
    } catch (err: any) {
      toast.error("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      const res = await auditLogApi.getAuditLogAdmins();
      setAdmins(res.data || []);
    } catch (err: any) {
      // Silently fail
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [page, limit, selectedAdminId, selectedModule, selectedAction]);

  const startRow = total === 0 ? 0 : (page - 1) * limit + 1;
  const endRow = Math.min(page * limit, total);

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const getActionBadgeColor = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes("LOGIN")) return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    if (act.includes("LOGOUT")) return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    if (act.includes("CREATE")) return "bg-purple-500/10 text-purple-500 border-purple-500/20";
    if (act.includes("UPDATE") || act.includes("ASSIGN")) return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    if (act.includes("DELETE")) return "bg-rose-500/10 text-rose-500 border-rose-500/20";
    return "bg-amber-500/10 text-amber-500 border-amber-500/20";
  };

  const adminOptions = [
    { value: "", label: "All Users" },
    ...admins
      .filter((a) => a && (a.id || (a as any).admin_id))
      .map((a) => {
        const userId = a.id || (a as any).admin_id;
        return {
          value: userId,
          label: a.name || a.email || "User",
        };
      })
      .filter((opt) => Boolean(opt.value)),
  ];

  const columns = useMemo(
    () => [
      {
        key: "createdAt",
        label: "Timestamp",
        render: (log: AuditLogItem) => (
          <div className="flex items-center gap-1.5 font-mono text-slate-500 whitespace-nowrap">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{new Date(log.createdAt).toLocaleString()}</span>
          </div>
        ),
      },
      {
        key: "adminName",
        label: "User",
        render: (log: AuditLogItem) => (
          <div className="flex items-center gap-2 py-0.5 whitespace-nowrap">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shrink-0"
              style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
            >
              {(log.adminName || log.adminEmail || "U").charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="font-bold text-black block">{log.adminName || "System / Guest"}</span>
              <span className="text-[10px] text-slate-400 font-mono block">
                {log.adminEmail || "-"}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: "action",
        label: "Action",
        render: (log: AuditLogItem) => (
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${getActionBadgeColor(log.action)}`}>
            {log.action}
          </span>
        ),
      },
      {
        key: "module",
        label: "Module",
        render: (log: AuditLogItem) => (
          <span className="font-mono font-bold text-slate-500">{log.module}</span>
        ),
      },
      {
        key: "description",
        label: "Description",
        render: (log: AuditLogItem) => (
          <span className="font-semibold text-slate-700 dark:text-slate-200">{log.description}</span>
        ),
      },
      {
        key: "details",
        label: "Details",
        align: "right" as const,
        headerAlign: "right" as const,
        render: (log: AuditLogItem) =>
          log.details ? (
            <button
              onClick={() => setInspectItem(log)}
              className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs font-bold text-primary transition-colors cursor-pointer ms-auto"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Inspect</span>
            </button>
          ) : (
            <span className="text-slate-400 text-[10px] font-mono">-</span>
          ),
      },
    ],
    [primaryColor],
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-surface-light p-6 rounded-2xl border border-gray-light shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-black tracking-tight">
              Audit Logs
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Comprehensive system audit trailing. Inspect user activities, login events, and data changes.
            </p>
          </div>
        </div>

        <button
          onClick={fetchLogs}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-surface-light p-4 rounded-2xl border border-gray-light shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search user, email, description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#1E2235] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-black focus:outline-none focus:border-primary font-semibold"
            />
          </div>

          {/* User Wise Filter */}
          <div>
            <CustomDropdown
              value={selectedAdminId}
              onChange={(val) => {
                setSelectedAdminId(val);
                setPage(1);
              }}
              options={adminOptions}
              placeholder="All Users"
              icon={<User className="w-3.5 h-3.5 text-primary shrink-0" />}
            />
          </div>

          {/* Module Filter */}
          <div>
            <CustomDropdown
              value={selectedModule}
              onChange={(val) => {
                setSelectedModule(val);
                setPage(1);
              }}
              options={MODULE_OPTIONS}
              placeholder="All Modules"
              icon={<Layers className="w-3.5 h-3.5 text-primary shrink-0" />}
            />
          </div>

          {/* Submit Search Button */}
          <button
            type="submit"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Apply Filter</span>
          </button>
        </form>
      </div>

      {/* Audit Logs Table (Identical to Suppliers & Buyers) */}
      <div className="bg-surface-light rounded-2xl border border-gray-light shadow-xs overflow-hidden">
        <BasicTable
          isLoading={loading}
          isSuccess={!loading}
          isError={false}
          data={logs}
          columns={columns}
          totalCount={total}
          pageNumber={page}
          setPageNumber={setPage}
          pageSize={limit}
          setPageSize={(s) => {
            setLimit(s);
            setPage(1);
          }}
          stickyHeader={false}
        />
      </div>

      {/* Json Details Inspection Modal */}
      {inspectItem && (
        <Modal
          open={Boolean(inspectItem)}
          setOpen={() => setInspectItem(null)}
          title={`Audit Payload: ${inspectItem.action}`}
          maxWidth="md"
        >
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs bg-surface p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-slate-400 block font-bold">User</span>
                <strong className="text-black">{inspectItem.adminName} ({inspectItem.adminEmail})</strong>
              </div>
              <div>
                <span className="text-slate-400 block font-bold">IP Address</span>
                <strong className="font-mono text-black">{inspectItem.ipAddress || "Internal"}</strong>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Payload Details (JSON)
              </label>
              <pre className="p-4 bg-slate-950 text-emerald-400 rounded-xl text-xs font-mono overflow-x-auto whitespace-pre-wrap max-h-96">
                {JSON.stringify(inspectItem.details, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectItem(null)}
                className="px-5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AuditLogsPage;
