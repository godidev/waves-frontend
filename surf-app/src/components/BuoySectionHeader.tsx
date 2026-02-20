interface BuoySectionHeaderProps {
  stationLabel: string
  defaultStationId: string
  onOpenSelector: () => void
  buoyHours: '6' | '12' | '24'
  onChangeHours: (hours: '6' | '12' | '24') => void
  latestReading: string
}

export const BuoySectionHeader = ({
  stationLabel,
  defaultStationId,
  onOpenSelector,
  buoyHours,
  onChangeHours,
  latestReading,
}: BuoySectionHeaderProps) => (
  <div className='mb-4 flex items-start justify-between gap-3'>
    <div className='space-y-1'>
      <div className='flex items-end gap-2'>
        <h3 className='text-base font-semibold uppercase leading-none tracking-wide text-slate-700 dark:text-slate-100'>
          Boyas
        </h3>
        <span className='text-sm font-semibold leading-none text-sky-700 dark:text-sky-300'>
          {latestReading}
        </span>
      </div>
      <button
        type='button'
        onClick={() => {
          onOpenSelector()
        }}
        className='text-xs font-medium uppercase tracking-wide text-slate-700 transition hover:text-slate-900 dark:text-slate-200 dark:hover:text-white'
      >
        {stationLabel || defaultStationId}
      </button>
    </div>
    <div className='flex items-center gap-3 text-base font-medium text-slate-700 dark:text-slate-200'>
      {(['6', '12', '24'] as const).map((hours) => (
        <button
          key={hours}
          type='button'
          onClick={() => onChangeHours(hours)}
          className={`transition ${
            buoyHours === hours
              ? 'font-semibold text-sky-700 dark:text-sky-300'
              : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {hours}h
        </button>
      ))}
    </div>
  </div>
)
