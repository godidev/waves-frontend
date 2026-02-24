import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { SettingsProvider, useSettingsContext } from '../SettingsContext'

const ThemeToggleProbe = () => {
  const { settings, updateSettings } = useSettingsContext()

  return (
    <button
      type='button'
      onClick={() => updateSettings({ theme: 'light' })}
      aria-label='set-light-theme'
    >
      {settings.theme}
    </button>
  )
}

describe('SettingsContext', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('updates theme and syncs document class', async () => {
    const user = userEvent.setup()

    render(
      <SettingsProvider>
        <ThemeToggleProbe />
      </SettingsProvider>,
    )

    expect(document.documentElement.classList.contains('dark')).toBe(true)

    await user.click(screen.getByRole('button', { name: 'set-light-theme' }))

    expect(
      screen.getByRole('button', { name: 'set-light-theme' }),
    ).toHaveTextContent('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
