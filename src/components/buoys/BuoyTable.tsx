import { useEffect, useState } from 'react'
import { Buoy, BuoyData, station } from '../../types'
import TableCell from '../TableCell'
import { divideDays, formatHourAndMinutes } from '../../utils/buoyHelpers'
import TableHeader from './TableHeaderBuoys'
import TableHeaderCell from '../TableHeaderCell'
import QuantitySelector from '../QuantitySelector'

const apiUrl = import.meta.env.VITE_API_URL as string

export default function BuoyTable() {
  const [stations, setStations] = useState<station[]>([])
  const [selectedStation, setSelectedStation] = useState('7113')
  const [displayQuantity, setDisplayQuantity] = useState(8)
  const [buoys, setBuoys] = useState<BuoyData>({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `${apiUrl}buoys?limit=${displayQuantity}&buoy=${selectedStation}`,
        )
        if (!res.ok) throw new Error('Failed to fetch buoys')
        const data: Buoy[] = await res.json()
        const processedData = divideDays(data)

        setBuoys((prev) => ({ ...prev, [selectedStation]: processedData }))
      } catch (error) {
        console.error('Error fetching buoys:', error)
      }
    }

    if (selectedStation) {
      fetchData()
    }
  }, [selectedStation, displayQuantity])

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const res = await fetch(`${apiUrl}stations`)
        if (!res.ok) throw new Error('Failed to fetch stations')

        const data: station[] = await res.json()
        setStations(data)
      } catch (error) {
        console.error('Error fetching stations:', error)
      }
    }

    fetchStations()
  }, [])

  return (
    <div className='px-0.5 text-center'>
      <h2 className='bg-amber-100 text-xl font-medium uppercase'>buoys</h2>
      <select
        className='bg-green-100 text-center font-medium uppercase hover:bg-green-200'
        name='buoys'
        id='buoys'
        onChange={({ target }) => setSelectedStation(target.value)}
      >
        {stations?.map((station) => {
          return (
            <option key={station.name} value={station.station}>
              {station.name}
            </option>
          )
        })}
      </select>
      <QuantitySelector
        displayQuantity={displayQuantity}
        setDisplayQuantity={setDisplayQuantity}
      />
      <div className='mx-auto flex flex-col gap-2 overflow-y-auto rounded-sm border-3 border-black bg-white text-sm text-black md:w-3/4 lg:w-1/2 xl:w-1/3'>
        {Object.keys(buoys[selectedStation] || {}).map((day, index) => (
          <div key={day}>
            <TableHeader index={index} day={day} />
            {buoys[selectedStation][day].map(
              ({ avgDirection, date, height, period, tm02, peakDirection }) => (
                <div
                  key={new Date(date).toISOString()}
                  className={`flex w-full items-baseline justify-around even:bg-gray-200`}
                >
                  <TableHeaderCell border='r'>
                    {formatHourAndMinutes(date)}
                  </TableHeaderCell>

                  <TableCell data={height} identifier='m' />

                  <TableCell data={period} identifier='s' />

                  <TableCell data={tm02} identifier='s' />
                  <TableCell data={avgDirection} identifier='°' icon='↘' />
                  {!peakDirection ||
                    (peakDirection > 0 && (
                      <TableCell
                        data={peakDirection}
                        identifier='°'
                        icon='↘'
                      />
                    ))}
                </div>
              ),
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
