import { useState } from 'react'

interface DirectionArrowProps {
  degrees: number | null
}

export const DirectionArrow = ({ degrees }: DirectionArrowProps) => {
  const [showDegrees, setShowDegrees] = useState(false)

  if (degrees === null) return <span className="text-xs text-ocean-200">--</span>

  return (
    <button
      onClick={() => setShowDegrees((prev) => !prev)}
      className="flex items-center gap-2 text-xs text-ocean-100"
      type="button"
    >
      <span
        className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-ocean-700"
        style={{ transform: `rotate(${degrees}deg)` }}
      >
        ↑
      </span>
      {showDegrees && <span>{Math.round(degrees)}°</span>}
    </button>
  )
}
