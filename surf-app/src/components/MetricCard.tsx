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
  const iconRef = useRef<HTMLDivElement>(null)

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
    <div
      className={`relative flex gap-2 rounded-xl border border-white/10 bg-ocean-800/80 p-1 text-white shadow-glow`}
    >
      {showLabel && (
        <div className='absolute -top-5 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded bg-ocean-900/90 px-2 py-1 text-sm'>
          {label}
        </div>
      )}
      <div
        ref={iconRef}
        className='flex size-6 cursor-pointer items-center justify-center rounded text-white/80 transition-colors hover:text-white'
        onClick={(e) => {
          e.stopPropagation()
          setShowLabel(true)
        }}
      >
        {icon}
      </div>
      <div className='flex min-h-0 items-center justify-center gap-1 text-xl font-semibold'>
        {value}
        {<span className='text-base text-ocean-200'>{suffix}</span>}
        {windAngle && windAngle}
      </div>
    </div>
  )
}
