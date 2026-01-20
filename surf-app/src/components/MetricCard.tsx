import type { ReactNode } from 'react'

interface MetricCardProps {
  label: string
  value: string
  suffix?: string
  icon?: ReactNode
}

export const MetricCard = ({ label, value, suffix, icon }: MetricCardProps) => (
  <div className='rounded-xl border border-white/10 bg-ocean-800/80 p-3 text-white shadow-glow'>
    <div className='flex items-center justify-between'>
      <span className='text-xs uppercase text-ocean-200'>{label}</span>
      {icon}
    </div>
    <div className='mt-2 text-2xl font-semibold'>
      {value}
      {suffix && <span className='text-base text-ocean-200'>{suffix}</span>}
    </div>
  </div>
)
