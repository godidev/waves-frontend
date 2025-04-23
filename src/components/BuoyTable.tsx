import { useEffect, useState } from 'react'
import { Buoy, BuoyData, station } from '../types'
import TableCell from './TableCell'
import {
  divideDays,
  formatHourAndMinutes,
  getGridColsClass,
} from '../utils/buoyHelpers'

const apiUrl = import.meta.env.VITE_API_URL as string

export default function BuoyTable() {
  const [stations, setStations] = useState<station[]>([])
  const [selectedStation, setSelectedStation] = useState('7113')
  const [buoys, setBuoys] = useState<BuoyData>({})

  useEffect(() => {
    const fetchData = async () => {
      if (buoys[selectedStation]) {
        console.log('data already cached')
        return
      }
      try {
        const res = await fetch(`${apiUrl}buoys?limit=15&buoy=${selectedStation}`)
        if (!res.ok) throw new Error('Failed to fetch buoys')
        const data: Buoy[] = await res.json()
        const processedData = divideDays(data.reverse())

        setBuoys((prev) => ({ ...prev, [selectedStation]: processedData }))
      } catch (error) {
        console.error('Error fetching buoys:', error)
      }
    }

    if (selectedStation) {
      fetchData()
    }
  }, [selectedStation, buoys])

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
    <div className='text-center'>
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
      <div className='mx-auto mt-1 w-full rounded-sm border-3 border-black bg-green-900 p-1 text-white md:w-3/4 lg:w-1/2 xl:w-1/3'>
        {Object.keys(buoys[selectedStation] || {}).map((day) => (
          <div key={day}>
            <div
              className={`grid ${getGridColsClass(buoys[selectedStation][day].length)}`}
            >
              <div className={`text-center text-[12px] font-medium`}>
                <p className='border-b-2 p-0.5 text-center'>{day}</p>
                <p className={`p-0.5 sticky`}>Altura</p>
                <p className={`p-0.5 sticky`}>Periodo</p>
                <p className={`p-0.5 sticky`}>tm02</p>
                <p className={`p-0.5 sticky`}>Dir. media</p>
                <p className={`p-0.5 sticky`}>Dir. pico</p>
              </div>
              {buoys[selectedStation][day].map(
                ({
                  avgDirection,
                  date,
                  height,
                  period,
                  tm02,
                  peakDirection,
                }) => (
                  <div
                    key={new Date(date).toISOString()}
                    className={`text-[12px]`}
                  >
                    <TableCell
                      data={formatHourAndMinutes(date)}
                      identifier=''
                    />
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
          </div>
        ))}
      </div>
    </div>
  )
}
