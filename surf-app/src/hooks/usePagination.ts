import { useMemo } from 'react'

export const usePagination = <T>(
  items: T[],
  page: number,
  pageSize: number,
) => {
  return useMemo(() => {
    const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
    const safePage = Math.min(Math.max(page, 1), totalPages)
    const start = (safePage - 1) * pageSize
    const end = start + pageSize
    return {
      pagedItems: items.slice(start, end),
      totalPages,
      page: safePage,
    }
  }, [items, page, pageSize])
}
