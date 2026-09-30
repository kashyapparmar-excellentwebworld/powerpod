import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  useTheme,
  type SxProps,
  type Theme,
} from "@mui/material";
import { SortIcon } from "./SortIcon";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  AlertCircle,
  RefreshCw,
  SearchX,
} from "lucide-react";
import { useThemeCustomizer } from "../../../context/ThemeCustomizerContext";

// ── Types ────────────────────────────────────────────────────────────────────

type SortConfig = {
  sortBy: string;
  sortOrder: "asc" | "desc";
};

type Column<T = any> = {
  key: string;
  label: string;
  sortable?: boolean;
  sx?: React.CSSProperties & Record<string, unknown>;
  minWidth?: number;
  render?: (row: T) => React.ReactNode;
  accessor?: (row: T) => React.ReactNode;
  align?: "left" | "center" | "right";
  headerAlign?: "left" | "center" | "right";
};

interface BasicTableProps<T> {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  data: T[];
  columns: Column<T>[];
  hidePagination?: boolean;
  totalCount?: number;
  pageSize?: number;
  setPageSize?: (size: number) => void;
  pageNumber?: number;
  setPageNumber?: (page: number) => void;
  sortConfig?: SortConfig;
  setSortConfig?: (config: SortConfig) => void;
  maxHeight?: string | number;
  height?: string | number;
  isScrollable?: boolean;
  stickyHeader?: boolean;
  stickyPagination?: boolean;
}

// ── Constants ────────────────────────────────────────────────────────────────

const STICKY_KEY = "actions";
const SKELETON_ROWS = 7;

const stickyCell: SxProps<Theme> = {
  position: "sticky" as const,
  right: { xs: "auto", sm: 0 },
  textAlign: "center",
  borderLeft: { xs: "none", sm: "1px solid #f1f5f9" },
  boxShadow: { xs: "none", sm: "-6px 0 16px -6px rgba(0,0,0,0.06)" },
  backgroundColor: "inherit",
};

// ── Skeleton Row ─────────────────────────────────────────────────────────────

function SkeletonRow({
  columns,
  rowIndex,
}: {
  columns: Column<any>[];
  rowIndex: number;
}) {
  const WIDTHS = [55, 80, 70, 60, 65, 40, 75, 90];
  return (
    <TableRow
      sx={{
        backgroundColor: rowIndex % 2 === 0 ? "#fff" : "#fafafa",
        "&:last-child td": { borderBottom: "none" },
      }}
    >
      {columns.map((col, i) => {
        const isSticky = col.key === STICKY_KEY;
        return (
          <TableCell
            key={i}
            align={isSticky ? "center" : col.align}
            sx={{
              ...col.sx,
              ...(isSticky && {
                ...stickyCell,
                zIndex: 2,
              }),
              borderBottom: "1px solid #f8fafc",
              padding: "14px 16px",
            }}
          >
            <div
              className={`animate-pulse rounded-md bg-slate-200 ${
                isSticky || col.align === "center"
                  ? "mx-auto"
                  : col.align === "right"
                    ? "ml-auto"
                    : ""
              }`}
              style={{
                height: 20,
                width: col.key === "image" ? "40px" : `${WIDTHS[i % WIDTHS.length]}%`,
                ...(col.key === "image" ? { borderRadius: "8px", height: "40px" } : {}),
              }}
            />
          </TableCell>
        );
      })}
    </TableRow>
  );
}

// ── Pagination Button ────────────────────────────────────────────────────────

