import React, { useMemo, useState, useEffect } from "react";
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
  getCategoriesAPI,
  deleteCategoryAPI,
  updateCategoryStatusAPI,
} from "../api/categoryApi";
const CategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { setActions, clearActions } = useMainLayoutHeaderActions();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { showToast } = useToast();

  const isRtl = i18n.language === "ar";

  useEffect(() => {
    fetchCategories();
  }, [pageNumber, pageSize, debouncedSearch]);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const params = {
        search: debouncedSearch || undefined,
        page: pageNumber,
        limit: pageSize,
      };
      const res = await getCategoriesAPI(params);
      const dataArr = res?.data?.categories || [];
      setCategories(Array.isArray(dataArr) ? dataArr : []);
      setTotalCount(
        res?.data?.pagination?.total ||
          (Array.isArray(dataArr) ? dataArr.length : 0),
      );
    } catch (err) {
      console.error(err);
      showToast("Failed to fetch categories", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setActions(
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate("/categories/add")}
        sx={{
          borderRadius: "12px",
          textTransform: "none",
          fontWeight: 600,
          padding: "6px 16px",
          height: "38px",
          fontSize: "14px",
          boxShadow: "0 4px 14px 0 rgba(107, 47, 217, 0.3)",
        }}
      >
        <Plus className={`w-4 h-4 ${isRtl ? "ml-2" : "mr-2"}`} />
        {t("categories.add_button", "Add Category")}
      </Button>,
    );
    return () => clearActions();
  }, [setActions, clearActions, navigate, t, isRtl]);

  const handleDeleteConfirm = async () => {
    if (!selectedId) return;

    try {
      await deleteCategoryAPI(selectedId);
      showToast(
        t("categories.delete_success", "Category deleted successfully"),
        "success",
      );
      setDeleteModalOpen(false);
      fetchCategories();
    } catch (error: any) {
      showToast(
        error?.response?.data?.message || "Failed to delete category",
        "error",
      );
    } finally {
      setSelectedId(null);
    }
  };

  const handleStatusChange = async (id: string, newStatus: boolean) => {
    try {
      // Optimistically update UI
      setCategories((prev) =>
        prev.map((cat: any) =>
          cat.id === id ? { ...cat, isActive: newStatus } : cat,
        ),
      );

      await updateCategoryStatusAPI(id, { isActive: newStatus });
      showToast(
        t("categories.status_success", "Category status updated successfully"),
        "success",
      );
    } catch (error: any) {
      // Revert UI on failure
      setCategories((prev) =>
        prev.map((cat: any) =>
          cat.id === id ? { ...cat, isActive: !newStatus } : cat,
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
        key: "id",
        label: t("categories.fields.id", "ID"),
        render: (row: any) => (
          <span className="font-mono text-xs font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md">
            {row.id}
          </span>
        ),
      },
      {
        key: "image",
        label: t("categories.fields.image", "Image"),
        render: (row: any) => (
          <div className="w-10 h-10 p-1 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 shadow-sm flex items-center justify-center">
            <img
              src={row.iconUrl}
              alt={row.name}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        ),
      },
      {
        key: "name",
        label: t("categories.fields.name", "Name (EN)"),
        render: (row: any) => (
          <span className="font-semibold text-gray-800 text-[13px]">
            {row.name}
          </span>
        ),
      },
      {
        key: "nameAr",
        label: t("categories.fields.nameAr", "Name (AR)"),
        render: (row: any) => (
          <span className="font-semibold text-gray-800 text-[13px]">
            {row.nameAr}
          </span>
        ),
      },
      {
        key: "commission",
        label: t("categories.fields.commission", "Commission"),
        align: "center" as const,
        headerAlign: "center" as const,
        render: (row: any) => (
          <span className="font-black text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md text-xs">
            {row.commission}%
          </span>
        ),
      },

      {
        key: "actions",
        label: t("categories.fields.actions", "Actions"),
        align: "center" as const,
        headerAlign: "center" as const,
        minWidth: 50,
        sx: { width: 50 },
        render: (_row: any) => (
          <div className="flex justify-center">
            <RowActions
              isActive={_row.isActive}
              onToggleStatus={(checked) => handleStatusChange(_row.id, checked)}
              onEdit={() => navigate(`/categories/${_row.id}/edit`)}
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
            placeholder={t(
              "categories.search_placeholder",
              "Search by category name...",
            )}
            className="w-full sm:w-80"
          />
        </div>

        {/* Table */}
        <BasicTable
          isLoading={isLoading}
          isSuccess={true}
          isError={false}
          data={categories}
          columns={columns}
          totalCount={totalCount}
          pageNumber={pageNumber}
          setPageNumber={setPageNumber}
          pageSize={pageSize}
          setPageSize={(s) => {
            setPageSize(s);
            setPageNumber(1);
          }}
          stickyHeader={false}
        />
      </div>

      <DeleteConfirmModal
        open={deleteModalOpen}
        setOpen={setDeleteModalOpen}
        onConfirm={handleDeleteConfirm}
        title={t("categories.delete_title", "Delete Category?")}
        description={t(
          "categories.delete_desc",
          "Are you sure you want to permanently delete this category?",
        )}
      />
    </div>
  );
};

export default CategoriesPage;
