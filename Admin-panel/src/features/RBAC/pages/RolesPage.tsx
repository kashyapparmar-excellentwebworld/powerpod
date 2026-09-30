import React, { useEffect, useState } from "react";
import {
  ShieldCheck,
  Plus,
  Users,
  KeyRound,
  Edit2,
  Trash2,
  Loader2,
  Lock,
  Check,
} from "lucide-react";
import { Modal } from "../../../components/common/modal/Modal";
import { DeleteConfirmModal } from "../../../components/common/modal/DeleteConfirmModal";
import {
  rbacApi,
  type RoleItem,
  type GroupedPermission,
} from "../../../services/rbacApi";
import toast from "react-hot-toast";
import { useThemeCustomizer } from "../../../context/ThemeCustomizerContext";

export const RolesPage: React.FC = () => {
  const { primaryColor } = useThemeCustomizer();
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Grouped permissions available in system
  const [groupedPermissions, setGroupedPermissions] = useState<GroupedPermission[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleItem | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [assignedPermissionIds, setAssignedPermissionIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  // Delete Confirm State
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<RoleItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchRolesAndPermissions = async () => {
    setLoading(true);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        rbacApi.getRoles(),
        rbacApi.getPermissions(),
      ]);
      setRoles(rolesRes.data || []);
      setGroupedPermissions(permsRes.data?.grouped || []);
    } catch (err: any) {
      toast.error("Failed to load system roles and permissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRolesAndPermissions();
  }, []);

  const handleOpenCreate = () => {
    setSelectedRole(null);
    setFormData({ name: "", description: "" });
    setAssignedPermissionIds(new Set());
    setModalOpen(true);
  };

  const handleOpenEdit = async (role: RoleItem) => {
    setSelectedRole(role);
    setFormData({ name: role.label || role.name, description: role.description || "" });
    setModalOpen(true);
    setLoadingPermissions(true);

    try {
      const res = await rbacApi.getRoleById(role.id);
      const roleData: RoleItem = res.data;
      setAssignedPermissionIds(new Set(roleData.permissionIds || []));
    } catch {
      toast.error("Failed to load role permissions");
    } finally {
      setLoadingPermissions(false);
    }
  };

  // Permission Selection Toggle Helpers
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

  const allSystemPermIds = groupedPermissions.flatMap((g) => g.permissions.map((p) => p.id));
  const isGlobalAllSelected =
    allSystemPermIds.length > 0 && allSystemPermIds.every((id) => assignedPermissionIds.has(id));

  const toggleGlobalAllPermissions = () => {
    if (isGlobalAllSelected) {
      setAssignedPermissionIds(new Set());
    } else {
      setAssignedPermissionIds(new Set(allSystemPermIds));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Role name is required");
      return;
    }

    setSaving(true);
    try {
      let targetRoleId = selectedRole?.id;

      if (selectedRole) {
        await rbacApi.updateRole(selectedRole.id, formData);
      } else {
        const res = await rbacApi.createRole(formData);
        targetRoleId = res.data?.id;
      }

      if (targetRoleId) {
        await rbacApi.assignPermissions(targetRoleId, Array.from(assignedPermissionIds));
      }

      toast.success(
        selectedRole
          ? "Role and permissions updated successfully"
          : "Role and permissions created successfully"
      );
      setModalOpen(false);
      fetchRolesAndPermissions();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save role and permissions");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!roleToDelete) return;
    setDeleting(true);
    try {
      await rbacApi.deleteRole(roleToDelete.id);
      toast.success("Role deleted successfully");
      setDeleteOpen(false);
      setRoleToDelete(null);
      fetchRolesAndPermissions();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete role");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-surface-light p-6 rounded-2xl border border-gray-light shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="p-3 rounded-xl"
            style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
          >
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-black tracking-tight">
              User Roles & Permissions
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Create system roles and assign granular module permissions within a unified workflow.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          style={{ backgroundColor: primaryColor }}
          className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl text-xs font-bold shadow-md hover:opacity-90 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Role</span>
        </button>
      </div>

      {/* Roles Grid */}
      {loading ? (
        <div className="p-12 flex flex-col items-center justify-center space-y-3 bg-surface-light rounded-2xl border border-gray-light">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-xs text-slate-400">Loading system roles & permissions...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => (
            <div
              key={role.id}
              className="bg-surface-light p-6 rounded-2xl border border-gray-light shadow-xs space-y-5 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    <h3 className="text-base font-black text-black">
                      {role.label || role.name}
                    </h3>
                  </div>

                  {role.isSystem ? (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      <Lock className="w-3 h-3" />
                      <span>System</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      Custom
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[32px]">
                  {role.description || "No description provided."}
                </p>

                {/* Role Stats Pills */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-slate-50 dark:bg-[#1E2235] rounded-xl border border-gray-light flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Assigned Users
                      </span>
                      <strong className="text-xs font-mono font-black text-black">
                        {role.userCount} Users
                      </strong>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-[#1E2235] rounded-xl border border-gray-light flex items-center gap-2.5">
                    <KeyRound className="w-4 h-4 text-purple-400" />
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Permissions
                      </span>
                      <strong className="text-xs font-mono font-black text-purple-500">
                        {role.permissionCount} Keys
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-light flex items-center justify-between gap-2">
                <button
                  onClick={() => handleOpenEdit(role)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Configure Role & Permissions</span>
                </button>

                {!role.isSystem && (
                  <button
                    onClick={() => {
                      setRoleToDelete(role);
                      setDeleteOpen(true);
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-500 bg-slate-100 dark:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Role with Permissions Matrix Modal */}
      {modalOpen && (
        <Modal
          open={modalOpen}
          setOpen={setModalOpen}
          title={selectedRole ? `Configure Role & Permissions: ${selectedRole.label || selectedRole.name}` : "Create New Role & Assign Permissions"}
          maxWidth="lg"
        >
          <form onSubmit={handleSave} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto sidebar-scroll">
            {/* Basic Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Role Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Manager"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#1E2235] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-black focus:outline-none focus:border-primary font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Describe access responsibilities..."
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#1E2235] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-black focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Permission Matrix Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-gray-light pb-3">
                <div>
                  <h3 className="text-sm font-black text-black flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-primary" />
                    <span>Assign Module Permissions</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Select the specific module access rights for this role.
                  </p>
                </div>

                {/* Global Select All */}
                <label className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-[#1E2235] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-black cursor-pointer select-none hover:border-primary transition-colors">
                  <input
                    type="checkbox"
                    checked={isGlobalAllSelected}
                    onChange={toggleGlobalAllPermissions}
                    className="w-4 h-4 rounded text-primary accent-primary cursor-pointer"
                  />
                  <span>Select All (Full Access)</span>
                </label>
              </div>

              {loadingPermissions ? (
                <div className="p-8 flex items-center justify-center gap-2 text-xs text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span>Loading permissions...</span>
                </div>
              ) : (
                <div className="border border-slate-200 dark:border-slate-700/60 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-700/60">
                  {groupedPermissions.map((group) => {
                    const groupPermIds = group.permissions.map((p) => p.id);
                    const isModuleAllSelected =
                      groupPermIds.length > 0 &&
                      groupPermIds.every((id) => assignedPermissionIds.has(id));
                    const isModuleSomeSelected =
                      groupPermIds.some((id) => assignedPermissionIds.has(id)) &&
                      !isModuleAllSelected;

                    return (
                      <div
                        key={group.moduleId}
                        className="p-4 bg-surface-light flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        {/* Module Info & Select Module Checkbox */}
                        <div className="min-w-[180px] flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isModuleAllSelected}
                            ref={(el) => {
                              if (el) el.indeterminate = isModuleSomeSelected;
                            }}
                            onChange={() => toggleModulePermissions(group)}
                            className="w-4 h-4 rounded text-primary accent-primary cursor-pointer"
                          />
                          <div>
                            <span className="text-xs font-extrabold text-black block">
                              {group.moduleName}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {group.moduleSlug}
                            </span>
                          </div>
                        </div>

                        {/* Action Checkboxes */}
                        <div className="flex-1 flex flex-wrap items-center gap-2.5 md:justify-end">
                          {group.permissions.map((perm) => {
                            const isChecked = assignedPermissionIds.has(perm.id);
                            return (
                              <label
                                key={perm.id}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer select-none ${
                                  isChecked
                                    ? "bg-primary/10 text-primary border-primary/40"
                                    : "bg-slate-50 dark:bg-[#1E2235] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700/60 hover:border-slate-300"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => togglePermission(perm.id)}
                                  className="w-3.5 h-3.5 rounded text-primary accent-primary cursor-pointer"
                                />
                                <span className="capitalize">{perm.action}</span>
                                {isChecked && <Check className="w-3 h-3 text-primary ms-0.5" />}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-light">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                style={{ backgroundColor: primaryColor }}
                className="px-5 py-2 text-white rounded-xl text-xs font-bold hover:opacity-90 disabled:opacity-50 cursor-pointer shadow-md"
              >
                {saving ? "Saving..." : "Save Role & Permissions"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteOpen && (
        <DeleteConfirmModal
          open={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          onConfirm={handleConfirmDelete}
          isLoading={deleting}
          title="Delete Role"
          message={`Are you sure you want to delete role '${roleToDelete?.label || roleToDelete?.name}'?`}
        />
      )}
    </div>
  );
};

export default RolesPage;
