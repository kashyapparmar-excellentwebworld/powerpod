import React, { useMemo, useState, useEffect } from "react";
import { Download, CalendarDays, X, Users } from "lucide-react";
import { Popover } from "@mui/material";
import { BasicTable } from "../../../components/common/Table/BasicTable";
import { RowActions } from "../../../components/common/Table/RowActions";
import { useNavigate } from "react-router-dom";
import { SearchInput } from "../../../components/common/SearchInput";
import { useMainLayoutHeaderActions } from "../../../context/MainLayoutHeaderActionsContext";
import { CustomDateCalendar } from "../../../components/common/DatePicker";
import { DeleteConfirmModal } from "../../../components/common/modal/DeleteConfirmModal";
import { ActiveDeactivateModal } from "../../../components/common/modal/ActiveDeactivateModal";
import useToast from "../../../hooks/useToast";
import { Badge, type BadgeColor } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";

// ── Dummy Data ──────────────────────────────────────────────────────────────
const INITIAL_BUYERS: any[] = Array.from({ length: 35 }, (_, i) => ({
  id: `BUY-${String(i + 1).padStart(4, "0")}`,
  name: [
    "Ahmed Al-Rashid",
    "Sara Mohammed",
    "Khalid Hassan",
    "Fatima Al-Zahra",
    "Omar Abdullah",
    "Noura Saleh",
    "Youssef Ibrahim",
    "Layla Ahmed",
    "Tariq Mansour",
    "Amira Faisal",
  ][i % 10],
  email: `buyer${i + 1}@example.com`,
  mobile: `+966 5${String(Math.floor(10000000 + Math.random() * 90000000))}`,
  orders: Math.floor(Math.random() * 50) + 1,
  totalSpent: Math.floor(Math.random() * 50000) + 1000,
  status: ["active", "inactive", "pending"][i % 3],
  joinedAt: new Date(2024, i % 12, (i % 28) + 1).toLocaleDateString("en-GB"), // DD/MM/YYYY
  joinedAtRaw: new Date(2024, i % 12, (i % 28) + 1), // for easier date filtering
}));

const STATUS_BADGE: Record<string, BadgeColor> = {
  active: "emerald",
  inactive: "rose",
  pending: "amber",
};

