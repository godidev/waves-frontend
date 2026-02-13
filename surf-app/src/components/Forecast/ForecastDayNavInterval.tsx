export const ForecastDayNavInterval = ({
  interval,
  onIntervalChange,
}: {
  interval: 1 | 3
  onIntervalChange: (interval: 1 | 3) => void
}) => {
  return (
    <>
      <button
        className={`rounded-lg px-2 py-1 text-sm ${
          interval === 1
            ? 'bg-white text-sky-600 shadow-sm dark:bg-slate-700 dark:text-sky-300'
            : 'text-slate-500 hover:bg-white/70 dark:text-slate-400 dark:hover:bg-slate-700/70'
        }`}
        onClick={() => onIntervalChange(1)}
        type='button'
      >
        1h
      </button>
      <button
        className={`rounded-lg px-2 py-1 text-sm ${
          interval === 3
            ? 'bg-white text-sky-600 shadow-sm dark:bg-slate-700 dark:text-sky-300'
            : 'text-slate-500 hover:bg-white/70 dark:text-slate-400 dark:hover:bg-slate-700/70'
        }`}
        onClick={() => onIntervalChange(3)}
        type='button'
      >
        3h
      </button>
    </>
  )
}
