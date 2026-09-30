import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Plus,
  Search,
  Globe,
  Edit2,
  Eye,
  Copy,
  Trash2,
  CheckCircle2,
  Filter,
} from "lucide-react";
import { BasicTable } from "../../../components/common/Table/BasicTable";
import { Button } from "../../../components/common/Button";
import { DeleteConfirmModal } from "../../../components/common/modal/DeleteConfirmModal";
import { PreviewModal } from "../components/PreviewModal";
import { cmsApi, type CmsPage } from "../../../services/cmsApi";
import toast from "react-hot-toast";

export const CmsListPage = () => {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<CmsPage[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  // Filters & Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [languageFilter, setLanguageFilter] = useState("");

  // Modals state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [previewPage, setPreviewPage] = useState<CmsPage | null>(null);

  const fetchPages = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await cmsApi.getPages({
        page,
        limit: pageSize,
        search,
        status: statusFilter || undefined,
        language: languageFilter || undefined,
      });

      setData(res.data || []);
      setTotalCount(res.pagination?.total || 0);
    } catch (err: any) {
      toast.error("Failed to load CMS pages");
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search, statusFilter, languageFilter]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      toast.loading("Deleting CMS page...", { id: "delete-cms" });
      await cmsApi.deletePage(deleteId);
      toast.success("CMS page deleted successfully", { id: "delete-cms" });
      setDeleteId(null);
      fetchPages();
    } catch (err: any) {
      toast.error("Failed to delete page", { id: "delete-cms" });
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      toast.loading("Duplicating page...", { id: "dup-cms" });
      await cmsApi.duplicatePage(id);
      toast.success("Page duplicated successfully", { id: "dup-cms" });
      fetchPages();
    } catch (err: any) {
      toast.error("Failed to duplicate page", { id: "dup-cms" });
    }
  };

  const handleTogglePublish = async (page: CmsPage) => {
    const newStatus = page.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      toast.loading(`Updating status to ${newStatus}...`, { id: "pub-cms" });
      await cmsApi.publishPage(page.id, newStatus);
      toast.success(`Page is now ${newStatus}`, { id: "pub-cms" });
      fetchPages();
    } catch (err: any) {
      toast.error("Failed to update page status", { id: "pub-cms" });
    }
  };

  const columns = useMemo(
    () => [
      {
        key: "slug",
        label: "Slug & Title",
        minWidth: 220,
        render: (row: CmsPage) => {
          const mainTr = row.translations?.[0];
          return (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-black truncate text-sm">
                {mainTr?.title || "Untitled Page"}
              </span>
              <span className="text-xs font-mono text-primary truncate mt-0.5">
                /{row.slug}
              </span>
            </div>
          );
        },
      },
      {
        key: "status",
        label: "Status",
        minWidth: 120,
        render: (row: CmsPage) => {
          const isPub = row.status === "PUBLISHED";
          const isDraft = row.status === "DRAFT";
          return (
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                isPub
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : isDraft
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "bg-slate-500/10 text-slate-500 dark:text-slate-400"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isPub ? "bg-emerald-500" : isDraft ? "bg-amber-500" : "bg-slate-400"
                }`}
              />
              {row.status}
            </span>
          );
        },
      },
      {
        key: "languages",
        label: "Languages",
        minWidth: 180,
        render: (row: CmsPage) => (
          <div className="flex items-center gap-1.5 flex-wrap">
            {row.translations?.map((tr) => (
              <span
                key={tr.languageCode}
                className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black uppercase rounded-md border border-primary/20"
              >
                {tr.languageCode}
              </span>
            ))}
          </div>
        ),
      },
      {
        key: "updatedAt",
        label: "Last Updated",
        minWidth: 150,
        render: (row: CmsPage) => (
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {new Date(row.updatedAt).toLocaleDateString()}
          </span>
        ),
      },
      {
        key: "actions",
        label: "Actions",
        minWidth: 160,
        render: (row: CmsPage) => (
          <div className="flex items-center justify-center gap-1">
            <button
              onClick={() => navigate(`/cms/edit/${row.id}`)}
              title="Edit Page"
              className="p-1.5 rounded-lg text-slate-600 hover:text-primary hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPreviewPage(row)}
              title="Preview Page"
              className="p-1.5 rounded-lg text-slate-600 hover:text-primary hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDuplicate(row.id)}
              title="Duplicate Page"
              className="p-1.5 rounded-lg text-slate-600 hover:text-primary hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleTogglePublish(row)}
              title={row.status === "PUBLISHED" ? "Unpublish Page" : "Publish Page"}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                row.status === "PUBLISHED"
                  ? "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                  : "text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDeleteId(row.id)}
              title="Delete Page"
              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    [navigate],
  );

  const previewTranslation =
    previewPage?.translations?.find((t) => t.contentHtml && t.contentHtml.trim().length > 0) ||
    previewPage?.translations?.[0];

  return (
    <div className="space-y-5">
      {/* Top Header Card */}
      <div className="bg-surface-light p-6 rounded-2xl border border-gray-light shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-black tracking-tight">
                Multilingual CMS Pages
              </h1>
              <p className="text-xs font-medium text-slate-400 dark:text-slate-400 mt-0.5">
                Create, translate, version, and publish static or dynamic policy and web content.
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={() => navigate("/cms/create")}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl shadow-md hover:bg-primary/90 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Page</span>
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-surface-light p-4 rounded-2xl border border-gray-light shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by slug or page title..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full ps-10 pe-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs font-semibold text-black outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option value="" className="bg-surface-light text-black">All Statuses</option>
              <option value="PUBLISHED" className="bg-surface-light text-black">Published</option>
              <option value="DRAFT" className="bg-surface-light text-black">Draft</option>
              <option value="ARCHIVED" className="bg-surface-light text-black">Archived</option>
            </select>
          </div>

          {/* Language Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={languageFilter}
              onChange={(e) => {
                setLanguageFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option value="" className="bg-surface-light text-black">All Languages</option>
              <option value="en" className="bg-surface-light text-black">English (EN)</option>
              <option value="ar" className="bg-surface-light text-black">Arabic (AR)</option>
              <option value="fr" className="bg-surface-light text-black">French (FR)</option>
              <option value="es" className="bg-surface-light text-black">Spanish (ES)</option>
              <option value="de" className="bg-surface-light text-black">German (DE)</option>
            </select>
          </div>
        </div>
      </div>

      {/* BasicTable */}
      <div className="bg-surface-light rounded-2xl border border-gray-light shadow-xs overflow-hidden">
        <BasicTable
          isLoading={isLoading}
          isSuccess={!isLoading}
          isError={false}
          data={data}
          columns={columns}
          totalCount={totalCount}
          pageSize={pageSize}
          setPageSize={setPageSize}
          pageNumber={page}
          setPageNumber={setPage}
        />
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <DeleteConfirmModal
          open={Boolean(deleteId)}
          setOpen={(openVal) => !openVal && setDeleteId(null)}
          onConfirm={handleDelete}
          title="Delete CMS Page?"
          description="Are you sure you want to soft delete this CMS page? Users will no longer be able to view its contents."
        />
      )}

      {/* Preview Modal */}
      {previewPage && (
        <PreviewModal
          open={Boolean(previewPage)}
          onClose={() => setPreviewPage(null)}
          title={previewTranslation?.title || previewPage.slug}
          slug={previewPage.slug}
          language={previewTranslation?.languageCode || "en"}
          contentHtml={previewTranslation?.contentHtml || ""}
          metaTitle={previewTranslation?.metaTitle}
          metaDescription={previewTranslation?.metaDescription}
        />
      )}
    </div>
  );
};
