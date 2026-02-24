import type { Spot } from '../types'

const DIACRITICS_REGEX = /[\u0300-\u036f]/g
const SEARCH_STOP_WORDS = new Set([
  'playa',
  'de',
  'del',
  'la',
  'el',
  'los',
  'las',
])
const MAX_DRAFT_SUGGESTIONS = 8

const normalizeText = (value: string): string =>
  value
    .toLocaleLowerCase('es-ES')
    .normalize('NFD')
    .replace(DIACRITICS_REGEX, '')
    .trim()

const tokenizeNormalized = (value: string): string[] =>
  value
    .split(/\s+/)
    .filter((token) => token.length > 0 && !SEARCH_STOP_WORDS.has(token))

const isSubsequence = (needle: string, haystack: string): boolean => {
  if (!needle) return true
  let index = 0
  for (const char of haystack) {
    if (char === needle[index]) index += 1
    if (index === needle.length) return true
  }
  return false
}

const getSpotSearchScore = (query: string, spotName: string): number => {
  const normalizedQuery = normalizeText(query)
  const normalizedName = normalizeText(spotName)
  if (!normalizedQuery) return 1

  let score = 0
  if (normalizedName === normalizedQuery) score += 120
  if (normalizedName.startsWith(normalizedQuery)) score += 90
  if (normalizedName.includes(normalizedQuery)) score += 65

  const queryTokens = tokenizeNormalized(normalizedQuery)
  const nameTokens = tokenizeNormalized(normalizedName)

  if (
    queryTokens.length > 0 &&
    queryTokens.every((token) =>
      nameTokens.some((nameToken) => nameToken === token),
    )
  ) {
    score += 55
  }

  if (
    queryTokens.length > 0 &&
    queryTokens.every((token) =>
      nameTokens.some((nameToken) => nameToken.startsWith(token)),
    )
  ) {
    score += 35
  }

  if (isSubsequence(normalizedQuery, normalizedName)) score += 12

  return score
}

export const getActiveSpotsWithCoordinates = (spots: Spot[]): Spot[] =>
  spots.filter(
    (spot) =>
      spot.active === true &&
      spot.location?.coordinates &&
      spot.location.coordinates.length === 2,
  )

export const getInactiveSpotsSorted = (spots: Spot[]): Spot[] =>
  spots
    .filter((spot) => spot.active !== true)
    .sort((a, b) => a.spotName.localeCompare(b.spotName, 'es-ES'))

export const getInactiveSpotsWithCoordinates = (spots: Spot[]): Spot[] =>
  spots.filter((spot) => {
    if (spot.active === true) return false
    const coordinates = spot.location?.coordinates
    if (!coordinates || coordinates.length !== 2) return false
    return !(coordinates[0] === 0 && coordinates[1] === 0)
  })

export const getDraftSpotSuggestions = (
  inactiveSpots: Spot[],
  query: string,
): Spot[] => {
  if (!query.trim()) {
    return inactiveSpots.slice(0, MAX_DRAFT_SUGGESTIONS)
  }

  return inactiveSpots
    .map((spot) => ({
      spot,
      score: getSpotSearchScore(query, spot.spotName),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_DRAFT_SUGGESTIONS)
    .map((entry) => entry.spot)
}
