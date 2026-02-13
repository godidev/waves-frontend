interface SegmentedToggleOption {
  label: string
  value: string
}

interface SegmentedToggleProps {
  options: SegmentedToggleOption[]
  value: string
  onChange: (value: string) => void
}

export const SegmentedToggle = ({
  options,
  value,
  onChange,
}: SegmentedToggleProps) => (
  <div className='flex rounded-full border border-white/10 bg-ocean-900/40 p-0.5 text-[11px]'>
    {options.map((option) => (
      <button
        key={option.value}
        onClick={() => onChange(option.value)}
        className={`flex-1 rounded-full px-2 py-1.5 leading-tight transition ${
          value === option.value
            ? 'bg-ocean-600 text-white'
            : 'text-ocean-200 hover:bg-white/5'
        }`}
        type='button'
      >
        {option.label}
      </button>
    ))}
  </div>
)
