interface MapLoadingInput {
  isBuoysLoading: boolean
  isSpotsLoading: boolean
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
