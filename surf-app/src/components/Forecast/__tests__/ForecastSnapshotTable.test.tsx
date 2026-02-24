import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { ForecastSnapshotItem } from '../forecastSnapshots'
import { ForecastSnapshotTable } from '../ForecastSnapshotTable'

const items: ForecastSnapshotItem[] = [
  {
    label: 'Ahora',
    time: 1,
    hour: '08:00',
    waveHeight: '1.2',
    waveHeightTrend: null,
    wavePeriod: '11.0',
    energy: '450',
    energyTrend: 'up',
    windSpeed: '12',
    windDirection: 210,
  },
  {
    label: '+6h',
    time: 2,
    hour: '14:00',
    waveHeight: '1.5',
    waveHeightTrend: 'down',
    wavePeriod: '10.0',
    energy: '380',
    energyTrend: 'down',
    windSpeed: '16',
    windDirection: 240,
  },
]

describe('ForecastSnapshotTable', () => {
  it('renders key metric row labels', () => {
    render(
      <ForecastSnapshotTable
        snapshotItems={items}
        activeSnapshotLabel='Ahora'
        onSelectSnapshotLabel={() => {}}
      />,
    )

    expect(screen.getByText('Métrica')).toBeInTheDocument()
    expect(screen.getByText('Altura (m)')).toBeInTheDocument()
    expect(screen.getByText('Periodo (s)')).toBeInTheDocument()
    expect(screen.getByText('Viento (km/h)')).toBeInTheDocument()
  })

  it('emits selection when clicking snapshot header button', async () => {
    const user = userEvent.setup()
    const onSelectSnapshotLabel = vi.fn()

    render(
      <ForecastSnapshotTable
        snapshotItems={items}
        activeSnapshotLabel='Ahora'
        onSelectSnapshotLabel={onSelectSnapshotLabel}
      />,
    )

    await user.click(screen.getByRole('button', { name: /\+6h/i }))
    expect(onSelectSnapshotLabel).toHaveBeenCalledWith('+6h')
  })
})
