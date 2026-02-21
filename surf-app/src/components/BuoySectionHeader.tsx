interface BuoySectionHeaderProps {
  stationOptions: Array<{ id: string; name: string }>
  selectedStationId: string
  onStationChange: (stationId: string) => void
  buoyHours: '6' | '12' | '24'
  onChangeHours: (hours: '6' | '12' | '24') => void
  latestReading: string
}

export const BuoySectionHeader = ({
  stationOptions,
  selectedStationId,
  onStationChange,
  buoyHours,
  onChangeHours,
  latestReading,
}: BuoySectionHeaderProps) => (
  <div className='mb-4 space-y-2'>
    <div className='flex items-end justify-between gap-3'>
      <div className='flex items-end gap-2'>
        <h3 className='text-base font-semibold uppercase leading-none tracking-wide text-slate-700 dark:text-slate-100'>
          Boyas
        </h3>
        <span className='text-sm font-semibold leading-none text-sky-700 dark:text-sky-300'>
          {latestReading}
        </span>
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
    <select
      value={selectedStationId}
      onChange={(event) => onStationChange(event.target.value)}
      className='w-full rounded-lg border border-slate-300 bg-slate-50 px-2 py-1 text-xs font-medium uppercase tracking-wide text-slate-700 transition hover:text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:text-white'
      aria-label='Seleccionar boya'
    >
      {stationOptions.map((station) => (
        <option key={station.id} value={station.id}>
          {station.name}
        </option>
      ))}
    </select>
  </div>
)
