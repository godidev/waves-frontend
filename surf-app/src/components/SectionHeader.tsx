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
  <div className='flex items-center justify-between'>
    <h2 className='text-base font-semibold uppercase tracking-wide text-slate-600'>
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
