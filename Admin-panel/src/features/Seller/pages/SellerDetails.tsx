import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  MapPin,
  Building,
  Edit2,
  Copy,
} from "lucide-react";
import { BasicTable } from "../../../components/common/Table/BasicTable";
import { RowActions } from "../../../components/common/Table/RowActions";
import { Badge, type BadgeColor } from "../../../components/common/Badge";

// ── Dummy Data ──────────────────────────────────────────────────────────────
const DUMMY_PRODUCTS = Array.from({ length: 15 }, (_, i) => ({
  id: `PROD-${String(i + 1).padStart(4, "0")}`,
  name: `Premium Product ${i + 1}`,
  category: [
    "Electronics",
    "Food & Beverage",
    "Clothing",
    "Machinery",
    "Raw Materials",
  ][i % 5],
  stock: Math.floor(Math.random() * 500) + 10,
  price: Math.floor(Math.random() * 1000) + 50,
  status: ["active", "out_of_stock"][i % 2],
}));

const PRODUCT_STATUS_BADGE: Record<string, BadgeColor> = {
  active: "emerald",
  out_of_stock: "rose",
};

export default function SellerDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const paginatedProducts = useMemo(() => {
    const start = (pageNumber - 1) * pageSize;
    return DUMMY_PRODUCTS.slice(start, start + pageSize);
  }, [pageNumber, pageSize]);

  const columns = useMemo(
    () => [
      {
        key: "id",
        label: "Product ID",
        render: (row: any) => (
          <span className="font-mono text-xs font-bold text-gray-700">
            {row.id}
          </span>
        ),
      },
      {
        key: "name",
        label: "Product Name",
        render: (row: any) => (
          <span className="text-[13px] font-semibold text-gray-800">
            {row.name}
          </span>
        ),
      },
      {
        key: "category",
        label: "Category",
        render: (row: any) => (
          <span className="text-gray-500 text-[12px]">{row.category}</span>
        ),
      },
      {
        key: "stock",
        label: "Stock",
        align: "center" as const,
        headerAlign: "center" as const,
        render: (row: any) => (
          <span className="font-bold text-gray-700">{row.stock}</span>
        ),
      },
      {
        key: "price",
        label: "Price",
        align: "right" as const,
        headerAlign: "right" as const,
        render: (row: any) => (
          <span className="font-black text-gray-800">
            SAR {row.price.toLocaleString()}
          </span>
        ),
      },
      {
        key: "status",
        label: "Status",
        align: "center" as const,
        headerAlign: "center" as const,
        render: (row: any) => (
          <Badge color={PRODUCT_STATUS_BADGE[row.status] || "default"}>
            {row.status.replace(/_/g, " ")}
          </Badge>
        ),
      },
      {
        key: "actions",
        label: "Actions",
        align: "center" as const,
        headerAlign: "center" as const,
        minWidth: 50,
        sx: { width: 50 },
        render: () => (
          <div className="flex justify-center w-full">
            <RowActions onView={() => console.log("View product")} />
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="flex flex-col gap-4 pb-10 w-full p-2">
      {/* Back action outside the card */}
      <div className="flex items-center justify-between w-full">
        <button
          onClick={() => navigate("/suppliers")}
          className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 font-bold text-[13px] rounded-lg border border-gray-200 transition-all shadow-xs cursor-pointer hover:shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          Back to Suppliers
        </button>
      </div>

      {/* Profile Details Card */}
      <div className="bg-white rounded-[16px] border border-gray-100 shadow-xs p-4 sm:p-5 flex flex-col gap-4 w-full relative hover:shadow-sm transition-all duration-300">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10">
              <Building className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-lg font-black text-gray-900">
              Company Profile
            </h3>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-primary font-bold text-xs rounded-lg border border-gray-200 transition-all cursor-pointer shadow-xs">
            <Edit2 className="w-3.5 h-3.5" />
            Edit Profile
          </button>
        </div>

        {/* Section 1: About */}
        <div className="flex flex-col gap-3">
          <h4 className="text-[11px] font-bold text-primary uppercase tracking-widest bg-primary/5 px-2.5 py-1 rounded-md w-fit">
            About
          </h4>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 px-1">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 shadow-inner border-4 border-white flex items-center justify-center shrink-0 ring-1 ring-gray-100">
              <span className="text-xl font-black text-white">AN</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-black text-gray-900">
                  Al-Noor Trading Co.
                </h2>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md shadow-xs border border-emerald-100/50">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    Active
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-[13px] font-semibold">
                <span className="text-gray-600 hover:text-gray-900 transition-colors cursor-default">
                  +966 50 987 6543
                </span>
                <span className="hidden sm:block text-gray-300">•</span>
                <a
                  href="mailto:contact@alnoor.com"
                  className="text-primary hover:text-primary-hover hover:underline cursor-pointer transition-colors"
                >
                  contact@alnoor.com
                </a>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mt-0.5 group w-fit">
                <MapPin className="w-3.5 h-3.5 text-gray-400 group-hover:text-primary transition-colors" />
                <span className="group-hover:text-gray-700 transition-colors">
                  Riyadh, Saudi Arabia
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-gray-100/80" />

        {/* Section 2: Internal */}
        <div className="flex flex-col gap-4">
          <h4 className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/5 px-3 py-1 rounded-md w-fit">
            Basic Details
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-y-6 gap-x-6 px-1">
            <div className="flex flex-col gap-1 group">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-gray-500 transition-colors">
                Supplier ID
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-bold text-gray-900 font-mono bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                  {id || "SUP-0001"}
                </span>
                <button className="p-1 hover:bg-primary/10 rounded-md transition-colors text-gray-400 hover:text-primary">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1 group">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-gray-500 transition-colors">
                Category
              </span>
              <span className="text-[13px] font-bold text-gray-900">
                Electronics
              </span>
            </div>
            <div className="flex flex-col gap-1 group">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-gray-500 transition-colors">
                Joined Date
              </span>
              <span className="text-[13px] font-bold text-gray-900">
                12/03/2023
              </span>
            </div>
            <div className="flex flex-col gap-1 group">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-gray-500 transition-colors">
                Total Products
              </span>
              <span className="text-[13px] font-black text-gray-900">
                {DUMMY_PRODUCTS.length}
              </span>
            </div>
            <div className="flex flex-col gap-1 group">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-gray-500 transition-colors">
                Total Revenue
              </span>
              <span className="text-[13px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md w-fit border border-emerald-100/50">
                SAR 145,000
              </span>
            </div>
            <div className="flex flex-col gap-1 group">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-gray-500 transition-colors">
                Rating
              </span>
              <span className="text-[13px] font-black text-amber-500">
                4.8 / 5.0
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-[20px] border border-gray-100 shadow-xs flex flex-col mt-2 hover:shadow-md transition-all duration-300 overflow-hidden">
        <div className="flex items-center justify-between p-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-5 bg-primary rounded-full" />
            <h3 className="text-[15px] font-black text-gray-900">
              Products List
            </h3>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-600 hover:text-primary text-[11px] font-bold rounded-lg border border-gray-200 transition-all cursor-pointer shadow-xs hover:shadow-sm">
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
        <div className="overflow-hidden">
          <BasicTable
            isScrollable={true}
            isLoading={false}
            isSuccess={true}
            isError={false}
            data={paginatedProducts}
            columns={columns}
            totalCount={DUMMY_PRODUCTS.length}
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
    </div>
  );
}
