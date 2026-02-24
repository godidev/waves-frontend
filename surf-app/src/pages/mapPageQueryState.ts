interface MapLoadingInput {
  isBuoysLoading: boolean
  isSpotsLoading: boolean
  hasBuoysError?: boolean
  hasSpotsError?: boolean
  buoysCount: number
  spotsCount: number
}

export const deriveMapLoadingState = ({
  isBuoysLoading,
  isSpotsLoading,
  buoysCount,
  spotsCount,
}: MapLoadingInput): boolean => {
  const buoysPending = isBuoysLoading && buoysCount === 0
  const spotsPending = isSpotsLoading && spotsCount === 0
  return buoysPending || spotsPending
}

export const deriveMapStatus = ({
  isBuoysLoading,
  isSpotsLoading,
  hasBuoysError = false,
  hasSpotsError = false,
  buoysCount,
  spotsCount,
}: MapLoadingInput): 'loading' | 'error' | 'ready' => {
  const isLoading = deriveMapLoadingState({
    isBuoysLoading,
    isSpotsLoading,
    buoysCount,
    spotsCount,
  })

  if (isLoading) return 'loading'
  if (hasBuoysError && hasSpotsError && buoysCount === 0 && spotsCount === 0) {
    return 'error'
  }

  return 'ready'
}
