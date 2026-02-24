import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MapStatusPanel } from '../MapStatusPanel'

describe('MapStatusPanel', () => {
  it('renders loading message', () => {
    render(
      <MapStatusPanel visible loading status='loading' stats={['Boyas: 1']} />,
    )

    expect(screen.getByText('Cargando mapa…')).toBeInTheDocument()
  })

  it('renders error message', () => {
    render(
      <MapStatusPanel
        visible
        loading={false}
        status='error'
        stats={['Boyas: 1']}
      />,
    )

    expect(
      screen.getByText('Error al cargar datos del mapa'),
    ).toBeInTheDocument()
  })

  it('renders stats when ready', () => {
    render(
      <MapStatusPanel
        visible
        loading={false}
        status='ready'
        stats={['Boyas: 3', 'Spots activos: 2']}
      />,
    )

    expect(screen.getByText('Boyas: 3')).toBeInTheDocument()
    expect(screen.getByText('Spots activos: 2')).toBeInTheDocument()
  })

  it('renders nothing when hidden', () => {
    const { container } = render(
      <MapStatusPanel
        visible={false}
        loading={false}
        status='ready'
        stats={['Boyas: 3']}
      />,
    )

    expect(container.firstChild).toBeNull()
  })
})
