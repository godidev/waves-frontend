import { DirectionArrow } from '../Icons'
import type { ForecastChartPoint } from './forecastSnapshots'

interface ForecastWindBandsProps {
  chartData: ForecastChartPoint[]
  chartContentPadding: {
    paddingLeft: string
    paddingRight: string
  }
  showWindColorBar: boolean
  showPeriodColorBar: boolean
  getWindToneStyle: (angle: number) => { backgroundColor: string }
  getPeriodToneStyle: (period: number) => { backgroundColor: string }
}

export const ForecastWindBands = ({
  chartData,
  chartContentPadding,
  showWindColorBar,
  showPeriodColorBar,
  getWindToneStyle,
  getPeriodToneStyle,
}: ForecastWindBandsProps) => {
  return (
    <div className='pt-1'>
      <div>
        <p className='mb-0.5 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-300'>
          Viento
        </p>
        <div style={chartContentPadding}>
          <div
            className='grid w-full items-center text-center'
            style={{
              gridTemplateColumns: `repeat(${Math.max(chartData.length, 1)}, minmax(0, 1fr))`,
            }}
          >
            {chartData.map((point) => (
              <span
                key={`wind-arrow-${point.time}`}
                className='inline-flex h-3.5 w-full items-center justify-center'
              >
                <DirectionArrow
                  className='h-2.5 w-2.5 text-sky-600'
                  degrees={point.windDirection}
                />
              </span>
            ))}
          </div>
        </div>
      </div>

      {showWindColorBar && (
        <div>
          <div style={chartContentPadding}>
            <div className='flex h-2 w-full overflow-hidden rounded-full'>
              {chartData.map((point) => (
                <span
                  key={`wind-${point.time}`}
                  className='h-full flex-1'
                  style={getWindToneStyle(point.windDirection)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {showPeriodColorBar && (
        <div className='mt-1.5'>
          <p className='mb-0.5 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-300'>
            Periodo
          </p>
          <div style={chartContentPadding}>
            <div className='flex h-2 w-full overflow-hidden rounded-full'>
              {chartData.map((point) => (
                <span
                  key={`period-${point.time}`}
                  className='h-full flex-1'
                  style={getPeriodToneStyle(point.wavePeriod)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
