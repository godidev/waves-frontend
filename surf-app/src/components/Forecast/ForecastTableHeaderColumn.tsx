import { ForecastTableItem } from './ForecastTableItem'

export const ForecastTableHeaderColumn = () => (
  <div className='flex flex-col border-r border-white/10 pt-2'>
    <ForecastTableItem value='Date' />
    <ForecastTableItem value='Altura' />
    <ForecastTableItem value='Periodo' />
    <ForecastTableItem value='Viento' />
    <ForecastTableItem value='Energía' />
  </div>
)
