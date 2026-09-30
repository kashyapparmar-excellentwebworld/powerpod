import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Loader2,
  ArrowLeft,
  Save,
  ShieldCheck,
} from "lucide-react";
import { rbacApi, type RoleItem, type GroupedPermission, type PermissionItem } from "../../../services/rbacApi";
import toast from "react-hot-toast";

export const AssignPermissionsPage: React.FC = () => {
  const { roleId } = useParams<{ roleId: string }>();
  const navigate = useNavigate();

  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>(roleId || "");

  const [groupedPermissions, setGroupedPermissions] = useState<GroupedPermission[]>([]);
  const [assignedPermissionIds, setAssignedPermissionIds] = useState<Set<string>>(new Set());

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        rbacApi.getRoles(),
        rbacApi.getPermissions(),
      ]);

      const fetchedRoles: RoleItem[] = rolesRes.data || [];
      setRoles(fetchedRoles);
      setGroupedPermissions(permsRes.data?.grouped || []);

      const isUuid = (id?: string) => !!id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      const targetId = isUuid(roleId) ? roleId : (isUuid(selectedRoleId) ? selectedRoleId : fetchedRoles[0]?.id);

      if (targetId) {
        setSelectedRoleId(targetId);
        const roleDetailRes = await rbacApi.getRoleById(targetId);
        const roleData: RoleItem = roleDetailRes.data;
        setAssignedPermissionIds(new Set(roleData.permissionIds || []));
      }
    } catch (err: any) {
      toast.error("Failed to load role permissions matrix");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [roleId]);

  const handleRoleChange = async (newRoleId: string) => {
    setSelectedRoleId(newRoleId);
    setLoading(true);
    try {
      const res = await rbacApi.getRoleById(newRoleId);
      setAssignedPermissionIds(new Set(res.data?.permissionIds || []));
    } catch (err: any) {
      toast.error("Failed to fetch role details");
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (permId: string) => {
    setAssignedPermissionIds((prev) => {
      const next = new Set(prev);
      if (next.has(permId)) {
        next.delete(permId);
      } else {
        next.add(permId);
      }
      return next;
    });
  };

  const toggleModulePermissions = (group: GroupedPermission) => {
    const groupPermIds = group.permissions.map((p) => p.id);
    const allSelected = groupPermIds.every((id) => assignedPermissionIds.has(id));

    setAssignedPermissionIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        groupPermIds.forEach((id) => next.delete(id));
      } else {
        groupPermIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  // Global Select All / Deselect All
  const allSystemPermIds = groupedPermissions.flatMap((g) => g.permissions.map((p) => p.id));
  const isGlobalAllSelected = allSystemPermIds.length > 0 && allSystemPermIds.every((id) => assignedPermissionIds.has(id));

  const toggleGlobalAllPermissions = () => {
    if (isGlobalAllSelected) {
      setAssignedPermissionIds(new Set());
    } else {
      setAssignedPermissionIds(new Set(allSystemPermIds));
    }
  };

  const handleSave = async () => {
    if (!selectedRoleId) return;
    setSaving(true);
    try {
      await rbacApi.assignPermissions(selectedRoleId, Array.from(assignedPermissionIds));
      toast.success("Role permissions updated successfully!");
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save permissions");
    } finally {
      setSaving(false);
    }
  };

  const selectedRoleObj = roles.find((r) => r.id === selectedRoleId);

  return (
    <div className="space-y-6 pb-24">
      {/* Top Bar Header */}
      <div className="bg-surface-light p-6 rounded-2xl border border-gray-light shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/settings/roles")}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-gray-6 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-black text-black tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <span>Role Permissions Matrix</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Set role access rules and granular module permissions.
            </p>
          </div>
        </div>

        {/* Role Dropdown Selector */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Target Role:
          </span>
          <select
            value={selectedRoleId}
            onChange={(e) => handleRoleChange(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 dark:bg-[#1E2235] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-black focus:outline-none focus:border-primary cursor-pointer shadow-2xs"
          >
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label || r.name} {r.isSystem ? "(System)" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Vuexy Style Role Permissions Table Matrix Card */}
      {loading ? (
        <div className="p-12 flex flex-col items-center justify-center space-y-3 bg-surface-light rounded-2xl border border-gray-light">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-xs text-slate-400">Loading role permissions matrix...</p>
        </div>
      ) : (
        <div className="bg-surface-light rounded-2xl border border-gray-light shadow-xs overflow-hidden">
          {/* Master Table Header Row */}
          <div className="p-5 bg-slate-50/70 dark:bg-[#1E2235] border-b border-gray-light flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-extrabold text-black">
                Administrator Access
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Configuring permissions for <strong className="text-primary font-bold">{selectedRoleObj?.label || selectedRoleObj?.name || "Selected Role"}</strong>
              </p>
            </div>

            {/* Global Select All */}
            <label className="flex items-center gap-2.5 px-4 py-2 bg-surface-light border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-black cursor-pointer shadow-2xs select-none hover:border-primary/50 transition-colors">
              <input
                type="checkbox"
                checked={isGlobalAllSelected}
                onChange={toggleGlobalAllPermissions}
                className="w-4 h-4 rounded text-primary accent-primary cursor-pointer"
              />
              <span>Select All (Full Access)</span>
            </label>
          </div>

          {/* Module Permission Rows Table */}
          <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
            {groupedPermissions.map((group) => {
              const groupPermIds = group.permissions.map((p) => p.id);
              const isModuleAllSelected = groupPermIds.length > 0 && groupPermIds.every((id) => assignedPermissionIds.has(id));

              return (
                <div
                  key={group.moduleName}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  {/* Module Name */}
                  <div className="md:w-1/3 space-y-0.5">
                    <h4 className="text-sm font-bold text-black">
                      {group.moduleName}
                    </h4>
                    <span className="text-[11px] font-mono text-slate-400">
                      module: {group.moduleSlug}
                    </span>
                  </div>

                  {/* Actions Checkboxes Matrix Row */}
                  <div className="flex-1 flex flex-wrap items-center gap-x-6 gap-y-3">
                    {group.permissions.map((perm: PermissionItem) => {
                      const isChecked = assignedPermissionIds.has(perm.id);

                      return (
                        <label
                          key={perm.id}
                          className="flex items-center gap-2 cursor-pointer select-none group/item"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePermission(perm.id)}
                            className="w-4 h-4 rounded text-primary accent-primary cursor-pointer"
                          />
                          <span
                            className={`text-xs font-semibold capitalize transition-colors ${
                              isChecked
                                ? "text-primary font-bold"
                                : "text-gray-6 group-hover/item:text-slate-900 dark:group-hover/item:text-white"
                            }`}
                          >
                            {perm.action}
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  {/* Module Row Select All Toggle */}
                  <div className="md:border-s border-gray-light md:ps-4 shrink-0">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                      <input
                        type="checkbox"
                        checked={isModuleAllSelected}
                        onChange={() => toggleModulePermissions(group)}
                        className="w-3.5 h-3.5 rounded text-primary accent-primary cursor-pointer"
                      />
                      <span>Select Row</span>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Save Action Bar */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3.5 bg-primary text-white rounded-2xl text-sm font-black shadow-xl hover:bg-primary/90 disabled:opacity-50 transition-all cursor-pointer"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          <span>Save Role Permissions ({assignedPermissionIds.size} Active)</span>
        </button>
      </div>
    </div>
  );
};

export default AssignPermissionsPage;
