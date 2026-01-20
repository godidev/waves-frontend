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
    <h2 className='text-lg font-semibold text-white'>{title}</h2>
    {action && onAction && (
      <button
        onClick={onAction}
        className='text-xs uppercase text-ocean-200'
        type='button'
      >
        {action}
      </button>
    )}
  </div>
)
