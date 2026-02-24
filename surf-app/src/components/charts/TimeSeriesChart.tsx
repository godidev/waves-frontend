import { useEffect, useMemo, useRef, useState, type ReactElement } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CHART_THEME } from './chartTheme'
import { formatHour } from '../../utils/time'

interface AxisConfig {
  width: number
  tickCount?: number
  ticks?: number[]
  interval?: number | 'preserveStart' | 'preserveEnd' | 'preserveStartEnd'
  padding?: {
    top?: number
    bottom?: number
  }
  domain?: [
    number | 'auto' | 'dataMin' | 'dataMax' | ((value: number) => number),
    number | 'auto' | 'dataMin' | 'dataMax' | ((value: number) => number),
  ]
  tickFormatter: (value: number, index?: number) => string
  allowDecimals?: boolean
}

interface SeriesConfig {
  dataKey: string
  yAxisId: 'left' | 'right'
  name: string
  stroke: string
  dashed?: boolean
  hidden?: boolean
  strokeWidth?: number
}

interface LegendItem {
  label: string
  color: string
  dashed?: boolean
}

interface TimeSeriesChartProps {
  data: Array<{ time: number } & Record<string, number>>
  locale: string
  series: SeriesConfig[]
  leftAxis: AxisConfig
  rightAxis: AxisConfig
  legendItems?: LegendItem[]
  tooltipContent?: ReactElement
  chartHeightClass?: string
  showXAxisTicks?: boolean
  xAxisTickCount?: number
  xAxisMinTickGap?: number
  xAxisTickFormatter?: (value: number, locale: string) => string
  tooltipLabelFormatter?: (value: number, locale: string) => string
  chartMargin?: {
    top?: number
    right?: number
    left?: number
    bottom?: number
  }
  showDaySeparators?: boolean
  showDayLabels?: boolean
  showNowMarker?: boolean
  showFutureArea?: boolean
  baselineLabel?: string
  minHoursForDayLabel?: number
  dayLabelFormatter?: (date: Date, locale: string) => string
  dayLabelDx?: number
  selectedTimeMarker?: {
    time: number
    label?: string
  }
}

