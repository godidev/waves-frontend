interface SelectMenuOption {
  value: string
  label: string
}

interface SelectMenuProps {
  value: string
  options: SelectMenuOption[]
  onChange: (value: string) => void
  ariaLabel: string
  name?: string
  className?: string
  disabled?: boolean
}

export const SelectMenu = ({
  value,
  options,
  onChange,
  ariaLabel,
  name,
  className,
  disabled,
}: SelectMenuProps) => (
  <select
    value={value}
    onChange={(event) => onChange(event.target.value)}
    aria-label={ariaLabel}
    name={name}
    autoComplete='off'
    disabled={disabled}
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
