interface BuoySectionHeaderProps {
  stationLabel: string
  defaultStationId: string
  onOpenSelector: () => void
  buoyHours: '6' | '12' | '24'
  onChangeHours: (hours: '6' | '12' | '24') => void
}

export const BuoySectionHeader = ({
  stationLabel,
  defaultStationId,
  onOpenSelector,
  buoyHours,
  onChangeHours,
}: BuoySectionHeaderProps) => (
  <div className='mb-3 flex items-center justify-between gap-3'>
    <div className='flex items-center gap-3'>
      <h3 className='text-2xl font-semibold uppercase leading-none tracking-wide text-slate-600 dark:text-slate-300'>
        Boyas
      </h3>
      <button
        type='button'
        onClick={() => {
          onOpenSelector()
        }}
        className='text-sm font-semibold text-sky-600'
      >
        {stationLabel || defaultStationId}
      </button>
    </div>
    <div className='flex items-center gap-3 text-base font-medium text-slate-500 dark:text-slate-400'>
      {(['6', '12', '24'] as const).map((hours) => (
        <button
          key={hours}
          type='button'
          onClick={() => onChangeHours(hours)}
          className={`transition ${
            buoyHours === hours
              ? 'font-semibold text-sky-600'
              : 'hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          {hours}h
        </button>
      ))}
    </div>
  </div>
)
