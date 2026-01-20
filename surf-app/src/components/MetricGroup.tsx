import type { ReactNode } from 'react'

interface MetricGroupProps {
  title: string
  children: ReactNode
}

export const MetricGroup = ({ title, children }: MetricGroupProps) => (
  <div className='rounded-2xl border border-white/10 bg-ocean-800/60 p-4'>
    <h3 className='text-xs uppercase text-ocean-200'>{title}</h3>
    <div className='mt-3 space-y-2'>{children}</div>
  </div>
)
