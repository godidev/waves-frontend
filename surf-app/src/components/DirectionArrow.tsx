interface DirectionArrowProps {
  degrees: number | null
}

export const DirectionArrow = ({ degrees }: DirectionArrowProps) => {
  if (degrees === null)
    return <span className='text-xs text-ocean-200'>--</span>

  return (
    <span className='flex items-center gap-2 text-xs text-ocean-100'>
      <span
        className='inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-ocean-700'
        style={{ transform: `rotate(${degrees - 180}deg)` }}
      >
        ↑
      </span>
    </span>
  )
}
