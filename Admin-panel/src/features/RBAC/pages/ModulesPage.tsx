import React, { useEffect, useState } from "react";
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Search,
} from "lucide-react";
import { Modal } from "../../../components/common/modal/Modal";
import { DeleteConfirmModal } from "../../../components/common/modal/DeleteConfirmModal";
import { rbacApi, type ModuleItem } from "../../../services/rbacApi";
import toast from "react-hot-toast";

export const ModulesPage: React.FC = () => {
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<ModuleItem | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    icon: "Layers",
    route: "",
    sortOrder: 0,
  });
  const [saving, setSaving] = useState(false);

  // Delete Confirm Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState<ModuleItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchModules = async () => {
    setLoading(true);
    try {
      const res = await rbacApi.getModules();
      setModules(res.data || []);
    } catch (err: any) {
      toast.error("Failed to load modules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const handleOpenCreate = () => {
    setSelectedModule(null);
    setFormData({
      name: "",
      slug: "",
      icon: "Layers",
      route: "",
      sortOrder: modules.length + 1,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (mod: ModuleItem) => {
    setSelectedModule(mod);
    setFormData({
      name: mod.name,
      slug: mod.slug,
      icon: mod.icon || "Layers",
      route: mod.route || "",
      sortOrder: mod.sortOrder,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      toast.error("Name and slug are required");
      return;
    }

    setSaving(true);
    try {
      if (selectedModule) {
        await rbacApi.updateModule(selectedModule.id, formData);
        toast.success("Module updated successfully");
      } else {
        await rbacApi.createModule(formData);
        toast.success("Module created successfully");
      }
      setModalOpen(false);
      fetchModules();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save module");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDelete = (mod: ModuleItem) => {
    setModuleToDelete(mod);
    setDeleteModalOpen(true);
  };

  const ConfirmDelete = async () => {
    if (!moduleToDelete) return;
    setDeleting(true);
    try {
      await rbacApi.deleteModule(moduleToDelete.id);
      toast.success("Module deleted successfully");
      setDeleteModalOpen(false);
      setModuleToDelete(null);
      fetchModules();
    } catch (err: any) {
      toast.error("Failed to delete module");
    } finally {
      setDeleting(false);
    }
  };

  const filteredModules = modules.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-surface-light p-6 rounded-2xl border border-gray-light shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-black tracking-tight">
              System Modules
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage navigation modules, dynamic menu routes, and system icons.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold shadow-md hover:bg-primary/90 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Module</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-surface-light p-4 rounded-2xl border border-gray-light shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search modules by name or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#1E2235] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-black focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Modules Table */}
      <div className="bg-surface-light rounded-2xl border border-gray-light shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-xs text-slate-400">Loading system modules...</p>
          </div>
        ) : filteredModules.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No modules found. Click "+ Add Module" to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-200">
              <thead className="bg-slate-50 dark:bg-[#1E2235] text-[11px] font-black uppercase text-slate-400 tracking-wider border-b border-gray-light">
                <tr>
                  <th className="px-6 py-4">Sort</th>
                  <th className="px-6 py-4">Module Name</th>
                  <th className="px-6 py-4">Slug</th>
                  <th className="px-6 py-4">Route</th>
                  <th className="px-6 py-4">Icon</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {filteredModules.map((mod) => (
                  <tr key={mod.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-400">
                      #{mod.sortOrder}
                    </td>
                    <td className="px-6 py-4 font-bold text-black flex items-center gap-2">
                      <Layers className="w-4 h-4 text-primary" />
                      <span>{mod.name}</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-500">
                      {mod.slug}
                    </td>
                    <td className="px-6 py-4 font-mono text-emerald-600 dark:text-emerald-400">
                      {mod.route || "-"}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-400">
                      {mod.icon || "Layers"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        {mod.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(mod)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(mod)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Module Modal */}
      {modalOpen && (
        <Modal
          open={modalOpen}
          setOpen={setModalOpen}
          title={selectedModule ? "Edit Module" : "Add System Module"}
          maxWidth="sm"
        >
          <form onSubmit={handleSave} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Module Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Products"
                value={formData.name}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    name: val,
                    slug: selectedModule ? prev.slug : val.toLowerCase().replace(/[^a-z0-9]/g, "-"),
                  }));
                }}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#1E2235] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-black focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Slug (Unique Identifier)
              </label>
              <input
                type="text"
                required
                placeholder="e.g. products"
                value={formData.slug}
                onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#1E2235] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-black focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Frontend Route Path
              </label>
              <input
                type="text"
                placeholder="e.g. /products"
                value={formData.route}
                onChange={(e) => setFormData((prev) => ({ ...prev, route: e.target.value }))}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#1E2235] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-black focus:outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Lucide Icon Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. ShoppingCart"
                  value={formData.icon}
                  onChange={(e) => setFormData((prev) => ({ ...prev, icon: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#1E2235] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-black focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData((prev) => ({ ...prev, sortOrder: Number(e.target.value) }))}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#1E2235] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-black focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
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
                className="px-5 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
              >
                {saving ? "Saving..." : "Save Module"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <DeleteConfirmModal
          open={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={ConfirmDelete}
          isLoading={deleting}
          title="Delete Module"
          message={`Are you sure you want to delete module '${moduleToDelete?.name}'?`}
        />
      )}
    </div>
  );
};

export default ModulesPage;
