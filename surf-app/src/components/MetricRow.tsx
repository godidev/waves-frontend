interface MetricRowProps {
  label: string
  value: string
}

export const MetricRow = ({ label, value }: MetricRowProps) => (
  <div className="flex items-center justify-between text-xs text-ocean-200">
    <span>{label}</span>
    <span className="text-white">{value}</span>
  </div>
)
