import type { ReactNode } from 'react'

interface SectionHeaderProps {
  title: string
  action?: string
  onAction?: () => void
  actionNode?: ReactNode
}

export const SectionHeader = ({
  title,
  action,
  onAction,
  actionNode,
}: SectionHeaderProps) => (
  <div className='flex items-center justify-center gap-3'>
    <h2 className='text-base font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-100'>
      {title}
    </h2>
    {actionNode}
    {action && onAction && (
      <button
        onClick={onAction}
        className='text-xs font-semibold uppercase text-sky-700 dark:text-sky-300'
        type='button'
      >
        {action}
      </button>
    )}
  </div>
)
