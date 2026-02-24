import { beforeEach, describe, expect, it } from 'vitest'
import { defaultSettings, getSettings, saveSettings } from '../storage'

describe('storage settings', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('returns defaults when there is no stored value', () => {
    expect(getSettings()).toEqual(defaultSettings)
  })

  it('persists and restores settings', () => {
    const next = {
      ...defaultSettings,
      theme: 'light' as const,
      defaultSpotId: 'test-spot',
      defaultStationId: '9999',
      buoySearchRadiusKm: 350,
    }

    saveSettings(next)

    expect(getSettings()).toEqual(next)
  })
})
