import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { SettingsProvider } from '../../context/SettingsContext'
import { SettingsPage } from '../SettingsPage'

const useSpotsQueryMock = vi.fn()
const useStationsQueryMock = vi.fn()

vi.mock('../../hooks/useAppQueries', () => ({
  useSpotsQuery: () => useSpotsQueryMock(),
  useStationsQuery: () => useStationsQueryMock(),
}))

describe('SettingsPage', () => {
  beforeEach(() => {
    window.localStorage.clear()
    useSpotsQueryMock.mockReset()
    useStationsQueryMock.mockReset()
  })

  it('shows only active spots in default spot selector', () => {
    window.localStorage.setItem(
      'surf-settings',
      JSON.stringify({
        theme: 'dark',
        defaultSpotId: 'spot-active-1',
        defaultStationId: '2136',
        buoySearchRadiusKm: 200,
      }),
    )

    useSpotsQueryMock.mockReturnValue({
      data: [
        { spotId: 'spot-active-1', spotName: 'Sopelana', active: true },
        { spotId: 'spot-inactive', spotName: 'Mundaka', active: false },
        { spotId: 'spot-active-2', spotName: 'La Santa', active: true },
      ],
    })
    useStationsQueryMock.mockReturnValue({
      data: [{ buoyId: '2136', name: 'Bilbao-Vizcaya' }],
    })

    render(
      <SettingsProvider>
        <SettingsPage />
      </SettingsProvider>,
    )

    const spotSelect = screen.getByLabelText('Seleccionar spot por defecto')
    const options = within(spotSelect).getAllByRole('option')
    const labels = options.map((option) => option.textContent)

    expect(labels).toContain('Sopelana')
    expect(labels).toContain('La Santa')
    expect(labels).not.toContain('Mundaka')
  })
})
