import type { ReactNode } from 'react'

interface BottomSheetProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  closeLabel?: string
}

export const BottomSheet = ({
  open,
  title,
  onClose,
  children,
  closeLabel = 'Close',
}: BottomSheetProps) => {
  if (!open) return null

  return (
    <div className='fixed inset-0 z-50 flex items-end justify-center bg-black/50'>
      <div className='w-full rounded-t-3xl bg-white text-slate-900 shadow-xl'>
        <div className='flex items-center justify-between border-b border-slate-200 px-6 py-4'>
          <h2 className='text-lg font-semibold text-slate-800'>{title}</h2>
          <button
            onClick={onClose}
            className='rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600'
          >
            {closeLabel}
          </button>
        </div>
        <div className='max-h-[70vh] overflow-y-auto px-6 py-4'>{children}</div>
      </div>
    </div>
  )
}