const BuyersPage: React.FC = () => {
  const navigate = useNavigate();
  const { setActions, clearActions } = useMainLayoutHeaderActions();

  const [buyers, setBuyers] = useState(INITIAL_BUYERS);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedBuyerId, setSelectedBuyerId] = useState<string | null>(null);
  const { showToast } = useToast();

  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) =>
    setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const open = Boolean(anchorEl);
  const popoverId = open ? "date-calendar-popover" : undefined;

  useEffect(() => {
    setActions(
      <Button
        variant="contained"
        color="primary"
        startIcon={<Download className="w-4 h-4" />}
        sx={{
          borderRadius: "12px",
          textTransform: "none",
          fontWeight: 600,
          borderColor: "#e5e7eb",
          padding: "6px 16px",
          height: "38px",
          fontSize: "14px",
        }}
      >
        Export CSV
      </Button>,
    );
    return () => clearActions();
  }, [setActions, clearActions]);

  const confirmToggleStatus = () => {
    if (!selectedBuyerId) return;
    setBuyers((prev) =>
      prev.map((b) =>
        b.id === selectedBuyerId
          ? { ...b, status: b.status === "active" ? "inactive" : "active" }
          : b,
      ),
    );
    showToast("Status updated successfully", "success");
    setStatusModalOpen(false);
    setSelectedBuyerId(null);
  };

  const confirmDelete = () => {
    if (!selectedBuyerId) return;
    setBuyers((prev) => prev.filter((b) => b.id !== selectedBuyerId));
    showToast("Buyer deleted successfully", "success");
    setDeleteModalOpen(false);
    setSelectedBuyerId(null);
  };

  const filtered = useMemo(() => {
    return buyers.filter((b) => {
      const matchSearch =
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.email.toLowerCase().includes(search.toLowerCase()) ||
        b.mobile.includes(search);

      let matchDate = true;
      if (dateFilter) {
        // user selects YYYY-MM-DD
        const selectedDateStr = new Date(dateFilter).toLocaleDateString(
          "en-GB",
        );
        matchDate = b.joinedAt === selectedDateStr;
      }
      return matchSearch && matchDate;
    });
  }, [buyers, search, dateFilter]);

  const paginated = useMemo(() => {
    const start = (pageNumber - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, pageNumber, pageSize]);

  const columns = useMemo(
    () => [
      {
        key: "id",
        label: "Buyer ID",
        render: (row: any) => (
          <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
            {row.id}
          </span>
        ),
      },
      {
        key: "name",
        label: "Name",
        render: (row: any) => (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-linear-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white text-xs font-black shrink-0">
              {row.name.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-[13px]">
                {row.name}
              </p>
              <p className="text-[11px] text-gray-400">{row.email}</p>
            </div>
          </div>
        ),
      },
      {
        key: "mobile",
        label: "Mobile",
        render: (row: any) => (
          <span className="text-gray-600 text-[13px]">{row.mobile}</span>
        ),
      },
      {
        key: "orders",
        label: "Orders",
        align: "center" as const,
        headerAlign: "center" as const,
        render: (row: any) => (
          <span className="font-bold text-gray-700">{row.orders}</span>
        ),
      },
      {
        key: "totalSpent",
        label: "Total Spent",
        align: "right" as const,
        headerAlign: "right" as const,
        render: (row: any) => (
          <span className="font-black text-purple-700">
            SAR {row.totalSpent.toLocaleString()}
          </span>
        ),
      },
      {
        key: "status",
        label: "Status",
        align: "center" as const,
        headerAlign: "center" as const,
        render: (row: any) => (
          <Badge color={STATUS_BADGE[row.status] || STATUS_BADGE.inactive}>
            {row.status}
          </Badge>
        ),
      },
      {
        key: "joinedAt",
        label: "Joined",
        render: (row: any) => (
          <span className="text-gray-400 text-xs">{row.joinedAt}</span>
        ),
      },
      {
        key: "actions",
        label: "Actions",
        align: "center" as const,
        headerAlign: "center" as const,
        minWidth: 50,
        sx: { width: 50 },
        render: (row: any) => (
          <div className="flex justify-center">
            <RowActions
              onView={() => navigate(`/buyers/${row.id}`)}
              onDelete={() => {
                setSelectedBuyerId(row.id);
                setDeleteModalOpen(true);
              }}
              isActive={row.status === "active"}
              onToggleStatus={() => {
                setSelectedBuyerId(row.id);
                setStatusModalOpen(true);
              }}
            />
          </div>
        ),
      },
    ],
    [navigate],
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Top Hero Header Card */}
      <div className="bg-surface-light p-6 rounded-2xl border border-gray-light shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-black tracking-tight">
              Buyer Management
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage registered buyer profiles, view order volume, total spending, and active account statuses.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-surface-light rounded-2xl border border-gray-light shadow-xs overflow-hidden flex flex-col">
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <SearchInput
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPageNumber(1);
            }}
            placeholder="Search by name, email or mobile..."
            className="w-full sm:w-80"
          />

          <div className="relative w-full sm:w-auto flex items-center justify-end">
            <div
              aria-describedby={popoverId}
              onClick={handleClick}
              className={`flex items-center gap-2 px-3 py-2 bg-white rounded-xl text-sm font-semibold transition-all shadow-xs h-[38px] cursor-pointer ${
                open
                  ? "border-primary ring-2 ring-primary/20 text-gray-900"
                  : "border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
              }`}
            >
              <CalendarDays className="w-4 h-4 text-purple-600" />
              <span>
                {dateFilter
                  ? new Date(dateFilter).toLocaleDateString("en-GB")
                  : "Select Date"}
              </span>
              {dateFilter && (
                <div
                  className="p-0.5 hover:bg-gray-200 rounded-full transition-colors ml-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDateFilter("");
                    setPageNumber(1);
                  }}
                >
                  <X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
                </div>
              )}
            </div>
            <Popover
              id={popoverId}
              open={open}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              sx={{
                "& .MuiPaper-root": {
                  borderRadius: "16px",
                  marginTop: "8px",
                  maxWidth: "calc(100vw - 32px)",
                  boxShadow:
                    "0 20px 25px -5px rgba(147, 51, 234, 0.1), 0 8px 10px -6px rgba(147, 51, 234, 0.1)",
                },
              }}
            >
              <CustomDateCalendar
                value={dateFilter}
                onChange={(val, selectionState) => {
                  setDateFilter(val);
                  setPageNumber(1);
                  // Only close the popover if selection is finished (day clicked)
                  // If selectionState is 'partial' (e.g. year selected), do not close.
                  if (selectionState === "finish" || !selectionState) {
                    handleClose();
                  }
                }}
              />
            </Popover>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden">
          <BasicTable
            isLoading={false}
            isSuccess={true}
            isError={false}
            data={paginated}
            columns={columns}
            totalCount={filtered.length}
            pageNumber={pageNumber}
            setPageNumber={setPageNumber}
            pageSize={pageSize}
            setPageSize={(s) => {
              setPageSize(s);
              setPageNumber(1);
            }}
            stickyHeader={false}
          />
        </div>
      </div>

      <DeleteConfirmModal
        open={deleteModalOpen}
        setOpen={setDeleteModalOpen}
        onConfirm={confirmDelete}
        title="Delete Buyer?"
        description="Are you sure you want to permanently delete this buyer account?"
      />

      <ActiveDeactivateModal
        open={statusModalOpen}
        setOpen={setStatusModalOpen}
        onConfirm={confirmToggleStatus}
        title="Update Buyer Status?"
        description="Are you sure you want to change the active status of this buyer?"
      />
    </div>
  );
};

export default BuyersPage;
