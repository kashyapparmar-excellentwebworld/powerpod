export interface PaginationMeta {
  total: number
  page: number | null
  limit: number | null
  totalPages: number | null
}

export type PaginatedData<K extends string, T> = {
  [P in K]: T[]
} & { pagination: PaginationMeta }

/**
 * page and limit are both optional.
 * When limit is omitted all records are returned and page/limit/totalPages are null.
 * When only limit is provided page defaults to 1.
 */
export function paginate<K extends string, T>(
  items: T[],
  total: number,
  page: number | undefined,
  limit: number | undefined,
  dataKey: K,
): PaginatedData<K, T> {
  const safeTotal = Math.max(0, total)
  const isPaginated = limit != null

  return {
    [dataKey]: items,
    pagination: {
      total: safeTotal,
      page: isPaginated ? Math.max(1, page ?? 1) : null,
      limit: isPaginated ? limit : null,
      totalPages: isPaginated ? (safeTotal > 0 ? Math.ceil(safeTotal / limit!) : 0) : null,
    },
  } as PaginatedData<K, T>
}
