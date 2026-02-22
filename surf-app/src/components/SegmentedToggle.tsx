interface SegmentedToggleOption {
  label: string
  value: string
}

interface SegmentedToggleProps {
  options: SegmentedToggleOption[]
  value: string
  onChange: (value: string) => void
  ariaLabel?: string
}

export const SegmentedToggle = ({
  options,
  value,
  onChange,
  ariaLabel = 'Selector segmentado',
}: SegmentedToggleProps) => (
  <div
    role='group'
    aria-label={ariaLabel}
    className='flex rounded-full border border-slate-200 bg-slate-100 p-0.5 text-[11px]'
  >
    {options.map((option) => (
      <button
        key={option.value}
        onClick={() => onChange(option.value)}
        aria-pressed={value === option.value}
        className={`flex-1 rounded-full px-2 py-1.5 leading-tight transition ${
          value === option.value
            ? 'bg-white font-semibold text-sky-600 shadow-sm'
            : 'text-slate-500 hover:bg-white/80'
        }`}
        type='button'
      >
        {option.label}
      </button>
    ))}
  </div>
)
