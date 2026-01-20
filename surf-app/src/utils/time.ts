/**
 * Formatea una marca de tiempo en una cadena de hora y minutos
 */
export const formatHour = (timestamp: string, locale: string) =>
  new Date(timestamp).toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  })

/**
 * Formatea una fecha en una etiqueta corta de día y mes
 */
export const formatDayLabel = (timestamp: string, locale: string) =>
  new Date(timestamp).toLocaleDateString(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })

/**
 * Comprueba si una fecha corresponde a hoy
 */
export const isToday = (timestamp: string) => {
  const date = new Date(timestamp)
  const now = new Date()
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
}

/**
 * Comprueba si una fecha corresponde a mañana
 */
export const isTomorrow = (timestamp: string) => {
  const date = new Date(timestamp)
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(now.getDate() + 1)
  return (
    date.getFullYear() === tomorrow.getFullYear() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getDate() === tomorrow.getDate()
  )
}
