interface SegmentedTabOption {
  label: string
  value: string
}

interface SegmentedTabsProps {
  options: SegmentedTabOption[]
  value: string
  onChange: (value: string) => void
}

export const SegmentedTabs = ({
  options,
  value,
  onChange,
}: SegmentedTabsProps) => (
  <div className='grid grid-cols-2 gap-2 rounded-full bg-ocean-800 p-1 text-xs'>
    {options.map((option) => (
      <button
        key={option.value}
        onClick={() => onChange(option.value)}
        className={`rounded-full px-3 py-2 transition ${
          value === option.value
            ? 'bg-ocean-500 text-white shadow-glow'
            : 'text-ocean-100'
        }`}
        type='button'
      >
        {option.label}
      </button>
    ))}
  </div>
)
