export const ForecastTableItem = ({
  value,
  children,
  highlight = false,
}: {
  value: string
  children?: React.ReactNode
  highlight?: boolean
}) => (
  <div
    className={`flex min-w-[68px] items-center px-1.5 py-0.5 text-[11px] leading-tight tracking-tight ${
      highlight ? 'font-semibold text-cyan-400' : 'text-white'
    }`}
  >
    {value}
    {children}
  </div>
)
