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
            ? 'bg-cyan-600 text-white'
            : 'text-white/70 hover:bg-white/10'
        }`}
        onClick={() => onIntervalChange(1)}
        type='button'
      >
        1h
      </button>
      <button
        className={`rounded-lg px-2 py-1 text-sm ${
          interval === 3
            ? 'bg-cyan-600 text-white'
            : 'text-white/70 hover:bg-white/10'
        }`}
        onClick={() => onIntervalChange(3)}
        type='button'
      >
        3h
      </button>
    </>
  )
}
