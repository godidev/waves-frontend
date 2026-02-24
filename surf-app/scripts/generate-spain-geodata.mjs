import { writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'

const SPAIN_COAST_BBOX = {
  minLng: -19,
  maxLng: 6,
  minLat: 26,
  maxLat: 45,
}

const outputDirectory = path.resolve(process.cwd(), 'src/data')

const intersectsBbox = (coordinates) => {
  for (const [lng, lat] of coordinates) {
    if (
      lng >= SPAIN_COAST_BBOX.minLng &&
      lng <= SPAIN_COAST_BBOX.maxLng &&
      lat >= SPAIN_COAST_BBOX.minLat &&
      lat <= SPAIN_COAST_BBOX.maxLat
    ) {
      return true
    }
  }
  return false
}

const fetchJson = async (url) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`)
  }
  return response.json()
}

const run = async () => {
  const countries = await fetchJson(
    'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson',
  )

  const spainFeature = countries.features.find(
    (feature) => feature.properties?.['ISO3166-1-Alpha-3'] === 'ESP',
  )

  if (!spainFeature) {
    throw new Error('Spain feature not found')
  }

  const coastlines = await fetchJson(
    'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_coastline.geojson',
  )

  const filteredCoastFeatures = coastlines.features.filter((feature) => {
    if (feature.geometry?.type !== 'LineString') return false
    return intersectsBbox(feature.geometry.coordinates)
  })

  const spainLandGeoJson = {
    type: 'Feature',
    properties: {
      name: 'Spain',
      source: 'datasets/geo-countries',
    },
    geometry: spainFeature.geometry,
  }

  const spainCoastlineGeoJson = {
    type: 'Feature',
    properties: {
      name: 'Spain nearby coastline',
      source: 'natural-earth ne_10m_coastline',
    },
    geometry: {
      type: 'MultiLineString',
      coordinates: filteredCoastFeatures.map((feature) =>
        feature.geometry.coordinates,
      ),
    },
  }

  await mkdir(outputDirectory, { recursive: true })

  await writeFile(
    path.join(outputDirectory, 'spainLand.geo.json'),
    JSON.stringify(spainLandGeoJson),
    'utf8',
  )

  await writeFile(
    path.join(outputDirectory, 'spainCoastline.geo.json'),
    JSON.stringify(spainCoastlineGeoJson),
    'utf8',
  )

  console.log(
    `Generated geodata: ${filteredCoastFeatures.length} coastline segments`,
  )
}

void run()
