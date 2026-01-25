export const ForecastTableItem = ({
  value,
  children,
}: {
  value: string
  children?: React.ReactNode
}) => (
  <div className='flex min-w-[80px] px-2 py-1 text-sm text-white'>
    {value}
    {children}
  </div>
)
