import React, { useEffect, useState } from "react";
import {
  Shield,
  Plus,
  Wand2,
  Trash2,
  Loader2,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { Modal } from "../../../components/common/modal/Modal";
import { DeleteConfirmModal } from "../../../components/common/modal/DeleteConfirmModal";
import { rbacApi, type ModuleItem, type GroupedPermission, type PermissionItem } from "../../../services/rbacApi";
import toast from "react-hot-toast";
import { useThemeCustomizer } from "../../../context/ThemeCustomizerContext";

const COMMON_ACTIONS = ["view", "create", "edit", "delete", "export", "publish", "refund"];

export const PermissionsPage: React.FC = () => {
  const { primaryColor } = useThemeCustomizer();
  const [groupedPermissions, setGroupedPermissions] = useState<GroupedPermission[]>([]);
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Auto Generate Modal State
  const [autoGenOpen, setAutoGenOpen] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [selectedActions, setSelectedActions] = useState<string[]>(["view", "create", "edit", "delete"]);
  const [generating, setGenerating] = useState(false);

  // Custom Permission Modal State
  const [customOpen, setCustomOpen] = useState(false);
  const [customData, setCustomData] = useState({
    moduleId: "",
    name: "",
    action: "view",
    permissionKey: "",
    description: "",
  });
  const [savingCustom, setSavingCustom] = useState(false);

  // Delete Permission State
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [permToDelete, setPermToDelete] = useState<PermissionItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [permRes, modRes] = await Promise.all([
        rbacApi.getPermissions(),
        rbacApi.getModules(),
      ]);
      setGroupedPermissions(permRes.data?.grouped || []);
      setModules(modRes.data || []);
    } catch (err: any) {
      toast.error("Failed to load permissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAutoGen = (modId?: string) => {
    setSelectedModuleId(modId || (modules[0]?.id ?? ""));
    setSelectedActions(["view", "create", "edit", "delete"]);
    setAutoGenOpen(true);
  };

  const handleToggleAction = (action: string) => {
    setSelectedActions((prev) =>
      prev.includes(action) ? prev.filter((a) => a !== action) : [...prev, action]
    );
  };

  const handleRunAutoGen = async () => {
    if (!selectedModuleId || selectedActions.length === 0) {
      toast.error("Please select a module and at least one action");
      return;
    }

    setGenerating(true);
    try {
      const res = await rbacApi.autoGeneratePermissions(selectedModuleId, selectedActions);
      toast.success(res.message || "Permissions generated successfully!");
      setAutoGenOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error("Failed to generate permissions");
    } finally {
      setGenerating(false);
    }
  };

  const handleOpenCustom = () => {
    setCustomData({
      moduleId: modules[0]?.id || "",
      name: "",
      action: "view",
      permissionKey: "",
      description: "",
    });
    setCustomOpen(true);
  };

  const handleSaveCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customData.moduleId || !customData.permissionKey || !customData.name) {
      toast.error("Module, key, and name are required");
      return;
    }

    setSavingCustom(true);
    try {
      await rbacApi.createPermission(customData);
      toast.success("Permission created successfully!");
      setCustomOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create permission");
    } finally {
      setSavingCustom(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!permToDelete) return;
    setDeleting(true);
    try {
      await rbacApi.deletePermission(permToDelete.id);
      toast.success("Permission deleted successfully");
      setDeleteOpen(false);
      setPermToDelete(null);
      fetchData();
    } catch (err: any) {
      toast.error("Failed to delete permission");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-surface-light p-6 rounded-2xl border border-gray-light shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-black tracking-tight">
              Action Permissions
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Define granular module permissions (e.g. view, create, edit, delete, publish, export).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenAutoGen()}
            style={{ backgroundColor: primaryColor }}
            className="flex items-center gap-2 px-4 py-2.5 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm hover:opacity-90"
          >
            <Wand2 className="w-4 h-4" />
            <span>Auto Generate Actions</span>
          </button>

          <button
            onClick={handleOpenCustom}
            style={{ backgroundColor: primaryColor }}
            className="flex items-center gap-2 px-4 py-2.5 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm hover:opacity-90"
          >
            <Plus className="w-4 h-4" />
            <span>Add Permission</span>
          </button>
        </div>
      </div>

      {/* Permissions Grouped by Module */}
      {loading ? (
        <div className="p-12 flex flex-col items-center justify-center space-y-3 bg-surface-light rounded-2xl border border-gray-light">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: primaryColor }} />
          <p className="text-xs text-slate-400">Loading module permissions...</p>
        </div>
      ) : groupedPermissions.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-xs bg-surface-light rounded-2xl border border-gray-light">
          No permissions defined yet. Click "Auto Generate Actions" to create initial permissions.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {groupedPermissions.map((group) => (
            <div
              key={group.moduleName}
              className="bg-surface-light p-6 rounded-2xl border border-gray-light shadow-xs space-y-4"
            >
              {/* Group Header */}
              <div className="flex items-center justify-between border-b border-gray-light pb-3">
                <div className="flex items-center gap-2.5">
                  <Layers className="w-5 h-5" style={{ color: primaryColor }} />
                  <h3 className="text-base font-extrabold text-black">
                    {group.moduleName}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {group.permissions.length} actions
                  </span>
                </div>

                <button
                  onClick={() => handleOpenAutoGen(group.moduleId)}
                  style={{ color: primaryColor }}
                  className="text-xs font-bold hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Generate</span>
                </button>
              </div>

              {/* Checkbox Action Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {group.permissions.map((perm: PermissionItem) => (
                  <div
                    key={perm.id}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#1E2235] border border-slate-200 dark:border-slate-700/70 rounded-xl transition-all group/item shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={true}
                        readOnly
                        style={{ accentColor: primaryColor }}
                        className="w-4 h-4 rounded cursor-default shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="font-mono text-xs font-bold text-black truncate block">
                          {perm.permissionKey}
                        </span>
                        <span className="text-[10px] font-black uppercase block" style={{ color: primaryColor }}>
                          {perm.action}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setPermToDelete(perm);
                        setDeleteOpen(true);
                      }}
                      title="Delete Permission"
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg opacity-0 group-hover/item:opacity-100 transition-all cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Auto Generate Modal */}
      {autoGenOpen && (
        <Modal open={autoGenOpen} setOpen={setAutoGenOpen} title="Auto Generate Permissions" maxWidth="sm">
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Target Module
              </label>
              <select
                value={selectedModuleId}
                onChange={(e) => setSelectedModuleId(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#1E2235] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-black focus:outline-none focus:border-primary"
              >
                {modules.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.slug})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
                Select Actions to Generate
              </label>
              <div className="flex flex-wrap gap-2">
                {COMMON_ACTIONS.map((act) => {
                  const selected = selectedActions.includes(act);
                  return (
                    <button
                      key={act}
                      type="button"
                      onClick={() => handleToggleAction(act)}
                      style={
                        selected
                          ? { backgroundColor: primaryColor, color: "#ffffff", borderColor: primaryColor }
                          : {}
                      }
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer border ${
                        selected
                          ? "shadow-xs"
                          : "bg-slate-50 dark:bg-[#1E2235] text-gray-6 border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      {selected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      <span>{act}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setAutoGenOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRunAutoGen}
                disabled={generating}
                style={{ backgroundColor: primaryColor }}
                className="px-5 py-2 text-white rounded-xl text-xs font-bold hover:opacity-90 disabled:opacity-50 cursor-pointer"
              >
                {generating ? "Generating..." : "Generate Actions"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Custom Permission Modal */}
      {customOpen && (
        <Modal open={customOpen} setOpen={setCustomOpen} title="Add Custom Permission" maxWidth="sm">
          <form onSubmit={handleSaveCustom} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Module
              </label>
              <select
                value={customData.moduleId}
                onChange={(e) => setCustomData((prev) => ({ ...prev, moduleId: e.target.value }))}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#1E2235] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-black focus:outline-none focus:border-primary"
              >
                {modules.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Permission Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Export Products CSV"
                value={customData.name}
                onChange={(e) => setCustomData((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#1E2235] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-black focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Permission Key
              </label>
              <input
                type="text"
                required
                placeholder="e.g. products.export"
                value={customData.permissionKey}
                onChange={(e) => setCustomData((prev) => ({ ...prev, permissionKey: e.target.value }))}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#1E2235] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-black focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Action Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. export"
                value={customData.action}
                onChange={(e) => setCustomData((prev) => ({ ...prev, action: e.target.value }))}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#1E2235] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-black focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setCustomOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingCustom}
                style={{ backgroundColor: primaryColor }}
                className="px-5 py-2 text-white rounded-xl text-xs font-bold hover:opacity-90 disabled:opacity-50 cursor-pointer"
              >
                {savingCustom ? "Saving..." : "Save Permission"}
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
          title="Delete Permission"
          message={`Are you sure you want to delete permission '${permToDelete?.permissionKey}'?`}
        />
      )}
    </div>
  );
};

export default PermissionsPage;
