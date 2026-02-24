interface BuoySearchRadiusControlProps {
  value: number
  onChange: (value: number) => void
  onCommit: () => void
}

export const BuoySearchRadiusControl = ({
  value,
  onChange,
  onCommit,
}: BuoySearchRadiusControlProps) => {
  return (
    <div className='mb-2 rounded-xl border border-slate-200/80 bg-white/70 px-2.5 py-2 dark:border-slate-700/70 dark:bg-slate-800/50'>
      <div className='mb-1.5 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300'>
        <span>Radio de búsqueda</span>
        <span className='text-slate-700 dark:text-slate-100'>{value} km</span>
      </div>
      <input
        type='range'
        name='buoy-search-radius-km'
        min={10}
        max={1000}
        step={10}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        onMouseUp={onCommit}
        onTouchEnd={onCommit}
        onBlur={onCommit}
        aria-label='Rango de búsqueda de boyas en kilómetros'
        className='h-1.5 w-full cursor-pointer accent-sky-600'
      />
    </div>
  )
}
