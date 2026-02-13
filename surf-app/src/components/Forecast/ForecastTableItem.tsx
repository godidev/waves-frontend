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
      highlight ? 'font-semibold text-sky-600' : 'text-slate-700'
    }`}
  >
    {value}
    {children}
  </div>
)
