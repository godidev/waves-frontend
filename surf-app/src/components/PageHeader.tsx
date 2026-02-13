interface PageHeaderProps {
  title: string
  subtitle?: string
}

export const PageHeader = ({ title, subtitle }: PageHeaderProps) => (
  <div className='space-y-1'>
    <h1 className='text-2xl font-semibold text-slate-900 dark:text-slate-100'>
      {title}
    </h1>
    {subtitle && (
      <p className='text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400'>
        {subtitle}
      </p>
    )}
  </div>
)
