import { ForecastTableItem } from './ForecastTableItem'

export const ForecastTableHeaderColumn = () => (
  <div
    data-sticky-header
    className='sticky left-0 z-10 flex flex-col border-r border-white/10 bg-ocean-800 pt-2'
  >
    <ForecastTableItem value='Hora' />
    <ForecastTableItem value='Altura' />
    <ForecastTableItem value='Periodo' />
    <ForecastTableItem value='Viento' />
    <ForecastTableItem value='Energia' />
  </div>
)
