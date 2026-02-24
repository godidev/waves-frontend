import { useEffect, useState } from 'react'
import { getBuoyInfo } from '../services/api'
import { BuoyDetailContent } from '../components/BuoyDetailContent'
import { StatusMessage } from '../components/StatusMessage'
import { PageHeader } from '../components/PageHeader'

interface BuoyDetailPageProps {
  stationId: string
}

export const BuoyDetailPage = ({ stationId }: BuoyDetailPageProps) => {
  const [buoyName, setBuoyName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      setError(false)
      try {
        const info = await getBuoyInfo(stationId)
        if (!mounted) return
        setBuoyName(info.buoyName ?? stationId)
      } catch (err) {
        console.error('Failed to load buoy info:', err)
        if (!mounted) return
        setError(true)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    void load()
    return () => {
      mounted = false
    }
  }, [stationId])

  if (loading) {
    return <StatusMessage message='Cargando…' />
  }

  if (error) {
    return <StatusMessage message='Error al cargar datos' variant='error' />
  }

  return (
    <div className='space-y-5'>
      <PageHeader title={buoyName || 'Boyas'} subtitle='Boyas' />
      <BuoyDetailContent stationId={stationId} />
    </div>
  )
}
