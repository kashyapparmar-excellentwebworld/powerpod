import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
// import { useSelector } from "react-redux";
import {
  Users,
  Briefcase,
  ShieldCheck,
  Wallet,
  BadgeAlert,
  ArrowRight,
  Package,
  ShoppingCart,
  Percent,
  // Sparkles,
} from "lucide-react";
import { AnimatedNumber } from "../../components/common/AnimatedNumber";
// import CoverImage from "../../assets/images/cover_image.jpg";

import { StatsSkeleton } from "../../components/common/Loader/StatsSkeleton";
import { useState, useMemo, useEffect } from "react";
import { ChartCard } from "../../components/common/Charts/ChartCard";
import { CustomAreaChart } from "../../components/common/Charts/CustomAreaChart";
import { CustomPieChart } from "../../components/common/Charts/CustomPieChart";
import { CustomMixedChart } from "../../components/common/Charts/CustomMixedChart";
import { BasicTable } from "../../components/common/Table/BasicTable";
import { useMainLayoutHeaderActions } from "../../context/MainLayoutHeaderActionsContext";
import { DateRangePickerField } from "../../components/common/DateFilter";
import { subDays, format } from "date-fns";
import { useThemeCustomizer } from "../../context/ThemeCustomizerContext";

// ─── Status badge helper ──────────────────────────────────────────────────────
const statusConfig: Record<string, { bg: string; text: string; dot: string }> =
{
  completed: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  pending: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  ongoing: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  cancelled: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
};
const getStatusCfg = (s: string) =>
  statusConfig[s?.toLowerCase()] ?? {
    bg: "bg-slate-50",
    text: "text-slate-600",
    dot: "bg-slate-400",
  };

