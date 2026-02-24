interface LabeledToggleGroupOption {
  label: string
  value: string
}

interface LabeledToggleGroupProps {
  label: string
  ariaLabel: string
  value: string
  options: LabeledToggleGroupOption[]
  onChange: (value: string) => void
  wrapperClassName?: string
  labelClassName?: string
  groupClassName?: string
  activeClassName?: string
  inactiveClassName?: string
}

export const LabeledToggleGroup = ({
  label,
  ariaLabel,
  value,
  options,
  onChange,
  wrapperClassName,
  labelClassName,
  groupClassName,
  activeClassName,
  inactiveClassName,
}: LabeledToggleGroupProps) => (
  <div className={wrapperClassName ?? 'inline-flex items-center gap-1.5'}>
    <span
      className={
        labelClassName ??
        'text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300'
      }
    >
      {label}
    </span>
    <div
      role='group'
      aria-label={ariaLabel}
      className={
        groupClassName ??
        'inline-flex items-center rounded-full border border-slate-200 bg-white/90 p-0.5 text-xs font-medium dark:border-slate-700 dark:bg-slate-800/80'
      }
    >
      {options.map((option) => {
        const isActive = value === option.value
        return (
          <button
            key={option.value}
            type='button'
            aria-pressed={isActive}
            onClick={() => onChange(option.value)}
            className={`rounded-full px-2 py-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
              isActive
                ? (activeClassName ??
                  'bg-sky-100 font-semibold text-sky-700 dark:bg-sky-900/40 dark:text-sky-200')
                : (inactiveClassName ??
                  'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white')
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  </div>
)
