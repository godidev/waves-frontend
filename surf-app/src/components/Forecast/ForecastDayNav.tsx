import { ForecastDayNavInterval } from './ForecastDayNavInterval'

const ChevronLeft = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill='none'
    viewBox='0 0 24 24'
    stroke='currentColor'
    strokeWidth={2}
  >
    <path strokeLinecap='round' strokeLinejoin='round' d='M15 19l-7-7 7-7' />
  </svg>
)

const ChevronRight = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill='none'
    viewBox='0 0 24 24'
    stroke='currentColor'
    strokeWidth={2}
  >
    <path strokeLinecap='round' strokeLinejoin='round' d='M9 5l7 7-7 7' />
  </svg>
)

interface ForecastDayNavProps {
  selectedDate: string
  onPrevDay: () => void
  onNextDay: () => void
  hasPrevDay: boolean
  hasNextDay: boolean
  interval?: 1 | 3
  onIntervalChange?: (interval: 1 | 3) => void
  showIntervalControl?: boolean
  locale: string
}

const isToday = (dateString: string): boolean => {
  const date = new Date(dateString)
  const now = new Date()
  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  )
}

const formatDayHeader = (dateString: string, locale: string) => {
  if (isToday(dateString)) {
    return 'Hoy'
  }
  const date = new Date(dateString)
  return date.toLocaleDateString(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export const ForecastDayNav = ({
  selectedDate,
  onPrevDay,
  onNextDay,
  hasPrevDay,
  hasNextDay,
  interval,
  onIntervalChange,
  showIntervalControl = true,
  locale,
}: ForecastDayNavProps) => (
  <div className='flex items-center justify-between'>
    <div className='flex items-center gap-2'>
      <button
        onClick={onPrevDay}
        disabled={!hasPrevDay}
        className='rounded-lg p-1 text-slate-500 transition-colors hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent'
        aria-label='Dia anterior'
      >
        <ChevronLeft className='h-5 w-5' />
      </button>
      <span className='min-w-[120px] text-center text-sm font-medium text-slate-700'>
        {formatDayHeader(selectedDate, locale)}
      </span>
      <button
        onClick={onNextDay}
        disabled={!hasNextDay}
        className='rounded-lg p-1 text-slate-500 transition-colors hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent'
        aria-label='Dia siguiente'
      >
        <ChevronRight className='h-5 w-5' />
      </button>
    </div>

    {showIntervalControl && interval && onIntervalChange && (
      <div className='flex gap-1 rounded-lg bg-slate-100 p-1'>
        <ForecastDayNavInterval
          interval={interval}
          onIntervalChange={onIntervalChange}
        />
      </div>
    )}
  </div>
)
