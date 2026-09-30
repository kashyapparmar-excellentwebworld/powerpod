export type Crumb = { label: string; to?: string; translationKey?: string };

export const breadcrumbMap: Record<string, Crumb[]> = {
  //Dashboard
  "/dashboard": [{ label: "Dashboard", translationKey: "sidebar.dashboard" }],

  // ── Wasla Routes ──────────────────────────────────────────────

  // Buyers
  "/buyers": [{ label: "Buyer Management", translationKey: "sidebar.buyers" }],
  "/buyers/:id": [
    { label: "Buyers", to: "/buyers", translationKey: "sidebar.buyers" },
    { label: "View Buyer", translationKey: "breadcrumbs.view_buyer" },
  ],

  // Suppliers
  "/suppliers": [{ label: "Supplier Management", translationKey: "sidebar.suppliers" }],
  "/suppliers/:id": [
    { label: "Suppliers", to: "/suppliers", translationKey: "sidebar.suppliers" },
    { label: "View Supplier", translationKey: "breadcrumbs.view_supplier" },
  ],

  // KYC
  "/kyc": [{ label: "KYC Management", translationKey: "sidebar.kyc_approvals" }],
  "/kyc/:id": [
    { label: "KYC", to: "/kyc", translationKey: "sidebar.kyc_approvals" },
    { label: "View KYC", translationKey: "breadcrumbs.view_kyc" },
  ],

  // Products
  "/products": [{ label: "Products", translationKey: "sidebar.products" }],
  "/products/:id": [
    { label: "Products", to: "/products", translationKey: "sidebar.products" },
    { label: "View Product", translationKey: "breadcrumbs.view_product" },
  ],

  // Categories
  "/categories": [{ label: "Categories", translationKey: "sidebar.categories" }],
  "/categories/add": [
    { label: "Categories", to: "/categories", translationKey: "sidebar.categories" },
    { label: "Add Category", translationKey: "breadcrumbs.add_category" },
  ],
  "/categories/:id/edit": [
    { label: "Categories", to: "/categories", translationKey: "sidebar.categories" },
    { label: "Edit Category", translationKey: "breadcrumbs.edit_category" },
  ],

  // Orders
  "/orders": [{ label: "Order Management", translationKey: "sidebar.orders" }],
  "/orders/:id": [
    { label: "Orders", to: "/orders", translationKey: "sidebar.orders" },
    { label: "View Order", translationKey: "breadcrumbs.view_order" },
  ],

  // Commissions
  "/commissions": [{ label: "Commission Management", translationKey: "sidebar.commissions" }],
  "/commissions/:id": [
    { label: "Commissions", to: "/commissions", translationKey: "sidebar.commissions" },
    { label: "View Commission", translationKey: "breadcrumbs.view_commission" },
  ],

  // Offers
  "/offers": [{ label: "Offers Management", translationKey: "sidebar.offers" }],
  "/offers/:id": [
    { label: "Offers", to: "/offers", translationKey: "sidebar.offers" },
    { label: "View Offer", translationKey: "breadcrumbs.view_offer" },
  ],

  // Promo Codes
  "/promo-codes": [{ label: "Promo Codes", translationKey: "sidebar.promo_codes" }],
  "/promo-codes/:id": [
    { label: "Promo Codes", to: "/promo-codes", translationKey: "sidebar.promo_codes" },
    { label: "View Promo Code", translationKey: "breadcrumbs.view_promo" },
  ],

  // RFQs
  "/rfqs": [{ label: "RFQ Management", translationKey: "sidebar.rfqs" }],
  "/rfqs/:id": [
    { label: "RFQs", to: "/rfqs", translationKey: "sidebar.rfqs" },
    { label: "View RFQ", translationKey: "breadcrumbs.view_rfq" },
  ],

  // Payments & Earnings
  "/payments-earnings": [{ label: "Payments & Earnings", translationKey: "sidebar.payments_earnings" }],

  // Cancellations & Refunds
  "/cancellations-refunds": [{ label: "Cancellations & Refunds", translationKey: "sidebar.cancellations_refunds" }],
  "/cancellations-refunds/:id": [
    { label: "Cancellations & Refunds", to: "/cancellations-refunds", translationKey: "sidebar.cancellations_refunds" },
    { label: "View Request", translationKey: "breadcrumbs.view_request" },
  ],

  // Banners
  "/banners": [{ label: "Banner Management", translationKey: "sidebar.banners" }],
  "/banners/:id": [
    { label: "Banners", to: "/banners", translationKey: "sidebar.banners" },
    { label: "View Banner", translationKey: "breadcrumbs.view_banner" },
  ],

  // Reviews & Ratings
  "/reviews-ratings": [{ label: "Reviews & Ratings", translationKey: "sidebar.reviews_ratings" }],
  "/reviews-ratings/:id": [
    { label: "Reviews & Ratings", to: "/reviews-ratings", translationKey: "sidebar.reviews_ratings" },
    { label: "View Review", translationKey: "breadcrumbs.view_review" },
  ],

  // Reports
  "/reports": [{ label: "Reports" }],
  "/manage/reports": [{ label: "Reports" }],

  // App Versions
  "/version-management": [{ label: "App Version" }],

  // CMS
  "/cms": [{ label: "CMS Pages" }],
  "/manage/cms": [{ label: "CMS Pages" }],

  // AI Support Chat
  "/manage/chat": [{ label: "AI Support Chat" }],

  // Support Tickets
  "/tickets": [{ label: "Support Tickets" }],
  "/manage/tickets": [{ label: "Support Tickets" }],

  // AI Guidance RAG
  "/manage/guidance": [{ label: "AI Guidance RAG" }],

  // Audit Logs
  "/settings/audit-logs": [{ label: "Audit Logs" }],
  "/manage/audit-logs": [{ label: "Audit Logs" }],

  // Role & Permissions
  "/settings/modules": [{ label: "Role & Permissions" }],
  "/settings/permissions": [{ label: "Role & Permissions" }],
  "/settings/roles": [{ label: "Role & Permissions" }],
  "/manage/rbac": [{ label: "Role & Permissions" }],

  // Settings sub-pages
  "/app-settings": [{ label: "App Settings" }],
  "/system-settings": [{ label: "System Settings" }],

  // Auth Profile
  "/settings/profile": [{ label: "My Profile" }],
  "/settings/change-password": [{ label: "Change Password" }],
};
