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
    className={`flex min-w-[80px] px-2 py-1 text-sm ${
      highlight ? 'font-semibold text-cyan-400' : 'text-white'
    }`}
  >
    {value}
    {children}
  </div>
)
