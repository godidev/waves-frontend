interface SectionHeaderProps {
  title: string
  action?: string
  onAction?: () => void
}

export const SectionHeader = ({
  title,
  action,
  onAction,
}: SectionHeaderProps) => (
  <div className='flex items-center justify-center gap-3'>
    <h2 className='text-base font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300'>
      {title}
    </h2>
    {action && onAction && (
      <button
        onClick={onAction}
        className='text-xs font-semibold uppercase text-sky-600'
        type='button'
      >
        {action}
      </button>
    )}
  </div>
)
