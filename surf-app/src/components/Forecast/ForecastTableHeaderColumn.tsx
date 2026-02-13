import { ForecastTableItem } from './ForecastTableItem'

export const ForecastTableHeaderColumn = () => (
  <div
    data-sticky-header
    className='sticky left-0 z-10 flex flex-col border-r border-slate-200 bg-slate-50 pt-2 dark:border-slate-700 dark:bg-slate-800'
  >
    <ForecastTableItem value='Hora' />
    <ForecastTableItem value='Altura' />
    <ForecastTableItem value='Periodo' />
    <ForecastTableItem value='Viento' />
    <ForecastTableItem value='Energia' />
  </div>
)
