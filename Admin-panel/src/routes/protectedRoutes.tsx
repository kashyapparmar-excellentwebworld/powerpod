import { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import { ProtectedRoute } from "./guards/ProtectedRoute";
import { MainLayout } from "../layouts";
import Dashboard from "../features/Dashboard";

const BuyersPage = lazy(() => import("../features/Buyer/pages"));
const BuyerDetailsPage = lazy(() => import("../features/Buyer/pages/BuyerDetails"));
const SuppliersPage = lazy(() => import("../features/Seller/pages"));
const SupplierDetailsPage = lazy(() => import("../features/Seller/pages/SellerDetails"));
const OrdersPage = lazy(() => import("../features/Orders/pages"));
const OrderDetailsPage = lazy(() => import("../features/Orders/pages/OrderDetails"));
const CategoriesPage = lazy(() => import("../features/Category/pages"));
const AddCategoryPage = lazy(() => import("../features/Category/pages/AddCategory"));
const EditCategoryPage = lazy(() => import("../features/Category/pages/EditCategory"));
const ProfilePage = lazy(() => import("../features/AuthProfile/pages/Profile"));
const ChangePasswordPage = lazy(() => import("../features/AuthProfile/pages/ChangePassword"));
const BannersPage = lazy(() => import("../features/Banner/pages"));
const AddBannerPage = lazy(() => import("../features/Banner/pages/AddBanner"));
const EditBannerPage = lazy(() => import("../features/Banner/pages/EditBanner"));
const CmsListPage = lazy(() => import("../features/CMS/pages").then((m) => ({ default: m.CmsListPage })));
const EditCmsPage = lazy(() => import("../features/CMS/pages/EditCmsPage").then((m) => ({ default: m.EditCmsPage })));
const VersionManagementPage = lazy(() => import("../features/VersionManagement/pages").then((m) => ({ default: m.VersionManagementPage })));

// RBAC Pages
const ModulesPage = lazy(() => import("../features/RBAC/pages/ModulesPage"));
const PermissionsPage = lazy(() => import("../features/RBAC/pages/PermissionsPage"));
const RolesPage = lazy(() => import("../features/RBAC/pages/RolesPage"));
const AssignPermissionsPage = lazy(() => import("../features/RBAC/pages/AssignPermissionsPage"));
const AuditLogsPage = lazy(() => import("../features/AuditLogs/pages/AuditLogsPage"));
const AiSettingsPage = lazy(() => import("../features/AiSettings/pages/AiSettingsPage").then((m) => ({ default: m.default || m.AiSettingsPage })));
const GuidanceManagementPage = lazy(() => import("../features/Guidance/pages/GuidanceManagementPage").then((m) => ({ default: m.default || m.GuidanceManagementPage })));
const TicketsDashboardPage = lazy(() => import("../features/Tickets/pages/TicketsDashboardPage").then((m) => ({ default: m.default || m.TicketsDashboardPage })));
const AiChatPage = lazy(() => import("../features/AiChat/pages/AiChatPage").then((m) => ({ default: m.default || m.AiChatPage })));

const PageLoader = () => (
  <div className="flex-1 flex items-center justify-center min-h-60">
    <div className="w-8 h-8 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
  </div>
);

export const protectedRoutes = {
  // element: <ProtectedRoute />,
  children: [
    {
      path: "/",
      element: <MainLayout />,
      children: [
        {
          path: "",
          element: <Navigate to="/dashboard" replace />,
        },
        {
          path: "dashboard",
          element: <Dashboard />,
        },
        {
          path: "buyers",
          element: (
            <Suspense fallback={<PageLoader />}>
              <BuyersPage />
            </Suspense>
          ),
        },
        {
          path: "buyers/:id",
          element: (
            <Suspense fallback={<PageLoader />}>
              <BuyerDetailsPage />
            </Suspense>
          ),
        },
        {
          path: "suppliers",
          element: (
            <Suspense fallback={<PageLoader />}>
              <SuppliersPage />
            </Suspense>
          ),
        },
        {
          path: "suppliers/:id",
          element: (
            <Suspense fallback={<PageLoader />}>
              <SupplierDetailsPage />
            </Suspense>
          ),
        },
        {
          path: "orders",
          element: (
            <Suspense fallback={<PageLoader />}>
              <OrdersPage />
            </Suspense>
          ),
        },
        {
          path: "orders/:id",
          element: (
            <Suspense fallback={<PageLoader />}>
              <OrderDetailsPage />
            </Suspense>
          ),
        },
        {
          path: "categories",
          element: (
            <Suspense fallback={<PageLoader />}>
              <CategoriesPage />
            </Suspense>
          ),
        },
        {
          path: "categories/add",
          element: (
            <Suspense fallback={<PageLoader />}>
              <AddCategoryPage />
            </Suspense>
          ),
        },
        {
          path: "categories/:id/edit",
          element: (
            <Suspense fallback={<PageLoader />}>
              <EditCategoryPage />
            </Suspense>
          ),
        },
        {
          path: "banners",
          element: (
            <Suspense fallback={<PageLoader />}>
              <BannersPage />
            </Suspense>
          ),
        },
        {
          path: "banners/add",
          element: (
            <Suspense fallback={<PageLoader />}>
              <AddBannerPage />
            </Suspense>
          ),
        },
        {
          path: "banners/:id/edit",
          element: (
            <Suspense fallback={<PageLoader />}>
              <EditBannerPage />
            </Suspense>
          ),
        },
        {
          path: "cms",
          element: (
            <Suspense fallback={<PageLoader />}>
              <CmsListPage />
            </Suspense>
          ),
        },
        {
          path: "cms/create",
          element: (
            <Suspense fallback={<PageLoader />}>
              <EditCmsPage />
            </Suspense>
          ),
        },
        {
          path: "cms/edit/:id",
          element: (
            <Suspense fallback={<PageLoader />}>
              <EditCmsPage />
            </Suspense>
          ),
        },
        {
          path: "version-management",
          element: (
            <Suspense fallback={<PageLoader />}>
              <VersionManagementPage />
            </Suspense>
          ),
        },
        {
          path: "settings/modules",
          element: (
            <Suspense fallback={<PageLoader />}>
              <ModulesPage />
            </Suspense>
          ),
        },
        {
          path: "settings/permissions",
          element: (
            <Suspense fallback={<PageLoader />}>
              <PermissionsPage />
            </Suspense>
          ),
        },
        {
          path: "settings/roles",
          element: (
            <Suspense fallback={<PageLoader />}>
              <RolesPage />
            </Suspense>
          ),
        },
        {
          path: "settings/roles/assign",
          element: (
            <Suspense fallback={<PageLoader />}>
              <AssignPermissionsPage />
            </Suspense>
          ),
        },
        {
          path: "settings/roles/:roleId/permissions",
          element: (
            <Suspense fallback={<PageLoader />}>
              <AssignPermissionsPage />
            </Suspense>
          ),
        },
        {
          path: "settings/audit-logs",
          element: (
            <Suspense fallback={<PageLoader />}>
              <AuditLogsPage />
            </Suspense>
          ),
        },
        {
          path: "settings/ai-config",
          element: (
            <Suspense fallback={<PageLoader />}>
              <AiSettingsPage />
            </Suspense>
          ),
        },
        {
          path: "manage/chat",
          element: (
            <Suspense fallback={<PageLoader />}>
              <AiChatPage />
            </Suspense>
          ),
        },
        {
          path: "manage/guidance",
          element: (
            <Suspense fallback={<PageLoader />}>
              <GuidanceManagementPage />
            </Suspense>
          ),
        },
        {
          path: "manage/tickets",
          element: (
            <Suspense fallback={<PageLoader />}>
              <TicketsDashboardPage />
            </Suspense>
          ),
        },
        {
          path: "settings/profile",
          element: (
            <Suspense fallback={<PageLoader />}>
              <ProfilePage />
            </Suspense>
          ),
        },
        {
          path: "settings/change-password",
          element: (
            <Suspense fallback={<PageLoader />}>
              <ChangePasswordPage />
            </Suspense>
          ),
        },
        {
          path: "*",
          element: <Navigate to="/dashboard" replace />,
        },
      ],
    },
  ],
};
