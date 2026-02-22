import { type ReactNode, useEffect, useRef, useState } from 'react'

interface MetricCardProps {
  icon: ReactNode
  label: string
  value: string
  suffix: string
  windAngle?: ReactNode
}

export const MetricCard = ({
  icon,
  label,
  value,
  suffix,
  windAngle,
}: MetricCardProps) => {
  const [showLabel, setShowLabel] = useState(false)
  const iconRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!showLabel) return

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (iconRef.current && !iconRef.current.contains(event.target as Node)) {
        setShowLabel(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [showLabel])

  return (
    <div className='relative flex gap-2 rounded-2xl border border-slate-200 bg-white p-2 text-slate-900 shadow-sm'>
      {showLabel && (
        <div className='absolute -top-5 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-800 px-2 py-1 text-xs text-white'>
          {label}
        </div>
      )}
      <button
        ref={iconRef}
        type='button'
        className='flex size-7 cursor-pointer items-center justify-center rounded-xl bg-slate-100 text-sky-500 transition-colors hover:bg-slate-200'
        onClick={(e) => {
          e.stopPropagation()
          setShowLabel(true)
        }}
      >
        {icon}
      </button>
      <div className='flex min-h-0 items-center justify-center gap-1 text-xl font-semibold text-slate-900'>
        {value}
        {<span className='text-base text-slate-500'>{suffix}</span>}
        {windAngle && windAngle}
      </div>
    </div>
  )
}
