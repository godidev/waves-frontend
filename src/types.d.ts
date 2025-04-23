export interface Buoy {
  date: Date
  station: string
  period: number
  height: number
  avgDirection: number
  peakDirection?: number
  tm02: number
}

export interface SurfForecast {
  date: Date
  height: number
  period: number
  waveDirection: number
  windSpeed: number
  windAngle: number
  windLetters: string
  energy: string
}

export interface station {
  name: string
  station: string
}

export interface BuoyData {
  [station:string]: { [date: string]: Buoy[] };
}