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
      <div className='w-full rounded-t-3xl bg-ocean-900 text-ocean-50 shadow-xl'>
        <div className='flex items-center justify-between border-b border-white/10 px-6 py-4'>
          <h2 className='text-lg font-semibold'>{title}</h2>
          <button
            onClick={onClose}
            className='rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-wide'
          >
            {closeLabel}
          </button>
        </div>
        <div className='max-h-[70vh] overflow-y-auto px-6 py-4'>{children}</div>
      </div>
    </div>
  )
}
