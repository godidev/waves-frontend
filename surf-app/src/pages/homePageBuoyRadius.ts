export const clampBuoySearchRadiusKm = (value: number): number =>
  Math.min(1000, Math.max(10, Math.round(value)))
