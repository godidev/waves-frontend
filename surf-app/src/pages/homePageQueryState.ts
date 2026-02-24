interface ForecastStatusInput {
  isFetchingMain: boolean
  isFetchingHourly: boolean
  mainHasData: boolean
  hasError: boolean
}

export const deriveForecastStatus = ({
  isFetchingMain,
  isFetchingHourly,
  mainHasData,
  hasError,
}: ForecastStatusInput): 'loading' | 'error' | 'success' => {
  if ((isFetchingMain || isFetchingHourly) && !mainHasData) {
    return 'loading'
  }

  if (hasError && !mainHasData) {
    return 'error'
  }

  return 'success'
}

interface NearbyBuoysStatusInput {
  hasCoordinates: boolean
  isFetching: boolean
  hasError: boolean
}

export const deriveNearbyBuoysStatus = ({
  hasCoordinates,
  isFetching,
  hasError,
}: NearbyBuoysStatusInput): 'idle' | 'loading' | 'error' | 'success' => {
  if (!hasCoordinates) return 'error'
  if (isFetching) return 'loading'
  if (hasError) return 'error'
  return 'success'
}
