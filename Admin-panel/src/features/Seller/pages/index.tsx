import React, { useMemo, useState } from "react";
import { Filter, Star, Store } from "lucide-react";
import { BasicTable } from "../../../components/common/Table/BasicTable";
import { RowActions } from "../../../components/common/Table/RowActions";
import { SearchInput } from "../../../components/common/SearchInput";
import { SingleSelect } from "../../../components/common";
import { useNavigate } from "react-router-dom";
import { DeleteConfirmModal } from "../../../components/common/modal/DeleteConfirmModal";
import { ActiveDeactivateModal } from "../../../components/common/modal/ActiveDeactivateModal";
import useToast from "../../../hooks/useToast";
import { Badge, type BadgeColor } from "../../../components/common/Badge";

// ── Dummy Data ──────────────────────────────────────────────────────────────
const SUPPLIERS: any[] = Array.from({ length: 40 }, (_, i) => ({
  id: `SUP-${String(i + 1).padStart(4, "0")}`,
  name: [
    "Al-Noor Trading Co.",
    "Riyadh Supplies Ltd.",
    "Gulf Merchants Group",
    "Jeddah Wholesale Hub",
    "Eastern Province Traders",
    "Al-Madinah Commerce",
    "Dammam Distributors",
    "Makkah Business Center",
    "Tabuk Trade Alliance",
    "Abha Goods Network",
  ][i % 10],
  email: `supplier${i + 1}@example.com`,
  mobile: `+966 5${String(Math.floor(10000000 + Math.random() * 90000000))}`,
  category: [
    "Electronics",
    "Food & Beverage",
    "Clothing",
    "Machinery",
    "Raw Materials",
  ][i % 5],
  totalOrders: Math.floor(Math.random() * 300) + 10,
  revenue: Math.floor(Math.random() * 500000) + 20000,
  rating: +(3 + Math.random() * 2).toFixed(1),
  status: ["active", "pending", "rejected"][i % 3],
  joinedAt: new Date(2023, i % 12, (i % 28) + 1).toLocaleDateString("en-GB"),
}));

const STATUS_BADGE: Record<string, BadgeColor> = {
  active: "emerald",
  pending: "amber",
  rejected: "rose",
};

const CATEGORY_COLORS: Record<string, string> = {
  Electronics: "bg-blue-50 text-blue-700",
  "Food & Beverage": "bg-orange-50 text-orange-700",
  Clothing: "bg-pink-50 text-pink-700",
  Machinery: "bg-slate-50 text-slate-700",
  "Raw Materials": "bg-yellow-50 text-yellow-700",
};

const SuppliersPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter] = useState("all");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [suppliers, setSuppliers] = useState(SUPPLIERS);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(
    null,
  );
  const { showToast } = useToast();

  const confirmToggleStatus = () => {
    if (!selectedSupplierId) return;
    setSuppliers((prev) =>
      prev.map((s) =>
        s.id === selectedSupplierId
          ? { ...s, status: s.status === "active" ? "inactive" : "active" }
          : s,
      ),
    );
    showToast("Status updated successfully", "success");
    setStatusModalOpen(false);
    setSelectedSupplierId(null);
  };

  const confirmDelete = () => {
    if (!selectedSupplierId) return;
    setSuppliers((prev) => prev.filter((s) => s.id !== selectedSupplierId));
    showToast("Supplier deleted successfully", "success");
    setDeleteModalOpen(false);
    setSelectedSupplierId(null);
  };

  const filtered = useMemo(() => {
    return suppliers.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || s.status === statusFilter;
      const matchCategory =
        categoryFilter === "all" || s.category === categoryFilter;
      return matchSearch && matchStatus && matchCategory;
    });
  }, [suppliers, search, statusFilter, categoryFilter]);

  const paginated = useMemo(() => {
    const start = (pageNumber - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, pageNumber, pageSize]);

  const columns = useMemo(
    () => [
      {
        key: "id",
        label: "Supplier ID",
        render: (row: any) => (
          <span className="font-mono text-nowrap text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
            {row.id}
          </span>
        ),
      },
      {
        key: "name",
        label: "Supplier",
        render: (row: any) => (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-black shrink-0">
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
        key: "category",
        label: "Category",
        render: (row: any) => (
          <span
            className={`inline-block px-2 py-0.5 rounded-lg text-[11px] text-nowrap font-bold ${CATEGORY_COLORS[row.category] ?? "bg-gray-50 text-gray-600"}`}
          >
            {row.category}
          </span>
        ),
      },
      {
        key: "totalOrders",
        label: "Orders",
        align: "center" as const,
        headerAlign: "center" as const,
        render: (row: any) => (
          <span className="font-bold text-gray-700">{row.totalOrders}</span>
        ),
      },
      {
        key: "revenue",
        label: "Revenue",
        align: "right" as const,
        headerAlign: "right" as const,
        render: (row: any) => (
          <span className="font-black text-purple-700 text-nowrap">
            SAR {row.revenue.toLocaleString()}
          </span>
        ),
      },
      {
        key: "rating",
        label: "Rating",
        align: "center" as const,
        headerAlign: "center" as const,
        render: (row: any) => (
          <div className="flex items-center justify-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="font-bold text-gray-700 text-[13px]">
              {row.rating}
            </span>
          </div>
        ),
      },
      {
        key: "status",
        label: "Status",
        align: "center" as const,
        headerAlign: "center" as const,
        minWidth: 50,
        sx: { width: 50 },
        render: (row: any) => (
          <Badge color={STATUS_BADGE[row.status] || "default"}>
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
        render: (row: any) => (
          <div className="flex justify-center">
            <RowActions
              onView={() => navigate(`/suppliers/${row.id}`)}
              onDelete={() => {
                setSelectedSupplierId(row.id);
                setDeleteModalOpen(true);
              }}
              isActive={row.status === "active"}
              onToggleStatus={() => {
                setSelectedSupplierId(row.id);
                setStatusModalOpen(true);
              }}
            />
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Top Hero Header Card */}
      <div className="bg-surface-light p-6 rounded-2xl border border-gray-light shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-black tracking-tight">
              Supplier Management
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage supplier accounts, verify registration credentials, order volume, and revenue metrics.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-surface-light rounded-2xl border border-gray-light shadow-xs overflow-hidden flex flex-col">
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <SearchInput
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPageNumber(1);
            }}
            placeholder="Search by name or email..."
            className="w-full sm:w-80"
          />
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-gray-400 shrink-0" />
            <div className="w-[140px]">
              <SingleSelect
                label=""
                value={statusFilter}
                onChange={(val) => {
                  setStatusFilter(val as string);
                  setPageNumber(1);
                }}
                options={[
                  { label: "All Status", value: "all" },
                  { label: "Active", value: "active" },
                  { label: "Pending", value: "pending" },
                  { label: "Rejected", value: "rejected" },
                ]}
                sx={{
                  height: "38px !important",
                  minHeight: "38px !important",
                  padding: "0 12px !important",
                  "& .MuiSelect-select": {
                    height: "100% !important",
                    fontSize: "14px !important",
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div>
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
        title="Delete Supplier?"
        description="Are you sure you want to permanently delete this supplier account?"
      />

      <ActiveDeactivateModal
        open={statusModalOpen}
        setOpen={setStatusModalOpen}
        onConfirm={confirmToggleStatus}
        title="Update Supplier Status?"
        description="Are you sure you want to change the active status of this supplier?"
      />
    </div>
  );
};

export default SuppliersPage;