function PaginationBtn({
  onClick,
  disabled,
  children,
  active,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  active?: boolean;
}) {
  const { primaryColor } = useThemeCustomizer();

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={active ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}
      className={`
        flex items-center justify-center min-w-[32px] h-8 px-2 rounded-lg text-sm font-semibold
        transition-all duration-200 select-none cursor-pointer
        ${
          active
            ? "text-white shadow-md scale-105"
            : disabled
              ? "text-gray-300 dark:text-slate-600 cursor-not-allowed bg-transparent"
              : "text-gray-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
        }
      `}
    >
      {children}
    </button>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export function BasicTable<T extends { id: number | string }>({
  isLoading,
  isSuccess,
  isError,
  data,
  columns,
  hidePagination = false,
  totalCount = 0,
  pageSize = 10,
  setPageSize,
  pageNumber = 1,
  setPageNumber,
  sortConfig,
  setSortConfig,
  maxHeight = "100%",
  height,
  isScrollable = true,
  stickyHeader = true,
  stickyPagination = true,
}: BasicTableProps<T>) {
  const theme = useTheme();

  const handleSortClick = (colKey: string) => {
    if (!setSortConfig) return;
    setSortConfig(
      sortConfig?.sortBy === colKey
        ? {
            sortBy: colKey,
            sortOrder: sortConfig.sortOrder === "asc" ? "desc" : "asc",
          }
        : { sortBy: colKey, sortOrder: "asc" },
    );
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // Build compact page range
  const getPageRange = (): (number | "...")[] => {
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [1];
    if (pageNumber > 3) pages.push("...");
    const start = Math.max(2, pageNumber - 1);
    const end = Math.min(totalPages - 1, pageNumber + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (pageNumber < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  const startRow = (pageNumber - 1) * pageSize + 1;
  const endRow = Math.min(pageNumber * pageSize, totalCount);

  return (
    <>
      {/* ── Shimmer keyframe (injected once) ── */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* ── Table wrapper ── */}
      <div
        style={{
          overflow: "hidden",
          display: isScrollable ? "flex" : undefined,
          flexDirection: isScrollable ? "column" : undefined,
          flex: isScrollable ? 1 : undefined,
          minHeight: isScrollable ? 0 : undefined,
        }}
      >
        <div
          style={{
            overflowX: "auto",
            overflowY: isScrollable
              ? maxHeight || height
                ? "auto"
                : undefined
              : undefined,
            maxHeight: isScrollable ? maxHeight : undefined,
            height: isScrollable ? height : undefined,
            width: "100%",
            position: "relative",
            flex: isScrollable ? 1 : undefined,
            display: isScrollable ? "flex" : undefined,
            flexDirection: isScrollable ? "column" : undefined,
          }}
        >
          <Table
            stickyHeader={stickyHeader}
            style={{
              minWidth: 700,
              borderCollapse: "separate",
              borderSpacing: 0,
              tableLayout: "auto",
            }}
            sx={(theme) => ({
              // ── Head ──
              "& .MuiTableCell-head": {
                fontWeight: 800,
                fontSize: "11px",
                padding: "12px 16px",
                color: theme.palette.primary.main,
                whiteSpace: "nowrap",
                backgroundColor: theme.palette.mode === "dark" ? "#334155" : "#f5f3ff",
                borderBottom: theme.palette.mode === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid #ede9fe",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                userSelect: "none",
              },
              // ── Body ──
              "& .MuiTableCell-body": {
                padding: "0px 16px",
                borderBottom: theme.palette.mode === "dark" ? "1px solid rgba(255,255,255,0.05)" : "1px solid #f8fafc",
                color: theme.palette.text.primary,
                fontSize: "13px",
                fontWeight: 500,
              },
            })}
          >
            {/* ─── Head ─── */}
            <TableHead>
              <TableRow>
                {columns.map((col) => {
                  const isSticky = col.key === STICKY_KEY;
                  return (
                    <TableCell
                      key={col.key}
                      align={isSticky ? "center" : col.headerAlign}
                      sx={{
                        minWidth: col.minWidth,
                        ...col.sx,
                        ...(isSticky && {
                          ...stickyCell,
                          zIndex: 3,
                          top: 0,
                          backgroundColor: theme.palette.mode === "dark" ? "#334155" : "#f5f3ff",
                        }),
                      }}
                    >
                      {col.sortable ? (
                        <TableSortLabel
                          active={sortConfig?.sortBy === col.key}
                          direction={
                            sortConfig?.sortBy === col.key
                              ? sortConfig.sortOrder
                              : "asc"
                          }
                          onClick={() => handleSortClick(col.key)}
                          IconComponent={(props) => (
                            <SortIcon
                              {...props}
                              active={sortConfig?.sortBy === col.key}
                              direction={sortConfig?.sortOrder}
                              theme={theme}
                            />
                          )}
                          sx={(theme) => ({
                            color: theme.palette.primary.main,
                            gap: "6px",
                            "&.Mui-active": {
                              color: theme.palette.primary.dark,
                            },
                            "& .MuiTableSortLabel-icon": {
                              opacity: 1,
                              transform: "none !important",
                              marginLeft: 0,
                            },
                            "&:hover": { color: theme.palette.primary.main },
                          })}
                        >
                          {col.label}
                        </TableSortLabel>
                      ) : (
                        col.label
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>

            {/* ─── Body ─── */}
            <TableBody>
              {/* Skeleton */}
              {isLoading &&
                Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                  <SkeletonRow key={`sk-${i}`} columns={columns} rowIndex={i} />
                ))}

              {/* Data Rows */}
              {!isLoading &&
                Array.isArray(data) &&
                data.length > 0 &&
                data.map((row, rowIndex) => (
                  <TableRow
                    key={row.id}
                    sx={{
                      backgroundColor: theme.palette.mode === "dark" 
                        ? (rowIndex % 2 === 0 ? "#1e293b" : "#1e2233") 
                        : (rowIndex % 2 === 0 ? "#fff" : "#fafafa"),
                      "&:hover td": {
                        backgroundColor: theme.palette.mode === "dark" ? "#334155 !important" : "#f5f3ff !important",
                      },
                      "&:last-child td": { borderBottom: "none" },
                      transition: "background-color 0.15s ease",
                    }}
                  >
                    {columns.map((col) => {
                      const isSticky = col.key === STICKY_KEY;
                      return (
                        <TableCell
                          key={col.key}
                          align={isSticky ? "center" : col.align}
                          sx={{
                            ...col.sx,
                            ...(isSticky && {
                              ...stickyCell,
                              zIndex: 2,
                            }),
                          }}
                        >
                          {isSticky ? (
                            col.render ? (
                              col.render(row)
                            ) : (
                              (row as any)[col.key]
                            )
                          ) : (
                            <div
                              style={{
                                display:
                                  col.align === "center"
                                    ? "flex"
                                    : "-webkit-box",
                                justifyContent:
                                  col.align === "center"
                                    ? "center"
                                    : col.align === "right"
                                      ? "flex-end"
                                      : undefined,
                                alignItems:
                                  col.align === "center" ? "center" : undefined,
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                padding: "10px 0",
                                whiteSpace: "normal",
                                minWidth: col.minWidth,
                                maxWidth: (col.sx as any)?.maxWidth ?? 300,
                              }}
                            >
                              {col.render
                                ? col.render(row)
                                : col.accessor
                                  ? col.accessor(row)
                                  : (row as any)[col.key]}
                            </div>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}

              {/* Empty State */}
              {!isLoading && isSuccess && (!data || data.length === 0) && (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    align="center"
                    sx={{
                      py: 8,
                      borderBottom: "none",
                      backgroundColor: "#fff",
                    }}
                  >
                    <div className="flex flex-col items-center gap-3 py-6">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                        <SearchX className="w-7 h-7 text-slate-300" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-gray-500">
                          No results found
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Try adjusting your search or filters
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {/* Error State */}
              {isError && (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    align="center"
                    sx={{
                      py: 8,
                      borderBottom: "none",
                      backgroundColor: "#fff",
                    }}
                  >
                    <div className="flex flex-col items-center gap-3 py-6">
                      <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center">
                        <AlertCircle className="w-7 h-7 text-rose-400" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-gray-600">
                          Failed to load data
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Please try refreshing the page
                        </p>
                      </div>
                      <button
                        onClick={() => window.location.reload()}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Retry
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ── Pagination ── */}
      {!hidePagination && (
        <div
          className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 dark:border-slate-800 bg-surface-light text-black ${
            stickyPagination ? "sticky bottom-0 z-20" : ""
          }`}
        >
          {/* Row count info */}
          <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
            <span>
              Showing{" "}
              <span className="font-bold text-gray-600">
                {totalCount === 0 ? 0 : startRow}–{endRow}
              </span>{" "}
              of <span className="font-bold text-gray-600">{totalCount}</span>{" "}
              results
            </span>
            <div className="h-4 w-px bg-gray-200" />
            <div className="flex items-center gap-1.5">
              <span>Rows:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize?.(Number(e.target.value));
                  setPageNumber?.(1);
                }}
                className="h-7 rounded-lg border border-gray-200 bg-gray-50 px-2 text-xs font-semibold text-gray-600 outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/30 cursor-pointer transition-all"
              >
                {[10, 25, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Page buttons */}
          <div className="flex items-center gap-1">
            <PaginationBtn
              onClick={() => setPageNumber?.(1)}
              disabled={pageNumber <= 1}
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </PaginationBtn>
            <PaginationBtn
              onClick={() => setPageNumber?.(pageNumber - 1)}
              disabled={pageNumber <= 1}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </PaginationBtn>

            {getPageRange().map((p, idx) =>
              p === "..." ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-8 text-center text-xs text-gray-300 font-bold select-none"
                >
                  ···
                </span>
              ) : (
                <PaginationBtn
                  key={p}
                  onClick={() => setPageNumber?.(p as number)}
                  active={pageNumber === p}
                >
                  {p}
                </PaginationBtn>
              ),
            )}

            <PaginationBtn
              onClick={() => setPageNumber?.(pageNumber + 1)}
              disabled={pageNumber >= totalPages}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </PaginationBtn>
            <PaginationBtn
              onClick={() => setPageNumber?.(totalPages)}
              disabled={pageNumber >= totalPages}
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </PaginationBtn>
          </div>
        </div>
      )}
    </>
  );
}
