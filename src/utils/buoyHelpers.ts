export const divideDays = <T extends {date:string | Date}> (items: T[]) => {
  const days: { [day: string]: T[] } = {}
  items.forEach((item) => {
    const date = new Date(item.date).toLocaleDateString()
    if (!days[date]) {
      days[date] = []
    }
    days[date].push(item)
  })
  return days
}

export const formatHourAndMinutes = (dateString: Date): string => {
  const date = new Date(dateString)
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export const getGridColsClass = (n: number) => {
  switch (n) {
    case 1:
      return 'grid-cols-2'
    case 2:
      return 'grid-cols-3'
    case 3:
      return 'grid-cols-4'
    case 4:
      return 'grid-cols-5'
    case 5:
      return 'grid-cols-6'
    case 6:
      return 'grid-cols-7'
    default:
      return 'grid-cols-10'
  }
}
