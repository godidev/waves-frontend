import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AppErrorBoundary } from '../AppErrorBoundary'

const Crash = ({ shouldCrash }: { shouldCrash: boolean }) => {
  if (shouldCrash) {
    throw new Error('boom')
  }
  return <div>ok</div>
}

describe('AppErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('renders fallback UI when children throw', () => {
    render(
      <AppErrorBoundary>
        <Crash shouldCrash />
      </AppErrorBoundary>,
    )

    expect(
      screen.getByText('Ha ocurrido un error inesperado.'),
    ).toBeInTheDocument()
  })

  it('renders children when there is no crash', () => {
    render(
      <AppErrorBoundary>
        <Crash shouldCrash={false} />
      </AppErrorBoundary>,
    )

    expect(screen.getByText('ok')).toBeInTheDocument()
  })

  it('exposes reload action from fallback', async () => {
    const user = userEvent.setup()
    const reloadSpy = vi.fn()
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        reload: reloadSpy,
      },
    })

    render(
      <AppErrorBoundary>
        <Crash shouldCrash />
      </AppErrorBoundary>,
    )

    await user.click(screen.getByRole('button', { name: 'Recargar app' }))
    expect(reloadSpy).toHaveBeenCalledTimes(1)
  })
})
