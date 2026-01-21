import type { ReactNode } from 'react'

interface MetricCardProps {
  label: string
  value: string
  suffix?: string
  icon?: ReactNode
}

export const MetricCard = ({ label, value, suffix, icon }: MetricCardProps) => (
  <div className='flex-1 flex flex-col justify-between rounded-xl border border-white/10 bg-ocean-800/80 p-3 text-white shadow-glow'>
    <div>
      <span className='text-xs uppercase text-ocean-200'>{label}</span>
    </div>
    <div className='flex gap-3 mt-2 text-2xl font-semibold'>
      <div>
        {value}
        {suffix && <span className='text-base text-ocean-200'>{suffix}</span>}
      </div>
      {icon && <div className='flex text-3xl'>{icon}</div>}
    </div>
  </div>
)
