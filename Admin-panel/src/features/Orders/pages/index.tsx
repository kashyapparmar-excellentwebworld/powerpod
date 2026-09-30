import React, { useMemo, useState } from "react";
import {
  Filter,
  ClipboardList,
  TrendingUp,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { BasicTable } from "../../../components/common/Table/BasicTable";
import { RowActions } from "../../../components/common/Table/RowActions";
import { SearchInput } from "../../../components/common/SearchInput";
import { SingleSelect } from "../../../components/common/Select";
import { Badge, type BadgeColor } from "../../../components/common/Badge";
import { useNavigate } from "react-router-dom";
import { DeleteConfirmModal } from "../../../components/common/modal/DeleteConfirmModal";
import useToast from "../../../hooks/useToast";
// ── Dummy Data ──────────────────────────────────────────────────────────────
const BUYERS = [
  "Ahmed Al-Rashid",
  "Sara Mohammed",
  "Khalid Hassan",
  "Fatima Al-Zahra",
  "Omar Abdullah",
  "Noura Saleh",
  "Youssef Ibrahim",
  "Layla Ahmed",
];

const SUPPLIERS = [
  "Al-Noor Trading Co.",
  "Riyadh Supplies Ltd.",
  "Gulf Merchants Group",
  "Jeddah Wholesale Hub",
  "Eastern Province Traders",
  "Al-Madinah Commerce",
];

const ORDERS: any[] = Array.from({ length: 50 }, (_, i) => ({
  id: `ORD-${String(2024100 + i + 1)}`,
  buyer: BUYERS[i % BUYERS.length],
  supplier: SUPPLIERS[i % SUPPLIERS.length],
  items: Math.floor(Math.random() * 10) + 1,
  amount: Math.floor(Math.random() * 40000) + 500,
  status: ["completed", "ongoing", "pending", "cancelled"][i % 4],
  paymentStatus: ["paid", "unpaid", "refunded"][i % 3],
  date: new Date(2024, i % 12, (i % 28) + 1).toLocaleDateString("en-GB"),
  createdAt: new Date(2024, i % 12, (i % 28) + 1),
}));

const ORDER_STATUS: Record<
  string,
  { color: BadgeColor; icon: React.ReactNode }
> = {
  completed: {
    color: "emerald",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  ongoing: {
    color: "blue",
    icon: <TrendingUp className="w-3 h-3" />,
  },
  pending: {
    color: "amber",
    icon: <Clock className="w-3 h-3" />,
  },
  cancelled: {
    color: "rose",
    icon: <XCircle className="w-3 h-3" />,
  },
};

const PAYMENT_BADGE: Record<string, BadgeColor> = {
  paid: "emerald",
  unpaid: "rose",
  refunded: "purple",
};

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [orders, setOrders] = useState(ORDERS);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const { showToast } = useToast();

  const confirmDelete = () => {
    if (!selectedOrderId) return;
    setOrders((prev) => prev.filter((o) => o.id !== selectedOrderId));
    showToast("Order deleted successfully", "success");
    setDeleteModalOpen(false);
    setSelectedOrderId(null);
  };

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        o.id.toLowerCase().includes(search.toLowerCase()) ||
        o.buyer.toLowerCase().includes(search.toLowerCase()) ||
        o.supplier.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || o.status === statusFilter;
      const matchPayment =
        paymentFilter === "all" || o.paymentStatus === paymentFilter;
      return matchSearch && matchStatus && matchPayment;
    });
  }, [orders, search, statusFilter, paymentFilter]);

  const paginated = useMemo(() => {
    const start = (pageNumber - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, pageNumber, pageSize]);

  const totalRevenue = orders.reduce((acc, o) => acc + o.amount, 0);

  const columns = useMemo(
    () => [
      {
        key: "id",
        label: "Order ID",
        render: (row: any) => (
          <span className="font-mono text-xs font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md">
            {row.id}
          </span>
        ),
      },
      {
        key: "buyer",
        label: "Buyer",
        render: (row: any) => (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-linear-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white text-[10px] font-black shrink-0">
              {row.buyer.charAt(0)}
            </div>
            <span className="font-semibold text-gray-800 text-[13px]">
              {row.buyer}
            </span>
          </div>
        ),
      },
      {
        key: "supplier",
        label: "Supplier",
        render: (row: any) => (
          <span className="text-gray-600 text-[13px]">{row.supplier}</span>
        ),
      },
      {
        key: "items",
        label: "Items",
        align: "center" as const,
        headerAlign: "center" as const,
        render: (row: any) => (
          <span className="font-bold text-gray-700">{row.items}</span>
        ),
      },
      {
        key: "amount",
        label: "Amount",
        align: "right" as const,
        headerAlign: "right" as const,
        render: (row: any) => (
          <span className="font-black text-purple-700">
            SAR {row.amount.toLocaleString()}
          </span>
        ),
      },
      {
        key: "paymentStatus",
        label: "Payment",
        align: "center" as const,
        headerAlign: "center" as const,
        render: (row: any) => (
          <Badge color={PAYMENT_BADGE[row.paymentStatus]}>
            {row.paymentStatus}
          </Badge>
        ),
      },
      {
        key: "status",
        label: "Status",
        align: "center" as const,
        headerAlign: "center" as const,
        render: (row: any) => {
          const s = ORDER_STATUS[row.status];
          return (
            <Badge color={s.color} icon={s.icon}>
              {row.status}
            </Badge>
          );
        },
      },
      {
        key: "date",
        label: "Date",
        render: (row: any) => (
          <span className="text-gray-400 text-xs">{row.date}</span>
        ),
      },
      {
        key: "actions",
        label: "Actions",
        align: "center" as const,
        headerAlign: "center" as const,
        render: (_row: any) => (
          <div className="flex justify-center">
            <RowActions
              onView={() => navigate(`/orders/${_row.id}`)}
              onDelete={() => {
                setSelectedOrderId(_row.id);
                setDeleteModalOpen(true);
              }}
            />
          </div>
        ),
      },
    ],
    [],
  );

  const summaryCards = [
    {
      label: "Total Orders",
      value: orders.length,
      color: "text-gray-800",
      sub: "All time",
    },
    {
      label: "Completed",
      value: orders.filter((o) => o.status === "completed").length,
      color: "text-emerald-700",
      sub: "Successfully delivered",
    },
    {
      label: "Ongoing",
      value: orders.filter((o) => o.status === "ongoing").length,
      color: "text-blue-700",
      sub: "In progress",
    },
    {
      label: "Cancelled",
      value: orders.filter((o) => o.status === "cancelled").length,
      color: "text-rose-700",
      sub: "Cancelled",
    },
    {
      label: "Total Revenue",
      value: `SAR ${(totalRevenue / 1000).toFixed(0)}K`,
      color: "text-purple-700",
      sub: "All orders",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-linear-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg shadow-emerald-500/20">
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900">
              Order Management
            </h1>
            <p className="text-xs text-gray-400 font-medium">
              {filtered.length} orders found
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {summaryCards.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
          >
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
              {s.label}
            </p>
            <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-gray-300 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Data Container (Filters + Table) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <SearchInput
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPageNumber(1);
            }}
            placeholder="Search by order ID, buyer or supplier..."
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
                  { label: "Completed", value: "completed" },
                  { label: "Ongoing", value: "ongoing" },
                  { label: "Pending", value: "pending" },
                  { label: "Cancelled", value: "cancelled" },
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
            <div className="w-[140px]">
              <SingleSelect
                label=""
                value={paymentFilter}
                onChange={(val) => {
                  setPaymentFilter(val as string);
                  setPageNumber(1);
                }}
                options={[
                  { label: "All Payments", value: "all" },
                  { label: "Paid", value: "paid" },
                  { label: "Unpaid", value: "unpaid" },
                  { label: "Refunded", value: "refunded" },
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

      <DeleteConfirmModal
        open={deleteModalOpen}
        setOpen={setDeleteModalOpen}
        onConfirm={confirmDelete}
        title="Delete Order?"
        description="Are you sure you want to permanently delete this order?"
      />
    </div>
  );
};

export default OrdersPage;
