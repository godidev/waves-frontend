import type { ReactNode } from 'react'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  rightNode?: ReactNode
}

export const SectionHeader = ({
  title,
  subtitle,
  rightNode,
}: SectionHeaderProps) => (
  <div className='mb-2.5 flex items-end justify-between gap-3'>
    <div className='flex min-w-0 items-baseline gap-2'>
      <h2 className='text-base font-semibold leading-none tracking-tight text-slate-800 dark:text-slate-100'>
        {title}
      </h2>
      {subtitle && (
        <span className='truncate text-sm font-semibold text-sky-700 dark:text-sky-300'>
          {subtitle}
        </span>
      )}
    </div>
    {rightNode}
  </div>
)
