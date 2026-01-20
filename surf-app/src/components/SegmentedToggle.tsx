interface SegmentedToggleOption {
  label: string
  value: string
}

interface SegmentedToggleProps {
  options: SegmentedToggleOption[]
  value: string
  onChange: (value: string) => void
}

export const SegmentedToggle = ({ options, value, onChange }: SegmentedToggleProps) => (
  <div className="flex rounded-full bg-ocean-800 p-1 text-xs">
    {options.map((option) => (
      <button
        key={option.value}
        onClick={() => onChange(option.value)}
        className={`flex-1 rounded-full px-3 py-2 transition ${
          value === option.value ? 'bg-ocean-500 text-white shadow-glow' : 'text-ocean-100'
        }`}
        type="button"
      >
        {option.label}
      </button>
    ))}
  </div>
)
