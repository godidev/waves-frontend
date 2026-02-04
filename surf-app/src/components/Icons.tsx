export const WaveHeight = ({ className }: { className?: string }) => {
  return (
    <svg fill='currentColor' className={className} viewBox='0 0 32 32'>
      <path d='M24 2h6v2h-6zm0 6h4v2h-4zm0 6h6v2h-6zm0 6h4v2h-4z' />
      <path d='M30 28h-6a10.035 10.035 0 0 1-6.927-17.262 12 12 0 0 0-4.08-.738 6.9 6.9 0 0 0-6.03 3.42C4.997 16.435 4 21.34 4 28H2c0-7.054 1.106-12.327 3.287-15.673A8.9 8.9 0 0 1 12.994 8H13a14.76 14.76 0 0 1 6.461 1.592 1 1 0 0 1 .087 1.722A8.025 8.025 0 0 0 24 26h6Z' />
    </svg>
  )
}

export const WavePeriod = ({ className }: { className?: string }) => {
  return (
    <svg fill='currentColor' className={className} viewBox='0 0 32 32'>
      <path d='M22 30h-5a7.01 7.01 0 0 1-7-7 6.68 6.68 0 0 1 2.024-4.697A6.8 6.8 0 0 0 10.01 18C5.043 18.047 4 24.551 4 30H2c0-11.51 4.345-13.966 7.99-14a10.1 10.1 0 0 1 4.48 1.117 1 1 0 0 1 .06 1.73A4.877 4.877 0 0 0 17 28h5ZM17 8h2v8h-2z' />
      <path d='M28 5.414 26.586 4l-2.262 2.262A9.95 9.95 0 0 0 19 4.05V2h-2v2.05A10.013 10.013 0 0 0 8 14h2a8 8 0 1 1 8 8v2a9.993 9.993 0 0 0 7.738-16.324Z' />
    </svg>
  )
}

export const WindIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='currentColor'
      className={className}
      viewBox='0 0 28 28'
    >
      <path d='M22 14H1a1 1 0 1 0 0 2h19.833C23.687 16 26 17.791 26 20s-1.709 4-6 4v2h2a6 6 0 0 0 0-12m-7.998 4H6a1 1 0 1 0 0 2h8a2 2 0 0 1 0 4v2a4 4 0 0 0 .002-8M9 8h12a1 1 0 1 0 0-2H9a1 1 0 1 0 0 2m-5 4h18a6 6 0 0 0 0-12v2c2.822.531 4 1.791 4 4s-2.313 4-5.167 4H4a1 1 0 1 0 0 2' />
    </svg>
  )
}

export const TemperatureIcon = ({ className }: { className?: string }) => {
  return <div className={className}>Temperature Icon</div>
}

export const DirectionArrow = ({
  degrees,
  className,
}: {
  degrees: number
  className?: string
}) => {
  return (
    <svg
      fill='currentColor'
      className={className}
      style={{ rotate: `${degrees + 90}deg` }}
      viewBox='0 0 18 12'
    >
      <g
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='2'
      >
        <path d='M1 6h16m0 0-5-5m5 5-5 5' />
      </g>
    </svg>
  )
}
