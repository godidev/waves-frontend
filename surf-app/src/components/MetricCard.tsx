import type { ReactNode } from 'react'

interface MetricCardProps {
  label: string
  value: string
  suffix?: string
  icon?: ReactNode
}

export const MetricCard = ({ label, value, suffix, icon }: MetricCardProps) => (
  <div className='flex flex-1 flex-col justify-between rounded-xl border border-white/10 bg-ocean-800/80 px-3 py-1 text-white shadow-glow'>
    <div>
      <span className='text-xs uppercase text-ocean-200'>{label}</span>
    </div>
    <div className='mt-1 flex gap-3 text-xl font-semibold'>
      <div>
        {value}
        {suffix && <span className='text-base text-ocean-200'>{suffix}</span>}
      </div>
      {icon && <div className='flex text-2xl'>{icon}</div>}
    </div>
  </div>
)
