interface PageHeaderProps {
  title: string
  subtitle?: string
}

export const PageHeader = ({ title, subtitle }: PageHeaderProps) => (
  <div className='space-y-1'>
    <h1 className='text-2xl font-semibold text-white'>{title}</h1>
    {subtitle && <p className='text-xs uppercase text-ocean-200'>{subtitle}</p>}
  </div>
)
