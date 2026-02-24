import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { ForecastChartPoint } from '../forecastSnapshots'
import { ForecastWindBands } from '../ForecastWindBands'

const points: ForecastChartPoint[] = [
  {
    time: 1,
    waveHeight: 1.2,
    energy: 400,
    wavePeriod: 10,
    windSpeed: 12,
    windDirection: 220,
  },
  {
    time: 2,
    waveHeight: 1.5,
    energy: 520,
    wavePeriod: 12,
    windSpeed: 14,
    windDirection: 250,
  },
]

describe('ForecastWindBands', () => {
  it('always renders viento label and arrows row', () => {
    render(
      <ForecastWindBands
        chartData={points}
        chartContentPadding={{ paddingLeft: '0px', paddingRight: '0px' }}
        showWindColorBar={false}
        showPeriodColorBar={false}
        getWindToneStyle={() => ({ backgroundColor: 'red' })}
        getPeriodToneStyle={() => ({ backgroundColor: 'blue' })}
      />,
    )

    expect(screen.getByText('Viento')).toBeInTheDocument()
    expect(screen.queryByText('Periodo')).not.toBeInTheDocument()
  })

  it('renders period block only when enabled', () => {
    render(
      <ForecastWindBands
        chartData={points}
        chartContentPadding={{ paddingLeft: '0px', paddingRight: '0px' }}
        showWindColorBar
        showPeriodColorBar
        getWindToneStyle={() => ({ backgroundColor: 'red' })}
        getPeriodToneStyle={() => ({ backgroundColor: 'blue' })}
      />,
    )

    expect(screen.getByText('Periodo')).toBeInTheDocument()
  })
})