// ─── Reusable section card wrapper ───────────────────────────────────────────
const SectionCard = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-surface-light text-black rounded-2xl border border-gray-light shadow-xs hover:shadow-md transition-all duration-300 ${className}`}
  >
    {children}
  </div>
);

// ─── Section header ───────────────────────────────────────────────────────────
const SectionHeader = ({
  icon,
  iconBg,
  title,
  action,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  action?: React.ReactNode;
}) => (
  <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-50">
    <div className="flex items-center gap-2.5">
      <div className={`p-1.5 rounded-xl ${iconBg}`}>{icon}</div>
      <h3 className="text-sm font-bold text-slate-800">{title}</h3>
    </div>
    {action}
  </div>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { primaryColor } = useThemeCustomizer();
  const { setActions, clearActions } = useMainLayoutHeaderActions();
  // const admin = useSelector((state: any) => state.auth.admin);
  const isAr = i18n.language === "ar";

  const [dateRange, setDateRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: subDays(new Date(), 6),
    endDate: new Date(),
  });

  const dateParams = useMemo(
    () => ({
      startDate: dateRange.startDate
        ? format(dateRange.startDate, "yyyy-MM-dd")
        : undefined,
      endDate: dateRange.endDate
        ? format(dateRange.endDate, "yyyy-MM-dd")
        : undefined,
    }),
    [dateRange],
  );

  useEffect(() => {
    setActions(
      <DateRangePickerField
        value={dateRange}
        onChange={setDateRange}
        onClear={() => setDateRange({ startDate: null, endDate: null })}
      />,
    );
    return () => clearActions();
  }, [dateRange]);

  const [isLoading, setIsLoading] = useState(true);
  const [mainLoading, setMainLoading] = useState(true);

  // Simulated static data
  const stats: any = useMemo(
    () => ({
      total_buyers: { total: 1250, current: 50, previous: 40, trend: 25 },
      total_suppliers: { total: 320, current: 10, previous: 12, trend: -16.6 },
      active_users: { total: 850, current: 120, previous: 100, trend: 20 },
      total_orders: { total: 4500, current: 300, previous: 250, trend: 20 },
      total_revenue: {
        total: 150000,
        current: 15000,
        previous: 12000,
        trend: 25,
      },
      commission_earned: {
        total: 15000,
        current: 1500,
        previous: 1200,
        trend: 25,
      },
      pending_kyc_approvals: { total: 15, current: 5, previous: 2, trend: 150 },
      pending_offer_approvals: {
        total: 8,
        current: 2,
        previous: 5,
        trend: -60,
      },
    }),
    [],
  );

  const analytics: any = useMemo(
    () => ({
      revenue_analysis: {
        current: [
          { name: "Mon", value: 1000 },
          { name: "Tue", value: 2000 },
          { name: "Wed", value: 1500 },
          { name: "Thu", value: 3000 },
          { name: "Fri", value: 2500 },
          { name: "Sat", value: 4000 },
          { name: "Sun", value: 3500 },
        ],
        previous: [
          { name: "Mon", value: 800 },
          { name: "Tue", value: 1500 },
          { name: "Wed", value: 1200 },
          { name: "Thu", value: 2500 },
          { name: "Fri", value: 2000 },
          { name: "Sat", value: 3500 },
          { name: "Sun", value: 3000 },
        ],
      },
      order_vs_revenue: [
        { name: "Week 1", orders: 120, revenue: 15000 },
        { name: "Week 2", orders: 150, revenue: 18000 },
        { name: "Week 3", orders: 100, revenue: 12000 },
        { name: "Week 4", orders: 200, revenue: 25000 },
      ],
      order_status_distribution: [
        { name: "completed", value: 65 },
        { name: "pending", value: 20 },
        { name: "ongoing", value: 10 },
        { name: "cancelled", value: 5 },
      ],
      top_selling_products: [
        {
          name: "iPhone 15 Pro",
          name_ar: "ايفون ١٥ برو",
          sales_count: 450,
          revenue: 450000,
        },
        {
          name: "MacBook Air M2",
          name_ar: "ماك بوك اير",
          sales_count: 320,
          revenue: 1600000,
        },
        {
          name: "AirPods Pro 2",
          name_ar: "ايربودز برو ٢",
          sales_count: 850,
          revenue: 85000,
        },
      ],
      top_performing_suppliers: [
        {
          name: "Apple Store",
          name_ar: "متجر ابل",
          orders_count: 1250,
          revenue: 2500000,
        },
        {
          name: "Samsung Hub",
          name_ar: "محور سامسونج",
          orders_count: 850,
          revenue: 1200000,
        },
        {
          name: "Sony Center",
          name_ar: "مركز سوني",
          orders_count: 450,
          revenue: 800000,
        },
      ],
      recent_orders: [
        {
          id: "ORD-1234",
          buyer: "Ahmed Ali",
          supplier: "Apple Store",
          date: "2024-03-20",
          amount: 4500,
          status: "completed",
        },
        {
          id: "ORD-1235",
          buyer: "Sara Omar",
          supplier: "Samsung Hub",
          date: "2024-03-21",
          amount: 1200,
          status: "pending",
        },
        {
          id: "ORD-1236",
          buyer: "Omar Zaid",
          supplier: "Sony Center",
          date: "2024-03-21",
          amount: 3500,
          status: "ongoing",
        },
      ],
    }),
    [],
  );

  useEffect(() => {
    setIsLoading(true);
    setMainLoading(true);
    // Simulate network delay
    const timer = setTimeout(() => {
      setIsLoading(false);
      setMainLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [dateParams]);

  const revenueData = analytics?.revenue_analysis || {
    current: [],
    previous: [],
  };
  const orderVsRevenue = analytics?.order_vs_revenue || [];

  const orderStatusData = useMemo(() => {
    const raw = analytics?.order_status_distribution || [];
    return raw.map((d: any) => ({
      name: t(`common.${d.name.toLowerCase()}`),
      value: d.value,
    }));
  }, [analytics, t]);

  const topProducts = useMemo(
    () => analytics?.top_selling_products || [],
    [analytics],
  );
  const topSuppliers = useMemo(
    () => analytics?.top_performing_suppliers || [],
    [analytics],
  );
  const recentOrders = useMemo(
    () => analytics?.recent_orders || [],
    [analytics],
  );

  const suppliersWithIds = useMemo(
    () =>
      topSuppliers.map((s: any, i: number) => ({ ...s, id: i, index: i + 1 })),
    [topSuppliers],
  );

  const productsWithIds = useMemo(
    () =>
      topProducts.map((p: any, i: number) => ({ ...p, id: i, index: i + 1 })),
    [topProducts],
  );

  const ordersWithIds = useMemo(
    () => recentOrders.map((o: any, i: number) => ({ ...o, id: o.id || i })),
    [recentOrders],
  );

  interface DashboardMetricItem {
    title: string;
    total: number;
    current: number;
    previous: number;
    trend: number;
    icon: React.ComponentType<any>;
    gradient: string;
    iconColor: string;
    route: string;
    isCurrency?: boolean;
  }

  const getMetric = (metric: any) => ({
    total: Number(metric?.total ?? metric?.value ?? metric?.count ?? 0),
    current: Number(metric?.current_period ?? metric?.current ?? 0),
    previous: Number(metric?.previous_period ?? metric?.previous ?? 0),
    trend: Number(metric?.trend_percent ?? metric?.trend ?? 0),
  });

  const statsConfig: DashboardMetricItem[] = [
    {
      title: t("dashboard.total_buyers"),
      ...getMetric(stats?.total_buyers),
      icon: Users,
      gradient: "from-blue-500 to-blue-600",
      iconColor: "text-blue-600",
      route: "/buyers",
    },
    {
      title: t("dashboard.total_suppliers"),
      ...getMetric(stats?.total_suppliers),
      icon: Briefcase,
      gradient: "from-violet-500 to-purple-600",
      iconColor: "text-violet-600",
      route: "/suppliers",
    },
    {
      title: t("dashboard.active_users"),
      ...getMetric(stats?.active_users),
      icon: Users,
      gradient: "from-indigo-500 to-indigo-600",
      iconColor: "text-indigo-600",
      route: "/buyers",
    },
    {
      title: t("dashboard.total_orders"),
      ...getMetric(stats?.total_orders),
      icon: ShoppingCart,
      gradient: "from-emerald-500 to-teal-600",
      iconColor: "text-emerald-600",
      route: "/orders",
    },
    {
      title: t("dashboard.total_revenue"),
      ...getMetric(stats?.total_revenue),
      isCurrency: true,
      icon: Wallet,
      gradient: "from-emerald-500 to-green-600",
      iconColor: "text-emerald-600",
      route: "/orders",
    },
    {
      title: t("dashboard.commission_earned"),
      ...getMetric(stats?.commission_earned),
      isCurrency: true,
      icon: Percent,
      gradient: "from-purple-500 to-violet-600",
      iconColor: "text-purple-600",
      route: "/commissions",
    },
    {
      title: t("dashboard.pending_kyc_approvals"),
      ...getMetric(stats?.pending_kyc_approvals),
      icon: ShieldCheck,
      gradient: "from-amber-400 to-amber-500",
      iconColor: "text-amber-600",
      route: "/kyc",
    },
    {
      title: t("dashboard.pending_offer_approvals"),
      ...getMetric(stats?.pending_offer_approvals),
      icon: BadgeAlert,
      gradient: "from-pink-400 to-pink-500",
      iconColor: "text-pink-600",
      route: "/offers",
    },
  ];

  const supplierColumns = useMemo(
    () => [
      {
        key: "index",
        label: "#",
        minWidth: 60,
        render: (row: any) => (
          <span className="w-5 h-5 text-[10px] font-black rounded-lg flex items-center justify-center" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
            {row.index}
          </span>
        ),
      },
      {
        key: "name",
        label: t("common.name"),
        minWidth: 150,
        render: (row: any) => (
          <span className="font-semibold text-slate-700">
            {isAr ? row.name_ar : row.name}
          </span>
        ),
      },
      {
        key: "orders_count",
        label: t("sidebar.orders"),
        align: "center" as const,
        headerAlign: "center" as const,
        minWidth: 100,
        render: (row: any) => (
          <span className="text-slate-500 font-medium">{row.orders_count}</span>
        ),
      },
      {
        key: "revenue",
        label: t("dashboard.total_revenue"),
        align: "right" as const,
        headerAlign: "right" as const,
        minWidth: 120,
        render: (row: any) => (
          <span className="font-bold" style={{ color: primaryColor }}>
            SAR {row.revenue?.toLocaleString() ?? 0}
          </span>
        ),
      },
    ],
    [isAr, t],
  );

  const productColumns = useMemo(
    () => [
      {
        key: "index",
        label: "#",
        minWidth: 60,
        render: (row: any) => (
          <span className="w-5 h-5 bg-blue-50 text-blue-600 text-[10px] font-black rounded-lg flex items-center justify-center">
            {row.index}
          </span>
        ),
      },
      {
        key: "name",
        label: t("common.name"),
        minWidth: 150,
        render: (row: any) => (
          <span className="font-semibold text-slate-700">
            {isAr ? row.name_ar : row.name}
          </span>
        ),
      },
      {
        key: "sales_count",
        label: "Items Sold",
        align: "center" as const,
        headerAlign: "center" as const,
        minWidth: 120,
        render: (row: any) => (
          <span className="text-slate-500 font-medium">
            {(row.sales_count ?? 0).toLocaleString()}
          </span>
        ),
      },
      {
        key: "revenue",
        label: "Revenue Generated",
        align: "right" as const,
        headerAlign: "right" as const,
        minWidth: 140,
        render: (row: any) => (
          <span className="font-bold text-blue-600">
            SAR {(row.revenue ?? 0).toLocaleString()}
          </span>
        ),
      },
    ],
    [isAr, t],
  );

  const orderColumns = useMemo(
    () => [
      {
        key: "id",
        label: t("cargo_invoices.id"),
        minWidth: 80,
        render: (row: any) => (
          <span className="font-bold text-slate-800">{row.id}</span>
        ),
      },
      {
        key: "buyer",
        label: "Buyer",
        minWidth: 140,
        render: (row: any) => (
          <span className="font-semibold text-slate-700">{row.buyer}</span>
        ),
      },
      {
        key: "supplier",
        label: "Supplier",
        minWidth: 140,
        render: (row: any) => (
          <span className="text-slate-500">{row.supplier}</span>
        ),
      },
      {
        key: "date",
        label: t("common.date"),
        align: "center" as const,
        headerAlign: "center" as const,
        minWidth: 100,
        render: (row: any) => (
          <span className="text-slate-400 text-xs">{row.date}</span>
        ),
      },
      {
        key: "amount",
        label: t("common.total_amount"),
        align: "right" as const,
        headerAlign: "right" as const,
        minWidth: 120,
        render: (row: any) => (
          <span className="font-bold text-emerald-600">
            SAR {(row.amount ?? 0).toLocaleString()}
          </span>
        ),
      },
      {
        key: "status",
        label: t("common.status"),
        align: "center" as const,
        headerAlign: "center" as const,
        minWidth: 120,
        render: (row: any) => {
          const sc = getStatusCfg(row.status);
          return (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${sc.bg} ${sc.text}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
              {row.status}
            </span>
          );
        },
      },
    ],
    [t],
  );

  if (isLoading) {
    return (
      <div className="py-2">
        <StatsSkeleton count={8} />
      </div>
    );
  }

  const formatValue = (item: DashboardMetricItem, val: number = 0) => {
    const v = val ?? 0;
    if (item.isCurrency) {
      return (
        <span className="flex items-baseline gap-1">
          <span className="text-xs font-semibold text-slate-400">SAR</span>
          <AnimatedNumber value={v} />
        </span>
      );
    }
    return <AnimatedNumber value={v} />;
  };

  return (
    <div className="space-y-5">
      {/* ── Welcome banner ────────────────────────────────────────────────── */}
      {/* <div className="relative rounded-2xl overflow-hidden px-6 py-6 flex items-center justify-between bg-primary/80 shadow-sm min-h-[140px]">
        <img
          src={CoverImage}
          alt="Welcome Cover"
          className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-40 pointer-events-none"
        />

        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 left-24 w-32 h-32 rounded-full bg-purple-200/10 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-purple-300" />
            <span className="text-purple-300 text-xs font-semibold tracking-wide uppercase">
              Overview
            </span>
          </div>
          <h2 className="text-white text-xl font-bold leading-tight">
            Welcome back, {admin?.fullName || "Wasla Admin"}!
          </h2>
          <p className="text-purple-200 text-xs mt-1">
            Here's what's happening with your store today.
          </p>
        </div>

        <div className="relative z-10 hidden sm:flex items-center gap-3">
          {(stats?.pending_kyc_approvals?.value ?? 0) > 0 && (
            <button
              onClick={() => navigate("/kyc")}
              className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl text-white text-xs font-semibold transition-all cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              <span>{stats?.pending_kyc_approvals?.value} KYC Pending</span>
              <ArrowRight className={`w-3 h-3 ${isAr ? "rotate-180" : ""}`} />
            </button>
          )}
          {(stats?.pending_offer_approvals?.value ?? 0) > 0 && (
            <button
              onClick={() => navigate("/offers")}
              className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl text-white text-xs font-semibold transition-all cursor-pointer"
            >
              <BadgeAlert className="w-3.5 h-3.5 text-pink-300" />
              <span>
                {stats?.pending_offer_approvals?.value} Offers Pending
              </span>
              <ArrowRight className={`w-3 h-3 ${isAr ? "rotate-180" : ""}`} />
            </button>
          )}
        </div>
      </div> */}

      {/* Mobile alert pills */}
      {((stats?.pending_kyc_approvals?.value ?? 0) > 0 ||
        (stats?.pending_offer_approvals?.value ?? 0) > 0) && (
          <div className="flex sm:hidden flex-wrap gap-3">
            {(stats?.pending_kyc_approvals?.value ?? 0) > 0 && (
              <button
                onClick={() => navigate("/kyc")}
                className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-semibold transition-all cursor-pointer hover:shadow-sm"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                {stats?.pending_kyc_approvals?.value}{" "}
                {t("dashboard.pending_kyc_approvals")}
              </button>
            )}
            {(stats?.pending_offer_approvals?.value ?? 0) > 0 && (
              <button
                onClick={() => navigate("/offers")}
                className="flex items-center gap-2 px-3 py-2 bg-purple-50 border border-purple-200 rounded-xl text-purple-800 text-xs font-semibold transition-all cursor-pointer hover:shadow-sm"
              >
                <BadgeAlert className="w-3.5 h-3.5" />
                {stats?.pending_offer_approvals?.value}{" "}
                {t("dashboard.pending_offer_approvals")}
              </button>
            )}
          </div>
        )}

      {/* ── Stats Grid ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsConfig.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              onClick={() => item.route && navigate(item.route)}
              className={`group relative bg-surface-light rounded-xl border border-gray-light p-4 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 flex items-center gap-4 overflow-hidden ${item.route ? "cursor-pointer" : ""
                }`}
            >
              <div
                className={`w-12 h-12 shrink-0 rounded-xl bg-linear-to-br ${item.gradient} flex items-center justify-center shadow-sm`}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>

              <div className="flex flex-col flex-1 min-w-0">
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate mb-1">
                  {item.title}
                </p>
                <h2 className="text-xl font-black text-slate-900! dark:text-slate-100! tracking-tight leading-none truncate">
                  {formatValue(item, item.total)}
                </h2>
              </div>

              {/* Ghost icon */}
              <div
                className={`absolute right-0 top-1/2 -translate-y-1/2 opacity-[0.04] group-hover:opacity-[0.08] transition-all duration-500 pointer-events-none ${item.iconColor}`}
              >
                <Icon className="w-14 h-14" />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Charts Row ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard
          title={t("dashboard.revenue_analysis")}
          isLoading={mainLoading}
          isEmpty={revenueData.current.length === 0}
          height={280}
        >
          <CustomAreaChart
            data={revenueData.current}
            previousData={revenueData.previous}
            seriesName={t("dashboard.current_period")}
            previousSeriesName={t("dashboard.previous_period")}
            color={primaryColor}
            secondaryColor={`${primaryColor}80`}
          />
        </ChartCard>

        <ChartCard
          title={t("dashboard.booking_vs_revenue")}
          isLoading={mainLoading}
          isEmpty={orderVsRevenue.length === 0}
          height={280}
        >
          <CustomMixedChart
            data={orderVsRevenue.map((d: any) => ({
              name: d.name,
              value: d.orders,
            }))}
            secondaryData={orderVsRevenue.map((d: any) => ({
              name: d.name,
              value: d.revenue,
            }))}
            seriesName={t("sidebar.orders")}
            secondarySeriesName={t("dashboard.total_revenue")}
            color={primaryColor}
            secondaryColor="#10b981"
          />
        </ChartCard>
      </div>

      {/* ── Pie + Top Suppliers ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1">
          <ChartCard
            title={t("dashboard.booking_status_distribution")}
            isLoading={mainLoading}
            isEmpty={orderStatusData.length === 0}
            height={320}
          >
            <CustomPieChart
              data={orderStatusData}
              colors={[primaryColor, "#10b981", "#f59e0b", "#f43f5e", "#0088ff"]}
            />
          </ChartCard>
        </div>

        <div className="lg:col-span-2">
          <SectionCard className="h-full flex flex-col">
            <SectionHeader
              icon={<Briefcase className="w-4 h-4" style={{ color: primaryColor }} />}
              iconBg="p-1.5 rounded-xl"
              title={t("dashboard.top_performing_suppliers")}
            />
            <div className="flex-1 w-full relative h-[320px]">
              <BasicTable
                isLoading={mainLoading}
                isSuccess={!mainLoading}
                isError={false}
                data={suppliersWithIds}
                columns={supplierColumns}
                hidePagination
              />
            </div>
          </SectionCard>
        </div>
      </div>

      {/* ── Top Products ─────────────────────────────────────────────────── */}
      <SectionCard>
        <SectionHeader
          icon={<Package className="w-4 h-4 text-blue-600" />}
          iconBg="bg-blue-50"
          title={t("dashboard.top_selling_products")}
        />
        <div className="w-full relative h-[320px]">
          <BasicTable
            isLoading={mainLoading}
            isSuccess={!mainLoading}
            isError={false}
            data={productsWithIds}
            columns={productColumns}
            hidePagination
          />
        </div>
      </SectionCard>

      {/* ── Recent Orders ─────────────────────────────────────────────────── */}
      <SectionCard>
        <SectionHeader
          icon={<ShoppingCart className="w-4 h-4 text-emerald-600" />}
          iconBg="bg-emerald-50"
          title={t("dashboard.recent_orders_feed")}
          action={
            <button
              onClick={() => navigate("/orders")}
              style={{ color: primaryColor }}
              className="flex items-center gap-1 text-xs font-semibold hover:opacity-80 transition-colors cursor-pointer"
            >
              {t("common.view_all")}
              <ArrowRight
                className={`w-3.5 h-3.5 ${isAr ? "rotate-180" : ""}`}
              />
            </button>
          }
        />
        <div className="w-full relative h-[320px]">
          <BasicTable
            isLoading={mainLoading}
            isSuccess={!mainLoading}
            isError={false}
            data={ordersWithIds}
            columns={orderColumns}
            hidePagination
          />
        </div>
      </SectionCard>
    </div>
  );
};

export default Dashboard;
