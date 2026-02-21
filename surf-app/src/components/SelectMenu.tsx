interface SelectMenuOption {
  value: string
  label: string
}

interface SelectMenuProps {
  value: string
  options: SelectMenuOption[]
  onChange: (value: string) => void
  ariaLabel: string
  className?: string
}

export const SelectMenu = ({
  value,
  options,
  onChange,
  ariaLabel,
  className,
}: SelectMenuProps) => (
  <select
    value={value}
    onChange={(event) => onChange(event.target.value)}
    aria-label={ariaLabel}
    className={
      className ??
      'max-w-[220px] rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-sky-700 dark:border-slate-600 dark:bg-slate-800 dark:text-sky-300'
    }
  >
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
)
