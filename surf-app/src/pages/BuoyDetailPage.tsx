import { BuoyDetailContent } from '../components/BuoyDetailContent'
import { StatusMessage } from '../components/StatusMessage'
import { PageHeader } from '../components/PageHeader'
import { useBuoyInfoQuery } from '../hooks/useAppQueries'

interface BuoyDetailPageProps {
  stationId: string
}

export const BuoyDetailPage = ({ stationId }: BuoyDetailPageProps) => {
  const { data, isLoading, isError } = useBuoyInfoQuery(stationId)
  const buoyName = data?.buoyName ?? stationId

  if (isLoading) {
    return <StatusMessage message='Cargando…' />
  }

  if (isError) {
    return <StatusMessage message='Error al cargar datos' variant='error' />
  }

  return (
    <div className='space-y-5'>
      <PageHeader title={buoyName || 'Boyas'} subtitle='Boyas' />
      <BuoyDetailContent stationId={stationId} />
    </div>
  )
}
