interface MapStatusPanelProps {
  visible: boolean
  loading: boolean
  status: 'loading' | 'error' | 'ready'
  stats: string[]
}

export const MapStatusPanel = ({
  visible,
  loading,
  status,
  stats,
}: MapStatusPanelProps) => {
  if (!visible) return null

  return (
    <div className='absolute bottom-4 left-4 z-10 rounded-xl bg-ocean-800/80 px-3 py-2 text-[11px] text-ocean-200 backdrop-blur'>
      {loading ? (
        <p>Cargando mapa…</p>
      ) : status === 'error' ? (
        <p>Error al cargar datos del mapa</p>
      ) : (
        <div className='space-y-0.5'>
          {stats.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      )}
    </div>
  )
}
