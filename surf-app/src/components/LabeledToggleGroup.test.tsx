import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { LabeledToggleGroup } from './LabeledToggleGroup'

describe('LabeledToggleGroup', () => {
  it('renders label and options', () => {
    render(
      <LabeledToggleGroup
        ariaLabel='Vista'
        label='Tipo'
        value='chart'
        options={[
          { label: 'Gráfico', value: 'chart' },
          { label: 'Tabla', value: 'table' },
        ]}
        onChange={() => {}}
      />,
    )

    expect(screen.getByText('Tipo')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Gráfico' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tabla' })).toBeInTheDocument()
  })

  it('calls onChange with selected value', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <LabeledToggleGroup
        ariaLabel='Rango'
        label='Tiempo'
        value='48h'
        options={[
          { label: '48h', value: '48h' },
          { label: '7d', value: '7d' },
        ]}
        onChange={onChange}
      />,
    )

    await user.click(screen.getByRole('button', { name: '7d' }))

    expect(onChange).toHaveBeenCalledWith('7d')
  })
})
