import { useAppSelector } from "./redux";

export type PermissionAction = "view" | "create" | "edit" | "delete";

export const usePermissions = () => {
  const { access } = useAppSelector((state) => state.auth);

  /**
   * Checks if the user has a specific permission for a module
   * @param moduleSlug The slug of the module (e.g. 'drivers', 'customers', 'admin_manage')
   * @param action The action to check ('view', 'create', 'edit', 'delete')
   */
  const hasPermission = (moduleSlug: string, action: PermissionAction): boolean => {
    if (!access) return false;
    if (access.allAccess) return true;

    const permission = access.modulePermissions?.find(
      (p:any) => p.moduleSlug === moduleSlug
    );

    if (!permission) return false;

    switch (action) {
      case "view":
        return permission.canView;
      case "create":
        return permission.canCreate;
      case "edit":
        return permission.canEdit;
      case "delete":
        return permission.canDelete;
      default:
        return false;
    }
  };

  /**
   * Alternative way to get all permissions for a module at once
   */
  const getModulePermissions = (moduleSlug: string) => {
    if (!access) {
      return { canView: false, canCreate: false, canEdit: false, canDelete: false };
    }
    
    if (access.allAccess) {
      return { canView: true, canCreate: true, canEdit: true, canDelete: true };
    }

    const permission = access.modulePermissions?.find(
      (p) => p.moduleSlug === moduleSlug
    );

    return {
      canView: permission?.canView ?? false,
      canCreate: permission?.canCreate ?? false,
      canEdit: permission?.canEdit ?? false,
      canDelete: permission?.canDelete ?? false,
    };
  };

  const getFirstAvailableModule = (): string | null => {
    if (!access) return null;
    if (access.allAccess) return "/dashboard";
    
    // Check dashboard first
    const hasDashboard = access.modulePermissions?.some(p => p.moduleSlug === "dashboard" && p.canView);
    if (hasDashboard) return "/dashboard";

    // Find any other module that is viewable
    const firstPermitted = access.modulePermissions?.find(p => p.canView);
    if (firstPermitted) {
      // Map slug to path (this is a bit of a manual map or we can use a more robust way)
      const slugToPath: Record<string, string> = {
        customers: "/users",
        balad_applications: "/balad-customers",
        drivers: "/drivers",
        staff: "/staff",
        admin_manage: "/admins",
        supervisors: "/supervisors",
        roles_permissions: "/roles",
        services: "/services",
        vehicles: "/vehicles",
        routes: "/routes",
        bookings: "/bookings",
        reports: "/reports",
        transactions: "/transactions",
        location: "/locations",
        businesses: "/business",
        cargo_invoices: "/cargo-invoices",
        modules: "/modules"
      };
      return slugToPath[firstPermitted.moduleSlug] || "/dashboard";
    }

    return null;
  };

  const hasAnyPermission = access?.allAccess || (access?.modulePermissions?.some(p => p.canView) ?? false);

  return { hasPermission, getModulePermissions, getFirstAvailableModule, allAccess: access?.allAccess, hasAnyPermission };
};