export const TimeSeriesChart = ({
  data,
  locale,
  series,
  leftAxis,
  rightAxis,
  legendItems = [],
  tooltipContent,
  chartHeightClass = 'h-80',
  showXAxisTicks = false,
  xAxisTickCount,
  xAxisMinTickGap = 28,
  xAxisTickFormatter = (value, currentLocale) =>
    formatHour(new Date(value).toISOString(), currentLocale),
  tooltipLabelFormatter = (value, currentLocale) =>
    formatHour(new Date(value).toISOString(), currentLocale),
  chartMargin = { top: 0, right: 0, left: -8, bottom: -12 },
  showDaySeparators = true,
  showDayLabels = true,
  showNowMarker = false,
  showFutureArea = false,
  baselineLabel,
  minHoursForDayLabel = 12,
  dayLabelFormatter = (date, currentLocale) =>
    date.toLocaleDateString(currentLocale, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }),
  dayLabelDx = 0,
  selectedTimeMarker,
}: TimeSeriesChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (!containerRef.current) return

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return

      const width = Math.floor(entry.contentRect.width)
      const height = Math.floor(entry.contentRect.height)

      setContainerSize({ width, height })
    })

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  const dayRanges = useMemo(() => {
    const ranges: Array<{ x1: number; x2: number; label: string }> = []
    if (!showDayLabels || !data.length) return ranges

    let rangeStartIndex = 0

    for (let index = 1; index <= data.length; index += 1) {
      const reachedEnd = index === data.length
      const currentDay = reachedEnd
        ? ''
        : new Date(data[index].time).toDateString()
      const startDay = new Date(data[rangeStartIndex].time).toDateString()

      if (reachedEnd || currentDay !== startDay) {
        const x1 = data[rangeStartIndex].time
        const x2 = data[index - 1].time
        const visibleHoursInRange = Math.max(
          1,
          Math.round((x2 - x1) / (60 * 60 * 1000)) + 1,
        )
        const startDate = new Date(x1)

        if (visibleHoursInRange >= minHoursForDayLabel) {
          ranges.push({
            x1,
            x2,
            label: dayLabelFormatter(startDate, locale),
          })
        }

        rangeStartIndex = index
      }
    }

    return ranges
  }, [data, dayLabelFormatter, locale, minHoursForDayLabel, showDayLabels])

  const dayChanges = useMemo(() => {
    const changes: number[] = []
    if (!showDaySeparators || data.length < 2) return changes

    let lastDay = ''
    data.forEach((point) => {
      const currentDay = new Date(point.time).toDateString()
      if (lastDay && lastDay !== currentDay) {
        changes.push(point.time)
      }
      lastDay = currentDay
    })

    return changes
  }, [data, showDaySeparators])

  const closestToNow = useMemo(() => {
    if (!showNowMarker || !data.length) return null
    const now = Date.now()

    return data.reduce(
      (closest, point) => {
        if (closest === null) return point.time
        const currentDiff = Math.abs(point.time - now)
        const closestDiff = Math.abs(closest - now)
        return currentDiff < closestDiff ? point.time : closest
      },
      null as number | null,
    )
  }, [data, showNowMarker])

  const lastTime = data.at(-1)?.time
  const canRenderChart = containerSize.width > 0 && containerSize.height > 0
  const baselineY =
    typeof leftAxis.domain?.[0] === 'number' ? leftAxis.domain[0] : 0
  const isSelectedMarkerOnNow =
    Boolean(showNowMarker) &&
    closestToNow !== null &&
    selectedTimeMarker !== undefined &&
    selectedTimeMarker.time === closestToNow

  return (
    <div className='space-y-2 rounded-2xl py-2'>
      {legendItems.length > 0 && (
        <div className='flex items-center justify-center gap-4 px-2 text-[11px] font-medium text-slate-600 dark:text-slate-300'>
          {legendItems.map((item) => (
            <span key={item.label} className='inline-flex items-center gap-1.5'>
              <span
                className='h-2 w-2 rounded-full'
                style={{
                  backgroundColor: item.dashed ? 'transparent' : item.color,
                  borderTop: item.dashed
                    ? `2px dashed ${item.color}`
                    : undefined,
                  width: item.dashed ? '14px' : '8px',
                  borderRadius: item.dashed ? 0 : '9999px',
                }}
                aria-hidden='true'
              />
              {item.label}
            </span>
          ))}
        </div>
      )}

      <div ref={containerRef} className={`${chartHeightClass} w-full min-w-0`}>
        {canRenderChart && (
          <LineChart
            width={containerSize.width}
            height={containerSize.height}
            data={data}
            accessibilityLayer={false}
            tabIndex={-1}
            margin={chartMargin}
          >
            <CartesianGrid
              yAxisId='left'
              vertical={false}
              stroke={CHART_THEME.gridStroke}
              opacity={CHART_THEME.gridOpacity}
              strokeDasharray={CHART_THEME.gridDasharray}
            />
            <XAxis
              dataKey='time'
              type='number'
              scale='time'
              domain={['dataMin', 'dataMax']}
              stroke={CHART_THEME.axisStroke}
              opacity={showXAxisTicks ? 1 : 0}
              tickCount={xAxisTickCount}
              minTickGap={xAxisMinTickGap}
              tickFormatter={(value) =>
                xAxisTickFormatter(Number(value), locale)
              }
            />
            <YAxis
              yAxisId='left'
              stroke={CHART_THEME.axisStroke}
              fontSize={CHART_THEME.axisFontSize}
              width={leftAxis.width}
              tickCount={leftAxis.tickCount}
              ticks={leftAxis.ticks}
              interval={leftAxis.interval}
              padding={leftAxis.padding}
              domain={leftAxis.domain}
              allowDecimals={leftAxis.allowDecimals}
              tickFormatter={leftAxis.tickFormatter}
            />
            <YAxis
              yAxisId='right'
              orientation='right'
              stroke={CHART_THEME.axisStroke}
              fontSize={CHART_THEME.axisFontSize}
              width={rightAxis.width}
              tickCount={rightAxis.tickCount}
              ticks={rightAxis.ticks}
              interval={rightAxis.interval}
              padding={rightAxis.padding}
              domain={rightAxis.domain}
              allowDecimals={rightAxis.allowDecimals}
              tickFormatter={rightAxis.tickFormatter}
            />
            <Tooltip
              content={tooltipContent}
              cursor={false}
              contentStyle={{
                backgroundColor: CHART_THEME.tooltipBackground,
                border: `1px solid ${CHART_THEME.tooltipBorder}`,
                borderRadius: `${CHART_THEME.tooltipRadius}px`,
              }}
              labelFormatter={(value) =>
                tooltipLabelFormatter(Number(value), locale)
              }
            />

            {showFutureArea && closestToNow && lastTime && (
              <ReferenceArea
                x1={closestToNow}
                x2={lastTime}
                yAxisId='left'
                pointerEvents='none'
                strokeOpacity={0}
                fill={CHART_THEME.futureAreaFill}
                fillOpacity={CHART_THEME.futureAreaOpacity}
              />
            )}

            {dayRanges.map((range) => (
              <ReferenceArea
                key={`day-label-${range.x1}-${range.x2}`}
                x1={range.x1}
                x2={range.x2}
                yAxisId='left'
                pointerEvents='none'
                strokeOpacity={0}
                fillOpacity={0}
                label={{
                  value: range.label,
                  position: 'insideBottom',
                  fill: CHART_THEME.dayLabelColor,
                  fontSize: CHART_THEME.dayLabelFontSize,
                  dx: dayLabelDx,
                  dy: 20,
                }}
              />
            ))}

            {dayChanges.map((time) => (
              <ReferenceLine
                key={`day-${time}`}
                x={time}
                yAxisId='left'
                stroke={CHART_THEME.daySeparatorStroke}
                strokeDasharray={CHART_THEME.daySeparatorDasharray}
                strokeWidth={CHART_THEME.daySeparatorWidth}
                opacity={CHART_THEME.daySeparatorOpacity}
              />
            ))}

            {showNowMarker && closestToNow && (
              <ReferenceLine
                x={closestToNow}
                yAxisId='left'
                stroke={CHART_THEME.nowMarkerStroke}
                strokeWidth={CHART_THEME.nowMarkerWidth}
                strokeOpacity={CHART_THEME.nowMarkerOpacity}
                label={{
                  value: 'Ahora',
                  position: 'insideTopLeft',
                  fill: CHART_THEME.nowMarkerLabelColor,
                  fontSize: 11,
                  fontWeight: 'bold',
                }}
              />
            )}

            {selectedTimeMarker && (
              <ReferenceLine
                x={selectedTimeMarker.time}
                yAxisId='left'
                stroke={CHART_THEME.selectedMarkerStroke}
                strokeWidth={CHART_THEME.selectedMarkerWidth}
                strokeOpacity={CHART_THEME.selectedMarkerOpacity}
                strokeDasharray='4 4'
                label={
                  selectedTimeMarker.label && !isSelectedMarkerOnNow
                    ? {
                        value: selectedTimeMarker.label,
                        position: 'insideTopRight',
                        fill: CHART_THEME.nowMarkerLabelColor,
                        fontSize: 10,
                        fontWeight: 600,
                      }
                    : undefined
                }
              />
            )}

            <ReferenceLine
              y={baselineY}
              yAxisId='left'
              stroke={CHART_THEME.baselineStroke}
              strokeWidth={CHART_THEME.baselineWidth}
              label={
                baselineLabel
                  ? {
                      value: baselineLabel,
                      position: 'left',
                      fill: CHART_THEME.axisStroke,
                      fontSize: CHART_THEME.axisFontSize,
                    }
                  : undefined
              }
            />

            {series.map((item) => (
              <Line
                key={item.dataKey}
                yAxisId={item.yAxisId}
                type='natural'
                dataKey={item.dataKey}
                stroke={item.hidden ? 'transparent' : item.stroke}
                strokeWidth={item.strokeWidth ?? 2}
                dot={false}
                activeDot={item.hidden ? false : { r: 4 }}
                name={item.name}
                strokeDasharray={item.dashed ? '5 5' : undefined}
                isAnimationActive={!item.hidden}
              />
            ))}
          </LineChart>
        )}
      </div>
    </div>
  )
}
