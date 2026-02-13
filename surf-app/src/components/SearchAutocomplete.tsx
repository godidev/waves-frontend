import { useMemo, useState } from 'react'
import type { SelectableItem } from '../types'
import { usePagination } from '../hooks/usePagination'

interface SearchAutocompleteProps {
  items: SelectableItem[]
  onSelect: (id: string) => void
  pageSize?: number
}

export const SearchAutocomplete = ({
  items,
  onSelect,
  pageSize = 6,
}: SearchAutocompleteProps) => {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    if (!query) return items
    return items.filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase()),
    )
  }, [items, query])

  const { pagedItems, totalPages } = usePagination(filtered, page, pageSize)

  return (
    <div className='space-y-3'>
      <label className='text-xs uppercase tracking-wide text-slate-500'>
        Buscar
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setPage(1)
          }}
          className='mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800'
          placeholder='Buscar'
        />
      </label>
      {pagedItems.length === 0 && (
        <p className='text-sm text-slate-500'>No hay resultados</p>
      )}
      <ul className='space-y-2'>
        {pagedItems.map((item) => (
          <li key={item.id}>
            <button
              className='w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-left text-sm shadow-sm'
              onClick={() => onSelect(item.id)}
            >
              <p className='font-semibold text-slate-800'>{item.name}</p>
            </button>
          </li>
        ))}
      </ul>
      {totalPages > 1 && (
        <div className='flex items-center justify-between text-xs text-slate-500'>
          <button
            type='button'
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            className='rounded-full border border-slate-200 bg-white px-3 py-1'
            disabled={page === 1}
          >
            Anterior
          </button>
          <span>
            {page} / {totalPages}
          </span>
          <button
            type='button'
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            className='rounded-full border border-slate-200 bg-white px-3 py-1'
            disabled={page === totalPages}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  )
}
