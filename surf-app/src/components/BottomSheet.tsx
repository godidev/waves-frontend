import { useEffect, useId, useRef, type ReactNode } from 'react'

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
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previousActiveRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return

    previousActiveRef.current = document.activeElement as HTMLElement | null
    closeButtonRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab') return

      const dialog = dialogRef.current
      if (!dialog) return

      const focusableElements = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hasAttribute('disabled'))

      if (!focusableElements.length) {
        event.preventDefault()
        return
      }

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]
      const activeElement = document.activeElement as HTMLElement | null

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      } else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previousActiveRef.current?.focus()
    }
  }, [onClose, open])

  if (!open) return null

  return (
    <div
      className='fixed inset-0 z-50 flex items-end justify-center bg-black/50'
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role='dialog'
        aria-modal='true'
        aria-labelledby={titleId}
        className='w-full overscroll-contain rounded-t-3xl bg-white text-slate-900 shadow-xl dark:bg-slate-900 dark:text-slate-100'
        onClick={(event) => event.stopPropagation()}
      >
        <div className='flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700'>
          <h2
            id={titleId}
            className='text-lg font-semibold text-slate-800 dark:text-slate-100'
          >
            {title}
          </h2>
          <button
            ref={closeButtonRef}
            type='button'
            onClick={onClose}
            className='touch-manipulation rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:bg-slate-800 dark:text-slate-300'
          >
            {closeLabel}
          </button>
        </div>
        <div className='max-h-[70vh] overflow-y-auto overscroll-contain px-6 py-4'>
          {children}
        </div>
      </div>
    </div>
  )
}
