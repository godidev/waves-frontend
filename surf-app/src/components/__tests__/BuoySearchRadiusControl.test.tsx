import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { BuoySearchRadiusControl } from '../BuoySearchRadiusControl'

describe('BuoySearchRadiusControl', () => {
  it('renders current radius value', () => {
    render(
      <BuoySearchRadiusControl
        value={200}
        onChange={() => {}}
        onCommit={() => {}}
      />,
    )

    expect(screen.getByText('200 km')).toBeInTheDocument()
  })

  it('calls onChange and onCommit from slider interactions', () => {
    const onChange = vi.fn()
    const onCommit = vi.fn()

    render(
      <BuoySearchRadiusControl
        value={200}
        onChange={onChange}
        onCommit={onCommit}
      />,
    )

    const slider = screen.getByRole('slider', {
      name: 'Rango de búsqueda de boyas en kilómetros',
    })

    fireEvent.change(slider, { target: { value: '210' } })
    expect(onChange).toHaveBeenCalled()

    fireEvent.blur(slider)
    expect(onCommit).toHaveBeenCalled()
  })
})
