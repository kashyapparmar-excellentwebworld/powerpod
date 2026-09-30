import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import { BasicTable } from "../../../components/common/Table/BasicTable";
import { RowActions } from "../../../components/common/Table/RowActions";
import { SearchInput } from "../../../components/common/SearchInput";
import { Button } from "../../../components/common/Button";
import { useNavigate } from "react-router-dom";
import { useMainLayoutHeaderActions } from "../../../context/MainLayoutHeaderActionsContext";
import { DeleteConfirmModal } from "../../../components/common/modal/DeleteConfirmModal";
import useToast from "../../../hooks/useToast";
import { useTranslation } from "react-i18next";
import useDebounce from "../../../hooks/useDebounce";

import {
  getBannersAPI,
  deleteBannerAPI,
  updateBannerStatusAPI,
} from "../api/bannerApi";

const BannersPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { setActions, clearActions } = useMainLayoutHeaderActions();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const [banners, setBanners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useToast();

  const isRtl = i18n.language === "ar";

  const fetchBanners = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        page: pageNumber,
        limit: pageSize,
        search: debouncedSearch,
      };
      const res = await getBannersAPI(params);
      const dataArr = res?.data?.banners || res?.data || [];
      setBanners(Array.isArray(dataArr) ? dataArr : []);
      setTotalCount(
        res?.data?.pagination?.total ||
          (Array.isArray(dataArr) ? dataArr.length : 0),
      );
    } catch (err) {
      console.error(err);
      showToast("Failed to fetch banners", "error");
    } finally {
      setIsLoading(false);
    }
  }, [pageNumber, pageSize, debouncedSearch, showToast]);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  useEffect(() => {
    setActions(
      <Button
        onClick={() => navigate("/banners/add")}
        variant="contained"
        color="primary"
        className="gap-2"
      >
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">
          {t("banners.add_new", "Add New Banner")}
        </span>
      </Button>,
    );
    return () => clearActions();
  }, [setActions, clearActions, navigate, t, isRtl]);

  const handleDeleteConfirm = async () => {
    if (!selectedId) return;

    try {
      setIsDeleting(true);
      await deleteBannerAPI(selectedId);
      showToast(
        t("banners.delete_success", "Banner deleted successfully"),
        "success",
      );
      setDeleteModalOpen(false);
      fetchBanners();
    } catch (error: any) {
      showToast(
        error?.response?.data?.message || "Failed to delete banner",
        "error",
      );
    } finally {
      setIsDeleting(false);
      setSelectedId(null);
    }
  };

  const handleStatusChange = async (id: string, newStatus: boolean) => {
    try {
      // Optimistically update UI
      setBanners((prev) =>
        prev.map((banner: any) =>
          banner.id === id ? { ...banner, isActive: newStatus } : banner,
        ),
      );

      await updateBannerStatusAPI(id, { isActive: newStatus });
      showToast(
        t("banners.status_success", "Banner status updated successfully"),
        "success",
      );
    } catch (error: any) {
      // Revert UI on failure
      setBanners((prev) =>
        prev.map((banner: any) =>
          banner.id === id ? { ...banner, isActive: !newStatus } : banner,
        ),
      );
      showToast(
        error?.response?.data?.message || "Failed to update status",
        "error",
      );
    }
  };

  const columns = useMemo(
    () => [
      {
        key: "image",
        label: t("banners.fields.image", "Banner"),
        align: "left" as const,
        headerAlign: "left" as const,
        render: (row: any) => (
          <div className="flex items-center gap-3">
            <div className="w-16 h-10 rounded-lg overflow-hidden shrink-0 border border-slate-100 shadow-xs bg-slate-50 flex items-center justify-center">
              {row.imageUrl ? (
                <img
                  src={row.imageUrl}
                  alt={row.title}
                  className="w-full h-full object-cover"
                  onError={(e: any) => {
                    e.target.src =
                      "https://placehold.co/100x50/f1f5f9/94a3b8?text=No+Image";
                  }}
                />
              ) : (
                <span className="text-xs text-slate-400">N/A</span>
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 line-clamp-1">
                {row.title}
              </p>
              {row.titleAr && (
                <p className="text-xs text-slate-500 font-medium line-clamp-1">
                  {row.titleAr}
                </p>
              )}
            </div>
          </div>
        ),
      },
      {
        key: "linkType",
        label: t("banners.fields.linkType", "Link Type"),
        align: "center" as const,
        headerAlign: "center" as const,
        render: (row: any) => (
          <span className="text-sm font-semibold text-slate-600 capitalize">
            {row.linkUrlType || "None"}
          </span>
        ),
      },
      {
        key: "displayOrder",
        label: t("banners.fields.displayOrder", "Order"),
        align: "center" as const,
        headerAlign: "center" as const,
        render: (row: any) => (
          <span className="font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md text-xs">
            {row.displayOrder || 0}
          </span>
        ),
      },
      {
        key: "actions",
        label: t("banners.fields.actions", "Actions"),
        align: "center" as const,
        headerAlign: "center" as const,
        minWidth: 50,
        sx: { width: 50 },
        render: (_row: any) => (
          <div className="flex justify-center">
            <RowActions
              isActive={_row.isActive}
              onToggleStatus={(checked) => handleStatusChange(_row.id, checked)}
              onEdit={() => navigate(`/banners/${_row.id}/edit`)}
              onDelete={() => {
                setSelectedId(_row.id);
                setDeleteModalOpen(true);
              }}
            />
          </div>
        ),
      },
    ],
    [t, navigate],
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Data Container (Filters + Table) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.06)] overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <SearchInput
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPageNumber(1);
            }}
            onClear={() => {
              setSearch("");
              setPageNumber(1);
            }}
            placeholder={t("banners.search_placeholder", "Search by title...")}
            className="w-full sm:w-80"
          />
        </div>

        {/* Table */}
        <BasicTable
          isLoading={isLoading}
          isSuccess={true}
          isError={false}
          data={banners}
          columns={columns}
          totalCount={totalCount}
          pageNumber={pageNumber}
          setPageNumber={setPageNumber}
          pageSize={pageSize}
          setPageSize={(s) => {
            setPageSize(s);
            setPageNumber(1);
          }}
        />
      </div>

      <DeleteConfirmModal
        open={deleteModalOpen}
        setOpen={setDeleteModalOpen}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        title={t("banners.delete_title", "Delete Banner?")}
        description={t(
          "banners.delete_desc",
          "Are you sure you want to permanently delete this banner?",
        )}
      />
    </div>
  );
};

export default BannersPage;
