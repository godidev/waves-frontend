import { useEffect, useState } from 'react'
import QuantitySelector from '../components/QuantitySelector'
import { SurfForecast } from '../types'
import TableCell from '../components/TableCell'
import TableHeaderCell from '../components/TableHeaderCell'
import { divideDays, formatHourAndMinutes } from '../utils/buoyHelpers'
import TableHeaderSurfForecast from '../components/surfForecast/TableHeaderSurfForecast'
const apiUrl = import.meta.env.VITE_API_URL as string

export default function SurfForecastPage() {
  const [displayQuantity, setDisplayQuantity] = useState(8)
  const [surfForecasts, setSurfForecasts] = useState<{
    [day: string]: SurfForecast[]
  }>({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `${apiUrl}surf-forecast?limit=${displayQuantity}`,
        )
        if (!res.ok) throw new Error('Failed to fetch surfForecasts')
        const data: SurfForecast[] = await res.json()
        const processedData = divideDays(data)

        setSurfForecasts((prev) => ({ ...prev, ...processedData }))
      } catch (error) {
        console.error('Error fetching surfForecasts:', error)
      }
    }

    fetchData()
  }, [displayQuantity])

  return (
    <div className='px-0.5 text-center'>
      <h2 className='bg-amber-100 text-xl font-medium uppercase'>
        Surf Forecast
      </h2>
      <QuantitySelector
        displayQuantity={displayQuantity}
        setDisplayQuantity={setDisplayQuantity}
      />
      <div className='mx-auto flex flex-col gap-2 overflow-y-auto rounded-sm border-3 border-black bg-white text-sm text-black md:w-3/4 lg:w-1/2 xl:w-1/3'>
        {Object.keys(surfForecasts || {}).map((day, index) => (
          <div key={day}>
            <TableHeaderSurfForecast index={index} day={day} />
            {surfForecasts[day].map(
              ({
                date,
                height,
                period,
                waveDirection,
                windSpeed,
                windAngle,
                windLetters,
                energy,
              }) => (
                <div
                  key={new Date(date).toISOString()}
                  className={`flex w-full items-baseline justify-around even:bg-gray-200`}
                >
                  <TableHeaderCell border='r'>
                    {formatHourAndMinutes(date)}
                  </TableHeaderCell>

                  <TableCell data={height} identifier='m' />

                  <TableCell data={period} identifier='s' />

                  <TableCell data={waveDirection} identifier='°' icon='↘' />
                  <TableCell data={windSpeed} identifier='m/s' />
                  <TableCell data={windAngle} identifier='°' icon='↘' />
                  <TableCell data={windLetters} identifier='°' icon='↘' />
                  <TableCell data={energy} identifier='°' icon='↘' />
                </div>
              ),
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
