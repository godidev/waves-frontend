export const CHART_THEME = {
  axisStroke: '#64748b',
  axisFontSize: 10,
  gridStroke: '#64748b',
  gridOpacity: 0.25,
  gridDasharray: '4 4',
  daySeparatorStroke: '#64748b',
  daySeparatorDasharray: '3 3',
  daySeparatorWidth: 1.5,
  daySeparatorOpacity: 0.45,
  dayLabelColor: '#475569',
  dayLabelFontSize: 14,
  nowMarkerStroke: '#0284c7',
  nowMarkerLabelColor: '#0369a1',
  nowMarkerWidth: 3,
  nowMarkerOpacity: 0.9,
  futureAreaFill: '#0ea5e9',
  futureAreaOpacity: 0.1,
  baselineStroke: '#94a3b8',
  baselineWidth: 1,
  tooltipBackground: '#ffffff',
  tooltipBorder: '#e2e8f0',
  tooltipRadius: 12,
} as const

export const CHART_LAYOUT = {
  forecastHeightClass: 'h-80',
  buoyHeightClass: 'h-60 min-h-[236px]',
  leftAxisWidth: 42,
  forecastRightAxisWidth: 35,
  buoyRightAxisWidth: 42,
  rightAxisTickCount: 5,
  buoyLeftAxisTickCount: 6,
} as const

export const CHART_SERIES_COLORS = {
  height: '#38bdf8',
  energy: '#fbbf24',
  period: '#fbbf24',
  wavePeriod: '#22c55e',
  windSpeed: '#3b82f6',
  windDirection: '#0284c7',
} as const
